# -*- coding: utf-8 -*-

import json
from fanstatic import Library
from fanstatic import Resource
from js.tinymce import tinymce
from js.tinymce import tinymcepopup
from kotti.static import edit_needed
from kotti.views.image import image_scales
from kotti_navigation import render_navigation_widget
from pyramid.response import Response
from pyramid.view import view_config
from pyramid.view import view_defaults

library = Library('kotti_tinymce', 'static')
kotti_tinymce = Resource(library,
                         "kotti_tinymce.js",
#                         minified="kotti_tinymce.min.js",
                         depends=[tinymce, tinymcepopup])


@view_defaults(context=object)
class KottiTinyMCE():

    def __init__(self, context, request):

        self.context = context
        self.request = request

        # put the requested type (image or file) into the session to
        # enable browsing through the navigation tree without having
        # to take special care while generation URLs
        if "type" in request.GET:
            request.session["kottibrowser_requested_type"] = request.GET["type"]
        else:
            if ("kottibrowser_requested_type" not in request.session) or (not request.session["kottibrowser_requested_type"]):
                request.session["kottibrowser_requested_type"] = "file"

    @view_config(name="external_link_list")
    def external_link_list(self):
        links = []
        for n in self.context.children:
            url = self.request.resource_url(n)
            path = url.replace(self.request.application_url, "")
            links.append([u"%s (%s)" % (path, n.title),
                          url])
        links.sort(key=lambda x: x[0])
        response = "var tinyMCELinkList = %s;" % json.dumps(links)

        return Response(body=response)

    @view_config(name="external_image_list")
    def external_image_list(self):

        images = []
        for n in self.context.children:
            if n.type != 'image':
                continue
            url = self.request.resource_url(n)
            path = url.replace(self.request.application_url, "")
            images.append([u"%s (%s)" % (path, n.title),
                           "%simage" % url])
        images.sort(key=lambda x: x[0])

        response = "var tinyMCEImageList = %s;" % json.dumps(images)

        return Response(body=response)

    @view_config(name="kottibrowser",
                 renderer="kotti_tinymce:templates/kottibrowser.pt")
    def kottibrowser(self):

        scales = [{
            "size": size,
            "value": name,
            "title": name,
        } for (name, size) in sorted(image_scales.items(), key=lambda x: x[1])]

        return {
            "image_selectable": self.context.type == self.request.session["kottibrowser_requested_type"] == "image",
            "link_selectable": self.request.session["kottibrowser_requested_type"] != "image",
            "navigation": render_navigation_widget(self.context, self.request),
            "image_url": self.request.resource_url(self.context) + 'image',
            "image_scales": scales,
        }


def kotti_configure(settings):
    settings['kotti.includes'] += ' kotti_tinymce'
    settings['pyramid_deform.template_search_path'] = (
        'kotti_tinymce:templates/deform ' +
        settings['pyramid_deform.template_search_path'])


def includeme(config):

    edit_needed.add(kotti_tinymce)

    config.scan("kotti_tinymce")
