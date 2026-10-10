"""整理事件仅按来源身份和路径定位已选媒体库，不按同名自动扩散。"""
from pathlib import PurePosixPath
from app.sdk.media import resolve_media_identity
from app.schemas import MediaSource


def value(obj, key):
    return obj.get(key) if isinstance(obj, dict) else getattr(obj, key, None)


def transfer_identity(event):
    payload = event.event_data
    info = value(payload, 'mediainfo')
    if not info:
        return None
    source, identity = resolve_media_identity(media=info)
    if source != MediaSource.TMDB or not identity:
        return None
    transfer = value(payload, 'transferinfo')
    if transfer and (value(transfer, 'success') is False or value(transfer, 'overwrite_skipped')):
        return None
    paths = value(transfer, 'file_list_new') or value(transfer, 'target_files') or []
    if not isinstance(paths, (list, tuple)):
        paths = []
    target = value(transfer, 'target_item')
    if not paths and value(target, 'path'):
        paths = [value(target, 'path')]
    return {'tmdb_id': str(identity), 'paths': [str(p).replace('\\', '/') for p in paths],
            'type': str(getattr(value(info, 'type'), 'value', value(info, 'type')))}


def find_transferred(runtime, api, server, identity, check):
    """最多三轮、每库 max_items；路径尚未映射时不猜测剧集。"""
    for attempt in range(3):
        check()
        if runtime.tasks.stop.wait(min(60, runtime.config.delay_seconds + attempt * 10)):
            check()
        found = []
        scanned = 0
        for library in runtime.config.libraries.get(server, []):
            rows, _ = api.items(library, '', 0, runtime.config.max_items - scanned,
                                sort_by='DateCreated', sort_order='Descending')
            scanned += len(rows)
            for item in rows:
                typ = item.get('Type')
                root = api.item(item['SeriesId']) if typ in ('Episode', 'Season') and item.get('SeriesId') else item
                ids = {str(k).lower(): str(v) for k, v in (root.get('ProviderIds') or {}).items()}
                if ids.get('tmdb') != identity['tmdb_id']:
                    continue
                paths = identity['paths']
                # 子项必须同时匹配整理结果路径，父级编号不足以确定集。
                if typ in ('Episode', 'Season') and not paths:
                    continue
                if paths and str(PurePosixPath(item.get('Path') or '')) not in {
                        str(PurePosixPath(p)) for p in paths}:
                    continue
                found.append(str(item['Id']))
            if scanned >= runtime.config.max_items:
                break
        if found:
            return found
    return []
