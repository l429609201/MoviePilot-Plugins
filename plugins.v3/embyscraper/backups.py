"""本地操作备份：图片内容不进入 API，恢复必须检查写后快照。"""
import copy
import uuid
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from threading import RLock


class Backups:
    def __init__(self, plugin, storage=None, limit=1000):
        self.plugin = plugin
        self.storage = storage
        self.limit = max(100, min(10000, int(limit)))
        self.root = Path(plugin.get_data_path()).resolve() / 'operation-images'
        self.root.mkdir(parents=True, exist_ok=True)
        self.lock = RLock()
        self.rows = (storage.get_backups() if storage else plugin.get_data('backups')) or []
        if not isinstance(self.rows, list) or any(not isinstance(r, dict) or not isinstance(r.get('id'), str)
                                                 for r in self.rows):
            raise ValueError('备份索引无效，禁止执行写入')

    def persist(self):
        # 限值由 Backups 自己控制；存储层保持原输入，不二次截断。
        if self.storage:
            self.storage.save_backups(self.rows)
        else:
            self.plugin.save_data('backups', self.rows)

    def create(self, server, item, fields, images, api):
        """所有原图都成功读取后才提交备份，失败时绝不开始写入。"""
        if len(self.rows) >= self.limit:
            raise ValueError('备份已达上限，禁止新增写入')
        ident = uuid.uuid4().hex
        directory = self.root / ident
        blobs = {}
        row = {'id': ident, 'server': server, 'item_id': str(item['Id']),
               'title': str(item.get('Name') or ''), 'created_at': datetime.now(timezone.utc).isoformat(),
               'status': 'prepared', 'fields': {}, 'images': {}, 'after_fields': {}, 'after_images': {}}
        for key in fields:
            row['fields'][key] = {'present': key in item, 'value': copy.deepcopy(item.get(key))}
        for typ in images:
            tag = api.image_tag(item, typ)
            saved = {'tag': tag, 'present': bool(tag)}
            if tag:
                data, mime = api.image(item['Id'], typ)
                if not data or len(data) > 20 * 1024 * 1024:
                    raise ValueError('原图片备份失败')
                blobs[typ] = data
                saved['mime'] = mime
            row['images'][typ] = saved
        directory.mkdir()
        for typ, data in blobs.items():
            (directory / typ).write_bytes(data)
        with self.lock:
            self.rows.append(row)
            self.rows = self.rows[-self.limit:]
            self.persist()
        return row

    def checkpoint(self, row, item, api, fields=(), images=(), status='writing'):
        with self.lock:
            for key in fields:
                row['after_fields'][key] = {'present': key in item, 'value': copy.deepcopy(item.get(key))}
            for typ in images:
                row['after_images'][typ] = api.image_tag(item, typ)
            row['status'] = status
            self.persist()

    def get(self, ident):
        with self.lock:
            row = next((r for r in self.rows if r['id'] == ident), None)
            if not row:
                raise ValueError('备份不存在')
            return row

    def views(self):
        with self.lock:
            return [{k: r[k] for k in ('id', 'server', 'item_id', 'title', 'created_at', 'status')}
                    for r in reversed(self.rows)]

    def restore(self, ident, api, check):
        row = self.get(ident)
        if row['status'] not in ('complete', 'partial', 'writing'):
            raise ValueError('备份尚无可确认的写入，禁止盲目恢复')
        current = api.item(row['item_id'])
        for key, after in row['after_fields'].items():
            if {'present': key in current, 'value': current.get(key)} != after:
                raise ValueError('元数据已有新修改，拒绝恢复')
        for typ, tag in row['after_images'].items():
            if api.image_tag(current, typ) != tag:
                raise ValueError('图片已有新修改，拒绝恢复')
        # 编号字段恢复前核验目标位置，避免把已被其他分集占用的编号覆盖。
        if any(key in row['after_fields'] for key in ('IndexNumber', 'ParentIndexNumber')):
            series_id = current.get('SeriesId')
            if not series_id:
                raise ValueError('恢复编号缺少所属剧集，拒绝写入')
            target_season = row['fields'].get('ParentIndexNumber', {}).get('value', current.get('ParentIndexNumber'))
            target_episode = row['fields'].get('IndexNumber', {}).get('value', current.get('IndexNumber'))
            for sibling in api.series_episodes(series_id):
                if str(sibling.get('Id')) == str(row['item_id']):
                    continue
                if (sibling.get('ParentIndexNumber') == target_season
                        and sibling.get('IndexNumber') == target_episode):
                    raise ValueError('恢复编号与其他分集冲突，拒绝写入')

        for typ in row['after_images']:
            saved = row['images'][typ]
            if saved['present']:
                path = (self.root / row['id'] / typ).resolve()
                if self.root not in path.parents or path.is_symlink():
                    raise ValueError('备份路径不安全')
                data = path.read_bytes()
                if not data or len(data) > 20 * 1024 * 1024:
                    raise ValueError('备份图片无效')
                blobs[typ] = (data, saved['mime'])
        if row['after_fields']:
            for key in row['after_fields']:
                saved = row['fields'][key]
                if saved['present']:
                    current[key] = copy.deepcopy(saved['value'])
                else:
                    current[key] = [] if key in ('Genres', 'Studios', 'Tags', 'Taglines', 'People') else {} if key == 'ProviderIds' else None
            check()
            api.update(row['item_id'], current)
            verified = api.item(row['item_id'])
            for key in row['after_fields']:
                saved = row['fields'][key]
                expected = saved['value'] if saved['present'] else current[key]
                if verified.get(key) != expected:
                    raise ValueError('恢复元数据回读不一致')
        for typ in row['after_images']:
            check()
            if typ in blobs:
                api.upload(row['item_id'], typ, *blobs[typ])
            else:
                api.delete_image(row['item_id'], typ)
            tag = api.image_tag(api.item(row['item_id']), typ)
            if bool(tag) != row['images'][typ]['present']:
                raise ValueError('恢复图片回读不一致')
            if typ in blobs:
                restored, _ = api.image(row['item_id'], typ)
                if hashlib.sha256(restored).digest() != hashlib.sha256(blobs[typ][0]).digest():
                    raise ValueError('恢复图片内容回读不一致')
        with self.lock:
            row['status'] = 'restored'
            self.persist()
        return {'success': True}
