"""按字段语义核验 Emby 回读，忽略展示字段但保留真实数据差异。"""
from datetime import datetime, timezone
import re


DATE_FIELDS = frozenset({'PremiereDate', 'EndDate', 'DateCreated'})
LIST_FIELDS = frozenset({'Genres', 'Tags', 'Taglines', 'Studios', 'People'})


def _date(value):
    if not isinstance(value, str) or not value:
        return value
    try:
        fraction = re.search(r'\.(\d+)', value)
        # Python 仅保留微秒，非零第七位必须留作严格比较而不能被截断。
        if fraction and any(char != '0' for char in fraction[1][6:]):
            return value
        parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
        return parsed.astimezone(timezone.utc) if parsed.tzinfo else parsed
    except ValueError:
        return value


def _ids(value):
    if not isinstance(value, dict):
        return value
    return {str(key).lower(): str(ident) for key, ident in value.items()}


def metadata_equal(field, actual, expected):
    """只放宽已知的服务端表示差异，不忽略姓名、角色、顺序和外部身份。"""
    if field in DATE_FIELDS:
        return _date(actual) == _date(expected)
    if field == 'ProviderIds':
        if any(isinstance(value, bool) for ids in (actual, expected) if isinstance(ids, dict) for value in ids.values()):
            return False
        return _ids(actual) == _ids(expected)
    if field in LIST_FIELDS:
        if actual is None and expected == [] or expected is None and actual == []:
            return True
    if field in {'People', 'Studios'} and isinstance(actual, list) and isinstance(expected, list):
        if len(actual) != len(expected):
            return False
        for observed, intended in zip(actual, expected):
            if not isinstance(observed, dict) or not isinstance(intended, dict):
                if observed != intended:
                    return False
                continue
            keys = ('Name', 'Type', 'Role') if field == 'People' else ('Name',)
            if any((observed.get(key) or '') != (intended.get(key) or '') for key in keys):
                return False
            # 已存在的 Emby 身份必须保留；新增条目的服务端生成 ID 不参与比较。
            if intended.get('Id') is not None and str(observed.get('Id')) != str(intended['Id']):
                return False
            # 回读缺少人物外部 ID 时不能凭同名认定成功，由 API 读取人物详情补足。
            if any(isinstance(value, bool) for ids in (intended.get('ProviderIds'), observed.get('ProviderIds'))
                   if isinstance(ids, dict) for value in ids.values()):
                return False
            expected_ids = _ids(intended.get('ProviderIds') or {})
            actual_ids = _ids(observed.get('ProviderIds') or {})
            if any(actual_ids.get(key) != value for key, value in expected_ids.items()):
                return False
        return True
    return actual == expected


def mismatch_fields(actual, expected):
    """错误仅列字段名，不输出元信息、路径或连接凭据。"""
    return [key for key, value in expected.items() if not metadata_equal(key, actual.get(key), value)]
