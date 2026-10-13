"""隔离宿主 Emby 私有连接 ABI，凭据只放请求头且禁止跳转。"""
import base64
from copy import deepcopy
from urllib.parse import quote, urlencode, urlsplit

from app.sdk.logging import logger
from app.sdk.network import RequestUtils
from app.sdk.services import MediaServerHelper

MAX_IMAGE_BYTES = 20 * 1024 * 1024
IMAGE_TYPES = frozenset({'Primary', 'Backdrop', 'Logo', 'Thumb', 'Banner', 'Art', 'Disc'})
IMAGE_MIMES = frozenset({'image/jpeg', 'image/png', 'image/webp', 'image/gif'})
UPDATE_FIELDS = frozenset({
    'Id', 'Name', 'OriginalTitle', 'SortName', 'ForcedSortName', 'Overview',
    'ProductionYear', 'PremiereDate', 'EndDate', 'Genres', 'Studios', 'Taglines',
    'CommunityRating', 'CriticRating', 'OfficialRating', 'CustomRating', 'People',
    'ProviderIds', 'Tags', 'LockedFields', 'LockData', 'IndexNumber',
    'ParentIndexNumber', 'DisplayOrder', 'DateCreated', 'PreferredMetadataLanguage',
    'PreferredMetadataCountryCode', 'AspectRatio', 'Video3DFormat',
    'IndexNumberEnd', 'AirDays', 'AirTime', 'Status', 'RunTimeTicks',
    'Budget', 'Revenue', 'HomePage', 'AwardSummary', 'Album', 'Artists',
    'AlbumArtists', 'ProductionLocations', 'RemoteTrailers',
})
ITEM_FIELDS = ','.join(sorted(UPDATE_FIELDS | {
    'Path', 'MediaSources', 'SeriesName', 'SeriesId', 'ParentId', 'SeasonId',
    'ImageTags', 'BackdropImageTags', 'UserData', 'Type', 'TagItems', 'Overview',
}))


class EmbyAPIError(RuntimeError):
    """不包含 URL、凭据或响应正文的可展示错误。"""


def filter_update_payload(payload):
    """保留 Emby 可写元数据，丢弃路径、媒体源和展示派生字段。"""
    return {key: deepcopy(value) for key, value in payload.items() if key in UPDATE_FIELDS}


def validate_image(data, mime):
    """校验图片签名与声明 MIME 一致，拒绝伪装成图片的文本响应。"""
    valid = {
        'image/jpeg': data.startswith(b'\xff\xd8\xff'),
        'image/png': data.startswith(b'\x89PNG\r\n\x1a\n'),
        'image/gif': data.startswith((b'GIF87a', b'GIF89a')),
        'image/webp': data.startswith(b'RIFF') and data[8:12] == b'WEBP',
    }
    if not data or len(data) > MAX_IMAGE_BYTES or not valid.get(mime):
        raise EmbyAPIError('图片大小或内容类型无效')


def read_image_response(response):
    """按流限制图片体积并验证 MIME；调用方保证响应最终关闭。"""
    mime = response.headers.get('Content-Type', '').split(';', 1)[0].strip().lower()
    if mime not in IMAGE_MIMES:
        raise EmbyAPIError('图片响应类型不受支持')
    length = response.headers.get('Content-Length')
    try:
        oversized = bool(length and int(length) > MAX_IMAGE_BYTES)
    except (TypeError, ValueError):
        raise EmbyAPIError('图片响应长度无效') from None
    if oversized:
        raise EmbyAPIError('图片超过 20MB 限制')
    chunks, size = [], 0
    try:
        for chunk in response.iter_content(chunk_size=65536):
            size += len(chunk)
            if size > MAX_IMAGE_BYTES:
                raise EmbyAPIError('图片超过 20MB 限制')
            chunks.append(chunk)
    except EmbyAPIError:
        raise
    except Exception:
        raise EmbyAPIError('图片读取失败') from None
    data = b''.join(chunks)
    validate_image(data, mime)
    return data, mime


class EmbyAPI:
    """仅接受宿主已经配置的实例，不接受任意用户 URL。"""

    def __init__(self, instance):
        # 私有属性访问集中在此处，避免业务引擎依赖宿主内部实现。
        host = str(getattr(instance, '_host', '') or '').rstrip('/')
        token = getattr(instance, '_apikey', None)
        user = getattr(instance, 'user', None)
        self._user = user.get('Id') if isinstance(user, dict) else user
        parts = urlsplit(host)
        if (parts.scheme not in {'http', 'https'} or not parts.netloc
                or parts.username or parts.password or parts.query or parts.fragment
                or not token or not self._user):
            raise EmbyAPIError('Emby 宿主连接配置不可用')
        self._root = host
        if parts.path.rstrip('/').endswith('/emby'):
            self._root = host[: -len('/emby')].rstrip('/')
            self._host = host
        else:
            self._host = host + '/emby'
        self._headers = {'X-Emby-Token': str(token), 'Accept': 'application/json'}
        # MoviePilot SDK 的 RequestUtils 不接收 verify 构造参数，TLS 校验交给请求调用。
        self._request = RequestUtils(headers=self._headers, proxies={}, timeout=20)

    def _url(self, *segments, query=None, root=False):
        if any(str(part) in {'', '.', '..'} for part in segments):
            raise EmbyAPIError('Emby 路径参数无效')
        base = self._root if root else self._host
        url = base + '/' + '/'.join(quote(str(part), safe='') for part in segments)
        return url + ('?' + urlencode(query) if query else '')

    def _call(self, method, segments, query=None, absent=False, root=False, **kwargs):
        try:
            response = getattr(self._request, method + '_res')(
                self._url(*segments, query=query, root=root), allow_redirects=False,
                verify=False, **kwargs)
        except Exception as exc:
            logger.error(f"Emby刮削器：{method.upper()} 请求失败：{type(exc).__name__}")
            raise EmbyAPIError('Emby 请求失败') from None
        if response is None:
            logger.error(f"Emby刮削器：{method.upper()} 未获取到返回数据")
            raise EmbyAPIError('Emby 连接失败')
        if absent and response.status_code == 404:
            response.close()
            return None
        if not 200 <= response.status_code < 300:
            status = response.status_code
            response.close()
            logger.error(f"Emby刮削器：{method.upper()} 请求失败（HTTP {status}）")
            raise EmbyAPIError(f'Emby 请求失败（HTTP {status}）')
        return response

    def _json(self, segments, query=None, root=False):
        response = self._call('get', segments, query=query, root=root)
        try:
            return response.json()
        except Exception:
            logger.error('Emby刮削器：响应不是有效 JSON')
            raise EmbyAPIError('Emby 返回了无效数据') from None
        finally:
            response.close()

    def libraries(self):
        """读取当前宿主用户可以访问的媒体库。"""
        result = self._json(('Users', self._user, 'Views'))
        return [{'id': str(row['Id']), 'name': row.get('Name', '')}
                for row in result.get('Items', []) if row.get('Id')]

    def children(self, parent_id, start=0, limit=50, kinds='Movie,Series,Season,Episode'):
        """读取直接子条目，供电影、季度和集逐层展开。"""
        result = self._json(('Users', self._user, 'Items'), {
            'ParentId': str(parent_id), 'Recursive': 'false',
            'IncludeItemTypes': kinds, 'Fields': ITEM_FIELDS,
            'StartIndex': max(0, int(start)), 'Limit': max(1, min(500, int(limit))),
            'SortBy': 'SortName', 'SortOrder': 'Ascending',
        })
        rows, total = result.get('Items'), result.get('TotalRecordCount')
        if not isinstance(rows, list) or isinstance(total, bool) or not isinstance(total, int) or total < 0:
            raise EmbyAPIError('子条目分页响应无效')
        return rows, total

    def system_status(self):
        """只读官方系统信息与各类型条目总数，不暴露地址、路径或连接信息。"""
        # 兼容站点根路径和 /emby 根路径的 System/Info 部署差异。
        try:
            info = self._json(('System', 'Info'), root=True)
        except EmbyAPIError:
            info = self._json(('System', 'Info'))
        if not isinstance(info, dict):
            raise EmbyAPIError('Emby 返回了无效数据')
        counts = {}
        for key, item_type in (('movies', 'Movie'), ('series', 'Series'),
                               ('seasons', 'Season'), ('episodes', 'Episode')):
            # 官方 /Users/{UserId}/Items 以 TotalRecordCount 返回筛选总数，取 1 条即可读取计数。
            result = self._json(('Users', self._user, 'Items'), {
                'Recursive': 'true', 'IncludeItemTypes': item_type,
                'StartIndex': 0, 'Limit': 1,
            })
            total = result.get('TotalRecordCount')
            if isinstance(total, bool) or not isinstance(total, int) or not 0 <= total <= 1000000:
                raise EmbyAPIError('Emby 条目总数无效')
            counts[key] = total
        return {'server_name': str(info.get('ServerName') or ''),
                'version': str(info.get('Version') or ''),
                'operating_system': str(info.get('OperatingSystemDisplayName') or ''),
                'pending_restart': info.get('HasPendingRestart') is True,
                'shutting_down': info.get('IsShuttingDown') is True,
                'maintenance': info.get('IsInMaintenanceMode') is True,
                'update_available': info.get('HasUpdateAvailable') is True,
                **counts}

    def items(self, library_id, search='', start=0, limit=50, *,
              sort_by='SortName', sort_order='Ascending'):
        """分页读取条目；入库触发可按创建时间降序读取有界的最近条目。"""
        if sort_by not in {'SortName', 'DateCreated'} or sort_order not in {'Ascending', 'Descending'}:
            raise EmbyAPIError('条目排序参数无效')
        query = {
            'ParentId': str(library_id), 'Recursive': 'true',
            'IncludeItemTypes': 'Movie,Series,Season,Episode', 'Fields': ITEM_FIELDS,
            'StartIndex': max(0, int(start)), 'Limit': max(1, min(500, int(limit))),
            'SortBy': sort_by, 'SortOrder': sort_order,
        }
        # Emby 对空 SearchTerm 的处理因版本而异，空搜索不传该参数。
        if str(search or '').strip():
            query['SearchTerm'] = str(search).strip()
        result = self._json(('Users', self._user, 'Items'), query)
        rows = result.get('Items') if isinstance(result.get('Items'), list) else []
        total = result.get('TotalRecordCount', 0)
        try:
            total = int(total)
        except (TypeError, ValueError):
            raise EmbyAPIError('Emby 条目总数无效') from None
        logger.info(f"Emby刮削器：媒体库 {library_id} 读取 {len(rows)} 项，总数 {total}")
        return rows, total

    def series_episodes(self, series_id):
        """完整读取一个剧集的在库单集，超出边界或分页不一致时拒绝转换。"""
        output, seen = [], set()
        expected = None
        while expected is None or len(output) < expected:
            result = self._json(('Users', self._user, 'Items'), {
                'ParentId': str(series_id), 'Recursive': 'true', 'IncludeItemTypes': 'Episode',
                'Fields': ITEM_FIELDS, 'StartIndex': len(output), 'Limit': 500,
                'SortBy': 'ParentIndexNumber,IndexNumber', 'SortOrder': 'Ascending',
            })
            total = int(result.get('TotalRecordCount', 0))
            if total < 0 or total > 5000 or (expected is not None and expected != total):
                raise EmbyAPIError('剧集条目数量过大或扫描期间已变化')
            expected = total
            batch = result.get('Items', [])
            if not isinstance(batch, list) or (not batch and len(output) < expected):
                raise EmbyAPIError('剧集单集分页不完整')
            for item in batch:
                identity = str(item.get('Id') or '')
                if not identity or identity in seen or item.get('Type') != 'Episode':
                    raise EmbyAPIError('剧集单集身份重复或无效')
                seen.add(identity)
                output.append(item)
            if len(output) > expected:
                raise EmbyAPIError('剧集单集分页数量不一致')
        return output

    def contains(self, library_id, item_id):
        """使用用户媒体库查询确认成员关系，兼容视图库与实体父目录 ID 不同。"""
        result = self._json(('Users', self._user, 'Items'), {
            'ParentId': str(library_id), 'Recursive': 'true',
            'Ids': str(item_id), 'Limit': 1,
        })
        rows = result.get('Items') if isinstance(result, dict) else None
        if not isinstance(rows, list):
            raise EmbyAPIError('媒体库成员校验响应无效')
        return any(str(row.get('Id') or '') == str(item_id) for row in rows)

    def roots(self, library_id, search='', start=0, limit=50, kinds='Movie,Series'):
        """递归读取电影及剧集主条目，文件夹不影响主列表与搜索。"""
        query = {'ParentId': str(library_id), 'Recursive': 'true',
                 'IncludeItemTypes': kinds, 'Fields': ITEM_FIELDS,
                 'StartIndex': max(0, int(start)), 'Limit': max(1, min(500, int(limit))),
                 'SortBy': 'SortName', 'SortOrder': 'Ascending'}
        if str(search or '').strip():
            query['SearchTerm'] = str(search).strip()
        result = self._json(('Users', self._user, 'Items'), query)
        rows, total = result.get('Items'), result.get('TotalRecordCount')
        if not isinstance(rows, list) or isinstance(total, bool) or not isinstance(total, int) or total < 0:
            raise EmbyAPIError('媒体主条目分页响应无效')
        return rows, total

    def item(self, item_id):
        """从用户条目端点读取完整元数据，保留所有锁定信息。"""
        # 人员外部 ID 用于保护已有中文姓名/角色，不按同名猜测人物身份。
        return self._json(('Users', self._user, 'Items', item_id),
                          {'Fields': ITEM_FIELDS, 'PersonFields': 'ProviderIds'})

    def verify_metadata(self, item, expected):
        """仅在写后核验需要时按 Emby 人物 ID 查证外部身份，不按姓名猜测。"""
        verified = deepcopy(item)
        intended = expected.get('People')
        observed = verified.get('People')
        if not isinstance(intended, list) or not isinstance(observed, list) or len(intended) != len(observed):
            return verified
        details = {}
        for person, target in zip(observed, intended):
            if not isinstance(person, dict) or not isinstance(target, dict):
                continue
            wanted = target.get('ProviderIds') or {}
            present = {str(key).lower(): str(value) for key, value in (person.get('ProviderIds') or {}).items()}
            missing = {key: value for key, value in wanted.items() if str(key).lower() not in present}
            if not missing or not person.get('Id'):
                continue
            if any((person.get(key) or '') != (target.get(key) or '') for key in ('Name', 'Type', 'Role')):
                continue
            ident = str(person['Id'])
            if ident not in details:
                details[ident] = self._json(('Users', self._user, 'Items', ident), {'Fields': 'ProviderIds'})
            detail = details[ident]
            if str(detail.get('Id')) != ident or detail.get('Name') != person.get('Name') or detail.get('Type') != 'Person':
                raise EmbyAPIError('人物身份回读无法确认')
            # 只补详情已证实的字段；已出现但冲突的外部 ID 保留给比较器拒绝。
            external = {str(key).lower(): (key, value) for key, value in (detail.get('ProviderIds') or {}).items()}
            ids = dict(person.get('ProviderIds') or {})
            for key in missing:
                evidence = external.get(str(key).lower())
                if evidence:
                    ids[evidence[0]] = evidence[1]
            person['ProviderIds'] = ids
        return verified

    def update(self, item_id, payload):
        """提交调用方已合并的可写元数据；成功返回 None。"""
        response = self._call('post', ('Items', item_id), json=filter_update_payload(payload))
        response.close()

    @staticmethod
    def image_tag(item, image_type):
        """获取第零张图片标签，Backdrop 与普通图片的标签结构不同。"""
        if image_type == 'Backdrop':
            tags = item.get('BackdropImageTags') or []
            return tags[0] if tags else None
        return (item.get('ImageTags') or {}).get(image_type)

    @staticmethod
    def _image_type(image_type):
        if image_type not in IMAGE_TYPES:
            raise EmbyAPIError('不受支持的图片类型')
        return image_type

    def image(self, item_id, image_type):
        """404 仅表示无图，其余状态全部失败，禁止把权限错误当作缺图。"""
        response = self._call('get', ('Items', item_id, 'Images', self._image_type(image_type), 0),
                              absent=True, stream=True)
        if response is None:
            return None
        try:
            return read_image_response(response)
        finally:
            response.close()

    def upload(self, item_id, image_type, data, mime):
        """Emby 官方上传协议要求 Base64 字节正文及原始图片 MIME。"""
        validate_image(data, mime)
        headers = dict(self._headers, **{'Content-Type': mime})
        response = self._call('post', ('Items', item_id, 'Images', self._image_type(image_type)),
                              data=base64.b64encode(data), headers=headers)
        response.close()

    def delete_image(self, item_id, image_type):
        """只删除指定类型第零张图片，绝不提供删除媒体条目的接口。"""
        response = self._call('delete', ('Items', item_id, 'Images', self._image_type(image_type), 0),
                              absent=True)
        if response is not None:
            response.close()

    def close(self):
        """释放 SDK 请求工具可能持有的连接池；SDK 未提供 close 时安全跳过。"""
        close = getattr(self._request, 'close', None)
        if callable(close):
            close()


def discover_servers():
    """只发现宿主配置且可用的 Emby 服务，连接信息不传给前端。"""
    services = MediaServerHelper().get_services(type_filter='emby') or {}
    result = {}
    # 一个服务配置不完整时，其余实例仍应可供操作。
    for name, service in services.items():
        try:
            instance = service.instance
            inactive = getattr(instance, 'is_inactive', None)
            if callable(inactive) and inactive():
                logger.warning(f"Emby刮削器：服务器 {name} 连接未就绪")
                continue
            result[name] = EmbyAPI(instance)
        except Exception as exc:
            logger.error(f"Emby刮削器：服务器 {name} 初始化失败：{type(exc).__name__}")
            continue
    return result
