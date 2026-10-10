"""写前只读范围规划：完整分页快照，去重和父级锁继承。"""
from .config import TYPES

MAX_TARGETS = 10000


def enumerate_items(api, parent, search='', check=lambda: None):
    output, seen, expected = [], set(), None
    while expected is None or len(output) < expected:
        check()
        batch, total = api.items(parent, search, len(output), 500)
        if total < 0 or total > MAX_TARGETS or (expected is not None and total != expected):
            raise ValueError('范围超过 10000 项或分页总数已变化，请拆分范围后重试')
        expected = total
        if not isinstance(batch, list) or (not batch and len(output) < total):
            raise ValueError('范围分页不完整，请重新扫描')
        for item in batch:
            ident = str(item.get('Id') or '')
            if not ident or ident in seen or item.get('Type') not in TYPES:
                raise ValueError('范围条目身份重复或无效，请重新扫描')
            seen.add(ident)
            output.append(item)
        if len(output) > total:
            raise ValueError('范围分页数量不一致，请重新扫描')
    return output


def plan_selected(engine, server, api, ids, recursive=True):
    output = {}
    roots = [api.item(ident) for ident in ids]
    for item in roots:
        engine.scope(server, item, api)
        output[str(item['Id'])] = item
    if recursive:
        # 递归只针对本次选中的根；Movie、Episode 等非容器不展开。
        queue = [item for item in roots if item.get('Type') in {'Series', 'Season'}]
        visited = {str(item['Id']) for item in roots}
        while queue:
            parent = queue.pop(0)
            for child in enumerate_items(api, str(parent['Id'])):
                if not any(descendant(api, child, str(root['Id'])) for root in roots):
                    raise ValueError('递归范围包含其它根目录条目')
                engine.scope(server, child, api)
                output[str(child['Id'])] = child
                if len(output) > MAX_TARGETS:
                    raise ValueError('范围超过 10000 项，请拆分范围后重试')
                if child.get('Type') in {'Series', 'Season'} and str(child['Id']) not in visited:
                    visited.add(str(child['Id']))
                    queue.append(child)
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
    return locked, fields
