"""有界调度、提交与实际执行追踪。"""
import time
from datetime import datetime
from urllib.parse import quote
from apscheduler.triggers.cron import CronTrigger
from app.sdk.config import settings
from app.sdk.logging import logger
from app.schemas.types import MessageType
from .models import Result


class ExecutionMixin:
    def _cancel_preparation(self, task):
        # 确定尚未POST，停止准备阶段可安全恢复待处理。
        with self._lock:
            task.update(status="pending", attempts=max(0, task["attempts"] - 1))
            self._persist()

    def process(self):
        done = self._cycle(manual=True)
        return Result(success=done, message="处理周期已执行" if done else "已暂停、未启用或正在处理")


    def _cron_due(self, now):
        if not self._config["cron"]:
            return True
        try:
            trigger = CronTrigger.from_crontab(self._config["cron"], timezone=settings.TZ)
            current = datetime.fromtimestamp(now, trigger.timezone)
            previous = datetime.fromtimestamp(self._next_submit_at or now, trigger.timezone)
            next_fire = trigger.get_next_fire_time(None, previous)
            if next_fire and current >= next_fire:
                self._next_submit_at = now + 1
                return True
        except (ValueError, TypeError):
            return False
        if not self._next_submit_at:
            self._next_submit_at = now
        return False


    def _cycle(self, manual=False):
        """每个周期只做有界轮询和串行提交，不睡眠，不持队列锁访问网络。"""
        if self._stop.is_set() or not self.get_state() or not self._process_lock.acquire(blocking=False):
            return False
        try:
            if not self._config["danmu_server_url"] or not self._config["external_api_key"]:
                return False
            with self._lock:
                paused = self._state["paused"]
                submitted = [t for t in self._state["tasks"] if t["status"] == "submitted" and t.get("poll_at", 0) <= time.time()]
            for task in submitted:
                if self._stop.is_set():
                    return False
                self._poll(task)
            if paused:
                return False
            if not manual and not self._cron_due(time.time()):
                return True
            for _ in range(self._config["process_batch_size"]):
                with self._lock:
                    if self._stop.is_set() or self._state["paused"]:
                        break
                    if time.time() < self._state.get("submit_after", 0):
                        break
                    task = next((t for t in self._state["tasks"] if t["status"] == "pending" and t["due_at"] <= time.time()), None)
                    if task is None:
                        break
                    task.update(status="submitting", attempts=task["attempts"] + 1)
                    self._state["submit_after"] = time.time() + self._config["delay_seconds"]
                    # 请求前先落盘，进程被中断时不能把结果不明的提交当成未提交。
                    self._persist()
                self._submit(task)
            return True
        finally:
            self._process_lock.release()


    def _submit(self, task):
        params = {"searchType": task["search_type"], "searchTerm": task["search_term"], "mediaType": task["media_type"]}
        if task["season"] is not None:
            params["season"] = task["season"]
        if task["episodes"]:
            params["episode"] = ",".join(map(str, task["episodes"]))
        if self._stop.is_set():
            self._cancel_preparation(task)
            return
        if task.get("import_mode", "auto") == "ai":
            prepared = self._prepare_ai_import(task)
            if prepared is None:
                return
            if self._stop.is_set():
                self._cancel_preparation(task)
                return
            edited, body = prepared
            code, data = self._api_import_selected(edited, body)
        else:
            code, data = self._api_auto_import(params)
        data = data if isinstance(data, dict) else {}
        with self._lock:
            nested = data.get("data") if isinstance(data.get("data"), dict) else {}
            remote_id = data.get("taskId") or data.get("task_id") or nested.get("taskId")
            if code in (200, 201, 202):
                task.update(status="submitted" if remote_id else "needs_confirmation", remote_task_id=str(remote_id) if remote_id else None,
                            submitted_at=time.time(), progress=0, error="" if remote_id else "远端已接受但未返回任务编号，请人工确认")
            elif code is None or code >= 500 or code in (301, 302, 307, 308, 408):
                task.update(status="needs_confirmation", error="提交结果不明，请人工确认远端是否已接受")
            else:
                # 只有明确拒绝的请求才可重试，已接受任务永不重新提交。
                retryable = code in (425, 429)
                retry = retryable and self._config["auto_retry"] and task["attempts"] <= self._config["retry_count"]
                task.update(status="pending" if retry else "failed", error=f"远端拒绝请求（HTTP {code}）",
                            due_at=time.time() + min(3600, 30 * 2 ** min(task["attempts"] - 1, 7)))
            self._persist()
        self._notify_terminal(task)


    def _poll(self, task):
        remote = quote(str(task["remote_task_id"]), safe="")
        direct = task.get("remote_task_kind") == "execution"
        code, data = self._api_task(task["remote_task_id"], mapping=not direct)
        data = data if isinstance(data, dict) else {}
        payload = data.get("data", data)
        if not isinstance(payload, dict):
            payload = {}
        execution = payload.get("execution") or payload.get("executionTask") or payload
        if not isinstance(execution, dict):
            execution = {}
        execution_id = task["remote_task_id"] if direct else payload.get("executionTaskId") or task.get("execution_task_id")
        # 调度任务完成并不等于导入完成，必须获取实际执行任务的终态。
        if code == 200 and execution_id and not direct:
            code, execution_data = self._api_task(execution_id)
            execution_data = execution_data if isinstance(execution_data, dict) else {}
            execution = execution_data.get("data", execution_data)
            if not isinstance(execution, dict):
                execution = {}
        state = str(execution.get("status", "")).lower() if execution_id else ""
        mapping_state = str(payload.get("status", "")).lower()
        if not execution_id and mapping_state in ("failed", "error", "cancelled", "canceled", "失败", "已取消"):
            state = mapping_state
        with self._lock:
            task["poll_at"] = time.time() + self._config["poll_seconds"]
            task["execution_task_id"] = payload.get("executionTaskId") or task.get("execution_task_id")
            if code == 200 and state in ("completed", "success", "succeeded", "finished", "已完成"):
                task.update(status="success", progress=100, error="")
            elif code == 200 and state in ("failed", "error", "cancelled", "canceled", "失败", "已取消"):
                task.update(status="failed", error="远端任务失败或已取消，不自动重复提交")
            elif time.time() - (task.get("submitted_at") or time.time()) >= self.EXECUTION_TIMEOUT:
                task.update(status="needs_confirmation", error="远端执行结果超时未知，请人工确认；未重复提交")
            else:
                try:
                    task["progress"] = max(0, min(99, float(execution.get("progress", task["progress"]))))
                except (ValueError, TypeError):
                    pass
            self._persist()
        self._notify_terminal(task)


    def _notify_terminal(self, task):
        """每个终态仅发送一次通知，不回显远端响应或凭据。"""
        if not self._config["notify"]:
            return
        with self._lock:
            if task["status"] not in ("success", "failed") or task.get("notified"):
                return
            task["notified"] = True
            self._persist()
        try:
            self.post_message(mtype=MessageType.SiteMessage,
                              title="弹幕导入成功" if task["status"] == "success" else "弹幕导入失败",
                              text="弹幕导入任务已完成，请查看插件任务记录")
        except Exception:
            logger.warning("弹幕自动导入：发送任务通知失败")

