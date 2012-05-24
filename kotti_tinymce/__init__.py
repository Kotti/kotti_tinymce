from pyramid.location import lineage
from pyramid.renderers import render

from kotti.views.image import image_scales
from kotti.views.image import ImageView
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


def plonebrowser(context, request):

    return {
        "getImageScales": ({"value": "thumb", "title": "Daumennagel"}, )
    }


def jsonimagefolderlisting(context, request):

    items = [
        {'description': 'Site News',
            'icon': None,
            'id': item.name,
            'is_folderish': item.type not in ("file", "image", ),
            'normalized_type': item.type,
            'portal_type': item.type_info.title,
            'title': item.title,
            'uid': str(item.id),
            'url': request.resource_url(item)} for item in context.values()
    ]
    if context.__parent__ is None:
        parent_url = ""
    else:
        parent_url = request.resource_url(context.__parent__)

    path = [{
        "title": i.title,
        "url": request.resource_url(i),
        "icon": "", } for i in reversed(list(lineage(context)))]

    upload_allowed = True

    return {
        "items": items,
        "parent_url": parent_url,
        "path": path,
        "upload_allowed": upload_allowed,
    }


def jsondetails(context, request):
    scales = [{
        "size": size,
        "value": "@@images/image/{0}".format(name),
        "title": "{0}x{1}".format(*size),
        }
        for (name, size) in image_scales.items()
        ]

    info = {
        "uid_relative_url": "resolveuid/6d4e5e43caf04d5abbab9adfe2dcca97",
        "thumb": request.resource_url(context) + "/image/span2",
        "anchors": [],
        "uid_url": request.resource_url(context),
        "url": request.resource_url(context),
        "title": context.title,
        "description": context.description,
        "scales": scales,
        }

    return info


def image_view(context, request):
    return ImageView(context, request).image(
        subpath=request.subpath[-1:])


def includeme(config):
    config.add_view(
            jsonimagefolderlisting,
            name="tinymce-jsonimagefolderlisting",
            renderer="json",
        )

    config.add_view(
            jsondetails,
            name="tinymce-jsondetails",
            renderer="json",
        )

    config.add_route(
        "plonebrowser.htm",
        "/static-kotti-tinymce-skins/plugins/plonebrowser/plonebrowser.htm",
        )
    config.add_view(
        plonebrowser,
        renderer="templates/plonebrowser.htm.pt",
        route_name="plonebrowser.htm",
        )

    config.add_static_view(
        name='static-kotti-tinymce',
        path="kotti_tinymce:static/",
        )

    config.add_static_view(
        name='static-kotti-tinymce-skins',
        path=TINYMCE_SRC,
        )

    config.override_asset(
        to_override=TINYMCE_SRC + 'themes/advanced/skins/plone/dialog.css',
        override_with='kotti_tinymce:static/dialog.css',
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

    config.add_view(
        image_view,
        name="images",
        context="kotti.resources.Image"
        )
    register(RenderEditInHead, None, render_resource_links)
