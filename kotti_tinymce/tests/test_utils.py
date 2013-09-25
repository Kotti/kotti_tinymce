# -*- coding: utf-8 -*-
from kotti_tinymce.utils import get_theme


def test_get_theme_failed():
    """Get theme if there is no "theme" key"""
    options = '"first_option": "first_value", "second_option": "second_value"'
    assert get_theme(options) == "modern"


def test_get_theme_defaults():
    """Get theme if it's one of the defaults (None, "simple", "advanced")"""
    options1 = ('"first_option": "first_value", "theme": None, '
                '"second_option": "second_value"')
    options2 = ('"first_option": "first_value", "theme": "simple", '
                '"second_option": "second_value"')
    options3 = ('"first_option": "first_value", "theme": "advanced", '
                '"second_option": "second_value"')
    assert get_theme(options1) == "modern"
    assert get_theme(options2) == "modern"
    assert get_theme(options3) == "modern"


def test_get_theme_custom():
    """Get theme if we have a custom value"""
    options = ('"first_option": "first_value", "theme": "custom", '
               '"second_option": "second_value"')
    assert get_theme(options) == "custom"
