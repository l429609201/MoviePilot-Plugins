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
    # TMDB 电影和剧集编号属于不同命名空间，未知类型不自动写入。
    media_type = str(identity.get('type') or '').lower()
    kinds = ({'Movie'} if media_type in {'电影', 'movie'} else
             {'Series', 'Season', 'Episode'} if media_type in {'电视剧', 'tv', 'series'} else set())
    if not kinds:
        return []
    paths = {str(PurePosixPath(p)) for p in identity.get('paths', [])}
    found, seen, matched_paths = [], set(), set()
    for attempt in range(3):
        check()
        if runtime.tasks.stop.wait(min(60, runtime.config.delay_seconds + attempt * 10)):
            check()
        for library in runtime.config.libraries.get(server, []):
            # 每库独立限制，不能让首库耗尽预算而永久饿死后续库。
            rows, _ = api.items(library, '', 0, runtime.config.max_items,
                                sort_by='DateCreated', sort_order='Descending')
            for item in rows:
                typ = item.get('Type')
                if typ not in kinds:
                    continue
                root = api.item(item['SeriesId']) if typ in ('Episode', 'Season') and item.get('SeriesId') else item
                if typ in ('Episode', 'Season') and root.get('Type') != 'Series':
                    continue
                ids = {str(k).lower(): str(v) for k, v in (root.get('ProviderIds') or {}).items()}
                if ids.get('tmdb') != identity['tmdb_id']:
                    continue
                # 子项必须同时匹配整理结果路径，父级编号不足以确定集。
                if typ in ('Episode', 'Season') and not paths:
                    continue
                path = str(PurePosixPath(item.get('Path') or ''))
                if paths and path not in paths:
                    continue
                if paths:
                    matched_paths.add(path)
                ident = str(item['Id'])
                # 视图库可能重叠，同一真实条目每轮只返回一次。
                if ident not in seen:
                    seen.add(ident)
                    found.append(ident)
        # 多文件事件不能因首轮只找到一集便提前成功；全部路径匹配后才执行。
        if found and (not paths or matched_paths == paths):
            return found
    if found:
        raise ValueError('整理目标仅部分入库，等待范围内全部路径可定位后再执行')
    return []
