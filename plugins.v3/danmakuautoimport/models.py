"""插件请求、响应与持久化视图模型。"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class EnqueueBody(BaseModel):
    search_type: str = "tmdb"
    search_term: str
    title: str = ""
    original_title: str = ""
    year: Optional[int] = None
    overview: str = ""
    aliases: List[str] = Field(default_factory=list)
    media_context: Dict[str, Any] = Field(default_factory=dict)
    import_mode: Optional[str] = None
    media_type: str = "tv_series"
    season: Optional[int] = Field(default=None, ge=0)
    episodes: Any = Field(default_factory=list)


class ConnectionBody(BaseModel):
    danmu_server_url: str = ""
    external_api_key: str = ""


class PauseBody(BaseModel):
    paused: bool


class TaskBody(BaseModel):
    id: str


class Result(BaseModel):
    success: bool
    message: str = ""
    data: Dict[str, Any] = Field(default_factory=dict)


class TaskView(BaseModel):
    id: str
    title: str
    media_type: str
    season: Optional[int] = None
    episodes: List[int] = Field(default_factory=list)
    status: str
    progress: float = 0
    attempts: int = 0
    error: str = ""
    created_at: str
    remote_task_id: Optional[str] = None
    import_mode: str = "auto"
    selection_method: str = "auto"
    selection_reason: str = ""
    media_context: Dict[str, Any] = Field(default_factory=dict)


class Counts(BaseModel):
    pending: int = 0
    submitted: int = 0
    success: int = 0
    failed: int = 0


class StatusView(BaseModel):
    enabled: bool
    import_mode: str = "auto"
    paused: bool
    counts: Counts
    tasks: List[TaskView]
    next_run_time: Optional[str] = None


class ConfigView(BaseModel):
    enable: bool
    import_mode: str = "auto"
    notify: bool
    danmu_server_url: str
    external_api_key: str = ""
    has_api_key: bool
    cron: str
    delay_seconds: int
    max_queue_size: int
    process_batch_size: int
    only_anime: bool
    search_type: str
    auto_retry: bool
    retry_count: int
    consolidate_seconds: int
    poll_seconds: int
