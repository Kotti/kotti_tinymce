/**
 *
 * kottiimage_plugin.js
 *
 * Copyright, Kotti Team
 * Released under BSD License.
 *
 */

/*global tinymce:true */

tinymce.PluginManager.add('kottiimage', function(editor) {

    // TODO: On Kotti startup, read from views/image.py or from config.
    var imageScales = [
        {number: 1, text: 'span1', value: [60, 120]},
        {number: 2, text: 'span2', value: [160, 320]},
        {number: 3, text: 'span3', value: [260, 520]},
        {number: 4, text: 'span4', value: [360, 720]},
        {number: 5, text: 'span5', value: [460, 920]},
        {number: 6, text: 'span6', value: [560, 1120]},
        {number: 7, text: 'span7', value: [660, 1320]},
        {number: 8, text: 'span8', value: [760, 1520]},
        {number: 9, text: 'span9', value: [860, 1720]},
        {number: 10, text: 'span10', value: [960, 1920]},
        {number: 11, text: 'span11', value: [1060, 2120]},
        {number: 12, text: 'span12', value: [1160, 2320]}
    ];

    function generateImageScaleTable() {
        var html = '';

        html = '<table role="presentation" class="mce-panel mce-grid mce-grid-border">';
        html += '<tr>';
        for (var scale=0; scale<imageScales.length; scale++) {
            html += '<td><a href="#" data-mce-index="' + scale + '">' + (scale + 1) + '</a></td>';
        }
        html += '</tr>';
        html += '</table>';

        html += '<div class="mce-text-center">No Scaling</div>';

        return html;
    }

    function getImageSize(url, callback) {
        var img = document.createElement('img');

        function done(width, height) {
            img.parentNode.removeChild(img);
            callback({width: width, height: height});
        }

        img.onload = function() {
            done(img.clientWidth, img.clientHeight);
        };

        img.onerror = function() {
            done();
        };

        img.src = url;

        var style = img.style;
        style.visibility = 'hidden';
        style.position = 'fixed';
        style.bottom = style.left = 0;
        style.width = style.height = 'auto';

        document.body.appendChild(img);
    }

    function createImageList(callback) {
        return function() {
            var imageList = editor.settings.image_list;

            if (typeof(imageList) == "string") {
                tinymce.util.XHR.send({
                    url: imageList,
                    success: function(text) {
                        callback(tinymce.util.JSON.parse(text));
                    }
                });
            } else {
                callback(imageList);
            }
        };
    }

    function showDialog(imageList) {
        var win, data, dom = editor.dom, imgElm = editor.selection.getNode();
        var width, height, imageListCtrl;

        function buildImageList() {
            var linkImageItems = [{text: 'None', value: ''}];

            tinymce.each(imageList, function(link) {
                linkImageItems.push({
                    text: link.text || link.title,
                    value: link.value || link.url,
                    menu: link.menu
                });
            });

            return linkImageItems;
        }

        function recalcSize(e) {
            var widthCtrl, heightCtrl, newWidth, newHeight;

            widthCtrl = win.find('#width')[0];
            heightCtrl = win.find('#height')[0];

            newWidth = widthCtrl.value();
            newHeight = heightCtrl.value();

            if (win.find('#constrain')[0].checked() && width && height && newWidth && newHeight) {
                if (e.control == widthCtrl) {
                    newHeight = Math.round((newWidth / width) * newHeight);
                    heightCtrl.value(newHeight);
                } else {
                    newWidth = Math.round((newHeight / height) * newWidth);
                    widthCtrl.value(newWidth);
                }
            }

            width = newWidth;
            height = newHeight;
        }

        function addImageScaleToURL(src, imageScale) {
            var parts, lastPart, parsedScale, penultimatePart, newURL;

            newURL = '';

            if (src[-1] === '/') {
                src = src.slice(0, -1);
            }

            if (src) {
                parts = src.split('/');

                if (parts.length > 2) {
                    lastPart = parts[parts.length-1];

                    if (lastPart.substring(0, 4) === 'span') {
                        parsedScale = parseInt(lastPart.slice(4), 10);
                        if (parsedScale === imageScale) {
                            newURL = src;
                        } else {
                            newURL = parts.slice(0, -1).join('/') + '/span' + imageScale;
                        }
                    } else if (lastPart === 'image') {
                        newURL = src + '/span' + imageScale;
                    }
                } else {
                    // Attempt to tag it on the end.
                    newURL = src + '/image/span' + imageScale;
                }
            }

            return newURL;
        }

        function setImage() {
            function waitLoad(imgElm) {
                function selectImage() {
                    imgElm.onload = imgElm.onerror = null;
                    editor.selection.select(imgElm);
                    editor.nodeChanged();
                }

                imgElm.onload = function() {
                    if (!data.width && !data.height) {
                        dom.setAttribs(imgElm, {
                            width: imgElm.clientWidth,
                            height: imgElm.clientHeight
                        });
                    }

                    selectImage();
                };

                imgElm.onerror = selectImage;
            }

            var data = win.toJSON();

            if (data.width === '') {
                data.width = null;
            }

            if (data.height === '') {
                data.height = null;
            }

            if (data.style === '') {
                data.style = null;
            }

            data = {
                src: data.src,
                alt: data.alt,
                width: data.width,
                height: data.height,
                style: data.style
            };

            if (!imgElm) {
                data.id = '__mcenew';
                editor.insertContent(dom.createHTML('img', data));
                imgElm = dom.get('__mcenew');
                dom.setAttrib(imgElm, 'id', null);
            } else {
                dom.setAttribs(imgElm, data);
            }

            waitLoad(imgElm);
        }

        function removePixelSuffix(value) {
            if (value) {
                value = value.replace(/px$/, '');
            }

            return value;
        }

        function closestImageScale(width, height) {
            var closestScale;

            if (width < 60) {
                return closestScale;
            }

            tinymce.each(imageScales, function(scale) {
                if (closestScale) {
                    if (Math.abs(scale.value[0] - width) < Math.abs(closestScale.value[0] - width)) {
                        closestScale = scale;
                    }
                } else {
                    closestScale = scale;
                }
            });

            return closestScale;
        }

        function makeImageScaleLabel(src, imageScale) {
            var parts, label;

            if (src) {

                if (src.match(/image$/)) {
                    label = 'Current Size: Original';
                } else if (imageScale && imageScale > 0 && imageScale < imageScales.length + 1) {
                    label = 'Current Size: ' + imageScale;
                } else {
                    // We were passed a src, but no imageScale, so parse imageScale from src.

                    parts = src.split('/');

                    if (parts.length > 0) {
                        var lastPart = parts[parts.length-1];
                        if (lastPart && lastPart.substring(0, 4) === 'span') {
                            var scale = parseInt(lastPart.slice(4), 10);
                            if (scale) {
                                label = 'Current Size: ' + scale;
                            } else {
                                label = 'Current Size: None';
                            }
                        } else if (lastPart === 'image') {
                            label = 'Current Size: Original';
                        }
                    } else {
                        label = '';
                    }
                }
            } else {
                if (global_src) {
                    return makeImageScaleLabel(global_src);
                } else {
                    label = 'CurrentSize: No image selected';
                }
            }

            return label;
        }

        function imageSourceChanged() {
            getImageSize(this.value(), function(data) {
                var src, closestScale;

                if (data.width && data.height) {

                    win.find('#width').value(data.width);
                    win.find('#height').value(data.height);

                    src = win.find('#src').value();

                    closestScale = closestImageScale(data.width, data.height);

                    if (closestScale) {
                        win.find('#image_scale_label').text(makeImageScaleLabel(src, closestScale.number));
                    } else {
                        win.find('#image_scale_label').text(makeImageScaleLabel(src));
                    }
                } else {
                    win.find('#width').value('');
                    win.find('#height').value('');
                    win.find('#image_scale_label').text('');
                }
            });
        }

        width = dom.getAttrib(imgElm, 'width');
        height = dom.getAttrib(imgElm, 'height');
        global_src = dom.getAttrib(imgElm, 'src');

        if (imgElm.nodeName == 'IMG' && !imgElm.getAttribute('data-mce-object')) {
            data = {
                src: dom.getAttrib(imgElm, 'src'),
                alt: dom.getAttrib(imgElm, 'alt'),
                width: width,
                height: height
            };
        } else {
            imgElm = null;
        }

        if (imageList) {
            imageListCtrl = {
                name: 'target',
                type: 'listbox',
                label: 'Image list',
                values: buildImageList(),
                onselect: function(e) {
                    var altCtrl = win.find('#alt');

                    if (!altCtrl.value() || (e.lastControl && altCtrl.value() == e.lastControl.text())) {
                        altCtrl.value(e.control.text());
                    }

                    win.find('#src').value(e.control.value());
                }
            };
        }

        function buildImageImageScaleItems() {
            var imageImageScaleItems = [];

            tinymce.each(imageScales, function(scale) {
                imageImageScaleItems.push({
                    text: scale.text,
                    value: scale.value,
                    menu: scale.menu
                });
            });

            return imageImageScaleItems;
        }

        function scaleImagePanelButton() {
            return {
                type: 'panelbutton',
                text: 'Change Size',
                popoverAlign: 'bc-tl',
                panel:
                {
                    // Adapted from table plugin.
                    type: 'panel',
                    html: generateImageScaleTable(),

                    onmousemove: function(e) {
                        var target = e.target;

                        if (target.nodeName == 'A') {
                            var table, pos, newImageSize;

                            table = editor.dom.getParent(target, 'table');
                            pos = parseInt(target.getAttribute('data-mce-index'), 10);

                            if (pos != this.lastPos) {

                                for (var scale=0; scale<imageScales.length; scale++) {
                                    editor.dom.toggleClass(
                                        table.rows[0].childNodes[scale].firstChild,
                                        'mce-active',
                                        scale <= pos
                                    );
                                }

                                newImageSize = imageScales[pos].value;

                                table.nextSibling.innerHTML = '' + (pos + 1) + ' (fit within ' + newImageSize[0] + ' x ' + newImageSize[1] + ')';

                                this.lastPos = pos;
                            }
                        }
                    },

                    onmouseout: function(e) {
                        var target = e.target;

                        if (target.nodeName == 'A') {
                            var table = editor.dom.getParent(target, 'table');

                            for (var scale=0; scale<imageScales.length; scale++) {
                                editor.dom.toggleClass(
                                    table.rows[0].childNodes[scale].firstChild,
                                    'mce-active',
                                    false
                                );
                            }

                            table.nextSibling.innerHTML = 'No scale';

                        }
                    },

                    onclick: function(e) {
                        //if (e.target.nodeName == 'A' && this.lastPos) {
                        if (e.target.nodeName == 'A') {
                            var srcCtrl, scaleLabelCtrl, widthCtrl, heightCtrl;
                            var oldSrc, newImageDimensions, newSrc;
                            var newWidth, newHeight, target, pos;

                            target = e.target;
                            pos = parseInt(target.getAttribute('data-mce-index'), 10);

                            e.preventDefault();

                            srcCtrl = win.find('#src');
                            scaleLabelCtrl = win.find('#image_scale_label');
                            widthCtrl = win.find('#width');
                            heightCtrl = win.find('#height');

                            oldSrc = srcCtrl.value();
                            width = parseInt(widthCtrl.value(), 10);
                            height = parseInt(heightCtrl.value(), 10);

                            newImageScale = pos + 1;
                            newImageSize = imageScales[pos].value;
                            newSrc = oldSrc;

                            if (oldSrc && newImageScale) {
                                newSrc = addImageScaleToURL(oldSrc, newImageScale);
                                srcCtrl.value(newSrc);
                                newWidth = newImageSize[0];
                                newHeight = newImageSize[1];

                                // Let width be primary; keep original aspect ratio.
                                if (width !== 0) {
                                    newHeight = Math.round((newWidth / width) * height);
                                }
                                widthCtrl.value(newImageSize[0]);
                                heightCtrl.value(newHeight);

                                console.log('setting image size', oldSrc, newSrc, newImageScale);
                                scaleLabelCtrl.text(makeImageScaleLabel(newSrc, newImageScale));
                            }

                            if (win.find('#show_preview')[0].checked()) {
                                setImage();
                            }

                            this.hide();
                        }
                    }
                }
            };
        }

        // General settings shared between simple and advanced dialogs
        var generalFormItems = [
            {
                name: 'src',
                type: 'filepicker',
                label: 'Image Source',
                tooltip: 'An image content item is associated with an image file. Upload a new one, or pick an existing image file.',
                filetype: 'image',
                autofocus: true,
                onchange: imageSourceChanged
            },
            imageListCtrl,
            {
                type: 'formitem',
                align: 'center',
                spacing: 5,
                label: 'Image Size',
                items: [
                    {
                        type: 'panel',
                        layout: 'flex',
                        direction: 'column',
                        align: 'center',
                        spacing: 5,
                        items: [
                            {
                                type: 'container',
                                layout: 'flex',
                                direction: 'row',
                                align: 'center',
                                pack: 'start',
                                spacing: 5,
                                items: [
                                    scaleImagePanelButton(),
                                    {
                                        type: 'label',
                                        name: 'image_scale_label',
                                        tooltip: 'Size choices (1-12) are relative to the maximum width.',
                                        text: makeImageScaleLabel()
                                    }
                                ]
                            },
                            {
                                type: 'container',
                                layout: 'flex',
                                direction: 'row',
                                align: 'center',
                                spacing: 5,
                                items: [
                                    {
                                        type: 'label',
                                        text: 'Width and Height',
                                        tooltip: 'Optionally, set width and size directly.'
                                    },
                                    {
                                        name: 'width',
                                        tooltip: 'In pixels. Use integer number.',
                                        type: 'textbox',
                                        maxLength: 3,
                                        size: 3,
                                        onchange: recalcSize
                                    },
                                    {type: 'label', text: 'x'},
                                    {
                                        name: 'height',
                                        tooltip: 'In pixels. Use integer number.',
                                        type: 'textbox',
                                        maxLength: 3,
                                        size: 3,
                                        onchange: recalcSize
                                    },
                                    {
                                        name: 'constrain',
                                        type: 'checkbox',
                                        checked: true,
                                        tooltip: 'Do not distort -- keep original proportions.',
                                        text: "Keep aspect ratio"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                name: 'show_preview',
                type: 'checkbox',
                checked: true,
                tooltip: 'Show live preview of image in the edit window.',
                text: "Show Preview"
            }
        ];

        function updateStyle() {
            function addPixelSuffix(value) {
                if (value.length > 0 && (/^[0-9]+$/).test(value)) {
                    value += 'px';
                }

                return value;
            }

            var data = win.toJSON();
            var css = dom.parseStyle(data.style);

            delete css.margin;
            css['margin-top'] = css['margin-bottom'] = addPixelSuffix(data.vspace);
            css['margin-left'] = css['margin-right'] = addPixelSuffix(data.hspace);
            css['border-width'] = addPixelSuffix(data.border);

            win.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
        }

        if (editor.settings.image_advtab) {
            // Parse styles from img
            if (imgElm) {
                data.hspace = removePixelSuffix(imgElm.style.marginLeft || imgElm.style.marginRight);
                data.vspace = removePixelSuffix(imgElm.style.marginTop || imgElm.style.marginBottom);
                data.border = removePixelSuffix(imgElm.style.borderWidth);
                data.style = editor.dom.serializeStyle(editor.dom.parseStyle(editor.dom.getAttrib(imgElm, 'style')));
            }

            // Advanced dialog shows general+advanced tabs
            win = editor.windowManager.open({
                title: 'Insert/edit image',
                data: data,
                bodyType: 'tabpanel',
                body: [
                    {
                        title: 'General',
                        type: 'form',
					    padding: 20,
					    labelGap: 30,
					    spacing: 10,
                        items: generalFormItems
                    },

                    {
                        title: 'Advanced',
                        type: 'form',
                        pack: 'start',
                        items: [
                            {
                                label: 'Style',
                                name: 'style',
                                type: 'textbox'
                            },
                            {
                                label: 'Alt text',
                                name: 'alt',
                                type: 'textbox'
                            },
                            {
                                type: 'form',
                                layout: 'grid',
                                packV: 'start',
                                columns: 2,
                                padding: 0,
                                alignH: ['left', 'right'],
                                defaults: {
                                    type: 'textbox',
                                    maxWidth: 50,
                                    onchange: updateStyle
                                },
                                items: [
                                    {label: 'Vertical space', name: 'vspace'},
                                    {label: 'Horizontal space', name: 'hspace'},
                                    {label: 'Border', name: 'border'}
                                ]
                            }
                        ]
                    }
                ],
                onSubmit: setImage
            });
        } else {
            // Simple default dialog
            win = editor.windowManager.open({
                title: 'Edit image',
                data: data,
                body: generalFormItems,
                onSubmit: setImage
            });
        }
    }

    editor.addButton('image', {
        icon: 'image',
        tooltip: 'Insert/edit image',
        onclick: createImageList(showDialog),
        stateSelector: 'img:not([data-mce-object])'
    });

    editor.addMenuItem('image', {
        icon: 'image',
        text: 'Insert image',
        onclick: createImageList(showDialog),
        context: 'insert',
        prependToContext: true
    });
});
