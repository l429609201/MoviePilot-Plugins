import datetime
import re
from typing import Tuple, List, Dict, Any

import requests

from app.sdk.events import eventmanager, Event
from app.sdk.config import settings
from app.sdk.logging import logger
from app.sdk.media import resolve_media_identity
from app.sdk.network import RequestUtils
from app.sdk.plugin import _PluginBase
from app.schemas import WebhookEventInfo
from app.schemas.types import EventType, MediaSource

class BangumiSyncDebug(_PluginBase):
    # 插件名称
    plugin_name = "Bangumi打格子-debug"
    # 插件描述
    plugin_desc = "将在看记录同步到bangumi"
    # 插件图标
    plugin_icon = "bangumi-sync.png"
    # 插件版本
    plugin_version = "3.0.0"
    # 插件作者
    plugin_author = "misaka10876"
    # 作者主页
    author_url = "https://github.com/happyTonakai"
    # 插件配置项ID前缀
    plugin_config_prefix = "bangumisyncdebug_"
    # 加载顺序
    plugin_order = 20
    # 可使用的用户级别
    auth_level = 1

    UA = "honue/MoviePilot-Plugins (https://github.com/honue/MoviePilot-Plugins)"

    _enable = False
    _user = ""
    _bgm_uid = None
    _token = ""
    _tmdb_key = None
    _request = None
    _tmdb_request = None
    _uniqueid_match = False
    _prefix = "Bangumi"
    _timeout = (5, 20)

    def init_plugin(self, config: dict = None):
        self.stop_service()
        config = config or {}
        self._enable = bool(config.get('enable', False))
        self._uniqueid_match = bool(config.get('uniqueid_match', False))
        self._user = str(config.get('user') or '').strip()
        self._users = {user.strip() for user in self._user.split(',') if user.strip()}
        self._token = str(config.get('token') or '').strip()
        self._tmdb_key = settings.TMDB_API_KEY
        self._bgm_uid = None
        if not self._enable:
            return
        if not self._users or not self._token:
            logger.warning("Bangumi同步需要媒体服务器用户名及有效token，未启动服务")
            return
        # 不同站点隔离认证头，防止将Bangumi凭据发送给TMDB。
        self._request = requests.Session()
        self._request.headers.update({"Authorization": f"Bearer {self._token}",
                                      "User-Agent": self.UA,
                                      "content-type": "application/json"})
        self._tmdb_request = requests.Session()
        self._tmdb_request.headers.update({"User-Agent": self.UA})
        if settings.PROXY:
            self._request.proxies.update(settings.PROXY)
            self._tmdb_request.proxies.update(settings.PROXY)
        logger.info(f"Bangumi在看同步插件 v{self.plugin_version} 初始化成功")

    def _bgm_request(self, method, path, **kwargs):
        """统一限制网络等待时间，错误只报告状态码而不泄露响应或凭据。"""
        if not self._request:
            raise RuntimeError("Bangumi服务未初始化")
        response = RequestUtils(session=self._request, headers=dict(self._request.headers),
                                proxies=settings.PROXY, verify=True).request(
            method, f"https://api.bgm.tv/v0/{path}", timeout=self._timeout,
            allow_redirects=False, **kwargs)
        if response is None:
            raise RuntimeError("Bangumi网络请求失败")
        if response.status_code >= 300 and response.status_code != 404:
            raise RuntimeError(f"Bangumi HTTP {response.status_code}")
        return response

    def _tmdb_json(self, path, **params):
        if not self._tmdb_key or not self._tmdb_request:
            return {}
        params['api_key'] = self._tmdb_key
        response = RequestUtils(session=self._tmdb_request, headers=dict(self._tmdb_request.headers),
                                proxies=settings.PROXY, verify=True).get_res(
            f"https://api.tmdb.org/3/{path}", params=params, timeout=self._timeout,
            allow_redirects=False)
        if response is None:
            raise RuntimeError("TMDB网络请求失败")
        if response.status_code == 404:
            return {}
        if response.status_code >= 300:
            raise RuntimeError(f"TMDB HTTP {response.status_code}")
        return response.json()

    @eventmanager.register(EventType.WebhookMessage)
    def hook(self, event: Event):
        if not self._enable or not self._request or not event:
            return
        try:
            event_info = event.event_data
            if isinstance(event_info, dict):
                event_info = WebhookEventInfo(**event_info)
            if not event_info:
                return
            # 不记录完整载荷，避免泄露用户、IP及媒体路径。
            if event_info.user_name not in self._users:
                return
            play_start = {"playback.start", "media.play", "PlaybackStart"}
            # 不是播放停止事件, 或观看进度不足90% 不处理
            if not (event_info.event in play_start or event_info.percentage and event_info.percentage > 90):
                return
            # 根据路径判断是不是番剧
            if not BangumiSyncDebug.is_anime(event_info):
                return

            if event_info.item_type in ["TV"]:
                # 标题，mp 的 tmdb 搜索 api 有点问题，带空格的搜不出来，直接使用 emby 事件的标题
                # 主身份属于系列；非TMDB来源不能将裸ID传给TMDB接口。
                media_source, media_id = resolve_media_identity(
                    media_source=getattr(event_info, 'media_source', None),
                    media_id=getattr(event_info, 'media_id', None),
                )
                tmdb_id = media_id if media_source == MediaSource.TMDB else None
                if not event_info.item_name:
                    return
                match = re.match(r"^(.+)\sS\d+E\d+\s.+", event_info.item_name)
                if match:
                    title = match.group(1)
                else:
                    title = event_info.item_name.split(' ')[0]

                # 季 集
                season_id, episode_id = map(int, [event_info.season_id, event_info.episode_id])
                self._prefix = f"{title} 第{season_id}季 第{episode_id}集"
                try:
                    unique_id = int(getattr(event_info, 'episode_tmdb_id', None))
                except (TypeError, ValueError):
                    unique_id = None

                # 使用 tmdb airdate 来定位季，提高准确率
                subject_id, subject_name, original_episode_name = self.get_subjectid_by_title(
                    title, season_id, episode_id, unique_id, tmdb_id
                )
                logger.debug(f"subject_id: {subject_id}")
                logger.debug(f"subject_name: {subject_name}")
                logger.debug(f"original_episode_name: {original_episode_name}")
                if subject_id is None:
                    return
                logger.info(f"{self._prefix}: {title} {original_episode_name} => {subject_name} https://bgm.tv/subject/{subject_id}")

                self.sync_watching_status(subject_id, episode_id, original_episode_name)

        except Exception as e:
            logger.warning(f"同步在看状态失败: {type(e).__name__}")

    def get_subjectid_by_title(self, title: str, season: int, episode: int, unique_id: int | None, tmdb_id=None) -> Tuple:
        """
        获取 subject id
        :param title: 标题
        :param season: 季号
        :param episode: 集号
        :param unique_id: 集唯一 id
        """
        logger.debug(f"{self._prefix}: 尝试使用 bgm api 来获取 subject id...")
        if tmdb_id:
            detail = self._tmdb_json(f"tv/{tmdb_id}")
            original_name = detail.get('original_name') or title
            original_language = detail.get('original_language') or 'ja'
        else:
            tmdb_id, original_name, original_language = self.get_tmdb_id(title)
        original_episode_name = None
        post_json = {
            "keyword": title,
            "sort": "match",
            "filter": {"type": [2]},
        }
        if tmdb_id is not None:
            start_date, end_date, original_episode_name = self.get_airdate_and_ep_name(
                tmdb_id, season, episode, unique_id, original_language
            )
            if start_date is not None and end_date is not None:
                post_json = {
                    "keyword": original_name,
                    "sort": "match",
                    "filter": {"type": [2], "air_date": [f">={start_date}", f"<={end_date}"]},
                }

        resp = self._bgm_request('POST', 'search/subjects', json=post_json).json()
        if not resp.get("data"):
            logger.warning(f"{self._prefix}: 未找到{title}的bgm条目")
            return None, None, None
        data = resp.get("data")[0]
        year = (data.get("date") or "")[:4]
        name_cn = data["name_cn"] or data["name"]
        name_cn = f"{name_cn} ({year})"
        subject_id = data["id"]
        return subject_id, name_cn, original_episode_name

    def get_tmdb_id(self, title: str):
        logger.debug(f"{self._prefix}: 尝试使用 tmdb api 来获取 subject id...")
        ret = self._tmdb_json('search/tv', query=title)
        if ret.get("total_results"):
            results = ret.get("results")
        else:
            logger.warning(f"{self._prefix}: 未找到 {title} 的 tmdb 条目")
            return None, None, None
        for result in results:
            if 16 in (result.get("genre_ids") or []):
                return result.get("id"), result.get("original_name"), result.get("original_language")
        return None, None, None

    def get_airdate_and_ep_name(self, tmdbid: int, season_id: int, episode: int, unique_id: int | None, original_language: str):
        """
        通过tmdb 获取 airdate 定位季
        :param tmdbid: tmdb id
        :param season: 季号
        :param episode: 集号
        :param unique_id: 集唯一 id
        :param original_language: 原始语言
        """
        def get_tv_season_detail(tmdbid: int, season_id: int) -> dict:
            resp = self._tmdb_json(f'tv/{tmdbid}/season/{season_id}', language=original_language)
            if resp and resp.get("episodes"):
                return resp

            logger.debug(f"{self._prefix}: 无法通过季号获取TMDB季度信息，尝试通过episode group获取")
            # 通过季号查询失败，用户可能通过episode group刮削
            resp = self._tmdb_json(f'tv/{tmdbid}/episode_groups')
            if resp and resp.get("results"):
                # 有些番剧拥有多个Seasons结果，比如我独自升级，其中一个Seasons是将总集篇作为一集，因此我们选择episode_count最小的一个
                seasons = [
                    result for result in resp.get("results") if result.get("name") == "Seasons"
                ]
                if seasons:
                    season = min(seasons, key=lambda x: x.get("episode_count"))
                    resp = self._tmdb_json(f"tv/episode_group/{season.get('id')}", language=original_language)
                    if resp and resp.get("groups"):
                        for group in resp.get("groups"):
                            # 有些group的name并不仅是 f"Season {season}"，比如：Season 2 -Arise from the Shadow-
                            if re.match(rf"^Season {season_id}(?:\D|$)", group.get("name") or ""):
                                return group
            logger.debug(f"{self._prefix}: 无法通过episode group获取TMDB季度信息")
            return None  # Return None if no season detail is found

        logger.debug(f"{self._prefix}: 尝试使用 tmdb api 来获取 airdate...")
        resp = get_tv_season_detail(tmdbid, season_id)
        # 处理无效的响应数据
        if not resp or "episodes" not in resp:
            logger.warning(f"{self._prefix}: 无法获取TMDB季度信息")
            return None, None, None
        episodes = resp["episodes"]
        if not episodes:
            logger.warning(f"{self._prefix}: 该季度没有剧集信息")
            return None, None, None

        # 初始化播出日期
        air_date = resp.get("air_date")
        matched_episode = None
        for ep in episodes:
            if air_date is None:
                air_date = ep.get("air_date")
            if self._uniqueid_match and unique_id:
                matched = ep.get("id") == unique_id
            else:
                matched = ep.get("order", -99) + 1 == episode or ep.get("episode_number") == episode
            if matched:
                matched_episode = ep
                break
            if ep.get("episode_type") in ["finale", "mid_season"]:
                air_date = None

        if not air_date or not matched_episode:
            logger.warning(f"{self._prefix}: 未找到匹配的TMDB剧集或播出日期")
            return None, None, None

        # 原始单集名称，用于和bgm匹配
        original_episode_name = matched_episode.get("name")

        air_date = datetime.datetime.strptime(air_date, "%Y-%m-%d").date()
        # 时差原因可能有偏差，且tmdb不计算第0话的首播时间
        start_date = air_date - datetime.timedelta(days=15)
        end_date = air_date + datetime.timedelta(days=15)
        return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"), original_episode_name

    def sync_watching_status(self, subject_id, episode, original_episode_name):
        # 获取uid
        if not self._bgm_uid:
            resp = self._bgm_request('GET', 'me')
            self._bgm_uid = resp.json().get("id")
            logger.debug("已获取Bangumi账户身份")
        else:
            logger.debug("使用已验证的Bangumi账户身份")

        if not self._bgm_uid:
            logger.warning("Bangumi用户验证失败，停止同步")
            return
        # 更新合集状态
        self.update_collection_status(subject_id)

        # 获取episode id
        ep_info = self.get_episodes_info(subject_id)

        found_episode_id = None
        last_episode = False
        if ep_info:
            for info in ep_info:
                # First try to match by original episode name
                if original_episode_name and info.get("name") == original_episode_name:
                    found_episode_id = info["id"]
                    break

            if found_episode_id is None:
                for info in ep_info:
                    # 名称命中优先于可能错位的集号。
                    if info.get("sort") == episode:
                        found_episode_id = info["id"]
                        break

            if found_episode_id is None:
                # Fallback to checking the 'ep' field if 'sort' didn't match
                for info in ep_info:
                    if info.get("ep") == episode:
                        found_episode_id = info["id"]
                        break

        if not found_episode_id:
            logger.warning(f"{self._prefix}: 未找到episode，可能因为TMDB和BGM的episode映射关系不一致")
            return

        last_episode = info == ep_info[-1]

        # 点格子
        if not self.update_episode_status(found_episode_id):
            return

        # 最后一集，更新状态为看过
        if last_episode:
            self.update_collection_status(subject_id, 2)

    def update_collection_status(self, subject_id, new_type=3):
        resp = self._bgm_request('GET', f'users/{self._bgm_uid}/collections/{subject_id}')
        resp = resp.json()
        type_dict = {0: "未看", 1: "想看", 2: "看过", 3: "在看", 4: "搁置", 5: "抛弃"}
        old_type = resp.get('type', 0)
        type_dict.setdefault(old_type, '未知')
        if old_type == 2:
            # 已经看过，避免刷屏
            logger.info(f"{self._prefix}: 合集状态 {type_dict[old_type]} => {type_dict[new_type]}，无需更新在看状态")
            return
        if old_type == new_type == 3:
            # 已经在看，避免刷屏
            logger.info(f"{self._prefix}: 合集状态 {type_dict[old_type]} => {type_dict[new_type]}，无需更新在看状态")
            return
        # 更新在看状态
        post_data = {
            "type": new_type,
            "comment": "",
            "private": False,
        }
        resp = self._bgm_request('POST', f'users/-/collections/{subject_id}', json=post_data)
        if resp.status_code in [202, 204]:
            logger.info(f"{self._prefix}: 合集状态 {type_dict[old_type]} => {type_dict[new_type]}，在看状态更新成功")
        else:
            logger.warning(f"Bangumi HTTP {resp.status_code}")
            logger.warning(f"{self._prefix}: 合集状态 {type_dict[old_type]} => {type_dict[new_type]}，在看状态更新失败")

    def get_episodes_info(self, subject_id):
        ep_info = []
        while True:
            resp = self._bgm_request('GET', 'episodes', params={
                'subject_id': subject_id, 'type': 0, 'limit': 100, 'offset': len(ep_info)
            })
            if resp.status_code != 200:
                return []
            payload = resp.json()
            batch = payload.get('data') or []
            ep_info.extend(batch)
            if not batch or len(ep_info) >= payload.get('total', len(ep_info)):
                return ep_info

    def update_episode_status(self, episode_id):
        url = f"users/-/collections/-/episodes/{episode_id}"
        resp = self._bgm_request('GET', url)
        if resp.status_code == 200:
            resp = resp.json()
            if resp["type"] == 2:
                logger.info(f"{self._prefix}: 单集已经点过格子了")
                return True
        else:
            logger.warning(f"{self._prefix}: 获取单集信息失败, code={resp.status_code}")
            return
        resp = self._bgm_request('PUT', url, json={"type": 2})
        if resp.status_code == 204:
            logger.info(f"{self._prefix}: 单集点格子成功")
            return True
        else:
            logger.warning(f"{self._prefix}: 单集点格子失败, code={resp.status_code}")

    @staticmethod
    def is_anime(event_info: WebhookEventInfo) -> bool:
        """
        通过路径关键词来确定是不是anime媒体库
        """
        path_keyword = "日番,cartoon,动漫,动画,ani,anime,新番,番剧,特摄,bangumi,ova,映画,国漫,日漫"
        path = ""
        if event_info.channel in ["emby", "jellyfin"]:
            path = event_info.item_path or ""
        elif event_info.channel == "plex":
            path = (event_info.json_object or {}).get("Metadata", {}).get("librarySectionTitle", "") or ""

        path = path.lower()
        for keyword in path_keyword.split(','):
            if path.count(keyword):
                return True
        logger.debug("不是动漫媒体库")
        return False

    @staticmethod
    def format_title(title: str, season: int):
        if season < 2:
            return title
        else:
            season_zh = {0: "零", 1: "一", 2: "二", 3: "三", 4: "四", 5: "五", 6: "六", 7: "七", 8: "八",
                         9: "九"}.get(season)
            return f"{title} 第{season_zh}季"

    @staticmethod
    def get_command() -> List[Dict[str, Any]]:
        pass

    def get_api(self) -> List[Dict[str, Any]]:
        pass

    def get_form(self) -> Tuple[List[dict], Dict[str, Any]]:
        return [
            {
                'component': 'VForm',
                'content': [
                    {
                        'component': 'VRow',
                        'content': [
                            {
                                'component': 'VCol',
                                'props': {
                                    'cols': 12,
                                    'md': 4
                                },
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
                                'props': {
                                    'cols': 12,
                                    'md': 4
                                },
                                'content': [
                                    {
                                        'component': 'VSwitch',
                                        'props': {
                                            'model': 'uniqueid_match',
                                            'label': '集唯一ID匹配',
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
                                'props': {
                                    'cols': 12,
                                    'md': 6
                                },
                                'content': [
                                    {
                                        'component': 'VTextField',
                                        'props': {
                                            'model': 'user',
                                            'label': '媒体服务器用户名',
                                            'placeholder': '你的Emby/Plex用户名'
                                        }
                                    }
                                ]
                            }, {
                                'component': 'VCol',
                                'props': {
                                    'cols': 12,
                                    'md': 6
                                },
                                'content': [
                                    {
                                        'component': 'VTextField',
                                        'props': {
                                            'model': 'token',
                                            'label': 'Bangumi Access-token',
                                            'placeholder': 'dY123qxXcdaf234Gj6u3va123Ohh'
                                        }
                                    }
                                ]
                            }
                        ]
                    }, {
                        'component': 'VRow',
                        'content': [
                            {
                                'component': 'VCol',
                                'props': {
                                    'cols': 12,
                                },
                                'content': [
                                    {
                                        'component': 'VAlert',
                                        'props': {
                                            'type': 'info',
                                            'variant': 'tonal',
                                            'text': 'access-token获取：https://next.bgm.tv/demo/access-token' + '\n' +
                                                    'emby添加你mp的webhook（event要包括播放）： http://127.0.0.1:3001/api/v1/webhook?token=moviepilot' + '\n' +
                                                    '感谢@HankunYu的想法'
                                            ,
                                            'style': 'white-space: pre-line;'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ], {
            "enable": False,
            "uniqueid_match": False,
            "user": "",
            "token": ""
        }

    def get_page(self) -> List[dict]:
        pass

    def __update_config(self):
        """
        列新配置
        """
        self.update_config({
            "enable": self._enable,
            "uniqueid_match": self._uniqueid_match,
            "user": self._user,
            "token": self._token
        })

    def get_state(self) -> bool:
        return bool(self._enable and self._request)

    def stop_service(self):
        # 重载或停用时释放两个站点的连接池及账户状态。
        for session in (self._request, self._tmdb_request):
            if session:
                session.close()
        self._request = None
        self._tmdb_request = None
        self._bgm_uid = None