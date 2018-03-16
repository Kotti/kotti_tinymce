# -*- coding: utf-8 -*-
from kotti.resources import get_root
from kotti.resources import Document
from kotti.resources import File

from kotti_image.resources import Image
from kotti_tinymce import KottiTinyMCE


def test_external_link_list(db_session, dummy_request):
    root = get_root()
    kt = KottiTinyMCE(root, dummy_request)

    res = kt.external_link_list()
    assert res == []

    root['doc'] = Document(title=u"Doc")
    res = kt.external_link_list()
    assert ["/doc/ (Doc)", "http://example.com/doc/"] in res

    root['image'] = Image(title=u"Image")
    res = kt.external_link_list()
    assert ["/doc/ (Doc)", "http://example.com/doc/"] in res
    assert ["/image/ (Image)", "http://example.com/image/"] in res


def test_external_image_list(db_session, dummy_request):
    root = get_root()
    kt = KottiTinyMCE(root, dummy_request)

    res = kt.external_image_list()
    assert res == []

    root['image1'] = Image(title='Image 1')
    res = kt.external_image_list()
    assert ['/image1/ (Image 1)', 'http://example.com/image1/image'] in res

    root['doc'] = Document(title='Doc')
    root['image2'] = Image(title='Image 2')
    res = kt.external_image_list()
    assert len(res) == 2
    assert ['/image1/ (Image 1)', 'http://example.com/image1/image'] in res
    assert ['/image2/ (Image 2)', 'http://example.com/image2/image'] in res


def test_kottibrowser(db_session, dummy_request, app):
    root = get_root()

    kt = KottiTinyMCE(root, dummy_request)
    browser = kt.kottibrowser()
    # image_scales do no longer exist as of 0.4
    # assert len(browser['image_scales']) == 12
    # assert browser['image_scales'][0] == \
    #     {'size': [60, 120], 'title': 'span1', 'value': 'span1'}
    assert browser['image_selectable'] is False
    assert browser['image_url'] == 'http://example.com/image/span1'
    assert browser['link_selectable'] is True
    # assert browser['upload_allowed'] is True

    image = root['image'] = Image(title=u"Image")
    dummy_request.params['type'] = 'image'
    kt = KottiTinyMCE(image, dummy_request)
    browser = kt.kottibrowser()
    # assert len(browser['image_scales']) == 12
    assert browser['image_selectable'] is True
    assert browser['image_url'] == 'http://example.com/image/image/span1'
    assert browser['link_selectable'] is False
    assert browser['upload_allowed'] is False


def test_upload(db_session, dummy_request, app, image_asset):
    from webob.multidict import MultiDict
    from io import BytesIO

    class DummyFile(object):
        file = BytesIO(b'data')

    root = get_root()

    dummy_request.POST = MultiDict()
    dummy_request.POST.add('uploadtitle', u'Title')
    dummy_request.POST.add('uploaddescription', u'Description')

    kt = KottiTinyMCE(root, dummy_request)
    kt.upload()
    assert dummy_request.session.pop_flash('error') == \
        ['Please select a file to upload.']

    dummy_file = DummyFile()
    dummy_request.POST.add('uploadfile', dummy_file)
    kt.upload()
    assert dummy_request.session.pop_flash('error') == ['Please select a file to upload.']  # noqa

    dummy_file.filename = 'file.txt'
    dummy_file.type = u'text/plain'
    res = kt.upload()
    assert res.status == '302 Found'
    assert res.location == 'http://example.com/title/@@kottibrowser'
    assert dummy_request.session.pop_flash('success') == [u'Successfully uploaded.']  # noqa
    assert isinstance(root.get(u'title'), File)

    dummy_file.file = image_asset
    dummy_file.filename = u'file.jpg'
    dummy_file.type = u'image/jpeg'
    res = kt.upload()

    assert res.status == '302 Found'
    assert res.location == 'http://example.com/title-1/@@kottibrowser'
    assert dummy_request.session.pop_flash('success') == [u'Successfully uploaded.']  # noqa
    assert isinstance(root.get(u'title-1'), Image)
