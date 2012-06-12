import json

from kotti.resources import get_root
from kotti.resources import Content
from kotti.testing import UnitTestBase
from pyramid.testing import DummyRequest


class TestBase(UnitTestBase):
    def setUp(self):
        super(TestBase, self).setUp()
        self.root = get_root()
        self.page = self.root['about'] = Content()


class GetSettings(TestBase):
    def call(self, context):
        from kotti_tinymce.settings import get_settings_json
        request = DummyRequest()
        request.context = context
        return json.loads(get_settings_json(request))

    def test_root(self):
        value = self.call(self.root)
        assert value['document_base_url'] == 'http://example.com'

    def test_subpage(self):
        value = self.call(self.page)
        assert value['document_base_url'] == 'http://example.com/about/'


class JSONDetails(TestBase):
    def call(self, context):
        from kotti_tinymce import jsondetails
        request = DummyRequest()
        return jsondetails(context, request)

    def test_root(self):
        value = self.call(self.root)
        assert value['url'] == 'http://example.com/'

    def test_subpage(self):
        value = self.call(self.page)
        assert value['url'] == 'http://example.com/about/'
