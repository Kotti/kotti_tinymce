from js.deform import resource_mapping
from pyramid.interfaces import ITranslationDirectories

from kotti_tinymce import includeme
from kotti_tinymce import kotti_configure
from kotti_tinymce import kotti_tinymce


def test_kotti_configure():

    settings = {
        'pyramid.includes': '',
        'pyramid_deform.template_search_path': 'foo',
    }

    kotti_configure(settings)

    assert settings['pyramid.includes'] == ' kotti_tinymce'
    assert settings['pyramid_deform.template_search_path'] == \
        'kotti_tinymce:templates/deform foo'


def test_includeme(config):

    includeme(config)

    utils = config.registry.__dict__['_utility_registrations']
    k = (ITranslationDirectories, u'')

    # test if the translation dir is registered
    assert k in utils
    assert utils[k][0][0].find('kotti_tinymce/locale') > 0

    # test if js.deform.resource_mapping contains our JS
    assert kotti_tinymce in resource_mapping['tinymce']
