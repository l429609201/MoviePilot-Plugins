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
                     ScrapeLibraryRequest, StatusResponse, ScheduleResolveRequest,
                     ScheduleCursorsResponse, ScheduleResolveResponse)
from .providers import get_provider, available_providers
from .tasks import Tasks
from .translation import Translator
from .official_cache import OfficialCache
from .storage import Storage
from dataclasses import asdict
import hashlib
import json
from .execution_scope import iter_items, plan_selected, inherited_locks
from .triggers import find_transferred, transfer_identity
from .diagnostics import error_reason


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
        # 手动保存和队列写入共用互斥锁，禁止两个入口交错覆盖快照。
        self.write_lock = RLock()
        self.config = Config.parse(config)
        self.storage = Storage(plugin)
        self.backups = Backups(plugin, self.storage, self.config.backup_limit)
        self.provider = get_provider(self.config.source)
        self.configure_provider(self.provider)
        self.translator = Translator(plugin, storage=self.storage) if (self.config.ai_translation or self.config.actor_ai_translation) else None
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
            with self.write_lock:
                check()
                return self.execute_with_api(row, ident, check, api)
        finally:
            self.cleanup(api)

    def stream(self, row, check):
        """流式扫描媒体库并逐项交给任务线程，避免大媒体库一次性占用内存和请求超时。"""
        api = self.api(row['server'])
        try:
            scope = row.get('scope') or {}
            parents = scope.get('library_ids') or [scope.get('library_id', '')]
            seen, targets = set(), []
            # 先固定 ID 快照再写入，避免改名改变偏移分页排序而漏扫或重复。
            for parent in parents:
                for item, _ in iter_items(api, parent, scope.get('search', ''), check):
                    ident = str(item['Id'])
                    if ident not in seen:
                        seen.add(ident)
                        targets.append(ident)
            for ident in targets:
                check()
                yield ident, len(targets)
        finally:
            self.cleanup(api)

    def execute_with_api(self, row, ident, check, api):
        if row['restore_id']:
            self.engine.scope(row['server'], api.item(ident), api)
            try:
                self.backups.restore(row['restore_id'], api, check)
            except Exception as exc:
                raise OperationError(may_write=True, reason=error_reason(exc), backup_id=row['restore_id']) from None
            return {'item_id': ident, 'emby_id': str(ident), 'checked': True, 'written': True, 'status': 'complete'}
        if row.get('transfer'):
            ids = find_transferred(self, api, row['server'], row['transfer'], check)
            results = []
            for item_id in ids:
                child = dict(row, transfer=None, item_ids=[item_id], tmdb_id=None)
                try:
                    check()
                    results.append(self.execute_with_api(child, item_id, check, api))
                except Exception as exc:
                    if any(result.get('written') for result in results) or getattr(exc, 'may_write', False):
                        raise OperationError(may_write=True, reason=error_reason(exc)) from None
                    raise
            written = any(result.get('written') for result in results)
            return {'item_id': ident, 'emby_id': None, 'checked': True, 'written': written,
                    'status': 'complete' if written else 'skipped', 'count': len(results),
                    'children': results, 'reason': '' if results else '未找到范围内身份一致的整理条目'}
        provider = get_provider(row['source'])
        try:
            config_snapshot = row.get('config_snapshot') or asdict(self.config)
            config = Config.parse(config_snapshot)
            # 人物语言与字段缓存策略使用任务快照，避免排队期间配置变化扩大调用。
            provider.set_options(config)
            provider.set_language(config.language)
            override = row['tmdb_id'] if str(ident) == str((row.get('item_ids') or [None])[0]) else None
            return Engine(config, self.backups, provider, self.translator, mode=row.get('mode')).execute(row['server'], ident, api, check, override, confirmed=row.get('confirmed', False))
        finally:
            self.cleanup(provider)

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

    def scope_libraries(self, server, library_id):
        """全库仅合并已配置的媒体库，不能绕过服务器及范围授权。"""
        libraries = self.config.libraries.get(server, [])
        if server not in self.config.servers or not libraries:
            raise HTTPException(400, '请先配置服务器和媒体库范围')
        if library_id == '__all__':
            return libraries
        if library_id not in libraries:
            raise HTTPException(400, '媒体库未选中')
        return [library_id]

    def items(self, server: str, library_id: str, search: str = '', start: int = 0, limit: int = 50, tree: bool = False, kind: str = 'Movie,Series'):
        libraries = self.scope_libraries(server, library_id)
        if kind not in {'Movie', 'Series', 'Movie,Series'}:
            raise HTTPException(400, '媒体类型筛选无效')
        api = None
        try:
            api = self.api(server)
            # 主列表始终递归查找主条目；季和集仅在父节点下面展开。
            offset, remaining, rows, total = max(0, start), max(1, min(100, limit)), [], 0
            for parent in libraries:
                batch, count = api.roots(parent, search, offset, remaining, kinds=kind)
                total += count
                if remaining == 0:
                    continue
                if offset >= count:
                    offset -= count
                    continue
                rows.extend(batch)
                remaining -= len(batch)
                offset = 0
                if remaining <= 0:
                    # 后续库仍查询总数，不把每页大小当作全库总数。
                    remaining = 0
            return {'items': [item_view(i) for i in rows[:max(1, min(100, limit))]], 'total': total}
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
        except ValueError as exc:
            logger.warning(f"Emby刮削器：子条目范围校验未通过，条目 {item_id}：{error_reason(exc)}")
            raise HTTPException(400, f'无法读取子条目：{error_reason(exc)}') from None
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
        with self.write_lock:
            return self._update_item_locked(body)

    def _update_item_locked(self, body: ItemUpdateRequest):
        if body.confirmed is not True:
            raise HTTPException(400, '保存元信息必须明确确认')
        api = None
        try:
            api = self.api(body.server)
            item = api.item(body.item_id)
            self.engine.scope(body.server, item, api)
            locked, locks = inherited_locks(self.config, item, api)
            if item.get('LockData') or locked or locks or (item.get('LockedFields') or []):
                raise ValueError('条目或字段已锁定，禁止直接编辑')
            fields = {k: v for k, v in body.fields.items() if k in FIELDS}
            if not fields:
                raise ValueError('没有可写入的元信息字段')
            payload = dict(item)
            payload.update(fields)
            row = self.backups.create(body.server, item, list(fields), [], api)
            # 写前状态落盘；POST 后任何异常均不能再声称没有写入。
            self.backups.checkpoint(row, item, api, status='unknown')
            try:
                api.update(body.item_id, payload)
                verified = api.item(body.item_id)
                self.backups.checkpoint(row, verified, api, fields=list(fields), status='partial')
                if any(verified.get(key) != value for key, value in fields.items()):
                    raise ValueError('元信息写入回读不一致')
                self.backups.checkpoint(row, verified, api, status='complete')
            except Exception as exc:
                try:
                    self.backups.checkpoint(row, item, api, status='unknown')
                except Exception:
                    logger.error('Emby刮削器：手动保存异常检查点失败')
                raise HTTPException(400, f'写入状态未确认，请核验备份 {row["id"]}：{error_reason(exc)}') from None
            logger.info(f"Emby刮削器：条目 {body.item_id} 元信息已手动更新")
            return {'success': True, 'item': public_item(verified)}
        except HTTPException:
            raise
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
            logger.error(f"Emby刮削器：预览失败，服务器 {body.server}，条目 {body.item_id}：{type(exc).__name__}：{error_reason(exc)}")
            raise HTTPException(400, f'预览失败：{error_reason(exc)}') from None
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
        libraries = self.scope_libraries(body.server, body.library_id)
        api = None
        try:
            # 大媒体库采用服务端流式扫描，任务线程持续处理并更新扫描/完成进度。
            job = self.tasks.enqueue(body.server, [], body.source, confirmed=True, mode=body.mode,
                                     recursive=False, scope={'library_id': body.library_id, 'library_ids': libraries, 'search': body.search},
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
        return {'rows': OfficialCache().count()}

    def cache_clear(self, body: ClearCacheRequest):
        if body.confirmed is not True:
            raise HTTPException(400, '清理缓存必须明确确认')
        return {'success': True, 'cleared': OfficialCache().clear()}

    @staticmethod
    def _schedule_token(server, cursor):
        # 摘要绑定整个快照与服务器，不泄露目标列表，同时拒绝旧页面的确认。
        payload = json.dumps({'server': server, 'cursor': cursor}, sort_keys=True, ensure_ascii=False)
        return hashlib.sha256(payload.encode()).hexdigest()

    def schedule_cursors(self):
        with self.config_lock:
            cursors = self.storage.get_schedule_cursors()
            jobs = {row['id']: row for row in self.tasks.views()}
            output = []
            for server, cursor in cursors.items():
                if server not in self.config.servers:
                    continue
                job = jobs.get(cursor.get('job_id'))
                pending = cursor.get('pending') or []
                configured = cursor.get('library_id') in self.config.libraries.get(server, [])
                output.append({'server': server, 'library_id': cursor.get('library_id'),
                               'job_id': cursor.get('job_id'), 'job_status': job.get('status') if job else 'missing',
                               'pending_count': len(pending), 'position': cursor.get('position', 0),
                               'target_count': len(cursor.get('targets') or []),
                               'cursor_token': self._schedule_token(server, cursor),
                               'can_resolve': bool(configured and pending and cursor.get('version') == 2
                                                   and (not job or job.get('status') not in {'queued', 'running'}))})
            return {'cursors': output}

    def schedule_resolve(self, body: ScheduleResolveRequest):
        if body.confirmed is not True or body.action != 'acknowledge':
            raise HTTPException(400, '必须明确确认人工核验并略过本批次')
        with self.config_lock:
            if body.server not in self.config.servers:
                raise HTTPException(400, '服务器不在当前配置范围')
            cursors = self.storage.get_schedule_cursors()
            cursor = cursors.get(body.server)
            if not cursor or self._schedule_token(body.server, cursor) != body.cursor_token:
                raise HTTPException(409, '定时游标已变化，请重新读取并核验')
            if cursor.get('library_id') not in self.config.libraries.get(body.server, []):
                raise HTTPException(409, '媒体库配置已变化，请先核验配置')
            pending = cursor.get('pending') or []
            if cursor.get('version') != 2 or not pending:
                raise HTTPException(409, '没有可人工确认的待核验批次')
            job = next((row for row in self.tasks.views() if row['id'] == cursor.get('job_id')), None)
            if job and job.get('status') in {'queued', 'running'}:
                raise HTTPException(409, '关联任务仍在活动中，不能推进游标')
            # 只推进游标，不改任务成功状态，不调用媒体 API，也不重放未知写入。
            position = int(cursor.get('position', 0))
            targets = cursor.get('targets')
            if (not isinstance(targets, list) or position < 0
                    or targets[position:position + len(pending)] != pending):
                raise HTTPException(409, '待核验批次与快照不一致，禁止推进')
            cursor['position'] = position + len(pending)
            cursor['pending'] = []
            cursor['job_id'] = None
            self.storage.save_schedule_cursors(cursors)
            logger.info(f'Emby刮削器：服务器 {body.server} 定时批次经人工核验后略过 {len(pending)} 项，仅推进游标，不代表本批成功')
            return {'success': True, 'acknowledged_count': len(pending), 'position': cursor['position'],
                    'message': '已人工确认并略过本批；仅推进后续定时处理，不重试、不立即写入媒体，也不代表本批成功'}

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
                  ('/schedule_cursors', self.schedule_cursors, 'GET', ScheduleCursorsResponse),
                  ('/schedule_resolve', self.schedule_resolve, 'POST', ScheduleResolveResponse),
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
        # 串行化配置和游标；固定本轮 ID 后再写入，避免改名改变跨批分页。
        with self.config_lock:
            if not self.config.enabled:
                return
            try:
                cursors = self.storage.get_schedule_cursors()
                for server in self.config.servers:
                    libraries = self.config.libraries.get(server, [])
                    if not libraries:
                        continue
                    cursor = cursors.get(server, {})
                    if cursor.get('pending'):
                        job_id = cursor.get('job_id')
                        job = next((r for r in self.tasks.views() if r['id'] == job_id), None)
                        if job and job.get('status') in {'queued', 'running'}:
                            continue
                        if not job or job.get('status') != 'complete':
                            logger.error(f'Emby刮削器：定时批次未成功或状态未确认，服务器 {server}；请核验任务与备份游标保持不动')
                            continue
                        # 成功结算才推进；保存失败立即停止后续工作。
                        cursor['position'] += len(cursor['pending'])
                        cursor['pending'] = []
                        cursor['job_id'] = None
                        self.storage.save_schedule_cursors(cursors)
                    index = int(cursor.get('library', 0)) % len(libraries)
                    library_id = libraries[index]
                    if cursor.get('version') != 2 or cursor.get('library_id') != library_id:
                        cursor = {'version': 2, 'library': index, 'library_id': library_id,
                                  'targets': None, 'position': 0, 'pending': [], 'job_id': None}
                    if cursor['targets'] is not None and cursor['position'] >= len(cursor['targets']):
                        index = (index + 1) % len(libraries)
                        library_id = libraries[index]
                        cursor = {'version': 2, 'library': index, 'library_id': library_id,
                                  'targets': None, 'position': 0, 'pending': [], 'job_id': None}
                    if cursor['targets'] is None:
                        # 旧 offset 不迁移，扫描完成前不入队任何写入。
                        api = self.api(server)
                        targets, seen, expected, offset = [], set(), None, 0
                        try:
                            while expected is None or offset < expected:
                                rows, total = api.items(library_id, '', offset, 500)
                                if expected is not None and total != expected:
                                    raise ValueError('定时扫描条目总数变化')
                                expected = total
                                if not rows and offset < expected:
                                    raise ValueError('定时扫描分页不完整')
                                for row in rows:
                                    ident = str(row.get('Id') or '')
                                    if not ident or ident in seen:
                                        raise ValueError('定时扫描 ID 缺失或重复')
                                    seen.add(ident)
                                    targets.append(ident)
                                offset += len(rows)
                                if offset > expected:
                                    raise ValueError('定时扫描数量超过总数')
                        finally:
                            self.cleanup(api)
                        cursor['targets'] = targets
                        cursors[server] = cursor
                        self.storage.save_schedule_cursors(cursors)
                    ids = cursor['targets'][cursor['position']:cursor['position'] + self.config.max_items]
                    if not ids:
                        continue
                    # 入队意图先落盘；崩溃遗留无 job_id 的 pending 禁止重放。
                    cursor['pending'] = ids
                    cursor['job_id'] = None
                    cursors[server] = cursor
                    self.storage.save_schedule_cursors(cursors)
                    try:
                        job = self.tasks.enqueue(server, ids, config_snapshot=asdict(self.config))
                    except ValueError as exc:
                        # 仅明确的入队前拒绝可撤销意图，未知或持久化失败不可重试。
                        if str(exc) not in {'工作线程已停止', '目标已有活动任务', '队列已满'}:
                            raise
                        cursor['pending'] = []
                        self.storage.save_schedule_cursors(cursors)
                        logger.error(f'Emby刮削器：定时批次明确未入队：{error_reason(exc)}；保留位置供后续调度')
                        continue
                    cursor['job_id'] = job['id']
                    self.storage.save_schedule_cursors(cursors)
            except Exception as exc:
                logger.error(f'Emby刮削器：定时扫描或持久化失败，停止本次调度：{error_reason(exc)}；请核验任务、游标与备份')

    def on_transfer(self, event):
        if not self.config.enabled or not self.config.auto_transfer:
            return
        identity = transfer_identity(event)
        if not identity:
            return
        # 类型与目标路径共同构成事件身份，同剧不同集不会互相吞掉事件。
        key = hashlib.sha256(json.dumps(identity, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:24]
        for server in self.config.servers:
            if self.config.libraries.get(server):
                try:
                    self.tasks.enqueue(server, ['transfer-' + key], transfer=identity, config_snapshot=asdict(self.config))
                except Exception as exc:
                    logger.error(f'Emby刮削器：整理任务入队失败，服务器 {server}：{error_reason(exc)}')

    def close(self):
        stopped = self.tasks.close()
        if stopped:
            self.cleanup(self.provider)
        return stopped
