from pyramid.renderers import render

from kotti.views.slots import register
from kotti.views.slots import RenderEditInHead

TINYMCE_SRC = 'kotti_tinymce:Products.TinyMCE/Products/TinyMCE/skins/tinymce/'

def render_resource_links(context, request):
    return render('kotti_tinymce:templates/resources.pt', {}, request)

def kotti_configure(settings):
    settings['kotti.includes'] += ' kotti_tinymce'
    settings['pyramid_deform.template_search_path'] = (
        'kotti_tinymce:templates/deform ' +
        settings['pyramid_deform.template_search_path'])

def includeme(config):
    config.add_static_view(
        name='static-kotti-tinymce-skins',
        path=TINYMCE_SRC,
        )

    config.override_asset(
        to_override=TINYMCE_SRC + 'themes/advanced/skins/plone/ui.css',
        override_with='kotti_tinymce:static/ui.css',
        )

    config.override_asset(
        to_override=TINYMCE_SRC + 'themes/advanced/skins/plone/content.css',
        override_with='kotti_tinymce:static/content.css',
        )

    config.override_asset(
        to_override=TINYMCE_SRC + 'plugins/inlinepopups/skins/plonepopup/window.css',
        override_with='kotti_tinymce:static/window.css',
        )

    register(RenderEditInHead, None, render_resource_links)
