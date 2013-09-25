# -*- coding: utf-8 -*-
from json import loads


def get_theme(tinymce_options):
    """
    Get the value of "theme" key out of tinymce_options. tinymce_options looks
    like a dictionary of items, but without the opening '{' and closing '}'.

    :param    tinymce_options: Options for tinymce
    :type     tinymce_options: String

    :returns: Value for "theme" key
    :rtype:   String
    """
    theme = None
    try:
        theme = loads("{" + tinymce_options + "}")["theme"]
    except:
        pass
    return "modern" if theme in [None, "advanced", "simple"] else theme
