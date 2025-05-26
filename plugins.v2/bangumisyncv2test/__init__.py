import base64 # 按要求导入
import datetime
import hashlib # 辅助，如果需要生成唯一ID或校验
import os # 辅助
import re
import threading # 辅助
import time # 辅助
import shutil # 辅助
import random # 辅助
from pathlib import Path # 辅助
from urllib.parse import urlparse # 辅助
from typing import Any, Dict, List, Optional, Tuple
from collections import defaultdict # 辅助

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
# from app.helper.mediaserver import MediaServerHelper # 用于获取媒体服务器列表，如果需要动态加载

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

    _enable = True
    _user = None
    _bgm_uid = None
    _token = None
    _tmdb_key = None
    _request = None
    _uniqueid_match = False
    _selected_server = None # 新增：选择的媒体服务器
    _auth_method = "token"  # 新增：认证方式，默认为token
    _oauth_app_id = None    # 新增：OAuth App ID
    _oauth_app_secret = None # 新增：OAuth App Secret
    _tab = 'auth-method-tab' # 新增：用于控制tabs的显示

    # 如果需要动态获取媒体服务器列表，可以实例化 MediaServerHelper
    # mediaserver_helper = None

    def init_plugin(self, config: dict = None):
        # self.mediaserver_helper = MediaServerHelper() # 如果需要动态获取服务器
        if config:
            self._enable = config.get('enable', True)
            self._uniqueid_match = config.get('uniqueid_match', False)
            self._user = config.get('user')
            self._token = config.get('token')
            self._selected_server = config.get('selected_server')
            self._auth_method = config.get('auth_method', 'token')
            self._oauth_app_id = config.get('oauth_app_id')
            self._oauth_app_secret = config.get('oauth_app_secret')
            self._tab = config.get('tab', 'auth-method-tab')

            self._tmdb_key = settings.TMDB_API_KEY
            
            # 根据认证方式准备请求头
            headers = {"User-Agent": BangumiSyncV2Test.UA, "content-type": "application/json"}
            if self._auth_method == 'token' and self._token:
                headers["Authorization"] = f"Bearer {self._token}"
            # elif self._auth_method == 'oauth':
                # OAuth 可能需要不同的认证流程，这里暂时只处理Token认证的请求头
                # OAuth token 获取和刷新逻辑会更复杂，通常不在初始化时直接设置请求头

            self._request = requests.Session()
            self._request.headers.update(headers)
            if settings.PROXY:
                self._request.proxies.update(settings.PROXY)
            
            self.__update_config() # 保存一次配置，确保新增字段也被保存
            logger.info(f"Bangumi在看同步插件 v{BangumiSyncV2Test.plugin_version} 初始化成功")
        else:
            # 首次加载或无配置时，确保默认值被应用和保存
            self.__update_config()


    @eventmanager.register(EventType.WebhookMessage)
    def hook(self, event: Event):
        # 插件未启用
        if not self._enable:
            return
        # Token 和 OAuth 认证逻辑前置检查
        if self._auth_method == 'token' and not self._token:
            logger.warning(f"{self.plugin_name}: Token认证方式未配置Access Token，插件功能受限。")
            return
        elif self._auth_method == 'oauth' and (not self._oauth_app_id or not self._oauth_app_secret):
            logger.warning(f"{self.plugin_name}: OAuth认证方式未配置Application ID或Secret，插件功能受限。")
            # 此处可能需要实际的OAuth获取token逻辑
            return
        
        # 确保 self._request 在处理请求前已正确配置认证
        # 对于OAuth，可能需要在每次API调用前检查token有效性并刷新
        if self._auth_method == 'token' and self._token:
             self._request.headers.update({"Authorization": f"Bearer {self._token}"})
        elif self._auth_method == 'oauth':
            # 这里需要实现获取和设置OAuth token的逻辑
            # oauth_token = self.get_oauth_token() # 假设有这么一个方法
            # if oauth_token:
            #     self._request.headers.update({"Authorization": f"Bearer {oauth_token}"})
            # else:
            #     logger.error("OAuth token 获取失败，无法进行同步")
            #     return
            logger.info("OAuth 认证流程尚未完全实现于此插件的 hook 中。")


        try:
            logger.debug(f"收到webhook事件: {event.event_data}")
            event_info: WebhookEventInfo = event.event_data
            
            # 用户过滤
            if not self._user:
                logger.warning(f"{self.plugin_name}: 未配置媒体服务器用户名，跳过处理。")
                return
            if event_info.user_name not in self._user.split(','):
                return

            play_start = {"playback.start", "media.play", "PlaybackStart"}
            # 不是播放事件, 或观看进度不足90% 不处理
            # 注意：原逻辑是播放开始或进度>90%。如果只在播放开始时触发，进度判断可能多余。
            # 如果也想在播放结束（进度>90%）时触发，需要确认Webhook事件类型是否包含播放结束。
            # 此处保持原逻辑：播放开始事件 OR （任意事件但进度>90%）
            is_play_start_event = event_info.event in play_start
            is_high_progress = event_info.percentage is not None and event_info.percentage > 90
            
            if not (is_play_start_event or is_high_progress):
                return

            # 根据路径判断是不是番剧
            if not BangumiSyncV2Test.is_anime(event_info):
                return

            if event_info.item_type in ["TV", "Episode"]: # 增加了 Episode 类型
                tmdb_id = event_info.tmdb_id
                logger.info(f"匹配播放事件 {event_info.item_name} (TMDB ID: {tmdb_id})...")
                
                title_match = re.match(r"^(.+?)\sS\d+E\d+\s.*", event_info.item_name)
                if title_match:
                    title = title_match.group(1).strip()
                elif event_info.series_name: # 尝试从 series_name 获取主标题
                    title = event_info.series_name.strip()
                else: # 最后回退到原始分割方式
                    title = event_info.item_name.split(' ')[0].strip()

                if not event_info.season_id or not event_info.episode_id:
                    logger.warning(f"事件信息缺少季号或集号: {event_info.item_name}")
                    return
                    
                season_id, episode_id = int(event_info.season_id), int(event_info.episode_id)
                self._prefix = f"[{title} S{season_id:02d}E{episode_id:02d}]" # 统一日志前缀格式

                unique_id_to_pass = None
                if self._uniqueid_match and event_info.tmdb_id: # 确保 uniqueid_match 开启且 tmdb_id 存在
                    try:
                        unique_id_to_pass = int(event_info.tmdb_id)
                    except (ValueError, TypeError):
                        logger.debug(f"{self._prefix} 提供的 TMDB ID '{event_info.tmdb_id}' 不是有效的整数，无法用于 unique_id 匹配。")
                
                subject_id, subject_name, original_episode_name = self.get_subjectid_by_title(
                    title, season_id, episode_id, unique_id_to_pass
                )

                if subject_id is None:
                    logger.info(f"{self._prefix} 未能从Bangumi找到对应的条目ID。")
                    return
                
                logger.info(f"{self._prefix} 匹配成功: 本地 '{title}' (原始单集名: {original_episode_name or 'N/A'}) => Bangumi '{subject_name}' (ID: {subject_id}, https://bgm.tv/subject/{subject_id})")

                self.sync_watching_status(subject_id, episode_id, original_episode_name)

        except Exception as e:
            logger.exception(f"{self.plugin_name}: 同步在看状态失败: {e}") # 使用 logger.exception 记录堆栈信息

    @cached(TTLCache(maxsize=100, ttl=3600))
    def get_subjectid_by_title(self, title: str, season: int, episode: int, unique_id: Optional[int]) -> Tuple[Optional[int], Optional[str], Optional[str]]:
        """
        获取 subject id
        :param title: 标题
        :param season: 季号
        :param episode: 集号
        :param unique_id: TMDB集唯一 id (如果 uniqueid_match 启用)
        """
        # self._prefix 应该在调用此方法前已设置好，或者在此方法内部基于参数设置
        current_prefix = getattr(self, '_prefix', f"[{title} S{season:02d}E{episode:02d}]")
        logger.debug(f"{current_prefix} 尝试使用 Bangumi API 获取 subject id...")

        tmdb_info = self.get_tmdb_id(title)
        tmdb_id, original_name, original_language = None, None, None
        if tmdb_info:
            tmdb_id, original_name, original_language = tmdb_info
        
        original_episode_name = None
        post_json = {
            "keyword": title, # 默认使用本地刮削的标题搜索
            "sort": "match",
            "filter": {"type": [2]}, # 2 代表动画
        }

        if tmdb_id and original_name: # 仅当成功获取到TMDB ID和原始名称时，才尝试使用TMDB信息精确搜索
            airdate_info = self.get_airdate_and_ep_name(
                tmdb_id, season, episode, unique_id if self._uniqueid_match else None, original_language
            )
            if airdate_info:
                start_date, end_date, tmdb_original_episode_name = airdate_info
                original_episode_name = tmdb_original_episode_name # 获取TMDB的原始单集名
                if start_date and end_date:
                    post_json = {
                        "keyword": original_name, # 使用TMDB的原始剧集名进行搜索
                        "sort": "match",
                        "filter": {"type": [2], "air_date": [f">={start_date}", f"<={end_date}"]},
                    }
                    logger.debug(f"{current_prefix} 使用TMDB信息进行搜索: keyword='{original_name}', air_date='{start_date}~{end_date}'")
                else:
                    logger.debug(f"{current_prefix} 未能获取有效的播出日期范围，回退到标题搜索。")
            else: #即使get_airdate_and_ep_name返回None,None,None，也尝试用original_name搜索
                 post_json["keyword"] = original_name
                 logger.debug(f"{current_prefix} 未能获取播出日期，但获取到TMDB原始名称，使用 '{original_name}' 进行搜索。")


        url = "https://api.bgm.tv/v0/search/subjects"
        try:
            resp = self._request.post(url, json=post_json)
            resp.raise_for_status() # 检查HTTP错误
            resp_json = resp.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"{current_prefix} 请求Bangumi搜索API失败: {e}")
            return None, None, None
        except ValueError as e: # JSONDecodeError
            logger.error(f"{current_prefix} 解析Bangumi搜索API响应失败: {e}")
            return None, None, None

        if not resp_json.get("data"):
            logger.warning(f"{current_prefix} Bangumi API 未找到关于 '{post_json['keyword']}' 的条目。")
            return None, None, None
        
        data = resp_json["data"][0] # 取最匹配的结果
        year = data.get("date", "----")[:4] # 安全获取年份
        name_cn = data.get("name_cn") or data.get("name", "未知标题")
        formatted_name = f"{name_cn} ({year})"
        subject_id = data.get("id")

        if not subject_id:
            logger.warning(f"{current_prefix} 找到的Bangumi条目缺少ID: {data}")
            return None, None, None
            
        return subject_id, formatted_name, original_episode_name

    @cached(TTLCache(maxsize=100, ttl=3600))
    def get_tmdb_id(self, title: str) -> Optional[Tuple[int, str, str]]:
        current_prefix = getattr(self, '_prefix', f"[{title}]")
        if not self._tmdb_key:
            logger.warning(f"{current_prefix} TMDB API Key未配置，无法获取TMDB ID。")
            return None
        logger.debug(f"{current_prefix} 尝试使用 TMDB API 获取 '{title}' 的信息...")
        url = f"https://api.tmdb.org/3/search/tv"
        params = {"query": title, "api_key": self._tmdb_key, "language": "zh-CN,en-US,ja-JP,null"} # 增加语言偏好

        try:
            resp = self._request.get(url, params=params)
            resp.raise_for_status()
            ret = resp.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"{current_prefix} 请求TMDB搜索API失败: {e}")
            return None
        except ValueError as e:
            logger.error(f"{current_prefix} 解析TMDB搜索API响应失败: {e}")
            return None

        if not ret.get("results"): # total_results 可能不准确，直接看 results
            logger.warning(f"{current_prefix} TMDB API 未找到关于 '{title}' 的条目。")
            return None
        
        # 筛选动画类型 (genre_id 16)
        for result in ret["results"]:
            if 16 in result.get("genre_ids", []):
                tmdb_id = result.get("id")
                original_name = result.get("original_name")
                original_language = result.get("original_language")
                if tmdb_id and original_name and original_language:
                    logger.debug(f"{current_prefix} TMDB找到匹配: ID={tmdb_id}, OriginalName='{original_name}', Lang='{original_language}'")
                    return tmdb_id, original_name, original_language
        
        logger.warning(f"{current_prefix} TMDB API 找到结果，但没有动画类型 (genre_id 16) 的匹配项 for '{title}'.")
        return None

    @cached(TTLCache(maxsize=100, ttl=3600))
    def get_airdate_and_ep_name(self, tmdbid: int, season_id: int, episode_num: int, unique_id: Optional[int], original_language: str) -> Optional[Tuple[str, str, str]]:
        current_prefix = getattr(self, '_prefix', f"[TMDB ID:{tmdbid} S{season_id:02d}E{episode_num:02d}]")
        if not self._tmdb_key:
            logger.warning(f"{current_prefix} TMDB API Key未配置，无法获取播出日期。")
            return None

        logger.debug(f"{current_prefix} 尝试使用 TMDB API 获取播出日期和原始单集名...")

        def get_tv_season_detail_from_tmdb(current_tmdbid: int, current_season_id: int, lang: str) -> Optional[dict]:
            api_url = f"https://api.tmdb.org/3/tv/{current_tmdbid}/season/{current_season_id}?api_key={self._tmdb_key}&language={lang}"
            try:
                resp = self._request.get(api_url)
                resp.raise_for_status()
                season_data = resp.json()
                if season_data and season_data.get("episodes"):
                    return season_data
            except requests.exceptions.RequestException as e:
                logger.debug(f"{current_prefix} 请求TMDB季度详情失败 (season {current_season_id}): {e}")
            except ValueError as e:
                logger.debug(f"{current_prefix} 解析TMDB季度详情响应失败 (season {current_season_id}): {e}")
            return None

        def get_tv_episode_group_detail_from_tmdb(current_tmdbid: int, target_season_id: int, lang: str) -> Optional[dict]:
            groups_url = f"https://api.tmdb.org/3/tv/{current_tmdbid}/episode_groups?api_key={self._tmdb_key}"
            try:
                resp = self._request.get(groups_url)
                resp.raise_for_status()
                groups_data = resp.json()
                if groups_data and groups_data.get("results"):
                    seasons_groups = [g for g in groups_data["results"] if g.get("name") == "Seasons" and g.get("type") == 2] # type 2 is for standard seasons
                    if not seasons_groups:
                         seasons_groups = [g for g in groups_data["results"] if g.get("type") == 2] # fallback if no "Seasons" named group

                    if seasons_groups:
                        # 优先选择剧集数最少的 "Seasons" group，以避免包含SP等的 group
                        # 但也要确保这个group里有我们正在找的季
                        # 有些剧集，比如 "我独自升级"，其 "Seasons" group 的 episode_count 可能不直接对应实际季的集数
                        # 因此，更可靠的是遍历所有 type=2 的 group，查找其内部 groups 是否有匹配 target_season_id 的
                        for season_group_summary in sorted(seasons_groups, key=lambda x: x.get("episode_count", float('inf'))):
                            group_detail_url = f"https://api.tmdb.org/3/tv/episode_group/{season_group_summary['id']}?api_key={self._tmdb_key}&language={lang}"
                            group_detail_resp = self._request.get(group_detail_url)
                            group_detail_resp.raise_for_status()
                            group_detail_data = group_detail_resp.json()
                            if group_detail_data and group_detail_data.get("groups"):
                                for specific_season_group in group_detail_data["groups"]:
                                    # 匹配 "Season X" 或 "第X季" 等模式
                                    if re.search(rf"(Season\s*{target_season_id}\b|第\s*{target_season_id}\s*季)", specific_season_group.get("name", ""), re.IGNORECASE):
                                        # 找到了匹配的季度group，返回其详细信息（包含episodes）
                                        # TMDB episode group的 "group" 对象本身就包含了 episodes 列表
                                        if specific_season_group.get("episodes"):
                                            return specific_season_group 
                                        else: # 如果group本身没有episodes，尝试用group的id再获取一次
                                            refined_group_url = f"https://api.tmdb.org/3/tv/episode_group/{specific_season_group['id']}?api_key={self._tmdb_key}&language={lang}"
                                            refined_resp = self._request.get(refined_group_url)
                                            refined_resp.raise_for_status()
                                            refined_data = refined_resp.json()
                                            if refined_data and refined_data.get("episodes"): # 有时group的episodes在更深一层
                                                return refined_data
                                            elif refined_data.get("groups") and refined_data["groups"][0].get("episodes"): # 再深一层
                                                return refined_data["groups"][0]


            except requests.exceptions.RequestException as e:
                logger.debug(f"{current_prefix} 请求TMDB episode groups失败: {e}")
            except ValueError as e:
                logger.debug(f"{current_prefix} 解析TMDB episode groups响应失败: {e}")
            return None

        # 尝试直接获取季度详情
        season_details = get_tv_season_detail_from_tmdb(tmdbid, season_id, original_language)

        # 如果直接获取失败，尝试通过episode group获取
        if not season_details:
            logger.debug(f"{current_prefix} 无法通过季号直接获取TMDB季度信息，尝试通过episode group获取...")
            season_details = get_tv_episode_group_detail_from_tmdb(tmdbid, season_id, original_language)

        if not season_details or "episodes" not in season_details:
            logger.warning(f"{current_prefix} 无法获取TMDB季度信息或该季度无剧集。")
            return None, None, None # 返回三个None以匹配期望的元组结构
        
        tmdb_episodes = season_details["episodes"]
        if not tmdb_episodes:
            logger.warning(f"{current_prefix} 该季度在TMDB上没有剧集信息。")
            return None, None, None

        matched_episode_data = None
        # 优先使用 unique_id 匹配 (如果启用且提供了)
        if self._uniqueid_match and unique_id is not None:
            for ep_data in tmdb_episodes:
                if ep_data.get("id") == unique_id:
                    matched_episode_data = ep_data
                    logger.debug(f"{current_prefix} 通过 unique_id ({unique_id}) 匹配到TMDB剧集。")
                    break
        
        # 如果 unique_id 未匹配或未启用，则按集号匹配
        if not matched_episode_data:
            for ep_data in tmdb_episodes:
                # TMDB的 order 可能是从0开始的，episode_number 通常是从1开始
                if ep_data.get("episode_number") == episode_num:
                    matched_episode_data = ep_data
                    logger.debug(f"{current_prefix} 通过 episode_number ({episode_num}) 匹配到TMDB剧集。")
                    break
                # 有些情况下可能需要用 order 字段，但要注意其起始值
                # elif ep_data.get("order", -99) + 1 == episode_num: # 假设 order 从0开始
                #    matched_episode_data = ep_data
                #    logger.debug(f"{current_prefix} 通过 order ({ep_data.get('order')}) 匹配到TMDB剧集。")
                #    break
        
        if not matched_episode_data:
            logger.warning(f"{current_prefix} 未在TMDB上找到与集号 {episode_num} (或unique_id {unique_id if self._uniqueid_match else 'N/A'}) 匹配的剧集。")
            return None, None, None

        air_date_str = matched_episode_data.get("air_date")
        original_ep_name = matched_episode_data.get("name") # 获取TMDB上的原始单集名称

        if not air_date_str:
            # 如果单集没有air_date，尝试使用季度的air_date
            air_date_str = season_details.get("air_date")
            if air_date_str:
                logger.debug(f"{current_prefix} 单集无播出日期，使用季度播出日期: {air_date_str}")
            else:
                logger.warning(f"{current_prefix} 无法确定匹配剧集的播出日期。")
                return None, None, original_ep_name # 即使没有日期，也返回剧集名

        try:
            air_date_obj = datetime.datetime.strptime(air_date_str, "%Y-%m-%d").date()
        except ValueError:
            logger.warning(f"{current_prefix} TMDB提供的播出日期格式无效: {air_date_str}")
            return None, None, original_ep_name

        # 扩大日期范围以应对时差和数据不精确问题
        start_date = air_date_obj - datetime.timedelta(days=15)
        end_date = air_date_obj + datetime.timedelta(days=15)
        
        logger.debug(f"{current_prefix} 获取到播出日期范围: {start_date.strftime('%Y-%m-%d')} - {end_date.strftime('%Y-%m-%d')}, 原始单集名: '{original_ep_name}'")
        return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"), original_ep_name

    @cached(TTLCache(maxsize=10, ttl=600)) # 缓存同步状态的调用，避免短时重复同步
    def sync_watching_status(self, subject_id: int, episode_num: int, original_episode_name: Optional[str]):
        current_prefix = getattr(self, '_prefix', f"[BGM Subject:{subject_id} E{episode_num:02d}]")

        # 0. 获取 Bangumi UID (如果尚未获取)
        if not self._bgm_uid:
            try:
                resp = self._request.get(url="https://api.bgm.tv/v0/me")
                resp.raise_for_status()
                self._bgm_uid = resp.json().get("id")
                if not self._bgm_uid:
                    logger.error(f"{current_prefix} 获取Bangumi UID失败，无法同步。")
                    return
                logger.debug(f"{current_prefix} 获取到 Bangumi UID: {self._bgm_uid}")
            except requests.exceptions.RequestException as e:
                logger.error(f"{current_prefix} 请求Bangumi /me API失败: {e}")
                return
            except ValueError as e:
                logger.error(f"{current_prefix} 解析Bangumi /me API响应失败: {e}")
                return
        else:
            logger.debug(f"{current_prefix} 使用已缓存的Bangumi UID: {self._bgm_uid}")

        # 1. 更新合集状态为 "在看" (type=3)
        #    如果已经是 "看过" (type=2)，则不应降级为 "在看"
        #    如果已经是 "在看"，则无需重复更新
        self.update_collection_status(subject_id, new_status_type=3) # 3 for 'watching'

        # 2. 获取该 subject_id 的所有剧集信息
        episodes_info = self.get_episodes_info(subject_id)
        if not episodes_info:
            logger.warning(f"{current_prefix} 未能获取到Bangumi剧集列表，无法标记单集。")
            return

        # 3. 查找与当前观看集数匹配的 Bangumi 剧集ID
        found_bangumi_episode_id = None
        matched_episode_info = None

        # 优先尝试通过 TMDB 获取的原始单集名称进行匹配
        if original_episode_name:
            for ep_info in episodes_info:
                # Bangumi的name字段可能包含日文、中文等，做模糊一点的比较或清洗
                bgm_ep_name = ep_info.get("name", "").strip()
                # 可以考虑更复杂的匹配，如去除特殊字符、大小写不敏感等
                if bgm_ep_name.lower() == original_episode_name.lower():
                    found_bangumi_episode_id = ep_info.get("id")
                    matched_episode_info = ep_info
                    logger.debug(f"{current_prefix} 通过原始单集名 '{original_episode_name}' 匹配到Bangumi剧集ID: {found_bangumi_episode_id}")
                    break
        
        # 如果名称未匹配到，再尝试通过集号 (sort 或 ep 字段) 匹配
        if not found_bangumi_episode_id:
            for ep_info in episodes_info:
                # Bangumi的 'sort' 字段通常是规范的集数
                if ep_info.get("type") == 0 and ep_info.get("sort") == episode_num : # type 0 是正片
                    found_bangumi_episode_id = ep_info.get("id")
                    matched_episode_info = ep_info
                    logger.debug(f"{current_prefix} 通过集号 'sort={episode_num}' 匹配到Bangumi剧集ID: {found_bangumi_episode_id}")
                    break
            
            if not found_bangumi_episode_id: # 如果 sort 没匹配上，尝试 ep 字段
                 for ep_info in episodes_info:
                    if ep_info.get("type") == 0 and ep_info.get("ep") == episode_num:
                        found_bangumi_episode_id = ep_info.get("id")
                        matched_episode_info = ep_info
                        logger.debug(f"{current_prefix} 通过集号 'ep={episode_num}' 匹配到Bangumi剧集ID: {found_bangumi_episode_id}")
                        break


        if not found_bangumi_episode_id:
            logger.warning(f"{current_prefix} 未能在Bangumi剧集列表中找到与本地集号 {episode_num} (或原始单集名 '{original_episode_name or 'N/A'}') 对应的剧集。")
            return

        # 4. 点格子 (更新单集观看状态为 "看过")
        self.update_episode_status(found_bangumi_episode_id)

        # 5. 判断是否为最后一集，如果是，则将合集状态更新为 "看过" (type=2)
        #    需要过滤掉SP、OVA等非正片集数来判断最后一集
        main_episodes = [ep for ep in episodes_info if ep.get("type") == 0] # type 0 代表正片
        if main_episodes and matched_episode_info and matched_episode_info.get("id") == main_episodes[-1].get("id"):
            logger.info(f"{current_prefix} 检测到当前为最后一集正片，将更新合集状态为 '看过'。")
            self.update_collection_status(subject_id, new_status_type=2) # 2 for 'watched'

    @cached(TTLCache(maxsize=100, ttl=3600))
    def update_collection_status(self, subject_id: int, new_status_type: int = 3):
        current_prefix = getattr(self, '_prefix', f"[BGM Subject:{subject_id}]")
        if not self._bgm_uid: # 确保UID已获取
            logger.error(f"{current_prefix} Bangumi UID 未知，无法更新合集状态。")
            return

        collection_url = f"https://api.bgm.tv/v0/users/{self._bgm_uid}/collections/{subject_id}"
        status_type_map = {0: "想看", 1: "想看", 2: "看过", 3: "在看", 4: "搁置", 5: "抛弃"} # Bangumi API v0 定义

        try:
            resp = self._request.get(url=collection_url)
            # Bangumi 对于未收藏条目可能返回404，这不一定是错误
            current_collection_status = 0 # 默认为未收藏/想看 (type 1 in API, but 0 is safer for logic)
            if resp.status_code == 200:
                current_collection_status = resp.json().get("type", 0)
            elif resp.status_code == 404:
                logger.debug(f"{current_prefix} 条目 {subject_id} 尚未收藏。")
            else:
                resp.raise_for_status() # 其他错误则抛出

            old_status_text = status_type_map.get(current_collection_status, "未知状态")
            new_status_text = status_type_map.get(new_status_type, "未知状态")

            # 避免不必要的更新或状态降级
            if current_collection_status == 2 and new_status_type == 3: # 已看过，不再改为在看
                logger.info(f"{current_prefix} 合集状态已为 '{old_status_text}'，无需更新为 '{new_status_text}'。")
                return
            if current_collection_status == new_status_type:
                logger.info(f"{current_prefix} 合集状态已为 '{old_status_text}'，无需重复更新。")
                return

            update_url = f"https://api.bgm.tv/v0/users/-/collections/{subject_id}"
            payload = {"type": new_status_type}
            
            # Bangumi API v0 推荐使用 PUT 更新，而不是 POST
            # POST 用于创建新的收藏记录，PUT 用于修改现有记录或创建（如果不存在）
            # 对于状态更新，PUT 更符合语义
            update_resp = self._request.put(url=update_url, json=payload)
            update_resp.raise_for_status() # 检查2xx以外的响应

            # 成功的状态码可能是 200 (更新), 201 (创建), 202 (接受但未处理), 204 (无内容但成功)
            if 200 <= update_resp.status_code < 300:
                 logger.info(f"{current_prefix} 合集状态从 '{old_status_text}' 更新为 '{new_status_text}' 成功。")
            else: # raise_for_status 会处理非2xx，这里理论上不会执行
                 logger.warning(f"{current_prefix} 合集状态更新响应: {update_resp.status_code}, {update_resp.text}")
                 logger.warning(f"{current_prefix} 合集状态从 '{old_status_text}' 更新为 '{new_status_text}' 可能失败。")

        except requests.exceptions.RequestException as e:
            logger.error(f"{current_prefix} 更新Bangumi合集状态失败: {e}")
        except ValueError as e: # JSONDecodeError
            logger.error(f"{current_prefix} 解析Bangumi合集状态响应失败: {e}")

    @cached(TTLCache(maxsize=100, ttl=3600))
    def get_episodes_info(self, subject_id: int) -> Optional[List[Dict]]:
        current_prefix = getattr(self, '_prefix', f"[BGM Subject:{subject_id}]")
        url = "https://api.bgm.tv/v0/episodes"
        params = {"subject_id": subject_id}
        try:
            resp = self._request.get(url, params=params)
            resp.raise_for_status()
            data = resp.json().get("data")
            if data is None: # API可能返回 {"data": null}
                logger.warning(f"{current_prefix} Bangumi API 返回的剧集列表数据为空 (data is null)。")
                return [] # 返回空列表而不是None，方便后续迭代
            logger.debug(f"{current_prefix} 获取Bangumi剧集列表成功，共 {len(data)} 集。")
            return data
        except requests.exceptions.RequestException as e:
            logger.error(f"{current_prefix} 请求Bangumi剧集列表API失败: {e}")
        except ValueError as e:
            logger.error(f"{current_prefix} 解析Bangumi剧集列表API响应失败: {e}")
        return None # 发生严重错误时返回None

    @cached(TTLCache(maxsize=100, ttl=3600))
    def update_episode_status(self, bangumi_episode_id: int):
        current_prefix = getattr(self, '_prefix', f"[BGM Episode:{bangumi_episode_id}]")
        
        # 检查单集观看状态
        status_url = f"https://api.bgm.tv/v0/users/-/collections/-/episodes/{bangumi_episode_id}"
        try:
            resp_status = self._request.get(status_url)
            if resp_status.status_code == 200:
                if resp_status.json().get("type") == 2: # 2 代表 "看过"
                    logger.info(f"{current_prefix} Bangumi单集 {bangumi_episode_id} 已标记为看过，无需重复操作。")
                    return
            elif resp_status.status_code == 404: # 未收藏该单集
                 logger.debug(f"{current_prefix} Bangumi单集 {bangumi_episode_id} 尚未标记。")
            else:
                resp_status.raise_for_status() # 其他错误则抛出

            # 更新单集观看状态为 "看过" (type=2)
            # Bangumi API v0 使用 PUT /users/-/collection/-/episodes/{episode_id}
            # payload {"type": 2}
            update_url = f"https://api.bgm.tv/v0/users/-/collections/-/episodes/{bangumi_episode_id}"
            payload = {"type": 2}
            resp_update = self._request.put(url=update_url, json=payload)
            
            # 成功通常是 204 No Content 或 200 OK
            if resp_update.status_code == 204 or resp_update.status_code == 200:
                logger.info(f"{current_prefix} Bangumi单集 {bangumi_episode_id} 点格子成功。")
            else:
                logger.warning(f"{current_prefix} Bangumi单集 {bangumi_episode_id} 点格子失败，响应: {resp_update.status_code}, {resp_update.text}")

        except requests.exceptions.RequestException as e:
            logger.error(f"{current_prefix} 更新Bangumi单集 {bangumi_episode_id} 观看状态失败: {e}")
        except ValueError as e: # JSONDecodeError
            logger.error(f"{current_prefix} 解析Bangumi单集 {bangumi_episode_id} 状态响应失败: {e}")


    @staticmethod
    def is_anime(event_info: WebhookEventInfo) -> bool:
        path_keyword_str = "日番,cartoon,动漫,动画,ani,anime,新番,番剧,特摄,bangumi,ova,映画,国漫,日漫"
        path_keywords = [k.strip().lower() for k in path_keyword_str.split(',') if k.strip()]

        path_to_check = ""
        if event_info.channel in ["emby", "jellyfin"]:
            path_to_check = event_info.item_path or ""
            if not path_to_check and event_info.library_name: # 如果路径为空，尝试使用库名
                path_to_check = event_info.library_name
        elif event_info.channel == "plex":
            # Plex 的 WebhookEventInfo 可能没有 item_path，但有 library_name
            path_to_check = event_info.library_name or ""
            if not path_to_check and event_info.json_object: # 兼容旧版取法
                 path_to_check = event_info.json_object.get("Metadata", {}).get("librarySectionTitle", "")
        
        path_to_check_lower = path_to_check.lower()
        for keyword in path_keywords:
            if keyword in path_to_check_lower:
                logger.debug(f"路径/库名 '{path_to_check}' 包含关键词 '{keyword}'，判断为番剧。")
                return True
        
        logger.debug(f"路径/库名 '{path_to_check}' 未包含番剧关键词，判断为非番剧。")
        return False

    @staticmethod
    def format_title(title: str, season: int): # 此方法在当前逻辑中未使用
        if season < 2:
            return title
        else:
            season_zh_map = {0: "零", 1: "一", 2: "二", 3: "三", 4: "四", 5: "五", 6: "六", 7: "七", 8: "八", 9: "九"}
            season_zh = season_zh_map.get(season % 10) # 简单处理，大于9的季可能显示不佳
            if season_zh:
                return f"{title} 第{season_zh}季"
            return f"{title} S{season}" # 回退到 S+数字

    @staticmethod
    def get_command() -> List[Dict[str, Any]]:
        return [] # 保持为空

    def get_api(self) -> List[Dict[str, Any]]:
        return [] # 保持为空

    def get_form(self) -> Tuple[List[dict], Dict[str, Any]]:
        # 模拟媒体服务器列表，实际应从 MediaServerHelper 获取
        # media_servers_list = []
        # if self.mediaserver_helper:
        #     server_configs = self.mediaserver_helper.get_configs()
        #     media_servers_list = [{"title": name, "value": name} for name, cfg in server_configs.items()]
        # else:
        #     media_servers_list = [{"title": "未配置媒体服务器", "value": ""}]
        # 由于 MediaServerHelper 未在此插件中初始化，我们先用一个静态的提示
        mediaserver_configs = getattr(settings, 'MEDIASERVER_CONFIG', None)

        
        if not media_servers_list:
            # 如果没有获取到服务器列表，提供一个提示
            media_servers_list = [{"title": "未找到或未配置媒体服务器", "value": "", "disabled": True}]

        if settings.MEDIASERVER: # 如果MoviePilot有全局的媒体服务器配置
            media_servers_list = [{"title": name, "value": name} for name in settings.MEDIASERVER.keys()]


        return [
            {
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
                                'component': 'VForm',
                                'content': [
                                    {
                                        'component': 'VRow',
                                        'content': [
                                            {
                                                'component': 'VCol',
                                                'props': {'cols': 12, 'md': 3},
                                                'content': [
                                                    {
                                                        'component': 'VSwitch',
                                                        'props': {
                                                            'model': 'enable',
                                                            'label': '启用插件',
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                'component': 'VCol',
                                                'props': {'cols': 12, 'md': 3},
                                                'content': [
                                                    {
                                                        'component': 'VSwitch',
                                                        'props': {
                                                            'model': 'uniqueid_match',
                                                            'label': 'TMDB集唯一ID匹配',
                                                            'hint': '提高Bangumi条目搜索准确率',
                                                            'persistentHint': True,
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                'component': 'VCol',
                                                'props': {'cols': 12, 'md': 6},
                                                'content': [
                                                    {
                                                        'component': 'VSelect',
                                                        'props': {
                                                            'model': 'selected_server',
                                                            'label': '选择媒体服务器',
                                                            'items': media_servers_list,
                                                            'hint': '用于识别事件来源 (可选，未来可能用于获取用户列表)',
                                                            'persistentHint': True,
                                                            'clearable': True,
                                                        }
                                                    }
                                                ]
                                            },
                                        ]
                                    },
                                    {
                                        'component': 'VRow',
                                        'content': [
                                            {
                                                'component': 'VCol',
                                                'props': {'cols': 12},
                                                'content': [
                                                    {
                                                        'component': 'VTextField',
                                                        'props': {
                                                            'model': 'user',
                                                            'label': '媒体服务器用户名',
                                                            'placeholder': '你的Emby/Plex用户名,多个用逗号隔开',
                                                            'hint': '插件将只处理这些用户的播放事件',
                                                            'persistentHint': True,
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
            {
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
                            { # 认证方式 Tab
                                "component": "VWindowItem",
                                "props": {"value": "auth-method-tab"},
                                "content": [
                                    {
                                        "component": "VCardText",
                                        "content": [
                                            {
                                                'component': 'VRadioGroup',
                                                'props': {
                                                    'model': 'auth_method',
                                                    'inline': False, # 改为非inline，更清晰
                                                    'label': '选择Bangumi认证方式'
                                                },
                                                'content': [
                                                    {
                                                        'component': 'VRadio',
                                                        'props': {
                                                            'label': 'Access Token (推荐)',
                                                            'value': 'token'
                                                        }
                                                    },
                                                    {
                                                        'component': 'VRadio',
                                                        'props': {
                                                            'label': 'OAuth 2.0 (暂未完全支持)',
                                                            'value': 'oauth',
                                                            'disabled': True # OAuth暂未完全实现，先禁用
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                            },
                            { # 参数设置 Tab
                                "component": "VWindowItem",
                                "props": {"value": "params-tab"},
                                "content": [
                                    {
                                        "component": "VCardText",
                                        "content": [
                                            # Token 输入 (仅当 auth_method 为 'token' 时，前端应处理显隐，此处结构上都列出)
                                            {
                                                'component': 'VRow',
                                                # 'v-if': "auth_method === 'token'", # Vue的条件渲染，这里只是示意
                                                'content': [
                                                    {
                                                        'component': 'VCol',
                                                        'props': {'cols': 12},
                                                        'content': [
                                                            {
                                                                'component': 'VTextField',
                                                                'props': {
                                                                    'model': 'token',
                                                                    'label': 'Bangumi Access Token',
                                                                    'placeholder': '在此输入你的Access Token',
                                                                    'type': 'password', # 实现****效果
                                                                    'hint': '用于Token认证方式。获取：https://next.bgm.tv/demo/access-token',
                                                                    'persistentHint': True,
                                                                    # 'v-show': "auth_method === 'token'" # 另一种前端显隐方式
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            # OAuth 输入 (仅当 auth_method 为 'oauth' 时)
                                            {
                                                'component': 'VRow',
                                                # 'v-if': "auth_method === 'oauth'",
                                                'content': [
                                                    {
                                                        'component': 'VCol',
                                                        'props': {'cols': 12, 'md': 6},
                                                        'content': [
                                                            {
                                                                'component': 'VTextField',
                                                                'props': {
                                                                    'model': 'oauth_app_id',
                                                                    'label': 'OAuth Application ID',
                                                                    'placeholder': '在此输入你的App ID',
                                                                    'hint': '用于OAuth认证方式 (暂不可用)',
                                                                    'persistentHint': True,
                                                                    'disabled': True, # OAuth暂未完全实现，先禁用
                                                                    # 'v-show': "auth_method === 'oauth'"
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        'component': 'VCol',
                                                        'props': {'cols': 12, 'md': 6},
                                                        'content': [
                                                            {
                                                                'component': 'VTextField',
                                                                'props': {
                                                                    'model': 'oauth_app_secret',
                                                                    'label': 'OAuth Application Secret',
                                                                    'placeholder': '在此输入你的App Secret',
                                                                    'type': 'password', # 实现****效果
                                                                    'hint': '用于OAuth认证方式 (暂不可用)',
                                                                    'persistentHint': True,
                                                                    'disabled': True, # OAuth暂未完全实现，先禁用
                                                                    # 'v-show': "auth_method === 'oauth'"
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            { # 通用提示信息
                                                'component': 'VRow',
                                                'content': [
                                                    {
                                                        'component': 'VCol',
                                                        'props': {'cols': 12},
                                                        'content': [
                                                            {
                                                                'component': 'VAlert',
                                                                'props': {
                                                                    'type': 'info',
                                                                    'variant': 'tonal',
                                                                    'text': 'Webhook设置：请在媒体服务器（如Emby/Jellyfin）中添加MoviePilot的Webhook地址 (通常是 http://[MoviePilot地址]:[端口]/api/v1/webhook?token=moviepilot )，并确保启用了播放相关的事件通知。',
                                                                    'style': 'white-space: pre-line;'
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                            }
                        ]
                    }
                ]
            }
        ], { # 默认值
            "enable": False,
            "uniqueid_match": False,
            "user": "",
            "selected_server": None,
            "auth_method": "token",
            "token": "",
            "oauth_app_id": "",
            "oauth_app_secret": "",
            "tab": "auth-method-tab" # 默认显示认证方式tab
        }

    def get_page(self) -> List[dict]:
        return [] # 保持为空

    def __update_config(self):
        self.update_config({
            "enable": self._enable,
            "uniqueid_match": self._uniqueid_match,
            "user": self._user,
            "token": self._token,
            "selected_server": self._selected_server,
            "auth_method": self._auth_method,
            "oauth_app_id": self._oauth_app_id,
            "oauth_app_secret": self._oauth_app_secret,
            "tab": self._tab
        })

    def get_state(self) -> bool:
        return self._enable

    def stop_service(self):
        pass # 保持为空


if __name__ == "__main__":
    # 测试代码需要实例化并正确初始化才能运行
    # 例如，需要模拟MoviePilot环境中的settings和config
    
    # 模拟配置
    mock_config = {
        "enable": True,
        "uniqueid_match": True,
        "user": "testuser", # 你的媒体服务器用户名
        "token": "YOUR_BANGUMI_ACCESS_TOKEN", # 替换为你的真实Token
        "selected_server": "emby_server_1", # 假设的服务器名
        "auth_method": "token",
        "oauth_app_id": "",
        "oauth_app_secret": "",
        "tab": "auth-method-tab"
    }
    
    pass
