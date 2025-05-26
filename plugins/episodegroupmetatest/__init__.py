from typing import Tuple, List, Dict, Any
from app.core.event import eventmanager, Event
from app.core.config import settings
# from app.core.metainfo import MetaInfo # MetaInfo 未在代码中使用，可以考虑移除
from app.log import logger
from app.plugins import _PluginBase
from app.schemas import WebhookEventInfo # MediaInfo 未在代码中使用，可以考虑移除
from app.schemas.types import EventType # MediaType 未在代码中使用，可以考虑移除
# from app.utils.http import RequestUtils # RequestUtils 未在代码中使用，可以考虑移除
from cachetools import cached, TTLCache
import requests
import re
import datetime
# 新增导入
from app.helper.mediaserver import MediaServerHelper


class BangumiSyncDebug(_PluginBase):
    # 插件名称
    plugin_name = "Bangumi打格子-debug"
    # 插件描述
    plugin_desc = "将在看记录同步到bangumi"
    # 插件图标
    plugin_icon = "https://raw.githubusercontent.com/honue/MoviePilot-Plugins/main/icons/bangumi.jpg"
    # 插件版本
    plugin_version = "2.0.1" # 版本号更新
    # 插件作者
    plugin_author = "honue,happyTonakai,AAA"
    # 作者主页
    author_url = "https://github.com/happyTonakai"
    # 插件配置项ID前缀
    plugin_config_prefix = "bangumisyncdebug_"
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
    # 新增配置项的私有属性
    _selected_server = None
    _login_method = "token"  # 默认为token
    _oauth_app_id = None
    _oauth_app_secret = None

    # 新增 mediaserver_helper 实例变量
    mediaserver_helper = None
    _prefix = "" # 初始化 _prefix

    def __init__(self):
        super().__init__()
        self.mediaserver_helper = MediaServerHelper()
        self._prefix = f"[{self.plugin_name}]" # 为日志添加插件名前缀

    def init_plugin(self, config: dict = None):
        if config:
            self._enable = config.get('enable', True)
            self._uniqueid_match = config.get('uniqueid_match', False)
            self._user = config.get('user')
            self._token = config.get('token')
            # 新增配置项的加载
            self._selected_server = config.get('selected_server')
            self._login_method = config.get('login_method', 'token')
            self._oauth_app_id = config.get('oauth_app_id')
            self._oauth_app_secret = config.get('oauth_app_secret')

            self._tmdb_key = settings.TMDB_API_KEY # 从全局设置获取TMDB Key

            if self._login_method == 'token' and self._token:
                headers = {"Authorization": f"Bearer {self._token}",
                           "User-Agent": self.UA,
                           "content-type": "application/json"}
                self._request = requests.Session()
                self._request.headers.update(headers)
                if settings.PROXY:
                    self._request.proxies.update(settings.PROXY)
                # 获取BGM UID
                if self._enable and self._token and not self._bgm_uid:
                    try:
                        resp = self._request.get(url="https://api.bgm.tv/v0/me")
                        if resp.status_code == 200:
                            self._bgm_uid = resp.json().get("id")
                            logger.info(f"{self._prefix} Bangumi UID: {self._bgm_uid} 获取成功 (Token登录)")
                        else:
                            logger.error(f"{self._prefix} 使用Token获取Bangumi UID失败: {resp.status_code} - {resp.text}")
                    except Exception as e:
                        logger.error(f"{self._prefix} 使用Token获取Bangumi UID时发生错误: {e}")

            elif self._login_method == 'oauth':
                # OAuth的请求初始化逻辑会更复杂，可能涉及到获取初始token等
                # 这里需要您根据Bangumi的OAuth流程来实现
                logger.info(f"{self._prefix} OAuth登录方式被选择，请确保实现了相应的认证逻辑。")
                # 示例：可能需要一个方法来处理OAuth认证并设置self._request
                # self.setup_oauth_request()
                # 同样，OAuth认证成功后也应尝试获取 _bgm_uid
                pass

            self.__update_config()
            logger.info(f"{self._prefix} 插件 v{self.plugin_version} 初始化成功")
        else:
            logger.info(f"{self._prefix} 插件 v{self.plugin_version} 使用默认配置初始化")


    @eventmanager.register(EventType.WebhookMessage)
    def hook(self, event: Event):
        if not self._enable:
            return
        if not self._request and self._login_method == 'token': # 确保 token 模式下 _request 已初始化
            logger.warning(f"{self._prefix} Bangumi请求客户端未初始化 (Token可能未配置或无效)，跳过处理。")
            return
        if not self._request and self._login_method == 'oauth': # OAuth 模式的提醒
            logger.warning(f"{self._prefix} Bangumi OAuth请求客户端未初始化，跳过处理。")
            return

        try:
            logger.debug(f"{self._prefix} 收到webhook事件: {event.event_data}")
            event_info: WebhookEventInfo = event.event_data
            
            if not self._user:
                logger.warning(f"{self._prefix} 未配置媒体服务器用户名，跳过处理。")
                return
            if event_info.user_name not in self._user.split(','):
                return

            play_start = {"playback.start", "media.play", "PlaybackStart"}
            if not (event_info.event in play_start or (event_info.percentage and event_info.percentage > 90)):
                return

            if not self.is_anime(event_info): # 调用实例方法
                return

            if event_info.item_type in ["TV", "Show"]: # 兼容Plex的Show类型
                tmdb_id = event_info.tmdb_id
                logger.info(f"{self._prefix} 匹配播放事件 {event_info.item_name} tmdb id = {tmdb_id}...")
                
                # 优先使用 item_name_without_episode，如果存在且有效
                # title_to_parse = event_info.item_name # 这行似乎没用到
                if hasattr(event_info, 'item_name_without_episode') and event_info.item_name_without_episode:
                    title = event_info.item_name_without_episode
                else: # 回退到正则匹配
                    match = re.match(r"^(.+?)\s(?:S\d+E\d+|Season\s\d+\sEpisode\s\d+)\s.*", event_info.item_name, re.IGNORECASE)
                    if match:
                        title = match.group(1).strip()
                    else:
                        # 更通用的标题提取，尝试去除末尾可能的剧集信息
                        title = re.sub(r'\s*-\s*S\d{1,2}E\d{1,3}\s*.*$', '', event_info.item_name, flags=re.IGNORECASE).strip()
                        title = re.sub(r'\s*第\s*\d+\s*(?:集|话)\s*.*$', '', title, flags=re.IGNORECASE).strip()
                        if not title: # 如果处理后为空，则使用原始名称的第一个词组
                           title = event_info.item_name.split(' ')[0]

                season_id, episode_id = map(int, [event_info.season_id, event_info.episode_id])
                # 更新 self._prefix 以包含当前处理的剧集信息，便于日志追踪
                current_log_prefix = f"[{self.plugin_name}] {title} S{season_id:02d}E{episode_id:02d}"

                try:
                    unique_id = int(tmdb_id) if tmdb_id else None
                except ValueError:
                    unique_id = None
                    
                subject_id, subject_name, original_episode_name = self.get_subjectid_by_title(
                    title, season_id, episode_id, unique_id, current_log_prefix
                )
                
                if subject_id is None:
                    logger.warning(f"{current_log_prefix}: 未能获取到Bangumi Subject ID，处理中止。")
                    return
                
                logger.info(f"{current_log_prefix}: 剧集 '{title}' {original_episode_name or f'E{episode_id}'} => Bangumi条目 '{subject_name}' (ID: {subject_id}, URL: https://bgm.tv/subject/{subject_id})")

                self.sync_watching_status(subject_id, episode_id, original_episode_name, current_log_prefix)

        except Exception as e:
            logger.error(f"{self._prefix} 同步在看状态失败: {e}", exc_info=True)
        # finally: # finally块中的self._prefix重置可能会影响异步日志，暂时移除
            # self._prefix = f"[{self.plugin_name}]" 


    @cached(TTLCache(maxsize=100, ttl=3600))
    def get_subjectid_by_title(self, title: str, season: int, episode: int, unique_id: int | None, log_prefix: str) -> Tuple[Any, Any, Any]:
        logger.debug(f"{log_prefix}: 尝试使用 bgm api 来获取 subject id for '{title}' S{season}E{episode} (TMDB集ID: {unique_id})")
        tmdb_id, original_name, original_language = self.get_tmdb_id(title, log_prefix)
        original_episode_name_from_tmdb = None # 初始化
        
        post_json = {
            "keyword": title, 
            "sort": "match",
            "filter": {"type": [2]}, 
        }

        if tmdb_id is not None:
            search_title = original_name or title 
            start_date, end_date, original_episode_name_from_tmdb = self.get_airdate_and_ep_name(
                tmdb_id, season, episode, unique_id, original_language, log_prefix
            )
            # original_episode_name = original_episode_name_from_tmdb # 这行在原版中是这样，但似乎应该在后面使用

            if start_date and end_date:
                post_json = {
                    "keyword": search_title,
                    "sort": "match",
                    "filter": {"type": [2], "air_date": [f">={start_date}", f"<={end_date}"]},
                }
            else: 
                 post_json["keyword"] = search_title
        
        logger.debug(f"{log_prefix}: Bangumi搜索请求体: {post_json}")
        url = "https://api.bgm.tv/v0/search/subjects"
        try:
            resp = self._request.post(url, json=post_json)
            resp.raise_for_status() 
            resp_data = resp.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"{log_prefix}: Bangumi搜索API请求失败: {e}")
            return None, None, None
        except ValueError as e: 
            logger.error(f"{log_prefix}: Bangumi搜索API响应JSON解析失败: {e} - 响应内容: {resp.text[:200]}")
            return None, None, None

        if not resp_data.get("data"):
            logger.warning(f"{log_prefix}: 未找到 '{post_json['keyword']}' 的Bangumi条目 (筛选条件: {post_json.get('filter')})")
            return None, None, None
        
        data = resp_data.get("data")[0]
        year = data.get("date", "N/A")[:4]
        name_cn = data.get("name_cn") or data.get("name", "未知标题")
        name_display = f"{name_cn} ({year})" if year != "N/A" else name_cn
        subject_id = data.get("id")
        
        # 返回从TMDB获取的原始剧集名，如果 Bangumi 搜索时用到了
        return subject_id, name_display, original_episode_name_from_tmdb

    @cached(TTLCache(maxsize=100, ttl=3600))
    def get_tmdb_id(self, title: str, log_prefix: str) -> Tuple[Any, Any, Any]:
        logger.debug(f"{log_prefix}: 尝试使用 TMDB API 搜索 '{title}'...")
        if not self._tmdb_key:
            logger.warning(f"{log_prefix}: TMDB API Key未配置，无法搜索。")
            return None, None, None
        
        url = f"https://api.tmdb.org/3/search/tv"
        params = {"query": title, "api_key": self._tmdb_key, "language": "zh-CN", "include_adult": "false"}
        
        try:
            ret = self._request.get(url, params=params)
            ret.raise_for_status()
            ret_data = ret.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"{log_prefix}: TMDB搜索API请求失败: {e}")
            return None, None, None
        except ValueError as e:
            logger.error(f"{log_prefix}: TMDB搜索API响应JSON解析失败: {e} - 响应内容: {ret.text[:200]}")
            return None, None, None

        if ret_data.get("total_results", 0) > 0:
            results = ret_data.get("results", [])
            for result in results:
                if 16 in result.get("genre_ids", []):
                    logger.debug(f"{log_prefix}: TMDB找到匹配动画 '{result.get('name')}' (ID: {result.get('id')})")
                    return result.get("id"), result.get("original_name"), result.get("original_language")
            logger.debug(f"{log_prefix}: TMDB找到结果，但没有类型为动画的条目。")
        else:
            logger.warning(f"{log_prefix}: 未找到 '{title}' 的TMDB条目。")
        return None, None, None # 确保在所有路径都有返回值

    @cached(TTLCache(maxsize=100, ttl=3600))
    def get_airdate_and_ep_name(self, tmdbid: int, season_id: int, episode_num: int, unique_episode_id: int | None, original_language: str | None, log_prefix: str) -> Tuple[Any, Any, Any]:
        logger.debug(f"{log_prefix}: 尝试从TMDB获取剧集播出日期和原始名称 (TV ID: {tmdbid}, S{season_id}E{episode_num}, 集TMDB ID: {unique_episode_id})")
        if not self._tmdb_key:
            logger.warning(f"{log_prefix}: TMDB API Key未配置，无法获取剧集详情。")
            return None, None, None

        lang_param = original_language if original_language and original_language != "xx" else "en-US" # xx是TMDB未指定语言的占位符

        def fetch_season_details_from_tmdb(tv_id: int, s_id: int, lang: str) -> dict | None: # Renamed to avoid conflict
            url = f"https://api.tmdb.org/3/tv/{tv_id}/season/{s_id}?api_key={self._tmdb_key}&language={lang}"
            try:
                resp = self._request.get(url)
                resp.raise_for_status()
                return resp.json()
            except requests.exceptions.RequestException as e:
                logger.error(f"{log_prefix}: 获取TMDB季度详情失败 (TV ID: {tv_id}, S{s_id}): {e}")
            except ValueError as e:
                 logger.error(f"{log_prefix}: TMDB季度详情响应JSON解析失败: {e} - 响应内容: {resp.text[:200]}")
            return None

        season_data = fetch_season_details_from_tmdb(tmdbid, season_id, lang_param)

        # 原版代码中的 episode group 逻辑，如果直接按季号获取失败
        if not season_data or "episodes" not in season_data:
            logger.debug(f"{log_prefix}: 无法通过季号获取TMDB季度信息，尝试通过episode group获取")
            url_group = f"https://api.tmdb.org/3/tv/{tmdbid}/episode_groups?api_key={self._tmdb_key}"
            try:
                resp_group = self._request.get(url_group)
                resp_group.raise_for_status()
                group_data = resp_group.json()
                if group_data and group_data.get("results"):
                    seasons_from_group = [
                        result for result in group_data.get("results") if result.get("name") == "Seasons" # Or other relevant group names
                    ]
                    if seasons_from_group:
                        # 原版逻辑是取 episode_count 最小的，这里我们可能需要更复杂的逻辑来匹配正确的 group
                        # 简化：尝试第一个 "Seasons" group，或根据 season_id 匹配 group name
                        # This part needs careful review of how TMDB episode groups work for anime
                        target_group_id = None
                        for s_group in seasons_from_group:
                            # A more robust matching for group might be needed
                            # For now, let's assume the first "Seasons" group or one that matches season_id in name
                             if f"Season {season_id}" in s_group.get("name","") or not target_group_id : # Simplistic match
                                target_group_id = s_group.get("id")
                                # break # Or continue to find best match

                        if target_group_id:
                            url_group_detail = f"https://api.tmdb.org/3/tv/episode_group/{target_group_id}?language={lang_param}&api_key={self._tmdb_key}"
                            resp_group_detail = self._request.get(url_group_detail)
                            resp_group_detail.raise_for_status()
                            group_detail_data = resp_group_detail.json()
                            if group_detail_data and group_detail_data.get("groups"):
                                for group_item_detail in group_detail_data.get("groups"):
                                    if group_item_detail.get("name", "").startswith(f"Season {season_id}"):
                                        # Assuming the structure of 'group_item_detail' has 'episodes'
                                        season_data = group_item_detail # This might need adjustment based on actual TMDB response
                                        logger.debug(f"{log_prefix}: 从Episode Group '{group_item_detail.get('name')}' 获取到季度信息。")
                                        break
            except Exception as e_group:
                logger.error(f"{log_prefix}: 获取或处理TMDB Episode Group信息失败: {e_group}")


        if not season_data or "episodes" not in season_data:
            logger.warning(f"{log_prefix}: 最终无法获取TMDB S{season_id} 的剧集信息。")
            if unique_episode_id: # 如果有集ID，尝试直接获取集信息作为最后手段
                ep_url = f"https://api.tmdb.org/3/tv/{tmdbid}/episode/{unique_episode_id}?api_key={self._tmdb_key}&language={lang_param}"
                try:
                    ep_resp = self._request.get(ep_url)
                    ep_resp.raise_for_status()
                    ep_data_item = ep_resp.json()
                    if ep_data_item and ep_data_item.get("air_date"):
                        air_date_str = ep_data_item.get("air_date")
                        original_ep_name = ep_data_item.get("name")
                        air_date_obj = datetime.datetime.strptime(air_date_str, "%Y-%m-%d").date()
                        start_date = air_date_obj - datetime.timedelta(days=30) 
                        end_date = air_date_obj + datetime.timedelta(days=30)   
                        logger.debug(f"{log_prefix}: 通过集ID {unique_episode_id} 获取到播出日期 {air_date_str}, 原始名称 '{original_ep_name}'")
                        return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"), original_ep_name
                except Exception as e_ep:
                    logger.warning(f"{log_prefix}: 通过集ID {unique_episode_id} 获取剧集信息失败: {e_ep}")
            return None, None, None

        episodes_list = season_data.get("episodes", [])
        if not episodes_list:
            logger.warning(f"{log_prefix}: TMDB S{season_id} 没有剧集列表。")
            return None, None, None

        matched_episode_data = None
        # 原版匹配逻辑
        air_date_for_range = season_data.get("air_date") # Use season's air_date as a base for range
        final_ep_data_for_name = None

        for ep_data in episodes_list:
            if air_date_for_range is None: # Initialize with the first episode's air_date if season's is missing
                air_date_for_range = ep_data.get("air_date")

            current_match = False
            if self._uniqueid_match and unique_episode_id:
                if ep_data.get("id") == unique_episode_id:
                    current_match = True
            elif ep_data.get("order", -99) + 1 == episode_num: # order is 0-indexed in some cases
                current_match = True
            elif ep_data.get("episode_number") == episode_num:
                current_match = True
            
            if current_match:
                # If an exact match is found, use its air_date for the range and its name
                air_date_for_range = ep_data.get("air_date") or air_date_for_range # Prefer specific episode air_date
                final_ep_data_for_name = ep_data
                logger.debug(f"{log_prefix}: 匹配到TMDB剧集: {ep_data.get('name')} (ID: {ep_data.get('id')}, EpNum: {ep_data.get('episode_number')})")
                break # Found the target episode

            # Original logic for finale/mid_season resetting air_date seems to be for iterating until the target episode
            # If we haven't found the target episode yet, and this one is a special type, it might affect the air_date_for_range
            # This part of the original logic is a bit unclear without more context on its intent.
            # For now, if we find a direct match, we use its air_date.
            # If we iterate through all and don't find a match, air_date_for_range will be the season's or first ep's air_date.
            if ep_data.get("episode_type") in ["finale", "mid_season"] and not final_ep_data_for_name: # Only reset if we haven't found our target
                 air_date_for_range = None # This was in original, purpose might be to ensure we use a regular episode's date

        if not air_date_for_range: # If after all, air_date is still None (e.g. only special episodes and no match)
            logger.warning(f"{log_prefix}: 未找到有效的TMDB播出日期用于范围计算。")
            return None, None, None
        
        original_episode_name_to_return = final_ep_data_for_name.get("name") if final_ep_data_for_name else None

        try:
            air_date_obj = datetime.datetime.strptime(air_date_for_range, "%Y-%m-%d").date()
        except (ValueError, TypeError) as e: # Added TypeError for None
            logger.error(f"{log_prefix}: TMDB提供的播出日期格式无效或为空: {air_date_for_range}, error: {e}")
            return None, None, None

        start_date = air_date_obj - datetime.timedelta(days=15) 
        end_date = air_date_obj + datetime.timedelta(days=15)
        logger.debug(f"{log_prefix}: 获取到剧集播出日期 {air_date_for_range}, 原始名称 '{original_episode_name_to_return}'. Bangumi搜索日期范围: {start_date} to {end_date}")
        return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"), original_episode_name_to_return


    @cached(TTLCache(maxsize=10, ttl=600)) 
    def sync_watching_status(self, subject_id: int, episode_num: int, original_episode_name: str | None, log_prefix: str):
        if not self._bgm_uid:
            logger.warning(f"{log_prefix}: Bangumi UID 未获取，无法同步状态。")
            if self._login_method == 'token' and self._token:
                 try:
                    resp_me = self._request.get(url="https://api.bgm.tv/v0/me")
                    if resp_me.status_code == 200:
                        self._bgm_uid = resp_me.json().get("id")
                        logger.info(f"{log_prefix} Bangumi UID: {self._bgm_uid} 重新获取成功。")
                    else:
                        logger.error(f"{log_prefix} 重新获取Bangumi UID失败: {resp_me.status_code}")
                        return
                 except Exception as e_me:
                    logger.error(f"{log_prefix} 重新获取Bangumi UID时出错: {e_me}")
                    return
            else: 
                return


        logger.debug(f"{log_prefix}: 开始同步Bangumi状态 (Subject ID: {subject_id}, 剧集号: {episode_num}, 原始名称: '{original_episode_name}')")

        self.update_collection_status(subject_id, new_type=3, log_prefix=log_prefix)

        ep_info_list = self.get_episodes_info(subject_id, log_prefix)
        if not ep_info_list: # Changed from `if ep_info is None:` to handle empty list
            logger.warning(f"{log_prefix}: 未能获取到Subject ID {subject_id} 的剧集列表，无法点格子。")
            return

        found_episode_id = None
        matched_ep_data = None # To store the matched episode data for later use

        # 原版匹配逻辑:
        # 1. 尝试通过原始剧集名称匹配
        if original_episode_name:
            for ep_data in ep_info_list:
                # Bangumi的name可能是日文或中文，original_episode_name通常是TMDB刮削时的语言
                # 原版是 `info.get("name") == original_episode_name`
                # 考虑大小写和部分匹配可能更鲁棒，但遵循原版精确匹配优先
                if ep_data.get("name") and original_episode_name.strip().lower() == ep_data.get("name").strip().lower():
                    found_episode_id = ep_data.get("id")
                    matched_ep_data = ep_data
                    logger.debug(f"{log_prefix}: 通过原始名称 '{original_episode_name}' 精确匹配到Bangumi剧集 '{ep_data.get('name')}' (ID: {found_episode_id})")
                    break
        
        # 2. 如果名称未匹配，则通过剧集号 (sort) 匹配 (本篇 type=0)
        if not found_episode_id:
            for ep_data in ep_info_list:
                if ep_data.get("type") == 0 and ep_data.get("sort") == episode_num:
                    found_episode_id = ep_data.get("id")
                    matched_ep_data = ep_data
                    logger.debug(f"{log_prefix}: 通过 sort={episode_num} 匹配到Bangumi剧集 '{ep_data.get('name_cn') or ep_data.get('name')}' (ID: {found_episode_id})")
                    break
        
        # 3. 如果 sort 未匹配，则尝试通过 ep 字段匹配 (本篇 type=0)
        if not found_episode_id:
             for ep_data in ep_info_list:
                if ep_data.get("type") == 0 and ep_data.get("ep") == episode_num: # 'ep' 可能是碟片原始集数
                    found_episode_id = ep_data.get("id")
                    matched_ep_data = ep_data
                    logger.debug(f"{log_prefix}: 通过 ep={episode_num} 匹配到Bangumi剧集 '{ep_data.get('name_cn') or ep_data.get('name')}' (ID: {found_episode_id})")
                    break

        if not found_episode_id:
            logger.warning(f"{log_prefix}: 未在Bangumi剧集列表中找到与 E{episode_num} (或原始名称 '{original_episode_name}') 匹配的剧集。")
            return

        self.update_episode_status(found_episode_id, log_prefix)

        # 判断是否为最后一集 (原版逻辑: info == ep_info[-1])
        # 需要确保 ep_info_list 是按顺序的，并且 matched_ep_data 是有效
        is_last_episode = False
        if matched_ep_data and ep_info_list:
            # 过滤出所有本篇剧集 (type=0) 并按 sort 排序
            main_episodes_sorted = sorted([ep for ep in ep_info_list if ep.get("type") == 0 and ep.get("sort") is not None], key=lambda x: x.get("sort"))
            if main_episodes_sorted and matched_ep_data.get("id") == main_episodes_sorted[-1].get("id"):
                is_last_episode = True
                logger.info(f"{log_prefix}: 检测到当前为最后一集 (E{matched_ep_data.get('sort')}: '{matched_ep_data.get('name_cn') or matched_ep_data.get('name')}')")

        if is_last_episode:
            self.update_collection_status(subject_id, new_type=2, log_prefix=log_prefix)


    @cached(TTLCache(maxsize=100, ttl=3600))
    def update_collection_status(self, subject_id: int, new_type: int = 3, log_prefix: str = ""):
        log_prefix = log_prefix or self._prefix # Ensure log_prefix is set
        if not self._bgm_uid: 
            logger.warning(f"{log_prefix}: Bangumi UID 未设置，无法更新合集状态。")
            return 
        
        url_get = f"https://api.bgm.tv/v0/users/{self._bgm_uid}/collections/{subject_id}"
        old_type = 0 
        
        try:
            resp_get = self._request.get(url=url_get)
            if resp_get.status_code == 200:
                resp_json = resp_get.json()
                old_type = resp_json.get("type", 0)
            elif resp_get.status_code == 404:
                logger.debug(f"{log_prefix}: Subject ID {subject_id} 当前未收藏。")
            else: 
                resp_get.raise_for_status() 

        except requests.exceptions.RequestException as e:
            logger.error(f"{log_prefix}: 获取合集 {subject_id} 当前状态失败: {e}")
        except ValueError as e: # Changed from `except Exception as e:` to be more specific
            logger.error(f"{log_prefix}: 解析合集 {subject_id} 当前状态响应JSON失败: {e} - 响应: {resp_get.text[:200]}")


        type_dict = {0: "未收藏", 1: "想看", 2: "看过", 3: "在看", 4: "搁置", 5: "抛弃"} # More complete dict
        old_status_text = type_dict.get(old_type, f"未知状态码({old_type})")
        new_status_text = type_dict.get(new_type, f"目标未知状态码({new_type})")

        if old_type == new_type:
            logger.info(f"{log_prefix}: 合集 {subject_id} 状态已为 '{new_status_text}'，无需更新。")
            return
        # 原版逻辑：如果已看过(2)，则不自动改为在看(3)等。
        if old_type == 2 and new_type != 2 : 
            logger.info(f"{log_prefix}: 合集 {subject_id} 已标记为 '{old_status_text}'，本次目标为 '{new_status_text}'，跳过自动更新以防覆盖手动操作。")
            return
        
        logger.info(f"{log_prefix}: 准备更新合集 {subject_id} 状态: '{old_status_text}' => '{new_status_text}'")
        post_data = {
            "type": new_type,
            # "comment": "", # 原版有，但可以按需移除或保留
            "private": False, # 原版有
        }
        url_post = f"https://api.bgm.tv/v0/users/-/collections/{subject_id}"
        try:
            resp_post = self._request.post(url=url_post, json=post_data)
            if resp_post.status_code in [200, 201, 202, 204]: 
                logger.info(f"{log_prefix}: 合集 {subject_id} 状态更新为 '{new_status_text}' 成功。")
            else:
                # logger.warning(resp_post.text) # 原版有，但可能暴露敏感信息，改为截断
                logger.warning(f"{log_prefix}: 合集 {subject_id} 状态更新为 '{new_status_text}' 失败: {resp_post.status_code} - {resp_post.text[:200]}")
        except requests.exceptions.RequestException as e:
            logger.error(f"{log_prefix}: 更新合集 {subject_id} 状态请求失败: {e}")


    @cached(TTLCache(maxsize=100, ttl=3600))
    def get_episodes_info(self, subject_id: int, log_prefix: str) -> list | None:
        log_prefix = log_prefix or self._prefix
        logger.debug(f"{log_prefix}: 获取Subject ID {subject_id} 的剧集列表...")
        # 原版未指定type，会获取所有类型。如果只想获取本篇，应为 params={"subject_id": subject_id, "type": 0}
        params = {"subject_id": subject_id} # Reverted to original behavior for now
        try:
            resp = self._request.get("https://api.bgm.tv/v0/episodes", params=params)
            resp.raise_for_status()
            data = resp.json()
            # 原版直接取 data["data"]，这里增加检查
            if data and "data" in data and isinstance(data["data"], list):
                logger.debug(f"{log_prefix}: 成功获取到 {len(data['data'])} 条剧集信息。")
                return data["data"]
            else:
                logger.warning(f"{log_prefix}: 获取剧集信息响应格式不正确或无数据。响应: {str(data)[:200]}")
                return [] 
        except requests.exceptions.RequestException as e:
            logger.error(f"{log_prefix}: 获取剧集列表API请求失败: {e}")
        except ValueError as e: 
            logger.error(f"{log_prefix}: 获取剧集列表API响应JSON解析失败: {e} - 响应: {resp.text[:200]}")
        return None 


    @cached(TTLCache(maxsize=100, ttl=3600)) 
    def update_episode_status(self, episode_id: int, log_prefix: str):
        log_prefix = log_prefix or self._prefix
        if not self._bgm_uid: 
            logger.warning(f"{log_prefix}: Bangumi UID 未设置，无法更新单集状态。")
            return

        url = f"https://api.bgm.tv/v0/users/-/collections/-/episodes/{episode_id}"
        
        try:
            resp_get = self._request.get(url)
            if resp_get.status_code == 200:
                status_data = resp_get.json()
                if status_data.get("type") == 2: 
                    logger.info(f"{log_prefix}: Bangumi单集 {episode_id} 已标记为 '看过'，无需重复点格子。")
                    return
            elif resp_get.status_code == 404: 
                logger.debug(f"{log_prefix}: Bangumi单集 {episode_id} 当前未标记。")
            else: # 原版这里没有else，直接尝试PUT
                logger.warning(f"{log_prefix}: 获取单集 {episode_id} 状态失败: {resp_get.status_code} - {resp_get.text[:200]}")
                # 根据原版逻辑，即使获取状态失败，也尝试更新，除非是404（表示未标记，可以更新）或200（已标记，可能不更新）
                # 如果不是200且不是404，原版会直接尝试PUT，这里保持该行为，但已记录警告
        except requests.exceptions.RequestException as e:
            logger.error(f"{log_prefix}: 获取单集 {episode_id} 状态请求失败: {e}")
            # 原版会继续尝试PUT，这里也保持
        except ValueError as e:
            logger.error(f"{log_prefix}: 解析单集 {episode_id} 状态响应JSON失败: {e} - 响应: {resp_get.text[:200]}")
            # 原版会继续尝试PUT

        logger.info(f"{log_prefix}: 准备为Bangumi单集 {episode_id} 点格子 (标记为 '看过')...")
        try:
            # 原版是PUT，v0 API文档也是PUT
            resp_put = self._request.put(url, json={"type": 2}) 
            if resp_put.status_code == 204: # No Content, 成功
                logger.info(f"{log_prefix}: Bangumi单集 {episode_id} 点格子成功。")
            elif resp_put.status_code == 202: # Accepted, 也算成功
                logger.info(f"{log_prefix}: Bangumi单集 {episode_id} 点格子请求已接受。")
            else:
                logger.warning(f"{log_prefix}: Bangumi单集 {episode_id} 点格子失败: {resp_put.status_code} - {resp_put.text[:200]}")
        except requests.exceptions.RequestException as e:
            logger.error(f"{log_prefix}: 单集 {episode_id} 点格子请求失败: {e}")


    def is_anime(self, event_info: WebhookEventInfo) -> bool: 
        path_keyword_str = "日番,cartoon,动漫,动画,ani,anime,新番,番剧,特摄,bangumi,ova,映画,国漫,日漫"
        path_keywords = [k.strip().lower() for k in path_keyword_str.split(',') if k.strip()]

        item_path_to_check = ""
        if event_info.channel in ["emby", "jellyfin"]:
            item_path_to_check = event_info.item_path or ""
        elif event_info.channel == "plex":
            # 原版逻辑
            metadata = event_info.json_object.get("Metadata", {})
            item_path_to_check = metadata.get("librarySectionTitle", "")

        item_path_to_check = item_path_to_check.lower()
        
        for keyword in path_keywords:
            # 原版是 path.count(keyword) > 0
            if keyword in item_path_to_check:
                logger.debug(f"{self._prefix} 路径 '{item_path_to_check}' 包含关键词 '{keyword}'，判断为动漫媒体库。")
                return True
        
        logger.debug(f"{self._prefix} 路径 '{item_path_to_check}' 未匹配到动漫关键词，判断为非动漫媒体库。")
        return False

    # format_title 方法在原版和新版中均未使用，可以考虑移除
    # @staticmethod
    # def format_title(title: str, season: int):
    #     if season < 2:
    #         return title
    #     else:
    #         season_zh = {0: "零", 1: "一", 2: "二", 3: "三", 4: "四", 5: "五", 6: "六", 7: "七", 8: "八",
    #                      9: "九"}.get(season)
    #         return f"{title} 第{season_zh}季"

    @staticmethod
    def get_command() -> List[Dict[str, Any]]:
        return [] 

    def get_api(self) -> List[Dict[str, Any]]:
        return [] 

    def get_form(self) -> Tuple[List[dict], Dict[str, Any]]:
        available_servers = []
        if self.mediaserver_helper:
            try:
                server_configs = self.mediaserver_helper.get_configs()
                for name, conf in server_configs.items():
                    server_name = getattr(conf, 'name', name) 
                    available_servers.append({"title": server_name, "value": server_name})
            except Exception as e:
                logger.error(f"{self._prefix} 获取媒体服务器列表失败: {e}")
                available_servers.append({"title": "无法加载服务器列表", "value": ""})

        basic_settings_card = {
            "component": "VCard",
            "props": {"variant": "outlined", "class": "mb-3"},
            "content": [
                {
                    "component": "VCardTitle",
                    "props": {"class": "d-flex align-center"},
                    "content": [
                        {
                            "component": "VIcon",
                            "props": {
                                "icon": "mdi-cog",
                                "color": "primary",
                                "class": "mr-2",
                            },
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
                                            'props': {'cols': 12, 'md': 6},
                                            'content': [
                                                {
                                                    'component': 'VSwitch',
                                                    'props': {
                                                        'model': 'enable',
                                                        'label': '启用插件',
                                                        'hint': '是否启用Bangumi在看同步功能',
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
                                                    'component': 'VSwitch',
                                                    'props': {
                                                        'model': 'uniqueid_match',
                                                        'label': '优先使用TMDB集ID匹配',
                                                        'hint': '尝试使用TMDB的集ID进行更精确的匹配（若媒体信息包含）',
                                                        'persistentHint': True,
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    'component': 'VRow',
                                    'content': [
                                        {
                                            'component': 'VCol',
                                            'props': {'cols': 12, 'md': 6},
                                            'content': [
                                                {
                                                    'component': 'VSelect',
                                                    'props': {
                                                        'model': 'selected_server',
                                                        'label': '媒体服务器实例 (可选)',
                                                        'items': available_servers,
                                                        'hint': '选择一个媒体服务器 (主要用于日志区分或未来功能)',
                                                        'persistentHint': True,
                                                        'clearable': True,
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
                                                        'model': 'user',
                                                        'label': '媒体服务器用户名',
                                                        'placeholder': 'Emby/Plex用户名,多个用逗号隔开',
                                                        'hint': '插件将为这些用户的播放行为同步到Bangumi',
                                                        'persistentHint': True,
                                                    }
                                                }
                                            ]
                                        }
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
                                                    'component': 'VRadioGroup',
                                                    'props': {
                                                        'model': 'login_method',
                                                        'label': 'Bangumi登录方式',
                                                        'inline': True,
                                                    },
                                                    'content': [
                                                        {
                                                            'component': 'VRadio',
                                                            'props': {'label': 'Access Token', 'value': 'token'}
                                                        },
                                                        {
                                                            'component': 'VRadio',
                                                            'props': {'label': 'OAuth 2.0 (暂未完全支持)', 'value': 'oauth', 'disabled': True} 
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                { 
                                    'component': 'VRow',
                                    'v_if': "login_method === 'token'", 
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
                                                        'placeholder': '例如: dY123qxXcdaf234Gj6u3va123Ohh',
                                                        'type': 'password',
                                                        'hint': '在此输入您的Bangumi Access Token',
                                                        'persistentHint': True,
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                { 
                                    'component': 'VRow',
                                    'v_if': "login_method === 'oauth'", 
                                    'content': [
                                        {
                                            'component': 'VCol',
                                            'props': {'cols': 12, 'md': 6},
                                            'content': [
                                                {
                                                    'component': 'VTextField',
                                                    'props': {
                                                        'model': 'oauth_app_id',
                                                        'label': 'Bangumi OAuth Application ID',
                                                        'placeholder': '请输入OAuth Application ID',
                                                        'type': 'password',
                                                        'hint': 'Bangumi OAuth应用的Client ID',
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
                                                    'component': 'VTextField',
                                                    'props': {
                                                        'model': 'oauth_app_secret',
                                                        'label': 'Bangumi OAuth Application Secret',
                                                        'placeholder': '请输入OAuth Application Secret',
                                                        'type': 'password',
                                                        'hint': 'Bangumi OAuth应用的Client Secret',
                                                        'persistentHint': True,
                                                    }
                                                }
                                            ]
                                        }
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
                                                    'component': 'VAlert',
                                                    'props': {
                                                        'type': 'info',
                                                        'variant': 'tonal',
                                                        'text': 'Access Token获取: https://next.bgm.tv/demo/access-token\n' +
                                                                'Emby/Jellyfin/Plex添加Webhook (Event需包含播放事件):\n' +
                                                                'http://[MoviePilot地址:端口]/api/v1/webhook?token=[MoviePilot的API密钥]\n' +
                                                                '感谢 @HankunYu 的想法',
                                                        'style': 'white-space: pre-line;' 
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
        }

        return [
            basic_settings_card
        ], {
            "enable": self._enable,
            "uniqueid_match": self._uniqueid_match,
            "user": self._user or "",
            "token": self._token or "",
            "selected_server": self._selected_server or None,
            "login_method": self._login_method or "token",
            "oauth_app_id": self._oauth_app_id or "",
            "oauth_app_secret": self._oauth_app_secret or ""
        }

    def get_page(self) -> List[dict]:
        return [] 

    def __update_config(self):
        self.update_config({
            "enable": self._enable,
            "uniqueid_match": self._uniqueid_match,
            "user": self._user,
            "token": self._token,
            "selected_server": self._selected_server,
            "login_method": self._login_method,
            "oauth_app_id": self._oauth_app_id,
            "oauth_app_secret": self._oauth_app_secret,
        })

    def get_state(self) -> bool:
        return self._enable

    def stop_service(self):
        pass 


if __name__ == "__main__":
    # 以下为本地测试代码，请根据需要调整
    # 配置模拟
    mock_config = {
        "enable": True,
        "uniqueid_match": True,
        "user": "testuser", # 替换为你的媒体服务器用户名
        "token": "YOUR_BANGUMI_ACCESS_TOKEN", # 替换为你的Bangumi Access Token
        "selected_server": "Emby_Server_1",
        "login_method": "token",
        "oauth_app_id": "",
        "oauth_app_secret": ""
    }

    # 模拟 settings (如果插件内直接用到了 settings.PROXY 或 settings.TMDB_API_KEY)
    class MockSettings:
        PROXY = None # 例如: {"http": "http://localhost:7890", "https": "http://localhost:7890"}
        TMDB_API_KEY = "YOUR_TMDB_API_KEY" # 替换为你的TMDB API Key
        
    settings.PROXY = MockSettings.PROXY
    settings.TMDB_API_KEY = MockSettings.TMDB_API_KEY
    
    plugin_instance = BangumiSyncDebug()
    plugin_instance.init_plugin(config=mock_config)

    # 模拟 WebhookEventInfo
    mock_event_data = WebhookEventInfo(
        event="media.play", # 或者 playback.start, PlaybackStart
        channel="emby", # emby, jellyfin, plex
        item_type="TV", # TV, Show
        item_name="葬送的芙莉莲 S01E01 冒险的结束", # 示例剧集名
        item_id="12345", # 媒体服务器中的item ID
        item_path="/media/anime/Sousou no Frieren/Season 1/Sousou no Frieren - S01E01.mkv", # 示例路径
        season_id=1,
        episode_id=1,
        tmdb_id="139164", # 葬送的芙莉莲的TMDB ID (剧集本身的，非单集)
        # unique_id="3660308", # S01E01 的 TMDB ID (如果uniqueid_match为True且能获取到)
        user_name="testuser", # 确保与配置中的user匹配
        percentage=5.0, # 模拟播放开始
        json_object={} # 对于Plex，这里可能包含更多信息
    )
    
    # 模拟 Event 对象
    class MockEvent:
        def __init__(self, data):
            self.event_data = data
            self.event_type = EventType.WebhookMessage 

    mock_event = MockEvent(mock_event_data)

    if plugin_instance.get_state():
        logger.info(f"{plugin_instance._prefix} 插件已启用，准备处理模拟事件...")
        plugin_instance.hook(mock_event)
    else:
        logger.info(f"{plugin_instance._prefix} 插件未启用。")

    # 测试特定函数 (可选)
    # test_log_prefix = f"[{plugin_instance.plugin_name}] TestRun"
    # title = "葬送的芙莉莲"
    # season = 1
    # episode = 1
    # unique_id = 3660308 # S01E01 的 TMDB ID
    # subject_id, subject_name, original_ep_name = plugin_instance.get_subjectid_by_title(title, season, episode, unique_id, test_log_prefix)
    # if subject_id:
    #     logger.info(f"{test_log_prefix}: 测试 get_subjectid_by_title: ID={subject_id}, Name='{subject_name}', OrigEpName='{original_ep_name}'")
    #     plugin_instance.sync_watching_status(subject_id, episode, original_ep_name, test_log_prefix)
    # else:
    #     logger.warning(f"{test_log_prefix}: 测试 get_subjectid_by_title 未找到条目。")
