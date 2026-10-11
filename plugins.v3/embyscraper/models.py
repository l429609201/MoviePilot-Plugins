"""API 白名单模型：不向前端返回服务连接、路径或备份内容。"""
from typing import Literal, Optional
from pydantic import BaseModel, Field, StrictBool

Mode = Literal['missing', 'metadata', 'images', 'all']

class PreviewRequest(BaseModel):
    server: str
    item_id: str
    source: Literal['tmdb'] = 'tmdb'
    tmdb_id: Optional[int] = Field(default=None, gt=0)
    mode: Optional[Mode] = None

class ScrapeRequest(BaseModel):
    confirmed: StrictBool = False
    server: str
    item_ids: list[str] = Field(min_length=1, max_length=500)
    source: Literal['tmdb'] = 'tmdb'
    tmdb_id: Optional[int] = Field(default=None, gt=0)
    mode: Optional[Mode] = None
    recursive: bool = True

class ScrapeLibraryRequest(BaseModel):
    server: str
    library_id: str
    source: Literal['tmdb'] = 'tmdb'
    search: str = Field(default='', max_length=256)
    mode: Optional[Mode] = None
    confirmed: StrictBool = False
    recursive: StrictBool = True

class IdRequest(BaseModel):
    id: str

class RestoreRequest(IdRequest):
    confirmed: StrictBool = False

class OptionsResponse(BaseModel):
    servers: list[dict] = Field(default_factory=list)
    sources: list[dict] = Field(default_factory=list)

class StatusResponse(BaseModel):
    """只返回服务器当前状态与条目计数，不包含连接凭据或媒体路径。"""
    servers: list[dict] = Field(default_factory=list)

class ItemsResponse(BaseModel):
    items: list[dict] = Field(default_factory=list)
    total: int = 0

class ItemResponse(BaseModel):
    item: dict

class ItemUpdateRequest(BaseModel):
    server: str
    item_id: str
    fields: dict = Field(default_factory=dict)
    confirmed: StrictBool = False

class ItemUpdateResponse(BaseModel):
    success: bool
    item: dict

class PreviewResponse(BaseModel):
    item: dict
    title: str
    match: dict
    fields: list[dict]
    images: list[dict]
    warnings: list[str] = Field(default_factory=list)
    translation: dict = Field(default_factory=dict)
    episode_group: Optional[dict] = None

class EpisodeGroupRequest(BaseModel):
    server: str
    item_id: str
    group_id: str = Field(min_length=1, max_length=128, pattern=r'^[A-Za-z0-9_-]+$')

class BindGroupRequest(EpisodeGroupRequest):
    confirmed: StrictBool = False

class EpisodeGroupsResponse(BaseModel):
    series_tmdb_id: str
    groups: list[dict]
    selected_group_id: Optional[str] = None

class EpisodeGroupPreviewResponse(BaseModel):
    series_tmdb_id: str
    group_id: str
    mappings: list[dict]
    warnings: list[str] = Field(default_factory=list)

class JobResponse(BaseModel):
    job: dict

class JobsResponse(BaseModel):
    jobs: list[dict]

class BackupsResponse(BaseModel):
    backups: list[dict]

class ClearCacheRequest(BaseModel):
    confirmed: StrictBool = False

class CacheStatusResponse(BaseModel):
    rows: int

class ActionResponse(BaseModel):
    success: bool
