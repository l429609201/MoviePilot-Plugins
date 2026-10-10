"""搜索、可靠选择及精准分集导入的流程组合。"""
from .ai_matcher import choose_with_ai
from .matching import select_match, valid_selection


class SelectionMixin:
    def _choose_ai(self, context, candidates):
        return choose_with_ai(context, candidates)

    def _confirmation(self, task, reason):
        with self._lock:
            task.update(status="needs_confirmation", error=reason, selection_reason=reason)
            self._persist()
        return None

    def _prepare_ai_import(self, task):
        context = task["media_context"]
        keyword = context.get("title") or context.get("original_title")
        if not keyword:
            return self._confirmation(task, "缺少媒体标题，不能可靠搜索")
        params = {"keyword": keyword}
        if task["season"] is not None:
            params["season"] = task["season"]
        if len(task["episodes"]) == 1:
            params["episode"] = task["episodes"][0]
        code, response = self._api_search(params)
        payload = response.get("data", response) if isinstance(response, dict) else {}
        payload = payload if isinstance(payload, dict) else {}
        candidates = payload.get("results")
        search_id = payload.get("searchId")
        if code != 200 or not isinstance(candidates, list) or not candidates or len(candidates) > 100 or not isinstance(search_id, str) or not search_id:
            return self._confirmation(task, "搜索失败或无有效结果，未提交导入")
        try:
            index = self._choose_ai(context, candidates)
        except Exception:
            index = None
        method = "ai"
        if not valid_selection(context, candidates, index):
            index, method = select_match(context, candidates), "rule"
        if index is None:
            return self._confirmation(task, "候选不可靠或存在歧义，请人工确认")
        result_index = candidates[index].get("result_index")
        if type(result_index) is not int or result_index < 0 or sum(isinstance(item, dict) and item.get("result_index") == result_index for item in candidates) != 1:
            return self._confirmation(task, "搜索结果索引无效，未提交导入")
        body = {"searchId": search_id, "result_index": result_index}
        id_fields = {"tmdb": "tmdbId", "tvdb": "tvdbId", "bangumi": "bangumiId", "imdb": "imdbId", "douban": "doubanId"}
        if task["search_type"] in id_fields:
            body[id_fields[task["search_type"]]] = task["search_term"]
        edited = False
        if task["episodes"]:
            # direct无法表达多个指定集数，必须先取明确集号再提交edited。
            code, response = self._api_episodes(search_id, result_index)
            episodes = response if isinstance(response, list) else response.get("episodes", response.get("data", [])) if isinstance(response, dict) else []
            selected = []
            if code != 200 or not isinstance(episodes, list):
                return self._confirmation(task, "分集查询失败，未提交导入")
            for number in task["episodes"]:
                items = [item for item in episodes if isinstance(item, dict) and type(item.get("episodeIndex")) is int and item["episodeIndex"] == number]
                if len(items) != 1 or items[0].get("provider") != candidates[index].get("provider") or not all(isinstance(items[0].get(key), str) and items[0][key] for key in ("provider", "episodeId", "title")):
                    return self._confirmation(task, "分集缺失或集号歧义，未提交导入")
                selected.append({key: items[0][key] for key in ("provider", "episodeId", "title", "episodeIndex", "url") if key in items[0]})
            body["episodes"] = selected
            edited = True
        with self._lock:
            task.update(selection_method=method, selection_reason="AI通过可靠性校验" if method == "ai" else "AI不可用或结果无效，已使用可靠规则匹配",
                        remote_task_kind="execution")
            self._persist()
        return edited, body
