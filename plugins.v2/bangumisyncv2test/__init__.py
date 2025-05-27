import datetime
import re
import time # 用于处理令牌过期时间戳
import json # 用于解析和存储OAuth信息
import uuid # 用于生成state参数
import asyncio # 导入 asyncio

from typing import Any, Dict, List, Optional, Tuple

# BangumiSyncDebug 插件原有的 imports
from app import schemas
from app.core.event import eventmanager, Event
from app.core.config import settings
# MetaInfo 未在原版 BangumiSyncDebug 中使用
from app.log import logger
from app.plugins import _PluginBase
from app.schemas import WebhookEventInfo # MediaInfo 未在原版 BangumiSyncDebug 中使用
from app.schemas.types import EventType # MediaType 未在原版 BangumiSyncDebug 中使用
# RequestUtils 未在原版 BangumiSyncDebug 中直接使用，而是通过 requests.Session
from cachetools import cached, TTLCache
import requests # 注意：在async函数中应使用异步HTTP库如httpx
from urllib.parse import urlencode, quote_plus # 用于构建URL参数

# 导入 MoviePilot 底层 Web 框架提供的重定向响应类
# 你需要根据 MoviePilot 的文档找到正确的导入路径
try:
    from starlette.responses import RedirectResponse as MoviePilotRedirectResponse
except ImportError:
    logger.error("无法导入 MoviePilot 的重定向响应类。后端重定向可能不受支持。")
    MoviePilotRedirectResponse = None # 设置为 None 以便后续检查


# Bangumi OAuth 相关的 URL
BANGUMI_AUTHORIZE_URL = "https://bgm.tv/oauth/authorize" # 授权页面 URL
BANGUMI_TOKEN_URL = "https://bgm.tv/oauth/access_token" # 令牌交换接口 URL
BANGUMI_USER_INFO_URL = "https://api.bgm.tv/v0/me" # 获取用户信息的接口示例

# --- 新增：Bangumi OAuth 信息数据模型 (简化版) ---
class BangumiOAuthData:
    """存储Bangumi OAuth令牌和用户信息"""
    def __init__(self,
                 access_token: str, # 访问令牌
                 refresh_token: Optional[str], # 刷新令牌 (可能不会总是返回)
                 expire_time: float, # Unix时间戳
                 bangumi_user_id: Optional[int] = None, # Bangumi 用户ID
                 nickname: Optional[str] = None, # 昵称
                 avatar: Optional[str] = None, # 头像URL
                 profile_url: Optional[str] = None): # 个人主页URL (对应 C# AuthState 中的 'url')
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.expire_time = expire_time
        self.bangumi_user_id = bangumi_user_id
        self.nickname = nickname
        self.avatar = avatar
        self.profile_url = profile_url # Corresponds to 'url' in C# AuthState
        self.effective_time = time.time() # 令牌生效时间 (对应 C# AuthState 中的 'effective')

    def is_expired(self, buffer_seconds: int = 300) -> bool:
        """检查令牌是否已过期 (增加缓冲期)"""
        return time.time() >= (self.expire_time - buffer_seconds)

    async def refresh_token_async(self,
                                  http_session: requests.Session,
                                  app_id: str,
                                  app_secret: str,
                                  ua_string: str) -> Tuple[bool, Optional[str]]:
        """异步刷新令牌。返回 (是否成功, 错误信息)"""
        if not self.refresh_token:
            return False, "Refresh Token不存在。"
        if not app_id or not app_secret:
            return False, "插件未配置Bangumi OAuth Application ID或Secret。"

        payload = {
            "grant_type": "refresh_token",
            "client_id": app_id,
            "client_secret": app_secret,
            "refresh_token": self.refresh_token,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded", "User-Agent": ua_string}

        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: http_session.post(BANGUMI_TOKEN_URL, data=payload, headers=headers))
            response.raise_for_status()
            token_data = response.json()

            self.access_token = token_data['access_token']
            self.expire_time = time.time() + token_data.get('expires_in', 0)
            # Bangumi 有时会返回新的 refresh_token
            if 'refresh_token' in token_data:
                self.refresh_token = token_data['refresh_token']
            self.effective_time = time.time()
            logger.info("Bangumi令牌刷新成功。")
            return True, None
        except requests.exceptions.HTTPError as http_err:
            error_message = f"刷新令牌HTTP错误: {http_err}"
            try:
                error_json = http_err.response.json()
                error_message += f". 响应: {error_json}" # 如果响应是JSON格式
            except ValueError: # If response is not JSON
                error_message += f". 响应文本: {http_err.response.text}"
            logger.error(f"刷新Bangumi令牌失败: {error_message}")
            if http_err.response and http_err.response.status_code == 400 and "invalid_grant" in http_err.response.text:
                 return False, "Refresh Token已失效，请重新授权。"
            return False, error_message
        except Exception as e:
            logger.exception(f"刷新Bangumi令牌时发生未知错误: {e}")
            return False, f"刷新令牌时发生未知错误: {e}"

    async def get_profile_async(self, http_session: requests.Session, ua_string: str) -> bool:
        """异步获取并更新用户资料。返回是否成功。"""
        if not self.access_token:
            logger.warning("无法获取用户资料：Access Token缺失。")
            return False
        headers = {"Authorization": f"Bearer {self.access_token}", "User-Agent": ua_string}
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: http_session.get(BANGUMI_USER_INFO_URL, headers=headers))
            response.raise_for_status()
            profile_data = response.json()
            self.bangumi_user_id = profile_data.get('id')
            self.nickname = profile_data.get('nickname')
            self.avatar = profile_data.get('avatar', {}).get('large')
            self.profile_url = profile_data.get('url')
            logger.info(f"成功获取Bangumi用户资料: {self.nickname} (ID: {self.bangumi_user_id})")
            return True
        except requests.exceptions.RequestException as e:
            error_msg = f"获取 Bangumi 用户信息失败: {e}"
            if e.response is not None:
                 try: error_msg += f". 响应: {e.response.json()}"
                 except ValueError: error_msg += f". 响应文本: {e.response.text}" # 如果响应不是JSON
            logger.error(error_msg)
        except Exception as e:
             logger.exception(f"获取用户信息时发生未知错误: {e}")
        return False

    def to_dict(self) -> Dict[str, Any]:
        """将对象转换为字典以便存储"""
        return self.__dict__

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Optional['BangumiOAuthData']:
        """从字典创建对象"""
        if not data:
            return None
        try:
            # effective_time 在创建/刷新时设置，不直接从旧存储加载
            return cls(
                access_token=data['access_token'],
                refresh_token=data.get('refresh_token'),
                expire_time=data['expire_time'],
                bangumi_user_id=data.get('bangumi_user_id'),
                nickname=data.get('nickname'),
                avatar=data.get('avatar'),
                profile_url=data.get('profile_url')
            )
        except KeyError as e:
            logger.error(f"从字典创建BangumiOAuthData失败，缺少键: {e}")
            return None


class BangumiSyncV2Test(_PluginBase):
    # 插件名称
    plugin_name = "bgm-V2-测试"
    # 插件描述
    plugin_desc = "将在看记录同步到bangumi"
    # 插件图标
    plugin_icon = "https://raw.githubusercontent.com/honue/MoviePilot-Plugins/main/icons/bangumi.jpg"
    # 插件版本
    plugin_version = "1.1.0" # 版本更新
    # 插件作者
    plugin_author = "honue,happyTonakai,AAA,Gemini"
    # 作者主页
    author_url = "https://github.com/l429609201"
    # 插件配置项ID前缀
    plugin_config_prefix = "bangumisyncv2test_"
    # 加载顺序
    plugin_order = 20
    # 可使用的用户级别
    auth_level = 1

    UA = "l429609201/MoviePilot-Plugins (https://github.com/l429609201)"

    _enable = True # 默认启用
    _user: Optional[str] = None
    _bgm_uid: Optional[int] = None # Token模式下的Bangumi UID
    _token: Optional[str] = None # Token模式下的Access Token
    _tmdb_key: Optional[str] = None
    _request: Optional[requests.Session] = None # requests.Session实例
    _uniqueid_match: bool = False # 是否优先使用TMDB剧集ID匹配

    _auth_method: Optional[str] = "access-token" # 认证方式: 'access-token' 或 'oauth'
    _oauth_app_id: Optional[str] = None # OAuth App ID
    _oauth_app_secret: Optional[str] = None
    
    _global_oauth_info: Optional[BangumiOAuthData] = None # 使用新的数据模型

    _tab: str = 'auth-method-tab' # 用于get_form中的标签页
    _pending_oauth_state: Optional[str] = None # 用于存储待验证的 state

    def init_plugin(self, config: dict = None):
        if config:
            if 'enable' in config:
                self._enable = config.get('enable', True)
            self._uniqueid_match = config.get('uniqueid_match', False)
            self._user = config.get('user')

            loaded_auth_method = config.get('auth_method')
            if loaded_auth_method in ["access-token", "oauth"]:
                self._auth_method = loaded_auth_method
            else:
                logger.warning(f"配置中的 auth_method 无效或不存在 ('{loaded_auth_method}'), 将默认为 'access-token'.")
                self._auth_method = "access-token"

            self._token = config.get('token')
            self._oauth_app_id = config.get('oauth_app_id')
            self._oauth_app_secret = config.get('oauth_app_secret')
            
            default_tab_for_method = 'params-tab' if self._auth_method in ['access-token', 'oauth'] else 'auth-method-tab'
            self._tab = config.get('tab', default_tab_for_method)

            oauth_info_dict = config.get('global_oauth_info')
            if isinstance(oauth_info_dict, dict):
                self._global_oauth_info = BangumiOAuthData.from_dict(oauth_info_dict)
                if not self._global_oauth_info:
                    logger.warning("从配置加载的 global_oauth_info 字典无法转换为 BangumiOAuthData 对象。")
            else:
                self._global_oauth_info = None # 如果不是字典或为 None
        else:
            # 首次加载或无配置时
            self._enable = True
            self._auth_method = "access-token"
            self._tab = 'auth-method-tab'
            self._global_oauth_info = None
            logger.info(f"插件 {self.plugin_name} 首次加载或无配置，使用默认设置。")

        self._tmdb_key = settings.TMDB_API_KEY
        headers = {"User-Agent": BangumiSyncV2Test.UA, "content-type": "application/json"}
        self._request = requests.Session()
        self._request.headers.update(headers)
        if settings.PROXY:
            self._request.proxies.update(settings.PROXY)

        logger.info(f"插件 {self.plugin_name} 初始化配置如下:")
        logger.info(f"  启用状态 (_enable): {self._enable}")
        logger.info(f"  认证方式 (_auth_method): {self._auth_method}")
        # ... (可以添加更多关键配置的日志)

        self.__update_config() # 保存（可能已更新的）配置
        logger.info(f"Bangumi在看同步插件 v{self.plugin_version} 初始化成功")


    def _get_moviepilot_base_url(self, request: Any) -> Optional[str]:
        if not request:
            logger.error("无法获取 MoviePilot 基础 URL：request 对象为空。")
            return None
        try:
            scheme = getattr(request.url, 'scheme', None)
            netloc = getattr(request.url, 'netloc', None)
            if not scheme or not netloc:
                logger.error(f"无法从 request 对象中解析 scheme 或 netloc。request.url 结构: {getattr(request, 'url', 'N/A')}")
                return None
            return f"{scheme}://{netloc}"
        except AttributeError as e:
            logger.error(f"解析 MoviePilot 基础 URL 时发生属性错误: {e}")
            return None

    def _store_global_oauth_info(self, oauth_data_obj: Optional[BangumiOAuthData]):
        """存储全局OAuth信息对象并更新配置"""
        self._global_oauth_info = oauth_data_obj
        self.__update_config()

    def _delete_global_oauth_info(self):
        """删除全局OAuth信息并更新配置"""
        if self._global_oauth_info is not None:
            self._global_oauth_info = None
            self.__update_config()
            logger.info("全局Bangumi OAuth信息已删除。")

    def _store_pending_oauth_state(self, state: str):
        """(简化版) 存储待验证的 state 参数"""
        # TODO: 生产环境应使用与用户/会话关联且带超时的存储机制
        self._pending_oauth_state = state
        logger.debug(f"OAuth: Stored pending state: {state}")

    def _validate_and_clear_pending_oauth_state(self, received_state: Optional[str]) -> bool:
        """(简化版) 验证并清除 state 参数"""
        # TODO: 生产环境应根据用户/会话获取期望的 state 并进行验证
        expected_state = self._pending_oauth_state
        self._pending_oauth_state = None # 清除，无论成功与否，state 只能用一次
        if not received_state or not expected_state or received_state != expected_state:
            logger.warning(f"OAuth State Mismatch. Received: '{received_state}', Expected: '{expected_state}'")
            return False
        logger.debug(f"OAuth State validation successful: '{received_state}'")
        return True

    async def _get_valid_access_token(self) -> Optional[str]:
        """获取有效的访问令牌，如果过期则尝试刷新"""
        if not self._global_oauth_info:
            logger.debug("OAuth: 未找到OAuth信息。")
            return None

        if self._global_oauth_info.is_expired():
            logger.info("OAuth: Bangumi访问令牌已过期，尝试刷新...")
            if not self._request or not self._oauth_app_id or not self._oauth_app_secret:
                logger.error("OAuth: 无法刷新令牌，缺少 session, app_id 或 app_secret。")
                return None
            success, error_msg = await self._global_oauth_info.refresh_token_async(
                self._request, self._oauth_app_id, self._oauth_app_secret, self.UA
            )
            if not success:
                logger.warning(f"OAuth: 令牌刷新失败: {error_msg}")
                if "Refresh Token已失效" in (error_msg or ""): # 如果错误信息指示Refresh Token失效
                    self._delete_global_oauth_info() # 如果refresh token失效，清除整个OAuth信息
                return None
            self._store_global_oauth_info(self._global_oauth_info) # 保存更新后的信息
            logger.info("OAuth: 令牌刷新成功并已保存。")
        
        return self._global_oauth_info.access_token

    async def _bangumi_api_request(self, method: str, url: str, **kwargs) -> requests.Response:
        headers = kwargs.pop('headers', {})
        headers.update({"User-Agent": self.UA})

        if self._auth_method == 'access-token':
            if not self._token:
                raise ValueError("Access Token认证方式未配置Token。")
            headers["Authorization"] = f"Bearer {self._token}"
        elif self._auth_method == 'oauth':
            access_token = await self._get_valid_access_token()
            if not access_token:
                raise ValueError("OAuth: 未找到有效的Bangumi访问令牌。")
            headers["Authorization"] = f"Bearer {access_token}"
        else:
            raise ValueError(f"未知的认证方式: {self._auth_method}")
        
        if 'json' in kwargs and 'content-type' not in headers:
            headers['content-type'] = 'application/json'

        loop = asyncio.get_event_loop()
        if not self._request:
            # 理想情况下，如果 init_plugin 总被调用，这里不应该发生
            logger.warning("self._request 未初始化，将创建临时 Session。")
            temp_session = requests.Session()
            if settings.PROXY:
                temp_session.proxies.update(settings.PROXY)
            response = await loop.run_in_executor(None, lambda: temp_session.request(method, url, headers=headers, **kwargs))
        else:
            response = await loop.run_in_executor(None, lambda: self._request.request(method, url, headers=headers, **kwargs))
        
        return response

    @eventmanager.register(EventType.WebhookMessage)
    def hook(self, event: Event):
        logger.info(f"{self.plugin_name}: 开始处理webhook事件。") # 为了可见性，改为 INFO

        if not self._enable:
            logger.info(f"{self.plugin_name}: 插件未启用。") # 为了可见性，改为 INFO
            return
        
        logger.debug(f"{self.plugin_name}: 当前认证方式 {self._auth_method}")
        if self._auth_method == 'access-token':
            if not self._token:
                logger.warning(f"{self.plugin_name}: Token认证方式未配置Access Token。")
                return
        elif self._auth_method == 'oauth':
            if not self._global_oauth_info:
                logger.warning(f"{self.plugin_name}: OAuth认证方式已选择，但尚未完成授权。")
                return
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError: 
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            access_token = loop.run_until_complete(self._get_valid_access_token())
            if not access_token:
                 logger.warning(f"{self.plugin_name}: OAuth认证令牌无效或无法刷新。")
                 return
        else:
            logger.error(f"{self.plugin_name}: 未知的认证方式: {self._auth_method}")
            return

        try:
            event_info: WebhookEventInfo = event.event_data
            logger.debug(f"收到webhook事件: {event_info.event} for user {event_info.user_name}")

            if not self._user or event_info.user_name not in self._user.split(','):
                logger.debug(f"Webhook事件用户 {event_info.user_name} 不在配置用户列表 {self._user} 中，跳过。")
                return

            play_start = {"playback.start", "media.play", "PlaybackStart"}
            if not (event_info.event in play_start or (event_info.percentage and event_info.percentage > 90)):
                logger.debug(f"非播放开始或进度不足90%事件 ({event_info.event}, {event_info.percentage}%)，跳过。")
                return
            if not BangumiSyncV2Test.is_anime(event_info):
                logger.debug(f"媒体 '{event_info.item_name}' 未被识别为动漫，跳过。")
                return

            if event_info.item_type in ["TV"]:
                tmdb_id_str = event_info.tmdb_id # tmdb_id from event might be string or int
                logger.info(f"匹配播放事件 '{event_info.item_name}' (TMDB ID: {tmdb_id_str})...")
                
                title_match = re.match(r"^(.+?)\sS\d+E\d+\s.*", event_info.item_name)
                title = title_match.group(1) if title_match else event_info.item_name.split(' ')[0]

                season_id, episode_id = int(event_info.season_id), int(event_info.episode_id)
                self._prefix = f"[{title} S{season_id:02d}E{episode_id:02d}]" # 设置日志前缀
                unique_id = None
                if tmdb_id_str:
                    try:
                        unique_id = int(tmdb_id_str) # Assuming tmdb_id from event is the episode's TMDB ID
                    except ValueError:
                        logger.warning(f"{self._prefix} 事件中的 TMDB ID '{tmdb_id_str}' 不是有效的整数。")
                
                try:
                    loop = asyncio.get_event_loop()
                except RuntimeError:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)

                subject_id, subject_name, original_episode_name = loop.run_until_complete(
                    self.get_subjectid_by_title(title, season_id, episode_id, unique_id)
                )
                if subject_id is None:
                    logger.info(f"{self._prefix} 未能找到Bangumi条目。")
                    return
                
                logger.info(f"{self._prefix} 匹配到Bangumi条目: {subject_name} (ID: {subject_id}), 原始剧集名: {original_episode_name}")
                loop.run_until_complete(self.sync_watching_status(subject_id, episode_id, original_episode_name))
            else:
                logger.debug(f"非TV类型媒体 ({event_info.item_type})，跳过。")

        except Exception as e:
            logger.exception(f"同步在看状态失败: {e}") # 使用 logger.exception 记录堆栈跟踪

    @cached(TTLCache(maxsize=100, ttl=3600))
    async def get_subjectid_by_title(self, title: str, season: int, episode: int, unique_id: Optional[int]) -> Tuple[Optional[int], Optional[str], Optional[str]]:
        current_prefix = getattr(self, '_prefix', f"[{title} S{season:02d}E{episode:02d}]")
        logger.debug(f"{current_prefix} 尝试使用 bgm api 来获取 subject id...")
        
        tmdb_data = await self.get_tmdb_id(title) 
        tmdb_id_series, original_name, original_language = tmdb_data if tmdb_data else (None, None, None)

        original_episode_name_from_tmdb = None # Store TMDB's episode name
        post_json: Dict[str, Any] = { # Ensure type for post_json
            "keyword": title,
            "sort": "match",
            "filter": {"type": [2]}, 
        }

        if tmdb_id_series and original_name and original_language:
            airdate_info = await self.get_airdate_and_ep_name(
                tmdb_id_series, season, episode, unique_id if self._uniqueid_match else None, original_language
            )
            if airdate_info:
                start_date, end_date, tmdb_ep_name = airdate_info
                original_episode_name_from_tmdb = tmdb_ep_name # 将此作为主要的原始剧集名
                if start_date and end_date:
                    post_json = {
                        "keyword": original_name, # 如果TMDB信息可用，则按原始名称搜索
                        "sort": "match",
                        "filter": {"type": [2], "air_date": [f">={start_date}", f"<={end_date}"]},
                    }
        
        url = f"https://api.bgm.tv/v0/search/subjects"
        try:
            response = await self._bangumi_api_request('POST', url, json=post_json)
            response.raise_for_status() 
            resp_json = response.json()
        except ValueError as ve: # 捕获来自 _bangumi_api_request 的特定 ValueError
            logger.error(f"{current_prefix} Bangumi API认证失败: {ve}")
            return None, None, None
        except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
            logger.error(f"{current_prefix} 请求或解析Bangumi搜索API失败: {e}")
            return None, None, None

        if not resp_json.get("data"):
            logger.warning(f"{current_prefix} Bangumi API未找到 '{post_json.get('keyword', title)}' 的条目 (Filter: {post_json.get('filter')})")
            return None, None, None
        
        # TODO: Add logic to iterate through resp_json.get("data") if multiple results,
        #  如果存在多个结果，添加逻辑进行迭代，并尝试找到更好的匹配项，例如通过比较 original_name 或年份。
        #  目前，取第一个结果。
        data = resp_json.get("data")[0]
        year = data.get("date", "----")[:4]
        name_cn = data.get("name_cn") or data.get("name", "未知标题")
        formatted_name = f"{name_cn} ({year})"
        subject_id_val = data.get("id")

        return subject_id_val, formatted_name, original_episode_name_from_tmdb


    @cached(TTLCache(maxsize=100, ttl=3600))
    async def get_tmdb_id(self, title: str) -> Optional[Tuple[int, str, str]]: # 返回类型提示
        current_prefix = getattr(self, '_prefix', f"[{title}]")
        logger.debug(f"{current_prefix} 尝试使用 tmdb api 来获取系列 TMDB ID...")
        if not self._tmdb_key: 
            logger.warning(f"{current_prefix} TMDB API Key未配置。")
            return None
        
        # 为URL编码标题
        encoded_title = quote_plus(title)
        url = f"https://api.tmdb.org/3/search/tv?query={encoded_title}&api_key={self._tmdb_key}"
        
        try:
            loop = asyncio.get_event_loop()
            if not self._request: # Should not happen if init_plugin ran
                logger.error(f"{current_prefix} self._request is None in get_tmdb_id")
                return None
            response = await loop.run_in_executor(None, lambda: self._request.get(url))
            response.raise_for_status()
            ret = response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"{current_prefix} 请求TMDB ID失败 for '{title}': {e}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"{current_prefix} 解析TMDB ID响应失败 for '{title}': {e}")
            return None
            
        if not ret.get("results"): # 从检查 total_results 改为检查实际的 results 列表
            logger.warning(f"{current_prefix} TMDB API未找到 '{title}' 的条目")
            return None
        
        # 迭代并找到最佳匹配（例如，第一个动画类型的条目）
        for result in ret["results"]:
            if 16 in result.get("genre_ids", []): # 16 is Animation genre ID
                tmdb_id = result.get("id")
                original_name = result.get("original_name")
                original_language = result.get("original_language")
                if tmdb_id and original_name and original_language:
                    return tmdb_id, original_name, original_language
        
        logger.warning(f"{current_prefix} TMDB API未找到 '{title}' 的动画类型条目")
        return None

    @cached(TTLCache(maxsize=100, ttl=3600))
    async def get_airdate_and_ep_name(self,
                                      tmdb_series_id: int,
                                      season_number: int,
                                      episode_number: int, # 媒体库中的集号
                                      tmdb_episode_id_unique: Optional[int], # 剧集的唯一TMDB ID (如果媒体服务器提供)
                                      original_language: str) -> Optional[Tuple[str, str, str]]: # start_date, end_date, episode_name
        current_prefix = getattr(self, '_prefix', f"[TMDB_S_ID:{tmdb_series_id} S{season_number:02d}E{episode_number:02d}]")
        if not self._tmdb_key: 
            logger.warning(f"{current_prefix} TMDB API Key未配置。")
            return None
        logger.debug(f"{current_prefix} 尝试使用 tmdb api 来获取剧集播出日期和名称...")
        
        loop = asyncio.get_event_loop()
        if not self._request:
            logger.error(f"{current_prefix} self._request is None in get_airdate_and_ep_name")
            return None

        async def _fetch_tmdb_data(url: str) -> Optional[Dict[str, Any]]:
            try:
                response = await loop.run_in_executor(None, lambda: self._request.get(url))
                response.raise_for_status()
                return response.json()
            except requests.exceptions.RequestException as e:
                logger.debug(f"{current_prefix} TMDB API请求失败 for URL {url}: {e}")
            except json.JSONDecodeError as e:
                logger.debug(f"{current_prefix} TMDB API响应解析失败 for URL {url}: {e}")
            return None

        # 如果唯一的TMDB剧集ID可用，首先尝试获取特定剧集的详细信息。
        # 如果媒体服务器提供此ID，这通常更可靠。
        if self._uniqueid_match and tmdb_episode_id_unique:
            url_episode_detail = f"https://api.tmdb.org/3/tv/{tmdb_series_id}/season/{season_number}/episode/{episode_number}?api_key={self._tmdb_key}&language={original_language}"
            # 注意：上面的URL假定 tmdb_episode_id_unique 对应于 episode_number。
            # 如果 tmdb_episode_id_unique 是来自TMDB API的*实际*剧集ID，则有更直接的方法：
            # (然而，TMDB API通常不直接提供特定剧集的接口，它是季度详细信息的一部分)
            # 目前，我们将依赖于在季度详细信息中找到它。
            pass # Continue to season detail fetching

        # 获取季度详细信息
        url_season = f"https://api.tmdb.org/3/tv/{tmdb_series_id}/season/{season_number}?language={original_language}&api_key={self._tmdb_key}"
        season_detail_data = await _fetch_tmdb_data(url_season)

        # 如果直接获取季度信息失败或没有剧集，则回退到 episode groups
        if not season_detail_data or not season_detail_data.get("episodes"):
            logger.debug(f"{current_prefix} 无法通过标准季号获取TMDB季度信息，尝试通过episode group获取")
            url_groups = f"https://api.tmdb.org/3/tv/{tmdb_series_id}/episode_groups?api_key={self._tmdb_key}"
            groups_data = await _fetch_tmdb_data(url_groups)
            if groups_data and groups_data.get("results"):
                # Find the "Seasons" group, often the one with most episodes or a specific type
                # This logic might need refinement based on how TMDB structures specific shows
                official_season_groups = [g for g in groups_data["results"] if g.get("type") == 2 and "season" in g.get("name","").lower()] # 类型2通常是“官方”
                if not official_season_groups:
                    official_season_groups = [g for g in groups_data["results"] if "season" in g.get("name","").lower()]


                if official_season_groups:
                    # Try to find a group that matches the season_number in its name
                    target_group_data = None
                    for group in official_season_groups:
                        if f"Season {season_number}" in group.get("name", "") or \
                           f"第 {season_number} 季" in group.get("name", ""): # 基本匹配
                            target_group_data = group
                            break
                    if not target_group_data and len(official_season_groups) == 1 : # Fallback if only one season group
                         target_group_data = official_season_groups[0]


                    if target_group_data and target_group_data.get('id'):
                        url_group_detail = f"https://api.tmdb.org/3/tv/episode_group/{target_group_data['id']}?language={original_language}&api_key={self._tmdb_key}"
                        group_detail_data = await _fetch_tmdb_data(url_group_detail)
                        if group_detail_data and group_detail_data.get("groups"):
                            # Find the specific season within the episode group's groups
                            for group_in_group in group_detail_data["groups"]:
                                if group_in_group.get("name", "").startswith(f"Season {season_number}") or \
                                   (len(group_detail_data["groups"]) == 1 and group_in_group.get("episodes")): # 如果只有一个组，则假定是它
                                    season_detail_data = group_in_group # Use this group's episodes
                                    break
        
        if not season_detail_data or not season_detail_data.get("episodes"):
            logger.warning(f"{current_prefix} 无法获取TMDB季度剧集信息。")
            return None
        
        episodes_list = season_detail_data["episodes"]
        if not episodes_list: 
            logger.warning(f"{current_prefix} 该TMDB季度没有剧集信息。")
            return None

        # 查找匹配的剧集
        matched_ep_data = None
        for ep_data in episodes_list:
            # 如果提供了唯一的TMDB剧集ID并且已启用，则首先尝试按此ID匹配
            if self._uniqueid_match and tmdb_episode_id_unique and ep_data.get("id") == tmdb_episode_id_unique:
                matched_ep_data = ep_data
                break
            # 回退到按 episode_number (TMDB的字段) 匹配
            if ep_data.get("episode_number") == episode_number:
                matched_ep_data = ep_data
                break
            # 回退到按 order 匹配 (有时 'order' 是0索引的，所以+1)
            # 这种方式不太可靠，作为最后手段。
            if ep_data.get("order", -99) + 1 == episode_number and not matched_ep_data:
                 matched_ep_data = ep_data # 尝试性匹配

        if not matched_ep_data:
            # 如果仍然没有匹配，并且列表中只有一个剧集，且 episode_number 是 1，则假定是那个剧集。
            if len(episodes_list) == 1 and episode_number == 1:
                matched_ep_data = episodes_list[0]
            else:
                logger.warning(f"{current_prefix} 未在TMDB季度信息中找到匹配的剧集 (E{episode_number}, UniqueID: {tmdb_episode_id_unique})。")
                return None
        
        ep_name_tmdb = matched_ep_data.get("name")
        air_date_str = matched_ep_data.get("air_date")

        if not air_date_str: 
            # 如果特定剧集的播出日期缺失，尝试使用季度的播出日期作为粗略的回退
            air_date_str = season_detail_data.get("air_date")
            if air_date_str:
                logger.debug(f"{current_prefix} 剧集播出日期未找到，使用季度播出日期: {air_date_str}")
            else:
                logger.warning(f"{current_prefix} 无法确定剧集或季度的播出日期。")
                return None # 没有播出日期无法进行Bangumi搜索过滤
        
        try: 
            air_date_obj = datetime.datetime.strptime(air_date_str, "%Y-%m-%d").date()
        except ValueError: 
            logger.warning(f"{current_prefix} TMDB提供的播出日期格式无效: {air_date_str}")
            return None

        # 为Bangumi搜索创建一个日期范围 (例如，TMDB播出日期前后 +/- 30天)
        start_date = (air_date_obj - datetime.timedelta(days=30)).strftime("%Y-%m-%d") # 更宽的范围
        end_date = (air_date_obj + datetime.timedelta(days=30)).strftime("%Y-%m-%d")   # 更宽的范围
        
        return start_date, end_date, ep_name_tmdb

    @cached(TTLCache(maxsize=10, ttl=600))
    async def sync_watching_status(self, subject_id: int, episode_number_media: int, original_episode_name_from_tmdb: Optional[str]):
        current_prefix = getattr(self, '_prefix', f"[BGM Subject:{subject_id} E{episode_number_media:02d}]")
        
        bgm_user_id_for_api: Optional[int] = None
        if self._auth_method == 'access-token':
            if not self._bgm_uid: # 如果Token模式下UID未缓存
                try:
                    response = await self._bangumi_api_request('GET', BANGUMI_USER_INFO_URL)
                    response.raise_for_status()
                    user_info_json = response.json()
                    self._bgm_uid = user_info_json.get("id")
                    if not self._bgm_uid: 
                        logger.error(f"{current_prefix} Token模式: 获取Bangumi UID失败。响应: {user_info_json}")
                        return
                    logger.debug(f"{current_prefix} Token模式: 获取到 bgm_uid {self._bgm_uid}")
                except Exception as e: 
                    logger.error(f"{current_prefix} Token模式: 请求或解析Bangumi /me API失败: {e}")
                    return
            bgm_user_id_for_api = self._bgm_uid
        elif self._auth_method == 'oauth':
            if not self._global_oauth_info or not self._global_oauth_info.bangumi_user_id:
                logger.error(f"{current_prefix} OAuth模式: 未找到Bangumi用户ID或OAuth信息无效。")
                return
            bgm_user_id_for_api = self._global_oauth_info.bangumi_user_id
        else: 
            logger.error(f"{current_prefix} 未知认证方式，无法同步状态。")
            return

        if not bgm_user_id_for_api: # 上面应该已经捕获，但作为安全措施
            logger.error(f"{current_prefix} 无法获取Bangumi用户ID进行同步。")
            return

        # 1. 更新收藏状态为“在看” (类型 3)
        await self.update_collection_status(subject_id, bgm_user_id_for_api, new_type=3)
        
        # 2. 从Bangumi获取剧集列表
        bangumi_episodes_list = await self.get_episodes_info(subject_id)
        if not bangumi_episodes_list: 
            logger.warning(f"{current_prefix} 未能从Bangumi获取到剧集列表。")
            return

        # 3. 查找匹配的Bangumi剧集ID
        bangumi_episode_id_to_mark: Optional[int] = None
        matched_bangumi_ep_info: Optional[Dict[str, Any]] = None

        # 首先尝试通过TMDB的原始剧集名称进行匹配 (如果可用)
        if original_episode_name_from_tmdb:
            for ep_info in bangumi_episodes_list:
                # 标准化名称以便比较 (简单情况，可能需要更健壮的标准化方法)
                bgm_ep_name = (ep_info.get("name") or "").strip().lower()
                tmdb_ep_name_lower = original_episode_name_from_tmdb.strip().lower()
                if bgm_ep_name and tmdb_ep_name_lower and (bgm_ep_name == tmdb_ep_name_lower or tmdb_ep_name_lower in bgm_ep_name or bgm_ep_name in tmdb_ep_name_lower):
                    bangumi_episode_id_to_mark = ep_info.get("id")
                    matched_bangumi_ep_info = ep_info
                    logger.debug(f"{current_prefix} 通过TMDB剧集名 '{original_episode_name_from_tmdb}' 匹配到Bangumi剧集: '{ep_info.get('name')}' (ID: {bangumi_episode_id_to_mark})")
                    break # 找到即停止
        
        # 如果按名称未找到，则尝试按剧集号 (sort 顺序或 'ep' 字段) 匹配
        if not bangumi_episode_id_to_mark:
            for ep_info in bangumi_episodes_list:
                if ep_info.get("type") == 0: # 仅考虑主线剧集 (类型 0) 进行数字匹配
                    if ep_info.get("sort") == episode_number_media: 
                        bangumi_episode_id_to_mark = ep_info.get("id")
                        matched_bangumi_ep_info = ep_info
                        logger.debug(f"{current_prefix} 通过媒体剧集号 {episode_number_media} (sort) 匹配到Bangumi剧集: '{ep_info.get('name')}' (ID: {bangumi_episode_id_to_mark})")
                        break # 找到即停止
                    # 如果 'sort' 不匹配或不存在，则回退到 'ep' 字段
                    elif ep_info.get("ep") == episode_number_media and not bangumi_episode_id_to_mark : 
                        bangumi_episode_id_to_mark = ep_info.get("id")
                        matched_bangumi_ep_info = ep_info
                        logger.debug(f"{current_prefix} 通过媒体剧集号 {episode_number_media} (ep) 匹配到Bangumi剧集: '{ep_info.get('name')}' (ID: {bangumi_episode_id_to_mark})")
                        # Don't break here immediately, 'sort' is usually more reliable if present later
        
        if not bangumi_episode_id_to_mark: 
            logger.warning(f"{current_prefix} 未能在Bangumi剧集列表中找到与媒体剧集号 {episode_number_media} 或名称 '{original_episode_name_from_tmdb}' 匹配的剧集。")
            return
        
        # 4. 在Bangumi上标记该剧集为已看
        await self.update_episode_status(bangumi_episode_id_to_mark)
        
        # 5. 如果是最后一集主线剧集，则更新收藏状态为“已看完” (类型 2)
        is_last_main_episode = False
        if matched_bangumi_ep_info:
            main_episodes = [ep for ep in bangumi_episodes_list if ep.get("type") == 0] # 筛选主线剧集
            if main_episodes and matched_bangumi_ep_info.get("id") == main_episodes[-1].get("id"):
                is_last_main_episode = True
                logger.info(f"{current_prefix} 检测到当前为最后一集主线剧集。")
        
        if is_last_main_episode:
            await self.update_collection_status(subject_id, bgm_user_id_for_api, new_type=2) # Mark as completed

    @cached(TTLCache(maxsize=100, ttl=3600))
    async def update_collection_status(self, subject_id: int, bgm_user_id: int, new_type: int = 3):
        current_prefix = getattr(self, '_prefix', f"[BGM Subject:{subject_id}]")
        type_dict = {0:"未收藏", 1:"想看", 2:"看过", 3:"在看", 4:"搁置", 5:"抛弃"}
        
        current_status_url = f"https://api.bgm.tv/v0/users/{bgm_user_id}/collections/{subject_id}"
        current_collection_type = 0 # Default to "not collected"
        try:
            response_get = await self._bangumi_api_request('GET', current_status_url)
            if response_get.status_code == 200: 
                current_collection_type = response_get.json().get("type", 0)
            elif response_get.status_code == 404: 
                logger.debug(f"{current_prefix} Bangumi条目 {subject_id} 尚未被用户 {bgm_user_id} 收藏。") # 404 表示未收藏
            else: 
                logger.warning(f"{current_prefix} 获取用户 {bgm_user_id} 对条目 {subject_id} 的当前收藏状态失败 (code: {response_get.status_code})。")
        except Exception as e: 
            logger.warning(f"{current_prefix} 请求当前收藏状态时发生错误: {e}。")

        # 避免冗余更新或将“已看完”改回“在看”（除非明确意图）
        if current_collection_type == new_type:
            logger.info(f"{current_prefix} 合集状态已为 '{type_dict.get(new_type, new_type)}'，无需更新。")
            return
        if current_collection_type == 2 and new_type == 3: # 如果已经是“已看完”，则不更改为“在看”
            logger.info(f"{current_prefix} 合集状态已为 '看过'，不更改为 '在看'。")
            return
        
        update_url = f"https://api.bgm.tv/v0/users/-/collections/{subject_id}" # 使用 '-' 代表当前用户
        post_data = {"type": new_type} # 只发送类型；评论、是否私密等可以省略以使用默认值
        
        try:
            response_post = await self._bangumi_api_request('PATCH', update_url, json=post_data) # Bangumi 更新收藏状态使用 PATCH
            # Bangumi 对新收藏使用 201 Created，对更新使用 202 Accepted 或 204 No Content
            if response_post.status_code in [201, 202]: 
                logger.info(f"{current_prefix} 合集状态从 '{type_dict.get(current_collection_type, current_collection_type)}' 更新为 '{type_dict.get(new_type,new_type)}' 成功。")
            else:
                logger.warning(f"{current_prefix} 合集状态更新失败 (code: {response_post.status_code}): {response_post.text}")
        except Exception as e:
             logger.exception(f"{current_prefix} 更新Bangumi合集状态时发生错误: {e}")

    @cached(TTLCache(maxsize=100, ttl=3600))
    async def get_episodes_info(self, subject_id: int) -> Optional[List[Dict[str, Any]]]:
        current_prefix = getattr(self, '_prefix', f"[BGM Subject:{subject_id}]")
        url = "https://api.bgm.tv/v0/episodes"
        params = {"subject_id": subject_id, "type": 0} # 默认只获取主线剧集 (类型 0)
        try:
            response = await self._bangumi_api_request('GET', url, params=params)
            response.raise_for_status()
            response_json = response.json()
            ep_data = response_json.get("data")
            if isinstance(ep_data, list):
                logger.debug(f"{current_prefix} 成功获取 {len(ep_data)} 条主线剧集信息。")
                return ep_data
            else:
                logger.warning(f"{current_prefix} Bangumi剧集API返回的data不是列表: {type(ep_data)}")
                return [] # Return empty list if data is not a list
        except Exception as e:
            logger.exception(f"{current_prefix} 请求或解析Bangumi剧集列表API失败: {e}")
        return None

    @cached(TTLCache(maxsize=100, ttl=3600)) # Cache might be too aggressive if status changes often
    async def update_episode_status(self, bangumi_episode_id: int):
        current_prefix = getattr(self, '_prefix', f"[BGM Episode:{bangumi_episode_id}]")
        
        # 首先检查当前状态
        status_url = f"https://api.bgm.tv/v0/users/-/collections/-/episodes/{bangumi_episode_id}"
        try:
            response_get = await self._bangumi_api_request('GET', status_url)
            if response_get.status_code == 200:
                status_data = response_get.json()
                if status_data.get("type") == 2: # 类型 2 是“看过”
                    logger.info(f"{current_prefix} Bangumi单集 (ID: {bangumi_episode_id}) 已经标记为看过。")
                    return
            elif response_get.status_code != 404: # 404 表示尚未观看，这是正常的
                logger.warning(f"{current_prefix} 获取单集 {bangumi_episode_id} 信息失败 (code: {response_get.status_code})。")
                # 无论如何都继续标记为已看，因为常见情况是尚未标记。
        except Exception as e:
            logger.warning(f"{current_prefix} 检查单集 {bangumi_episode_id} 状态时发生错误: {e}。将尝试标记。")
                
        # 标记为已看 (类型 2)
        update_url = f"https://api.bgm.tv/v0/users/-/collections/-/episodes/{bangumi_episode_id}"
        try:
            response_put = await self._bangumi_api_request('PATCH', update_url, json={"type": 2}) # Bangumi 更新单集状态使用 PATCH
            if response_put.status_code == 204: # 204 No Content 表示 PUT/PATCH 成功
                logger.info(f"{current_prefix} Bangumi单集 (ID: {bangumi_episode_id}) 成功标记为看过。")
            else:
                logger.warning(f"{current_prefix} Bangumi单集 (ID: {bangumi_episode_id}) 标记为看过失败 (code: {response_put.status_code}): {response_put.text}")
        except Exception as e:
            logger.exception(f"{current_prefix} 更新Bangumi单集 {bangumi_episode_id} 观看状态时发生错误: {e}")

    @staticmethod
    def is_anime(event_info: WebhookEventInfo) -> bool:
        path_keyword_str = "日番,cartoon,动漫,动画,ani,anime,新番,番剧,特摄,bangumi,ova,映画,国漫,日漫"
        path_keywords = [k.strip().lower() for k in path_keyword_str.split(',')]
        
        path_to_check = ""
        if event_info.channel in ["emby", "jellyfin"]:
            path_to_check = (event_info.item_path or "").lower() # 优先使用路径
            if not path_to_check and event_info.library_name: # Fallback to library name
                path_to_check = (event_info.library_name or "").lower()
        elif event_info.channel == "plex":
            if event_info.json_object and isinstance(event_info.json_object, dict):
                path_to_check = (event_info.json_object.get("Metadata", {}).get("librarySectionTitle", "") or "").lower()
        
        if path_to_check:
            if any(keyword in path_to_check for keyword in path_keywords):
                return True
        
        logger.debug(f"路径/库名 '{path_to_check}' 未匹配到动漫关键字，不识别为动漫。")
        return False

    @staticmethod
    def format_title(title: str, season: int): 
        if season < 2: return title
        season_zh_map = {0:"零",1:"一",2:"二",3:"三",4:"四",5:"五",6:"六",7:"七",8:"八",9:"九"}
        # 处理大于9的季，例如 S10, S11
        season_str = str(season)
        if len(season_str) > 1: # 对于 S10, S11 等
            zh_parts = [season_zh_map.get(int(digit)) for digit in season_str]
            if all(zh_parts):
                season_zh = "".join(zh_parts)
            else: # 如果某个数字不在映射中 (例如，映射只覆盖0-9)，则回退
                season_zh = season_str 
        else:
            season_zh = season_zh_map.get(season)

        return f"{title} 第{season_zh}季" if season_zh else f"{title} S{season}" # Fallback to S{season}

    @staticmethod
    def get_command() -> List[Dict[str, Any]]: return []

    def get_api(self) -> List[Dict[str, Any]]:
        return [
            {
                "path": "/oauth_authorize", 
                "methods": ["GET"], 
                "endpoint": self._handle_oauth_authorize,  
                "summary": "开始Bangumi OAuth授权",
            },
            {
                "path": "/oauth_callback", 
                "methods": ["GET"], 
                "endpoint": self._handle_oauth_callback, 
                "summary": "Bangumi OAuth回调处理",
            },
            {
                "path": "/oauth_status", 
                "methods": ["GET"], 
                "endpoint": self._handle_oauth_status, 
                "summary": "获取Bangumi OAuth状态",
            },
            {
                "path": "/oauth_deauthorize", 
                "methods": ["GET"], 
                "endpoint": self._handle_oauth_deauthorize, 
                "summary": "解除Bangumi OAuth授权",
             },
        ]

    async def _handle_oauth_authorize(self, request: Any, user: Any, apikey: str) -> Any:
        if apikey != settings.API_TOKEN:
            logger.error(f"OAuth发起: API密钥错误 (用户: {getattr(user, 'id', 'Unknown')})")
            return schemas.Response(success=False, message="API密钥错误")
        if not self._oauth_app_id:
            logger.error(f"OAuth发起: 插件未配置Bangumi App ID (用户: {getattr(user, 'id', 'Unknown')})")
            return {"status": "error", "message": "插件未配置Bangumi OAuth Application ID。"}
        
        moviepilot_base_url = self._get_moviepilot_base_url(request)
        if not moviepilot_base_url:
            logger.error(f"OAuth发起: 无法获取MoviePilot基础URL (用户: {getattr(user, 'id', 'Unknown')})")
            return {"status": "error", "message": "MoviePilot 公开 URL 未配置或无效，无法构建回调地址。"}

        callback_path = f"/api/v1/plugins/{self.plugin_config_prefix.strip('_')}/oauth_callback"
        redirect_uri = f"{moviepilot_base_url}{callback_path}"
        
        generated_state = str(uuid.uuid4())
        self._store_pending_oauth_state(generated_state) # Store state for validation
        logger.debug(f"OAuth发起: 生成并存储 state: {generated_state} (用户: {getattr(user, 'id', 'Unknown')})")
        
        state_param_for_url = quote_plus(generated_state)
        auth_url_params = { # 构建授权URL参数字典
            "client_id": self._oauth_app_id,
            "redirect_uri": redirect_uri, # Bangumi 在查询字符串中期望未编码的 redirect_uri
            "response_type": "code",
            "state": state_param_for_url # state should be URL encoded
        }
        # Bangumi's documentation implies redirect_uri in the query string should NOT be URL-encoded itself,
        # but its components (if it had query params) would be. The whole redirect_uri is a value.
        # However, many OAuth providers expect the redirect_uri value to be URL-encoded.
        # Let's try with redirect_uri URL-encoded as per common practice.
        auth_url = f"{BANGUMI_AUTHORIZE_URL}?client_id={self._oauth_app_id}&redirect_uri={quote_plus(redirect_uri)}&response_type=code&state={state_param_for_url}"

        logger.info(f"OAuth发起: (用户: {getattr(user, 'id', 'Unknown')}), 回调: {redirect_uri}, 授权URL: {auth_url}")
        
        if MoviePilotRedirectResponse:
            logger.info(f"OAuth发起: 执行后端重定向到: {auth_url}")
            return MoviePilotRedirectResponse(url=auth_url, status_code=302)
        else:
            logger.error("OAuth发起: MoviePilot框架不支持后端重定向 (MoviePilotRedirectResponse未导入)。将返回JSON。")
            # 如果重定向类不可用，则回退到返回JSON
            return {"status": "success", "auth_url": auth_url} 

    async def _handle_oauth_callback(self, request: Any, apikey: str, user: Optional[Any] = None) -> Any: # Return type Any for HTML
        if apikey != settings.API_TOKEN:
            # 此端点由浏览器重定向调用，API密钥检查可能不那么关键，
            # 但如果MoviePilot框架强制执行，则保持一致性是好的。
            logger.warning("OAuth回调: API密钥不匹配 (可能不是问题，因为是浏览器重定向)")
            # return await self._make_html_resp("API密钥错误", is_error=True, request_obj=request)

        code = request.query_params.get('code')
        received_state = request.query_params.get('state')
        error_from_bgm = request.query_params.get('error')
        
        async def make_local_html_resp(msg: str, is_error: bool = False):
            # 辅助函数，使用回调作用域中的 request 对象
            return await self._make_html_resp(msg, is_error, request)

        if error_from_bgm:
            logger.error(f"OAuth回调: Bangumi返回错误: {error_from_bgm}")
            await make_local_html_resp(f"Bangumi返回错误: {error_from_bgm}", is_error=True)
            return
        
        if not code or not received_state:
            logger.error(f"OAuth回调: 参数不完整 (code: {code is not None}, state: {received_state is not None})")
            await make_local_html_resp("回调参数不完整 (缺少 code 或 state)。", is_error=True)
            return

        if not self._validate_and_clear_pending_oauth_state(received_state):
            # 日志记录在 _validate_and_clear_pending_oauth_state 内部完成
            await make_local_html_resp("State参数无效或CSRF校验失败。", is_error=True)
            return
        
        if not self._oauth_app_id or not self._oauth_app_secret:
            logger.error("OAuth回调: 插件OAuth配置不完整 (App ID 或 Secret缺失)。")
            await make_local_html_resp("插件OAuth配置不完整。", is_error=True)
            return

        moviepilot_base_url = self._get_moviepilot_base_url(request)
        if not moviepilot_base_url:
            logger.error("OAuth回调: 无法获取MoviePilot基础URL。")
            await make_local_html_resp("插件内部错误：无法确定 MoviePilot 服务器地址。", is_error=True)
            return

        # 用于令牌交换的 redirect_uri 必须与授权请求中使用的完全匹配
        callback_path = f"/api/v1/plugins/{self.plugin_config_prefix.strip('_')}/oauth_callback"
        redirect_uri_for_token_exchange = f"{moviepilot_base_url}{callback_path}"

        payload = {
            "grant_type": "authorization_code",
            "client_id": self._oauth_app_id,
            "client_secret": self._oauth_app_secret,
            "code": code,
            "redirect_uri": redirect_uri_for_token_exchange # Must match
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded", "User-Agent": self.UA}
        
        try:
            loop = asyncio.get_event_loop()
            if not self._request: # 应该已被初始化
                 logger.error("OAuth回调: self._request is None.")
                 await make_local_html_resp("插件内部请求会话错误。", is_error=True)
                 return

            response_token = await loop.run_in_executor(None, lambda: self._request.post(BANGUMI_TOKEN_URL, data=payload, headers=headers))
            response_token.raise_for_status() # Will raise HTTPError for 4xx/5xx
            token_data = response_token.json()

            access_token = token_data.get('access_token')
            refresh_token = token_data.get('refresh_token')
            expires_in = token_data.get('expires_in', 0) # 如果不存在则默认为0
            
            if not access_token:
                logger.error(f"OAuth回调: Bangumi未返回access_token。响应: {token_data}")
                await make_local_html_resp("未能从Bangumi获取Access Token。", is_error=True)
                return

            new_oauth_info = BangumiOAuthData(
                access_token=access_token,
                refresh_token=refresh_token,
                expire_time=time.time() + expires_in
            )
            
            # 使用新令牌获取用户资料
            if self._request: # 确保会话可用
                 profile_updated = await new_oauth_info.get_profile_async(self._request, self.UA)
                 if not profile_updated:
                     logger.warning("OAuth回调: 获取Bangumi用户资料失败，但仍会保存令牌信息。")

            self._store_global_oauth_info(new_oauth_info) # Store the new BangumiOAuthData object
            logger.info(f"成功通过Bangumi OAuth授权，Bangumi用户: {new_oauth_info.nickname or '未知'}")
            await make_local_html_resp(f"成功授权Bangumi账户：{new_oauth_info.nickname or '请稍后在插件页面查看状态'}")
        
        except requests.exceptions.HTTPError as http_err:
            error_msg = f"交换令牌时HTTP错误: {http_err}"
            response_text = http_err.response.text if http_err.response else "无响应体"
            try: error_msg += f". 响应: {http_err.response.json() if http_err.response else '无响应体'}" # 尝试解析JSON
            except ValueError: error_msg += f". 响应文本: {response_text}"
            logger.error(f"OAuth回调: {error_msg}")
            await make_local_html_resp(f"与Bangumi交换令牌失败: {response_text}", is_error=True)
        except Exception as e:
            logger.exception(f"OAuth回调处理中发生未知错误: {e}")
            await make_local_html_resp(f"处理回调时发生内部错误: {e}", is_error=True)

    async def _make_html_resp(self, content: str, is_error: bool = False, request_obj: Optional[Any] = None) -> Any:
        """辅助函数创建HTML响应。如果在端点外部调用，则需要 request_obj。"""
        # 此方法现在更像是一个工具函数。实际的响应发送
        # 如果返回特定的响应对象，则应由框架处理。
        # 如果 MoviePilot 期望一个字典来表示HTML，则需要进行调整。
        # 目前，假定它是从具有 `request.Response` 的端点调用的。
        
        # 如果提供了 request_obj，则尝试从中获取响应对象
        response_interface = None
        if request_obj and hasattr(request_obj, 'Response') and request_obj.Response:
            response_interface = request_obj.Response
        elif hasattr(self, 'Request') and self.Request and hasattr(self.Request, 'Response'): # Fallback to self.Request if available
             response_interface = self.Request.Response
        
        if not response_interface:
            logger.error("_make_html_resp:无法获取响应对象。")
            # 没有响应对象无法发送HTML。
            # 这可能意味着调用上下文需要以不同的方式处理HTML生成。
            return {"status": "error" if is_error else "success", "message_html": content}


        response_interface.ContentType = "text/html; charset=utf-8" # 确保 UTF-8 (修正了utf-f)
        response_interface.StatusCode = 200 # 即使是错误，也用HTML正文返回200 OK

        title = "Bangumi OAuth Error" if is_error else "Bangumi OAuth"
        html_body = f"<h1>{title}</h1><p>{content}</p>"
        if not is_error:
            html_body += "<p>操作完成！如果此窗口未自动关闭，请手动关闭。</p><script>if(window.opener && typeof window.opener.postMessage === 'function'){ try { window.opener.postMessage('BANGUMI-OAUTH-COMPLETE', '*'); } catch(e) { console.error('Error posting message to opener:', e); } } setTimeout(function() { window.close(); }, 2000);</script>"
        else:
            html_body += "<p>请关闭此窗口并检查日志或重试。</p>"
        
        full_html = f"<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>{title}</title></head><body>{html_body}</body></html>"
        
        # 发送响应的方式取决于MoviePilot的框架
        # 如果是基于FastAPI/Starlette的，你可能返回一个HTMLResponse对象
        # 目前，如果可用，则假定使用现有的OutputWriter模式
        if hasattr(response_interface, 'OutputWriter') and response_interface.OutputWriter:
            writer = response_interface.OutputWriter
            bytes_to_write = Encoding.UTF8.GetBytes(full_html)
            await writer.WriteAsync(bytes_to_write)
            if hasattr(response_interface, 'CompleteAsync'):
                await response_interface.CompleteAsync()
            return None # 表示响应已处理
        else:
            # 如果OutputWriter模式不直接可用，则回退
            # 这部分高度依赖于MoviePilot对HTML的预期返回
            logger.warning("_make_html_resp: OutputWriter not available. Returning HTML as string/dict.")
            # MoviePilot 可能不会直接将此渲染为HTML。
            return {"html_content": full_html}


    async def _handle_oauth_status(self, request: Any, user: Any , apikey: str) -> schemas.Response:
        if apikey != settings.API_TOKEN:
            return schemas.Response(success=False, message="API密钥错误")
                
        if not self._global_oauth_info:
            return {"authorized": False, "nickname": None, "avatar": None, "message": "尚未授权。"}
        
        # 检查令牌是否有效，必要时尝试刷新
        access_token = await self._get_valid_access_token() # 如果需要，此操作会尝试刷新
        
        # 重新获取 oauth_info，因为它可能已被 _get_valid_access_token 更新（例如，刷新或删除）
        current_oauth_info = self._global_oauth_info

        if not access_token or not current_oauth_info: # 令牌无效或刷新尝试后信息被删除
             return {"authorized": False, "nickname": None, "avatar": None, "message": "令牌已失效或无法刷新，请重新授权。"}
        
        return {
            "authorized": True, 
            "nickname": current_oauth_info.nickname, 
            "avatar": current_oauth_info.avatar,
            "bangumi_user_id": current_oauth_info.bangumi_user_id,
            "profile_url": current_oauth_info.profile_url,
            "effective_time_readable": datetime.datetime.fromtimestamp(current_oauth_info.effective_time).strftime('%Y-%m-%d %H:%M:%S UTC') if current_oauth_info.effective_time else "N/A",
            "expire_time_readable": datetime.datetime.fromtimestamp(current_oauth_info.expire_time).strftime('%Y-%m-%d %H:%M:%S UTC') if current_oauth_info.expire_time else "N/A"
        }

    async def _handle_oauth_deauthorize(self, request: Any, user: Any, apikey: str) -> schemas.Response:
        if apikey != settings.API_TOKEN:
            return schemas.Response(success=False, message="API密钥错误")            
        
        self._delete_global_oauth_info() # 此方法已调用 __update_config()
        logger.info(f"Bangumi OAuth授权已解除 (操作用户: {getattr(user, 'id', 'Unknown')})。")
        return {"status": "success", "message": "已成功解除授权。"}

    # _get_user_profile 现在是 BangumiOAuthData.get_profile_async 的一部分

    def get_form(self) -> Tuple[List[dict], Dict[str, Any]]:
        # ... (Form structure remains largely the same) ...
        # Ensure "auth_method" default is "access-token"
        form_structure = [
            {  # VCard for 基础设置
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
                                    { # Enable & Unique ID Match Switches
                                        "component": "VRow",
                                        "content": [
                                            {
                                                "component": "VCol", "props": {"cols": 12, "md": 6}, # Adjusted cols
                                                "content": [{"component": "VSwitch", "props": {"model": "enable", "label": "启用插件"}}],
                                            },
                                            {
                                                "component": "VCol", "props": {"cols": 12, "md": 6}, # Adjusted cols
                                                "content": [{"component": "VSwitch", "props": {"model": "uniqueid_match", "label": "优先使用TMDB剧集ID匹配"}}],
                                            },
                                        ],
                                    },
                                    { # User TextField
                                        "component": "VRow",
                                        "content": [
                                            {
                                                "component": "VCol", "props": {"cols": 12},
                                                "content": [{
                                                    "component": "VTextField",
                                                    "props": {
                                                        "model": "user", "label": "媒体服务器用户名",
                                                        "placeholder": "你的Emby/Plex用户名", "hint": "多个用英文逗号隔开",
                                                        "persistentHint": True,
                                                    },
                                                }],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {  # VCard for 认证方式和参数设置
                "component": "VCard",
                "props": {"variant": "outlined"},
                "content": [
                    { # Tabs
                        "component": "VTabs",
                        "props": {"model": "tab", "grow": True, "color": "primary"},
                        "content": [
                            {"component": "VTab", "props": {"value": "auth-method-tab"}, "content": [
                                {"component": "VIcon", "props": {"icon": "mdi-shield-key", "start": True}},
                                {"component": "span", "text": "认证方式"},
                            ]},
                            {"component": "VTab", "props": {"value": "params-tab"}, "content": [
                                {"component": "VIcon", "props": {"icon": "mdi-tune", "start": True}},
                                {"component": "span", "text": "参数设置"},
                            ]},
                        ],
                    },
                    {"component": "VDivider"},
                    { # Tab Windows
                        "component": "VWindow", "props": {"model": "tab"},
                        "content": [
                            { # Auth Method Tab
                                "component": "VWindowItem", "props": {"value": "auth-method-tab"},
                                "content": [{"component": "VCardText", "content": [
                                    {"component": "VRadioGroup", "props": {"model": "auth_method", "label": "选择Bangumi认证方式"},
                                     "content": [
                                         {"component": "VRadio", "props": {"label": "Access Token (简单快捷)", "value": "access-token"}},
                                         {"component": "VRadio", "props": {"label": "OAuth 2.0 (推荐，更安全)", "value": "oauth"}},
                                     ]}
                                ]}],
                            },
                            { # Params Tab
                                "component": "VWindowItem", "props": {"value": "params-tab"},
                                "content": [{"component": "VCardText", "content": [
                                    { # Token Input (shown if auth_method is 'access-token')
                                      # Conditional rendering should ideally be handled by MoviePilot's frontend based on model values
                                        "component": "VTextField",
                                        "props": {
                                            "model": "token", "label": "Bangumi Access Token", "type": "password",
                                            "placeholder": "填写从Bangumi获取的Access Token",
                                            "hint": "用于Access Token认证。获取方式：https://next.bgm.tv/demo/access-token", "persistentHint": True,
                                            # 如果MoviePilot支持，添加 v-if 或类似的条件显示指令
                                            # "v-if": "formModel.auth_method === 'access-token'" 
                                        },
                                    },
                                    { # OAuth App ID (shown if auth_method is 'oauth')
                                        "component": "VTextField",
                                        "props": {
                                            "model": "oauth_app_id", "label": "OAuth Application ID",
                                            "placeholder": "在此输入你的Bangumi App ID",
                                            "hint": "用于OAuth认证方式。在Bangumi开发者后台创建应用获取。", "persistentHint": True,
                                            # "v-if": "formModel.auth_method === 'oauth'"
                                        },
                                    },
                                    { # OAuth App Secret (shown if auth_method is 'oauth')
                                        "component": "VTextField",
                                        "props": {
                                            "model": "oauth_app_secret", "label": "OAuth Application Secret", "type": "password",
                                            "placeholder": "在此输入你的Bangumi App Secret",
                                            "hint": "用于OAuth认证方式。与App ID一同获取。", "persistentHint": True,
                                            # "v-if": "formModel.auth_method === 'oauth'"
                                        },
                                    },
                                    { # Informational Alert
                                        "component": "VAlert", "props": {
                                            "type": "info", "variant": "tonal", "density": "compact", "class": "mt-4",
                                            "text": "提示：\n- Access Token获取：https://next.bgm.tv/demo/access-token\n- OAuth应用创建：前往Bangumi开发者后台创建自己的应用以获取App ID和Secret。\n- Webhook设置：在媒体服务器中添加MoviePilot的Webhook地址 (通常是 http://[MoviePilot地址]:[端口]/api/v1/webhook?token=[MoviePilot的API_TOKEN])，并确保启用了播放相关事件。",
                                            "style": "white-space: pre-line;"
                                        }
                                    }
                                ]}],
                            },
                        ],
                    },
                ],
            },
        ]

        default_values = {
            "enable": True, # 默认为启用
            "uniqueid_match": False,
            "user": "",
            "auth_method": "access-token", # Default auth method
            "token": "",
            "oauth_app_id": "", 
            "oauth_app_secret": "",
            "tab": "auth-method-tab",
            "global_oauth_info": None
        }
        return form_structure, default_values

    def get_page(self) -> List[dict]:
        if self._auth_method != 'oauth':
            return [{'component': 'VAlert', 'props': {'type': 'info', 'text': '当前认证方式不是 OAuth。如需使用 OAuth 授权，请先在插件配置的“认证方式”标签页中选择 OAuth。'}}]
        
        if not self._oauth_app_id or not self._oauth_app_secret:
            return [{'component': 'VAlert', 'props': {'type': 'warning', 'text': '请先在插件配置的“参数设置”中填写 OAuth Application ID 和 Secret。'}}]
        
        # 对于 get_page，我们根据 self._global_oauth_info 显示当前状态
        # 通过API调用进行完全刷新对于同步页面加载可能太慢或太复杂
        current_oauth_data = self._global_oauth_info
        is_authorized = bool(current_oauth_data and current_oauth_data.access_token and not current_oauth_data.is_expired(buffer_seconds=0)) # Check if token exists and not immediately expired
        
        nickname = "未授权或信息待刷新"
        avatar_url = None
        user_id_str = "N/A"
        profile_link = "#"
        expire_time_str = "N/A"

        if is_authorized and current_oauth_data:
            nickname = current_oauth_data.nickname or "已授权 (昵称未知)"
            avatar_url = current_oauth_data.avatar
            user_id_str = str(current_oauth_data.bangumi_user_id) if current_oauth_data.bangumi_user_id else "N/A"
            profile_link = current_oauth_data.profile_url or "#"
            if current_oauth_data.expire_time: # 确保 expire_time 存在
                try:
                    expire_time_str = datetime.datetime.fromtimestamp(current_oauth_data.expire_time).strftime('%Y-%m-%d %H:%M:%S UTC')
                except: # Handle potential timestamp errors
                    pass


        status_display_content = [
            {'component': 'VAvatar', 'props': {'image': avatar_url, 'size': '64', 'class': 'my-2 mx-auto d-block', 'v-if': avatar_url}},
            {'component': 'div', 'props': {'class': 'text-center'}, 'content': [
                {'component': 'VChip', 'props': {'color': 'success' if is_authorized else 'warning', 'label': True, 'class': 'mb-2'},
                 'content': [
                     {'component': 'VIcon', 'props': {'start': True, 'icon': 'mdi-check-circle' if is_authorized else 'mdi-alert-circle'}},
                     {'component': 'span', 'text': nickname }
                 ]}
            ]}
        ]
        if is_authorized:
            status_display_content.append(
                {'component': 'div', 'props': {'class': 'text-caption text-center grey--text mt-1'}, 'content': [
                    {'component': 'span', 'text': f"Bangumi UID: {user_id_str} "},
                    {'component': 'a', 'props': {'href': profile_link, 'target': '_blank', 'v-if': profile_link != '#'}, 'text': '(查看主页)'},
                    {'component': 'br' },
                    {'component': 'span', 'text': f"令牌有效期至: {expire_time_str}"}
                ]}
            )
        else:
             status_display_content.append(
                 {'component': 'div', 'props': {'class': 'text-caption text-center grey--text mt-1'}, 
                  'text': '如果状态未更新，请尝试刷新此页面或点击下方“刷新授权状态”按钮。'}
             )


        oauth_card_content = [
            {'component': 'VCardTitle', 'text': 'Bangumi OAuth 授权管理'},
            {'component': 'VCardText', 'content': [
                {'component': 'div', 'props': {'id': 'bangumi-oauth-status-container', 'class': 'mb-4'}, 'content': status_display_content},
                {'component': 'VRow', 'props': {'justify': "center" , 'class':'mb-2'}, 'content':[
                    {'component': 'VCol', 'props':{'cols':'auto'}, 'content':[
                        {'component': 'VBtn', 'props': {
                            'color': 'primary', 'prepend-icon': 'mdi-link-variant',
                            'disabled': is_authorized,
                            'text': 'Bangumi 授权',
                            'events': {
                                'click': { # 此操作需要由MoviePilot前端处理
                                    'api': 'plugin/BangumiSyncV2Test/oauth_authorize', # MODIFIED
                                    'method': 'get',
                                    'action': 'oauth_redirect_and_refresh', # Custom action for frontend
                                    'params': {'apikey': settings.API_TOKEN}
                                }
                            }
                        }},
                    ]},
                    {'component': 'VCol', 'props':{'cols':'auto'}, 'content':[
                        {'component': 'VBtn', 'props': {
                            'color': 'error', 'prepend-icon': 'mdi-link-variant-off',
                            'disabled': not is_authorized,
                            'text': '解除授权',
                            'events': {
                                'click': {
                                    'api': 'plugin/BangumiSyncV2Test/oauth_deauthorize', # MODIFIED
                                    'method': 'get', 'confirm': '确定要解除 Bangumi OAuth 授权吗？',
                                    'success_message': '解除授权成功！页面即将刷新。', 'error_message': '解除授权失败。',
                                    'refresh_on_success': True, # Tell frontend to refresh page/data
                                    'params': {'apikey': settings.API_TOKEN}
                                }
                            }
                        }},
                    ]},
                    {'component': 'VCol', 'props':{'cols':'auto'}, 'content':[
                        {'component': 'VBtn', 'props': { # Button to manually refresh status display
                            'color': 'info', 'prepend-icon': 'mdi-refresh', # 手动刷新状态显示按钮
                            'text': '刷新授权状态',
                            'events': {
                                'click': {
                                    'action': 'call_api_and_refresh_component', # 这是一个假设的自定义操作
                                    'api': 'plugin/BangumiSyncV2Test/oauth_status', # 已修改
                                    'method': 'get',
                                    'params': {'apikey': settings.API_TOKEN},
                                    'target_component_id': 'bangumi-oauth-status-container', # Hypothetical
                                    'success_message': '授权状态已刷新。',
                                    'error_message': '刷新授权状态失败。'
                                }
                            }
                        }},
                    ]},
                ]},
                {'component': 'VAlert', 'props': {'type':'info', 'variant':'tonal', 'density':'compact', 'class':'mt-4', 
                                  'text':'点击“Bangumi 授权”按钮后，浏览器将尝试重定向到Bangumi的授权页面。请按照提示操作。授权完成后，此页面状态可能需要手动点击“刷新授权状态”或刷新整个页面来更新。'}}
            ]}
        ]
        return [{'component': 'VRow', 'content': [{'component': 'VCol', 'props': {'cols': 12, 'md': 8, 'offset-md': 2}, 'content': [{'component': 'VCard', 'props': {'variant': 'outlined'}, 'content': oauth_card_content}]}]}]

    def __update_config(self):
        logger.debug(f"__update_config: 当前 _auth_method='{self._auth_method}', _enable={self._enable}")
        
        config_to_save = {
            "enable": self._enable,
            "uniqueid_match": self._uniqueid_match,
            "user": self._user,
            "token": self._token,
            "auth_method": self._auth_method,
            "oauth_app_id": self._oauth_app_id,
            "oauth_app_secret": self._oauth_app_secret,
            "tab": self._tab, 
            "global_oauth_info": self._global_oauth_info.to_dict() if self._global_oauth_info else None # 将对象转换为字典进行保存
        }
        self.update_config(config_to_save)
        logger.info(f"__update_config: 插件配置已保存。Auth method: '{config_to_save['auth_method']}', OAuth Info: {'Present' if config_to_save['global_oauth_info'] else 'None'}")

    def get_state(self) -> bool:
        return self._enable

    def stop_service(self):
        # 如果使用 httpx.AsyncClient，在此处关闭它：
        # if hasattr(self, '_async_http_client') and self._async_http_client:
        #     try:
        #         asyncio.get_event_loop().run_until_complete(self._async_http_client.aclose())
        #     except Exception as e:
        #         logger.error(f"Error closing async HTTP client: {e}")
        logger.info(f"{self.plugin_name} 插件服务停止。")


# if __name__ == "__main__":
    # 此块用于本地测试，在MoviePilot内部不会运行
    # 要进行测试，你需要模拟MoviePilot的环境或运行部分逻辑。
    # print("Plugin local test execution (limited functionality).")
    
    # 如何在本地测试 BangumiOAuthData 的示例 (需要 requests 库)
    # async def local_test():
    #     session = requests.Session()
    #     # 虚拟数据，用真实数据替换以对Bangumi进行实际测试
    #     # oauth_data = BangumiOAuthData("dummy_access", "dummy_refresh", time.time() + 3600)
    #     # refreshed, msg = await oauth_data.refresh_token_async(session, "APP_ID", "APP_SECRET", "TestUA/1.0")
    #     # print(f"Refresh attempt: {refreshed}, Message: {msg}")
    #     # if refreshed:
    #     #     profile_ok = await oauth_data.get_profile_async(session, "TestUA/1.0")
    #     #     print(f"Profile fetch: {profile_ok}, Nickname: {oauth_data.nickname}")

    # if False: # 如果需要，设置为 True 以运行 local_test
    #    asyncio.run(local_test())
