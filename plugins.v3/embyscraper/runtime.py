"""插件生命周期、API 和自动触发装配，业务规则由独立模块负责。"""
from fastapi import HTTPException
from threading import RLock
from .episode_groups import EpisodeGroups
from .models import (BindGroupRequest, EpisodeGroupRequest, EpisodeGroupsResponse,
                     EpisodeGroupPreviewResponse)
from .backups import Backups
from .config import Config
from .emby_api import discover_servers
from .engine import Engine, OperationError, item_view
from .models import (ActionResponse, BackupsResponse, IdRequest, ItemsResponse, JobResponse,
                     JobsResponse, OptionsResponse, PreviewRequest, PreviewResponse,
                     RestoreRequest, ScrapeRequest, ClearCacheRequest, CacheStatusResponse, ScrapeLibraryRequest)
from .providers import get_provider, available_providers
from .tasks import Tasks
from .translation import Translator
from .storage import Storage
from dataclasses import asdict
from .execution_scope import enumerate_items, plan_selected
from .triggers import find_transferred, transfer_identity


class Runtime:
    def __init__(self, plugin, config):
        self.plugin = plugin
        self.config_lock = RLock()
        self.config = Config.parse(config)
        self.storage = Storage(plugin)
        self.backups = Backups(plugin, self.storage, self.config.backup_limit)
        self.provider = get_provider(self.config.source)
        self.configure_provider(self.provider)
        self.translator = Translator(plugin, storage=self.storage) if self.config.ai_translation else None
        self.engine = Engine(self.config, self.backups, self.provider, self.translator)
        self.tasks = Tasks(plugin, self.execute, self.config.delay_seconds, self.storage)

    def configure_provider(self, provider):
        """提供者可选语言契约不改变注册表工厂的调用接口。"""
        if provider and callable(getattr(provider, 'set_options', None)):
            provider.set_options(self.config)
        if provider and callable(getattr(provider, 'set_language', None)):
            provider.set_language(self.config.language)

    def api(self, server):
        if server not in self.config.servers:
            raise ValueError('服务器未选中')
        servers = discover_servers()
        api = servers.get(server)
        self.cleanup(*(value for name, value in servers.items() if name != server))
        if not api:
            raise ValueError('Emby 服务器不可用')
        return api

    def execute(self, row, ident, check):
        api = self.api(row['server'])
        try:
            return self.execute_with_api(row, ident, check, api)
        finally:
            self.cleanup(api)

    def execute_with_api(self, row, ident, check, api):
        if row['restore_id']:
            self.engine.scope(row['server'], api.item(ident), api)
            try:
                self.backups.restore(row['restore_id'], api, check)
            except Exception:
                raise OperationError(may_write=True) from None
            return {'item_id': ident, 'status': 'complete'}
        if row.get('transfer'):
            ids = find_transferred(self, api, row['server'], row['transfer'], check)
            results = [self.engine.execute(row['server'], i, api, check) for i in ids]
            return {'item_id': ident, 'status': 'complete' if results else 'skipped', 'count': len(results)}
        provider = get_provider(row['source'])
        try:
            self.configure_provider(provider)
            config_snapshot = row.get('config_snapshot') or asdict(self.config)
            config = Config.parse(config_snapshot)
            return Engine(config, self.backups, provider, self.translator, mode=row.get('mode')).execute(row['server'], ident, api, check, row['tmdb_id'], confirmed=row.get('confirmed', False))
        finally:
            self.cleanup(provider, api)

    @staticmethod
    def cleanup(*resources):
        # 清理失败不改变已核验的写入结果。
        for resource in resources:
            if resource and hasattr(resource, 'close'):
                try:
                    resource.close()
                except Exception:
                    pass

    def options(self):
        discovered = {}
        try:
            discovered = discover_servers()
            servers = [{'name': name, 'selected': name in self.config.servers,
                        'libraries': [{**library, 'selected': str(library['id']) in self.config.libraries.get(name, [])}
                                      for library in api.libraries()]}
                       for name, api in discovered.items()]
            return {'servers': servers, 'sources': available_providers()}
        except Exception:
            raise HTTPException(502, '读取 Emby 服务器失败') from None
        finally:
            self.cleanup(*discovered.values())

    def items(self, server: str, library_id: str, search: str = '', start: int = 0, limit: int = 50):
        if library_id not in self.config.libraries.get(server, []):
            raise HTTPException(400, '媒体库未选中')
        api = None
        try:
            api = self.api(server)
            rows, total = api.items(library_id, search, max(0, start), max(1, min(100, limit)))
            return {'items': [item_view(i) for i in rows], 'total': total}
        except Exception:
            raise HTTPException(502, '读取媒体列表失败') from None
        finally:
            self.cleanup(api)

    def preview(self, body: PreviewRequest):
        provider = None
        api = None
        try:
            if body.source != self.config.source:
                raise ValueError('来源未配置')
            provider = get_provider(body.source)
            self.configure_provider(provider)
            api = self.api(body.server)
            return Engine(self.config, self.backups, provider, self.translator, mode=body.mode).preview(
                body.server, body.item_id, api, body.tmdb_id)[0]
        except Exception:
            raise HTTPException(400, '无法可靠匹配或目标不在配置范围内') from None
        finally:
            self.cleanup(provider, api)

    def episode_groups(self, server: str, item_id: str):
        return self.group_operation(server, item_id)

    def episode_group_preview(self, body: EpisodeGroupRequest):
        return self.group_operation(body.server, body.item_id, body.group_id)

    def group_operation(self, server, item_id, group_id=None):
        api, provider = None, None
        try:
            api = self.api(server)
            item = api.item(item_id)
            self.engine.scope(server, item, api)
            provider = get_provider(self.config.source)
            self.configure_provider(provider)
            groups = EpisodeGroups(self.config, provider, self.plugin)
            groups.server = server
            series, _ = groups.context(item, api)
            self.engine.scope(server, series, api)
            return groups.preview(item, api, group_id) if group_id else groups.list(item, api)
        except Exception:
            raise HTTPException(400, '无法读取或可靠匹配该剧集组，请检查父剧集 ID 和范围') from None
        finally:
            self.cleanup(provider, api)

    def bind_group(self, body: BindGroupRequest):
        if body.confirmed is not True:
            raise HTTPException(400, '保存剧集组规则必须明确确认')
        plan = self.group_operation(body.server, body.item_id, body.group_id)
        try:
            # 合并宿主最新配置，仅修改规则，不重建 worker 或改动启用状态。
            with self.config_lock:
                raw = dict(self.plugin.get_config() or {})
                bindings = dict(raw.get('episode_group_bindings') or {})
                bindings[plan['series_tmdb_id']] = body.group_id
                raw['episode_group_bindings'] = bindings
                Config.parse(raw)
                self.plugin.update_config(raw)
                self.config.episode_group_bindings = bindings
            return {'success': True}
        except Exception:
            raise HTTPException(400, '保存剧集组规则失败') from None

    def scrape(self, body: ScrapeRequest):
        if self.config.reindex_episodes and self.config.episode_group_mode != 'aired' and body.confirmed is not True:
            raise HTTPException(400, '剧集组编号转换必须明确确认')
        if body.tmdb_id and len(body.item_ids) != 1:
            raise HTTPException(400, '手动 TMDB 编号只能用于单项目')
        api = None
        try:
            if body.source != self.config.source:
                raise ValueError('来源未配置')
            api = self.api(body.server)
            ids = plan_selected(self.engine, body.server, api, body.item_ids, body.recursive)
            if body.tmdb_id and len(body.item_ids) == 1:
                root_type = api.item(body.item_ids[0]).get('Type')
                if root_type not in {'Movie', 'Series', 'Season', 'Episode'}:
                    raise ValueError('手动 TMDB 编号仅支持电影或剧集')
            return {'job': self.tasks.enqueue(body.server, ids, body.source, body.tmdb_id, confirmed=body.confirmed, mode=body.mode, recursive=body.recursive, config_snapshot=asdict(self.config))}
        except Exception:
            raise HTTPException(400, '无法创建任务，请检查范围和队列') from None
        finally:
            self.cleanup(api)

    def scrape_library(self, body: ScrapeLibraryRequest):
        if body.confirmed is not True:
            raise HTTPException(400, '媒体库范围执行必须明确确认')
        if body.recursive is not True or body.source != self.config.source:
            raise HTTPException(400, '媒体库任务必须使用已配置来源并启用递归')
        if body.library_id not in self.config.libraries.get(body.server, []):
            raise HTTPException(400, '媒体库未选中')
        api = None
        try:
            api = self.api(body.server)
            rows = enumerate_items(api, body.library_id, body.search)
            if rows and len(rows) + len(self.backups.rows) > self.backups.limit:
                raise ValueError('备份剩余容量不足以完成全部范围，请提高备份上限或拆分范围')
            for item in rows:
                self.engine.scope(body.server, item, api)
            return {'job': self.tasks.enqueue(body.server, [str(item['Id']) for item in rows],
                        mode=body.mode, recursive=False, confirmed=True,
                        scope={'library_id': body.library_id, 'search': body.search}, config_snapshot=asdict(self.config))}
        except ValueError as exc:
            raise HTTPException(400, str(exc)) from None
        finally:
            self.cleanup(api)

    def jobs(self):
        return {'jobs': self.tasks.views()}

    def cancel(self, body: IdRequest):
        try:
            self.tasks.cancel(body.id)
            return {'success': True}
        except ValueError:
            raise HTTPException(400, '任务不存在') from None

    def retry(self, body: IdRequest):
        try:
            return {'job': self.tasks.retry(body.id)}
        except ValueError:
            raise HTTPException(400, '任务没有安全可重试项目') from None

    def backup_views(self):
        return {'backups': self.backups.views()}

    def restore(self, body: RestoreRequest):
        if body.confirmed is not True:
            raise HTTPException(400, '恢复必须明确确认')
        try:
            row = self.backups.get(body.id)
            self.cleanup(self.api(row['server']))
            return {'job': self.tasks.enqueue(row['server'], [row['item_id']], restore_id=body.id, confirmed=body.confirmed, config_snapshot=asdict(self.config))}
        except ValueError:
            raise HTTPException(400, '无法恢复该备份') from None

    def cache_status(self):
        return {'rows': len(self.storage.get_translation_cache())}

    def cache_clear(self, body: ClearCacheRequest):
        if body.confirmed is not True:
            raise HTTPException(400, '清理缓存必须明确确认')
        return {'success': True, 'cleared': self.storage.clear_rebuildable_cache()}

    def routes(self):
        routes = [('/options', self.options, 'GET', OptionsResponse),
                  ('/items', self.items, 'GET', ItemsResponse),
                  ('/preview', self.preview, 'POST', PreviewResponse),
                  ('/scrape', self.scrape, 'POST', JobResponse),
                  ('/scrape_library', self.scrape_library, 'POST', JobResponse),
                  ('/jobs', self.jobs, 'GET', JobsResponse),
                  ('/cancel', self.cancel, 'POST', ActionResponse),
                  ('/retry', self.retry, 'POST', JobResponse),
                  ('/backups', self.backup_views, 'GET', BackupsResponse),
                  ('/episode_groups', self.episode_groups, 'GET', EpisodeGroupsResponse),
                  ('/episode_group_preview', self.episode_group_preview, 'POST', EpisodeGroupPreviewResponse),
                  ('/bind_group', self.bind_group, 'POST', ActionResponse),
                  ('/restore', self.restore, 'POST', JobResponse),
                  ('/cache_status', self.cache_status, 'GET', CacheStatusResponse),
                  ('/cache_clear', self.cache_clear, 'POST', ActionResponse)]
        return [{'path': p, 'endpoint': f, 'methods': [m], 'auth': 'bear',
                 'summary': 'Emby 刮削' + p, 'response_model': model} for p, f, m, model in routes]

    def scheduled(self):
        if not self.config.enabled:
            return
        cursors = self.storage.get_schedule_cursors()
        for server in self.config.servers:
            libraries = self.config.libraries.get(server, [])
            if not libraries:
                continue
            cursor = cursors.get(server, {'library': 0, 'start': 0})
            index = int(cursor['library']) % len(libraries)
            start = max(0, int(cursor['start']))
            api = self.api(server)
            try:
                rows, total = api.items(libraries[index], '', start, self.config.max_items)
            finally:
                self.cleanup(api)
            ids = [str(i['Id']) for i in rows]
            if ids:
                self.tasks.enqueue(server, ids)
            next_start = start + len(rows)
            cursors[server] = ({'library': index, 'start': next_start} if rows and next_start < total else
                               {'library': (index + 1) % len(libraries), 'start': 0})
            self.storage.save_schedule_cursors(cursors)

    def on_transfer(self, event):
        if not self.config.enabled or not self.config.auto_transfer:
            return
        identity = transfer_identity(event)
        if not identity:
            return
        for server in self.config.servers:
            if self.config.libraries.get(server):
                self.tasks.enqueue(server, ['transfer-' + identity['tmdb_id']], transfer=identity)

    def close(self):
        stopped = self.tasks.close()
        if stopped:
            self.cleanup(self.provider)
        return stopped
