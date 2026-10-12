"""对外错误诊断只保留安全的业务原因。"""


def error_reason(exc):
    """过滤 URL、路径和凭据，保留可帮助定位的短错误原因。"""
    text = str(exc).strip()
    if not text:
        return type(exc).__name__
    lowered = text.lower()
    # TMDB 对失效/删除的 ProviderIds 统一返回这类异常；转换成明确可操作的中文原因。
    if 'resource you requested could not be found' in lowered:
        return 'TMDB 资源不存在或 ProviderIds 已失效，请重新匹配或手动指定 TMDB ID'
    if any(token in lowered for token in ('http://', 'https://', 'x-api', 'apikey', 'token=', '/', '\\')):
        return type(exc).__name__
    return text[:160]
