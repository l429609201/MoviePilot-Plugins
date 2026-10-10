"""不依赖宿主和网络的保守媒体匹配规则。"""
import re
import unicodedata
from difflib import SequenceMatcher

MIN_SCORE = 90
AMBIGUITY_MARGIN = 8


def normalize_title(value):
    return re.sub(r"[^\w]", "", unicodedata.normalize("NFKC", str(value or "")).casefold())


def media_type(value):
    return {"tv": "tv_series", "电视剧": "tv_series", "电影": "movie"}.get(value, value)


def candidate_score(context, candidate):
    """未知类型/季与明确冲突均不允许AI绕过。"""
    if not isinstance(candidate, dict) or candidate.get("typeDecision") == "needs_confirmation":
        return None
    if media_type(candidate.get("type")) != media_type(context.get("media_type")):
        return None
    season = context.get("season")
    if context.get("media_type") == "tv_series" and season is not None and candidate.get("season") != season:
        return None
    year, candidate_year = context.get("year"), candidate.get("year")
    if year and candidate_year and str(year) != str(candidate_year):
        return None
    names = [context.get("title"), context.get("original_title"), *(context.get("aliases") or [])]
    targets = [candidate.get("title"), candidate.get("original_title"), *(candidate.get("aliases") or [])]
    names = [normalize_title(n) for n in names if n]
    targets = [normalize_title(n) for n in targets if n]
    if not names or not targets:
        return None
    similarity = max(SequenceMatcher(None, a, b).ratio() for a in names for b in targets)
    # 非精确名称需要年份辅助；年份未知时仅接受严格同名。
    if similarity < 1 and not (year and candidate_year):
        return None
    return similarity * 90 + (10 if year and candidate_year else 0)


def select_match(context, candidates):
    """返回列表位置；低于阈值或近分歧义返回None。"""
    scores = [(score, index) for index, item in enumerate(candidates)
              if (score := candidate_score(context, item)) is not None and score >= MIN_SCORE]
    scores.sort(reverse=True)
    if not scores or (len(scores) > 1 and scores[0][0] - scores[1][0] < AMBIGUITY_MARGIN):
        return None
    return scores[0][1]


def valid_selection(context, candidates, index):
    # AI可在可靠同名候选中选源，但不能绕过类型、年份和季号冲突。
    if type(index) is not int or not 0 <= index < len(candidates):
        return False
    score = candidate_score(context, candidates[index])
    return score is not None and score >= MIN_SCORE
