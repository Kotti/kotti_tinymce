from pytest import fixture

pytest_plugins = "kotti"


@fixture(scope='session')
def custom_settings():
    # Compatibility for Kotti 1.3 and 2.0
    try:
        from kotti.resources import Image
        return {}
    except ImportError:
        # noinspection PyUnresolvedReferences c
        from kotti_image.resources import Image
        return {
            'kotti.configurators': 'kotti_image.kotti_configure'
        }
