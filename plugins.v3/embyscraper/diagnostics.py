"""对外错误诊断只保留安全的业务原因。"""


def error_reason(exc):
    """过滤 URL、路径和凭据，保留可帮助定位的短错误原因。"""
    text = str(exc).strip()
    if not text:
        return type(exc).__name__
    lowered = text.lower()
    if any(token in lowered for token in ('http://', 'https://', 'x-api', 'apikey', 'token=', '/', '\\')):
        return type(exc).__name__
    return text[:160]
