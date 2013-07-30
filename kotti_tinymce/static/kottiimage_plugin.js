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

    var imageScaleFactors = [
        {text: '1', value: [60, 120]},
        {text: '2', value: [160, 320]},
        {text: '3', value: [260, 520]},
        {text: '4', value: [360, 720]},
        {text: '5', value: [460, 920]},
        {text: '6', value: [560, 1120]},
        {text: '7', value: [660, 1320]},
        {text: '8', value: [760, 1520]},
        {text: '9', value: [860, 1720]},
        {text: '10', value: [960, 1920]},
        {text: '11', value: [1060, 2120]},
        {text: '12', value: [1160, 2320]}
    ];

    function generateScaleFactorTable() {
        var html = '';

        html = '<table role="presentation" class="mce-panel mce-grid mce-grid-border">';
        html += '<tr>';
        for (var factor=0; factor<imageScaleFactors.length; factor++) {
            html += '<td><a href="#" data-mce-index="' + factor + '"></a></td>';
        }
        html += '</tr>';
        html += '<tr>';
        for (factor=1; factor<imageScaleFactors.length+1; factor++) {
            html += '<td>' + factor + '</td>';
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
		var width, height, src, imageListCtrl;

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

		function onSubmitForm() {
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

		function updateSize() {
            console.log('in here');
			getImageSize(this.value(), function(data) {
                var closestFactor;

                console.log('data.width, data.height', data.width, data.height);

				if (data.width && data.height) {
					width = data.width;
					height = data.height;

                    // TODO: Add a contrainToSpans param?
                    //if (constrainToSpans) {
                    tinymce.each(imageScaleFactors, function(factor){
                        if (closestFactor === null || Math.abs(factor.value[0] - width) < Math.abs(closest - factor.value[0])) {
                            closestFactor = factor;
                        }
                    });
                    //}
                    
                    console.log('closestFactor', closestFactor);

                    if (width !== closestFactor.value[0] || height !== closestFactor.value[1]) {
					    win.find('#scalefactor').value([0, 0]);
                    } else {
					    win.find('#scalefactor').value(closestFactor.value);
                    }

					win.find('#width').value(width);
					win.find('#height').value(height);
				}
			});
		}

		width = dom.getAttrib(imgElm, 'width');
		height = dom.getAttrib(imgElm, 'height');

		src = dom.getAttrib(imgElm, 'src');
		if (src) {
            var parts = src.split('/');
            if (parts.length > 0) {
                var lastPart = parts[parts.length-1];
                if (lastPart && lastPart.substring(0, 5) == 'span') {
                    src = src.slice(0, src.lastIndexOf('span')) + 'span' + parseInt(lastPart.slice(4), 10);
                }
            }
        }

		if (imgElm.nodeName == 'IMG' && !imgElm.getAttribute('data-mce-object')) {
			data = {
				src: src,
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

		function buildImageScaleFactorItems() {
			var imageScaleFactorItems = [];

			tinymce.each(imageScaleFactors, function(factor) {
				imageScaleFactorItems.push({
					text: factor.text,
					value: factor.value,
					menu: factor.menu
				});
			});

			return imageScaleFactorItems;
		}

		// General settings shared between simple and advanced dialogs
		var generalFormItems = [
			{
                name: 'title',
                type: 'textbox',
                label: 'Title',
                tooltip: 'Every content item needs a title. For images, it can be the filename, or a more informative title.'
            },
			{
                name: 'alt',
                type: 'textbox',
                label: 'Description',
                tooltip: 'An image description, as with any content, can help for searching and identifying, for basic information.'
            },
			{
                name: 'src',
                type: 'filepicker',
                filetype: 'image',
                text: 'Upload/Pick',
                label: 'File',
                tooltip: 'An image content item is associated with an image file, which is uploaded to any location in the website via the button at right. Or, pick an existing image file.',
                autofocus: true,
                // TODO: How would updateSize be called?
                onchange: updateSize
            },
			imageListCtrl,
            {
                type: 'container',
                layout: 'flex',
                direction: 'row',
                align: 'center',
                spacing: 5,
                items: [
                    {type: 'label', text: 'Dimensions'},
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
                    {name: 'constrain', type: 'checkbox', checked: true, text: 'Keep proportions'},
                    {
                        type: 'panelbutton',
                        text: 'Scale',
                        popoverAlign: 'bc-tl',
                        //tooltip: 'Tne scale factor is tied to the number of spans, or layout columns, through which the image width extends.',
                        panel: {
                            // Adapted from table plugin.
                            type: 'panel',
                            html: generateScaleFactorTable(),

                            onmousemove: function(e) {
                                var target = e.target;

                                if (target.nodeName == 'A') {
                                    var table, pos, newImageSize;

                                    table = editor.dom.getParent(target, 'table');
                                    pos = parseInt(target.getAttribute('data-mce-index'), 10);

                                    if (pos != this.lastPos) {

                                        for (var factor=0; factor<imageScaleFactors.length; factor++) {
                                            editor.dom.toggleClass(
                                                table.rows[0].childNodes[factor].firstChild,
                                                'mce-active',
                                                factor <= pos
                                            );
                                        }

                                        newImageSize = imageScaleFactors[pos].value;

                                        table.nextSibling.innerHTML = '' + (pos + 1) + ' (fit within ' + newImageSize[0] + ' x ' + newImageSize[1] + ')';

                                        this.lastPos = pos;
                                    }
                                }
                            },

                            onmouseout: function(e) {
                                var target = e.target;

                                if (target.nodeName == 'A') {
                                    var table = editor.dom.getParent(target, 'table');

                                    for (var factor=0; factor<imageScaleFactors.length; factor++) {
                                        editor.dom.toggleClass(
                                            table.rows[0].childNodes[factor].firstChild,
                                            'mce-active',
                                            false
                                        );
                                    }

                                    table.nextSibling.innerHTML = 'No scale factor';

                                }
                            },

                            onclick: function(e) {
                                if (e.target.nodeName == 'A' && this.lastPos) {
                                    var srcCtrl, widthCtrl, heightCtrl, oldSrc, newImageDimensions, newSrc, newWidth, newHeight, target, pos;

                                    target = e.target;
                                    pos = parseInt(target.getAttribute('data-mce-index'), 10);

                                    e.preventDefault();

                                    srcCtrl = win.find('#src');
                                    widthCtrl = win.find('#width');
                                    heightCtrl = win.find('#height');

                                    oldSrc = srcCtrl.value();
                                    width = parseInt(widthCtrl.value(), 10);

                                    newImageScale = pos + 1;
                                    newImageSize = imageScaleFactors[pos].value;
                                    newSrc = oldSrc;

                                    if (oldSrc && newImageScale) {
                                        newSrc = oldSrc.split('/').slice(0, -1).join('/') + "/image/span" + newImageScale; 
                                        srcCtrl.value(newSrc);
                                        newWidth = newImageSize[0];
                                        newHeight = newImageSize[1];

                                        // Let width be primary; keep original aspect ratio.
                                        if (width !== 0) {
                                            newHeight = Math.round((newWidth / width) * newHeight);
                                        }

                                        widthCtrl.value(newImageSize[0]);
                                        heightCtrl.value(newImageSize[1]);
                                    }
                                }
                            }
                        }
                    }
                ]
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
				onSubmit: onSubmitForm
			});
		} else {
			// Simple default dialog
			win = editor.windowManager.open({
				title: 'Edit image',
				data: data,
				body: generalFormItems,
				onSubmit: onSubmitForm
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
