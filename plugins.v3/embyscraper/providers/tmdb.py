"""复用宿主 TMDB 配置和详情缓存，保守匹配并限制图片下载来源。"""
import re
import unicodedata
from datetime import date
from difflib import SequenceMatcher
from urllib.parse import urlsplit

from app.sdk.config import settings
from app.sdk.logging import logger
from app.sdk.network import RequestUtils
from app.modules.themoviedb.tmdbv3api import Movie, TV, Season, Episode, Search, Person

from ..actors import ActorLocalizer

from ..emby_api import EmbyAPIError, read_image_response


def _positive_id(value):
    if isinstance(value, bool) or not re.fullmatch(r'[1-9]\d*', str(value or '')):
        raise ValueError('TMDB ID 必须为正整数')
    return int(value)


def _normalize(value):
    return ''.join(character for character in unicodedata.normalize('NFKC', str(value)).casefold()
                   if character.isalnum())


def _plain(value):
    """兼容宿主原始 JSON 及旧版 AsObj，递归恢复普通字典。"""
    if isinstance(value, dict):
        return {key: _plain(entry) for key, entry in value.items()}
    if isinstance(value, (list, tuple)):
        return [_plain(entry) for entry in value]
    raw = getattr(value, '_json', None)
    return _plain(raw) if raw is not None else value


class TMDBProvider:
    """按电影/剧集父级 ID 读取元数据，不把分集自己的 TMDB ID 用作剧集 ID。"""
    name = 'tmdb'
    label = 'TMDB'

    def __init__(self, language=None):
        self._clients = {}
        self._download_request = None
        self.language = language or getattr(settings, 'TMDB_LOCALE', None) or 'en-US'
        self.options = None

    def set_options(self, config):
        """参数只影响此提供者实例，不修改宿主 TMDB 全局配置。"""
        self.options = config

    def localize_people(self, people):
        """只按 TMDB 人物 ID 查询官方中文翻译，未命中保留原对象。"""
        if not self.options or not self.options.actor_localization or not str(self.language).lower().startswith('zh'):
            return people, []
        return ActorLocalizer(self._client('person'), language=self.language).localize(people)


    def episode_groups(self, series_id):
        rows = _plain(self._client('series').episode_groups(_positive_id(series_id)))
        rows = rows.get('results', []) if isinstance(rows, dict) else rows
        if not isinstance(rows, list):
            raise ValueError('TMDB 剧集组列表无效')
        return [{k: row.get(k) for k in ('id', 'name', 'type', 'group_count', 'episode_count')} for row in rows]

    def group_episodes(self, group_id):
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,128}', str(group_id)):
            raise ValueError('TMDB 剧集组 ID 无效')
        rows = _plain(self._client('series').group_episodes(group_id))
        rows = rows.get('groups', []) if isinstance(rows, dict) else rows
        if not isinstance(rows, list):
            raise ValueError('TMDB 剧集组详情无效')
        return rows

    def set_language(self, language):
        """语言变更时释放旧客户端，空值跟随宿主。"""
        chosen = language or getattr(settings, 'TMDB_LOCALE', None) or 'en-US'
        if chosen != self.language:
            self.close()
            self.language = chosen

    @staticmethod
    def available():
        """仅检查宿主配置，不创建客户端或联网。"""
        return bool(getattr(settings, 'TMDB_API_KEY', None))

    def _client(self, kind):
        if kind not in self._clients:
            classes = {'movie': Movie, 'series': TV, 'season': Season, 'episode': Episode, 'search': Search, 'person': Person}
            client = classes[kind](language=self.language)
            # requests 会自动解压 gzip/deflate；显式声明后 TMDB JSON 流量可压缩，避免 br 依赖不一致。
            session = getattr(client, '_session', None)
            headers = getattr(session, 'headers', None)
            if headers is not None:
                headers.update({'Accept-Encoding': 'gzip, deflate'})
            self._clients[kind] = client
        return self._clients[kind]

    def _match(self, item, kind, override):
        if override is not None:
            return _positive_id(override), 'override', True
        provider_ids = item.get('ProviderIds') or {}
        existing = next((value for key, value in provider_ids.items() if key.casefold() == 'tmdb'), None)
        if existing:
            return _positive_id(existing), 'provider_id', True
        title = item.get('Name') or item.get('OriginalTitle') or ''
        if not title.strip():
            raise ValueError('缺少可用于匹配的标题')
        year = item.get('ProductionYear')
        search = self._client('search')
        candidates = _plain(search.movies(title, year=year) if kind == 'movie'
                            else search.tv_shows(title, release_year=year))
        titles = {_normalize(item.get(key) or '') for key in ('Name', 'OriginalTitle')} - {''}
        scored = []
        for candidate in candidates or []:
            names = [candidate.get(key) for key in ('title', 'original_title', 'name', 'original_name')]
            score = max((SequenceMatcher(None, wanted, _normalize(name)).ratio()
                         for wanted in titles for name in names if name), default=0)
            candidate_date = candidate.get('release_date') or candidate.get('first_air_date') or ''
            if year and str(year) != candidate_date[:4]:
                score = min(score, 0.7)
            scored.append((score, candidate))
        scored.sort(key=lambda entry: entry[0], reverse=True)
        if not scored:
            raise ValueError('TMDB 未找到匹配条目')
        best = scored[0]
        reliable = best[0] >= (self.options.match_threshold if self.options else .92) and (len(scored) == 1 or best[0] - scored[1][0] >= 0.05)
        return _positive_id(best[1]['id']), 'search', reliable

    def resolve(self, item, api, override=None):
        """季/集 override 表示父剧集 ID；写入的 ProviderIds.Tmdb 为自身详情 ID。"""
        kind = str(item.get('Type', '')).casefold()
        if kind not in {'movie', 'series', 'season', 'episode'}:
            raise ValueError('只支持电影、剧集、季和集')
        parent = item
        if kind in {'season', 'episode'}:
            series_id = item.get('SeriesId') or item.get('ParentSeriesId')
            if not series_id and kind == 'episode' and item.get('ParentId'):
                season = api.item(item['ParentId'])
                series_id = season.get('SeriesId') or season.get('ParentSeriesId') or season.get('ParentId')
            if not series_id and kind == 'season':
                series_id = item.get('ParentId')
            if not series_id:
                raise ValueError('季或集缺少父剧集关联，不能使用自身 TMDB ID 检索')
            parent = api.item(series_id)
            if str(parent.get('Type', '')).casefold() != 'series':
                raise ValueError('父级条目不是剧集')
        tmdb_id, method, reliable = self._match(parent, 'movie' if kind == 'movie' else 'series', override)
        client = self._client(kind)
        append = 'credits,external_ids,images'
        if kind == 'movie':
            details = client.details(tmdb_id, append_to_response=append + ',release_dates,translations')
        elif kind == 'series':
            details = client.details(tmdb_id, append_to_response=append + ',content_ratings,translations')
        else:
            season_number = item.get('IndexNumber') if kind == 'season' else item.get('ParentIndexNumber')
            if isinstance(season_number, bool) or season_number is None or int(season_number) < 0:
                raise ValueError('季编号无效')
            args = [tmdb_id, int(season_number)]
            if kind == 'episode':
                args.append(_positive_id(item.get('IndexNumber')))
            details = client.details(*args, append_to_response=append + ',translations')
        details = _plain(details)
        if not isinstance(details, dict) or not details.get('id'):
            raise ValueError('TMDB 详情无效')
        if self.options and callable(getattr(client, 'images', None)):
            # 宿主 details 没有图片语言参数，使用其公开 images 方法读取候选。
            image_args = [tmdb_id] if kind in {'movie', 'series'} else args
            details = dict(details)
            raw_images = client.images(*image_args,
                                       include_image_language=','.join(self.options.image_languages))
            image_rows = _plain(raw_images)
            # 宿主 TMDB 图片接口对季/集会直接返回列表（posters/stills），统一包装成字段映射。
            if isinstance(image_rows, list):
                image_key = 'stills' if kind == 'episode' else 'posters'
                image_rows = {image_key: image_rows}
            if image_rows is None:
                image_rows = {}
            if not isinstance(image_rows, dict):
                raise ValueError('TMDB 图片列表无效')
            details['images'] = image_rows
        details, languages = self._localized(details)
        return {'tmdb_id': tmdb_id, 'method': method, 'reliable': reliable,
                'fields': self._fields(details, item, kind), 'images': self._images(details, kind),
                'language': self.language, 'original_language': details.get('original_language'),
                'field_languages': languages}

    def _localized(self, details):
        """官方目标译文优先，仅逐字段相同的译文构成回退语言证据。"""
        details = dict(details)
        rows = (details.get('translations') or {}).get('translations') or []
        language, _, region = self.language.replace('_', '-').partition('-')
        targets = [row for row in rows if row.get('iso_639_1') == language.lower()
                   and (not region or row.get('iso_3166_1', '').upper() == region.upper())]
        evidence = {}
        for output, keys in {'Overview': ('overview',), 'Name': ('title', 'name'),
                             'Taglines': ('tagline',)}.items():
            key = next((key for key in keys if key in details), keys[0])
            translated = next(((row.get('data') or {}).get(key) for row in targets
                               if (row.get('data') or {}).get(key)), None)
            if translated:
                details[key] = translated
                evidence[output] = self.language
            else:
                matches = {row.get('iso_639_1') + ('-' + row['iso_3166_1'] if row.get('iso_3166_1') else '')
                           for row in rows if row.get('iso_639_1') and details.get(key)
                           and (row.get('data') or {}).get(key) == details[key]}
                if len(matches) == 1:
                    evidence[output] = next(iter(matches))
        return details, evidence

    def _fields(self, details, item, kind):
        fields = {}
        mappings = {'Name': ('title', 'name'), 'OriginalTitle': ('original_title', 'original_name'),
                    'Overview': ('overview',), 'CommunityRating': ('vote_average',)}
        for output, keys in mappings.items():
            for key in keys:
                if details.get(key) is not None and details.get(key) != '':
                    fields[output] = details[key]
                    break
        released = details.get('release_date') or details.get('first_air_date') or details.get('air_date')
        if released:
            try:
                parsed = date.fromisoformat(released[:10])
                fields.update(ProductionYear=parsed.year, PremiereDate=parsed.isoformat() + 'T00:00:00.000Z')
            except (ValueError, TypeError):
                pass
        for output, key in (('Genres', 'genres'), ('Studios', 'production_companies')):
            if details.get(key):
                names = [entry['name'] for entry in details[key] if entry.get('name')]
                fields[output] = names if output == 'Genres' else [{'Name': name} for name in names]
        if details.get('tagline'):
            fields['Taglines'] = [details['tagline']]
        people = []
        credits = details.get('credits') or {}
        for person in credits.get('cast', [])[:self.options.actor_limit if self.options else 30]:
            if person.get('name'):
                row = {'Name': person['name'], 'Type': 'Actor', 'Role': person.get('character', '')}
                if person.get('id'):
                    row['ProviderIds'] = {'Tmdb': str(_positive_id(person['id']))}
                people.append(row)
        for person in (credits.get('crew', []) if not self.options or self.options.include_crew else []):
            role = person.get('job')
            if role in {'Director', 'Writer', 'Screenplay', 'Producer'} and person.get('name'):
                people.append({'Name': person['name'], 'Type': 'Writer' if role == 'Screenplay' else role})
        if people:
            # 同一人物在不同角色保留；仅删除身份、类型、角色均相同的重复项。
            unique = []
            seen = set()
            for person in people:
                identity = ((person.get('ProviderIds') or {}).get('Tmdb'), person['Type'], person.get('Role', ''))
                if identity[0] and identity in seen:
                    continue
                seen.add(identity)
                unique.append(person)
            fields['People'] = unique
        # 季集详情的自身 ID 与父剧集 ID 分离；保留其它来源 ID，由引擎再执行白名单合并。
        ids = {key: value for key, value in (item.get('ProviderIds') or {}).items() if key.casefold() != 'tmdb'}
        ids['Tmdb'] = str(_positive_id(details['id']))
        external = details.get('external_ids') or {}
        imdb = details.get('imdb_id') or external.get('imdb_id')
        if imdb:
            ids['Imdb'] = imdb
        if external.get('tvdb_id'):
            ids['Tvdb'] = str(external['tvdb_id'])
        fields['ProviderIds'] = ids
        region = (self.options.rating_country if self.options else '') or str(self.language).split('-')[-1].upper()
        ratings = details.get('content_ratings', {}).get('results', [])
        releases = details.get('release_dates', {}).get('results', [])
        for entry in ratings:
            if entry.get('iso_3166_1') == region and entry.get('rating'):
                fields['OfficialRating'] = entry['rating']
                break
        for entry in releases:
            if entry.get('iso_3166_1') == region:
                rating = next((row.get('certification') for row in entry.get('release_dates', [])
                               if row.get('certification')), None)
                if rating:
                    fields['OfficialRating'] = rating
                break
        return fields

    @staticmethod
    def _image_origin():
        domain = str(getattr(settings, 'TMDB_IMAGE_DOMAIN', 'image.tmdb.org') or 'image.tmdb.org')
        parsed = urlsplit(domain if '://' in domain else 'https://' + domain)
        if (parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password
                or parsed.query or parsed.fragment or parsed.path not in {'', '/'} or parsed.port not in {None, 443}):
            raise ValueError('宿主 TMDB 图片域名配置无效')
        return 'https://' + parsed.netloc

    def _images(self, details, kind):
        paths = {'Primary': details.get('still_path') if kind == 'episode' else details.get('poster_path')}
        if kind != 'episode':
            paths['Backdrop'] = details.get('backdrop_path')
            logos = (details.get('images') or {}).get('logos') or []
            if logos:
                paths['Logo'] = logos[0].get('file_path')
        # 图片语言优先级由列表位置确定，同语言使用分辨率与评分排序。
        preferences = self.options.image_languages if self.options else ['zh', 'en', 'null']
        images = details.get('images') or {}
        for typ, key in [('Primary', 'stills' if kind == 'episode' else 'posters'),
                         ('Backdrop', 'backdrops'), ('Logo', 'logos')]:
            candidates = [r for r in images.get(key, []) if (r.get('iso_639_1') or 'null') in preferences]
            candidates.sort(key=lambda r: (preferences.index(r.get('iso_639_1') or 'null'),
                                          -float(r.get('vote_average') or 0), -int(r.get('width') or 0)))
            if key in images:
                paths.pop(typ, None)
            if candidates:
                paths[typ] = candidates[0].get('file_path')
        origin = self._image_origin()
        size = self.options.image_size if self.options else 'original'
        result = {}
        for image_type, path in paths.items():
            if path and re.fullmatch(r'/[A-Za-z0-9_.-]+', path):
                result[image_type] = origin + '/t/p/' + size + path
        return result

    def download(self, url):
        """仅允许宿主图片域名的 HTTPS 静态图片，禁止查询串、用户信息和跳转。"""
        parsed, allowed = urlsplit(url), urlsplit(self._image_origin())
        if (parsed.scheme != 'https' or parsed.netloc != allowed.netloc
                or parsed.username or parsed.password or parsed.query or parsed.fragment
                or not re.fullmatch(r'/t/p/(?:original|w\d+)/[A-Za-z0-9_.-]+', parsed.path)):
            raise ValueError('图片 URL 不在 TMDB 允许范围内')
        if self._download_request is None:
            self._download_request = RequestUtils(proxies=getattr(settings, 'PROXY', None), timeout=20)
        try:
            response = self._download_request.get_res(url, allow_redirects=False, stream=True, verify=False)
        except Exception as exc:
            logger.error(f"Emby刮削器：TMDB 图片连接失败：{type(exc).__name__}")
            raise EmbyAPIError('TMDB 图片连接失败') from None
        if response is None:
            raise EmbyAPIError('TMDB 图片连接失败')
        try:
            if not 200 <= response.status_code < 300:
                raise EmbyAPIError(f'TMDB 图片请求失败（HTTP {response.status_code}）')
            return read_image_response(response)
        finally:
            response.close()

    def close(self):
        """即使某客户端关闭失败，仍释放其它客户端，最后再报告错误。"""
        clients = list(self._clients.values())
        if self._download_request is not None:
            clients.append(self._download_request)
        self._clients.clear()
        self._download_request = None
        failed = False
        for client in clients:
            try:
                close = getattr(client, 'close', None)
                if callable(close):
                    close()
            except Exception:
                failed = True
        if failed:
            raise RuntimeError('TMDB 客户端资源释放失败')
