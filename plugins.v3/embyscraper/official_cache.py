"""MoviePilot 官方缓存门面；独立缓存区，禁止触碰宿主其他缓存。"""
import copy
import time
from threading import RLock

try:
    from app.sdk.cache import FileCache
except ModuleNotFoundError as exc:
    if exc.name not in {'app', 'app.sdk', 'app.sdk.cache'}:
        raise
    FileCache = None

REGION = 'plugin.embyscraper.v2'
CACHE_LOCK = RLock()


class OfficialCache:
    """宿主 FileCache 按配置使用文件或 Redis，文件模式额外校验键过期时间。"""
    def __init__(self, backend=None):
        self.backend = backend
        if backend is None and FileCache is not None:
            try:
                self.backend = FileCache()
            except Exception:
                # 缓存不可用不能阻止元信息预览；不伪装成已持久化。
                self.backend = None

    def get(self, key):
        if self.backend is None:
            return None
        try:
            value = self.backend.get(key, region=REGION)
            if not isinstance(value, dict) or value.get('expires', 0) <= time.time():
                if value is not None:
                    self.backend.delete(key, region=REGION)
                return None
            return copy.deepcopy(value.get('value'))
        except Exception:
            return None

    def set(self, key, value, ttl=30 * 86400):
        if self.backend is None:
            return False
        try:
            self.backend.set(key, {'expires': time.time() + ttl, 'value': copy.deepcopy(value)},
                             ttl=ttl, region=REGION)
            return True
        except Exception:
            return False

    def count(self):
        if self.backend is None:
            return 0
        try:
            return sum(1 for key, _ in self.backend.items(region=REGION) if self.get(key) is not None)
        except Exception:
            return 0

    def clear(self):
        if self.backend is None:
            return 0
        count = self.count()
        self.backend.clear(region=REGION)
        return count
