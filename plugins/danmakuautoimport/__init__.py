import time
import uuid
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Optional, Tuple

import pytz
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import settings
from app.core.event import Event, eventmanager
from app.log import logger
from app.plugins import _PluginBase
from app.schemas import MediaType, NotificationType
from app.schemas.types import EventType
from app.utils.http import RequestUtils


class DanmakuAutoImport(_PluginBase):
    # 插件名称
    plugin_name = "弹幕库自动导入"
    # 插件描述
    plugin_desc = "媒体下载完成后自动推送至弹幕库下载弹幕,支持任务队列和定时处理"
    # 插件图标
    plugin_icon = "https://raw.githubusercontent.com/l429609201/MoviePilot-Plugins/refs/heads/main/icons/danmaku.png"
    # 插件版本
    plugin_version = "1.0.0"
    # 插件作者
    plugin_author = "Misaka10876"
    # 作者主页
    author_url = "https://github.com/l429609201"
    # 插件配置项ID前缀
    plugin_config_prefix = "danmakuautoimport_"
    # 加载顺序
    plugin_order = 20
    # 可使用的用户级别
    auth_level = 1

    # 私有属性
    _enabled = False
    _notify = False
    _danmu_server_url = ""
    _external_api_key = ""
    _cron = "*/5 * * * *"
    _delay_seconds = 0
    _max_queue_size = 100
    _process_batch_size = 1
    _only_anime = False
    _search_type = "tmdb"
    _task_progress = {}  # 任务进度字典 {task_id: progress}
    _auto_retry = True
    _retry_count = 3

    # 任务队列
    _buffer_tasks: List[Dict[str, Any]] = []  # 缓冲区
    _pending_tasks: List[Dict[str, Any]] = []
    _processing_tasks: Dict[str, Dict[str, Any]] = {}
    _lock = Lock()
    _consolidate_interval = 30  # 整合间隔(秒)
    _consolidate_countdown = 30  # 整合倒计时(秒)

    def init_plugin(self, config: dict = None):
        """初始化插件"""
        if config:
            self._enabled = config.get("enable", False)  # ✅ 修复字段名: enabled -> enable
            self._notify = config.get("notify", False)
            self._danmu_server_url = config.get("danmu_server_url", "").rstrip("/")
            self._external_api_key = config.get("external_api_key", "")
            self._cron = config.get("cron", "*/5 * * * *")
            # 支持delay_hours(小时)和delay_seconds(秒),优先使用delay_hours
            delay_hours = config.get("delay_hours")
            if delay_hours is not None:
                self._delay_seconds = int(delay_hours) * 3600
            else:
                self._delay_seconds = int(config.get("delay_seconds", 0))
            self._max_queue_size = int(config.get("max_queue_size", 100))
            self._process_batch_size = int(config.get("process_batch_size", 1))
            self._only_anime = config.get("only_anime", False)
            self._search_type = config.get("search_type", "tmdb")
            self._auto_retry = config.get("auto_retry", True)
            self._retry_count = int(config.get("retry_count", 3))

        # 初始化队列
        self._buffer_tasks = []
        self._pending_tasks = []
        self._processing_tasks = {}
        self._last_consolidate_time = datetime.now(tz=pytz.timezone(settings.TZ))

    def get_state(self) -> bool:
        """获取插件状态"""
        return self._enabled and bool(self._danmu_server_url) and bool(self._external_api_key)

    @staticmethod
    def get_command() -> List[Dict[str, Any]]:
        """定义远程控制命令"""
        return [
            {
                "cmd": "/danmaku_queue",
                "event": EventType.PluginAction,
                "desc": "查看弹幕导入队列",
                "category": "弹幕",
                "data": {"action": "view_queue"}
            },
            {
                "cmd": "/danmaku_clear",
                "event": EventType.PluginAction,
                "desc": "清空弹幕导入队列",
                "category": "弹幕",
                "data": {"action": "clear_queue"}
            }
        ]

    def get_service(self) -> List[Dict[str, Any]]:
        """注册定时服务"""
        if not self._enabled:
            return []

        services = []

        # 队列处理定时任务
        if self._cron:
            services.append({
                "id": "DanmakuAutoImport",
                "name": "弹幕自动导入定时任务",
                "trigger": CronTrigger.from_crontab(self._cron),
                "func": self._process_queue,
                "kwargs": {}
            })

        # 整合定时任务 - 每1秒执行一次倒计时
        services.append({
            "id": "DanmakuAutoImportConsolidate",
            "name": "弹幕自动导入整合任务",
            "trigger": IntervalTrigger(seconds=1),
            "func": self._consolidate_tick,
            "kwargs": {}
        })

        # 清理成功任务定时任务 - 每天0点和12点执行
        services.append({
            "id": "DanmakuAutoImportCleanup",
            "name": "弹幕自动导入清理成功任务",
            "trigger": CronTrigger.from_crontab("0 0,12 * * *"),
            "func": self._cleanup_success_tasks,
            "kwargs": {}
        })

        return services

    @eventmanager.register(EventType.TransferComplete)
    def on_transfer_complete(self, event: Event):
        """监听媒体转移完成事件"""
        logger.info(f"弹幕自动导入: ========== on_transfer_complete被调用 ==========")
        logger.info(f"弹幕自动导入: _enabled={self._enabled}, _danmu_server_url={'已配置' if self._danmu_server_url else '未配置'}, "
                   f"_external_api_key={'已配置' if self._external_api_key else '未配置'}")

        if not self._enabled:
            logger.warning(f"弹幕自动导入: 插件未启用,跳过处理")
            return

        # 调试: 打印事件对象信息
        logger.debug(f"弹幕自动导入: 收到TransferComplete事件, event类型={type(event)}")

        event_data = event.event_data or {}
        logger.debug(f"弹幕自动导入: event_data键列表={list(event_data.keys())}")

        mediainfo = event_data.get("mediainfo")
        meta = event_data.get("meta")

        if not mediainfo:
            logger.warning(f"弹幕自动导入: 未获取到媒体信息, event_data内容={event_data}")
            return

        logger.info(f"弹幕自动导入: 收到转移完成事件 - {mediainfo.title}, 类型={mediainfo.type}")

        # 如果只处理动漫且当前不是动漫，则跳过
        if self._only_anime and mediainfo.type != MediaType.TV:
            logger.debug(f"弹幕自动导入: 跳过非动漫媒体 {mediainfo.title}")
            return

        # 添加到缓冲区
        self._add_to_buffer(mediainfo, meta)

    @eventmanager.register(EventType.PluginAction)
    def on_plugin_action(self, event: Event):
        """处理插件动作事件"""
        if not event:
            return

        event_data = event.event_data or {}
        if not event_data:
            return

        action = event_data.get("action")
        if action == "view_queue":
            self._view_queue(event_data)
        elif action == "clear_queue":
            self._clear_queue(event_data)

    def _add_to_buffer(self, mediainfo, meta):
        """添加任务到缓冲区"""
        with self._lock:
            # 创建缓冲任务
            task = {
                "id": str(uuid.uuid4()),
                "mediainfo": mediainfo,
                "meta": meta,
                "add_time": datetime.now(tz=pytz.timezone(settings.TZ))
            }

            self._buffer_tasks.append(task)
            logger.info(f"弹幕自动导入: 已添加到缓冲区 - {mediainfo.title} (缓冲区长度: {len(self._buffer_tasks)})")

    def _consolidate_tick(self):
        """整合定时器tick - 每秒执行一次"""
        should_consolidate = False

        with self._lock:
            # 倒计时递减
            if self._consolidate_countdown > 0:
                self._consolidate_countdown -= 1

            # 倒计时结束,标记需要整合
            if self._consolidate_countdown == 0:
                self._consolidate_countdown = self._consolidate_interval
                should_consolidate = True

        # 在锁外调用整合(避免死锁)
        if should_consolidate:
            self._consolidate_buffer(force=False)

    def _consolidate_buffer(self, force: bool = False):
        """整合缓冲区任务

        Args:
            force: 是否强制整合(忽略时间间隔)
        """
        with self._lock:
            # 如果缓冲区为空,直接返回
            if not self._buffer_tasks:
                # 如果是强制整合,仍然重置倒计时
                if force:
                    self._consolidate_countdown = self._consolidate_interval
                return

            # 如果是强制整合,重置倒计时
            if force:
                self._consolidate_countdown = self._consolidate_interval

            logger.info(f"弹幕自动导入: 开始整合缓冲区任务 (缓冲区长度: {len(self._buffer_tasks)}, 强制: {force})")

            # 按tmdb_id和media_type分组
            groups = {}
            for task in self._buffer_tasks:
                mediainfo = task["mediainfo"]
                meta = task["meta"]

                # 电影直接添加,不整合
                if mediainfo.type == MediaType.MOVIE:
                    self._add_to_queue_direct(task)
                    continue

                # 电视剧按tmdb_id分组
                key = f"{mediainfo.tmdb_id}_{mediainfo.type.value}"
                if key not in groups:
                    groups[key] = {
                        "mediainfo": mediainfo,
                        "episodes": []
                    }

                # 添加集数信息
                episode_info = {}
                if meta:
                    if hasattr(meta, "begin_season") and meta.begin_season:
                        episode_info["season"] = meta.begin_season
                    if hasattr(meta, "begin_episode") and meta.begin_episode:
                        episode_info["episode"] = meta.begin_episode

                if episode_info:
                    groups[key]["episodes"].append(episode_info)

            # 创建整合任务
            for key, group in groups.items():
                task = {
                    "id": str(uuid.uuid4()),
                    "mediainfo": group["mediainfo"],
                    "meta": None,
                    "episodes": group["episodes"],  # 集数列表
                    "add_time": datetime.now(tz=pytz.timezone(settings.TZ)),
                    "retry_count": 0,
                    "status": "pending",
                    "error_msg": None,
                    "danmu_task_id": None,
                    "is_consolidated": True  # 标记为整合任务
                }

                # 检查队列大小
                if len(self._pending_tasks) >= self._max_queue_size:
                    logger.warning(f"弹幕自动导入: 队列已满({self._max_queue_size}),停止整合")
                    break

                self._pending_tasks.append(task)
                logger.info(f"弹幕自动导入: 已整合任务 - {group['mediainfo'].title} ({len(group['episodes'])}集)")

            # 清空缓冲区
            self._buffer_tasks.clear()
            logger.info(f"弹幕自动导入: 缓冲区整合完成 (待处理队列长度: {len(self._pending_tasks)})")

    def _add_to_queue_direct(self, buffer_task):
        """直接添加任务到队列(不整合)"""
        mediainfo = buffer_task["mediainfo"]
        meta = buffer_task["meta"]

        # 检查队列大小
        if len(self._pending_tasks) >= self._max_queue_size:
            logger.warning(f"弹幕自动导入: 队列已满({self._max_queue_size}),跳过添加")
            return

        # 创建任务
        task = {
            "id": str(uuid.uuid4()),
            "mediainfo": mediainfo,
            "meta": meta,
            "episodes": None,  # 电影无集数
            "add_time": datetime.now(tz=pytz.timezone(settings.TZ)),
            "retry_count": 0,
            "status": "pending",
            "error_msg": None,
            "danmu_task_id": None,
            "is_consolidated": False
        }

        self._pending_tasks.append(task)
        logger.info(f"弹幕自动导入: 已添加任务到队列 - {mediainfo.title}")

    def _process_queue(self):
        """处理队列中的任务"""
        if not self._enabled:
            return

        # 先整合缓冲区
        self._consolidate_buffer()

        logger.info("弹幕自动导入: 开始处理队列任务")

        with self._lock:
            # 获取待处理任务
            tasks_to_process = self._pending_tasks[:self._process_batch_size]
            if not tasks_to_process:
                logger.debug("弹幕自动导入: 队列为空,无需处理")
                return

            # 从待处理队列移除
            for task in tasks_to_process:
                self._pending_tasks.remove(task)
                self._processing_tasks[task["id"]] = task

        # 处理每个任务
        for task in tasks_to_process:
            # 检查延时
            if self._delay_seconds > 0:
                add_time = task["add_time"]
                now = datetime.now(tz=pytz.timezone(settings.TZ))
                elapsed = (now - add_time).total_seconds()
                if elapsed < self._delay_seconds:
                    logger.debug(f"弹幕自动导入: 任务 {task['id']} 延时未到,跳过处理")
                    with self._lock:
                        self._pending_tasks.append(task)
                        del self._processing_tasks[task["id"]]
                    continue

            # 导入弹幕
            self._import_danmaku(task)

    def _import_danmaku(self, task: dict):
        """导入弹幕"""
        task_id = task["id"]
        mediainfo = task["mediainfo"]
        meta = task["meta"]

        try:
            logger.info(f"弹幕自动导入: 开始导入 {mediainfo.title}")

            # 初始化进度
            self._task_progress[task_id] = 0

            # 构建API请求
            api_url = f"{self._danmu_server_url}/api/control/import/auto"

            # 更新进度: 准备请求
            self._task_progress[task_id] = 20

            # 构建请求参数(外部API使用Query参数,不是JSON body)
            params = {
                "api_key": self._external_api_key,
                "searchType": self._search_type,
                "searchTerm": str(mediainfo.tmdb_id) if self._search_type == "tmdb" else mediainfo.title,
                "mediaType": "tv_series" if mediainfo.type == MediaType.TV else "movie"
            }

            # 如果是剧集,添加季集信息
            if mediainfo.type == MediaType.TV and meta:
                if hasattr(meta, "begin_season") and meta.begin_season:
                    params["season"] = meta.begin_season
                if hasattr(meta, "begin_episode") and meta.begin_episode:
                    params["episode"] = meta.begin_episode

            # 更新进度: 发送请求
            self._task_progress[task_id] = 40

            # 发送POST请求(参数在URL中)
            response = RequestUtils(timeout=30).post_res(url=api_url, params=params)
            if not response or response.status_code != 202:
                raise Exception(f"API请求失败: {response.status_code if response else 'No response'}")

            # 更新进度: 处理响应
            self._task_progress[task_id] = 70

            result = response.json()
            danmu_task_id = result.get("taskId")

            # 更新任务状态
            task["status"] = "success"
            task["danmu_task_id"] = danmu_task_id

            # 更新进度: 完成
            self._task_progress[task_id] = 100

            logger.info(f"弹幕自动导入: 导入成功 {mediainfo.title} - 任务ID: {danmu_task_id}")

            # 发送通知
            if self._notify:
                self.post_message(
                    mtype=NotificationType.SiteMessage,
                    title="弹幕导入成功",
                    text=f"已成功导入 {mediainfo.title} 的弹幕\n任务ID: {danmu_task_id}"
                )

        except Exception as e:
            logger.error(f"弹幕自动导入: 导入失败 {mediainfo.title} - {str(e)}")
            task["error_msg"] = str(e)
            task["retry_count"] += 1

            # 标记进度为失败
            self._task_progress[task_id] = -1

            # 检查是否需要重试
            if self._auto_retry and task["retry_count"] < self._retry_count:
                logger.info(f"弹幕自动导入: 任务 {task_id} 将重试 (第{task['retry_count']}次)")
                with self._lock:
                    self._pending_tasks.append(task)
            else:
                task["status"] = "failed"
                logger.error(f"弹幕自动导入: 任务 {task_id} 失败,已达最大重试次数")

        finally:
            # 从处理队列移除
            with self._lock:
                if task_id in self._processing_tasks:
                    del self._processing_tasks[task_id]
                # 清理进度数据(延迟5秒,让前端有时间显示完成状态)
                if task_id in self._task_progress:
                    time.sleep(5)
                    del self._task_progress[task_id]

    def _view_queue(self, event_data: dict):
        """查看队列"""
        with self._lock:
            pending_count = len(self._pending_tasks)
            processing_count = len(self._processing_tasks)

        message = f"📊 弹幕导入队列状态\n\n"
        message += f"⏳ 待处理: {pending_count} 个任务\n"
        message += f"🔄 处理中: {processing_count} 个任务\n"
        message += f"📦 队列容量: {self._max_queue_size}\n"

        self.post_message(
            mtype=NotificationType.SiteMessage,
            title="弹幕导入队列",
            text=message
        )

    def _clear_queue(self, event_data: dict):
        """清空队列"""
        with self._lock:
            cleared_count = len(self._pending_tasks)
            self._pending_tasks = []

        message = f"🗑️ 已清空弹幕导入队列\n\n清除了 {cleared_count} 个待处理任务"

        self.post_message(
            mtype=NotificationType.SiteMessage,
            title="清空队列",
            text=message
        )

        logger.info(f"弹幕自动导入: 已清空队列,清除了 {cleared_count} 个任务")

    def _cleanup_success_tasks(self):
        """清理状态为成功的任务"""
        with self._lock:
            # 过滤出非成功状态的任务
            before_count = len(self._pending_tasks)
            self._pending_tasks = [task for task in self._pending_tasks if task.get('status') != 'success']
            after_count = len(self._pending_tasks)
            cleaned_count = before_count - after_count

        if cleaned_count > 0:
            logger.info(f"弹幕自动导入: 定时清理成功任务,共清理 {cleaned_count} 个任务")

    # ========== V2 API 接口 ==========

    def _trigger_manual_process(self) -> Dict[str, Any]:
        """API: 手动触发处理"""
        logger.info("弹幕自动导入: 收到手动处理请求")
        if not self._enabled:
            return {"message": "插件已禁用,无法执行处理", "error": True}

        try:
            self._process_queue()
            return {"message": "处理任务已完成"}
        except Exception as e:
            logger.error(f"弹幕自动导入: 手动处理失败 - {e}")
            return {"message": f"手动处理失败: {e}", "error": True}

    def _trigger_manual_consolidate(self) -> Dict[str, Any]:
        """API: 手动触发整合"""
        logger.info("弹幕自动导入: 收到手动整合请求")
        if not self._enabled:
            return {"success": False, "message": "插件已禁用,无法执行整合"}

        try:
            with self._lock:
                buffer_count = len(self._buffer_tasks)
                if buffer_count == 0:
                    return {"success": False, "message": "缓冲区为空,无需整合"}

            # 强制整合(忽略时间间隔)
            self._consolidate_buffer(force=True)

            with self._lock:
                pending_count = len(self._pending_tasks)

            logger.info(f"弹幕自动导入: 手动整合完成,待处理队列长度: {pending_count}")
            return {"success": True, "message": f"整合完成,已添加 {pending_count} 个任务到队列"}
        except Exception as e:
            logger.error(f"弹幕自动导入: 手动整合失败 - {e}")
            return {"success": False, "message": f"手动整合失败: {e}"}

    def _trigger_import_task(self, payload: dict = None) -> Dict[str, Any]:
        """API: 手动触发单条任务导入"""
        if payload is None:
            logger.error("弹幕自动导入: 导入任务请求数据为空")
            return {"success": False, "message": "请求数据为空"}

        task_id = payload.get('task_id')
        if not task_id:
            return {"success": False, "message": "缺少task_id参数"}

        logger.info(f"弹幕自动导入: 收到手动导入请求 - task_id={task_id}")

        if not self._enabled:
            return {"success": False, "message": "插件已禁用,无法执行导入"}

        try:
            # 查找任务
            task = None
            with self._lock:
                for t in self._pending_tasks:
                    if t.get('id') == task_id:  # 使用'id'而不是'task_id'
                        task = t
                        break

                if not task:
                    return {"success": False, "message": "任务不存在"}

                # 检查任务状态
                if task.get('status') == 'processing':
                    return {"success": False, "message": "任务正在处理中"}

                # 标记为处理中
                task['status'] = 'processing'
                self._processing_tasks[task_id] = task

            # 在后台线程中执行导入
            import threading
            thread = threading.Thread(target=self._import_danmaku, args=(task,))
            thread.daemon = True
            thread.start()

            logger.info(f"弹幕自动导入: 已启动导入任务 - {task_id}")
            return {"success": True, "message": "导入任务已启动"}
        except Exception as e:
            logger.error(f"弹幕自动导入: 手动导入失败 - {e}")
            return {"success": False, "message": f"手动导入失败: {e}"}

    def _get_status(self) -> Dict[str, Any]:
        """API: 获取状态"""
        with self._lock:
            pending_tasks = [
                {
                    "id": task["id"],
                    "title": task["mediainfo"].title if task.get("mediainfo") else "未知",
                    "add_time": task["add_time"].strftime("%Y-%m-%d %H:%M:%S"),
                    "retry_count": task["retry_count"],
                    "status": task["status"]
                }
                for task in self._pending_tasks
            ]

            processing_tasks = [
                {
                    "id": task["id"],
                    "title": task["mediainfo"].title if task.get("mediainfo") else "未知",
                    "add_time": task["add_time"].strftime("%Y-%m-%d %H:%M:%S"),
                    "retry_count": task["retry_count"],
                    "status": task["status"]
                }
                for task in self._processing_tasks.values()
            ]

        return {
            "enabled": self._enabled,
            "cron": self._cron,
            "pending_count": len(pending_tasks),
            "processing_count": len(processing_tasks),
            "pending_tasks": pending_tasks,
            "processing_tasks": processing_tasks,
            "max_queue_size": self._max_queue_size
        }

    def _clear_queue_api(self) -> Dict[str, Any]:
        """API: 清空队列"""
        with self._lock:
            cleared_count = len(self._pending_tasks)
            self._pending_tasks = []

        logger.info(f"弹幕自动导入: 已清空队列,清除了 {cleared_count} 个任务")
        return {"message": f"已清空队列,清除了 {cleared_count} 个任务", "cleared_count": cleared_count}

    @staticmethod
    def get_render_mode() -> Tuple[str, Optional[str]]:
        """声明Vue渲染模式和静态资源路径"""
        return "vue", "dist/assets"

    def _get_config(self) -> Dict[str, Any]:
        """API端点: 返回当前插件配置"""
        return {
            "enable": self._enabled,
            "notify": self._notify,
            "danmu_server_url": self._danmu_server_url,
            "external_api_key": self._external_api_key,
            "cron": self._cron,
            "delay_hours": self._delay_seconds // 3600,  # 转换为小时
            "max_queue_size": self._max_queue_size,
            "process_batch_size": self._process_batch_size,
            "only_anime": self._only_anime,
            "search_type": self._search_type,
            "auto_retry": self._auto_retry,
            "retry_count": self._retry_count
        }

    def _save_config(self, config_payload: dict = None) -> Dict[str, Any]:
        """API端点: 保存插件配置"""
        logger.info(f"弹幕自动导入: 收到配置保存请求: {config_payload}")

        # 防御性检查
        if config_payload is None:
            logger.error("弹幕自动导入: 配置数据为空")
            return {"success": False, "message": "配置数据为空", "saved_config": self._get_config()}

        try:
            # 更新实例变量
            self._enabled = config_payload.get('enable', self._enabled)
            self._notify = config_payload.get('notify', self._notify)
            self._danmu_server_url = config_payload.get('danmu_server_url', self._danmu_server_url)
            self._external_api_key = config_payload.get('external_api_key', self._external_api_key)
            self._cron = config_payload.get('cron', self._cron)
            # 支持delay_hours(小时)和delay_seconds(秒),优先使用delay_hours
            delay_hours = config_payload.get('delay_hours')
            if delay_hours is not None:
                self._delay_seconds = int(delay_hours) * 3600
            else:
                self._delay_seconds = int(config_payload.get('delay_seconds', self._delay_seconds))
            self._max_queue_size = int(config_payload.get('max_queue_size', self._max_queue_size))
            self._process_batch_size = int(config_payload.get('process_batch_size', self._process_batch_size))
            self._only_anime = config_payload.get('only_anime', self._only_anime)
            self._search_type = config_payload.get('search_type', self._search_type)
            self._auto_retry = config_payload.get('auto_retry', self._auto_retry)
            self._retry_count = int(config_payload.get('retry_count', self._retry_count))

            # 准备保存的配置
            config_to_save = {
                "enable": self._enabled,
                "notify": self._notify,
                "danmu_server_url": self._danmu_server_url,
                "external_api_key": self._external_api_key,
                "cron": self._cron,
                "delay_hours": self._delay_seconds // 3600,  # 转换为小时保存
                "max_queue_size": self._max_queue_size,
                "process_batch_size": self._process_batch_size,
                "only_anime": self._only_anime,
                "search_type": self._search_type,
                "auto_retry": self._auto_retry,
                "retry_count": self._retry_count
            }

            # 保存配置
            self.update_config(config_to_save)

            # 重新初始化插件 - 从数据库读取配置(参考官方插件logsclean)
            self.stop_service()
            self.init_plugin(self.get_config())

            # 手动更新事件处理器状态 - 根据enable开关控制
            try:
                from app.core.event import eventmanager
                if self.get_state():
                    eventmanager.enable_event_handler(type(self))
                    logger.info(f"弹幕自动导入: 事件处理器已启用")
                else:
                    eventmanager.disable_event_handler(type(self))
                    logger.info(f"弹幕自动导入: 事件处理器已禁用")
            except Exception as e:
                logger.error(f"弹幕自动导入: 更新事件处理器状态失败: {e}")

            logger.info(f"弹幕自动导入: 配置已保存并重新初始化")

            return {"success": True, "message": "配置已成功保存", "saved_config": self._get_config()}

        except Exception as e:
            logger.error(f"弹幕自动导入: 保存配置失败: {e}", exc_info=True)
            return {"success": False, "message": f"保存配置失败: {e}", "saved_config": self._get_config()}

    def _get_queue_stats(self) -> Dict[str, Any]:
        """API端点: 获取队列统计信息"""
        with self._lock:
            # 获取下次运行时间
            next_run_time = 'N/A'
            if hasattr(self, '_scheduler') and self._scheduler:
                jobs = self._scheduler.get_jobs()
                if jobs:
                    next_run = jobs[0].next_run_time
                    if next_run:
                        next_run_time = next_run.strftime('%Y-%m-%d %H:%M:%S')

            # 获取最近处理历史(最多5条)
            last_run_results = []
            # 这里可以从self._processing_tasks或历史记录中获取
            # 暂时返回空列表,后续可以添加历史记录功能

            return {
                "enabled": self._enabled,
                "pending": len(self._pending_tasks),
                "processing": len(self._processing_tasks),
                "max_queue_size": self._max_queue_size,
                "cron": self._cron,
                "next_run_time": next_run_time,
                "last_run_results": last_run_results
            }

    def _get_pending_tasks(self):
        """API端点: 获取待处理任务列表和缓冲区状态"""
        try:
            # 确保_pending_tasks已初始化
            if not hasattr(self, '_pending_tasks'):
                logger.warning(f"弹幕自动导入: _pending_tasks未初始化,返回空数据")
                return {
                    "buffer_count": 0,
                    "consolidate_countdown": 0,
                    "tasks": []
                }

            with self._lock:
                # 返回当前倒计时值
                consolidate_countdown = max(0, self._consolidate_countdown)

                result = []

                for task in self._pending_tasks[:50]:  # 最多返回50个
                    try:
                        mediainfo = task.get('mediainfo')
                        if not mediainfo:
                            logger.debug(f"弹幕自动导入: 跳过无mediainfo的任务")
                            continue

                        # 安全获取add_time
                        add_time_str = '未知'
                        add_time = task.get('add_time')
                        if add_time and hasattr(add_time, 'strftime'):
                            try:
                                add_time_str = add_time.strftime('%Y-%m-%d %H:%M:%S')
                            except Exception:
                                add_time_str = str(add_time)

                        # 安全获取media_type
                        media_type_str = '未知'
                        try:
                            if hasattr(mediainfo, 'type'):
                                if hasattr(mediainfo.type, 'value'):
                                    media_type_str = str(mediainfo.type.value)
                                else:
                                    media_type_str = str(mediainfo.type)
                        except Exception as type_err:
                            logger.warning(f"弹幕自动导入: 获取media_type失败: {type_err}")

                        # 获取任务进度
                        task_id = task.get('id')
                        progress = self._task_progress.get(task_id, 0)

                        # 构建任务数据
                        task_data = {
                            "task_id": task_id,  # 使用id而非task_id
                            "title": mediainfo.title or '未知标题',
                            "media_type": media_type_str,
                            "status": task.get('status', 'pending'),
                            "add_time": add_time_str,
                            "retry_count": task.get('retry_count', 0),
                            "tmdb_id": mediainfo.tmdb_id or '无',
                            "is_consolidated": task.get('is_consolidated', False),
                            "progress": progress  # 添加进度字段
                        }

                        # 如果是整合任务,添加集数列表
                        if task.get('is_consolidated') and task.get('episodes'):
                            episodes = task.get('episodes', [])
                            task_data["episode_count"] = len(episodes)
                            task_data["episodes"] = episodes
                            # 构建集数摘要
                            episode_summary = f"{len(episodes)}集"
                            task_data["episode_info"] = episode_summary
                        else:
                            # 单集或电影
                            episode_info = ''
                            if hasattr(mediainfo, 'season') and mediainfo.season:
                                episode_info = f"S{mediainfo.season:02d}"
                                if hasattr(mediainfo, 'episode') and mediainfo.episode:
                                    episode_info += f"E{mediainfo.episode:02d}"
                            elif hasattr(mediainfo, 'episode') and mediainfo.episode:
                                episode_info = f"E{mediainfo.episode:02d}"
                            else:
                                episode_info = '-'
                            task_data["episode_info"] = episode_info
                            task_data["episode_count"] = 0
                            task_data["episodes"] = None

                        result.append(task_data)
                    except Exception as e:
                        logger.error(f"弹幕自动导入: 处理任务数据时出错: {e}", exc_info=True)
                        continue

                return {
                    "buffer_count": len(self._buffer_tasks),
                    "consolidate_countdown": consolidate_countdown,
                    "tasks": result
                }
        except Exception as e:
            logger.error(f"弹幕自动导入: 获取待处理任务列表失败: {e}", exc_info=True)
            return {
                "buffer_count": 0,
                "consolidate_countdown": 0,
                "tasks": []
            }

    def _delete_task(self, payload: dict = None) -> Dict[str, Any]:
        """API端点: 删除指定任务"""
        if payload is None:
            logger.error("弹幕自动导入: 删除任务请求数据为空")
            return {"success": False, "message": "请求数据为空"}

        task_id = payload.get('task_id')
        if not task_id:
            return {"success": False, "message": "未指定任务ID"}

        with self._lock:
            # 从待处理队列中查找并删除
            for i, task in enumerate(self._pending_tasks):
                if task.get('id') == task_id:  # 使用'id'而不是'task_id'
                    # 检查任务状态
                    if task.get('status') == 'processing':
                        return {"success": False, "message": "任务正在处理中,无法删除"}

                    # 删除任务
                    deleted_task = self._pending_tasks.pop(i)

                    # 同时从processing_tasks中删除(如果存在)
                    if task_id in self._processing_tasks:
                        del self._processing_tasks[task_id]

                    # 从进度字典中删除
                    if task_id in self._task_progress:
                        del self._task_progress[task_id]

                    # 获取任务标题
                    mediainfo = deleted_task.get('mediainfo')
                    title = mediainfo.title if mediainfo else '未知'
                    logger.info(f"手动删除任务: {title} (ID: {task_id})")
                    return {"success": True, "message": "任务已删除"}

            return {"success": False, "message": "未找到指定任务"}

    def _get_rate_limit_status(self) -> Dict[str, Any]:
        """API端点: 获取流控状态"""
        if not self._danmu_server_url or not self._external_api_key:
            return {"error": True, "message": "未配置弹幕库服务器地址或API密钥"}

        try:
            import requests
            # 确保URL不会有双斜杠
            base_url = self._danmu_server_url.rstrip('/')
            url = f"{base_url}/api/control/rate-limit/status"
            params = {"api_key": self._external_api_key}

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            # 检查响应内容
            if not response.text:
                logger.error(f"弹幕自动导入: 获取流控状态失败 - 服务器返回空响应")
                return {"error": True, "message": "服务器返回空响应"}

            try:
                data = response.json()
                # ✅ 直接返回data,不包装success字段,让MoviePilot框架自动包装
                return data
            except ValueError as json_err:
                logger.error(f"弹幕自动导入: 获取流控状态失败 - JSON解析错误: {str(json_err)}")
                return {"error": True, "message": f"服务器响应格式错误: {str(json_err)}"}

        except requests.exceptions.HTTPError as e:
            logger.error(f"弹幕自动导入: 获取流控状态失败 - HTTP错误 {e.response.status_code if e.response else 'N/A'}")
            return {"error": True, "message": f"HTTP错误: {str(e)}"}
        except requests.exceptions.RequestException as e:
            logger.error(f"弹幕自动导入: 获取流控状态失败 - 网络请求错误: {str(e)}")
            return {"error": True, "message": f"网络请求失败: {str(e)}"}
        except Exception as e:
            logger.error(f"弹幕自动导入: 获取流控状态失败 - 未知错误: {str(e)}")
            return {"error": True, "message": f"获取流控状态失败: {str(e)}"}

    def get_form(self) -> Tuple[Optional[List[dict]], Dict[str, Any]]:
        """
        Vue模式下返回None,但提供初始配置数据
        """
        return None, self._get_config()

    def get_api(self) -> List[Dict[str, Any]]:
        """定义API端点供Vue组件调用"""
        return [
            {
                "path": "/config",
                "endpoint": self._get_config,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取当前配置"
            },
            {
                "path": "/config",
                "endpoint": self._save_config,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "保存配置"
            },
            {
                "path": "/queue_stats",
                "endpoint": self._get_queue_stats,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取队列统计信息"
            },
            {
                "path": "/pending_tasks",
                "endpoint": self._get_pending_tasks,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取待处理任务列表"
            },
            {
                "path": "/delete_task",
                "endpoint": self._delete_task,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "删除指定任务"
            },
            {
                "path": "/rate_limit_status",
                "endpoint": self._get_rate_limit_status,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取弹幕库流控状态"
            },
            {
                "path": "/consolidate",
                "endpoint": self._trigger_manual_consolidate,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "手动触发整合"
            },
            {
                "path": "/import_task",
                "endpoint": self._trigger_import_task,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "手动触发单条任务导入"
            }
        ]

    def get_page(self) -> Optional[List[dict]]:
        """Vue模式不使用Vuetify页面定义"""
        return None

    def stop_service(self):
        """停止插件服务"""
        logger.info("弹幕自动导入: 停止服务")
        # 清理资源
        pass

