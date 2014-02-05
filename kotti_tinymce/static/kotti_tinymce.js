(function() {

  window.kottibrowser = function(field_name, url, type, win) {
    var kotti_url;
    if (window.kotti_context_url) {
      kotti_url = kotti_context_url + '@@kottibrowser';
    } else {
      kotti_url = window.location.toString();
      kotti_url = kotti_url.replace(/@@edit/, "@@kottibrowser");
      kotti_url = kotti_url.replace(/add_document/, "@@kottibrowser");
    }
    if (kotti_url.indexOf("?") < 0) {
      kotti_url = kotti_url + "?type=" + type;
    } else {
      kotti_url = kotti_url + "&type=" + type;
    }
    tinymce.activeEditor.windowManager.open({
      title: "Kotti Browser",
      url: kotti_url,
      width: 800,
      height: 600,
      resizable: "yes"
    },
    {
      window: win,
      input: field_name,
      oninsert: function(url) {
        win.document.getElementById(field_name).value = url;
      }
    });
  };

  window.kottibrowserdialog = {

    init: function() {
        // Did have image_scale change function here. Now this handling is in
        // kottiimage_plugin.js.
    },

    submit: function() {
      var url, win;
      var args = top.tinymce.activeEditor.windowManager.getParams();
      url = $("#kottibrowser_form input#url").val();
      win = args.window;

      // NOTE: This does not fire an onchange event:
      filepicker = win.document.getElementById(args.input);
      filepicker.value = url;

      // So force-fire one. (TODO: Is this a hacky way, or a correct way?).
      // See http://www.tinymce.com/forum/viewtopic.php?id=31358.
      var evt = win.document.createEvent("HTMLEvents");
      evt.initEvent("change", false, true);
      filepicker.dispatchEvent(evt);

      top.tinymce.activeEditor.windowManager.close();
    }
  };

}).call(this);
