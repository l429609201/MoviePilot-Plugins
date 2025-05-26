import datetime
import re
from typing import Any, Dict, List, Optional, Tuple

# BangumiSyncDebug 插件原有的 imports
from app.core.event import eventmanager, Event
from app.core.config import settings
# from app.core.metainfo import MetaInfo # MetaInfo 未在原版 BangumiSyncDebug 中使用
from app.log import logger
from app.plugins import _PluginBase
from app.schemas import WebhookEventInfo # MediaInfo 未在原版 BangumiSyncDebug 中使用
from app.schemas.types import EventType # MediaType 未在原版 BangumiSyncDebug 中使用
# from app.utils.http import RequestUtils # RequestUtils 未在原版 BangumiSyncDebug 中直接使用，而是通过 requests.Session
from cachetools import cached, TTLCache
import requests
# from app.helper.mediaserver import MediaServerHelper # 已移除

class BangumiSyncV2Test(_PluginBase):
    # 插件名称
    plugin_name = "bgm-V2-测试"
    # 插件描述
    plugin_desc = "将在看记录同步到bangumi"
    # 插件图标
    plugin_icon = "https://raw.githubusercontent.com/honue/MoviePilot-Plugins/main/icons/bangumi.jpg"
    # 插件版本
    plugin_version = "1.0.0" # 版本更新
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

    UA = "honue/MoviePilot-Plugins (https://github.com/honue/MoviePilot-Plugins)"

    _enable = True # 还原原版默认值
    _user = None
    _bgm_uid = None
    _token = None
    _tmdb_key = None
    _request = None
    _uniqueid_match = False
    # _selected_servers: List[str] = [] # 已移除
    _auth_method = "token"
    _oauth_app_id = None
    _oauth_app_secret = None
    _tab = 'auth-method-tab'

    # mediaserver_helper: Optional[MediaServerHelper] = None # 已移除

    def init_plugin(self, config: dict = None):
        # self.mediaserver_helper = MediaServerHelper() # 已移除
        if config:
            self._enable = config.get('enable') # 还原原版获取方式
            self._uniqueid_match = config.get('uniqueid_match') # 还原原版获取方式
            self._user = config.get('user') if config.get('user') else None # 还原原版处理空字符串
            self._token = config.get('token') if config.get('token') else None # 还原原版处理空字符串
            # self._selected_servers = config.get('selected_servers', []) # 已移除
            self._auth_method = config.get('auth_method', 'token')
            self._oauth_app_id = config.get('oauth_app_id')
            self._oauth_app_secret = config.get('oauth_app_secret')
            self._tab = config.get('tab', 'auth-method-tab')
            
            # 根据认证方式准备请求头 (保留V2Test的条件逻辑)
            headers = {"User-Agent": BangumiSyncV2Test.UA, "content-type": "application/json"}
            if self._auth_method == 'token' and self._token:
                headers["Authorization"] = f"Bearer {self._token}"

            self._request = requests.Session()
            self._request.headers.update(headers)
            self._tmdb_key = settings.TMDB_API_KEY # 还原原版获取位置
            if settings.PROXY:
                self._request.proxies.update(settings.PROXY)
            
            self.__update_config()
            logger.info(f"Bangumi在看同步插件 v{BangumiSyncV2Test.plugin_version} 初始化成功")
        else:
            self.__update_config()


    @eventmanager.register(EventType.WebhookMessage)
    def hook(self, event: Event):
        # 插件未启用
        if not self._enable:
            return
        
        # Token 和 OAuth 认证逻辑前置检查 (保留V2Test的逻辑)
        if self._auth_method == 'token' and not self._token:
            logger.warning(f"{self.plugin_name}: Token认证方式未配置Access Token，插件功能受限。")
            return
        elif self._auth_method == 'oauth' and (not self._oauth_app_id or not self._oauth_app_secret):
            logger.warning(f"{self.plugin_name}: OAuth认证方式未配置Application ID或Secret，插件功能受限。")
            return
        
        # 确保 self._request 在处理请求前已正确配置认证 (保留V2Test的逻辑)
        if self._auth_method == 'token' and self._token:
             self._request.headers.update({"Authorization": f"Bearer {self._token}"})
        elif self._auth_method == 'oauth':
            logger.info("OAuth 认证流程尚未完全实现于此插件的 hook 中。")

        try:
            logger.debug(f"收到webhook事件: {event.event_data}")
            event_info: WebhookEventInfo = event.event_data
            
            # 媒体服务器过滤逻辑已移除

            # 用户过滤 (采用V2Test更安全的版本)
            if not self._user:
                logger.warning(f"{self.plugin_name}: 未配置媒体服务器用户名，跳过处理。")
                return
            if event_info.user_name not in self._user.split(','):
                logger.debug(f"{self.plugin_name}: 用户名 '{event_info.user_name}' 不在配置列表 '{self._user.split(',')}' 中，跳过。")
                return

            play_start = {"playback.start", "media.play", "PlaybackStart"}
            # 还原原版播放事件和进度过滤逻辑
            if not (event_info.event in play_start or event_info.percentage and event_info.percentage > 90):
                return

            # 根据路径判断是不是番剧
            if not BangumiSyncV2Test.is_anime(event_info): # 使用当前类名
                return
            
            # 还原原版 TV 类型判断和信息提取
            if event_info.item_type in ["TV"]:
                tmdb_id = event_info.tmdb_id
                logger.info(f"匹配播放事件 {event_info.item_name} tmdb id = {tmdb_id}...") # 还原原版日志
                match = re.match(r"^(.+)\sS\d+E\d+\s.+", event_info.item_name)
                if match:
                    title = match.group(1)
                else:
                    title = event_info.item_name.split(' ')[0]

                season_id, episode_id = map(int, [event_info.season_id, event_info.episode_id]) # 还原原版获取季集
                self._prefix = f"{title} 第{season_id}季 第{episode_id}集" # 还原原版日志前缀格式

                unique_id = None # 还原原版变量名
                try: # 还原原版 unique_id 获取
                    unique_id = int(tmdb_id) 
                except Exception:
                    unique_id = None
                
                subject_id, subject_name, original_episode_name = self.get_subjectid_by_title(
                    title, season_id, episode_id, unique_id
                ) # 还原原版调用
                logger.debug(f"subject_id: {subject_id}") # 还原原版日志
                logger.debug(f"subject_name: {subject_name}") # 还原原版日志
                logger.debug(f"original_episode_name: {original_episode_name}") # 还原原版日志

                if subject_id is None:
                    return
                
                logger.info(f"{self._prefix}: {title} {original_episode_name} => {subject_name} https://bgm.tv/subject/{subject_id}") # 还原原版日志
                
                self.sync_watching_status(subject_id, episode_id, original_episode_name)

        except Exception as e:
            logger.warning(f"同步在看状态失败: {e}") # 还原原版异常日志

    @cached(TTLCache(maxsize=100, ttl=3600))
    def get_subjectid_by_title(self, title: str, season: int, episode: int, unique_id: int | None) -> Tuple: # 还原原版类型提示
        """
        获取 subject id
        :param title: 标题
        :param season: 季号
        :param episode: 集号
        :param unique_id: 集唯一 id
        """
        logger.debug(f"{self._prefix}: 尝试使用 bgm api 来获取 subject id...") # 还原原版日志
        tmdb_id, original_name, original_language = self.get_tmdb_id(title)
        original_episode_name = None
        post_json = {
            "keyword": title,
            "sort": "match",
            "filter": {"type": [2]},
        }
        if tmdb_id is not None:
            start_date, end_date, original_episode_name = self.get_airdate_and_ep_name(
                tmdb_id, season, episode, unique_id, original_language # 传递 unique_id
            )
            if start_date is not None and end_date is not None:
                post_json = {
                    "keyword": original_name,
                    "sort": "match",
                    "filter": {"type": [2], "air_date": [f">={start_date}", f"<={end_date}"]},
                }

        url = f"https://api.bgm.tv/v0/search/subjects"
        resp = self._request.post(url, json=post_json).json() # 还原原版直接解析
        if not resp.get("data"):
            logger.warning(f"{self._prefix}: 未找到{title}的bgm条目") # 还原原版日志
            return None, None, None
        data = resp.get("data")[0]
        year = data["date"][:4]
        name_cn = data["name_cn"] or data["name"]
        name_cn = f"{name_cn} ({year})"
        subject_id = data["id"]
        return subject_id, name_cn, original_episode_name

    @cached(TTLCache(maxsize=100, ttl=3600))
    def get_tmdb_id(self, title: str): # 还原原版类型提示 (隐式 Optional[Tuple[...]])
        logger.debug(f"{self._prefix}: 尝试使用 tmdb api 来获取 subject id...") # 还原原版日志
        url = f"https://api.tmdb.org/3/search/tv?query={title}&api_key={self._tmdb_key}"
        ret = self._request.get(url).json() # 还原原版直接解析
        if ret.get("total_results"):
            results = ret.get("results")
        else:
            logger.warning(f"{self._prefix}: 未找到 {title} 的 tmdb 条目") # 还原原版日志
            return None, None # 还原原版返回
        for result in results:
            if 16 in result.get("genre_ids", []): # 保留 get 的默认值以防 key 不存在
                return result.get("id"), result.get("original_name"), result.get("original_language")
        return None, None # 新增：如果循环结束没有找到动画类型，则返回 None

    @cached(TTLCache(maxsize=100, ttl=3600))
    def get_airdate_and_ep_name(self, tmdbid: int, season_id: int, episode: int, unique_id: int | None, original_language: str): # 还原原版类型提示
        """
        通过tmdb 获取 airdate 定位季
        :param tmdbid: tmdb id
        :param season: 季号
        :param episode: 集号
        :param unique_id: 集唯一 id
        :param original_language: 原始语言
        """
        def get_tv_season_detail(tmdbid_local: int, season_id_local: int) -> Optional[dict]: # 还原原版类型提示 (隐式 Optional)
            url = f"https://api.tmdb.org/3/tv/{tmdbid_local}/season/{season_id_local}?language={original_language}&api_key={self._tmdb_key}"
            resp_json = self._request.get(url).json() # 还原原版直接解析
            if resp_json and resp_json.get("episodes"):
                return resp_json

            logger.debug(f"{self._prefix}: 无法通过季号获取TMDB季度信息，尝试通过episode group获取") # 还原原版日志
            url = f"https://api.tmdb.org/3/tv/{tmdbid_local}/episode_groups?api_key={self._tmdb_key}"
            resp_groups_json = self._request.get(url).json() # 还原原版直接解析
            if resp_groups_json and resp_groups_json.get("results"):
                seasons = [
                    result for result in resp_groups_json.get("results") if result.get("name") == "Seasons"
                ]
                if seasons:
                    season_group = min(seasons, key=lambda x: x.get("episode_count", float('inf'))) # 保持健壮性
                    url = f"https://api.tmdb.org/3/tv/episode_group/{season_group.get('id')}?language={original_language}&api_key={self._tmdb_key}"
                    resp_group_detail_json = self._request.get(url).json() # 还原原版直接解析
                    if resp_group_detail_json and resp_group_detail_json.get("groups"):
                        for group in resp_group_detail_json.get("groups"):
                            if group.get("name", "").startswith(f"Season {season_id_local}"): # 保持健壮性
                                return group
            logger.debug(f"{self._prefix}: 无法通过episode group获取TMDB季度信息") # 还原原版日志
            return None

        logger.debug(f"{self._prefix}: 尝试使用 tmdb api 来获取 airdate...") # 还原原版日志
        resp_season_detail = get_tv_season_detail(tmdbid, season_id)
        if not resp_season_detail or "episodes" not in resp_season_detail:
            logger.warning(f"{self._prefix}: 无法获取TMDB季度信息") # 还原原版日志
            return None, None, None
        
        episodes_list = resp_season_detail["episodes"]
        if not episodes_list:
            logger.warning(f"{self._prefix}: 该季度没有剧集信息") # 还原原版日志
            return None, None, None

        air_date_str = resp_season_detail.get("air_date")
        matched_ep_data = None # 用于存储匹配到的剧集信息
        for ep_data in episodes_list:
            if air_date_str is None: # 原版逻辑
                air_date_str = ep_data.get("air_date")
            
            current_ep_matched = False
            if self._uniqueid_match and unique_id:
                if ep_data.get("id") == unique_id:
                    current_ep_matched = True
            elif ep_data.get("order", -99) + 1 == episode:
                current_ep_matched = True
            elif ep_data.get("episode_number") == episode:
                current_ep_matched = True
            
            if current_ep_matched:
                matched_ep_data = ep_data # 保存匹配到的剧集
                break # 找到匹配即跳出

            if ep_data.get("episode_type") in ["finale", "mid_season"]: # 原版逻辑
                air_date_str = None
        
        if not matched_ep_data : # 如果没有通过 unique_id 或集号匹配到
             logger.warning(f"{self._prefix}: 未找到匹配的TMDB剧集")
             return None, None, None

        # 从匹配到的剧集中获取播出日期和名称
        if not air_date_str: # 如果之前的 air_date_str 被重置或未找到，尝试从匹配的剧集中获取
            air_date_str = matched_ep_data.get("air_date")

        if not air_date_str:
            logger.warning(f"{self._prefix}: 未找到匹配的TMDB剧集或播出日期") # 还原原版日志
            return None, None, matched_ep_data.get("name") # 即使没日期也尝试返回名称

        original_episode_name = matched_ep_data.get("name")

        try:
            air_date_obj = datetime.datetime.strptime(air_date_str, "%Y-%m-%d").date()
        except ValueError:
            logger.warning(f"{self._prefix} TMDB提供的播出日期格式无效: {air_date_str}")
            return None, None, original_episode_name
            
        start_date = air_date_obj - datetime.timedelta(days=15)
        end_date = air_date_obj + datetime.timedelta(days=15)
        return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"), original_episode_name

    @cached(TTLCache(maxsize=10, ttl=600))
    def sync_watching_status(self, subject_id, episode, original_episode_name): # 还原原版参数名
        # 获取uid
        if not self._bgm_uid:
            resp = self._request.get(url="https://api.bgm.tv/v0/me")
            self._bgm_uid = resp.json().get("id")
            logger.debug(f"{self._prefix}: 获取到 bgm_uid {self._bgm_uid}") # 还原原版日志
        else:
            logger.debug(f"{self._prefix}: 使用 bgm_uid {self._bgm_uid}") # 还原原版日志

        # 更新合集状态
        self.update_collection_status(subject_id) # 还原原版调用

        # 获取episode id
        ep_info_list = self.get_episodes_info(subject_id) # 还原原版变量名

        found_episode_id = None
        last_episode_flag = False # 还原原版变量名
        
        # 修正原版 last_episode 判断逻辑的缺陷
        # 先找到匹配的剧集，然后再判断该剧集是否为最后一集
        matched_bangumi_ep_info = None

        if ep_info_list:
            # First try to match by original episode name
            if original_episode_name:
                for info_item in ep_info_list:
                    if info_item.get("name") == original_episode_name:
                        found_episode_id = info_item.get("id")
                        matched_bangumi_ep_info = info_item
                        break
            
            if not found_episode_id:
                # Second try to match episode number (sort)
                for info_item in ep_info_list:
                    if info_item.get("sort") == episode:
                        found_episode_id = info_item.get("id")
                        matched_bangumi_ep_info = info_item
                        break

            if not found_episode_id:
                # Fallback to checking the 'ep' field if 'sort' didn't match
                for info_item in ep_info_list:
                    if info_item.get("ep") == episode:
                        found_episode_id = info_item.get("id")
                        matched_bangumi_ep_info = info_item
                        break
            
            # 判断是否为最后一集 (基于已找到的匹配剧集)
            if matched_bangumi_ep_info and ep_info_list:
                # 过滤出正片
                main_episodes = [ep for ep in ep_info_list if ep.get("type") == 0]
                if main_episodes and matched_bangumi_ep_info.get("id") == main_episodes[-1].get("id"):
                    last_episode_flag = True


        if not found_episode_id:
            logger.warning(f"{self._prefix}: 未找到episode，可能因为TMDB和BGM的episode映射关系不一致") # 还原原版日志
            return

        # 点格子
        self.update_episode_status(found_episode_id)

        # 最后一集，更新状态为看过
        if last_episode_flag: # 使用修正后的标志
            self.update_collection_status(subject_id, 2) # 还原原版参数

    @cached(TTLCache(maxsize=100, ttl=3600))
    def update_collection_status(self, subject_id, new_type=3): # 还原原版默认参数
        resp_get = self._request.get(url=f"https://api.bgm.tv/v0/users/{self._bgm_uid}/collections/{subject_id}")
        
        current_collection_data = {}
        if resp_get.status_code == 200:
            try:
                current_collection_data = resp_get.json()
            except ValueError: # JSONDecodeError
                logger.warning(f"{self._prefix}: 解析当前收藏状态响应失败，将尝试直接更新。")
        elif resp_get.status_code == 404:
            logger.debug(f"{self._prefix}: 条目 {subject_id} 尚未收藏，将尝试创建收藏。")
        else:
            logger.warning(f"{self._prefix}: 获取当前收藏状态失败 (code: {resp_get.status_code})，将尝试直接更新。")

        type_dict = {0:"未看", 1:"想看", 2:"看过", 3:"在看", 4:"搁置", 5:"抛弃"} # 还原原版 type_dict，并补充1,4,5
        old_type = current_collection_data.get("type", 0) # 默认为0 (未看/想看)

        if old_type == 2 and new_type == 3 : # 原版逻辑：已看过，不再改为在看
            logger.info(f"{self._prefix}: 合集状态 {type_dict.get(old_type, old_type)} => {type_dict.get(new_type, new_type)}，无需更新在看状态")
            return
        if old_type == new_type: # 原版逻辑：状态相同，避免刷屏
            logger.info(f"{self._prefix}: 合集状态 {type_dict.get(old_type, old_type)} => {type_dict.get(new_type, new_type)}，无需更新在看状态")
            return
        
        post_data = {
            "type": new_type,
            "comment": "",
            "private": False,
        }
        resp_post = self._request.post(url=f"https://api.bgm.tv/v0/users/-/collections/{subject_id}", json=post_data) # 还原原版 POST
        if resp_post.status_code in [202, 204]: # 还原原版状态码检查
            logger.info(f"{self._prefix}: 合集状态 {type_dict.get(old_type,old_type)} => {type_dict.get(new_type,new_type)}，在看状态更新成功") # 还原原版日志
        else:
            logger.warning(resp_post.text) # 还原原版日志
            logger.warning(f"{self._prefix}: 合集状态 {type_dict.get(old_type,old_type)} => {type_dict.get(new_type,new_type)}，在看状态更新失败") # 还原原版日志

    @cached(TTLCache(maxsize=100, ttl=3600))
    def get_episodes_info(self, subject_id): # 还原原版类型提示 (隐式 Optional[List[Dict]])
        resp = self._request.get("https://api.bgm.tv/v0/episodes", params={"subject_id": subject_id})
        if resp.status_code == 200:
            logger.debug(f"{self._prefix}: 获取 episode info 成功") # 还原原版日志
        else:
            logger.warning(f"{self._prefix}: 获取 episode info 失败, code={resp.status_code}") # 还原原版日志
        # 还原原版直接解析，如果失败会抛异常由上层捕获
        ep_info = resp.json().get("data") # 保留 .get("data") 以防 "data" key 不存在
        return ep_info if ep_info is not None else [] # 如果 data 是 null，返回空列表

    @cached(TTLCache(maxsize=100, ttl=3600))
    def update_episode_status(self, episode_id): # 还原原版参数名
        url = f"https://api.bgm.tv/v0/users/-/collections/-/episodes/{episode_id}"
        resp_get = self._request.get(url)
        if resp_get.status_code == 200:
            try:
                resp_get_json = resp_get.json()
                if resp_get_json.get("type") == 2: # 还原原版检查
                    logger.info(f"{self._prefix}: 单集已经点过格子了") # 还原原版日志
                    return
            except ValueError: # JSONDecodeError
                 logger.warning(f"{self._prefix}: 解析单集信息响应失败，将尝试直接更新。")
        elif resp_get.status_code == 404:
            logger.debug(f"{self._prefix}: 单集 {episode_id} 尚未标记，将尝试更新。")
        else:
            logger.warning(f"{self._prefix}: 获取单集信息失败, code={resp_get.status_code}") # 还原原版日志
            return # 还原原版 return
        
        resp_put = self._request.put(url, json={"type": 2}) # 还原原版 PUT
        if resp_put.status_code == 204: # 还原原版状态码检查
            logger.info(f"{self._prefix}: 单集点格子成功") # 还原原版日志
        else:
            logger.warning(f"{self._prefix}: 单集点格子失败, code={resp_put.status_code}") # 还原原版日志

    @staticmethod
    def is_anime(event_info: WebhookEventInfo) -> bool:
        """
        通过路径关键词来确定是不是anime媒体库
        """
        path_keyword = "日番,cartoon,动漫,动画,ani,anime,新番,番剧,特摄,bangumi,ova,映画,国漫,日漫" # 还原原版关键词字符串
        path_to_check = "" # 还原原版变量名 path
        if event_info.channel in ["emby", "jellyfin"]:
            path_to_check = event_info.item_path or "" # 保留V2Test的健壮性 (or "")
            if not path_to_check and event_info.library_name:
                path_to_check = event_info.library_name
        elif event_info.channel == "plex":
            # 还原原版 Plex 路径获取
            path_to_check = event_info.json_object.get("Metadata", {}).get("librarySectionTitle", "") if event_info.json_object else ""


        path_to_check_lower = path_to_check.lower()  # 还原原版转小写
        for keyword in path_keyword.split(','):
            if path_to_check_lower.count(keyword): # 还原原版 count()
                return True
        logger.debug(f"{path_to_check} 不是动漫媒体库") # 还原原版日志
        return False

    @staticmethod
    def format_title(title: str, season: int): # 还原原版
        if season < 2:
            return title
        else:
            # 还原原版字典和逻辑
            season_zh = {0: "零", 1: "一", 2: "二", 3: "三", 4: "四", 5: "五", 6: "六", 7: "七", 8: "八",
                         9: "九"}.get(season) 
            if season_zh: # 原版没有这个判断，但加上更安全
                return f"{title} 第{season_zh}季"
            return f"{title} S{season}" # 如果 season_zh 为 None (例如 season > 9)

    @staticmethod
    def get_command() -> List[Dict[str, Any]]:
        return [] # 返回空列表比 pass 更符合接口定义

    def get_api(self) -> List[Dict[str, Any]]:
        return [] # 返回空列表比 pass 更符合接口定义

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
                                            },
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
                                                            "model": "token",
                                                            "label": "Bangumi Access-token",
                                                            "placeholder": "dY123qxXcdaf234Gj6u3va123Ohh",
                                                            "type": "password",
                                                            "hint": "用于Token认证方式。",
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
                                                            "label": "OAuth 2.0 (暂未完全支持)",
                                                            "value": "oauth",
                                                            "disabled": True
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
                                            {
                                                "component": "VRow",
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
                                                                    "placeholder": "dY123qxXcdaf234Gj6u3va123Ohh",
                                                                    "type": "password",
                                                                    "hint": "用于Token认证方式。获取：https://next.bgm.tv/demo/access-token",
                                                                    "persistentHint": True,
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                "component": "VRow",
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
                                                                    "hint": "用于OAuth认证方式 (暂不可用)",
                                                                    "persistentHint": True,
                                                                    "disabled": True,
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        "component": "VRow",
                                                        "content": [
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
                                                                            "hint": "用于OAuth认证方式 (暂不可用)",
                                                                            "persistentHint": True,
                                                                            "disabled": True,
                                                                        }
                                                                    }
                                                                ]
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
            "auth_method": "token",
            "token": "",
            "oauth_app_id": "",
            "oauth_app_secret": "",
            "tab": "auth-method-tab"  # 默认还是显示认证方式选择
        }

        return form_structure, default_values

    def get_page(self) -> List[dict]:
        return []

    def __update_config(self):
        self.update_config({
            "enable": self._enable,
            "uniqueid_match": self._uniqueid_match,
            "user": self._user,
            "token": self._token,
            "auth_method": self._auth_method,
            "oauth_app_id": self._oauth_app_id,
            "oauth_app_secret": self._oauth_app_secret,
            "tab": self._tab
        })

    def get_state(self) -> bool:
        return self._enable

    def stop_service(self):
        pass


if __name__ == "__main__":
    pass
