"""弹幕插件入口：元数据、装配、生命周期与事件代理。"""
from threading import Event as StopEvent, Lock, RLock
from apscheduler.schedulers.background import BackgroundScheduler
from app.sdk.config import settings
from app.sdk.events import Event, eventmanager
from app.sdk.logging import logger
from app.sdk.plugin import _PluginBase
from app.schemas.types import EventType
from .config import DEFAULTS, ConfigMixin
from .danmaku_api import DanmakuAPIMixin
from .events import EventMixin
from .execution import ExecutionMixin
from .selection import SelectionMixin
from .queue import QueueMixin
from .models import (ConfigView, ConnectionBody, Counts, EnqueueBody, PauseBody,
                     Result, StatusView, TaskBody, TaskView)


class DanmakuAutoImport(ConfigMixin, DanmakuAPIMixin, EventMixin, SelectionMixin, ExecutionMixin, QueueMixin, _PluginBase):
    plugin_name = "弹幕库自动导入"
    plugin_desc = "媒体整理后自动导入弹幕，持久化排队并确认远端执行结果"
    plugin_icon = "danmaku-auto.png"
    plugin_version = "3.0.0"
    plugin_author = "Misaka10876"
    author_url = "https://github.com/l429609201"
    plugin_config_prefix = "danmakuautoimport_"
    plugin_order = 20
    auth_level = 1
    STATE_KEY = "queue_state_v3"
    EXECUTION_TIMEOUT = 86400

    def __init__(self):
        super().__init__()
        # 锁和停止信号仅属于当前实例，不在插件实例间共享。
        self._lock = RLock()
        self._process_lock = Lock()
        self._stop = StopEvent()
        self._scheduler = None
        self._config = dict(DEFAULTS)
        self._state = {"version": 1, "paused": False, "tasks": []}
        self._loaded = False
        self._next_submit_at = 0.0


    def init_plugin(self, config: dict = None):
        """只通过宿主初始化配置；空秘钥保留，显式清除优先。"""
        self.stop_service()
        # 等待有界网络周期退出后再替换配置和停止信号。
        with self._process_lock:
            self._configure(config)
            with self._lock:
                if not self._loaded:
                    saved = self.get_data(self.STATE_KEY)
                    if isinstance(saved, dict) and isinstance(saved.get("tasks"), list):
                        self._state = self._restore_state(saved)
                    self._loaded = True
                for task in self._state["tasks"]:
                    if task["status"] == "submitting":
                        task.update(status="needs_confirmation", error="提交被中断，请人工确认远端是否已接受")
                self._persist()
            self._stop = StopEvent()
        if self._config["enable"]:
            self._scheduler = BackgroundScheduler(timezone=settings.TZ)
            # 一个短周期函数负责轮询和排队；没有驻留网络线程或锁内等待。
            self._scheduler.add_job(self._cycle, "interval", seconds=self._config["poll_seconds"],
                                    id="danmaku_cycle", max_instances=1, coalesce=True)
            self._scheduler.start()


    @staticmethod
    def get_render_mode():
        return "vue", "dist/assets"


    def get_page(self):
        return None


    @staticmethod
    def get_command():
        return []


    def get_service(self):
        return []


    def stop_service(self):
        """注销所有调度任务并通知当前周期停止；已接受任务保留。"""
        self._stop.set()
        scheduler = self._scheduler
        self._scheduler = None
        if scheduler:
            scheduler.remove_all_jobs()
            if scheduler.running:
                scheduler.shutdown(wait=False)


    def get_api(self):
        routes = [
            ("/status", self.status, "GET", StatusView),
            ("/connection", self.connection, "GET", Result),
            ("/test_connection", self.test_connection, "POST", Result),
            ("/enqueue", self.enqueue, "POST", Result),
            ("/process", self.process, "POST", Result),
            ("/pause", self.pause, "POST", Result),
            ("/retry", self.retry, "POST", Result),
            ("/delete_task", self.delete_task, "POST", Result),
            ("/config", self.config_view, "GET", ConfigView),
        ]
        return [{"path": path, "endpoint": endpoint, "methods": [method], "auth": "bear",
                 "summary": "弹幕自动导入" + path, "response_model": model}
                for path, endpoint, method, model in routes]


    @eventmanager.register(EventType.TransferComplete)
    def on_transfer_complete(self, event: Event):
        return super().on_transfer_complete(event)
