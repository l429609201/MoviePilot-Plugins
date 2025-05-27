import datetime
import re
import time # 用于处理令牌过期时间戳
import json # 用于解析和存储OAuth信息
import uuid # 用于生成state参数
import asyncio # 确保 asyncio 被导入，因为代码中使用了它

from typing import Any, Dict, List, Optional, Tuple

# BangumiSyncDebug 插件原有的 imports
from app import schemas
from app.core.event import eventmanager, Event
from app.core.config import settings
# from app.core.metainfo import MetaInfo # MetaInfo 未在原版 BangumiSyncDebug 中使用
from app.log import logger
from app.plugins import _PluginBase
from app.schemas import WebhookEventInfo # MediaInfo 未在原版 BangumiSyncDebug 中使用
from app.schemas.types import EventType # MediaType 未在原版 BangumiSyncDebug 中使用
# from app.utils.http import RequestUtils # RequestUtils 未在原版 BangumiSyncDebug 中直接使用，而是通过 requests.Session
from cachetools import cached, TTLCache
import requests # 注意：在async函数中应使用异步HTTP库如httpx
from urllib.parse import urlencode, quote_plus # 用于构建URL参数
#from app.core.user import User # 导入User模型以获取用户ID
#from app.core.request import Request # 导入Request模型以处理API请求和响应
# User 和 Request 类型将使用 Any 代替，因为它们在目标环境中不存在
# from typing import Tuple, List, Dict, Any # 这行是重复的，可以移除


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
    plugin_version = "1.0.5" # 版本更新
    # 插件作者
    plugin_author = "honue,happyTonakai,AAA,Gemini" # 添加 Gemini
    # 作者主页
    author_url = "https://github.com/l429609201"
    # 插件配置项ID前缀
    plugin_config_prefix = "bangumisyncv2test_"
    # 加载顺序
    plugin_order = 20
    # 可使用的用户级别
    auth_level = 1

    UA = "l429609201/MoviePilot-Plugins (https://github.com/l429609201)"

    _enable = False
    _user: Optional[str] = None
    _bgm_uid: Optional[int] = None # Token模式下的Bangumi UID
    _token: Optional[str] = None # Token模式下的Access Token
    _tmdb_key: Optional[str] = None
    _request: Optional[requests.Session] = None # requests.Session实例
    _uniqueid_match = False

    _auth_method: str = "token" # 'token' or 'oauth'
    _oauth_app_id: Optional[str] = None
    _oauth_app_secret: Optional[str] = None
    
    _global_oauth_info: Optional[Dict[str, Any]] = None
    _tab: str = 'auth-method-tab' # 用于get_form中的标签页
    _prefix: str = "" # 用于日志前缀

    def init_plugin(self, config: dict = None):
        if config:
            self._enable = config.get('enable', False)
            self._uniqueid_match = config.get('uniqueid_match', False)
            self._user = config.get('user')
            self._token = config.get('token')

            self._auth_method = config.get('auth_method', 'token')
            if self._auth_method not in ['token', 'oauth']:
                logger.warning(f"检测到无效的 auth_method 配置值: '{self._auth_method}'。将重置为默认值 'token'。")
                self._auth_method = 'token'

            self._oauth_app_id = config.get('oauth_app_id')
            self._oauth_app_secret = config.get('oauth_app_secret')
            self._tab = config.get('tab', 'auth-method-tab')

            self._global_oauth_info = config.get('global_oauth_info')
            if not isinstance(self._global_oauth_info, dict) and self._global_oauth_info is not None:
                self._global_oauth_info = None

            self._tmdb_key = settings.TMDB_API_KEY
            headers = {"User-Agent": BangumiSyncV2Test.UA, "content-type": "application/json"}
            self._request = requests.Session()
            self._request.headers.update(headers)
            if settings.PROXY:
                self._request.proxies.update(settings.PROXY)

            logger.info(f"插件 {self.plugin_name} 初始化配置如下:")
            logger.info(f"  启用状态 (_enable): {self._enable}")
            logger.info(f"  唯一ID匹配 (_uniqueid_match): {self._uniqueid_match}")
            logger.info(f"  媒体服务器用户 (_user): {self._user or '未配置'}")
            logger.info(f"  认证方式 (_auth_method): {self._auth_method}")
            logger.info(f"  Bangumi Token (_token): {'已配置' if self._token else '未配置'}")
            logger.info(f"  OAuth App ID (_oauth_app_id): {self._oauth_app_id or '未配置'}")
            logger.info(f"  OAuth App Secret (_oauth_app_secret): {'已配置' if self._oauth_app_secret else '未配置'}")
            logger.info(f"  TMDB API Key (_tmdb_key): {'已配置' if self._tmdb_key else '未配置'}")
            logger.info(f"  上次选择的标签页 (_tab): {self._tab}")
            logger.info(f"  全局OAuth信息 (_global_oauth_info): {'已存在' if self._global_oauth_info else '不存在或为空'}")

            self.__update_config() # 确保加载后，如果发生修正，配置会被保存
            logger.info(f"{self.plugin_name} v{self.plugin_version} 初始化成功")
        else:
            # 首次加载或无配置时，确保默认值被应用和保存
            self._auth_method = 'token' # 确保默认
            self._global_oauth_info = None
            self.__update_config()
            logger.info(f"{self.plugin_name} v{self.plugin_version} 首次加载，使用默认配置初始化成功")


    def _get_moviepilot_base_url(self, request: Any) -> Optional[str]:
        if not request:
            logger.error("无法获取 MoviePilot 基础 URL：request 对象为空。")
            return None
        try:
            scheme = getattr(request.url, 'scheme', None)
            netloc = getattr(request.url, 'netloc', None)
            if not scheme or not netloc:
                logger.error(f"无法从 request 对象中解析 scheme 或 netloc。request.url 结构: {getattr(request, 'url', 'N/A')}")
                # 尝试从 headers 获取 (作为备选方案，但可能不准确或不安全)
                x_forwarded_proto = request.headers.get('x-forwarded-proto')
                x_forwarded_host = request.headers.get('x-forwarded-host')
                host = request.headers.get('host')
                if x_forwarded_proto and x_forwarded_host:
                    logger.info(f"通过 x-forwarded-proto 和 x-forwarded-host 获取基础 URL: {x_forwarded_proto}://{x_forwarded_host}")
                    return f"{x_forwarded_proto}://{x_forwarded_host}"
                if x_forwarded_proto and host: # 有些反代可能只设置 proto 和 host
                     logger.info(f"通过 x-forwarded-proto 和 host 获取基础 URL: {x_forwarded_proto}://{host}")
                     return f"{x_forwarded_proto}://{host}"
                return None
            return f"{scheme}://{netloc}"
        except AttributeError as e:
            logger.error(f"解析 MoviePilot 基础 URL 时发生属性错误 (可能是 request 对象结构不符合预期): {e}")
            return None
        except Exception as e_general:
            logger.error(f"解析 MoviePilot 基础 URL 时发生未知错误: {e_general}")
            return None

    def _get_global_oauth_info(self) -> Optional[Dict[str, Any]]:
        return self._global_oauth_info

    def _store_global_oauth_info(self, oauth_data: Optional[Dict[str, Any]]):
        self._global_oauth_info = oauth_data
        self.__update_config()

    def _delete_global_oauth_info(self):
        if self._global_oauth_info is not None:
            self._global_oauth_info = None
            self.__update_config()

    def _is_token_expired(self, oauth_info: Dict[str, Any]) -> bool:
        expire_time = oauth_info.get('expire_time')
        if expire_time is None:
            return True
        return time.time() >= (expire_time - 300) # 5分钟缓冲

    async def _refresh_access_token(self) -> Tuple[Optional[str], Optional[str]]:
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
        headers = {"Content-Type": "application/x-www-form-urlencoded", "User-Agent": self.UA}
        proxies = self._request.proxies if self._request else (settings.PROXY if settings.PROXY else None)

        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: requests.post(BANGUMI_TOKEN_URL, data=payload, headers=headers, proxies=proxies))
            response.raise_for_status()
            token_data = response.json()

            expires_in = token_data.get('expires_in', 0)
            new_expire_time = time.time() + expires_in
            
            oauth_info['access_token'] = token_data['access_token']
            oauth_info['expire_time'] = new_expire_time
            if 'refresh_token' in token_data:
                oauth_info['refresh_token'] = token_data['refresh_token']
            
            self._store_global_oauth_info(oauth_info)
            logger.info("全局Bangumi令牌刷新成功。")
            return token_data['access_token'], None
        except requests.exceptions.HTTPError as http_err:
            error_message = f"刷新令牌HTTP错误: {http_err.response.status_code if http_err.response else 'N/A'}"
            try: error_json = http_err.response.json(); error_message += f". 响应: {error_json}"
            except (ValueError, AttributeError): error_message += f". 响应文本: {http_err.response.text if http_err.response else 'N/A'}"
            logger.error(f"刷新全局Bangumi令牌失败: {error_message}")
            if http_err.response is not None and http_err.response.status_code == 400 and "invalid_grant" in http_err.response.text:
                 self._delete_global_oauth_info()
                 logger.warning("全局Refresh Token已失效，已清除授权信息，请重新授权。")
                 return None, "Refresh Token已失效，请重新授权。"
            return None, error_message
        except Exception as e:
            logger.exception(f"刷新全局Bangumi令牌时发生未知错误")
            return None, f"刷新令牌时发生未知错误: {str(e)}"

    async def _get_valid_access_token(self) -> Optional[str]:
        oauth_info = self._get_global_oauth_info()
        if not oauth_info or not oauth_info.get('access_token'):
            logger.debug("全局: 未找到OAuth信息或访问令牌。")
            return None
        if self._is_token_expired(oauth_info):
            logger.info("全局: Bangumi访问令牌已过期，尝试刷新...")
            access_token, error = await self._refresh_access_token()
            if error:
                logger.warning(f"全局: 令牌刷新失败: {error}")
                return None
            return access_token
        return oauth_info['access_token']

    async def _bangumi_api_request(self, method: str, url: str, **kwargs) -> requests.Response:
        headers = kwargs.pop('headers', {})
        headers.setdefault("User-Agent", self.UA) # 使用 setdefault 避免覆盖已有的 User-Agent

        auth_token_to_use: Optional[str] = None
        if self._auth_method == 'token':
            if not self._token: raise ValueError("Access Token认证方式未配置Token。")
            auth_token_to_use = self._token
        elif self._auth_method == 'oauth':
            auth_token_to_use = await self._get_valid_access_token()
            if not auth_token_to_use: raise ValueError("全局: 未找到有效的Bangumi OAuth访问令牌。")
        else:
            raise ValueError(f"未知的认证方式: {self._auth_method}")
        
        headers["Authorization"] = f"Bearer {auth_token_to_use}"
        
        if 'json' in kwargs and 'Content-Type' not in headers: # 修正 content-type 键名
            headers['Content-Type'] = 'application/json'

        loop = asyncio.get_event_loop()
        # 确保 self._request 存在，如果不存在则创建一个临时的
        current_session = self._request if self._request else requests.Session()
        if self._request is None and settings.PROXY: # 为临时 session 配置代理
            current_session.proxies.update(settings.PROXY)
        
        response = await loop.run_in_executor(None, lambda: current_session.request(method, url, headers=headers, **kwargs))
        return response

    @eventmanager.register(EventType.WebhookMessage)
    async def hook(self, event: Event):
        logger.info(f"{self.plugin_name}: 开始处理webhook事件。") # 改为 info 级别
        if not self._enable:
            logger.info(f"{self.plugin_name}: 插件未启用。") # 改为 info 级别
            return

        # 认证检查：确保有可用的token
        if self._auth_method == 'token':
            if not self._token:
                logger.warning(f"{self.plugin_name}: Token认证方式未配置Access Token，无法处理事件。")
                return
        elif self._auth_method == 'oauth':
            if not await self._get_valid_access_token(): # 检查是否有有效令牌
                logger.warning(f"{self.plugin_name}: OAuth认证令牌无效或无法刷新，无法处理事件。")
                return
        else:
            logger.error(f"{self.plugin_name}: 未知的认证方式 '{self._auth_method}'，无法处理事件。")
            return

        try:
            logger.debug(f"收到webhook事件: {event.event_data}")
            event_info: WebhookEventInfo = event.event_data

            if not self._user or event_info.user_name not in self._user.split(','):
                logger.debug(f"事件用户 '{event_info.user_name}' 不在配置的用户列表 '{self._user}' 中，跳过。")
                return

            play_start_events = {"playback.start", "media.play", "PlaybackStart"}
            is_relevant_event = event_info.event in play_start_events or \
                                (event_info.percentage is not None and event_info.percentage > 90)
            if not is_relevant_event:
                logger.debug(f"事件类型 '{event_info.event}' 或进度 '{event_info.percentage}' 不符合处理条件，跳过。")
                return

            if not BangumiSyncV2Test.is_anime(event_info):
                logger.debug(f"媒体 '{event_info.item_name}' 根据路径/库名判断不是动画，跳过。")
                return

            if event_info.item_type == "TV": # 只处理电视剧类型
                tmdb_id_str = event_info.tmdb_id
                logger.info(f"匹配播放事件: '{event_info.item_name}' (TMDB ID: {tmdb_id_str or 'N/A'})...")
                
                # 优先使用原始标题（如果有刮削），否则尝试从文件名解析
                title_to_use = event_info.title or event_info.item_name # event_info.title 是刮削的标题
                match = re.match(r"^(.+?)\sS(\d+)E(\d+)\s.*", title_to_use, re.IGNORECASE)
                if match:
                    title = match.group(1).strip()
                    # season_from_name = int(match.group(2)) # 可以用于校验
                    # episode_from_name = int(match.group(3))
                else: # 如果无法从标题解析，尝试从 item_name 分割
                    title = title_to_use.split(' S')[0].split(' 第')[0].strip() # 更通用的分割
                
                if not title:
                    logger.warning(f"无法从 '{title_to_use}' 中有效提取标题，跳过。")
                    return

                season_id, episode_id = int(event_info.season_id), int(event_info.episode_id)
                self._prefix = f"[{title} S{season_id:02d}E{episode_id:02d}]" 

                unique_id = int(tmdb_id_str) if tmdb_id_str and tmdb_id_str.isdigit() else None

                subject_id, subject_name, original_episode_name = await self.get_subjectid_by_title(
                    title, season_id, episode_id, unique_id
                )

                if subject_id is None:
                    logger.info(f"{self._prefix} 未能从Bangumi找到对应的条目ID。")
                    return

                logger.info(f"{self._prefix} 匹配成功: 本地 '{title}' (原始单集名: {original_episode_name or 'N/A'}) => Bangumi '{subject_name}' (ID: {subject_id}, https://bgm.tv/subject/{subject_id})")
                await self.sync_watching_status(subject_id, episode_id, original_episode_name)
            else:
                logger.debug(f"事件项目类型为 '{event_info.item_type}'，非 TV 类型，跳过。")

        except Exception: # pylint: disable=broad-except-clause
            logger.exception(f"{self.plugin_name}: 处理 webhook 事件时发生未捕获的错误")


    @cached(TTLCache(maxsize=100, ttl=3600))
    async def get_subjectid_by_title(self, title: str, season: int, episode: int, unique_id: Optional[int]) -> Tuple[Optional[int], Optional[str], Optional[str]]:
        current_prefix = getattr(self, '_prefix', f"[{title} S{season:02d}E{episode:02d}]")
        logger.debug(f"{current_prefix} 尝试使用 bgm api 来获取 subject id...")
        
        tmdb_data = await self.get_tmdb_id(title) 
        tmdb_id, original_name, original_language = tmdb_data if tmdb_data else (None, title, "ja") # Fallback
        
        original_episode_name_from_tmdb: Optional[str] = None
        post_json: Dict[str, Any] = {
            "keyword": original_name or title, # 优先使用原始名称
            "sort": "match",
            "filter": {"type": [2]}, # Type 2 for Anime
        }

        if tmdb_id and original_language: # 仅当有TMDB ID和语言时才尝试获取播出日期
            airdate_info = await self.get_airdate_and_ep_name(
                tmdb_id, season, episode, unique_id if self._uniqueid_match else None, original_language
            )
            if airdate_info:
                start_date, end_date, tmdb_original_episode_name = airdate_info
                original_episode_name_from_tmdb = tmdb_original_episode_name # 保存从TMDB获取的单集名
                if start_date and end_date:
                    post_json["filter"]["air_date"] = [f">={start_date}", f"<={end_date}"]
        
        url = "https://api.bgm.tv/v0/search/subjects"
        try:
            response = await self._bangumi_api_request('POST', url, json=post_json)
            response.raise_for_status() 
            resp_json = response.json()
        except (requests.exceptions.RequestException, ValueError, json.JSONDecodeError) as e:
            logger.error(f"{current_prefix} 请求或解析Bangumi搜索API失败: {e}")
            return None, None, None
        except ValueError as ve: # 特别处理 ValueError，可能是认证问题
            logger.error(f"{current_prefix} Bangumi搜索API请求失败 (ValueError, 可能认证失败): {ve}")
            return None, None, None


        if not resp_json.get("data"):
            logger.warning(f"{current_prefix} 未找到 '{post_json['keyword']}' (过滤器: {post_json.get('filter')}) 的bgm条目")
            return None, None, None
        
        # 筛选结果，优先匹配年份（如果TMDB提供了）
        # Bangumi API 的 "match" 排序有时不够理想
        # 此处可以添加更复杂的匹配逻辑，例如比较标题相似度、年份等
        
        data = resp_json.get("data")[0] # 取第一个匹配结果
        year = data.get("date", "----")[:4]
        name_cn = data.get("name_cn") or data.get("name", "未知标题")
        formatted_name = f"{name_cn} ({year})"
        subject_id_val = data.get("id")

        return subject_id_val, formatted_name, original_episode_name_from_tmdb


    @cached(TTLCache(maxsize=100, ttl=3600))
    async def get_tmdb_id(self, title: str) -> Optional[Tuple[int, str, str]]: 
        current_prefix = getattr(self, '_prefix', f"[{title}]")
        logger.debug(f"{current_prefix} 尝试使用 tmdb api 来获取 TMDB ID...")
        if not self._tmdb_key: 
            logger.warning(f"{current_prefix} TMDB API Key未配置。")
            return None
        
        # 对标题进行URL编码
        encoded_title = quote_plus(title)
        url = f"https://api.tmdb.org/3/search/tv?query={encoded_title}&api_key={self._tmdb_key}&language=zh-CN&include_adult=false"
        
        try:
            loop = asyncio.get_event_loop()
            # 确保使用 self._request (如果已初始化)
            current_session = self._request if self._request else requests.Session()
            if self._request is None and settings.PROXY:
                current_session.proxies.update(settings.PROXY)

            response = await loop.run_in_executor(None, lambda: current_session.get(url))
            response.raise_for_status()
            ret = response.json()
        except Exception as e:
            logger.error(f"{current_prefix} 请求或解析TMDB ID失败 for '{title}': {e}")
            return None

        if not ret.get("total_results"):
            logger.warning(f"{current_prefix} 未找到 '{title}' 的 tmdb 条目")
            return None
            
        # 优先选择第一个结果，但可以加入更复杂的匹配逻辑，如年份
        for result in ret["results"]:
            # 确保 genre_ids 存在且是列表
            if 16 in result.get("genre_ids", []): # 16 是动画类型
                logger.debug(f"{current_prefix} TMDB找到匹配动画: ID={result.get('id')}, Name='{result.get('original_name')}'")
                return result.get("id"), result.get("original_name"), result.get("original_language")
        
        logger.debug(f"{current_prefix} TMDB找到结果，但没有动画类型匹配。")
        return None

    @cached(TTLCache(maxsize=100, ttl=3600))
    async def get_airdate_and_ep_name(self, tmdbid: int, season_id: int, episode: int, unique_id: Optional[int], original_language: str) -> Optional[Tuple[str, str, Optional[str]]]:
        current_prefix = getattr(self, '_prefix', f"[TMDBID:{tmdbid} S{season_id:02d}E{episode:02d}]")
        if not self._tmdb_key: 
            logger.warning(f"{current_prefix} TMDB API Key未配置。")
            return None
        logger.debug(f"{current_prefix} 尝试使用 tmdb api 来获取 airdate 和 episode name...")
        
        async def get_tv_season_detail_async(tmdbid_local: int, season_id_local: int) -> Optional[dict]:
            loop = asyncio.get_event_loop()
            current_session = self._request if self._request else requests.Session()
            if self._request is None and settings.PROXY:
                current_session.proxies.update(settings.PROXY)

            url_season = f"https://api.tmdb.org/3/tv/{tmdbid_local}/season/{season_id_local}?language={original_language}&api_key={self._tmdb_key}"
            try:
                response_season = await loop.run_in_executor(None, lambda: current_session.get(url_season))
                response_season.raise_for_status()
                resp_json = response_season.json()
                if resp_json and resp_json.get("episodes"):
                    return resp_json
            except Exception as e_season:
                logger.debug(f"{current_prefix} get_tv_season_detail (season {season_id_local}) 失败: {e_season}")

            logger.debug(f"{current_prefix} 无法通过季号获取TMDB季度信息，尝试通过episode group获取")
            url_groups = f"https://api.tmdb.org/3/tv/{tmdbid_local}/episode_groups?api_key={self._tmdb_key}"
            try:
                response_groups = await loop.run_in_executor(None, lambda: current_session.get(url_groups))
                response_groups.raise_for_status()
                resp_groups_json = response_groups.json()
                if resp_groups_json and resp_groups_json.get("results"):
                    seasons_groups = [r for r in resp_groups_json["results"] if r.get("type") == 3 and r.get("name") == "Seasons"] # type 3 is "aired"
                    if seasons_groups:
                        # 选择 episode_count 最接近实际情况的，或者直接取第一个（TMDB有时数据混乱）
                        season_group_data = min(seasons_groups, key=lambda x: x.get("episode_count", float('inf'))) if seasons_groups else None
                        if season_group_data and season_group_data.get('id'):
                            url_group_detail = f"https://api.tmdb.org/3/tv/episode_group/{season_group_data['id']}?language={original_language}&api_key={self._tmdb_key}"
                            response_group_detail = await loop.run_in_executor(None, lambda: current_session.get(url_group_detail))
                            response_group_detail.raise_for_status()
                            resp_group_detail_json = response_group_detail.json()
                            if resp_group_detail_json and resp_group_detail_json.get("groups"):
                                for group_item in resp_group_detail_json["groups"]:
                                    # 匹配季号，例如 "Season 1", "Season 1 - Part 1"
                                    if group_item.get("name", "").startswith(f"Season {season_id_local}"):
                                        # 确保 group_item 包含 episodes 列表
                                        if group_item.get("episodes"):
                                            # 需要将 group_item 的结构调整为与 season detail 类似，或直接返回 episodes
                                            # 这里假设 group_item 的 episodes 结构与 season detail 的 episodes 结构一致
                                            return {"episodes": group_item.get("episodes"), "air_date": group_item.get("air_date")} # 补充 air_date
            except Exception as e_group:
                logger.debug(f"{current_prefix} get_tv_season_detail (episode_groups) 失败: {e_group}")
            return None

        resp_season_detail = await get_tv_season_detail_async(tmdbid, season_id)
        if not resp_season_detail or "episodes" not in resp_season_detail:
            logger.warning(f"{current_prefix} 无法获取TMDB季度信息。")
            return None
        
        episodes_list = resp_season_detail.get("episodes", [])
        if not episodes_list: 
            logger.warning(f"{current_prefix} 该季度没有剧集信息。")
            return None

        air_date_str = resp_season_detail.get("air_date") # 季度的首播日期
        matched_ep_data = None
        for ep_data in episodes_list:
            # 优先使用单集的播出日期，如果季度播出日期为空
            if air_date_str is None: air_date_str = ep_data.get("air_date")
            
            current_ep_matched = False
            # 优先使用 unique_id 匹配 (如果启用且存在)
            if self._uniqueid_match and unique_id and ep_data.get("id") == unique_id: current_ep_matched = True
            # 其次尝试匹配 episode_number (TMDB 标准集号)
            elif ep_data.get("episode_number") == episode: current_ep_matched = True
            # 最后尝试匹配 order (有时刮削器会用 order，它是从0开始的索引)
            elif ep_data.get("order", -99) + 1 == episode: current_ep_matched = True
            
            if current_ep_matched: 
                matched_ep_data = ep_data
                # 如果单集有自己的播出日期，优先使用它
                if matched_ep_data.get("air_date"):
                    air_date_str = matched_ep_data.get("air_date")
                break
            
            # 如果是季终集或季中集，并且还没有匹配到，可能需要重置 air_date_str 以便后续集数使用自己的日期
            if ep_data.get("episode_type") in ["finale", "mid_season"] and not matched_ep_data:
                 air_date_str = None # 允许下一集使用自己的播出日期
        
        if not matched_ep_data: 
            logger.warning(f"{current_prefix} 未找到匹配的TMDB剧集 (集号: {episode}, unique_id: {unique_id if self._uniqueid_match else 'N/A'})。")
            return None
        
        # 如果在循环中没有找到单集的 air_date，并且季度 air_date 也为空，则无法确定日期
        if not air_date_str: 
            logger.warning(f"{current_prefix} 未找到匹配的TMDB剧集播出日期。")
            return None, None, matched_ep_data.get("name") # 仍然返回单集名
        
        original_episode_name = matched_ep_data.get("name")
        try: 
            air_date_obj = datetime.datetime.strptime(air_date_str, "%Y-%m-%d").date()
        except ValueError: 
            logger.warning(f"{current_prefix} TMDB提供的播出日期格式无效: {air_date_str}")
            return None, None, original_episode_name
        
        # Bangumi 搜索有时对日期范围敏感，稍微扩大范围
        start_date = (air_date_obj - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
        end_date = (air_date_obj + datetime.timedelta(days=30)).strftime("%Y-%m-%d")
        return start_date, end_date, original_episode_name

    @cached(TTLCache(maxsize=10, ttl=600)) # 缓存时间可以适当调整
    async def sync_watching_status(self, subject_id: int, episode: int, original_episode_name: Optional[str]):
        current_prefix = getattr(self, '_prefix', f"[BGM Subject:{subject_id} E{episode:02d}]")
        bgm_uid_to_use: Optional[int] = None

        if self._auth_method == 'token':
            if not self._bgm_uid: # 如果UID未缓存
                if not self._token: logger.error(f"{current_prefix} Token模式下Access Token未配置。"); return
                try:
                    response = await self._bangumi_api_request('GET', BANGUMI_USER_INFO_URL)
                    response.raise_for_status()
                    user_info = response.json()
                    self._bgm_uid = user_info.get("id")
                    if not self._bgm_uid: 
                        logger.error(f"{current_prefix} 获取Bangumi UID失败: {user_info}")
                        return
                    logger.debug(f"{current_prefix} Token模式: 获取并缓存了 bgm_uid {self._bgm_uid}")
                except Exception as e: 
                    logger.error(f"{current_prefix} Token模式: 请求或解析Bangumi /me API失败: {e}")
                    return
            bgm_uid_to_use = self._bgm_uid
        elif self._auth_method == 'oauth':
            oauth_info = self._get_global_oauth_info()
            if not oauth_info or 'bangumi_user_id' not in oauth_info or not oauth_info['bangumi_user_id']: 
                logger.error(f"{current_prefix} 全局OAuth模式下未找到有效的Bangumi用户ID。")
                return
            bgm_uid_to_use = oauth_info['bangumi_user_id']
        else: 
            logger.error(f"{current_prefix} 未知认证方式 '{self._auth_method}'。")
            return
        
        if not bgm_uid_to_use: # 双重检查
            logger.error(f"{current_prefix} 未能确定Bangumi用户ID，无法同步状态。")
            return

        # 1. 更新合集状态为 "在看" (type=3)
        await self.update_collection_status(subject_id, bgm_uid_to_use, new_type=3)
        
        # 2. 获取剧集列表
        ep_info_list = await self.get_episodes_info(subject_id)
        if not ep_info_list: 
            logger.warning(f"{current_prefix} 未获取到剧集列表，无法标记单集。")
            return

        # 3. 查找对应的 Bangumi 剧集 ID
        found_episode_id: Optional[int] = None
        matched_bangumi_ep_info: Optional[Dict[str, Any]] = None
        
        # 优先通过原始单集名匹配 (如果TMDB提供了)
        if original_episode_name:
            for info_item in ep_info_list:
                # Bangumi的name通常是日文或原始标题，name_cn是中文标题
                # 尝试同时匹配 name 和 name_cn (如果存在)
                if info_item.get("name") == original_episode_name or \
                   (info_item.get("name_cn") and info_item.get("name_cn") == original_episode_name):
                    found_episode_id = info_item.get("id")
                    matched_bangumi_ep_info = info_item
                    logger.debug(f"{current_prefix} 通过原始单集名 '{original_episode_name}' 匹配到Bangumi剧集ID: {found_episode_id}")
                    break
        
        # 如果原始单集名未匹配到，再尝试通过集号 (sort) 匹配
        if not found_episode_id:
            for info_item in ep_info_list:
                # Bangumi 的 'sort' 通常对应集数，'ep' 是 float 类型有时用于 SP
                if info_item.get("type") == 0 and info_item.get("sort") == episode: # type 0 是主线剧集
                    found_episode_id = info_item.get("id")
                    matched_bangumi_ep_info = info_item
                    logger.debug(f"{current_prefix} 通过集号 'sort={episode}' (type=0) 匹配到Bangumi剧集ID: {found_episode_id}")
                    break
        
        # 如果以上都未匹配到，最后尝试通过 'ep' 字段匹配 (作为后备)
        if not found_episode_id:
            for info_item in ep_info_list:
                if info_item.get("ep") == episode: 
                    found_episode_id = info_item.get("id")
                    matched_bangumi_ep_info = info_item
                    logger.debug(f"{current_prefix} 通过集号 'ep={episode}' (后备) 匹配到Bangumi剧集ID: {found_episode_id}")
                    break
        
        if not found_episode_id: 
            logger.warning(f"{current_prefix} 在Bangumi剧集列表中未找到与本地集号 {episode} 或原始名称 '{original_episode_name}' 匹配的剧集。")
            return
        
        # 4. 更新单集观看状态为 "看过" (type=2)
        await self.update_episode_status(found_episode_id)
        
        # 5. 如果是最后一集 (主线剧集)，更新合集状态为 "看过" (type=2)
        last_episode_flag = False
        if matched_bangumi_ep_info:
            # 筛选出所有主线剧集 (type=0)，并按 sort 排序
            main_episodes = sorted([ep for ep in ep_info_list if ep.get("type") == 0], key=lambda x: x.get("sort", 0))
            if main_episodes and matched_bangumi_ep_info.get("id") == main_episodes[-1].get("id"):
                last_episode_flag = True
                logger.info(f"{current_prefix} 检测到当前观看的是最后一集主线剧集。")
        
        if last_episode_flag:
            logger.info(f"{current_prefix} 正在将合集状态更新为 '看过'...")
            await self.update_collection_status(subject_id, bgm_uid_to_use, new_type=2)

    @cached(TTLCache(maxsize=100, ttl=3600))
    async def update_collection_status(self, subject_id: int, bgm_uid_for_get: Optional[int], new_type: int = 3):
        current_prefix = getattr(self, '_prefix', f"[BGM Subject:{subject_id}]")
        type_dict = {0:"未收藏", 1:"想看", 2:"看过", 3:"在看", 4:"搁置", 5:"抛弃"}
        old_type = 0 # 默认为未收藏

        if bgm_uid_for_get: # 仅当提供了UID时才尝试获取当前状态
            collection_url = f"https://api.bgm.tv/v0/users/{bgm_uid_for_get}/collections/{subject_id}"
            try:
                response_get = await self._bangumi_api_request('GET', collection_url)
                if response_get.status_code == 200: 
                    old_type = response_get.json().get("type", 0)
                    logger.debug(f"{current_prefix} 当前收藏状态为: {type_dict.get(old_type, old_type)} ({old_type})")
                elif response_get.status_code == 404: 
                    logger.debug(f"{current_prefix} 条目 {subject_id} 尚未收藏。当前状态视为 '未收藏' (0)。")
                else: 
                    logger.warning(f"{current_prefix} 获取当前收藏状态失败 (code: {response_get.status_code})。将假定为 '未收藏'。")
            except Exception as e: 
                logger.warning(f"{current_prefix} 请求当前收藏状态失败: {e}。将假定为 '未收藏'。")

        # 如果已经是目标状态，或者当前是“看过”但目标是“在看”（不应该覆盖“看过”为“在看”）
        if old_type == new_type or (old_type == 2 and new_type == 3):
            logger.info(f"{current_prefix} 合集状态已为 {type_dict.get(old_type, old_type)}，目标状态为 {type_dict.get(new_type, new_type)}，无需更新。")
            return
        
        update_url = f"https://api.bgm.tv/v0/users/-/collections/{subject_id}" # 使用 '-' 代表当前授权用户
        post_data = {"type": new_type} # 仅发送 type，其他使用默认值
        try:
            response_post = await self._bangumi_api_request('POST', update_url, json=post_data)
            if response_post.status_code in [201, 202, 204]: # 201 Created, 202 Accepted, 204 No Content
                logger.info(f"{current_prefix} 合集状态从 '{type_dict.get(old_type,old_type)}' 更新为 '{type_dict.get(new_type,new_type)}' 成功。")
            else:
                logger.warning(f"{current_prefix} 合集状态更新失败 (code: {response_post.status_code}): {response_post.text}")
        except Exception as e:
             logger.exception(f"{current_prefix} 更新Bangumi合集状态时发生错误")


    @cached(TTLCache(maxsize=100, ttl=3600))
    async def get_episodes_info(self, subject_id: int) -> Optional[List[Dict[str, Any]]]:
        current_prefix = getattr(self, '_prefix', f"[BGM Subject:{subject_id}]")
        url = "https://api.bgm.tv/v0/episodes"
        params = {"subject_id": subject_id, "type": 0} # 默认只获取主线剧集 (type=0)
        try:
            response = await self._bangumi_api_request('GET', url, params=params)
            response.raise_for_status()
            resp_json = response.json()
            # Bangumi API 在没有数据时可能返回空 data 或不返回 data 键
            ep_data = resp_json.get("data") if isinstance(resp_json, dict) else None
            if isinstance(ep_data, list):
                logger.debug(f"{current_prefix} 获取到 {len(ep_data)} 条主线剧集信息。")
                return ep_data
            else:
                logger.debug(f"{current_prefix} 获取主线剧集信息成功，但返回数据非列表或为空: {ep_data}")
                return [] # 返回空列表以便后续处理
        except Exception as e:
            logger.error(f"{current_prefix} 请求或解析Bangumi剧集列表API失败: {e}")
        return None

    @cached(TTLCache(maxsize=100, ttl=3600)) # 缓存可以避免重复查询已点过的格子
    async def update_episode_status(self, episode_id: int):
        current_prefix = getattr(self, '_prefix', f"[BGM Episode:{episode_id}]")
        # API 端点应该是 /users/-/collections/-/episodes/{episode_id}
        # 但文档中也有 /users/-/progress/{episode_id}，后者更像是旧版或特定用途
        # 我们使用前者，因为它与收藏状态更新的路径结构一致
        url_get_status = f"https://api.bgm.tv/v0/users/-/collections/-/episodes/{episode_id}"
        url_update_status = f"https://api.bgm.tv/v0/users/-/collections/-/episodes/{episode_id}" # PUT请求的URL

        try:
            # 1. 获取当前单集观看状态
            response_get = await self._bangumi_api_request('GET', url_get_status)
            if response_get.status_code == 200:
                current_ep_status = response_get.json().get("type")
                if current_ep_status == 2: # type 2: 看过
                    logger.info(f"{current_prefix} 单集 {episode_id} 已经标记为看过。")
                    return
                # 其他状态 (1:想看, 3:抛弃) 也可能存在，但我们目标是标记为"看过"
            elif response_get.status_code == 404:
                logger.debug(f"{current_prefix} 单集 {episode_id} 尚未被用户标记过状态。")
            else: 
                # 即使获取状态失败，也尝试标记，因为用户可能就是想标记它
                logger.warning(f"{current_prefix} 获取单集 {episode_id} 信息失败 (code: {response_get.status_code})，仍将尝试标记。")
                
            # 2. 标记为看过 (type=2)
            # Bangumi API 文档指出更新观看进度使用 PUT /users/-/progress/{episode_id}，请求体为 {"status": "watched"}
            # 但也有 PUT /users/-/collections/-/episodes/{episode_id}，请求体为 {"type": 2}
            # 我们使用后者，因为它与收藏状态的API更一致。
            # 如果这种方式无效，可以尝试前者。
            payload = {"type": 2} # 2 代表 "看过"
            response_put = await self._bangumi_api_request('PUT', url_update_status, json=payload) 
            
            if response_put.status_code == 204: # No Content，表示成功
                logger.info(f"{current_prefix} 单集 {episode_id} 成功标记为看过。")
            else:
                logger.warning(f"{current_prefix} 单集 {episode_id} 标记为看过失败 (code: {response_put.status_code}): {response_put.text}")
        except Exception as e:
            logger.exception(f"{current_prefix} 更新Bangumi单集 {episode_id} 观看状态时发生错误")


    @staticmethod
    def is_anime(event_info: WebhookEventInfo) -> bool:
        path_keyword_list = ["日番","cartoon","动漫","动画","ani","anime","新番","番剧","特摄","bangumi","ova","映画","国漫","日漫"]
        path_to_check = ""
        
        if event_info.channel in ["emby", "jellyfin"]:
            # 优先使用 item_path，如果为空再尝试 library_name
            path_to_check = event_info.item_path or event_info.library_name or ""
        elif event_info.channel == "plex":
            # Plex 的 librarySectionTitle 更可靠
            path_to_check = event_info.json_object.get("Metadata", {}).get("librarySectionTitle", "") if event_info.json_object else ""
        
        path_to_check_lower = path_to_check.lower()
        if any(keyword in path_to_check_lower for keyword in path_keyword_list):
            logger.debug(f"路径/库名 '{path_to_check}' 包含动画关键词，判定为动画。")
            return True
            
        logger.debug(f"路径/库名 '{path_to_check}' 未包含动画关键词，判定为非动画。")
        return False

    @staticmethod
    def format_title(title: str, season: int): 
        if season < 2: return title
        season_zh_map = {0:"零",1:"一",2:"二",3:"三",4:"四",5:"五",6:"六",7:"七",8:"八",9:"九"}
        # 对于大于9的季度，简单使用Sxx格式
        season_zh = season_zh_map.get(season) if season in season_zh_map else None
        return f"{title} 第{season_zh}季" if season_zh else f"{title} S{season}"

    @staticmethod
    def get_command() -> List[Dict[str, Any]]: return []

    def get_api(self) -> List[Dict[str, Any]]:
        # 为所有API端点添加 "auth": True，表示需要MoviePilot用户认证
        # 并确保 apikey 参数被正确处理
        common_props = {"auth": True, "response_model": schemas.Response}

        return [
            {
                "path": "/oauth_authorize", 
                "methods": ["GET"], 
                "endpoint": self._handle_oauth_authorize,  
                "summary": "开始Bangumi OAuth授权",
                "description": "重定向到Bangumi进行OAuth授权。",
                **common_props # type: ignore
            },
            {
                "path": "/oauth_callback", 
                "methods": ["GET"], 
                "endpoint": self._handle_oauth_callback, 
                "summary": "Bangumi OAuth回调处理",
                "description": "处理Bangumi授权后的回调，交换令牌。",
                # 回调通常不需要用户认证，因为它是由外部服务重定向回来的
                # 但如果需要某种形式的apikey校验，可以在函数内部处理
                "auth": False, # 回调端点通常不需要 MoviePilot 用户认证
                "response_model": Any # 返回的是HTML页面
            },
            {
                "path": "/oauth_status", 
                "methods": ["GET"], 
                "endpoint": self._handle_oauth_status, 
                "summary": "获取Bangumi OAuth状态",
                "description": "检查当前Bangumi OAuth的授权状态。",
                **common_props # type: ignore
            },
            {
                "path": "/oauth_deauthorize", 
                "methods": ["POST"], # 改为 POST，因为是修改状态的操作
                "endpoint": self._handle_oauth_deauthorize, 
                "summary": "解除Bangumi OAuth授权",
                "description": "清除已存储的Bangumi OAuth授权信息。",
                 **common_props # type: ignore
             },
        ]

    async def _handle_oauth_authorize(self, request: Any, user: Any, apikey: str) -> Any: # 返回类型改为 Any 以适应不同响应
        if not settings.WEB_API_KEY or apikey != settings.WEB_API_KEY: # 使用 WEB_API_KEY
            return schemas.Response(success=False, message="API密钥错误")
        if not self._oauth_app_id:
            return {"status": "error", "message": "插件未配置Bangumi OAuth Application ID。"}
        
        moviepilot_base_url = self._get_moviepilot_base_url(request)
        if not moviepilot_base_url:
            return {"status": "error", "message": "无法确定MoviePilot服务器地址，无法构建回调URL。请检查MoviePilot配置或网络环境。"}

        # 确保回调路径与 get_api 中定义的路径一致，并且是 MoviePilot 能够路由到的
        # MoviePilot 的 API 路径通常是 /api/v1/plugins/{plugin_name_prefix}/actual_path
        callback_path = f"/api/v1/plugins/{self.plugin_config_prefix.strip('_')}/oauth_callback"
        redirect_uri = f"{moviepilot_base_url.rstrip('/')}{callback_path}"
        
        # State 中仅保留 CSRF token，不再包含 MoviePilot 用户 ID
        state_data = {"csrf_token": str(uuid.uuid4())}
        # 将 state 存储到 session 或一个临时存储中，以便回调时校验
        # 这里简化，假设 MoviePilot 的 request 对象有某种 session 机制
        # 如果没有，需要一个替代方案，例如短时缓存
        if hasattr(request, 'session'):
            request.session['bangumi_oauth_state'] = state_data['csrf_token']
            logger.debug(f"OAuth state (CSRF token) stored in session: {state_data['csrf_token']}")
        else:
            # 如果没有 session，这是一个问题，state 无法安全校验
            # 暂时简单地将 state 编码到参数中，但这不完全安全，理想情况是服务端存储 state
            logger.warning("Request object does not have session attribute. CSRF protection for OAuth might be weakened.")
            # 不再将整个 state_data 编码到URL，只编码 csrf_token
            # Bangumi 的 state 参数长度有限制

        state_param = state_data['csrf_token'] # 直接使用 token 作为 state
        
        auth_url_params = {
            "client_id": self._oauth_app_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "state": state_param
        }
        auth_url = f"{BANGUMI_AUTHORIZE_URL}?{urlencode(auth_url_params)}"
        
        logger.info(f"开始全局Bangumi OAuth授权 (操作用户: {getattr(user, 'name', 'Unknown')})，回调至: {redirect_uri}，授权URL: {auth_url}")
        return {"status": "success", "auth_url": auth_url} 

    async def _handle_oauth_callback(self, request: Any, user: Optional[Any] = None, apikey: Optional[str] = None) -> Any: # apikey 和 user 可选
        # 对于回调，通常不检查 apikey，因为它是从外部服务重定向的
        # 安全性依赖于 state 参数的校验

        code = request.query_params.get('code')
        state_from_bgm = request.query_params.get('state')
        error_from_bgm = request.query_params.get('error')
        
        # 准备 HTML 响应
        # MoviePilot 的 request.Response 可能与 FastAPI 不同，需要确认其用法
        # 假设它有一个 send_html 的方法或类似的机制
        async def send_html_response(html_content: str, status_code: int = 200):
            # 这是一个通用的发送HTML响应的假设，具体实现依赖MoviePilot框架
            if hasattr(request, 'Response') and callable(request.Response):
                response_obj = request.Response(content=html_content, media_type="text/html", status_code=status_code)
                return response_obj
            # 后备：如果 request.Response 不可用，记录错误并返回简单文本（或让框架处理）
            logger.error("无法创建HTML响应对象，request.Response 不可用。")
            return {"status": "error", "message": "无法生成HTML响应页面。"}


        html_template = """
        <html><head><title>{title}</title>
        <style>body {{ font-family: sans-serif; margin: 20px; }} .container {{ max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }}</style>
        </head><body><div class="container"><h1>{title}</h1><p>{message}</p>{script}</div></body></html>
        """

        if error_from_bgm:
            msg = f"Bangumi返回错误: {error_from_bgm}. 请关闭此窗口并重试。"
            return await send_html_response(html_template.format(title="Bangumi OAuth Error", message=msg, script=""), status_code=400)
        
        if not code or not state_from_bgm:
            msg = "回调参数不完整 (缺少 code 或 state)。请关闭此窗口并重试。"
            return await send_html_response(html_template.format(title="Bangumi OAuth Error", message=msg, script=""), status_code=400)

        # 校验 state (CSRF token)
        # 假设之前将 state 存储在 session 中
        stored_state = None
        if hasattr(request, 'session') and 'bangumi_oauth_state' in request.session:
            stored_state = request.session.pop('bangumi_oauth_state', None) # 取出并删除
            logger.debug(f"Retrieved state from session: {stored_state}, state from Bangumi: {state_from_bgm}")
        else:
            logger.warning("无法从 session 中获取存储的 state。CSRF 校验可能失败。")
            # 如果没有 session 机制，state 校验会很困难且不安全
            # 此时，如果 state_from_bgm 是之前编码的 JSON，需要解析
            # 但我们已改为直接传递 csrf_token

        if not stored_state or stored_state != state_from_bgm:
            msg = "State参数无效或CSRF校验失败。请求可能已被篡改。"
            logger.error(f"OAuth CSRF校验失败。Stored: {stored_state}, Received: {state_from_bgm}")
            return await send_html_response(html_template.format(title="Bangumi OAuth Error", message=msg, script=""), status_code=403)
        
        if not self._oauth_app_id or not self._oauth_app_secret:
            msg = "插件OAuth配置不完整 (缺少App ID或Secret)。"
            return await send_html_response(html_template.format(title="Bangumi OAuth Error", message=msg, script=""), status_code=500)

        moviepilot_base_url = self._get_moviepilot_base_url(request)
        if not moviepilot_base_url:
            msg = "插件内部错误：无法确定 MoviePilot 服务器地址，无法完成令牌交换。"
            logger.error("全局OAuth回调: MoviePilot 公开 URL 未配置或无效。")
            return await send_html_response(html_template.format(title="Bangumi OAuth Error", message=msg, script=""), status_code=500)

        callback_path = f"/api/v1/plugins/{self.plugin_config_prefix.strip('_')}/oauth_callback"
        redirect_uri_for_token = f"{moviepilot_base_url.rstrip('/')}{callback_path}"
        
        payload = {
            "grant_type": "authorization_code", 
            "client_id": self._oauth_app_id, 
            "client_secret": self._oauth_app_secret, 
            "code": code, 
            "redirect_uri": redirect_uri_for_token
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded", "User-Agent": self.UA}
        proxies = self._request.proxies if self._request else (settings.PROXY if settings.PROXY else None)

        try:
            loop = asyncio.get_event_loop()
            response_token = await loop.run_in_executor(None, lambda: requests.post(BANGUMI_TOKEN_URL, data=payload, headers=headers, proxies=proxies))
            response_token.raise_for_status()
            token_data = response_token.json()

            # 存储令牌过期时间 (Unix timestamp)
            token_data['expire_time'] = time.time() + token_data.get('expires_in', 0)
            
            # 获取并存储 Bangumi 用户信息
            profile_data, profile_error = await self._get_user_profile(token_data.get('access_token'))
            if profile_error: 
                logger.warning(f"全局OAuth: 获取Bangumi用户信息失败: {profile_error}。部分用户信息可能缺失。")
            
            token_data['bangumi_user_id'] = profile_data.get('id') if profile_data else token_data.get('user_id') # user_id 是旧版字段
            token_data['nickname'] = profile_data.get('nickname') if profile_data else f"BGM User {token_data.get('bangumi_user_id', 'Unknown')}"
            token_data['avatar'] = profile_data.get('avatar', {}).get('large') if profile_data and profile_data.get('avatar') else None
            token_data['url'] = profile_data.get('url') if profile_data else None # Bangumi 用户主页 URL
            
            self._store_global_oauth_info(token_data)
            logger.info(f"全局成功通过Bangumi OAuth授权，Bangumi用户: {token_data.get('nickname')}")
            
            success_script = "<script>if(window.opener){window.opener.postMessage('BANGUMI-OAUTH-COMPLETE', window.location.origin);} setTimeout(window.close, 2000);</script>"
            msg = f"成功授权Bangumi账户：{token_data.get('nickname')}！此窗口将在2秒后自动关闭。"
            return await send_html_response(html_template.format(title="Bangumi OAuth Success", message=msg, script=success_script))

        except requests.exceptions.HTTPError as http_err:
            error_msg_detail = f"交换令牌时HTTP错误: {http_err.response.status_code if http_err.response else 'N/A'}"
            try: error_json = http_err.response.json(); error_msg_detail += f". 响应: {error_json}"
            except (ValueError, AttributeError): error_msg_detail += f". 响应文本: {http_err.response.text if http_err.response else 'N/A'}"
            logger.error(f"全局OAuth回调: {error_msg_detail}")
            return await send_html_response(html_template.format(title="Bangumi OAuth Error", message=error_msg_detail, script=""), status_code=500)
        except Exception as e:
            logger.exception("全局OAuth回调处理中发生未知错误")
            error_msg_detail = f"处理回调时发生内部错误: {str(e)}"
            return await send_html_response(html_template.format(title="Bangumi OAuth Error", message=error_msg_detail, script=""), status_code=500)

    async def _handle_oauth_status(self, request: Any, user: Any , apikey: str) -> Any: # 返回类型改为 Any
        if not settings.WEB_API_KEY or apikey != settings.WEB_API_KEY:
            return schemas.Response(success=False, message="API密钥错误")
                
        oauth_info = self._get_global_oauth_info()
        if not oauth_info: 
            return {"authorized": False, "message": "尚未进行OAuth授权。"}
        
        access_token = await self._get_valid_access_token() # 会尝试刷新过期的token
        if not access_token:
             # _get_valid_access_token 内部的 _refresh_access_token 失败时会删除 _global_oauth_info
             return {"authorized": False, "message": "令牌已失效或无法刷新，请重新授权。"}
        
        # 获取最新的（可能已刷新）OAuth信息
        refreshed_oauth_info = self._get_global_oauth_info() 
        if not refreshed_oauth_info: # 双重检查，理论上刷新成功后不应为None
             return {"authorized": False, "message": "获取最新授权信息失败。"}

        return {
            "authorized": True, 
            "nickname": refreshed_oauth_info.get('nickname'), 
            "avatar": refreshed_oauth_info.get('avatar'),
            "bangumi_user_id": refreshed_oauth_info.get('bangumi_user_id'),
            "url": refreshed_oauth_info.get('url'), # 添加用户主页URL
            "expire_time_readable": datetime.datetime.fromtimestamp(refreshed_oauth_info.get('expire_time', 0)).strftime('%Y-%m-%d %H:%M:%S') if refreshed_oauth_info.get('expire_time') else "N/A"
        }

    async def _handle_oauth_deauthorize(self, request: Any, user: Any, apikey: str) -> Any: # 返回类型改为 Any
        if not settings.WEB_API_KEY or apikey != settings.WEB_API_KEY:
            return schemas.Response(success=False, message="API密钥错误")            
        
        self._delete_global_oauth_info()
        logger.info(f"全局Bangumi OAuth授权已解除 (操作用户: {getattr(user, 'name', 'Unknown')})。")
        return {"status": "success", "message": "已成功解除授权。"}

    async def _get_user_profile(self, access_token: Optional[str]) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        if not access_token: return None, "Access token is missing."
        headers = {"Authorization": f"Bearer {access_token}", "User-Agent": self.UA}
        proxies = self._request.proxies if self._request else (settings.PROXY if settings.PROXY else None)
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: requests.get(BANGUMI_USER_INFO_URL, headers=headers, proxies=proxies))
            response.raise_for_status()
            return response.json(), None
        except requests.exceptions.RequestException as e:
            error_msg = f"获取 Bangumi 用户信息失败: {e.response.status_code if e.response else 'N/A'}"
            if e.response is not None:
                 try: error_json = e.response.json(); error_msg += f". 响应: {error_json}"
                 except ValueError: error_msg += f". 响应文本: {e.response.text}"
            return None, error_msg
        except Exception as e_gen:
             logger.exception("获取用户信息时发生未知错误")
             return None, f"获取用户信息时发生未知错误: {str(e_gen)}"

    def get_form(self) -> Tuple[List[dict], Dict[str, Any]]:
        form_structure = [
            {
                "component": "VCard",
                "props": {"variant": "outlined", "class": "mb-3"},
                "content": [
                    {
                        "component": "VCardTitle",
                        "props": {"class": "d-flex align-center"},
                        "content": [
                            {"component": "VIcon", "props": {"icon": "mdi-cog", "color": "primary", "class": "mr-2"}},
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
                                            {"component": "VCol", "props": {"cols": 12, "md": 4},
                                             "content": [{"component": "VSwitch", "props": {"model": "enable", "label": "启用插件"}}]},
                                            {"component": "VCol", "props": {"cols": 12, "md": 4},
                                             "content": [{"component": "VSwitch", "props": {"model": "uniqueid_match", "label": "TMDB集唯一ID匹配"}}]},
                                        ]
                                    },
                                    {
                                        "component": "VRow",
                                        "content": [
                                            {"component": "VCol", "props": {"cols": 12, "md": 6},
                                             "content": [{"component": "VTextField", "props": {"model": "user", "label": "媒体服务器用户名", "placeholder": "你的Emby/Plex用户名", "hint": "多个用逗号隔开", "persistentHint": True}}]},
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "component": "VCard",
                "props": {"variant": "outlined"},
                "content": [
                    {
                        "component": "VTabs",
                        "props": {"model": "tab", "grow": True, "color": "primary"},
                        "content": [
                            {"component": "VTab", "props": {"value": "auth-method-tab"}, "content": [
                                {"component": "VIcon", "props": {"icon": "mdi-shield-key", "start": True, "color": "#1976D2"}},
                                {"component": "span", "text": "认证方式"}]},
                            {"component": "VTab", "props": {"value": "params-tab"}, "content": [
                                {"component": "VIcon", "props": {"icon": "mdi-tune", "start": True, "color": "#8958f4"}},
                                {"component": "span", "text": "参数设置"}]},
                        ],
                    },
                    {"component": "VDivider"},
                    {
                        "component": "VWindow", "props": {"model": "tab"},
                        "content": [
                            { # 认证方式 Tab
                                "component": "VWindowItem", "props": {"value": "auth-method-tab"},
                                "content": [{"component": "VCardText", "content": [
                                    {"component": "VRadioGroup", "props": {"model": "auth_method", "inline": False, "label": "选择Bangumi认证方式"},
                                     "content": [
                                         {"component": "VRadio", "props": {"label": "Access Token (推荐)", "value": "token"}},
                                         {"component": "VRadio", "props": {"label": "OAuth 2.0", "value": "oauth"}}
                                     ]}
                                ]}]
                            },
                            { # 参数设置 Tab
                                "component": "VWindowItem", "props": {"value": "params-tab"},
                                "content": [{"component": "VCardText", "content": [
                                    { # Token input
                                        "component": "VRow", "content": [{"component": "VCol", "props": {"cols": 12}, "content": [
                                            {"component": "VTextField", "props": {"model": "token", "label": "Bangumi Access Token", "placeholder": "填写得到的Access token", "type": "password", "hint": "用于Token认证方式。获取：https://next.bgm.tv/demo/access-token", "persistentHint": True}}
                                        ]}]
                                    },
                                    { # OAuth inputs
                                        "component": "VRow", "content": [
                                            {"component": "VCol", "props": {"cols": 12, "md": 6}, "content": [
                                                {"component": "VTextField", "props": {"model": "oauth_app_id", "label": "OAuth Application ID", "placeholder": "在此输入你的App ID", "hint": "用于OAuth认证方式", "persistentHint": True}}]},
                                            {"component": "VCol", "props": {"cols": 12, "md": 6}, "content": [
                                                {"component": "VTextField", "props": {"model": "oauth_app_secret", "label": "OAuth Application Secret", "placeholder": "在此输入你的App Secret", "type": "password", "hint": "用于OAuth认证方式", "persistentHint": True}}]}
                                        ]
                                    },
                                    {"component": "VAlert", "props": {"type": "info", "variant": "tonal", "text": "access-token获取：https://next.bgm.tv/demo/access-token\nemby添加你mp的webhook（event要包括播放）： http://[MoviePilot地址]:[端口]/api/v1/webhook?token=moviepilot\n感谢@HankunYu的想法", "style": "white-space: pre-line;"}}
                                ]}]
                            }
                        ]
                    }
                ]
            }
        ]

        default_values = {
            "enable": False, "uniqueid_match": False, "user": "",
            "auth_method": "token", "token": "",
            "oauth_app_id": "", "oauth_app_secret": "",
            "tab": "auth-method-tab", "global_oauth_info": None
        }
        return form_structure, default_values

    def get_page(self) -> List[dict]:
        """
        拼装插件详情页面，显示 OAuth 授权状态和操作按钮。
        """
        if self._auth_method != 'oauth':
            return [{'component': 'VAlert', 'props': {'type': 'info', 'variant': 'tonal', 'text': '当前认证方式不是 OAuth。如需使用 OAuth 授权，请先在插件配置的“认证方式”标签页中选择 OAuth。'}}]
        
        if not self._oauth_app_id or not self._oauth_app_secret:
            return [{'component': 'VAlert', 'props': {'type': 'warning', 'variant': 'tonal', 'text': '请先在插件配置的“参数设置”中填写 OAuth Application ID 和 Secret。'}}]
        
        api_base_path = f"plugin/{self.plugin_config_prefix.strip('_')}"

        current_oauth_info = self._get_global_oauth_info()
        is_authorized_initial = False
        nickname_initial = "未授权或状态未知"
        avatar_url_initial = None
        bangumi_uid_initial = None
        bangumi_user_url_initial = None # 新增用户主页URL
        expire_time_readable_initial = "N/A"

        if current_oauth_info and current_oauth_info.get('access_token'):
            is_authorized_initial = True
            nickname_initial = current_oauth_info.get('nickname', '已授权 (状态待刷新)')
            avatar_url_initial = current_oauth_info.get('avatar')
            bangumi_uid_initial = current_oauth_info.get('bangumi_user_id')
            bangumi_user_url_initial = current_oauth_info.get('url') # 获取用户主页URL
            if current_oauth_info.get('expire_time'):
                try:
                    expire_time_readable_initial = datetime.datetime.fromtimestamp(current_oauth_info.get('expire_time', 0)).strftime('%Y-%m-%d %H:%M:%S')
                except: # pylint: disable=bare-except
                    pass

        oauth_card_content = [
            {'component': 'VCardTitle', 'props': {'class': 'd-flex align-center justify-center'}, 
             'content': [
                 {'component': 'VIcon', 'props': {'icon': 'mdi-key-chain', 'color': 'primary', 'class': 'mr-2'}},
                 {'component': 'span', 'text': 'Bangumi OAuth 授权管理'}
             ]},
            {'component': 'VCardText', 'props': {'class': 'text-center'}, 'content': [
                {'component': 'div', 'props': {'id': 'bangumi-oauth-status-container', 'class': 'mb-4'}, 'content': [
                    {'component': 'VAvatar', 'props': {'id': 'oauth-user-avatar-page', 'src': avatar_url_initial, 'size': '64', 'class': 'mb-2 mx-auto', 'style': {'display': 'none' if not (is_authorized_initial and avatar_url_initial) else 'block'}}},
                    {'component': 'VChip', 'props': {'id': 'oauth-status-chip-page', 'color': 'success' if is_authorized_initial else 'warning', 'label': True, 'class': 'mb-2'}, 
                     'content': [
                         {'component': 'VIcon', 'props': {'id':'oauth-status-icon-page', 'start': True, 'icon': 'mdi-check-circle' if is_authorized_initial else 'mdi-information'}},
                         # 将昵称包裹在 a 标签中，如果已授权且有用户主页URL
                         {'component': 'a' if is_authorized_initial and bangumi_user_url_initial else 'span', 
                          'props': {
                              'id':'oauth-status-text-page',
                              'href': bangumi_user_url_initial if is_authorized_initial and bangumi_user_url_initial else None,
                              'target': '_blank' if is_authorized_initial and bangumi_user_url_initial else None,
                              'style': 'color: inherit; text-decoration: none;' if is_authorized_initial and bangumi_user_url_initial else ''
                          },
                          'text': nickname_initial }
                     ]},
                    {'component': 'div', 'props': {'id': 'oauth-user-details-page', 'class': 'text-caption grey--text', 'style': {'display': 'none' if not (is_authorized_initial and bangumi_uid_initial) else 'block'}}, 
                     'content': [
                         {'component': 'span', 'props':{'id':'oauth-uid-text-page'}, 'text': f"Bangumi UID: {bangumi_uid_initial or ''}"},
                         {'component': 'br' },
                         {'component': 'span', 'props':{'id':'oauth-expire-text-page'}, 'text': f"令牌有效期至: {expire_time_readable_initial}"}
                     ]}
                ]},
                {'component': 'VBtn', 'props': {'id': 'oauth-authorize-btn-page', 'color': 'primary', 'class': 'mr-2', 'prepend-icon': 'mdi-link-variant', 'disabled': is_authorized_initial, 'events': {'click': {'function': 'bangumiSyncV2Test_handleOAuthAuthorize'}} }, 'text': 'Bangumi 授权'},
                {'component': 'VBtn', 'props': {'id': 'oauth-deauthorize-btn-page', 'color': 'error', 'prepend-icon': 'mdi-link-variant-off', 'disabled': not is_authorized_initial, 'events': {'click': {'function': 'bangumiSyncV2Test_handleOAuthDeauthorize'}} }, 'text': '解除授权'},
                {'component': 'VBtn', 'props': {'id': 'oauth-refresh-btn-page', 'color': 'info', 'class': 'ml-2', 'icon': 'mdi-refresh', 'title': '刷新状态', 'events': {'click': {'function': 'bangumiSyncV2Test_fetchOAuthStatus'}} }},
                {'component': 'VAlert', 'props': {'type':'info', 'variant':'tonal', 'density':'compact', 'class':'mt-4', 'text':'点击“Bangumi 授权”按钮后，会在新窗口中打开Bangumi的授权页面。请按照提示操作。授权成功或失败，该窗口会自动关闭，此页面状态会刷新。'}}
            ]}
        ]

        frontend_script = f"""
<script>
if (typeof window.bangumiSyncV2Test_functions_defined === 'undefined') {{
    window.bangumiSyncV2Test_functions_defined = true;

    function bangumiSyncV2Test_showToast(message, type = 'info') {{
        if (window.MP && window.MP.toast) {{
            window.MP.toast(message, {{ type: type, timeout: 3000 }});
        }} else {{
            alert(`Toast (${{type}}): ${{message}}`); 
            console.log(`Toast (${{type}}): ${{message}}`);
        }}
    }}

    async function bangumiSyncV2Test_fetchOAuthStatus() {{
        console.log('BangumiSyncV2Test: Fetching OAuth status...');
        const authorizeBtn = document.getElementById('oauth-authorize-btn-page');
        const deauthorizeBtn = document.getElementById('oauth-deauthorize-btn-page');
        
        const statusChip = document.getElementById('oauth-status-chip-page');
        const statusIcon = document.getElementById('oauth-status-icon-page');
        const statusText = document.getElementById('oauth-status-text-page');
        
        const userAvatarElement = document.getElementById('oauth-user-avatar-page');
        const userDetailsDiv = document.getElementById('oauth-user-details-page');
        const uidText = document.getElementById('oauth-uid-text-page');
        const expireText = document.getElementById('oauth-expire-text-page');

        if (!statusChip || !statusIcon || !statusText || !authorizeBtn || !deauthorizeBtn || !userAvatarElement || !userDetailsDiv || !uidText || !expireText) {{
            console.warn('BangumiSyncV2Test: OAuth status UI elements not all found. Status update might be incomplete.');
            // 不直接返回，尝试更新能找到的元素
        }}

        if (statusIcon) statusIcon.className = 'v-icon notranslate mdi mdi-loading theme--light';
        if (statusText) statusText.textContent = '正在获取授权状态...';
        if (statusChip) {{ statusChip.setAttribute('color', 'grey'); statusChip.classList.remove('success', 'warning', 'error'); statusChip.classList.add('grey'); }}
        if (userAvatarElement) userAvatarElement.style.display = 'none';
        if (userDetailsDiv) userDetailsDiv.style.display = 'none';

        try {{
            const response = await fetch('/api/v1/{api_base_path}/oauth_status');
            const data = await response.json();
            console.log('BangumiSyncV2Test: OAuth status response:', data);

            if (data.authorized) {{
                if (statusText) statusText.textContent = `已授权: ${{data.nickname || '未知用户'}}`;
                if (statusIcon) statusIcon.className = 'v-icon notranslate mdi mdi-check-circle theme--light';
                if (statusChip) {{ statusChip.setAttribute('color', 'success'); statusChip.classList.remove('grey', 'warning'); }}
                if (authorizeBtn) authorizeBtn.disabled = true;
                if (deauthorizeBtn) deauthorizeBtn.disabled = false;
                
                if (userAvatarElement && data.avatar) {{
                    // Vuetify VAvatar 通常通过 :src 绑定，直接设置 src 可能不触发更新，或需要特定方式
                    // 尝试直接设置 img 元素的 src (如果 VAvatar 内部是 img)
                    const imgElement = userAvatarElement.querySelector('img') || userAvatarElement; // 尝试找到内部img
                    if(imgElement) imgElement.setAttribute('src', data.avatar);
                    userAvatarElement.style.display = 'block';
                }}
                if (uidText) uidText.textContent = `Bangumi UID: ${{data.bangumi_user_id || ''}}`;
                if (expireText) expireText.textContent = `令牌有效期至: ${{data.expire_time_readable || 'N/A'}}`;
                if (userDetailsDiv && data.bangumi_user_id) userDetailsDiv.style.display = 'block';

                // 更新昵称链接
                if (statusText && data.url) {{ // statusText 是 <a> 或 <span>
                    if (statusText.tagName === 'A') {{
                        statusText.href = data.url;
                        statusText.target = '_blank';
                        statusText.style.color = 'inherit';
                        statusText.style.textDecoration = 'none';
                    }}
                }}

            }} else {{
                if (statusText) statusText.textContent = data.message || '未授权或状态未知';
                if (statusIcon) statusIcon.className = 'v-icon notranslate mdi mdi-information theme--light';
                if (statusChip) {{ statusChip.setAttribute('color', 'warning'); statusChip.classList.remove('grey', 'success'); }}
                if (authorizeBtn) authorizeBtn.disabled = false;
                if (deauthorizeBtn) deauthorizeBtn.disabled = true;
                if (statusText && statusText.tagName === 'A') {{ // 如果之前是链接，恢复成普通文本
                    statusText.removeAttribute('href');
                    statusText.removeAttribute('target');
                }}
            }}
        }} catch (error) {{
            console.error('BangumiSyncV2Test: 获取OAuth状态失败:', error);
            if (statusText) statusText.textContent = '获取状态失败';
            if (statusIcon) statusIcon.className = 'v-icon notranslate mdi mdi-alert-circle theme--light';
            if (statusChip) {{ statusChip.setAttribute('color', 'error'); statusChip.classList.remove('grey', 'success', 'warning'); }}
            if (authorizeBtn) authorizeBtn.disabled = false; 
            if (deauthorizeBtn) deauthorizeBtn.disabled = true;
        }}
    }}

    async function bangumiSyncV2Test_handleOAuthAuthorize() {{
        console.log('BangumiSyncV2Test: handleOAuthAuthorize called');
        try {{
            const response = await fetch('/api/v1/{api_base_path}/oauth_authorize');
            const data = await response.json();
            if (data.status === 'success' && data.auth_url) {{
                const authWindow = window.open(data.auth_url, '_blank', 'width=600,height=700,noopener,noreferrer');
                if (!authWindow) {{
                     bangumiSyncV2Test_showToast('授权窗口可能已被浏览器拦截，请检查浏览器设置。', 'warning');
                     return;
                }}
                const checkInterval = setInterval(() => {{
                    try {{ // 增加 try-catch 防止因窗口权限问题导致JS错误
                        if (authWindow && authWindow.closed) {{
                            clearInterval(checkInterval);
                            console.log('BangumiSyncV2Test: Auth window closed, refreshing status.');
                            bangumiSyncV2Test_fetchOAuthStatus();
                        }}
                    }} catch (e) {{ // 跨域安全策略可能导致访问 closed 属性报错
                        clearInterval(checkInterval); // 无法检测，停止轮询
                        console.warn('BangumiSyncV2Test: Cannot access authWindow.closed, stopping poll. Please refresh manually if needed.');
                        // 可以提示用户手动刷新
                        // bangumiSyncV2Test_showToast('授权完成后请手动刷新状态。', 'info');
                    }}
                }}, 500);
            }} else {{
                bangumiSyncV2Test_showToast(data.message || '获取授权链接失败', 'error');
            }}
        }} catch (error) {{
            console.error('BangumiSyncV2Test: 发起授权失败:', error);
            bangumiSyncV2Test_showToast('发起授权请求失败', 'error');
        }}
    }}

    async function bangumiSyncV2Test_handleOAuthDeauthorize() {{
        console.log('BangumiSyncV2Test: handleOAuthDeauthorize called');
        if (!confirm('确定要解除 Bangumi OAuth 授权吗？')) {{
            return;
        }}
        try {{
            const response = await fetch('/api/v1/{api_base_path}/oauth_deauthorize', {{ method: 'POST' }});
            const data = await response.json();
            bangumiSyncV2Test_showToast(data.message || (data.status === 'success' ? '已成功解除授权' : '解除授权失败'), data.status === 'success' ? 'success' : 'error');
            bangumiSyncV2Test_fetchOAuthStatus();
        }} catch (error) {{
            console.error('BangumiSyncV2Test: 解除授权失败:', error);
            bangumiSyncV2Test_showToast('解除授权请求失败', 'error');
        }}
    }}

    window.addEventListener('message', (event) => {{
        if (event.origin === window.location.origin && event.data === 'BANGUMI-OAUTH-COMPLETE') {{
            console.log('BangumiSyncV2Test: 收到 OAuth 完成消息，刷新状态...');
            bangumiSyncV2Test_fetchOAuthStatus();
        }}
    }}, false);

    // 确保DOM加载完成后执行
    function bangumiSyncV2Test_initPage() {{
        if (document.getElementById('bangumi-oauth-status-container')) {{
            bangumiSyncV2Test_fetchOAuthStatus();
        }} else {{
            // 如果元素还不存在，稍后重试，或者依赖 MoviePilot 的页面加载钩子
            setTimeout(bangumiSyncV2Test_initPage, 100);
        }}
    }}
    if (document.readyState === 'complete' || document.readyState === 'interactive') {{
        bangumiSyncV2Test_initPage();
    }} else {{
        document.addEventListener('DOMContentLoaded', bangumiSyncV2Test_initPage);
    }}
}}
</script>
        """
        script_container = {'component': 'div', 'props': {'innerHTML': frontend_script, 'style': 'display:none;'}}
        return [{'component': 'VRow', 'content': [{'component': 'VCol', 'props': {'cols': 12, 'md': 8, 'offset-md': 2}, 'content': [{'component': 'VCard', 'props': {'variant': 'outlined'}, 'content': oauth_card_content + [script_container]}]}]}]

    def __update_config(self):
        logger.info(f"准备执行 __update_config。当前的 self._auth_method 是: '{self._auth_method}'")
        self.update_config({
            "enable": self._enable,
            "uniqueid_match": self._uniqueid_match,
            "user": self._user,
            "token": self._token,
            "auth_method": self._auth_method,
            "oauth_app_id": self._oauth_app_id,
            "oauth_app_secret": self._oauth_app_secret,
            "tab": self._tab, 
            "global_oauth_info": self._global_oauth_info
        })
        logger.info(f"__update_config 执行完毕。保存到配置的 auth_method 是: '{self._auth_method}'")

    def get_state(self) -> bool:
        return self._enable

    def stop_service(self):
        pass

if __name__ == "__main__":
    # 测试代码需要适应全局模式，并且在MoviePilot环境外运行可能受限
    async def main_test():
        plugin_instance = BangumiSyncV2Test()
        # 模拟配置
        plugin_instance.init_plugin(config={ 
            "enable": True, 
            "auth_method": "token", # 或 "oauth"
            "token": "YOUR_BANGUMI_ACCESS_TOKEN_IF_TESTING_TOKEN_MODE", 
            # "oauth_app_id": "YOUR_APP_ID", 
            # "oauth_app_secret": "YOUR_APP_SECRET",
            "user": "testuser",
            "tmdb_key": "YOUR_TMDB_KEY" # 确保settings.TMDB_API_KEY能被访问或在此处提供
        })
        if not plugin_instance._tmdb_key:
             # 如果 settings.TMDB_API_KEY 在此环境下不可用，需要手动设置
             plugin_instance._tmdb_key = "YOUR_TMDB_API_KEY_HERE_FOR_TESTING"


        subject_id, subject_name, ep_name = await plugin_instance.get_subjectid_by_title("葬送のフリーレン", 1, 1, None) # 使用日文原名测试
        if subject_id:
            logger.info(f"测试找到 Subject ID: {subject_id} ({subject_name}), Episode Name: {ep_name}")
            # await plugin_instance.sync_watching_status(subject_id, 1, ep_name)
        else:
            logger.info("测试未能找到 Subject ID。")

    # 在 MoviePilot 环境外运行异步代码
    # Python 3.7+
    if hasattr(asyncio, 'run'):
        asyncio.run(main_test())
    else: # 旧版 Python 可能需要手动管理事件循环
        loop = asyncio.get_event_loop()
        try:
            loop.run_until_complete(main_test())
        finally:
            loop.close()
    logger.info("本地测试脚本执行完毕。请在MoviePilot插件环境中进行完整测试。")

