"""串行持久化工作队列，中断或未知写入不自动重试。"""
import copy
import uuid
from datetime import datetime, timezone
from threading import Condition, Event, RLock, Thread
from app.sdk.logging import logger
from .engine import OperationError


class Cancelled(Exception):
    pass


class Tasks:
    def __init__(self, plugin, execute, delay=0, storage=None, stream=None):
        self.plugin = plugin
        self.storage = storage
        self.execute = execute
        self.stream = stream
        self.delay = delay
        self.lock = RLock()
        self.condition = Condition(self.lock)
        self.stop = Event()
        self.rows = (storage.get_jobs() if storage else plugin.get_data('jobs')) or []
        for row in self.rows:
            if row.get('status') in ('running', 'queued'):
                row['status'] = 'interrupted'
                row['error'] = '上次运行中断，请检查备份；不会自动重新写入'
        self.persist()
        self.thread = Thread(target=self.run, name='EmbyScraperWorker', daemon=True)
        self.thread.start()

    def persist(self):
        # 任务记录保留完整列表，历史截断只在存储层处理。
        if self.storage:
            self.storage.save_jobs(self.rows)
        else:
            self.plugin.save_data('jobs', self.rows)

    def enqueue(self, server, item_ids, source='tmdb', tmdb_id=None, restore_id=None, transfer=None, confirmed=False, mode=None, recursive=True, scope=None, config_snapshot=None, stream=False):
        with self.condition:
            if self.stop.is_set():
                raise ValueError('工作线程已停止')
            for existing in self.rows:
                if existing['status'] not in ('queued', 'running') or existing['server'] != server:
                    continue
                if stream and existing.get('stream') and existing.get('scope') == scope:
                    raise ValueError('该媒体库已有活动流式任务')
                if set(existing['item_ids']) & set(item_ids):
                    raise ValueError('目标已有活动任务')
            if sum(r['status'] in ('queued', 'running') for r in self.rows) >= 20:
                raise ValueError('队列已满')
            if len(self.rows) >= 100:
                self.rows = [r for r in self.rows if r['status'] in ('queued', 'running')] + [
                    r for r in self.rows if r['status'] not in ('queued', 'running')][-79:]
            row = {'id': uuid.uuid4().hex, 'status': 'queued', 'server': server,
                   'item_ids': list(dict.fromkeys(item_ids)), 'source': source, 'tmdb_id': tmdb_id,
                   'restore_id': restore_id, 'transfer': transfer, 'confirmed': confirmed is True,
                   'mode': mode, 'recursive': recursive, 'scope': scope,
                   'config_snapshot': copy.deepcopy(config_snapshot),
                   'stream': stream is True, 'phase': 'scanning' if stream else 'scraping',
                   'scanned': 0, 'total': None if stream else len(set(item_ids)), 'completed': 0,
                   'results': [], 'error': None, 'created_at': datetime.now(timezone.utc).isoformat()}
            self.rows.append(row)
            self.persist()
            self.condition.notify()
            logger.info(f"Emby刮削器：任务 {row['id'][:8]} 已入队，服务器 {server}，目标 {len(row['item_ids'])} 项")
            return self.view(row)

    @staticmethod
    def view(row):
        return copy.deepcopy({k: row.get(k) for k in ('id', 'status', 'server', 'item_ids', 'total',
                                                     'completed', 'scanned', 'phase', 'stream',
                                                     'results', 'error', 'created_at', 'mode', 'recursive', 'scope', 'config_snapshot')})

    def views(self):
        with self.lock:
            return [self.view(r) for r in reversed(self.rows)]

    def get(self, ident):
        row = next((r for r in self.rows if r['id'] == ident), None)
        if not row:
            raise ValueError('任务不存在')
        return row

    def cancel(self, ident):
        with self.condition:
            row = self.get(ident)
            if row['status'] in ('queued', 'running'):
                row['status'] = 'cancelled'
                self.persist()
            self.condition.notify()

    def retry(self, ident):
        with self.lock:
            row = self.get(ident)
            if row.get('restore_id') or row['status'] in ('running', 'queued', 'interrupted'):
                raise ValueError('该任务可能已写入，禁止自动重试')
            if row.get('stream'):
                raise ValueError('流式任务请重新发起全库执行，避免重复写入已处理条目')
            retry_ids = [r['item_id'] for r in row['results'] if r['status'] == 'failed_safe']
            done = {r['item_id'] for r in row['results']}
            retry_ids += [i for i in row['item_ids'] if i not in done]
            if not retry_ids:
                raise ValueError('没有可安全重试的项目，请检查备份后重新预览')
            return self.enqueue(row['server'], retry_ids, row['source'], row['tmdb_id'], confirmed=row.get('confirmed') is True, mode=row.get('mode'), recursive=False, scope=row.get('scope'), config_snapshot=row.get('config_snapshot'))

    def check(self, row):
        if self.stop.is_set() or row['status'] == 'cancelled':
            raise Cancelled('任务已取消')

    def _iter_targets(self, row, check):
        """流式任务在扫描阶段逐步产生条目，普通任务直接使用已记录条目。"""
        if not row.get('stream'):
            for ident in row['item_ids']:
                yield ident, row.get('total')
            return
        for ident, total in self.stream(row, check):
            with self.lock:
                row['scanned'] = row.get('scanned', 0) + 1
                row['total'] = total
                # 流式任务不保存完整 ID 列表，避免大媒体库占用内存和任务记录。
                row['phase'] = 'scanning'
                self.persist()
            yield ident, total
        with self.lock:
            if row.get('stream') and row.get('total') is None:
                row['total'] = row.get('scanned', 0)
                self.persist()

    def run(self):
        while not self.stop.is_set():
            with self.condition:
                row = next((r for r in self.rows if r['status'] == 'queued'), None)
                if row is None:
                    self.condition.wait()
                    continue
                row['status'] = 'running'
                row['phase'] = 'scanning' if row.get('stream') else 'scraping'
                self.persist()
                logger.info(f"Emby刮削器：任务 {row['id'][:8]} 开始执行，目标 {row.get('total') or '服务端扫描中'} 项")
            try:
                for ident, _ in self._iter_targets(row, lambda: self.check(row)):
                    with self.lock:
                        row['phase'] = 'scraping'
                    try:
                        self.check(row)
                        result = self.execute(row, ident, lambda: self.check(row))
                    except Cancelled:
                        break
                    except Exception as exc:
                        logger.error(f"Emby刮削器：任务 {row['id'][:8]} 条目 {ident} 执行失败：{type(exc).__name__}")
                        result = {'item_id': ident, 'status': 'unknown' if isinstance(exc, OperationError) and exc.may_write else 'failed_safe',
                                  'error': '操作未完成，请检查备份和媒体；未知写入不自动重试'}
                    with self.lock:
                        row['results'].append(result)
                        row['completed'] += 1
                        self.persist()
                    if self.stop.wait(self.delay):
                        break
            except Cancelled:
                pass
            except Exception as exc:
                logger.error(f"Emby刮削器：任务 {row['id'][:8]} 扫描失败：{type(exc).__name__}")
                with self.lock:
                    row['error'] = '服务端扫描失败，请检查媒体库范围后重试'
            with self.lock:
                if row['status'] != 'cancelled':
                    row['status'] = ('interrupted' if self.stop.is_set() else
                                     'failed' if row.get('error') or any(r['status'] in ('unknown', 'failed_safe') for r in row['results']) else 'complete')
                self.persist()
                logger.info(f"Emby刮削器：任务 {row['id'][:8]} 结束，状态 {row['status']}，完成 {row['completed']}/{row.get('total') or row['completed']}")
            if getattr(self.plugin, 'notify_job', None):
                try:
                    self.plugin.notify_job(self.view(row))
                except Exception:
                    pass

    def close(self):
        self.stop.set()
        with self.condition:
            self.condition.notify_all()
        self.thread.join(timeout=5)
        return not self.thread.is_alive()
