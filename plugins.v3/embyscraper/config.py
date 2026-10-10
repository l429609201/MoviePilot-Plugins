"""刮削范围与写入字段必须显式配置，首次安装不允许自动写入。"""
from dataclasses import dataclass, field
import re
import math

FIELDS = ('Name', 'OriginalTitle', 'Overview', 'ProductionYear', 'PremiereDate',
          'Genres', 'Studios', 'Tags', 'Taglines', 'CommunityRating', 'OfficialRating',
          'People', 'ProviderIds')
IMAGES = ('Primary', 'Backdrop', 'Logo', 'Thumb')
TYPES = ('Movie', 'Series', 'Season', 'Episode')


@dataclass
class Config:
    enabled: bool = False
    servers: list = field(default_factory=list)
    libraries: dict = field(default_factory=dict)
    source: str = 'tmdb'
    language: str = ''
    ai_translation: bool = False
    translate_titles: bool = False
    cron: str = '0 3 * * *'
    auto_transfer: bool = False
    overwrite: str = 'missing'
    respect_locked: bool = True
    fields: list = field(default_factory=lambda: list(FIELDS))
    images: list = field(default_factory=lambda: list(IMAGES))
    max_items: int = 100
    delay_seconds: float = 2
    notify: bool = False
    rating_country: str = ''
    actor_limit: int = 30
    include_crew: bool = True
    image_languages: list = field(default_factory=lambda: ['zh', 'en', 'null'])
    image_size: str = 'original'
    match_threshold: float = .92
    include_specials: bool = True
    episode_group_mode: str = 'aired'
    episode_group_bindings: dict = field(default_factory=dict)
    reindex_episodes: bool = False

    @classmethod
    def parse(cls, raw=None):
        raw = raw or {}
        if not isinstance(raw, dict):
            raise ValueError('配置必须为对象')
        if 'servers' in raw and not isinstance(raw['servers'], list):
            raise ValueError('服务器配置必须为列表')
        if 'libraries' in raw and not isinstance(raw['libraries'], dict):
            raise ValueError('媒体库配置必须为对象')
        keys = cls.__dataclass_fields__
        value = cls(**{k: v for k, v in raw.items() if k in keys})
        value.servers = list(dict.fromkeys(str(s) for s in (value.servers or [])))
        value.libraries = {str(k): list(dict.fromkeys(str(i) for i in ids))
                           for k, ids in (value.libraries or {}).items() if isinstance(ids, list)}
        value.fields = [f for f in (value.fields or []) if f in FIELDS]
        value.images = [i for i in (value.images or []) if i in IMAGES]
        value.max_items = max(1, min(500, int(value.max_items)))
        value.delay_seconds = max(0, min(300, float(value.delay_seconds)))
        value.overwrite = 'all' if value.overwrite == 'all' else 'missing'
        value.source = 'tmdb'
        # 空值沿用宿主配置，语言代码不能携带任意请求或提示文本。
        value.language = str(value.language or '').strip().replace('_', '-')
        if value.language and not re.fullmatch(r'[a-zA-Z]{2,3}(?:-[a-zA-Z]{2})?', value.language):
            raise ValueError('刮削语言必须为语言代码，例如 zh-CN')
        value.ai_translation = value.ai_translation is True
        value.translate_titles = value.translate_titles is True
        # 剧集组转换独立开启；错误输入不静默扩大写入范围。
        value.rating_country = str(value.rating_country or '').strip().upper()
        if value.rating_country and not re.fullmatch(r'[A-Z]{2}', value.rating_country):
            raise ValueError('评分地区必须为两位国家代码')
        value.actor_limit = max(0, min(500, int(value.actor_limit)))
        value.include_crew = value.include_crew is True
        value.include_specials = value.include_specials is True
        value.reindex_episodes = value.reindex_episodes is True
        value.match_threshold = float(value.match_threshold)
        if not math.isfinite(value.match_threshold) or not 0 <= value.match_threshold <= 1:
            raise ValueError('匹配阈值必须在 0 到 1 之间')
        if not isinstance(value.image_languages, list) or any(
                not isinstance(v, str) or not re.fullmatch(r'(?:[a-z]{2,3}|null)', v)
                for v in value.image_languages):
            raise ValueError('图片语言必须为语言代码列表')
        value.image_languages = list(dict.fromkeys(value.image_languages))
        if value.image_size not in {'original', 'w92', 'w154', 'w185', 'w300', 'w342', 'w500', 'w780', 'w1280'}:
            raise ValueError('图片尺寸无效')
        if value.episode_group_mode not in {'aired', 'manual', 'auto'}:
            raise ValueError('剧集组模式无效')
        if not isinstance(value.episode_group_bindings, dict) or any(
                not re.fullmatch(r'[1-9]\d*', str(k)) or not isinstance(v, str)
                or not re.fullmatch(r'[A-Za-z0-9_-]{1,128}', v)
                for k, v in value.episode_group_bindings.items()):
            raise ValueError('剧集组绑定无效')
        value.episode_group_bindings = {str(k): v for k, v in value.episode_group_bindings.items()}
        return value
