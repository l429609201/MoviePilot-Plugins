"""整理事件归一化和媒体上下文采集。"""
import re
from app.sdk.logging import logger
from app.sdk.media import normalize_media_source
from .models import EnqueueBody


class EventMixin:
    @staticmethod
    def _value(obj, key, default=None):
        return obj.get(key, default) if isinstance(obj, dict) else getattr(obj, key, default)


    def _is_anime(self, media, event_data):
        genres = self._value(media, "genre_ids", []) or []
        if any(str(genre) == "16" for genre in genres):
            return True
        # 分类或路径只按明确动漫目录片段匹配，不把全部 TV 当成动画。
        hints = [self._value(media, "category", ""), event_data.get("category", ""),
                 event_data.get("target_path", ""), event_data.get("dest_path", ""),
                 self._value(event_data.get("transferinfo"), "target_dir", ""),
                 self._value(event_data.get("transferinfo"), "target_path", ""),
                 self._value(event_data.get("fileitem"), "path", "")]
        return any(re.search(r"(?:^|[/\\\s])(?:动漫|动画|anime|animation)(?:$|[/\\\s])", str(hint), re.I) for hint in hints)


    def on_transfer_complete(self, event):
        """仅使用媒体来源与原生 ID；其他来源不能冒充 TMDB 编号。"""
        if not self.get_state():
            return
        data = event.event_data or {}
        if not isinstance(data, dict):
            if callable(getattr(data, "model_dump", None)):
                data = data.model_dump()
            else:
                return
        media, meta = data.get("mediainfo"), data.get("meta")
        if not media or (self._config["only_anime"] and not self._is_anime(media, data)):
            return
        title = self._value(media, "title", "")
        search_type = self._config["search_type"]
        source = self._value(media, "media_source")
        source = getattr(source, "value", source)
        try:
            source = normalize_media_source(source)
            source = getattr(source, "value", source)
        except (TypeError, ValueError):
            source = None
        media_id = self._value(media, "media_id")
        if search_type == "tmdb" and source == "themoviedb" and media_id and str(media_id) != "0":
            term = str(media_id)
        else:
            search_type, term = "keyword", title
        media_type = self._value(media, "type", "")
        media_type = getattr(media_type, "value", media_type)
        tv = media_type in ("电视剧", "tv", "tv_series")
        begin = self._value(meta, "begin_episode")
        end = self._value(meta, "end_episode") or begin
        try:
            request = EnqueueBody(search_type=search_type, search_term=term, title=title,
                                  original_title=self._value(media, "original_title", "") or self._value(media, "original_name", "") or "",
                                  year=self._value(media, "year"), overview=self._value(media, "overview", "") or "",
                                  aliases=self._value(media, "aliases", []) or self._value(media, "names", []) or [],
                                  media_type="tv_series" if tv else "movie",
                                  season=self._value(meta, "begin_season") if tv else None,
                                  episodes=[{"begin_episode": begin, "end_episode": end}] if tv and begin else [])
        except (ValueError, TypeError):
            logger.warning("弹幕自动导入：整理事件媒体信息无效")
            return
        result = self.enqueue(request)
        if not result.success:
            logger.warning("弹幕自动导入：事件任务未入队，请检查参数或队列容量")

