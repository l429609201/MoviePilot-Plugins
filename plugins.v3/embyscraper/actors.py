"""演员中文名适配：按 TMDB 人物 ID 缓存官方中文名，不修改 Emby 人物实体。"""
import copy
import re

from .official_cache import OfficialCache, CACHE_LOCK


_CHINESE = re.compile(r"[\u3400-\u9fff]")
_KANA = re.compile(r"[\u3040-\u30ff]")
_HANGUL = re.compile(r"[\uac00-\ud7af]")


def _is_chinese(value):
    text = str(value or '').strip()
    # 纯汉字姓名可能也是日文，无法仅凭脚本证明来源；这里只排除混杂外文字母。
    return bool(text and re.fullmatch(r'[\u3400-\u9fff·・‧\s]+', text))


def preserve_existing(people, existing):
    """按人物 ID 和类型保护已有中文姓名及角色，避免同名人物误关联。"""
    output = copy.deepcopy(people)
    known = {}
    for row in existing or []:
        ident = (row.get('ProviderIds') or {}).get('Tmdb')
        if ident:
            known.setdefault((str(ident), row.get('Type')), []).append(row)
    for row in output:
        ident = (row.get('ProviderIds') or {}).get('Tmdb')
        matches = known.get((str(ident), row.get('Type')), []) if ident else []
        if len(matches) == 1:
            previous = matches[0]
            if _is_chinese(previous.get('Name')):
                row['Name'] = previous['Name']
            if _is_chinese(previous.get('Role')) and not _is_chinese(row.get('Role')):
                row['Role'] = previous['Role']
    return output


def _plain(value):
    if isinstance(value, dict):
        return {key: _plain(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_plain(item) for item in value]
    raw = getattr(value, '_json', None)
    return _plain(raw) if raw is not None else value


class ActorLocalizer:
    """官方中文译名优先；失败只保留原人员对象，避免重复请求。"""
    def __init__(self, person_client, cache=None, language='zh-CN'):
        self.client = person_client
        self.cache = cache or OfficialCache()
        self.language = language

    def _key(self, person_id):
        return f"actor-person:v1:{person_id}:{self.language.lower()}"

    def _official_name(self, details):
        rows = (details.get('translations') or {}).get('translations') or []
        lang = self.language.replace('_', '-').split('-')[0].lower()
        region = self.language.replace('_', '-').partition('-')[2].upper()
        rows = sorted(rows, key=lambda row: str(row.get('iso_3166_1', '')).upper() != region)
        for row in rows:
            if str(row.get('iso_639_1', '')).lower() != lang:
                continue
            data = row.get('data') or {}
            name = data.get('name')
            if _is_chinese(name):
                return name
        for name in details.get('also_known_as') or []:
            if _is_chinese(name):
                return name
        return ''

    def localize(self, people):
        output = copy.deepcopy(people or [])
        notes = []
        for person in output:
            if not isinstance(person, dict) or _is_chinese(person.get('Name')):
                continue
            person_id = (person.get('ProviderIds') or {}).get('Tmdb')
            if not person_id or not re.fullmatch(r'[1-9]\d*', str(person_id)):
                continue
            key = self._key(person_id)
            with CACHE_LOCK:
                cached = self.cache.get(key)
                details = cached
                if not isinstance(details, dict):
                    try:
                        details = _plain(self.client.details(int(person_id), append_to_response='translations'))
                        if not isinstance(details, dict) or str(details.get('id')) != str(person_id):
                            raise ValueError('演员详情身份不匹配')
                        # 即使没有中文名也缓存成功资料，避免每部作品重复检索同一演员。
                        details = {key: details.get(key) for key in ('id', 'also_known_as', 'translations')}
                        if not self.cache.set(key, details) and '官方人物缓存不可用，后续可能重复请求' not in notes:
                            notes.append('官方人物缓存不可用，后续可能重复请求')
                    except Exception:
                        if '演员详情获取失败，已保留原名' not in notes:
                            notes.append('演员详情获取失败，已保留原名')
                        continue
                name = self._official_name(details)
                if name:
                    person['Name'] = name
        return output, notes
