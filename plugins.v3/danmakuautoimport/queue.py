"""队列持久化、去重整合及管理API。"""
import copy
import re
import time
import uuid
from datetime import datetime
from fastapi import Body
from app.sdk.logging import logger
from .models import Counts, EnqueueBody, PauseBody, Result, StatusView, TaskBody, TaskView


class QueueMixin:
    def _restore_state(self, saved):
        """损坏记录跳过；旧的未知运行态保留人工确认，绝不自动重发。"""
        tasks = []
        for raw in saved["tasks"]:
            if not isinstance(raw, dict):
                continue
            try:
                TaskView(**raw)
                task = copy.deepcopy(raw)
                task.setdefault("identity", [task["search_type"], task["search_term"], task["media_type"], task["season"]])
                task.setdefault("due_at", time.time())
                task.setdefault("poll_at", 0)
                task.setdefault("import_mode", "auto")
                task.setdefault("selection_method", "auto" if task["import_mode"] == "auto" else "")
                task.setdefault("selection_reason", "")
                task.setdefault("media_context", {"title": task["title"], "media_type": task["media_type"], "season": task["season"], "episodes": task["episodes"], "identity": task["identity"]})
                if task["status"] not in ("pending", "submitted", "success", "failed", "submitting", "needs_confirmation"):
                    task.update(status="needs_confirmation", error="持久化状态未知，请人工确认")
                tasks.append(task)
            except (ValueError, TypeError, KeyError):
                logger.warning("弹幕自动导入：跳过格式损坏的本地记录")
        return {"version": 1, "paused": bool(saved.get("paused", False)), "tasks": tasks, "submit_after": saved.get("submit_after", 0)}


    def _persist(self):
        # 只裁剪已完成的历史，未确认或失败任务不静默删除。
        completed = [t for t in self._state["tasks"] if t["status"] == "success"]
        keep = {t["id"] for t in completed[-self._config["max_queue_size"]:]}
        self._state["tasks"] = [t for t in self._state["tasks"] if t["status"] != "success" or t["id"] in keep]
        self.save_data(self.STATE_KEY, copy.deepcopy(self._state))


    def status(self):
        with self._lock:
            tasks = [TaskView(**task) for task in self._state["tasks"]]
            counts = Counts()
            for task in tasks:
                bucket = task.status if task.status in ("pending", "submitted", "success", "failed") else "failed"
                if task.status == "submitting":
                    bucket = "submitted"
                setattr(counts, bucket, getattr(counts, bucket) + 1)
            due = [t.get("due_at", 0) for t in self._state["tasks"] if t["status"] == "pending"]
            return StatusView(enabled=self.get_state(), import_mode=self._config["import_mode"], paused=self._state["paused"], counts=counts, tasks=tasks,
                              next_run_time=datetime.fromtimestamp(max(min(due), self._state.get("submit_after", 0))).isoformat() if due and self.get_state() and not self._state["paused"] else None)


    @staticmethod
    def _episodes(value):
        """将集数及范围展开，整合任务不丢失范围尾集。"""
        if value is None or value == "":
            return []
        if isinstance(value, int):
            value = [value]
        if isinstance(value, str):
            value = re.split(r"[,，\s]+", value.strip())
        if not isinstance(value, list):
            raise ValueError("集数格式无效")
        result = set()
        for item in value:
            if isinstance(item, dict):
                start = int(item.get("begin_episode", item.get("episode", 0)))
                end = int(item.get("end_episode", start))
            elif isinstance(item, int) or str(item).isdigit():
                start = end = int(item)
            else:
                match = re.fullmatch(r"(\d+)-(\d+)", str(item))
                if not match:
                    raise ValueError("集数格式无效")
                start, end = map(int, match.groups())
            if start < 1 or end < start or end > 10000 or end - start > 2000:
                raise ValueError("集数范围无效")
            result.update(range(start, end + 1))
        return sorted(result)


    def enqueue(self, body: EnqueueBody = Body(...)):
        """按媒体、季和集数去重；仅尚未提交的任务允许整合。"""
        try:
            episodes = self._episodes(body.episodes)
        except (ValueError, TypeError):
            return Result(success=False, message="集数格式无效")
        if episodes and (body.season is None or body.media_type == "movie"):
            return Result(success=False, message="集数必须同时指定剧集季号")
        term = body.search_term.strip()
        if not term or body.search_type not in ("tmdb", "keyword", "tvdb", "douban", "imdb", "bangumi") or body.media_type not in ("movie", "tv_series", "tv"):
            return Result(success=False, message="媒体搜索参数无效")
        media_type = "tv_series" if body.media_type == "tv" else body.media_type
        mode = body.import_mode or self._config["import_mode"]
        if mode not in ("auto", "ai"):
            return Result(success=False, message="导入模式无效")
        identity = (body.search_type, term, media_type, body.season)
        context = {"title": body.title or body.media_context.get("title", ""),
                   "original_title": body.original_title or body.media_context.get("original_title", ""),
                   "year": body.year or body.media_context.get("year"),
                   "overview": body.overview or body.media_context.get("overview", ""),
                   "aliases": body.aliases or body.media_context.get("aliases", []),
                   "media_type": media_type, "season": body.season, "episodes": episodes, "identity": list(identity)}
        context["aliases"] = [str(alias)[:300] for alias in context["aliases"] if isinstance(alias, str)][:50] if isinstance(context["aliases"], list) else []
        for key in ("title", "original_title", "overview"):
            context[key] = str(context[key] or "")[:2000 if key == "overview" else 300]
        try:
            context["year"] = int(context["year"]) if context["year"] else None
        except (TypeError, ValueError):
            context["year"] = None
        now = time.time()
        with self._lock:
            matching = [t for t in self._state["tasks"] if tuple(t["identity"]) == identity]
            covered = set()
            for task in matching:
                covered.update(task["episodes"])
                if not episodes or not task["episodes"]:
                    return Result(success=True, message="任务已存在", data={"id": task["id"]})
            remaining = sorted(set(episodes) - covered)
            if episodes and not remaining:
                return Result(success=True, message="任务已存在", data={"id": matching[0]["id"]})
            pending = next((t for t in matching if t["status"] == "pending" and not t["attempts"] and t.get("import_mode", "auto") == mode), None)
            if pending:
                pending["episodes"] = sorted(set(pending["episodes"]) | set(remaining))
                pending["media_context"]["episodes"] = pending["episodes"]
                pending["due_at"] = max(pending["due_at"], now + self._config["consolidate_seconds"])
                self._persist()
                return Result(success=True, message="已整合任务", data={"id": pending["id"]})
            active = sum(t["status"] != "success" for t in self._state["tasks"])
            if active >= self._config["max_queue_size"]:
                return Result(success=False, message="队列已满")
            task = {"id": uuid.uuid4().hex, "title": body.title or term, "search_type": body.search_type,
                    "search_term": term, "media_type": media_type, "season": body.season,
                    "episodes": remaining, "status": "pending", "progress": 0, "attempts": 0,
                    "error": "", "created_at": datetime.now().isoformat(), "remote_task_id": None,
                    "identity": list(identity), "due_at": now + self._config["delay_seconds"] + self._config["consolidate_seconds"],
                    "submitted_at": None, "poll_at": 0, "execution_task_id": None,
                     "import_mode": mode, "media_context": {**context, "episodes": remaining},
                     "selection_method": "auto" if mode == "auto" else "", "selection_reason": ""}
            self._state["tasks"].append(task)
            self._persist()
        return Result(success=True, message="已加入队列", data={"id": task["id"]})


    def pause(self, body: PauseBody = Body(...)):
        with self._lock:
            self._state["paused"] = body.paused
            self._persist()
        return Result(success=True, message="已暂停" if body.paused else "已恢复")


    def retry(self, body: TaskBody = Body(...)):
        with self._lock:
            task = next((t for t in self._state["tasks"] if t["id"] == body.id), None)
            if not task:
                return Result(success=False, message="任务不存在")
            if task["status"] != "failed" or task.get("remote_task_id") or task.get("submitted_at"):
                return Result(success=False, message="已接受或结果不明的任务不能重复提交，请人工确认远端")
            task.update(status="pending", attempts=0, error="", due_at=time.time())
            self._persist()
        return Result(success=True, message="已重新排队")


    def delete_task(self, body: TaskBody = Body(...)):
        with self._lock:
            task = next((t for t in self._state["tasks"] if t["id"] == body.id), None)
            if not task:
                return Result(success=False, message="任务不存在")
            if task["status"] in ("submitting", "submitted"):
                return Result(success=False, message="运行中的任务不能删除")
            self._state["tasks"].remove(task)
            self._persist()
        return Result(success=True, message="已删除本地记录，远端任务未更改")

