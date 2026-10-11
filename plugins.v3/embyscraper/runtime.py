"""插件生命周期、API 和自动触发装配，业务规则由独立模块负责。"""
from fastapi import HTTPException
from threading import RLock
from app.sdk.logging import logger
from .episode_groups import EpisodeGroups
from .models import (BindGroupRequest, EpisodeGroupRequest, EpisodeGroupsResponse,
                     EpisodeGroupPreviewResponse)
from .backups import Backups
from .config import Config, FIELDS
from .emby_api import discover_servers
from .engine import Engine, OperationError, item_view
from .models import (ActionResponse, BackupsResponse, IdRequest, ItemsResponse, ItemResponse,
                     ItemUpdateRequest, ItemUpdateResponse, JobResponse,
                     JobsResponse, OptionsResponse, PreviewRequest, PreviewResponse,
                     RestoreRequest, ScrapeRequest, ClearCacheRequest, CacheStatusResponse,
                     ScrapeLibraryRequest, StatusResponse)
from .providers import get_provider, available_providers
from .tasks import Tasks
from .translation import Translator
from .storage import Storage
from dataclasses import asdict
from .execution_scope import iter_items, plan_selected
from .triggers import find_transferred, transfer_identity


def public_item(item):
    """详情接口只返回可编辑元信息，不暴露媒体路径、连接信息或媒体源。"""
    return {key: item.get(key) for key in (
        'Id', 'Type', 'Name', 'OriginalTitle', 'SortName', 'Overview',
        'ProductionYear', 'PremiereDate', 'EndDate', 'Genres', 'Studios',
        'Taglines', 'CommunityRating', 'CriticRating', 'OfficialRating',
        'CustomRating', 'People', 'ProviderIds', 'Tags', 'LockedFields',
        'LockData', 'IndexNumber', 'ParentIndexNumber', 'SeriesId', 'ParentId',
        'SeasonId', 'SeriesName', 'ImageTags', 'BackdropImageTags', 'Status',
    )}


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
        self.tasks = Tasks(plugin, self.execute, self.config.delay_seconds, self.storage, stream=self.stream)

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
            logger.error(f"Emby刮削器：服务器 {server} 未发现可用连接")
            raise ValueError('Emby 服务器不可用')
        return api

    def execute(self, row, ident, check):
        api = self.api(row['server'])
        try:
            return self.execute_with_api(row, ident, check, api)
        finally:
            self.cleanup(api)

    def stream(self, row, check):
        """流式扫描媒体库并逐项交给任务线程，避免大媒体库一次性占用内存和请求超时。"""
        api = self.api(row['server'])
        try:
            scope = row.get('scope') or {}
            for item, total in iter_items(api, scope.get('library_id', ''), scope.get('search', ''), check):
                yield str(item['Id']), total
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
            logger.info(f"Emby刮削器：读取到 {len(servers)} 台 Emby 服务器")
            return {'servers': servers, 'sources': available_providers()}
        except Exception as exc:
            logger.error(f"Emby刮削器：读取服务器选项失败：{type(exc).__name__}")
            raise HTTPException(502, '读取 Emby 服务器失败') from None
        finally:
            self.cleanup(*discovered.values())

    def status(self):
        """首页只读状态；单台服务器状态读取失败不影响其它服务器展示。"""
        discovered = {}
        try:
            discovered = discover_servers()
        except Exception:
            raise HTTPException(502, '读取 Emby 服务器失败') from None
        servers = []
        try:
            for name, api in discovered.items():
                entry = {'name': name, 'selected': name in self.config.servers, 'available': True}
                try:
                    entry.update(api.system_status())
                    logger.info(f"Emby刮削器：服务器 {name} 状态读取成功")
                except Exception as exc:
                    # 连接仍在但状态接口异常时降级为不可用，不伪造计数。
                    logger.warning(f"Emby刮削器：服务器 {name} 状态读取失败：{type(exc).__name__}")
                    entry['available'] = False
                    entry['error'] = '服务器状态读取失败'
                servers.append(entry)
            reachable = set(discovered)
            for name in self.config.servers:
                if name not in reachable:
                    servers.append({'name': name, 'selected': True, 'available': False,
                                    'error': 'Emby 服务器不可用'})
            return {'servers': servers}
        finally:
            self.cleanup(*discovered.values())

    def items(self, server: str, library_id: str, search: str = '', start: int = 0, limit: int = 50, tree: bool = False):
        if library_id not in self.config.libraries.get(server, []):
            raise HTTPException(400, '媒体库未选中')
        api = None
        try:
            api = self.api(server)
            if tree and not str(search or '').strip():
                rows, total = api.children(library_id, max(0, start), max(1, min(100, limit)), kinds='Movie,Series')
            else:
                rows, total = api.items(library_id, search, max(0, start), max(1, min(100, limit)))
            return {'items': [item_view(i) for i in rows], 'total': total}
        except Exception as exc:
            logger.error(f"Emby刮削器：读取媒体列表失败：{type(exc).__name__}")
            raise HTTPException(502, '读取媒体列表失败') from None
        finally:
            self.cleanup(api)

    def children(self, server: str, item_id: str, start: int = 0, limit: int = 50):
        api = None
        try:
            api = self.api(server)
            item = api.item(item_id)
            self.engine.scope(server, item, api)
            kinds = {'Series': 'Season', 'Season': 'Episode'}.get(str(item.get('Type')), 'Movie,Series,Season,Episode')
            rows, total = api.children(item_id, max(0, start), max(1, min(100, limit)), kinds=kinds)
            return {'items': [item_view(i) for i in rows], 'total': total}
        except Exception as exc:
            logger.error(f"Emby刮削器：读取子条目失败，条目 {item_id}：{type(exc).__name__}")
            raise HTTPException(400, '无法读取该条目的子条目') from None
        finally:
            self.cleanup(api)

    def item_detail(self, server: str, item_id: str):
        api = None
        try:
            api = self.api(server)
            item = api.item(item_id)
            self.engine.scope(server, item, api)
            return {'item': public_item(item)}
        except Exception as exc:
            logger.error(f"Emby刮削器：读取条目详情失败，条目 {item_id}：{type(exc).__name__}")
            raise HTTPException(400, '无法读取条目详情') from None
        finally:
            self.cleanup(api)

    def update_item(self, body: ItemUpdateRequest):
        if body.confirmed is not True:
            raise HTTPException(400, '保存元信息必须明确确认')
        api = None
        try:
            api = self.api(body.server)
            item = api.item(body.item_id)
            self.engine.scope(body.server, item, api)
            if item.get('LockData') or (item.get('LockedFields') or []):
                raise ValueError('条目或字段已锁定，禁止直接编辑')
            fields = {k: v for k, v in body.fields.items() if k in FIELDS}
            if not fields:
                raise ValueError('没有可写入的元信息字段')
            payload = dict(item)
            payload.update(fields)
            row = self.backups.create(body.server, item, list(fields), [], api)
            api.update(body.item_id, payload)
            verified = api.item(body.item_id)
            self.backups.checkpoint(row, verified, api, fields=list(fields), status='complete')
            logger.info(f"Emby刮削器：条目 {body.item_id} 元信息已手动更新")
            return {'success': True, 'item': public_item(verified)}
        except ValueError as exc:
            raise HTTPException(400, str(exc)) from None
        except Exception as exc:
            logger.error(f"Emby刮削器：保存条目元信息失败，条目 {body.item_id}：{type(exc).__name__}")
            raise HTTPException(400, '保存元信息失败') from None
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
        except Exception as exc:
            logger.error(f"Emby刮削器：预览失败，服务器 {body.server}，条目 {body.item_id}：{type(exc).__name__}")
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
        except Exception as exc:
            logger.error(f"Emby刮削器：创建刮削任务失败，服务器 {body.server}：{type(exc).__name__}")
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
            # 大媒体库采用服务端流式扫描，任务线程持续处理并更新扫描/完成进度。
            job = self.tasks.enqueue(body.server, [], body.source, confirmed=True, mode=body.mode,
                                     recursive=False, scope={'library_id': body.library_id, 'search': body.search},
                                     config_snapshot=asdict(self.config), stream=True)
            logger.info(f"Emby刮削器：媒体库 {body.library_id} 已创建流式任务 {job['id'][:8]}")
            return {'job': job}
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
                  ('/status', self.status, 'GET', StatusResponse),
                  ('/items', self.items, 'GET', ItemsResponse),
                  ('/children', self.children, 'GET', ItemsResponse),
                  ('/item', self.item_detail, 'GET', ItemResponse),
                  ('/item_update', self.update_item, 'POST', ItemUpdateResponse),
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
