"""写前只读范围规划：流式分页快照，去重和父级锁继承。"""
from .config import TYPES



def iter_items(api, parent, search='', check=lambda: None):
    """逐页读取条目并返回 (条目, 当前总数)，避免一次性阻塞大媒体库扫描。"""
    seen, expected = set(), None
    while expected is None or len(seen) < expected:
        check()
        batch, total = api.items(parent, search, len(seen), 500)
        if not isinstance(total, int) or total < 0 or (expected is not None and total != expected):
            raise ValueError('分页总数已变化，请重新扫描')
        expected = total
        if not isinstance(batch, list) or (not batch and len(seen) < total):
            raise ValueError('范围分页不完整，请重新扫描')
        for item in batch:
            ident = str(item.get('Id') or '')
            if not ident or ident in seen or item.get('Type') not in TYPES:
                raise ValueError('范围条目身份重复或无效，请重新扫描')
            seen.add(ident)
            yield item, expected
        if len(seen) > total:
            raise ValueError('范围分页数量不一致，请重新扫描')


def enumerate_items(api, parent, search='', check=lambda: None):
    return [item for item, _ in iter_items(api, parent, search, check)]


def plan_selected(engine, server, api, ids, recursive=True):
    output = {}
    roots = [api.item(ident) for ident in ids]
    for item in roots:
        engine.scope(server, item, api)
        output[str(item['Id'])] = item
    if recursive:
        # items 已递归返回全部后代，不能再将每季加入队列重复扫描。
        containers = {str(item['Id']): item for item in roots
                      if item.get('Type') in {'Series', 'Season'}}
        for parent_id, parent in containers.items():
            if parent.get('Type') == 'Season' and str(parent.get('SeriesId') or '') in containers:
                continue
            for child in enumerate_items(api, parent_id):
                if not descendant(api, child, parent_id):
                    raise ValueError('递归范围包含其它根目录条目')
                ident = str(child['Id'])
                if ident in output:
                    continue
                engine.scope(server, child, api)
                output[ident] = child
    return list(output)


def descendant(api, item, root):
    current, seen = item, set()
    for _ in range(32):
        if str(current.get('Id') or '') == root:
            return True
        parent = str(current.get('ParentId') or '')
        if parent == root:
            return True
        if not parent or parent in seen:
            return False
        seen.add(parent)
        current = api.item(parent)
    return False


def inherited_locks(config, item, api):
    if not config.respect_locked:
        return False, set()
    locked, fields = bool(item.get('LockData')), set(item.get('LockedFields') or [])
    if item.get('Type') in {'Season', 'Episode'}:
        series_id = str(item.get('SeriesId') or '')
        if series_id:
            series = api.item(series_id)
            if series.get('Type') != 'Series':
                raise ValueError('父剧集身份无效')
            locked |= bool(series.get('LockData'))
            fields.update(series.get('LockedFields') or [])
    if item.get('Type') == 'Episode':
        # 分集同时继承直接父季和父剧集锁，缺少父季身份时不能绕过保护。
        season_id = str(item.get('SeasonId') or item.get('ParentId') or '')
        if not season_id:
            raise ValueError('缺少父季身份，无法核验继承锁')
        season = api.item(season_id)
        if (season.get('Type') != 'Season'
                or str(season.get('SeriesId') or season.get('ParentId') or '') != str(item.get('SeriesId') or '')):
            raise ValueError('父季身份无效')
        locked |= bool(season.get('LockData'))
        fields.update(season.get('LockedFields') or [])
    return locked, fields
