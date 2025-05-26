import datetime
import re
import time # 用于处理令牌过期时间戳
import json # 用于解析和存储OAuth信息
import uuid # 用于生成state参数

from typing import Any, Dict, List, Optional, Tuple

# BangumiSyncDebug 插件原有的 imports
from app.core.event import eventmanager, Event
from app.core.config import settings
from app.core.metainfo import MetaInfo # MetaInfo 未在原版 BangumiSyncDebug 中使用
from app.log import logger
from app.plugins import _PluginBase
from app.schemas import WebhookEventInfo # MediaInfo 未在原版 BangumiSyncDebug 中使用
from app.schemas.types import EventType # MediaType 未在原版 BangumiSyncDebug 中使用
from app.utils.http import RequestUtils # RequestUtils 未在原版 BangumiSyncDebug 中直接使用，而是通过 requests.Session
from cachetools import cached, TTLCache
import requests # 注意：在async函数中应使用异步HTTP库如httpx
from urllib.parse import urlencode, quote_plus # 用于构建URL参数
#from app.core.user import User # 导入User模型以获取用户ID
#from app.core.request import Request # 导入Request模型以处理API请求和响应
# User 和 Request 类型将使用 Any 代替，因为它们在目标环境中不存在
from typing import Tuple, List, Dict, Any




# Bangumi OAuth 相关的 URL
BANGUMI_AUTHORIZE_URL = "https://bgm.tv/oauth/authorize" # 授权页面 URL
BANGUMI_TOKEN_URL = "https://bgm.tv/oauth/access_token" # 令牌交换接口 URL
BANGUMI_USER_INFO_URL = "https://api.bgm.tv/v0/me" # 获取用户信息的接口示例

class BangumiSyncV2Test(_PluginBase):
    # 插件名称
    plugin_name = "bgm-V2-测试"
    # 插件描述
    plugin_desc = "将在看记录同步到bangumi"
    # 插件图标
    plugin_icon = "https://raw.githubusercontent.com/honue/MoviePilot-Plugins/main/icons/bangumi.jpg"
    # 插件版本
    plugin_version = "1.0.7" # 版本更新
    # 插件作者
    plugin_author = "honue,happyTonakai,AAA"
    # 作者主页
    author_url = "https://github.com/l429609201"
    # 插件配置项ID前缀
    plugin_config_prefix = "bangumisyncv2test_"
    # 加载顺序
    plugin_order = 20
    # 可使用的用户级别
    auth_level = 1

    UA = "l429609201/MoviePilot-Plugins (https://github.com/l429609201)"

    _enable = True
    _user = None
    _bgm_uid = None # Token模式下的Bangumi UID
    _token = None # Token模式下的Access Token
    _tmdb_key = None
    _request: Optional[requests.Session] = None # requests.Session实例
    _uniqueid_match = False

    _auth_method = "token" # 'token' or 'oauth'
    _oauth_app_id: Optional[str] = None
    _oauth_app_secret: Optional[str] = None
    
    # _moviepilot_public_url: Optional[str] = None # 移除：不再需要手动配置公开 URL
    # 存储全局OAuth信息，值为包含token, refresh_token, expire_time, Bangumi用户信息等的字典
    _global_oauth_info: Optional[Dict[str, Any]] = None

    _tab = 'auth-method-tab' # 用于get_form中的标签页

    def init_plugin(self, config: dict = None):
        if config:
            self._enable = config.get('enable', False)
            self._uniqueid_match = config.get('uniqueid_match', False)
            self._user = config.get('user') if config.get('user') else None
            self._token = config.get('token') if config.get('token') else None

            self._auth_method = config.get('auth_method', 'token')
            self._oauth_app_id = config.get('oauth_app_id') if config.get('oauth_app_id') else None
            self._oauth_app_secret = config.get('oauth_app_secret') if config.get('oauth_app_secret') else None
            self._tab = config.get('tab', 'auth-method-tab') # 加载tab状态
            # self._moviepilot_public_url = config.get('moviepilot_public_url') # 移除加载

            # 加载全局OAuth信息
            self._global_oauth_info = config.get('global_oauth_info')
            if not isinstance(self._global_oauth_info, dict) and self._global_oauth_info is not None: # 兼容旧的空字典或错误类型
                self._global_oauth_info = None

            self._tmdb_key = settings.TMDB_API_KEY
            headers = {"User-Agent": BangumiSyncV2Test.UA, "content-type": "application/json"}
            self._request = requests.Session()
            self._request.headers.update(headers)
            if settings.PROXY:
                self._request.proxies.update(settings.PROXY)

            # --- 在此处打印加载的配置参数 ---
            logger.info(f"插件 {self.plugin_name} 初始化配置如下:")
            logger.info(f"  启用状态 (_enable): {self._enable}")
            logger.info(f"  唯一ID匹配 (_uniqueid_match): {self._uniqueid_match}")
            logger.info(f"  媒体服务器用户 (_user): {self._user}")
            logger.info(f"  认证方式 (_auth_method): {self._auth_method}")
            # 出于安全考虑，Token 和 Secret 通常不建议直接打印到日志，
            # 但如果确实需要调试，可以取消下面行的注释，并确保在生产环境中移除或使用更安全的方式。
            # logger.info(f"  Bangumi Token (_token): {'******' if self._token else '未配置'}")
            # logger.info(f"  OAuth App ID (_oauth_app_id): {self._oauth_app_id if self._oauth_app_id else '未配置'}")
            # logger.info(f"  OAuth App Secret (_oauth_app_secret): {'******' if self._oauth_app_secret else '未配置'}")
            logger.info(f"  TMDB API Key (_tmdb_key): {'已配置' if self._tmdb_key else '未配置'}")
            logger.info(f"  上次选择的标签页 (_tab): {self._tab}")
            logger.info(f"  全局OAuth信息 (_global_oauth_info): {'已存在' if self._global_oauth_info else '不存在或为空'}")
            # --- 配置参数打印结束 ---

            self.__update_config()
            logger.info(f"Bangumi在看同步插件 v{BangumiSyncV2Test.plugin_version} 初始化成功")
        else:
            # 首次加载或无配置时，确保默认值被应用和保存
            self._global_oauth_info = None # 确保默认是None
            self.__update_config()


    def _get_moviepilot_base_url(self, request: Any) -> Optional[str]:
        """
        从传入的请求对象中获取MoviePilot的基础URL。
        这依赖于 MoviePilot 框架传入的 request 对象结构。
        """
        if not request:
            logger.error("无法获取 MoviePilot 基础 URL：request 对象为空。")
            return None

        try:
            # 尝试从 request 对象中获取 scheme 和 host
            # FastAPI 的 Request 对象通常有 request.url.scheme 和 request.url.netloc
            # 如果 MoviePilot 传递的是其他结构的对象，这里的访问方式可能需要调整
            scheme = getattr(request.url, 'scheme', None)
            netloc = getattr(request.url, 'netloc', None)

            if not scheme or not netloc:
                logger.error(f"无法从 request 对象中解析 scheme 或 netloc。request.url 结构: {getattr(request, 'url', 'N/A')}")
                return None

            return f"{scheme}://{netloc}"
        except AttributeError as e:
            logger.error(f"解析 MoviePilot 基础 URL 时发生属性错误 (可能是 request 对象结构不符合预期): {e}")
            return None

    def _get_global_oauth_info(self) -> Optional[Dict[str, Any]]:
        """获取全局OAuth信息"""
        return self._global_oauth_info

    def _store_global_oauth_info(self, oauth_data: Optional[Dict[str, Any]]):
        """存储全局OAuth信息并更新配置"""
        self._global_oauth_info = oauth_data
        self.__update_config()

    def _delete_global_oauth_info(self):
        """删除全局OAuth信息并更新配置"""
        if self._global_oauth_info is not None:
            self._global_oauth_info = None
            self.__update_config()

    def _is_token_expired(self, oauth_info: Dict[str, Any]) -> bool:
        """检查存储的OAuth令牌是否已过期"""
        expire_time = oauth_info.get('expire_time') # 存储的是Unix时间戳
        if expire_time is None:
            return True # 没有过期时间，视为已过期
        # 增加一个5分钟的缓冲期，避免在临界点刷新失败
        return time.time() >= (expire_time - 300)

    async def _refresh_access_token(self) -> Tuple[Optional[str], Optional[str]]:
        """
        刷新全局Bangumi OAuth访问令牌。
        返回 (新的access_token, 错误信息)
        """
        oauth_info = self._get_global_oauth_info()
        if not oauth_info or not oauth_info.get('refresh_token'):
            return None, "未找到有效的刷新令牌 (Refresh Token)。"

        if not self._oauth_app_id or not self._oauth_app_secret:
             return None, "插件未配置Bangumi OAuth Application ID或Secret。"

        payload = {
            "grant_type": "refresh_token",
            "client_id": self._oauth_app_id,
            "client_secret": self._oauth_app_secret,
            "refresh_token": oauth_info['refresh_token'],
        }
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": self.UA
        }

        try:
            # 注意：在async函数中，requests是同步的，会阻塞。应使用httpx。
            # 为了演示，暂时保留requests，但实际项目中需要替换。
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: requests.post(BANGUMI_TOKEN_URL, data=payload, headers=headers, proxies=self._request.proxies if self._request else None))
            response.raise_for_status()
            token_data = response.json()

            expires_in = token_data.get('expires_in', 0)
            new_expire_time = time.time() + expires_in
            
            # 更新存储的令牌信息
            oauth_info['access_token'] = token_data['access_token']
            oauth_info['expire_time'] = new_expire_time
            if 'refresh_token' in token_data: # Bangumi有时会返回新的refresh_token
                oauth_info['refresh_token'] = token_data['refresh_token']
            
            self._store_global_oauth_info(oauth_info)
            logger.info(f"全局Bangumi令牌刷新成功。")
            return token_data['access_token'], None

        except requests.exceptions.HTTPError as http_err:
            error_message = f"刷新令牌HTTP错误: {http_err}"
            try:
                error_json = http_err.response.json()
                error_message += f". 响应: {error_json}"
            except ValueError:
                error_message += f". 响应文本: {http_err.response.text}"
            logger.error(f"刷新全局Bangumi令牌失败: {error_message}")
            if http_err.response.status_code == 400 and "invalid_grant" in http_err.response.text:
                 # refresh_token可能已失效，需要用户重新授权
                 self._delete_global_oauth_info()
                 logger.warning(f"全局Refresh Token已失效，已清除授权信息，请重新授权。")
                 return None, "Refresh Token已失效，请重新授权。"
            return None, error_message
        except Exception as e:
            logger.error(f"刷新全局Bangumi令牌时发生未知错误: {e}")
            return None, f"刷新令牌时发生未知错误: {e}"

    async def _get_valid_access_token(self) -> Optional[str]:
        """获取有效的访问令牌，如果过期则尝试刷新"""
        oauth_info = self._get_global_oauth_info()
        if not oauth_info or not oauth_info.get('access_token'):
            logger.debug(f"全局: 未找到OAuth信息或访问令牌。")
            return None

        if self._is_token_expired(oauth_info):
            logger.info(f"全局: Bangumi访问令牌已过期，尝试刷新...")
            access_token, error = await self._refresh_access_token()
            if error:
                logger.warning(f"全局: 令牌刷新失败: {error}")
                return None
            return access_token
        
        return oauth_info['access_token']

    async def _bangumi_api_request(self, method: str, url: str, **kwargs) -> requests.Response:
        """
        统一的Bangumi API请求方法，处理认证。
        """
        headers = kwargs.pop('headers', {}) # 获取传入的headers，如果没有则为空字典
        headers.update({"User-Agent": self.UA}) # 确保UA存在

        if self._auth_method == 'token':
            if not self._token:
                raise ValueError("Access Token认证方式未配置Token。")
            headers["Authorization"] = f"Bearer {self._token}"
        elif self._auth_method == 'oauth':
            access_token = await self._get_valid_access_token()
            if not access_token:
                raise ValueError(f"全局: 未找到有效的Bangumi OAuth访问令牌。")
            headers["Authorization"] = f"Bearer {access_token}"
        else:
            raise ValueError(f"未知的认证方式: {self._auth_method}")
        
        # 确保content-type存在 (如果发送json数据)
        if 'json' in kwargs and 'content-type' not in headers:
            headers['content-type'] = 'application/json'

        # 使用插件的requests.Session实例
        loop = asyncio.get_event_loop()
        if not self._request:
            logger.warning("self._request 未在 init_plugin 中初始化，将创建临时 Session。")
            temp_session = requests.Session()
            if settings.PROXY:
                temp_session.proxies.update(settings.PROXY)
            response = await loop.run_in_executor(None, lambda: temp_session.request(method, url, headers=headers, **kwargs))
        else:
            response = await loop.run_in_executor(None, lambda: self._request.request(method, url, headers=headers, **kwargs))
        
        return response

    @eventmanager.register(EventType.WebhookMessage)
    async def hook(self, event: Event):
        if not self._enable:
            logger.warning(f"{self.plugin_name}: 未开启插件，请到设置界面点击启用插件。")
            return

        if self._auth_method == 'token':
            if not self._token:
                logger.warning(f"{self.plugin_name}: Token认证方式未配置Access Token，插件功能受限。")
                return
        elif self._auth_method == 'oauth':
            if not self._global_oauth_info:
                logger.warning(f"{self.plugin_name}: OAuth认证方式已选择，但尚未完成授权。")
                return
            
            access_token = await self._get_valid_access_token()
            if not access_token:
                 logger.warning(f"{self.plugin_name}: OAuth认证令牌无效或无法刷新。请在插件设置中重新授权。")
                 return
        else:
            logger.error(f"未知的认证方式: {self._auth_method}")
            return

        try:
            logger.debug(f"收到webhook事件: {event.event_data}")
            event_info: WebhookEventInfo = event.event_data

            if not self._user or event_info.user_name not in self._user.split(','):
                return

            play_start = {"playback.start", "media.play", "PlaybackStart"}
            if not (event_info.event in play_start or (event_info.percentage and event_info.percentage > 90)):
                return

            if not BangumiSyncV2Test.is_anime(event_info):
                return

            if event_info.item_type in ["TV"]:
                tmdb_id = event_info.tmdb_id
                logger.info(f"匹配播放事件 {event_info.item_name} tmdb id = {tmdb_id}...")
                match = re.match(r"^(.+?)\sS\d+E\d+\s.*", event_info.item_name) 
                title = match.group(1).strip() if match else event_info.item_name.split(' ')[0].strip()

                season_id, episode_id = int(event_info.season_id), int(event_info.episode_id)
                self._prefix = f"[{title} S{season_id:02d}E{episode_id:02d}]" 

                unique_id = int(tmdb_id) if tmdb_id and tmdb_id.isdigit() else None

                subject_id, subject_name, original_episode_name = await self.get_subjectid_by_title(
                    title, season_id, episode_id, unique_id
                )

                if subject_id is None:
                    logger.info(f"{self._prefix} 未能从Bangumi找到对应的条目ID。")
                    return

                logger.info(f"{self._prefix} 匹配成功: 本地 '{title}' (原始单集名: {original_episode_name or 'N/A'}) => Bangumi '{subject_name}' (ID: {subject_id}, https://bgm.tv/subject/{subject_id})")
                await self.sync_watching_status(subject_id, episode_id, original_episode_name)

        except Exception as e:
            logger.exception(f"同步在看状态失败: {e}") 

    @cached(TTLCache(maxsize=100, ttl=3600))
    async def get_subjectid_by_title(self, title: str, season: int, episode: int, unique_id: Optional[int]) -> Tuple[Optional[int], Optional[str], Optional[str]]:
        current_prefix = getattr(self, '_prefix', f"[{title} S{season:02d}E{episode:02d}]")
        logger.debug(f"{current_prefix} 尝试使用 bgm api 来获取 subject id...")
        
        tmdb_data = await self.get_tmdb_id(title) 
        tmdb_id, original_name, original_language = tmdb_data if tmdb_data else (None, None, None)
        
        original_episode_name = None
        post_json = {
            "keyword": title,
            "sort": "match",
            "filter": {"type": [2]}, 
        }

        if tmdb_id is not None and original_name and original_language:
            airdate_info = await self.get_airdate_and_ep_name(
                tmdb_id, season, episode, unique_id if self._uniqueid_match else None, original_language
            )
            if airdate_info:
                start_date, end_date, tmdb_original_episode_name = airdate_info
                original_episode_name = tmdb_original_episode_name
                if start_date and end_date:
                    post_json = {
                        "keyword": original_name,
                        "sort": "match",
                        "filter": {"type": [2], "air_date": [f">={start_date}", f"<={end_date}"]},
                    }
        
        url = f"https://api.bgm.tv/v0/search/subjects"
        try:
            response = await self._bangumi_api_request('POST', url, json=post_json)
            response.raise_for_status() 
            resp_json = response.json()
        except (requests.exceptions.RequestException, ValueError, json.JSONDecodeError) as e:
            logger.error(f"{current_prefix} 请求或解析Bangumi搜索API失败: {e}")
            return None, None, None

        if not resp_json.get("data"):
            logger.warning(f"{current_prefix} 未找到 '{post_json['keyword']}' 的bgm条目")
            return None, None, None
        
        data = resp_json.get("data")[0]
        year = data.get("date", "----")[:4]
        name_cn = data.get("name_cn") or data.get("name", "未知标题")
        formatted_name = f"{name_cn} ({year})"
        subject_id_val = data.get("id")

        return subject_id_val, formatted_name, original_episode_name


    @cached(TTLCache(maxsize=100, ttl=3600))
    async def get_tmdb_id(self, title: str): 
        current_prefix = getattr(self, '_prefix', f"[{title}]")
        logger.debug(f"{current_prefix} 尝试使用 tmdb api 来获取 subject id...")
        if not self._tmdb_key: 
            logger.warning(f"{current_prefix} TMDB API Key未配置。")
            return None, None, None
        url = f"https://api.tmdb.org/3/search/tv?query={title}&api_key={self._tmdb_key}"
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: self._request.get(url) if self._request else requests.get(url))
            response.raise_for_status()
            ret = response.json()
        except Exception as e:
            logger.error(f"{current_prefix} 请求或解析TMDB ID失败 for '{title}': {e}")
            return None, None, None
        if not ret.get("total_results"):
            logger.warning(f"{current_prefix} 未找到 '{title}' 的 tmdb 条目")
            return None, None, None
        for result in ret["results"]:
            if 16 in result.get("genre_ids", []): 
                return result.get("id"), result.get("original_name"), result.get("original_language")
        return None, None, None

    @cached(TTLCache(maxsize=100, ttl=3600))
    async def get_airdate_and_ep_name(self, tmdbid: int, season_id: int, episode: int, unique_id: Optional[int], original_language: str):
        current_prefix = getattr(self, '_prefix', f"[TMDBID:{tmdbid} S{season_id:02d}E{episode:02d}]")
        if not self._tmdb_key: 
            logger.warning(f"{current_prefix} TMDB API Key未配置。")
            return None, None, None
        logger.debug(f"{current_prefix} 尝试使用 tmdb api 来获取 airdate...")
        
        async def get_tv_season_detail_async(tmdbid_local: int, season_id_local: int) -> Optional[dict]:
            loop = asyncio.get_event_loop()
            
            url_season = f"https://api.tmdb.org/3/tv/{tmdbid_local}/season/{season_id_local}?language={original_language}&api_key={self._tmdb_key}"
            try:
                response_season = await loop.run_in_executor(None, lambda: self._request.get(url_season) if self._request else requests.get(url_season))
                response_season.raise_for_status()
                resp_json = response_season.json()
                if resp_json and resp_json.get("episodes"):
                    return resp_json
            except Exception as e_season:
                logger.debug(f"{current_prefix} get_tv_season_detail (season {season_id_local}) 失败: {e_season}")

            logger.debug(f"{current_prefix} 无法通过季号获取TMDB季度信息，尝试通过episode group获取")
            url_groups = f"https://api.tmdb.org/3/tv/{tmdbid_local}/episode_groups?api_key={self._tmdb_key}"
            try:
                response_groups = await loop.run_in_executor(None, lambda: self._request.get(url_groups) if self._request else requests.get(url_groups))
                response_groups.raise_for_status()
                resp_groups_json = response_groups.json()
                if resp_groups_json and resp_groups_json.get("results"):
                    seasons_groups = [r for r in resp_groups_json["results"] if r.get("name") == "Seasons"]
                    if seasons_groups:
                        season_group_data = min(seasons_groups, key=lambda x: x.get("episode_count", float('inf')))
                        url_group_detail = f"https://api.tmdb.org/3/tv/episode_group/{season_group_data.get('id')}?language={original_language}&api_key={self._tmdb_key}"
                        response_group_detail = await loop.run_in_executor(None, lambda: self._request.get(url_group_detail) if self._request else requests.get(url_group_detail))
                        response_group_detail.raise_for_status()
                        resp_group_detail_json = response_group_detail.json()
                        if resp_group_detail_json and resp_group_detail_json.get("groups"):
                            for group_item in resp_group_detail_json["groups"]:
                                if group_item.get("name", "").startswith(f"Season {season_id_local}"):
                                    return group_item 
            except Exception as e_group:
                logger.debug(f"{current_prefix} get_tv_season_detail (episode_groups) 失败: {e_group}")
            return None

        resp_season_detail = await get_tv_season_detail_async(tmdbid, season_id)
        if not resp_season_detail or "episodes" not in resp_season_detail:
            logger.warning(f"{current_prefix} 无法获取TMDB季度信息")
            return None, None, None
        
        episodes_list = resp_season_detail["episodes"]
        if not episodes_list: 
            logger.warning(f"{current_prefix} 该季度没有剧集信息")
            return None, None, None

        air_date_str = resp_season_detail.get("air_date")
        matched_ep_data = None
        for ep_data in episodes_list:
            if air_date_str is None: air_date_str = ep_data.get("air_date")
            current_ep_matched = False
            if self._uniqueid_match and unique_id and ep_data.get("id") == unique_id: current_ep_matched = True
            elif ep_data.get("order", -99) + 1 == episode: current_ep_matched = True
            elif ep_data.get("episode_number") == episode: current_ep_matched = True
            if current_ep_matched: matched_ep_data = ep_data; break
            if ep_data.get("episode_type") in ["finale", "mid_season"]: air_date_str = None
        
        if not matched_ep_data: 
            logger.warning(f"{current_prefix} 未找到匹配的TMDB剧集")
            return None, None, None
        if not air_date_str: air_date_str = matched_ep_data.get("air_date")
        if not air_date_str: 
            logger.warning(f"{current_prefix} 未找到匹配的TMDB剧集或播出日期")
            return None, None, matched_ep_data.get("name")
        
        original_episode_name = matched_ep_data.get("name")
        try: 
            air_date_obj = datetime.datetime.strptime(air_date_str, "%Y-%m-%d").date()
        except ValueError: 
            logger.warning(f"{current_prefix} TMDB提供的播出日期格式无效: {air_date_str}")
            return None, None, original_episode_name
        
        start_date = (air_date_obj - datetime.timedelta(days=15)).strftime("%Y-%m-%d")
        end_date = (air_date_obj + datetime.timedelta(days=15)).strftime("%Y-%m-%d")
        return start_date, end_date, original_episode_name

    @cached(TTLCache(maxsize=10, ttl=600))
    async def sync_watching_status(self, subject_id: int, episode: int, original_episode_name: Optional[str]):
        current_prefix = getattr(self, '_prefix', f"[BGM Subject:{subject_id} E{episode:02d}]")
        bgm_uid_to_pass = None
        if self._auth_method == 'token':
            if not self._bgm_uid:
                try:
                    response = await self._bangumi_api_request('GET', BANGUMI_USER_INFO_URL)
                    response.raise_for_status()
                    self._bgm_uid = response.json().get("id")
                    if not self._bgm_uid: 
                        logger.error(f"{current_prefix} 获取Bangumi UID失败。")
                        return
                    logger.debug(f"{current_prefix} 获取到 bgm_uid {self._bgm_uid}")
                except Exception as e: 
                    logger.error(f"{current_prefix} 请求或解析Bangumi /me API失败: {e}")
                    return
            bgm_uid_to_pass = self._bgm_uid
        elif self._auth_method == 'oauth':
            oauth_info = self._get_global_oauth_info()
            if not oauth_info or 'bangumi_user_id' not in oauth_info: 
                logger.error(f"{current_prefix} 全局OAuth模式下未找到Bangumi用户ID。")
                return
            bgm_uid_to_pass = oauth_info['bangumi_user_id']
        else: 
            logger.error(f"{current_prefix} 未知认证方式。")
            return

        await self.update_collection_status(subject_id, bgm_uid_to_pass)
        ep_info_list = await self.get_episodes_info(subject_id)
        if not ep_info_list: 
            logger.warning(f"{current_prefix} 未获取到剧集列表。")
            return

        found_episode_id = None
        matched_bangumi_ep_info = None
        if original_episode_name:
            for info_item in ep_info_list:
                if info_item.get("name") == original_episode_name: 
                    found_episode_id = info_item.get("id")
                    matched_bangumi_ep_info = info_item
                    break
        if not found_episode_id:
            for info_item in ep_info_list:
                if info_item.get("sort") == episode: 
                    found_episode_id = info_item.get("id")
                    matched_bangumi_ep_info = info_item
                    break
        if not found_episode_id:
            for info_item in ep_info_list:
                if info_item.get("ep") == episode: 
                    found_episode_id = info_item.get("id")
                    matched_bangumi_ep_info = info_item
                    break
        
        if not found_episode_id: 
            logger.warning(f"{current_prefix} 未找到匹配的Bangumi剧集。")
            return
        
        await self.update_episode_status(found_episode_id)
        
        last_episode_flag = False
        if matched_bangumi_ep_info:
            main_episodes = [ep for ep in ep_info_list if ep.get("type") == 0]
            if main_episodes and matched_bangumi_ep_info.get("id") == main_episodes[-1].get("id"):
                last_episode_flag = True
        if last_episode_flag:
            await self.update_collection_status(subject_id, bgm_uid_to_pass, 2) 

    @cached(TTLCache(maxsize=100, ttl=3600))
    async def update_collection_status(self, subject_id: int, bgm_uid_for_get: Optional[int], new_type: int = 3):
        current_prefix = getattr(self, '_prefix', f"[BGM Subject:{subject_id}]")
        type_dict = {0:"未收藏", 1:"想看", 2:"看过", 3:"在看", 4:"搁置", 5:"抛弃"}
        old_type = 0
        if bgm_uid_for_get: 
            collection_url = f"https://api.bgm.tv/v0/users/{bgm_uid_for_get}/collections/{subject_id}"
            try:
                response_get = await self._bangumi_api_request('GET', collection_url)
                if response_get.status_code == 200: 
                    old_type = response_get.json().get("type", 0)
                elif response_get.status_code == 404: 
                    logger.debug(f"{current_prefix} 条目 {subject_id} 尚未收藏。")
                else: 
                    logger.warning(f"{current_prefix} 获取当前收藏状态失败 (code: {response_get.status_code})。")
            except Exception as e: 
                logger.warning(f"{current_prefix} 请求当前收藏状态失败: {e}。")

        if (old_type == 2 and new_type == 3) or old_type == new_type:
            logger.info(f"{current_prefix} 合集状态 {type_dict.get(old_type, old_type)} => {type_dict.get(new_type, new_type)}，无需更新。")
            return
        
        update_url = f"https://api.bgm.tv/v0/users/-/collections/{subject_id}"
        post_data = {"type": new_type, "comment": "", "private": False}
        try:
            response_post = await self._bangumi_api_request('POST', update_url, json=post_data)
            if response_post.status_code in [201, 202, 204]: 
                logger.info(f"{current_prefix} 合集状态 {type_dict.get(old_type,old_type)} => {type_dict.get(new_type,new_type)}，更新成功。")
            else:
                logger.warning(f"{current_prefix} 合集状态更新失败 (code: {response_post.status_code}): {response_post.text}")
        except Exception as e:
             logger.error(f"{current_prefix} 更新Bangumi合集状态失败: {e}")

    @cached(TTLCache(maxsize=100, ttl=3600))
    async def get_episodes_info(self, subject_id: int) -> Optional[List[Dict[str, Any]]]:
        current_prefix = getattr(self, '_prefix', f"[BGM Subject:{subject_id}]")
        url = "https://api.bgm.tv/v0/episodes"
        params = {"subject_id": subject_id}
        try:
            response = await self._bangumi_api_request('GET', url, params=params)
            response.raise_for_status()
            ep_data = response.json().get("data")
            logger.debug(f"{current_prefix} 获取 episode info 成功。")
            return ep_data if isinstance(ep_data, list) else []
        except Exception as e:
            logger.error(f"{current_prefix} 请求或解析Bangumi剧集列表API失败: {e}")
        return None

    @cached(TTLCache(maxsize=100, ttl=3600))
    async def update_episode_status(self, episode_id: int):
        current_prefix = getattr(self, '_prefix', f"[BGM Episode:{episode_id}]")
        url = f"https://api.bgm.tv/v0/users/-/collections/-/episodes/{episode_id}"
        try:
            response_get = await self._bangumi_api_request('GET', url)
            if response_get.status_code == 200 and response_get.json().get("type") == 2:
                logger.info(f"{current_prefix} 单集已经标记为看过。")
                return
            elif response_get.status_code not in [200, 404]: 
                logger.warning(f"{current_prefix} 获取单集信息失败 (code: {response_get.status_code})。")
                
            # 标记为看过
            response_put = await self._bangumi_api_request('PUT', url, json={"type": 2}) 
            if response_put.status_code == 204:
                logger.info(f"{current_prefix} 单集标记为看过成功。")
            else:
                logger.warning(f"{current_prefix} 单集标记为看过失败 (code: {response_put.status_code}): {response_put.text}")
        except Exception as e:
            logger.error(f"{current_prefix} 更新Bangumi单集 {episode_id} 观看状态失败: {e}")

    @staticmethod
    def is_anime(event_info: WebhookEventInfo) -> bool:
        path_keyword = "日番,cartoon,动漫,动画,ani,anime,新番,番剧,特摄,bangumi,ova,映画,国漫,日漫"
        path_to_check = ""
        if event_info.channel in ["emby", "jellyfin"]:
            path_to_check = event_info.item_path or ""
            if not path_to_check and event_info.library_name: path_to_check = event_info.library_name
        elif event_info.channel == "plex":
            path_to_check = event_info.json_object.get("Metadata", {}).get("librarySectionTitle", "") if event_info.json_object else ""
        if any(keyword in path_to_check.lower() for keyword in path_keyword.split(',')): return True
        logger.debug(f"{path_to_check} 不是动漫媒体库")
        return False

    @staticmethod
    def format_title(title: str, season: int): 
        if season < 2: return title
        season_zh_map = {0:"零",1:"一",2:"二",3:"三",4:"四",5:"五",6:"六",7:"七",8:"八",9:"九"}
        season_zh = season_zh_map.get(season % 10 if season < 10 else season) 
        return f"{title} 第{season_zh}季" if season_zh else f"{title} S{season}"

    @staticmethod
    def get_command() -> List[Dict[str, Any]]: return []

    def get_api(self) -> List[Dict[str, Any]]:
        return [
            {
                "path": "/oauth_authorize", 
                "methods": ["GET"], 
                "endpoint": self._handle_oauth_authorize,  
                "summary": "开始Bangumi OAuth授权",
                "description": "开始Bangumi OAuth授权"
            },
            {
                "path": "/oauth_callback", 
                "methods": ["GET"], 
                "endpoint": self._handle_oauth_callback, 
                "summary": "Bangumi OAuth回调处理",
                "description": "Bangumi OAuth回调处理"
            },
            {
                "path": "/oauth_status", 
                "methods": ["GET"], 
                "endpoint": self._handle_oauth_status, 
                "summary": "获取Bangumi OAuth状态",
                "description": "获取Bangumi OAuth授权状态"
            },
            {
                "path": "/oauth_deauthorize", 
                "methods": ["GET"], 
                "endpoint": self._handle_oauth_deauthorize, 
                "summary": "解除Bangumi OAuth授权",
                "description": "解除Bangumi OAuth授权"
             },
        ]

    async def _handle_oauth_authorize(self, request: Any, user: Any):        #开始授权函数
        if not self._oauth_app_id:
            return {"status": "error", "message": "插件未配置Bangumi OAuth Application ID。"}
        
        moviepilot_base_url = self._get_moviepilot_base_url(request) # 传入 request 对象
        if not moviepilot_base_url:
            return {"status": "error", "message": "MoviePilot 公开 URL 未配置或无效，无法构建回调地址。"}

        callback_path = f"/api/v1/plugins/{self.plugin_config_prefix.strip('_')}/oauth_callback" # 保持与 get_api 中的路径一致
        redirect_uri = f"{moviepilot_base_url}{callback_path}"
        state_data = {"csrf_token": str(uuid.uuid4())} # State中仅保留CSRF token
        
        state_param = quote_plus(json.dumps(state_data))
        auth_url = f"{BANGUMI_AUTHORIZE_URL}?client_id={self._oauth_app_id}&redirect_uri={quote_plus(redirect_uri)}&response_type=code&state={state_param}"
        logger.info(f"开始全局Bangumi OAuth授权 (操作用户: {getattr(user, 'id', 'Unknown')})，回调至: {redirect_uri}，授权URL: {auth_url}")
        return {"status": "success", "auth_url": auth_url} 

    async def _handle_oauth_callback(self, request: Any, user: Optional[Any] = None):            #处理回调
        code = request.query_params.get('code')
        state_param = request.query_params.get('state')
        error_from_bgm = request.query_params.get('error')
        
        response_obj = request.Response
        response_obj.ContentType = "text/html"; response_obj.StatusCode = 200
        writer = response_obj.OutputWriter
        async def send_html(msg: str, is_err: bool = False):
            title = "Bangumi OAuth Error" if is_err else "Bangumi OAuth"
            body = f"<h1>{title}</h1><p>{msg}</p>"
            if not is_err: body += "<p>授权成功！此窗口将自动关闭。</p><script>if(window.opener){window.opener.postMessage('BANGUMI-OAUTH-COMPLETE', '*');} window.close();</script>"
            else: body += "<p>请关闭此窗口并重试。</p>"
            await writer.write_async(f"<html><head><title>{title}</title></head><body>{body}</body></html>".encode('utf-8'))
            await response_obj.CompleteAsync()

        if error_from_bgm: await send_html(f"Bangumi返回错误: {error_from_bgm}", True); return
        if not code or not state_param: await send_html("回调参数不完整。", True); return

        try:
            state_data = json.loads(quote_plus(state_param, inverse=True))
            # moviepilot_user_id = state_data.get('mp_user_id') # 不再从state中获取mp_user_id
            
            if not state_data.get('csrf_token'): # 仅校验CSRF token
                await send_html("State参数无效或CSRF校验失败。", True); return
        except Exception as e: await send_html(f"解析回调参数时发生错误: {e}", True); return
        
        if not self._oauth_app_id or not self._oauth_app_secret:
            await send_html("插件OAuth配置不完整。", True); return

        moviepilot_base_url = self._get_moviepilot_base_url(request) # 传入 request 对象
        if not moviepilot_base_url:
            logger.error("全局OAuth回调: MoviePilot 公开 URL 未配置或无效，无法构建令牌交换的回调地址。")
            await send_html("插件内部错误：无法确定 MoviePilot 服务器地址。", True); return

        callback_path = f"/api/v1/plugins/{self.plugin_config_prefix.strip('_')}/oauth_callback" # 保持与 get_api 中的路径一致
        redirect_uri_for_token = f"{moviepilot_base_url}{callback_path}"
        payload = {"grant_type": "authorization_code", "client_id": self._oauth_app_id, 
                   "client_secret": self._oauth_app_secret, "code": code, "redirect_uri": redirect_uri_for_token}
        headers = {"Content-Type": "application/x-www-form-urlencoded", "User-Agent": self.UA}
        try:
            loop = asyncio.get_event_loop()
            response_token = await loop.run_in_executor(None, lambda: requests.post(BANGUMI_TOKEN_URL, data=payload, headers=headers, proxies=self._request.proxies if self._request else None))
            response_token.raise_for_status()
            token_data = response_token.json()
            token_data['expire_time'] = time.time() + token_data.get('expires_in', 0)
            
            profile_data, profile_error = await self._get_user_profile(token_data.get('access_token'))
            if profile_error: logger.warning(f"全局OAuth: 获取Bangumi用户信息失败: {profile_error}。")
            
            token_data['bangumi_user_id'] = profile_data.get('id') if profile_data else token_data.get('user_id')
            token_data['nickname'] = profile_data.get('nickname') if profile_data else f"BGM User {token_data.get('user_id')}"
            token_data['avatar'] = profile_data.get('avatar', {}).get('large') if profile_data and profile_data.get('avatar') else None
            token_data['url'] = profile_data.get('url') if profile_data else None
            
            self._store_global_oauth_info(token_data)
            logger.info(f"全局成功通过Bangumi OAuth授权，Bangumi用户: {token_data.get('nickname')}")
            await send_html(f"成功授权Bangumi账户：{token_data.get('nickname')}")
        except requests.exceptions.HTTPError as http_err:
            error_msg = f"交换令牌时HTTP错误: {http_err}"
            try: error_msg += f". 响应: {http_err.response.json()}"
            except ValueError: error_msg += f". 响应文本: {http_err.response.text}"
            logger.error(f"全局OAuth回调: {error_msg}")
            await send_html(error_msg, True)
        except Exception as e:
            logger.exception(f"全局OAuth回调处理中发生未知错误: {e}")
            await send_html(f"处理回调时发生内部错误: {e}", True)

    async def _handle_oauth_status(self, request: Any, user: Any):                             #获取当前OAuth状态
        oauth_info = self._get_global_oauth_info()
        if not oauth_info: return {"authorized": False, "nickname": None, "avatar": None}
        
        access_token = await self._get_valid_access_token()
        if not access_token:
             self._delete_global_oauth_info()
             return {"authorized": False, "nickname": None, "avatar": None, "message": "令牌已失效或无法刷新，请重新授权。"}
        
        refreshed_oauth_info = self._get_global_oauth_info() # 获取最新的（可能已刷新）
        return {"authorized": True, 
                "nickname": refreshed_oauth_info.get('nickname'), 
                "avatar": refreshed_oauth_info.get('avatar'),
                "bangumi_user_id": refreshed_oauth_info.get('bangumi_user_id'),
                "expire_time_readable": datetime.datetime.fromtimestamp(refreshed_oauth_info.get('expire_time', 0)).strftime('%Y-%m-%d %H:%M:%S') if refreshed_oauth_info.get('expire_time') else "N/A"}

    async def _handle_oauth_deauthorize(self, request: Any, user: Any):                               #解除授权
        self._delete_global_oauth_info()
        logger.info(f"全局Bangumi OAuth授权已解除 (操作用户: {getattr(user, 'id', 'Unknown')})。")
        return {"status": "success", "message": "已成功解除授权。"}

    async def _get_user_profile(self, access_token: str) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        if not access_token: return None, "Access token is missing."
        headers = {"Authorization": f"Bearer {access_token}", "User-Agent": self.UA}
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: requests.get(BANGUMI_USER_INFO_URL, headers=headers, proxies=self._request.proxies if self._request else None))
            response.raise_for_status()
            return response.json(), None
        except requests.exceptions.RequestException as e:
            error_msg = f"获取 Bangumi 用户信息失败: {e}"
            if e.response is not None:
                 try: error_msg += f". 响应: {e.response.json()}"
                 except ValueError: error_msg += f". 响应文本: {e.response.text}"
            return None, error_msg
        except Exception as e:
             return None, f"获取用户信息时发生未知错误: {e}"

    def get_form(self) -> Tuple[List[dict], Dict[str, Any]]:
        form_structure = [
            {  # VCard for 基础设置 (保留V2Test的VCard结构)
                "component": "VCard",
                "props": {"variant": "outlined", "class": "mb-3"},
                "content": [
                    {
                        "component": "VCardTitle",
                        "props": {"class": "d-flex align-center"},
                        "content": [
                            {
                                "component": "VIcon",
                                "props": {"icon": "mdi-cog", "color": "primary", "class": "mr-2"},
                            },
                            {"component": "span", "text": "基础设置"},
                        ],
                    },
                    {"component": "VDivider"},
                    {
                        "component": "VCardText",
                        "content": [
                            {
                                "component": "VForm",
                                "content": [
                                    {
                                        "component": "VRow",
                                        "content": [
                                            {
                                                "component": "VCol",
                                                "props": {
                                                    "cols": 12,
                                                    "md": 4
                                                },
                                                "content": [
                                                    {
                                                        "component": "VSwitch",
                                                        "props": {
                                                            "model": "enable",
                                                            "label": "启用插件",
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                "component": "VCol",
                                                "props": {
                                                    "cols": 12,
                                                    "md": 4
                                                },
                                                "content": [
                                                    {
                                                        "component": "VSwitch",
                                                        "props": {
                                                            "model": "uniqueid_match",
                                                            "label": "集唯一ID匹配",
                                                        }
                                                    }
                                                ]
                                            },
                                        ]
                                    },
                                    {
                                        "component": "VRow",
                                        "content": [
                                            {
                                                "component": "VCol",
                                                "props": {
                                                    "cols": 12,
                                                    "md": 6
                                                },
                                                "content": [
                                                    {
                                                        "component": "VTextField",
                                                        "props": {
                                                            "model": "user",
                                                            "label": "媒体服务器用户名",
                                                            "placeholder": "你的Emby/Plex用户名",
                                                            "hint": "多个用逗号隔开",
                                                            "persistentHint": True,
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {  # VCard for 认证方式和参数设置 (保留V2Test的Tabs结构)
                "component": "VCard",
                "props": {"variant": "outlined"},
                "content": [
                    {
                        "component": "VTabs",
                        "props": {"model": "tab", "grow": True, "color": "primary"},
                        "content": [
                            {
                                "component": "VTab",
                                "props": {"value": "auth-method-tab"},
                                "content": [
                                    {
                                        "component": "VIcon",
                                        "props": {"icon": "mdi-shield-key", "start": True, "color": "#1976D2"},
                                    },
                                    {"component": "span", "text": "认证方式"},
                                ],
                            },
                            {
                                "component": "VTab",
                                "props": {"value": "params-tab"},
                                "content": [
                                    {
                                        "component": "VIcon",
                                        "props": {"icon": "mdi-tune", "start": True, "color": "#8958f4"},
                                    },
                                    {"component": "span", "text": "参数设置"},
                                ],
                            },
                        ],
                    },
                    {"component": "VDivider"},
                    {
                        "component": "VWindow",
                        "props": {"model": "tab"},
                        "content": [
                            {  # 认证方式 Tab
                                "component": "VWindowItem",
                                "props": {"value": "auth-method-tab"},
                                "content": [
                                    {
                                        "component": "VCardText",
                                        "content": [
                                            {
                                                "component": "VRadioGroup",
                                                "props": {
                                                    "model": "auth_method",
                                                    "inline": False,
                                                    "label": "选择Bangumi认证方式"
                                                },
                                                "content": [
                                                    {
                                                        "component": "VRadio",
                                                        "props": {
                                                            "label": "Access Token (推荐)",
                                                            "value": "token"
                                                        }
                                                    },
                                                    {
                                                        "component": "VRadio",
                                                        "props": {
                                                            "label": "OAuth 2.0", # 保持禁用状态
                                                            "value": "oauth"#,
                                                            #"disabled": True 
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {  # 参数设置 Tab
                                "component": "VWindowItem",
                                "props": {"value": "params-tab"},
                                "content": [
                                    {
                                        "component": "VCardText",
                                        "content": [
                                            { # Token input
                                                "component": "VRow",
                                                # "props": {"v-if": "config.auth_method === 'token'"}, # 前端控制显示
                                                "content": [
                                                    {
                                                        "component": "VCol",
                                                        "props": {"cols": 12},
                                                        "content": [
                                                            {
                                                                "component": "VTextField",
                                                                "props": {
                                                                    "model": "token",
                                                                    "label": "Bangumi Access Token",
                                                                    "placeholder": "填写得到的Access token",
                                                                    "type": "password",
                                                                    "hint": "用于Token认证方式。获取：https://next.bgm.tv/demo/access-token",
                                                                    "persistentHint": True,
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            { # OAuth inputs
                                                "component": "VRow",
                                                # "props": {"v-if": "config.auth_method === 'oauth'"}, # 前端控制显示
                                                "content": [
                                                    {
                                                        "component": "VCol",
                                                        "props": {"cols": 12, "md": 6},
                                                        "content": [
                                                            {
                                                                "component": "VTextField",
                                                                "props": {
                                                                    "model": "oauth_app_id",
                                                                    "label": "OAuth Application ID",
                                                                    "placeholder": "在此输入你的App ID",
                                                                    "hint": "用于OAuth认证方式", # 保持提示
                                                                    "persistentHint": True #,
                                                                    #"disabled": True, # 保持禁用
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    { 
                                                        "component": "VCol",
                                                        "props": {"cols": 12, "md": 6},
                                                        "content": [
                                                            {
                                                                "component": "VTextField",
                                                                "props": {
                                                                    "model": "oauth_app_secret",
                                                                    "label": "OAuth Application Secret",
                                                                    "placeholder": "在此输入你的App Secret",
                                                                    "type": "password",
                                                                    "hint": "用于OAuth认证方式", # 保持提示
                                                                    "persistentHint": True # ,
                                                                    #"disabled": True, # 保持禁用
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                "component": "VAlert",
                                                "props": {
                                                    "type": "info",
                                                    "variant": "tonal",
                                                    "text": (
                                                        "access-token获取：https://next.bgm.tv/demo/access-token\n"
                                                        "emby添加你mp的webhook（event要包括播放）： http://[MoviePilot地址]:[端口]/api/v1/webhook?token=moviepilot\n"
                                                        "感谢@HankunYu的想法"
                                                    ),
                                                    "style": "white-space: pre-line;"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]

        default_values = {
            "enable": False,
            "uniqueid_match": False,
            "user": "",
            "auth_method": "token", # 默认认证方式
            "token": "",
            "oauth_app_id": "",     # OAuth App ID
            "oauth_app_secret": "", # OAuth App Secret
            "tab": "auth-method-tab",  # 默认显示的标签页
            # "moviepilot_public_url": "", # 移除默认值
            "global_oauth_info": None # 全局OAuth信息默认为None
        }

        return form_structure, default_values

    def get_page(self) -> List[dict]:
        """
        拼装插件详情页面，显示 OAuth 授权状态和操作按钮。
        """
        # 检查是否已配置 OAuth App ID 和 Secret，这是进行 OAuth 的前提
        # 并且认证方式必须是 oauth
        if self._auth_method != 'oauth':
            return [
                {
                    'component': 'VAlert',
                    'props': {
                        'type': 'info',
                        'variant': 'tonal',
                        'text': '当前认证方式不是 OAuth。如需使用 OAuth 授权，请先在插件配置的“认证方式”标签页中选择 OAuth。'
                    }
                }
            ]
        
        if not self._oauth_app_id or not self._oauth_app_secret:
            return [
                {
                    'component': 'VAlert',
                    'props': {
                        'type': 'warning',
                        'variant': 'tonal',
                        'text': '请先在插件配置的“参数设置”中填写 OAuth Application ID 和 Secret。'
                    }
                }
            ]

        oauth_card_content = [
            {
                'component': 'VCardTitle',
                'text': 'Bangumi OAuth 授权管理'
            },
            {
                'component': 'VCardText',
                'content': [
                    { 
                        'component': 'div',
                        'props': {'id': 'bangumi-oauth-status-container', 'class': 'mb-4'},
                        'content': [
                            {
                                'component': 'VChip',
                                'props': {
                                    'id': 'oauth-status-chip-page', 
                                    'color': 'grey',
                                    'text-color': 'white',
                                    'prepend-icon': 'mdi-account-circle-outline'
                                },
                                'text': '正在获取授权状态...' 
                            }
                        ]
                    },
                    { 
                        'component': 'VBtn',
                        'props': {
                            'id': 'oauth-authorize-btn-page',
                            'color': 'primary',
                            'class': 'mr-2',
                            'prepend-icon': 'mdi-link-variant',
                            'comment': '点击发起Bangumi OAuth授权流程'
                        },
                        'text': 'Bangumi 授权'
                    },
                    { 
                        'component': 'VBtn',
                        'props': {
                            'id': 'oauth-deauthorize-btn-page',
                            'color': 'error',
                            'prepend-icon': 'mdi-link-variant-off',
                            'comment': '点击解除当前用户的Bangumi OAuth授权'
                        },
                        'text': '解除授权'
                    },
                    {
                        'component': 'VAlert',
                        'props': {'type':'info', 'variant':'tonal', 'density':'compact', 'class':'mt-4', 
                                  'text':'点击“Bangumi 授权”按钮后，会在新窗口中打开Bangumi的授权页面。请按照提示操作。授权成功或失败，该窗口会自动关闭，此页面状态会刷新。'}
                    }
                ]
            }
        ]

        return [
            {
                'component': 'VRow',
                'content': [
                    {
                        'component': 'VCol',
                        'props': {'cols': 12, 'md': 8, 'offset-md': 2}, 
                        'content': [
                            {
                                'component': 'VCard',
                                'props': {'variant': 'outlined'},
                                'content': oauth_card_content
                            }
                        ]
                    }
                ]
            }
        ]


    def __update_config(self):
        self.update_config({
            "enable": self._enable,
            "uniqueid_match": self._uniqueid_match,
            "user": self._user,
            "token": self._token,
            "auth_method": self._auth_method,
            "oauth_app_id": self._oauth_app_id,
            "oauth_app_secret": self._oauth_app_secret,
            "tab": self._tab, 
            # "moviepilot_public_url": self._moviepilot_public_url, # 移除保存
            "global_oauth_info": self._global_oauth_info
        })

    def get_state(self) -> bool:
        return self._enable

    def stop_service(self):
        pass

import asyncio 

if __name__ == "__main__":
    # 测试代码需要适应全局模式，并且在MoviePilot环境外运行可能受限
     subject_id, _, _ = asyncio.run(BangumiSyncV2Test().get_subjectid_by_title("葬送的芙莉莲", 1, 1, None))
     if subject_id:
        asyncio.run(BangumiSyncV2Test().sync_watching_status(subject_id, 1, None))
    #print("请在MoviePilot插件环境中运行和测试。")
