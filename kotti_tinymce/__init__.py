from pyramid.httpexceptions import HTTPNoContent
from pyramid.location import lineage
from pyramid.renderers import render
from pyramid.response import Response

from kotti.resources import File
from kotti.resources import Image
from kotti.util import title_to_name
from kotti.views.image import image_scales
from kotti.views.image import ImageView
from kotti.views.slots import register
from kotti.views.slots import RenderEditInHead

from kotti_tinymce.settings import get_settings_json

TINYMCE_SRC = 'kotti_tinymce:Products.TinyMCE/Products/TinyMCE/skins/tinymce/'


def render_resource_links(context, request):
    return render('kotti_tinymce:templates/resources.pt', {}, request)


def settings(context, request):
    return Response(get_settings_json(request))


def kotti_configure(settings):
    settings['kotti.includes'] += ' kotti_tinymce'
    settings['pyramid_deform.template_search_path'] = (
        'kotti_tinymce:templates/deform ' +
        settings['pyramid_deform.template_search_path'])


def plonebrowser(context, request):

    return {
        "getImageScales": ({"value": "thumb", "title": "Daumennagel"}, )
    }


#def jsonlinkablefolderlisting(context, request):
#    {
#        "parent_url": "",
#        "path": [{
#            "url": "http://localhost:8080/Plone",
#            "icon": "<img src=\"img/home.png\" width=\"16\" height=\"16\" />",
#            "title": "Home"
#        }],
#        "upload_allowed": true,
#        "items": [{
#            "description": "Congratulations! You have successfully installed Plone.",
#            "uid": "4a5fdcf683e8439483bd6ab9ea463f1a",
#            "title": "Welcome to Plone",
#            "url": "http://localhost:8080/Plone/front-page",
#            "is_folderish": false,
#            "portal_type": "Document",
#            "icon": null,
#            "id": "front-page",
#            "normalized_type": "document"
#        }]
#    }

def jsonimagefolderlisting(context, request):

    items = [
        {
            'description': item.description,
            'icon': None,
            'id': item.name,
            'is_folderish': item.type not in ("file", "image", ),
            'normalized_type': item.type,
            'portal_type': item.type_info.title,
            'title': item.title,
            'uid': str(item.id),
            'url': request.resource_url(item),
        } for item in context.values()
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

    listing = {
        "items": items,
        "parent_url": parent_url,
        "path": path,
        "upload_allowed": upload_allowed,
    }

    return listing


def jsondetails(context, request):
    scales = [{
        "size": size,
        "value": "@@images/image/{0}".format(name),
        "title": "{0}x{1}".format(*size),
        }
        for (name, size) in image_scales.items()
        ]

    if context.type == "image":
        thumb = request.resource_url(context) + "image/span2"
    else:
        thumb = None

    info = {
        "uid_relative_url": "resolveuid/6d4e5e43caf04d5abbab9adfe2dcca97",
        "thumb": thumb,
        "anchors": [],
        "uid_url": request.resource_url(context),
        "url": request.resource_url(context),
        "title": context.title,
        "description": context.description,
        "scales": scales,
        }
    return info


def setDescription(context, request):

    context.description = request.POST["description"]

    return HTTPNoContent()


def image_view(context, request):
    return ImageView(context, request).image(
        subpath=request.subpath[-1:])


def upload(context, request):

    title = request.POST["uploadtitle"]
    description = request.POST["uploaddescription"]
    file = request.POST["uploadfile"]
    mimetype = file.type
    filename = file.filename
    data = file.file.read()
    size = len(data)

    if mimetype.startswith("image"):
        Factory = Image
    else:
        Factory = File
    image = context[title_to_name(title)] = Factory(
        title=title,
        description=description,
        data=data,
        filename=filename,
        mimetype=mimetype,
        size=size
        )
    return Response("""<html><head></head><body onload="window.parent.uploadOk('%s', '%s');"></body></html>""" % (
        request.resource_url(image),
        request.resource_url(context)
        ))


def includeme(config):

    config.add_view(
        settings,
        name='tinymce-settings',
        permission='edit',
        )

    config.add_route(
        "source_editor.htm",
        '/static-kotti-tinymce-skins/themes/advanced/source_editor.htm',
        )
    config.add_view(
        renderer=TINYMCE_SRC + 'themes/advanced/source_editor.htm.pt',
        route_name="source_editor.htm",
        permission="edit",
        )

    config.add_view(
        jsonimagefolderlisting,
        name="tinymce-jsonlinkablefolderlisting",
        renderer="json",
        permission="edit",
        )

    config.add_view(
        jsonimagefolderlisting,
        name="tinymce-jsonimagefolderlisting",
        renderer="json",
        permission="edit",
        )

    config.add_view(
        jsondetails,
        name="tinymce-jsondetails",
        renderer="json",
        permission="edit",
        )

    config.add_view(
        setDescription,
        name="tinymce-setDescription",
        renderer="json",
        permission="edit",
        )

    config.add_view(
        upload,
        name="tinymce-upload",
        renderer="json",
        permission="edit",
        )

    config.add_route(
        "plonebrowser.htm",
        "/static-kotti-tinymce-skins/plugins/plonebrowser/plonebrowser.htm",
        )
    config.add_view(
        plonebrowser,
        renderer="templates/plonebrowser.htm.pt",
        route_name="plonebrowser.htm",
        permission="edit",
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
        context="kotti.resources.Image",
        permission="view",
        )
    register(RenderEditInHead, None, render_resource_links)
