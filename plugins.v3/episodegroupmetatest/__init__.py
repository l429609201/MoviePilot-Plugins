import base64
import json
import re
import threading
import time
from typing import Optional
from urllib.parse import quote, urlsplit
from uuid import uuid4

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

from app import schemas
from app.modules.themoviedb.tmdbv3api import TV
from app.sdk.plugin import _PluginBase
from app.schemas.types import EventType, MediaSource, MessageType
from app.sdk.config import settings
from app.sdk.events import Event, eventmanager
from app.sdk.logging import logger
from app.sdk.media import build_media_key, parse_media_key, resolve_media_identity
from app.sdk.network import RequestUtils
from app.sdk.services import MediaServerHelper


class MediaRequest(BaseModel):
    """操作使用 TMDB 原生 ID，也接受统一媒体 key。"""
    model_config = ConfigDict(extra="forbid")
    media_id: str = Field(min_length=1, max_length=128)

    @field_validator("media_id")
    @classmethod
    def validate_media_id(cls, value: str) -> str:
        source, identity = parse_media_key(value)
        if source:
            if source != MediaSource.TMDB:
                raise ValueError("只支持 TMDB 媒体")
            value = identity
        if not re.fullmatch(r"[1-9][0-9]{0,19}", value):
            raise ValueError("无效的 TMDB 媒体 ID")
        return value


class ScrapeRequest(MediaRequest):
    group_id: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_-]+$")


class EpisodePreview(BaseModel):
    order: Optional[int] = None
    name: str = ""
    overview: str = ""
    season_number: Optional[int] = None
    episode_number: Optional[int] = None
    still_path: Optional[str] = None


class SeasonPreview(BaseModel):
    order: int
    name: str = ""
    episodes: list[EpisodePreview] = Field(default_factory=list)


class GroupPreview(BaseModel):
    id: str
    name: str = ""
    description: str = ""
    group_count: int = 0
    episode_count: int = 0
    seasons: list[SeasonPreview] = Field(default_factory=list)


class PendingItem(BaseModel):
    key: str
    media_source: str
    media_id: str
    title: str = ""
    year: Optional[str] = None
    poster_path: Optional[str] = None
    groups: list[GroupPreview] = Field(default_factory=list)


class PendingResponse(BaseModel):
    items: list[PendingItem] = Field(default_factory=list)


class GroupsResponse(BaseModel):
    media_id: str
    groups: list[GroupPreview] = Field(default_factory=list)


class Job(BaseModel):
    id: str
    media_id: str
    group_id: Optional[str] = None
    status: str
    message: str = ""
    created_at: float
    updated_at: float


class JobResponse(BaseModel):
    job: Job


class JobsResponse(BaseModel):
    jobs: list[Job] = Field(default_factory=list)


class ActionResponse(BaseModel):
    success: bool
    message: str


class EpisodeGroupMetaTest(_PluginBase):
    plugin_name = "TMDB剧集组刮削-魔改版"
    plugin_desc = "从TMDB剧集组刮削季集的实际顺序。"
    plugin_icon = "episode-group.png"
    plugin_color = "#098663"
    plugin_version = "3.0.0"
    plugin_author = "Misaka10876"
    author_url = "https://github.com/l429609201"
    plugin_config_prefix = "EpisodeGroupMetaTest_"
    plugin_order = 29
    auth_level = 1

    def __init__(self):
        super().__init__()
        self._lock = threading.RLock()
        self._event = threading.Event()
        self._jobs = {}
        self._threads = {}
        self._progress = threading.local()
        self._enabled = False
        self._notify = True
        self._autorun = True
        self._ignorelock = False
        self._delay = 120
        self._allowlist = []
        self.tv = None
        self.mediaserver_helper = None

    def init_plugin(self, config: dict = None):
        """重载前取消旧任务，旧令牌不会被重新清除。"""
        self.stop_service()
        with self._lock:
            # 网络请求不可强杀；旧写任务结束前拒绝替换运行态依赖。
            if any(worker.is_alive() for worker in self._threads.values()):
                self.log_warn("旧刮削任务仍在结束中，本次重载已暂停")
                return
            self._event = threading.Event()
            self.tv = TV()
            self.mediaserver_helper = MediaServerHelper()
            config = {**self.get_form()[1], **(config or {})}
            self._enabled = bool(config["enabled"])
            self._notify = bool(config["notify"])
            self._autorun = bool(config["autorun"])
            self._ignorelock = bool(config["ignorelock"])
            try:
                self._delay = min(86400, max(0, int(config["delay"])))
            except (ValueError, TypeError):
                self._delay = 120
            self._allowlist = [s.strip() for s in str(config["allowlist"]).split(",") if s.strip()]
            self._migrate_data()

    def get_state(self) -> bool:
        return self._enabled

    @staticmethod
    def get_command():
        return []

    @staticmethod
    def get_render_mode() -> tuple[str, str]:
        return "vue", "dist/assets"

    @staticmethod
    def get_form():
        return [], {"enabled": False, "notify": True, "autorun": True,
                    "ignorelock": False, "allowlist": "", "delay": 120}

    @staticmethod
    def get_page():
        return []

    def get_api(self):
        """写操作仅允许 Bearer 鉴权的 POST，不在 URL 传递凭据。"""
        routes = [("/pending", self.get_pending, "GET", PendingResponse),
                  ("/groups", self.get_groups, "GET", GroupsResponse),
                  ("/scrape", self.scrape, "POST", JobResponse),
                  ("/jobs", self.get_jobs, "GET", JobsResponse),
                  ("/ignore", self.ignore, "POST", ActionResponse)]
        return [{"path": path, "endpoint": endpoint, "methods": [method],
                 "auth": "bear", "summary": "剧集组" + path,
                 "response_model": model} for path, endpoint, method, model in routes]

    @staticmethod
    def _decode(value):
        return json.loads(value) if isinstance(value, str) else value

    @staticmethod
    def _identity(info: dict, key: str = ""):
        source, identity = resolve_media_identity(media_source=info.get("media_source"),
                                                  media_id=info.get("media_id"))
        if not source:
            source, identity = parse_media_key(key)
        if not source:
            source, identity = resolve_media_identity(media_source=MediaSource.TMDB,
                                                      media_id=info.get("tmdb_id") or key)
        return source, identity

    def _migrate_data(self):
        """复制后验证再删旧 key；目标冲突时保留旧数据，避免覆盖。"""
        for row in self.get_data() or []:
            try:
                data = self._decode(row.value)
                if not isinstance(data, dict) or not isinstance(data.get("mediainfo_dict"), dict):
                    continue
                info = dict(data["mediainfo_dict"])
                source, identity = self._identity(info, str(row.key))
                if source != MediaSource.TMDB or not identity:
                    continue
                key = build_media_key(source, identity)
                if key != row.key and self.get_data(key):
                    continue
                # 保留未知业务字段，仅迁移身份，旧 ID 仍可恢复。
                info.update(media_source=source.value, media_id=str(identity))
                migrated = {**data, "mediainfo_dict": info}
                self.save_data(key, migrated)
                if key != row.key and self._decode(self.get_data(key)) == migrated:
                    self.del_data(row.key)
            except Exception:
                self.log_warn("旧待处理记录迁移失败，原记录已保留")

    @staticmethod
    def _safe_image(value):
        if not isinstance(value, str) or not value:
            return None
        # TMDB 原始海报路径须转换为远端图片，不允许任意宿主相对路径。
        if re.fullmatch(r"/[A-Za-z0-9_-]+\.(?:jpg|jpeg|png|webp)", value, flags=re.IGNORECASE):
            return f"https://{settings.TMDB_IMAGE_DOMAIN}/t/p/w500{value}"
        parsed = urlsplit(value)
        # 不把含认证参数的媒体服务器 URL 暴露给前端。
        if parsed.scheme == "https" and not parsed.username and not parsed.password and not parsed.query:
            return value
        return None

    @staticmethod
    def _group(value):
        return GroupPreview(id=str(value["id"]), name=value.get("name") or "",
                            description=value.get("description") or "",
                            group_count=value.get("group_count") or 0,
                            episode_count=value.get("episode_count") or 0)

    def get_pending(self) -> PendingResponse:
        """读取待处理记录，不访问或修改媒体服务器。"""
        items = {}
        with self._lock:
            for row in self.get_data() or []:
                try:
                    data = self._decode(row.value)
                    info = data["mediainfo_dict"]
                    source, identity = self._identity(info, str(row.key))
                    if source != MediaSource.TMDB or not identity:
                        continue
                    key = build_media_key(source, identity)
                    items.setdefault(key, PendingItem(
                        key=key, media_source=source.value, media_id=str(identity),
                        title=info.get("title") or "", year=str(info["year"]) if info.get("year") else None,
                        poster_path=self._safe_image(info.get("poster_path")),
                        groups=[self._group(g) for g in data.get("episode_groups", []) if g.get("id")]))
                except Exception:
                    self.log_warn("待处理记录格式无效，原记录已保留")
        return PendingResponse(items=list(items.values()))

    def _record(self, identity):
        key = build_media_key(MediaSource.TMDB, identity)
        value = self.get_data(key) or self.get_data(identity)
        if not value:
            raise HTTPException(status_code=404, detail="未找到待处理记录")
        data = self._decode(value)
        source, found = self._identity(data["mediainfo_dict"], key)
        if source != MediaSource.TMDB or str(found) != identity:
            raise HTTPException(status_code=409, detail="媒体身份不一致")
        return key, data

    def get_groups(self, media_id: str, group_id: Optional[str] = None) -> GroupsResponse:
        """TMDB 只读预览，可指定一个待处理记录所属的剧集组。"""
        try:
            identity = MediaRequest(media_id=media_id).media_id
        except ValidationError:
            raise HTTPException(status_code=422, detail="无效的 TMDB 媒体 ID") from None
        _, data = self._record(identity)
        groups = [g for g in data.get("episode_groups", []) if not group_id or str(g.get("id")) == group_id]
        if group_id and not groups:
            raise HTTPException(status_code=400, detail="剧集组不属于该媒体")
        output = []
        for group in groups:
            preview = self._group(group)
            try:
                seasons = self.tv.group_episodes(preview.id) or []
                for season in seasons:
                    if season.get("order") is None:
                        continue
                    episodes = [EpisodePreview(**{k: ep.get(k) for k in EpisodePreview.model_fields if ep.get(k) is not None})
                                for ep in season.get("episodes", [])]
                    preview.seasons.append(SeasonPreview(order=season["order"], name=season.get("name") or "", episodes=episodes))
            except Exception:
                raise HTTPException(status_code=502, detail="获取 TMDB 剧集组预览失败") from None
            output.append(preview)
        return GroupsResponse(media_id=identity, groups=output)

    def scrape(self, body: ScrapeRequest) -> JobResponse:
        """校验剧集组归属后入队，同一媒体仅允许一个活动任务。"""
        if not self._enabled:
            raise HTTPException(status_code=409, detail="插件未启用")
        with self._lock:
            _, data = self._record(body.media_id)
            if not any(str(g.get("id")) == body.group_id for g in data.get("episode_groups", [])):
                raise HTTPException(status_code=400, detail="剧集组不属于该媒体")
            return JobResponse(job=self._enqueue(body.media_id, body.group_id, data, 0))

    def _enqueue(self, identity, group_id, data, delay):
        with self._lock:
            if self._event.is_set():
                raise HTTPException(status_code=409, detail="插件已停止")
            for job in self._jobs.values():
                if job.media_id == identity and job.status in ("queued", "running"):
                    return job.model_copy(deep=True)
            # 限制活动线程及历史容量，完成任务不会永久占用内存。
            if sum(j.status in ("queued", "running") for j in self._jobs.values()) >= 4:
                raise HTTPException(status_code=429, detail="任务队列已满")
            while len(self._jobs) >= 100:
                done = next((k for k, j in self._jobs.items() if j.status not in ("queued", "running")), None)
                if done is None:
                    break
                self._jobs.pop(done)
            now = time.time()
            job = Job(id=uuid4().hex, media_id=identity, group_id=group_id,
                      status="queued", created_at=now, updated_at=now)
            self._jobs[job.id] = job
            token = self._event
            worker = threading.Thread(target=self._run_job, args=(job.id, data, delay, token), daemon=True)
            self._threads[job.id] = worker
            worker.start()
            return job.model_copy(deep=True)

    def _run_job(self, job_id, data, delay, token):
        try:
            if token.wait(delay):
                return
            with self._lock:
                job = self._jobs[job_id]
                job.status = "running"
                job.updated_at = time.time()
            values = dict(data["mediainfo_dict"])
            source, identity = self._identity(values, build_media_key(MediaSource.TMDB, job.media_id))
            values.update(media_source=source.value, media_id=str(identity))
            if values.get("year") is not None:
                values["year"] = str(values["year"])
            info = schemas.MediaInfo.model_validate(values)
            self._progress.failed = 0
            success = self.start_rt(info, data.get("episode_groups"), job.group_id, token)
            partial = self._progress.failed > 0
            with self._lock:
                if not token.is_set():
                    job.status = "succeeded" if success and not partial else "failed"
                    job.message = ("部分剧集更新失败，请检查日志后重试" if partial else
                                   "刮削完成" if success else "未更新任何剧集，请检查匹配、锁定状态及服务日志")
                    job.updated_at = time.time()
            if self._notify and not token.is_set():
                self.post_message(mtype=MessageType.Manual,
                                  title="【剧集组处理结果】", text=f"{info.title}：{job.message}")
        except Exception:
            with self._lock:
                job = self._jobs[job_id]
                job.status = "failed"
                job.message = "刮削失败，请检查服务配置及日志"
                job.updated_at = time.time()
            self.log_error("剧集组后台任务执行失败")
        finally:
            with self._lock:
                job = self._jobs[job_id]
                if token.is_set():
                    job.status = "cancelled"
                    job.message = "插件停止，任务已取消"
                    job.updated_at = time.time()
                self._threads.pop(job_id, None)

    def get_jobs(self) -> JobsResponse:
        """任务状态仅含业务标识和固定文案，不泄漏请求 URL。"""
        with self._lock:
            return JobsResponse(jobs=[j.model_copy(deep=True) for j in reversed(list(self._jobs.values()))])

    def ignore(self, body: MediaRequest) -> ActionResponse:
        with self._lock:
            if any(j.media_id == body.media_id and j.status in ("queued", "running") for j in self._jobs.values()):
                raise HTTPException(status_code=409, detail="媒体正在刮削，不能忽略")
            key, _ = self._record(body.media_id)
            self.del_data(key)
            self.del_data(body.media_id)
        return ActionResponse(success=True, message="已忽略")

    @eventmanager.register(EventType.TransferComplete)
    def scrap_rt(self, event: Event):
        """整理完成后保存统一身份并通过同一任务队列进行自动匹配。"""
        if not self._enabled or self._event.is_set():
            return
        # V3 事件载荷是契约模型，直接取字段保留嵌套媒体对象。
        payload = event.event_data
        info = payload.get("mediainfo") if isinstance(payload, dict) else getattr(payload, "mediainfo", None)
        if not info or info.type != schemas.MediaType.TV:
            return
        source, identity = resolve_media_identity(media=info)
        if source != MediaSource.TMDB or not identity or (self._allowlist and info.title not in self._allowlist):
            return
        try:
            groups = self.tv.episode_groups(identity)
            if not groups:
                return
            values = info.to_dict() if hasattr(info, "to_dict") else info.model_dump()
            values.update(media_source=source.value, media_id=str(identity))
            data = {"mediainfo_dict": values, "episode_groups": [dict(g) for g in groups]}
            with self._lock:
                self.save_data(build_media_key(source, identity), data)
                if self._autorun:
                    self._enqueue(str(identity), None, data, self._delay)
            if self._notify and not self._autorun:
                self.post_message(mtype=MessageType.Manual, title="【待处理的剧集组】", text=info.title)
        except Exception:
            self.log_error("保存或排队剧集组失败")

    def service_infos(self, type_filter=None):
        return {name: info for name, info in (self.mediaserver_helper.get_services(type_filter=type_filter) or {}).items()
                if not info.instance.is_inactive()}

    def start_rt(self, mediainfo, episode_groups, group_id=None, token=None) -> bool:
        """通过 SDK 服务实例刮削；取消令牌在每次写入之前检查。"""
        token = token or self._event
        updated = False
        for name, service in self.service_infos().items():
            if token.is_set():
                break
            try:
                show_id, seasons = self._media_exists(mediainfo, service.type, service.instance)
                if show_id and seasons:
                    updated = self._scrape_server(service.type, service.instance, show_id, seasons,
                                                  episode_groups, group_id, token) or updated
            except Exception:
                self._progress.failed = getattr(self._progress, "failed", 0) + 1
                self.log_warn(f"媒体服务器 {name} 刮削失败")
        return updated

    def _media_exists(self, info, server_type, instance):
        """优先核对 Provider 身份，禁止错配到同名电视剧。"""
        _, identity = resolve_media_identity(media=info)
        if server_type == "plex":
            shows = instance.get_plex().library.search(title=info.title, year=info.year, libtype="show")
            show = next((s for s in shows if any(str(g.id) == f"tmdb://{identity}" for g in s.guids)), None)
            if not show:
                return None, {}
            episodes = [{"Id": e.key, "ParentIndexNumber": e.seasonNumber, "IndexNumber": e.index} for e in show.episodes()]
            show_id = show.key
        elif server_type in ("emby", "jellyfin"):
            prefix = "emby/" if server_type == "emby" else ""
            path = prefix + ("Items" if server_type == "emby" else "Users/[USER]/Items")
            res = instance.get_data(url=f"[HOST]{path}?IncludeItemTypes=Series&Recursive=true&Fields=ProviderIds,ProductionYear&SearchTerm={quote(info.title or '')}&Limit=100&api_key=[APIKEY]")
            candidates = res.json().get("Items", []) if res is not None else []
            show_id = None
            for item in candidates:
                ids = {str(k).lower(): str(v) for k, v in (item.get("ProviderIds") or {}).items()}
                if ids.get("tmdb") == str(identity):
                    show_id = item.get("Id")
                    break
            if not show_id:
                return None, {}
            res = instance.get_data(url=f"[HOST]{prefix}Shows/{show_id}/Episodes?IsMissing=false&api_key=[APIKEY]")
            episodes = res.json().get("Items", []) if res is not None else []
        else:
            return None, {}
        seasons = {}
        for ep in episodes:
            season, number = ep.get("ParentIndexNumber"), ep.get("IndexNumber")
            if season is not None and number is not None and int(number) > 0 and ep.get("Id"):
                seasons.setdefault(int(season), {}).setdefault(int(number), []).append(ep["Id"])
        return show_id, seasons

    def _scrape_server(self, server_type, instance, show_id, seasons, groups, group_id, token):
        updated = False
        tmdbeg_updated = False
        for group in groups or []:
            if token.is_set():
                break
            identity = str(group.get("id") or "")
            if not identity or (group_id and identity != group_id):
                continue
            for season in self.tv.group_episodes(identity) or []:
                order = season.get("order")
                episodes = sorted(season.get("episodes") or [], key=lambda ep: ep.get("order", 0))
                existing = seasons.get(order, {})
                if not existing or not episodes or (not group_id and set(existing) != set(range(1, len(episodes) + 1))):
                    continue
                season_updated = False
                for number, item_ids in existing.items():
                    if number < 1 or number > len(episodes):
                        continue
                    episode = episodes[number - 1]
                    for item_id in item_ids:
                        if token.is_set():
                            return updated
                        item = self.get_iteminfo(server_type, item_id, instance)
                        if not item:
                            self._progress.failed = getattr(self._progress, "failed", 0) + 1
                            continue
                        locked = item.get("LockedFields") or []
                        if not self._ignorelock and (item.get("LockData") or "Name" in locked or "Overview" in locked):
                            continue
                        # 魔改逻辑：每个服务器仅为实际命中的 Emby 剧集组写一次 TmdbEg。
                        if server_type == "emby" and not tmdbeg_updated:
                            if not self.update_provider_ids_with_tmdbeg(server_type, show_id, identity, instance, token):
                                self._progress.failed = getattr(self._progress, "failed", 0) + 1
                                continue
                            tmdbeg_updated = True
                        item.update(Name=episode.get("name") or "", Overview=episode.get("overview") or "",
                                    ParentIndexNumber=order, IndexNumber=number, LockData=True,
                                    LockedFields=list(dict.fromkeys([*locked, "Name", "Overview"])))
                        if episode.get("vote_average") is not None:
                            item["CommunityRating"] = episode["vote_average"]
                        if token.is_set():
                            return updated
                        if self.set_iteminfo(server_type, item_id, item, instance):
                            updated = season_updated = True
                            if episode.get("still_path") and not token.is_set():
                                self.set_item_image(server_type, item_id,
                                                    f"https://{settings.TMDB_IMAGE_DOMAIN}/t/p/original{episode['still_path']}", instance, token)
                        else:
                            self._progress.failed = getattr(self._progress, "failed", 0) + 1
                if season_updated:
                    seasons.pop(order, None)
        return updated

    def update_provider_ids_with_tmdbeg(self, server_type, itemid, tmdbeg_id, mediaserver_instance=None, token=None):
        """合并电视剧 ProviderIds，保留原供应商 ID 与完整项目字段。"""
        item = self.get_iteminfo(server_type, itemid, mediaserver_instance)
        if not item or (token or self._event).is_set():
            return False
        item["ProviderIds"] = {**(item.get("ProviderIds") or {}), "TmdbEg": tmdbeg_id}
        return self.set_iteminfo(server_type, itemid, item, mediaserver_instance)

    def get_iteminfo(self, server_type, itemid, mediaserver_instance=None):
        instance = mediaserver_instance
        if server_type == "plex":
            item = instance.get_plex().library.fetchItem(ekey=itemid)
            locks = [field for field, name in (("Name", "title"), ("Overview", "summary"))
                     if any(f.name == name and f.locked for f in item.fields)]
            return {"Id": itemid, "Name": item.title, "Overview": item.summary, "LockedFields": locks}
        prefix = "emby/" if server_type == "emby" else ""
        res = instance.get_data(url=f"[HOST]{prefix}Users/[USER]/Items/{itemid}?Fields=ChannelMappingInfo&api_key=[APIKEY]")
        return res.json() if res is not None and res.status_code == 200 else {}

    def set_iteminfo(self, server_type, itemid, iteminfo, mediaserver_instance=None):
        try:
            instance = mediaserver_instance
            if server_type == "plex":
                item = instance.get_plex().library.fetchItem(ekey=itemid)
                if "CommunityRating" in iteminfo:
                    item.edit(**{"audienceRating.value": iteminfo["CommunityRating"], "audienceRating.locked": 1})
                item.editTitle(iteminfo["Name"]).editSummary(iteminfo["Overview"]).reload()
                return True
            prefix = "emby/" if server_type == "emby" else ""
            res = instance.post_data(url=f"[HOST]{prefix}Items/{itemid}?api_key=[APIKEY]",
                                     data=json.dumps(iteminfo), headers={"Content-Type": "application/json"})
            return res is not None and res.status_code in (200, 204)
        except Exception:
            self.log_error("更新媒体项失败")
            return False

    def set_item_image(self, server_type, itemid, imageurl, mediaserver_instance=None, token=None):
        token = token or self._event
        try:
            if token.is_set():
                return False
            if server_type == "plex":
                mediaserver_instance.get_plex().library.fetchItem(ekey=itemid).uploadPoster(url=imageurl)
                return True
            response = RequestUtils().get_res(url=imageurl)
            if response is None or response.status_code != 200 or token.is_set():
                return False
            prefix = "emby/" if server_type == "emby" else ""
            res = mediaserver_instance.post_data(url=f"[HOST]{prefix}Items/{itemid}/Images/Primary?api_key=[APIKEY]",
                                                 data=base64.b64encode(response.content).decode(),
                                                 headers={"Content-Type": response.headers.get("Content-Type", "image/jpeg")})
            return res is not None and res.status_code in (200, 204)
        except Exception:
            self.log_warn("更新剧集图片失败")
            return False

    def log_error(self, message):
        logger.error(f"<{self.plugin_name}> {message}")

    def log_warn(self, message):
        logger.warn(f"<{self.plugin_name}> {message}")

    def stop_service(self):
        """合作式取消：延迟立即唤醒，已发出的网络请求允许自然结束。"""
        with self._lock:
            self._event.set()
            workers = list(self._threads.values())
        for worker in workers:
            if worker is not threading.current_thread():
                worker.join(timeout=1)
