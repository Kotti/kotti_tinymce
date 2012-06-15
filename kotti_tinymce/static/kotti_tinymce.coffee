# see http://www.tinymce.com/wiki.php/How-to_implement_a_custom_file_browser

window.kottibrowser = (field_name, url, type, win) ->

  # console.log "field_name: #{field_name}"
  # console.log "url: #{url}"
  # console.log "type: #{type}"
  # console.log "win: #{win}"

  kotti_url = window.location.toString()
  # console.log "kotti_url: #{kotti_url}"

  kotti_url = kotti_url.replace /@@edit/, "@@kottibrowser"
  kotti_url = kotti_url.replace /add_document/, "@@kottibrowser"
  # console.log "kotti_url: #{kotti_url}"

  if kotti_url.indexOf("?") < 0
    kotti_url = kotti_url + "?type=" + type
  else
    kotti_url = kotti_url + "&type=" + type

  # console.log "kotti_url: #{kotti_url}"

  tinyMCE.activeEditor.windowManager.open
    file: kotti_url
    title: "Kotti Browser"
    width: 800
    height: 600
    resizable: "yes"
    inline: "yes"
    popup_css: false,
    close_previous: "no"
  ,
    window: win
    input: field_name

  false

window.kottibrowserdialog =

  init: ->
    # console.log "kottibrowserdialog.init"
    $("select[name=image_scale]").change ->
      image_scale_url = "#{image_url}/#{$(this).val()}"
      $("#kottibrowser_image_preview").attr("src", image_scale_url)
      $("input[name=url]").val image_scale_url

  submit: ->
    url = $("#kottibrowser_form input#url").val()
    win = tinyMCEPopup.getWindowArg("window")
    win.document.getElementById(tinyMCEPopup.getWindowArg("input")).value = url
    unless typeof (win.ImageDialog) is "undefined"
      win.ImageDialog.getImageData()  if win.ImageDialog.getImageData
      win.ImageDialog.showPreviewImage url  if win.ImageDialog.showPreviewImage
    tinyMCEPopup.close()

tinyMCEPopup.onInit.add(kottibrowserdialog.init, kottibrowserdialog);
