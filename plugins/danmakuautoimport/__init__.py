import time
import uuid
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Optional, Tuple

import pytz
from apscheduler.triggers.cron import CronTrigger

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
    plugin_version = "2.3.0"
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
    _auto_retry = True
    _retry_count = 3

    # 任务队列
    _pending_tasks: List[Dict[str, Any]] = []
    _processing_tasks: Dict[str, Dict[str, Any]] = {}
    _lock = Lock()

    def init_plugin(self, config: dict = None):
        """初始化插件"""
        if config:
            self._enabled = config.get("enable", False)  # ✅ 修复字段名: enabled -> enable
            self._notify = config.get("notify", False)
            self._danmu_server_url = config.get("danmu_server_url", "").rstrip("/")
            self._external_api_key = config.get("external_api_key", "")
            self._cron = config.get("cron", "*/5 * * * *")
            self._delay_seconds = int(config.get("delay_seconds", 0))
            self._max_queue_size = int(config.get("max_queue_size", 100))
            self._process_batch_size = int(config.get("process_batch_size", 1))
            self._only_anime = config.get("only_anime", False)
            self._search_type = config.get("search_type", "tmdb")
            self._auto_retry = config.get("auto_retry", True)
            self._retry_count = int(config.get("retry_count", 3))

        # 初始化队列
        self._pending_tasks = []
        self._processing_tasks = {}

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
        if not self._enabled or not self._cron:
            return []

        return [{
            "id": "DanmakuAutoImport",
            "name": "弹幕自动导入定时任务",
            "trigger": CronTrigger.from_crontab(self._cron),
            "func": self._process_queue,
            "kwargs": {}
        }]

    @eventmanager.register(EventType.TransferComplete)
    def on_transfer_complete(self, event: Event):
        """监听媒体转移完成事件"""
        if not self._enabled:
            return

        event_data = event.event_data or {}
        mediainfo = event_data.get("mediainfo")
        meta = event_data.get("meta")

        if not mediainfo:
            logger.warning("弹幕自动导入: 未获取到媒体信息")
            return

        # 如果只处理动漫且当前不是动漫，则跳过
        if self._only_anime and mediainfo.type != MediaType.TV:
            logger.debug(f"弹幕自动导入: 跳过非动漫媒体 {mediainfo.title}")
            return

        # 添加到队列
        self._add_to_queue(mediainfo, meta)

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

    def _add_to_queue(self, mediainfo, meta):
        """添加任务到队列"""
        with self._lock:
            # 检查队列大小
            if len(self._pending_tasks) >= self._max_queue_size:
                logger.warning(f"弹幕自动导入: 队列已满({self._max_queue_size}),跳过添加")
                return

            # 创建任务
            task = {
                "id": str(uuid.uuid4()),
                "mediainfo": mediainfo,
                "meta": meta,
                "add_time": datetime.now(tz=pytz.timezone(settings.TZ)),
                "retry_count": 0,
                "status": "pending",
                "error_msg": None,
                "danmu_task_id": None
            }

            self._pending_tasks.append(task)
            logger.info(f"弹幕自动导入: 已添加任务到队列 - {mediainfo.title} (队列长度: {len(self._pending_tasks)})")

    def _process_queue(self):
        """处理队列中的任务"""
        if not self._enabled:
            return

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

            # 构建API请求
            api_url = f"{self._danmu_server_url}/api/control/import/auto"
            params = {"api_key": self._external_api_key}

            # 构建请求数据
            data = {
                "searchType": self._search_type,
                "searchTerm": str(mediainfo.tmdb_id) if self._search_type == "tmdb" else mediainfo.title,
                "mediaType": "tv_series" if mediainfo.type == MediaType.TV else "movie"
            }

            # 如果是剧集,添加季集信息
            if mediainfo.type == MediaType.TV and meta:
                if hasattr(meta, "begin_season") and meta.begin_season:
                    data["season"] = meta.begin_season
                if hasattr(meta, "begin_episode") and meta.begin_episode:
                    data["episode"] = meta.begin_episode

            # 发送请求
            response = RequestUtils(timeout=30).post_res(url=api_url, params=params, json=data)
            if not response or response.status_code != 202:
                raise Exception(f"API请求失败: {response.status_code if response else 'No response'}")

            result = response.json()
            danmu_task_id = result.get("taskId")

            # 更新任务状态
            task["status"] = "success"
            task["danmu_task_id"] = danmu_task_id
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
            "delay_seconds": self._delay_seconds,
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
                "delay_seconds": self._delay_seconds,
                "max_queue_size": self._max_queue_size,
                "process_batch_size": self._process_batch_size,
                "only_anime": self._only_anime,
                "search_type": self._search_type,
                "auto_retry": self._auto_retry,
                "retry_count": self._retry_count
            }

            # 保存配置
            self.update_config(config_to_save)

            # 重新初始化插件 - 使用刚保存的配置而不是从数据库读取
            self.stop_service()
            self.init_plugin(config_to_save)

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

    def _get_pending_tasks(self) -> List[Dict[str, Any]]:
        """API端点: 获取待处理任务列表"""
        try:
            with self._lock:
                tasks = []
                for task in self._pending_tasks[:50]:  # 最多返回50个
                    try:
                        mediainfo = task.get('mediainfo')
                        if not mediainfo:
                            continue

                        # 构建季集信息
                        episode_info = ''
                        if hasattr(mediainfo, 'season') and mediainfo.season:
                            episode_info = f"S{mediainfo.season:02d}"
                            if hasattr(mediainfo, 'episode') and mediainfo.episode:
                                episode_info += f"E{mediainfo.episode:02d}"
                        elif hasattr(mediainfo, 'episode') and mediainfo.episode:
                            episode_info = f"E{mediainfo.episode:02d}"
                        else:
                            episode_info = '-'

                        # 安全获取add_time
                        add_time_str = '未知'
                        add_time = task.get('add_time')
                        if add_time and hasattr(add_time, 'strftime'):
                            try:
                                add_time_str = add_time.strftime('%Y-%m-%d %H:%M:%S')
                            except Exception:
                                add_time_str = str(add_time)

                        tasks.append({
                            "task_id": task.get('task_id'),
                            "title": mediainfo.title or '未知标题',
                            "media_type": mediainfo.type.value if hasattr(mediainfo.type, 'value') else str(mediainfo.type),
                            "episode_info": episode_info,
                            "status": task.get('status', 'pending'),
                            "add_time": add_time_str,
                            "retry_count": task.get('retry_count', 0),
                            "tmdb_id": mediainfo.tmdb_id or '无'
                        })
                    except Exception as e:
                        logger.error(f"弹幕自动导入: 处理任务数据时出错: {e}", exc_info=True)
                        continue

                return tasks
        except Exception as e:
            logger.error(f"弹幕自动导入: 获取待处理任务列表失败: {e}", exc_info=True)
            return []

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
                if task.get('task_id') == task_id:
                    # 检查任务状态
                    if task.get('status') == 'processing':
                        return {"success": False, "message": "任务正在处理中,无法删除"}

                    # 删除任务
                    deleted_task = self._pending_tasks.pop(i)
                    logger.info(f"手动删除任务: {deleted_task.get('mediainfo', {}).get('title', '未知')} (ID: {task_id})")
                    return {"success": True, "message": "任务已删除"}

            return {"success": False, "message": "未找到指定任务"}

    def _get_rate_limit_status(self) -> Dict[str, Any]:
        """API端点: 获取流控状态"""
        if not self._danmu_server_url or not self._external_api_key:
            return {"success": False, "message": "未配置弹幕库服务器地址或API密钥"}

        try:
            import requests
            # 确保URL不会有双斜杠
            base_url = self._danmu_server_url.rstrip('/')
            url = f"{base_url}/api/control/rate-limit/status"
            params = {"api_key": self._external_api_key}

            logger.info(f"弹幕自动导入: 请求流控状态 URL={url}, API_KEY={self._external_api_key[:8]}...")

            response = requests.get(url, params=params, timeout=10)
            logger.info(f"弹幕自动导入: 流控状态响应 status_code={response.status_code}, content_type={response.headers.get('content-type')}, content_length={len(response.text)}")

            # 打印响应内容的前500个字符用于调试
            logger.info(f"弹幕自动导入: 响应内容预览: {response.text[:500]}")

            response.raise_for_status()

            # 检查响应内容
            if not response.text:
                logger.error(f"获取流控状态失败: 服务器返回空响应")
                return {"success": False, "message": "服务器返回空响应"}

            try:
                data = response.json()
                logger.info(f"弹幕自动导入: 流控状态获取成功, globalEnabled={data.get('globalEnabled')}")
                return {"success": True, "data": data}
            except ValueError as json_err:
                logger.error(f"获取流控状态失败: JSON解析错误 - {str(json_err)}")
                logger.error(f"获取流控状态失败: 完整响应内容 - {response.text}")
                return {"success": False, "message": f"服务器响应格式错误: {str(json_err)}"}

        except requests.exceptions.HTTPError as e:
            logger.error(f"获取流控状态失败: HTTP错误 - status_code={e.response.status_code if e.response else 'N/A'}")
            logger.error(f"获取流控状态失败: HTTP错误响应 - {e.response.text if e.response else 'N/A'}")
            return {"success": False, "message": f"HTTP错误: {str(e)}"}
        except requests.exceptions.RequestException as e:
            logger.error(f"获取流控状态失败: 网络请求错误 - {str(e)}")
            return {"success": False, "message": f"网络请求失败: {str(e)}"}
        except Exception as e:
            logger.error(f"获取流控状态失败: 未知错误 - {str(e)}")
            logger.exception("详细错误堆栈:")
            return {"success": False, "message": f"获取流控状态失败: {str(e)}"}

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

