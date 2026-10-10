"""EmbyScraper 插件数据库存储与一次性旧数据迁移。"""
from __future__ import annotations

import copy
import json
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import Boolean, DateTime, String, Text, delete, select
from sqlalchemy.orm import Mapped, mapped_column

try:
    from app.sdk.database import plugin_declarative_base
    _SQLALCHEMY_AVAILABLE = True
except ModuleNotFoundError as exc:
    # 只兼容缺失宿主 SDK 的隔离环境，依赖损坏或 SDK 内部导入失败必须暴露。
    if exc.name not in {"app", "app.sdk", "app.sdk.database"}:
        raise
    plugin_declarative_base = lambda: type('PluginStorageFallbackBase', (), {})
    _SQLALCHEMY_AVAILABLE = False


Base = plugin_declarative_base()


class StorageMigration(Base):
    """记录旧插件数据是否已经完成导入。"""

    __tablename__ = "storage_migrations"
    name: Mapped[str] = mapped_column(String(64), primary_key=True)
    done: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class JobRecord(Base):
    """任务记录，业务字段保留为 JSON。"""

    __tablename__ = "emby_jobs"
    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    payload: Mapped[str] = mapped_column(Text, nullable=False)


class BackupRecord(Base):
    """备份索引记录；图片仍保存在 data_path。"""

    __tablename__ = "emby_backups"
    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    payload: Mapped[str] = mapped_column(Text, nullable=False)


class TranslationCacheRecord(Base):
    """可重建翻译缓存。"""

    __tablename__ = "emby_translation_cache"
    key: Mapped[str] = mapped_column(String(128), primary_key=True)
    payload: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ScheduleCursorRecord(Base):
    """定时扫描游标。"""

    __tablename__ = "emby_schedule_cursors"
    server: Mapped[str] = mapped_column(String(256), primary_key=True)
    payload: Mapped[str] = mapped_column(Text, nullable=False)


MODELS = [JobRecord, BackupRecord, TranslationCacheRecord, ScheduleCursorRecord, StorageMigration] if _SQLALCHEMY_AVAILABLE else []


def _json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def _load(value: str) -> Any:
    return json.loads(value)


class Storage:
    """以插件数据库为主、旧文件存储为兼容回退的存储门面。"""

    MIGRATION = "legacy_embyscraper_v1"

    def __init__(self, plugin: Any, handle: Any = None):
        self.plugin = plugin
        self.handle = handle
        self._db = False
        try:
            self.handle = handle or plugin.get_database()
            self._db = bool(self.handle and getattr(self.handle, "session_factory", None))
            if not self._db or not _SQLALCHEMY_AVAILABLE:
                raise RuntimeError("宿主未提供可用的插件数据库句柄或声明式基类")
            Base.metadata.create_all(self.handle.engine)
            self._migrate_legacy()
        except Exception as exc:
            # 只有隔离宿主完全没有数据库入口时才回退；真实数据库建表/迁移失败必须显式暴露。
            if handle is not None or callable(getattr(plugin, "get_database", None)):
                raise RuntimeError(f"EmbyScraper 数据库建表或迁移失败: {exc}") from exc
            self._db = False

    def _session(self):
        return self.handle.session_factory()

    def _migrate_legacy(self) -> None:
        with self._session() as session:
            marker = session.get(StorageMigration, self.MIGRATION)
            if marker and marker.done:
                return
            try:
                self._import_jobs(session, self.plugin.get_data("jobs"))
                self._import_backups(session, self.plugin.get_data("backups"))
                self._import_translation(session, self.plugin.get_data("translation_cache"))
                self._import_cursors(session, self.plugin.get_data("schedule_cursors"))
                if marker is None:
                    marker = StorageMigration(name=self.MIGRATION, done=True)
                    session.add(marker)
                else:
                    marker.done = True
                session.commit()
            except Exception:
                session.rollback()
                raise

    @staticmethod
    def _import_jobs(session, value: Any) -> None:
        if not isinstance(value, list):
            return
        for row in value:
            if isinstance(row, dict) and isinstance(row.get("id"), str):
                if session.get(JobRecord, row["id"]) is None:
                    session.add(JobRecord(id=row["id"], payload=_json(row)))

    @staticmethod
    def _import_backups(session, value: Any) -> None:
        if not isinstance(value, list):
            return
        for row in value:
            if isinstance(row, dict) and isinstance(row.get("id"), str):
                if session.get(BackupRecord, row["id"]) is None:
                    session.add(BackupRecord(id=row["id"], payload=_json(row)))

    @staticmethod
    def _import_translation(session, value: Any) -> None:
        if not isinstance(value, dict):
            return
        now = datetime.now(timezone.utc)
        for key, row in value.items():
            if isinstance(key, str) and isinstance(row, dict) and session.get(TranslationCacheRecord, key) is None:
                session.add(TranslationCacheRecord(key=key, payload=_json(row), created_at=now))

    @staticmethod
    def _import_cursors(session, value: Any) -> None:
        if not isinstance(value, dict):
            return
        for server, row in value.items():
            if isinstance(server, str) and isinstance(row, dict) and session.get(ScheduleCursorRecord, server) is None:
                session.add(ScheduleCursorRecord(server=server, payload=_json(row)))

    def _legacy(self, key: str, default: Any) -> Any:
        value = self.plugin.get_data(key)
        return copy.deepcopy(value) if value is not None else default

    def get_jobs(self) -> list[dict]:
        if not self._db:
            return self._legacy("jobs", [])
        with self._session() as session:
            return [_load(row.payload) for row in session.scalars(select(JobRecord))]

    def save_jobs(self, rows: list[dict]) -> None:
        rows = rows[-100:]
        if not self._db:
            self.plugin.save_data("jobs", rows)
            return
        with self._session() as session:
            session.execute(delete(JobRecord))
            session.add_all(JobRecord(id=row["id"], payload=_json(row)) for row in rows if isinstance(row, dict) and isinstance(row.get("id"), str))
            session.commit()

    def get_backups(self) -> list[dict]:
        if not self._db:
            return self._legacy("backups", [])
        with self._session() as session:
            return [_load(row.payload) for row in session.scalars(select(BackupRecord))]

    def save_backups(self, rows: list[dict]) -> None:
        rows = rows[-100:]
        if not self._db:
            self.plugin.save_data("backups", rows)
            return
        with self._session() as session:
            session.execute(delete(BackupRecord))
            session.add_all(BackupRecord(id=row["id"], payload=_json(row)) for row in rows if isinstance(row, dict) and isinstance(row.get("id"), str))
            session.commit()

    def get_translation_cache(self) -> dict[str, dict]:
        if not self._db:
            return self._legacy("translation_cache", {})
        with self._session() as session:
            return {row.key: _load(row.payload) for row in session.scalars(select(TranslationCacheRecord))}

    def save_translation_cache(self, values: dict[str, dict]) -> None:
        if not self._db:
            self.plugin.save_data("translation_cache", values)
            return
        with self._session() as session:
            session.execute(delete(TranslationCacheRecord))
            now = datetime.now(timezone.utc)
            session.add_all(TranslationCacheRecord(key=k, payload=_json(v), created_at=now) for k, v in list(values.items())[-100:] if isinstance(k, str) and isinstance(v, dict))
            session.commit()

    def get_schedule_cursors(self) -> dict[str, dict]:
        if not self._db:
            return self._legacy("schedule_cursors", {})
        with self._session() as session:
            return {row.server: _load(row.payload) for row in session.scalars(select(ScheduleCursorRecord))}

    def save_schedule_cursors(self, values: dict[str, dict]) -> None:
        if not self._db:
            self.plugin.save_data("schedule_cursors", values)
            return
        with self._session() as session:
            session.execute(delete(ScheduleCursorRecord))
            session.add_all(ScheduleCursorRecord(server=k, payload=_json(v)) for k, v in values.items() if isinstance(k, str) and isinstance(v, dict))
            session.commit()

    def clear_rebuildable_cache(self, ttl_days: int = 30, max_rows: int = 100) -> int:
        """只清理翻译缓存，任务、备份和游标永不在此接口删除。"""
        if not self._db:
            self.plugin.save_data("translation_cache", {})
            return 0
        cutoff = datetime.now(timezone.utc) - timedelta(days=max(0, ttl_days))
        with self._session() as session:
            rows = list(session.scalars(select(TranslationCacheRecord).order_by(TranslationCacheRecord.created_at.desc())))
            # SQLite 不保留 DateTime 的时区；无时区缓存时间按写入约定视为 UTC。
            stale = [row for index, row in enumerate(rows)
                     if (row.created_at.replace(tzinfo=timezone.utc) if row.created_at.tzinfo is None
                         else row.created_at.astimezone(timezone.utc)) < cutoff or index >= max(0, max_rows)]
            for row in stale:
                session.delete(row)
            session.commit()
            return len(stale)

    def cleanup_translation_cache(self, ttl_days: int = 30, max_rows: int = 100) -> int:
        return self.clear_rebuildable_cache(ttl_days, max_rows)
