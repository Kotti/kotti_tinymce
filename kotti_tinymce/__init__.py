# -*- coding: utf-8 -*-

from fanstatic import Library
from fanstatic import Resource
from js.deform import resource_mapping
from kotti.resources import Content
from kotti.resources import File
from kotti.util import _
from kotti.util import title_to_name
from pyramid.httpexceptions import HTTPFound
from pyramid.view import view_config
from pyramid.view import view_defaults

has_kotti_image = True
try:
    from kotti_image.resources import Image
except ImportError:
    has_kotti_image = False

library = Library('kotti_tinymce', 'static')

tinymce = Resource(
    library,
    'tinymce.js',
    minified='tinymce.min.js'
)
kotti_tinymce = Resource(
    library,
    'kotti_tinymce.js',
    minified='kotti_tinymce.min.js',
    depends=[tinymce, ]
)
codemirror_plugin = Resource(
    library,
    'plugins/codemirror/plugin.js',
    minified='plugins/codemirror/plugin.min.js',
    depends=[tinymce, ]
)
kottiimage_plugin = Resource(
    library,
    'kottiimage_plugin.js',
    minified='kottiimage_plugin.min.js',
    depends=[tinymce, ]
)


@view_defaults(context=Content, request_method='GET')
class KottiTinyMCE():

    def __init__(self, context, request):

        self.context = context
        self.request = request

        # Put the requested type (image or file) into the session to
        # enable browsing through the navigation tree without having
        # to take special care while generating URLs.
        if 'type' in request.GET:
            request.session['kottibrowser_requested_type'] = request.GET['type']
        else:
            if ('kottibrowser_requested_type' not in request.session) or \
               (not request.session['kottibrowser_requested_type']):
                request.session['kottibrowser_requested_type'] = 'file'

    @view_config(name='external_link_list', renderer='json')
    def external_link_list(self):
        links = []
        for n in self.context.children:
            url = self.request.resource_url(n)
            path = url.replace(self.request.application_url, '')
            links.append([u'%s (%s)' % (path, n.title),
                          url])
        links.sort(key=lambda x: x[0])
        return links

    @view_config(name='external_image_list', renderer='json')
    def external_image_list(self):

        images = []
        for n in self.context.children:
            if n.type != 'image':
                continue
            url = self.request.resource_url(n)
            path = url.replace(self.request.application_url, '')
            images.append([u'%s (%s)' % (path, n.title),
                           '%simage' % url])
        images.sort(key=lambda x: x[0])
        return images

    @view_config(name='kottibrowser',
                 renderer='kotti_tinymce:templates/kottibrowser.pt')
    def kottibrowser(self):

        kotti_tinymce.need()

        if has_kotti_image and self.request.session['kottibrowser_requested_type'] == 'image':  # noqa
            upload_allowed = Image.type_info.addable(self.context, self.request)
        else:
            upload_allowed = File.type_info.addable(self.context, self.request)

        return {
            'image_selectable':
            has_kotti_image and
            self.context.type ==
            self.request.session['kottibrowser_requested_type'] == 'image',

            'link_selectable':
            self.request.session['kottibrowser_requested_type'] != 'image',

            'image_url':
            self.request.resource_url(self.context) + 'image/span1',

            'upload_allowed': upload_allowed,
        }

    @view_config(name='kottibrowser',
                 renderer='kotti_tinymce:templates/kottibrowser.pt',
                 request_method='POST')
    def upload(self):

        title = self.request.POST['uploadtitle']
        description = self.request.POST['uploaddescription']

        if 'uploadfile' not in self.request.POST:
            self.request.session.flash(
                _('Please select a file to upload.'),
                'error'
            )
            return self.kottibrowser()
        file = self.request.POST['uploadfile']

        if not hasattr(file, 'filename'):
            self.request.session.flash(
                _('Please select a file to upload.'),
                'error'
            )
            return self.kottibrowser()

        mimetype = file.type
        filename = file.filename
        data = file.file.read()
        size = len(data)
        title = title or filename

        if has_kotti_image and mimetype.startswith('image'):
            Factory = Image
        else:
            Factory = File

        id = title_to_name(title, blacklist=self.context.keys())
        resource = self.context[id] = Factory(
            title=title,
            description=description,
            data=data,
            filename=filename,
            mimetype=mimetype,
            size=size
        )

        self.request.session.flash(_('Successfully uploaded.'), 'success')

        location = self.request.resource_url(resource, '@@kottibrowser')

        return HTTPFound(location=location)


def kotti_configure(settings):
    settings['pyramid.includes'] += ' kotti_tinymce'
    settings['pyramid_deform.template_search_path'] = (
        'kotti_tinymce:templates/deform ' +
        settings['pyramid_deform.template_search_path'])


def includeme(config):

    config.scan('kotti_tinymce')
    config.add_translation_dirs('kotti_tinymce:locale/')

    resource_mapping['tinymce'] = [tinymce, kotti_tinymce, codemirror_plugin]
    if has_kotti_image:
        resource_mapping['tinymce'].append(kottiimage_plugin)
