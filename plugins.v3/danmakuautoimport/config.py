"""配置默认值、脱敏接口及地址验证。"""
import re
from app.sdk.logging import logger
from urllib.parse import urlsplit, urlunsplit
from fastapi import Body
from .models import ConfigView, ConnectionBody, Result

DEFAULTS = {
    "enable": False, "notify": False, "danmu_server_url": "",
    "external_api_key": "", "cron": "*/5 * * * *", "delay_seconds": 0,
    "max_queue_size": 100, "process_batch_size": 1, "only_anime": False,
    "search_type": "tmdb", "auto_retry": True, "retry_count": 3,
    "consolidate_seconds": 30, "poll_seconds": 10, "import_mode": "auto",
}


class ConfigMixin:
    @staticmethod
    def _server_url(value):
        parsed = urlsplit(str(value or "").strip())
        if not value:
            return ""
        if parsed.scheme not in ("http", "https") or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
            raise ValueError("服务地址必须是无凭据、无查询参数的 HTTP 地址")
        return urlunsplit((parsed.scheme, parsed.netloc, parsed.path.rstrip("/"), "", ""))


    def get_state(self):
        return bool(self._config["enable"])


    def get_form(self):
        # 宿主会合并已存配置，默认值不返回伪装秘钥，不阻断宿主保存真实秘钥。
        return None, {**DEFAULTS, "clear_api_key": False}


    def config_view(self):
        """返回脱敏配置，真实秘钥只留在后端宿主配置。"""
        return ConfigView(**{**self._config, "external_api_key": "", "has_api_key": bool(self._config["external_api_key"])})


    def connection(self):
        return self.test_connection(ConnectionBody())


    def test_connection(self, body: ConnectionBody = Body(...)):
        """只读测试当前或临时连接，不写入配置。"""
        try:
            server = self._server_url(body.danmu_server_url or self._config["danmu_server_url"])
        except ValueError:
            return Result(success=False, message="服务地址无效")
        if server != self._config["danmu_server_url"] and not body.external_api_key:
            return Result(success=False, message="测试其他地址必须提供该地址的秘钥")
        key = body.external_api_key or self._config["external_api_key"]
        if not server or not key:
            return Result(success=False, message="请配置服务地址和秘钥")
        code, data = self._api_connection(server, key)
        data = data if isinstance(data, dict) else {}
        # 外部响应不是可信日志或 UI 内容，只暴露流控数值及布尔字段。
        safe = self._safe_data(data.get("data", data), key)
        return Result(success=code == 200, message="连接正常" if code == 200 else "连接失败，请检查地址和凭据", data=safe)


    @staticmethod
    def _safe_data(value, secret):
        if not isinstance(value, dict):
            return {}
        result = {}
        for key, item in value.items():
            if any(word in key.lower() for word in ("key", "token", "secret", "url", "message", "error")):
                continue
            if isinstance(item, (bool, int, float)) or item is None:
                result[key] = item
            elif isinstance(item, dict):
                result[key] = ConfigMixin._safe_data(item, secret)
            elif isinstance(item, list):
                result[key] = [ConfigMixin._safe_data(entry, secret) for entry in item if isinstance(entry, dict)]
            elif key.lower() in ("provider", "providername", "name", "source") and isinstance(item, str) and re.fullmatch(r"[a-zA-Z0-9_.\-]{1,40}", item) and item != secret:
                result[key] = item
            elif key == "quota" and item == "∞":
                result[key] = item
            elif key == "globalPeriod" and isinstance(item, str) and re.fullmatch(r"\d{1,10}\s*(?:秒|seconds?|s)", item):
                result[key] = item
        return result


    def _configure(self, config):
        stored = self.get_config() or {}
        incoming = dict(config or {})
        merged = {**DEFAULTS, **stored, **incoming}
        old_key = self._config.get("external_api_key") or stored.get("external_api_key", "")
        if incoming.get("clear_api_key"):
            merged["external_api_key"] = ""
        elif not merged.get("external_api_key"):
            merged["external_api_key"] = old_key
        if "delay_seconds" not in incoming and "delay_hours" in incoming:
            merged["delay_seconds"] = int(float(incoming["delay_hours"] or 0) * 3600)
        elif "delay_seconds" not in stored and "delay_hours" in stored and "delay_seconds" not in incoming:
            merged["delay_seconds"] = int(float(stored["delay_hours"] or 0) * 3600)
        for key in ("delay_seconds", "max_queue_size", "process_batch_size", "retry_count", "consolidate_seconds", "poll_seconds"):
            try:
                merged[key] = max(1 if key in ("max_queue_size", "process_batch_size", "poll_seconds") else 0, int(merged[key]))
            except (TypeError, ValueError):
                merged[key] = DEFAULTS[key]
        try:
            merged["danmu_server_url"] = self._server_url(merged["danmu_server_url"])
        except ValueError:
            merged["danmu_server_url"] = ""
            logger.warning("弹幕自动导入：服务地址无效")
        merged["import_mode"] = merged["import_mode"] if merged["import_mode"] in ("auto", "ai") else "auto"
        self._config = {key: merged[key] for key in DEFAULTS}
        if config is not None:
            self.update_config(self._config)
