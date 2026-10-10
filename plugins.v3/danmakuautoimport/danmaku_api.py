"""仅使用宿主SDK的弹幕服务传输边界。"""
from urllib.parse import quote
from app.sdk.network import RequestUtils


class DanmakuAPIMixin:
    def _api_connection(self, server, key):
        return self._request("GET", "/api/control/rate-limit/status", server=server, key=key)

    def _api_auto_import(self, params):
        return self._request("POST", "/api/control/import/auto", params)

    def _api_search(self, params):
        return self._request("GET", "/api/control/search", params)

    def _api_episodes(self, search_id, index):
        return self._request("GET", "/api/control/episodes", {"searchId": search_id, "result_index": index})

    def _api_import_selected(self, edited, body):
        return self._request("POST", "/api/control/import/edited" if edited else "/api/control/import/direct", json=body)

    def _api_task(self, task_id, mapping=False):
        path = "/api/control/tasks/" + quote(str(task_id), safe="")
        return self._request("GET", path + ("/execution" if mapping else ""))

    def _request(self, method, path, params=None, server=None, key=None, json=None):
        """传输边界不传播异常 URL、响应正文或请求凭据。"""
        url = (server if server is not None else self._config["danmu_server_url"]) + path
        query = {**(params or {}), "api_key": self._config["external_api_key"] if key is None else key}
        # SDK 不记录请求异常；关闭重定向防止凭据被转发到其他地址。
        try:
            client = RequestUtils(timeout=20, proxies={}, verify=True)
            request = client.post_res if method == "POST" else client.get_res
            kwargs = {"url": url, "params": query, "allow_redirects": False, "raise_exception": True}
            if json is not None:
                kwargs["json"] = json
            response = request(**kwargs)
            if response is None:
                return None, {}
            try:
                data = response.json()
            except (ValueError, TypeError):
                data = {}
            return response.status_code, data if isinstance(data, (dict, list)) else {}
        except Exception:
            return None, {}

