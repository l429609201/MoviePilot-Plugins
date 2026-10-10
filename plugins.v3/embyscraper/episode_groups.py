"""剧集组纯映射与全系列校验，不移动文件或猜测 Emby 容器归属。"""
import re


def number(value, minimum=0):
    if isinstance(value, bool) or not re.fullmatch(r'\d+', str(value)) or int(value) < minimum:
        raise ValueError('剧集组编号无效')
    return int(value)


def provider_id(item, key):
    return next((str(v) for k, v in (item.get('ProviderIds') or {}).items()
                 if k.casefold() == key.casefold() and v), None)


def flatten(groups):
    """TMDB 集 order 为零基；季 order 原样保留，拒绝重复 ID 和定位。"""
    if not isinstance(groups, list) or any(not isinstance(group, dict) for group in groups):
        raise ValueError('剧集组季列表无效')
    rows, ids, originals, targets, seasons = [], set(), set(), set(), set()
    for group in groups:
        season = number(group.get('order'))
        if season in seasons:
            raise ValueError('剧集组季编号重复')
        seasons.add(season)
        episodes = group.get('episodes')
        if not isinstance(episodes, list) or any(not isinstance(e, dict) for e in episodes):
            raise ValueError('剧集组分集列表无效')
        for episode in episodes:
            ident = str(number(episode.get('id'), 1))
            original = (number(episode.get('season_number')), number(episode.get('episode_number'), 1))
            target = (season, number(episode.get('order')) + 1)
            if ident in ids or original in originals or target in targets:
                raise ValueError('剧集组包含重复 ID 或季集定位')
            ids.add(ident)
            originals.add(original)
            targets.add(target)
            rows.append({'tmdb_episode_id': ident, 'original_season': original[0],
                         'original_episode': original[1], 'target_season': target[0], 'target_episode': target[1]})
    if not rows:
        raise ValueError('剧集组为空')
    return rows


def mappings(items, groups, include_specials=True, origins=None):
    """自身 TMDB ID 优先；缺 ID 时仅用原播出定位，目标占用及跨季均阻断。"""
    rows = flatten(groups)
    by_id = {r['tmdb_episode_id']: r for r in rows}
    by_original = {(r['original_season'], r['original_episode']): r for r in rows}
    occupied, item_ids = {}, set()
    for item in items:
        ident = str(item['Id'])
        if ident in item_ids:
            raise ValueError('Emby 全系列读取包含重复条目')
        item_ids.add(ident)
        pos = (number(item.get('ParentIndexNumber')), number(item.get('IndexNumber'), 1))
        occupied.setdefault(pos, []).append(ident)
    result = []
    used = set()
    for item in items:
        ident = str(item['Id'])
        existing_id = provider_id(item, 'Tmdb')
        origin = (origins or {}).get(ident)
        if origin and origin.get('series_id') != str(item.get('SeriesId')):
            raise ValueError('持久原定位与父剧集不一致')
        original = ((number(origin['season']), number(origin['episode'], 1)) if origin else
                    (number(item.get('ParentIndexNumber')), number(item.get('IndexNumber'), 1)))
        row = by_id.get(existing_id) if existing_id else by_original.get(original)
        reason = ''
        if row is None:
            reason = 'unmatched'
        elif not include_specials and row['original_season'] == 0:
            reason = 'specials_excluded'
        elif row['target_season'] != number(item.get('ParentIndexNumber')):
            reason = 'needs_relocation'
        elif any(other != ident for other in occupied.get((row['target_season'], row['target_episode']), [])):
            reason = 'target_occupied'
        if row:
            if row['tmdb_episode_id'] in used:
                raise ValueError('多个 Emby 条目匹配同一个 TMDB 分集')
            used.add(row['tmdb_episode_id'])
        result.append({'item_id': ident, 'title': item.get('Name') or '',
                       **(row or {'original_season': original[0], 'original_episode': original[1],
                                  'target_season': None, 'target_episode': None}),
                       'matched_by': 'tmdb_id' if existing_id and row else 'aired' if row else None,
                       'can_apply': not bool(reason), 'reason': reason,
                       'needs_relocation': reason == 'needs_relocation'})
    return result


class EpisodeGroups:
    def __init__(self, config, provider, store=None):
        self.config, self.provider, self.store = config, provider, store

    def context(self, item, api):
        if item.get('Type') == 'Series':
            series = item
        else:
            series_id = item.get('SeriesId') or item.get('ParentSeriesId')
            if not series_id and item.get('ParentId'):
                parent = api.item(item['ParentId'])
                series_id = parent.get('Id') if parent.get('Type') == 'Series' else parent.get('SeriesId') or parent.get('ParentId')
            if not series_id:
                raise ValueError('缺少父剧集')
            series = api.item(series_id)
        if series.get('Type') != 'Series' or not provider_id(series, 'Tmdb'):
            raise ValueError('剧集组需要父剧集 TMDB ID')
        return series, str(number(provider_id(series, 'Tmdb'), 1))

    def list(self, item, api):
        series, tmdb_id = self.context(item, api)
        groups = self.provider.episode_groups(int(tmdb_id))
        if not isinstance(groups, list) or any(not isinstance(g, dict) or not re.fullmatch(
                r'[A-Za-z0-9_-]{1,128}', str(g.get('id') or '')) for g in groups):
            raise ValueError('剧集组列表无效')
        selected = self.config.episode_group_bindings.get(tmdb_id) or provider_id(series, 'TmdbEg')
        return {'series_tmdb_id': tmdb_id, 'groups': groups, 'selected_group_id': selected}

    def preview(self, item, api, group_id):
        series, tmdb_id = self.context(item, api)
        available = self.provider.episode_groups(int(tmdb_id))
        if group_id not in {str(g['id']) for g in available}:
            raise ValueError('剧集组不属于该剧集')
        items = api.series_episodes(str(series['Id']))
        # 原定位按服务器隔离，由引擎在任何编号写入前持久化。
        origins = (self.store.get_data('episode_origins') or {}) if self.store else {}
        server_origins = origins.get(getattr(self, 'server', ''), {})
        for entry in items:
            if str(entry.get('SeriesId') or entry.get('ParentSeriesId')) != str(series['Id']):
                raise ValueError('全系列条目父剧集关联不一致')
        rows = mappings(items, self.provider.group_episodes(group_id), self.config.include_specials, server_origins)
        for item, row in zip(items, rows):
            locks = set(item.get('LockedFields') or [])
            if self.config.respect_locked and (item.get('LockData') or locks & {'IndexNumber', 'ParentIndexNumber'}):
                row['can_apply'] = False
                row['reason'] = row['reason'] or 'locked'
        if self.config.reindex_episodes:
            containers = {}
            for item, row in zip(items, rows):
                if not row['can_apply']:
                    continue
                parent_id = str(item.get('ParentId') or '')
                if parent_id not in containers:
                    containers[parent_id] = api.item(parent_id)
                parent = containers[parent_id]
                if (parent.get('Type') != 'Season' or parent.get('IndexNumber') != row['target_season']
                        or str(parent.get('SeriesId') or parent.get('ParentId')) != str(series['Id'])):
                    row['can_apply'] = False
                    row['reason'] = 'unverified_season_container'
        warnings = []
        if any(r['reason'] == 'unverified_season_container' for r in rows):
            warnings.append('未确认既有季容器归属，禁止编号及元数据写入')
        if any(r['reason'] == 'needs_relocation' for r in rows):
            warnings.append('跨季映射需要更改 Emby 季容器归属，首期仅预览，不执行编号和元数据写入')
        if any(r['reason'] == 'target_occupied' for r in rows):
            warnings.append('目标位置已占用；首期不执行交换或非原子批量重排')
        return {'series_tmdb_id': tmdb_id, 'group_id': group_id, 'mappings': rows, 'warnings': warnings}

    def selected(self, item, api):
        listing = self.list(item, api)
        selected = listing['selected_group_id']
        if selected:
            return selected
        if self.config.episode_group_mode != 'auto':
            return None
        scores = []
        for group in listing['groups']:
            try:
                rows = self.preview(item, api, str(group['id']))['mappings']
                eligible = [r for r in rows if self.config.include_specials or r['original_season'] != 0]
                score = sum(r['matched_by'] is not None for r in eligible) / len(eligible) if eligible else 0
                if score > 0 and score >= self.config.match_threshold:
                    scores.append((score, str(group['id'])))
            except ValueError:
                continue
        scores.sort(reverse=True)
        return scores[0][1] if scores and (len(scores) == 1 or scores[0][0] > scores[1][0]) else None
