"""预览与执行共用同一差异规则；每次写入前核验停止令牌和目标快照。"""
import copy
from dataclasses import replace
from app.sdk.logging import logger
from .config import TYPES
from .execution_scope import inherited_locks
from .translation import language_status
from .actors import preserve_existing
from .episode_groups import EpisodeGroups
from .diagnostics import error_reason


def item_view(item):
    return {'id': str(item['Id']), 'title': item.get('Name') or '', 'type': item.get('Type'),
            'year': item.get('ProductionYear'), 'tmdb_id': (item.get('ProviderIds') or {}).get('Tmdb'),
            'locked': bool(item.get('LockData')), 'series_id': item.get('SeriesId'),
            'season': item.get('ParentIndexNumber'), 'episode': item.get('IndexNumber'),
            'has_children': item.get('Type') in {'Series', 'Season', 'Episode'},
            'overview': item.get('Overview') or ''}


class OperationError(Exception):
    def __init__(self, may_write=False, reason='操作未完成', backup_id=None):
        self.may_write = may_write
        self.backup_id = backup_id
        super().__init__(reason)


class Engine:
    def __init__(self, config, backups, provider, translator=None, mode=None):
        self.config = config
        self.backups = backups
        self.provider = provider
        self.translator = translator
        self.mode = mode
        self.image_overwrite = config.overwrite if mode is None else ('all' if mode in {'all', 'images'} else 'missing')
        if mode in {'missing', 'metadata', 'images', 'all'}:
            # 每个任务使用独立配置快照，模式不会污染全局 preferences。
            overwrite = 'all' if mode in {'metadata', 'all'} else 'missing'
            self.config = replace(config, overwrite=overwrite,
                                  fields=[] if mode == 'images' else config.fields,
                                  images=config.images,
                                  ai_translation=False if mode == 'images' else config.ai_translation,
                                  actor_ai_translation=False if mode == 'images' else config.actor_ai_translation,
                                  reindex_episodes=False if mode == 'images' else config.reindex_episodes)

    def scope(self, server, item, api):
        if server not in self.config.servers or not self.config.libraries.get(server):
            raise ValueError('请先配置服务器和媒体库范围')
        if item.get('Type') not in TYPES:
            raise ValueError('不支持该媒体类型')
        allowed = set(self.config.libraries[server])
        # 先用视图库查询确认，避免合法条目的实体父目录不可访问导致误拒绝。
        if any(api.contains(library_id, item.get('Id')) for library_id in allowed):
            return
        current = item
        seen = set()
        for _ in range(32):
            ident = str(current.get('Id', ''))
            if ident in allowed:
                return
            parent = str(current.get('ParentId') or '')
            if parent in allowed:
                return
            if not parent or parent in seen:
                break
            seen.add(parent)
            current = api.item(parent)
        raise ValueError('目标不属于已配置媒体库')

    def preview(self, server, item_id, api, override=None):
        logger.info(f"Emby刮削器：读取条目 {item_id} 并生成预览")
        item = api.item(item_id)
        self.scope(server, item, api)
        resolution_item = copy.deepcopy(item)
        group_mapping = None
        group_warnings = []
        if item.get('Type') == 'Season' and not self.config.include_specials and item.get('IndexNumber') == 0:
            raise ValueError('配置排除了特别篇季')
        if item.get('Type') == 'Episode':
            origins = self.backups.plugin.get_data('episode_origins') or {}
            saved_origin = origins.get(server, {}).get(str(item_id))
            if saved_origin:
                if saved_origin.get('series_id') != str(item.get('SeriesId')):
                    raise ValueError('持久原定位与父剧集不一致')
                resolution_item['ParentIndexNumber'] = saved_origin['season']
                resolution_item['IndexNumber'] = saved_origin['episode']
            if not self.config.include_specials and resolution_item.get('ParentIndexNumber') == 0:
                raise ValueError('配置排除了特别篇')
            if self.config.episode_group_mode != 'aired':
                groups = EpisodeGroups(self.config, self.provider, self.backups.plugin)
                groups.server = server
                series, _ = groups.context(item, api)
                self.scope(server, series, api)
                selected = groups.selected(item, api)
                if not selected:
                    raise ValueError('未选择唯一可靠的剧集组')
                plan = groups.preview(item, api, selected)
                if override is not None and str(override) != plan['series_tmdb_id']:
                    raise ValueError('手动父剧集 ID 与所选剧集组不一致')
                group_mapping = next((r for r in plan['mappings'] if r['item_id'] == str(item_id)), None)
                if not group_mapping or not group_mapping['matched_by']:
                    raise ValueError('剧集组无法匹配该分集')
                # 元数据始终从原播出季集读取，不能拿目标编号读取另一集。
                resolution_item['ParentIndexNumber'] = group_mapping['original_season']
                resolution_item['IndexNumber'] = group_mapping['original_episode']
                group_warnings = plan['warnings']
        derived = self.provider.resolve(resolution_item, api, override)
        if group_mapping and str((derived.get('fields', {}).get('ProviderIds') or {}).get('Tmdb')) != group_mapping['tmdb_episode_id']:
            raise ValueError('TMDB 原播出定位与剧集组分集 ID 不一致')
        blocked_group = bool(group_mapping and not group_mapping['can_apply'])
        # 子项继承父剧集写入锁，避免递归范围绕过 Series 的锁定策略。
        inherited_locked, inherited_fields = inherited_locks(self.config, item, api)
        locked = inherited_locked or not derived['reliable'] or blocked_group
        locks = set(inherited_fields)
        fields = []
        # 编号不属于通用字段白名单，只能由已核验的组映射产生。
        for key in (f for f in self.config.fields if f not in {'IndexNumber', 'ParentIndexNumber'}):
            after = copy.deepcopy(derived['fields'].get(key))
            before = copy.deepcopy(item.get(key))
            if key == 'ProviderIds' and after:
                after = {**(before or {}), **after}
                if self.config.overwrite == 'missing':
                    after = {**after, **(before or {})}
            apply = (not locked and key not in locks and key.replace('CommunityRating', 'Rating') not in locks
                     and after not in (None, '', [], {}) and after != before
                     and (self.config.overwrite == 'all' or before in (None, '', [], {})
                          or key == 'ProviderIds'))
            fields.append({'field': key, 'before': before, 'after': after, 'apply': apply, 'source': 'tmdb'})
        if group_mapping and self.config.reindex_episodes:
            for key, value in [('IndexNumber', group_mapping['target_episode']),
                               ('ParentIndexNumber', group_mapping['target_season'])]:
                fields.append({'field': key, 'before': item.get(key), 'after': value,
                               'apply': not locked and key not in locks and item.get(key) != value,
                               'source': 'episode_group'})
        warnings = group_warnings
        if group_mapping:
            warnings = warnings + ['剧集组编号转换必须经手动任务明确确认；不移动物理文件']
        target = derived.get('language') or self.config.language
        translation = {'language': target, 'enabled': self.config.ai_translation,
                       'actor_enabled': self.config.actor_ai_translation, 'fields': []}
        if self.config.ai_translation:
            selected = {}
            allowed = {'Overview', 'Taglines'}
            if item.get('Type') == 'Episode' or self.config.translate_titles:
                allowed.add('Name')
            for row in fields:
                if not row['apply'] or row['field'] not in allowed:
                    continue
                status = language_status(row['after'], target, (derived.get('field_languages') or {}).get(row['field']))
                if status == 'foreign':
                    selected[row['field']] = row['after']
                elif status == 'unknown':
                    row['apply'] = False
                    warnings.append('无法保守确认目标语言，已保留源文并跳过字段：' + row['field'])
            if selected:
                if self.translator:
                    translated, notes, failed = self.translator.translate(selected, target, item.get('Type'))
                else:
                    translated, notes, failed = {}, ['AI 翻译不可用，已保留源文并跳过相关字段'], set(selected)
                warnings.extend(notes)
                for row in fields:
                    key = row['field']
                    if key in translated:
                        row['after'] = translated[key]
                        row['source'] = 'ai_translation'
                        row['apply'] = row['after'] != row['before']
                        translation['fields'].append(key)
                    if key in failed:
                        row['apply'] = False
        # 缺失模式只汉化现有人员，禁止借姓名汉化替换整份名单和角色。
        people_writable = (derived['reliable'] and not locked and 'People' not in locks)
        actor_report = {'enabled': self.config.actor_localization, 'checked': False,
                        'changed_names': 0, 'reason': '未选择演员字段或演员字段已锁定'}
        translation['actors'] = actor_report
        if self.config.actor_localization and str(target).lower().startswith('zh') and people_writable:
            for row in fields:
                if row['field'] != 'People':
                    continue
                if self.config.overwrite == 'missing' and row['before']:
                    row['after'] = copy.deepcopy(row['before'])
                # 即使源名单与当前相同，仍需查询人物中文名；先查询再判断差异。
                row['apply'] = bool(row['after'])
                actor_report['checked'] = True
                actor_report['reason'] = '未找到可确认的新中文姓名，保留现有人员'
        if self.config.actor_localization and str(target).lower().startswith('zh'):
            for row in fields:
                if row['field'] == 'People' and row['apply']:
                    row['after'] = preserve_existing(row['after'], item.get('People'))
                    localize = getattr(self.provider, 'localize_people', None)
                    if callable(localize):
                        row['after'], notes = localize(row['after'])
                        warnings.extend(note for note in notes if note not in warnings)
                    row['apply'] = row['after'] != row['before']
        # 人名音译与简介翻译独立；仅处理真正可写入的 People，避免锁定/图片任务收费。
        if (self.config.actor_localization and self.config.actor_ai_translation
                and str(target).lower().startswith('zh')):
            for row in fields:
                if row['field'] != 'People' or not actor_report['checked'] or not row['after']:
                    continue
                for person in row['after']:
                    name = person.get('Name') or ''
                    if person.get('Type') != 'Actor' or not name or language_status(name, 'zh') == 'target':
                        continue
                    ident = (person.get('ProviderIds') or {}).get('Tmdb')
                    if not ident:
                        continue
                    if self.translator:
                        translated, note = self.translator.translate_actor(name, target, str(ident))
                        if translated:
                            person['Name'] = translated
                            row['source'] = 'tmdb+ai_actor_translation'
                            if 'People' not in translation['fields']:
                                translation['fields'].append('People')
                        if note and note not in warnings:
                            warnings.append(note)
                    elif '演员 AI 翻译不可用，已保留原名' not in warnings:
                        warnings.append('演员 AI 翻译不可用，已保留原名')
                row['apply'] = row['after'] != row['before']
        for row in fields:
            if row['field'] == 'People' and actor_report['checked']:
                before_names = {(str((p.get('ProviderIds') or {}).get('Tmdb')), p.get('Type'), p.get('Name'))
                                for p in row['before'] or []}
                actor_report['changed_names'] = sum(
                    (str((p.get('ProviderIds') or {}).get('Tmdb')), p.get('Type'), p.get('Name')) not in before_names
                    for p in row['after'] or [])
                if actor_report['changed_names']:
                    actor_report['reason'] = '人员名单或姓名存在候选变化，是否包含中文姓名及实际写入以预览和任务结果为准'
        images = []
        for typ in self.config.images:
            before = api.image_tag(item, typ)
            after = derived.get('images', {}).get(typ)
            apply = (not locked and 'Images' not in locks and typ not in locks and bool(after)
                     and (self.image_overwrite == 'all' or not before))
            images.append({'type': typ, 'before': before, 'after': after, 'apply': apply})
        public = {'item': item_view(item), 'title': item.get('Name') or '',
                  'match': {k: derived[k] for k in ('tmdb_id', 'method', 'reliable')},
                  'episode_group': group_mapping,
                  'fields': fields, 'images': images, 'translation': translation,
                  'warnings': ['本插件只通过 Emby API 更新条目，不直接修改 NFO；文件同步取决于 Emby 媒体库设置'] + warnings +
                              (['目标已锁定，未选择任何写入'] if locked else [])}
        return public, item

    def execute(self, server, item_id, api, check, override=None, confirmed=False):
        # 调用方仅给选中的根条目传 override；季/集表示所属剧集 ID。
        preview, original = self.preview(server, item_id, api, override)
        if not preview['match']['reliable']:
            raise ValueError('匹配不可靠，拒绝写入')
        fields = [f for f in preview['fields'] if f['apply']]
        if preview.get('episode_group') and self.config.reindex_episodes and confirmed is not True:
            raise ValueError('剧集组转换必须明确确认')
        images = [i for i in preview['images'] if i['apply']]
        if not fields and not images:
            return {'item_id': item_id, 'emby_id': str(item_id), 'checked': True, 'written': False,
                    'status': 'skipped', 'title': preview['title'],
                    'reason': '当前模式、锁定或覆盖策略下没有可执行写入', 'warnings': preview['warnings'],
                    'translation': preview['translation']}
        # 下载与备份全部成功后才开始任何副作用。
        downloads = {i['type']: self.provider.download(i['after']) for i in images}
        row = self.backups.create(server, original, [f['field'] for f in fields],
                                  [i['type'] for i in images], api)
        logger.info(f"Emby刮削器：条目 {item_id} 开始写入，字段 {len(fields)} 项，图片 {len(images)} 张")
        check()
        current = api.item(item_id)
        # 父级锁也可能在预览后变化，写前重新核验而非只看当前条目。
        current_locked, current_locks = inherited_locks(self.config, current, api)
        if current_locked or any(f['field'] in current_locks for f in fields) or (
                images and ('Images' in current_locks or any(i['type'] in current_locks for i in images))):
            raise ValueError('预览后目标或父级已锁定拒绝写入')
        keys = {f['field'] for f in fields} | {'Id', 'Type', 'ParentId', 'SeriesId', 'ProviderIds', 'LockData', 'LockedFields',
                                                'IndexNumber', 'ParentIndexNumber'}
        if any(current.get(k) != original.get(k) for k in keys) or any(
                api.image_tag(current, i['type']) != i['before'] for i in images):
            raise ValueError('预览后媒体已变化，拒绝写入')
        if any(f['field'] in {'IndexNumber', 'ParentIndexNumber'} for f in fields):
            # 写前再次读取全部兄弟项，目标不得被其它媒体占用；原定位先落盘保证重复执行稳定。
            mapping = preview['episode_group']
            siblings = api.series_episodes(str(original.get('SeriesId')))
            observed = next((i for i in siblings if str(i['Id']) == str(item_id)), None)
            container = api.item(original.get('ParentId') or '')
            if (observed is None or any(observed.get(k) != original.get(k) for k in
                                      ('ParentId', 'SeriesId', 'ProviderIds', 'IndexNumber', 'ParentIndexNumber'))
                    or container.get('Type') != 'Season' or container.get('IndexNumber') != mapping['target_season']
                    or str(container.get('SeriesId') or container.get('ParentId')) != str(original.get('SeriesId'))):
                raise ValueError('执行前分集或季容器已变化')
            if any(str(i['Id']) != str(item_id) and i.get('ParentIndexNumber') == mapping['target_season']
                   and i.get('IndexNumber') == mapping['target_episode'] for i in siblings):
                raise ValueError('目标编号在执行前已占用')
            with self.backups.lock:
                origins = self.backups.plugin.get_data('episode_origins') or {}
                origins.setdefault(server, {}).setdefault(str(item_id), {
                    'season': mapping['original_season'], 'episode': mapping['original_episode'],
                    'series_id': str(original.get('SeriesId'))})
                self.backups.plugin.save_data('episode_origins', origins)
        may_write = False
        try:
            if fields:
                payload = copy.deepcopy(current)
                for f in fields:
                    payload[f['field']] = f['after']
                check()
                self.backups.checkpoint(row, current, api, status='unknown')
                may_write = True
                api.update(item_id, payload)
                verified = api.item(item_id)
                self.backups.checkpoint(row, verified, api, fields=[f['field'] for f in fields])
                if any(verified.get(f['field']) != f['after'] for f in fields):
                    raise ValueError('元数据写入回读不一致')
                current = verified
            for image in images:
                typ = image['type']
                check()
                latest = api.item(item_id)
                if api.image_tag(latest, typ) != image['before']:
                    raise ValueError('图片在执行前已变化，拒绝覆盖')
                self.backups.checkpoint(row, current, api, status='unknown')
                may_write = True
                api.upload(item_id, typ, *downloads[typ])
                verified = api.item(item_id)
                self.backups.checkpoint(row, verified, api, images=[typ])
                tag = api.image_tag(verified, typ)
                downloaded, _ = api.image(item_id, typ)
                if downloaded != downloads[typ][0]:
                    raise ValueError('图片写入内容回读未确认')
                if not tag:
                    raise ValueError('图片写入回读未确认')
            self.backups.checkpoint(row, current, api, status='complete')
        except Exception as exc:
            # 保存检查点失败也不得覆盖可能已写入的安全分类。
            reason = error_reason(exc)
            try:
                self.backups.checkpoint(row, current, api, status='unknown' if may_write else 'prepared')
            except Exception:
                logger.error('Emby刮削器：异常检查点保存失败，请核验备份和媒体')
            if not may_write:
                raise
            raise OperationError(may_write=True, reason=reason, backup_id=row['id']) from None
        return {'item_id': item_id, 'emby_id': str(item_id), 'checked': True, 'written': True,
                'status': 'complete', 'title': preview['title'], 'backup_id': row['id'],
                'warnings': preview['warnings'], 'translation': preview['translation']}
