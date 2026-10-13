"""本地操作备份：图片内容不进入 API，恢复必须检查写后快照。"""
import copy
import uuid
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from threading import RLock
from .metadata import metadata_equal


class Backups:
    def __init__(self, plugin, storage=None, limit=1000):
        self.plugin = plugin
        self.storage = storage
        # 备份是恢复点，不设总数上限；历史配置值仅用于兼容旧数据，不再截断或拒绝写入。
        self.limit = max(1, int(limit))
        self.root = Path(plugin.get_data_path()).resolve() / 'operation-images'
        self.root.mkdir(parents=True, exist_ok=True)
        self.lock = RLock()
        self.rows = (storage.get_backups() if storage else plugin.get_data('backups')) or []
        if not isinstance(self.rows, list) or any(not isinstance(r, dict) or not isinstance(r.get('id'), str)
                                                 for r in self.rows):
            raise ValueError('备份索引无效，禁止执行写入')

    def persist(self, row=None):
        # 单个恢复点增量落盘，避免每个检查点重写全部历史备份。
        if self.storage and row is not None:
            self.storage.save_backup(row)
        elif self.storage:
            self.storage.save_backups(self.rows)
        else:
            self.plugin.save_data('backups', self.rows)

    def create(self, server, item, fields, images, api):
        """所有原图都成功读取后才提交备份，失败时绝不开始写入。"""
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
            self.persist(row)
        return row

    def checkpoint(self, row, item, api, fields=(), images=(), status='writing'):
        with self.lock:
            for key in fields:
                row['after_fields'][key] = {'present': key in item, 'value': copy.deepcopy(item.get(key))}
            for typ in images:
                row['after_images'][typ] = api.image_tag(item, typ)
            row['status'] = status
            self.persist(row)

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

    def restore_checkpoint(self, row, progress, pending=False):
        """先持久化未知标记再写远端，仅完整回读核验后允许继续恢复。"""
        with self.lock:
            candidate = copy.deepcopy(row)
            candidate['status'] = 'restore_unknown' if pending else 'restore_partial'
            candidate['restore_progress'] = copy.deepcopy(progress)
            # 落盘失败时不得把内存状态推进为可重试。
            row.update(candidate)
            try:
                self.persist(row)
            except Exception:
                row['status'] = 'restore_unknown'
                raise

    def restore(self, ident, api, check):
        row = self.get(ident)
        if row['status'] not in ('complete', 'partial', 'writing', 'restore_partial'):
            raise ValueError('备份尚无可确认的写入或恢复结果未知，禁止盲目恢复')
        # 已核验步骤单独记录；恢复中断发生在写后回读前时禁止自动重试。
        progress = copy.deepcopy(row.get('restore_progress') or {'fields': {}, 'images': {}})
        blobs = {}
        current = api.item(row['item_id'])
        for key, after in {**row['after_fields'], **progress['fields']}.items():
            if {'present': key in current, 'value': current.get(key)} != after:
                raise ValueError('元数据已有新修改，拒绝恢复')
        for typ, tag in {**row['after_images'], **progress['images']}.items():
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
        if row['after_fields'] and not progress['fields']:
            for key in row['after_fields']:
                saved = row['fields'][key]
                if saved['present']:
                    current[key] = copy.deepcopy(saved['value'])
                else:
                    current[key] = [] if key in ('Genres', 'Studios', 'Tags', 'Taglines', 'People') else {} if key == 'ProviderIds' else None
            check()
            self.restore_checkpoint(row, progress, pending=True)
            api.update(row['item_id'], current)
            expected_fields = {key: row['fields'][key]['value'] if row['fields'][key]['present'] else current[key]
                               for key in row['after_fields']}
            verified = api.item(row['item_id'])
            evidence = api.verify_metadata(verified, expected_fields)
            for key in row['after_fields']:
                saved = row['fields'][key]
                expected = saved['value'] if saved['present'] else current[key]
                if not metadata_equal(key, evidence.get(key), expected):
                    raise ValueError('恢复元数据回读不一致，字段：' + key)
            progress['fields'] = {key: {'present': key in verified, 'value': copy.deepcopy(verified.get(key))}
                                  for key in row['after_fields']}
            self.restore_checkpoint(row, progress)
        for typ in row['after_images']:
            if typ in progress['images']:
                continue
            check()
            self.restore_checkpoint(row, progress, pending=True)
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
            progress['images'][typ] = tag
            self.restore_checkpoint(row, progress)
        with self.lock:
            row['status'] = 'restored'
            self.persist(row)
        return {'success': True}
