(function() {

  window.kottibrowser = function(field_name, url, type, win) {
    var kotti_url;
    kotti_url = window.location.toString();
    kotti_url = kotti_url.replace(/@@edit/, "@@kottibrowser");
    kotti_url = kotti_url.replace(/add_document/, "@@kottibrowser");
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
    },
    submit: function() {
      var url, win;
      var args = top.tinymce.activeEditor.windowManager.getParams();
      url = $("#kottibrowser_form input#url").val();
      win = args.window;
      win.document.getElementById(args.input).value = url;
      if (typeof win.ImageDialog !== "undefined") {
        if (win.ImageDialog.getImageData) {
          win.ImageDialog.getImageData();
        }
        if (win.ImageDialog.showPreviewImage) {
          win.ImageDialog.showPreviewImage(url);
        }
      }
      top.tinymce.activeEditor.windowManager.close();
    }
  };

}).call(this);
