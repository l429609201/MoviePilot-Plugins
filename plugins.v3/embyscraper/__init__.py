"""EmbyScraper 入口仅负责宿主声明和生命周期装配。"""
from dataclasses import asdict
from apscheduler.triggers.cron import CronTrigger
from .config import Config
from app.sdk.plugin import _PluginBase
from app.sdk.events import eventmanager, Event
from app.schemas.types import EventType
from .runtime import Runtime
from .storage import MODELS


class EmbyScraper(_PluginBase):
    plugin_name = 'Emby刮削器'
    plugin_desc = '通过 Emby API 预览、补全元数据与图片，提供操作备份和手动恢复。'
    plugin_icon = 'emby-scraper.png'
    plugin_version = '3.1.0'
    plugin_author = 'Misaka10876'
    author_url = 'https://github.com/Misaka10876'
    plugin_config_prefix = 'embyscraper_'
    plugin_order = 7
    user_level = 1
    def __init__(self):
        super().__init__()
        self._runtime = None


    def init_plugin(self, config=None):
        if self._runtime and not self._runtime.close():
            raise RuntimeError('旧刮削任务尚未停止，禁止启动新写入线程')
        if config and config.get('enabled') and config.get('cron'):
            CronTrigger.from_crontab(config['cron'])
        self._runtime = Runtime(self, config)

    def get_database_models(self):
        return MODELS
    def get_state(self):
        return bool(self._runtime and self._runtime.config.enabled)

    def get_api(self):
        return self._runtime.routes() if self._runtime else []

    def get_service(self):
        if not self.get_state() or not self._runtime.config.cron:
            return []
        return [{'id': self.__class__.__name__, 'name': 'Emby 元数据刮削',
                 'trigger': CronTrigger.from_crontab(self._runtime.config.cron),
                 'func': self._runtime.scheduled, 'kwargs': {}}]

    @eventmanager.register(EventType.TransferComplete)
    def on_transfer_complete(self, event: Event):
        if self._runtime:
            self._runtime.on_transfer(event)

    def notify_job(self, job):
        if self._runtime and self._runtime.config.notify:
            self.post_message(title='Emby 刮削任务',
                              text=f"任务状态：{job['status']}，已处理 {job['completed']}/{job['total']}")

    def stop_service(self):
        if self._runtime:
            # 先停止工作线程；缓存清理失败不得阻止插件退出或造成重复工作线程。
            if self._runtime.close():
                self._runtime.storage.cleanup_translation_cache()

    @staticmethod
    def get_command():
        return []

    def get_form(self):
        return None, asdict(Config())

    @staticmethod
    def get_render_mode():
        return 'vue', 'dist/assets'

    @staticmethod
    def get_page():
        return []
