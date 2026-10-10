"""真实刮削来源注册表；新增来源需实现同一解析与下载契约。"""
from .tmdb import TMDBProvider

PROVIDERS = {'tmdb': TMDBProvider}


def get_provider(name='tmdb'):
    """每次获取独立实例，调用方负责在 finally 中 close。"""
    if name not in PROVIDERS:
        raise ValueError('不支持的刮削来源')
    return PROVIDERS[name]()


def available_providers():
    """返回无凭据、无网络请求的来源清单。"""
    return [{'id': name, 'name': provider.label, 'available': provider.available()}
            for name, provider in PROVIDERS.items()]
