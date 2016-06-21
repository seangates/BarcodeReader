'use strict';

module.exports = BarcodeReader;

function BarcodeReader(config) {
    this.config = {
        scanCanvasWidth: config.scanCanvasWidth || 640,
        scanCanvasHeight: config.scanCanvasHeight || 480,
        multiple: config.multiple || false,
        decodeFormats: config.decodeFormats || ['Code128', 'Code93', 'Code39', 'EAN-13', '2Of5', 'Inter2Of5', 'Codabar'],
        forceUnique: config.forceUnique || true,
        localizationFeedback: config.localizationFeedback || false,
        skipOrientation: config.skipOrientation || false
    };

    this.LocalizationCallback = config.onLocalization || function () {};
    this.StreamCallback = config.onScan || function () {};

    this.ScanCanvas = this.FixCanvas(document.createElement('canvas'));
    this.ScanCanvas.width = this.config.scanCanvasWidth;
    this.ScanCanvas.height = this.config.scanCanvasHeight;
    this.ScanContext = this.ScanCanvas.getContext('2d');
}

BarcodeReader.prototype = {
    SupportedFormats: ['Code128', 'Code93', 'Code39', 'EAN-13', '2Of5', 'Inter2Of5', 'Codabar'], // Don't touch.
    ScanCanvas: null, // Don't touch the canvas either.
    ScanContext: null,
    SquashCanvas: document.createElement('canvas'),
    ImageCallback: null, // Callback for the decoding of an image.
    StreamCallback: null, // Callback for the decoding of a video.
    LocalizationCallback: null, // Callback for localization.
    Stream: null, // The actual video.
    DecodeStreamActive: false, // Will be set to false when StopStreamDecode() is called.
    Decoded: [], // Used to enfore the ForceUnique property.
    DecoderWorker: new Worker(URL.createObjectURL(new Blob([require('./decoder-worker')], { type: 'application/javascript' }))),
    OrientationCallback: null,

    // Value should be true or false.
    SetRotationSkip: function (value) {
        this.config.skipOrientation = value;
    },
    // Sets the callback function for the image decoding.
    SetImageCallback: function (callBack) {
        this.ImageCallback = callBack;
    },

    // Sets the callback function for the video decoding.
    SetStreamCallback: function (callBack) {
        this.StreamCallback = callBack;
    },

    // Sets the formats to decode, formats should be an array of a subset of the supported formats.
    SetDecodeFormats: function (formats) {
        this.config.decodeFormats = [];
        for (var i = 0; i < formats.length; i++) {
            if (this.SupportedFormats.indexOf(formats[i]) !== -1) {
                this.config.decodeFormats.push(formats[i]);
            }
        }
        if (this.config.decodeFormats.length === 0) {
            this.config.decodeFormats = this.SupportedFormats.slice();
        }
    },

    // Removes a list of formats from the formats to decode.
    SkipFormats: function (formats) {
        for (var i = 0; i < formats.length; i++) {
            var index = this.config.decodeFormats.indexOf(formats[i]);
            if (index >= 0) {
                this.config.decodeFormats.splice(index, 1);
            }
        }
    },

    // Adds a list of formats to the formats to decode.
    AddFormats: function (formats) {
        for (var i = 0; i < formats.length; i++) {
            if (this.SupportedFormats.indexOf(formats[i]) !== -1) {
                if (this.config.decodeFormats.indexOf(formats[i]) === -1) {
                    this.config.decodeFormats.push(formats[i]);
                }
            }
        }
    },

    // The callback function for image decoding used internally by this.
    BarcodeReaderImageCallback: function (e) {
        if (e.data.success === 'localization') {
            if (this.config.localizationFeedback) {
                this.LocalizationCallback(e.data.result);
            }
            return;
        }
        if (e.data.success === 'orientationData') {
            this.OrientationCallback(e.data.result);
            return;
        }
        var filteredData = [];
        for (var i = 0; i < e.data.result.length; i++) {
            if (this.Decoded.indexOf(e.data.result[i].Value) === -1 || this.config.forceUnique === false) {
                filteredData.push(e.data.result[i]);
                if (this.config.forceUnique) this.Decoded.push(e.data.result[i].Value);
            }
        }
        this.ImageCallback(filteredData);
        this.Decoded = [];
    },

    // The callback function for stream decoding used internally by this.
    BarcodeReaderStreamCallback: function (e) {
        if (e.data.success === 'localization') {
            if (this.config.localizationFeedback) {
                this.LocalizationCallback(e.data.result);
            }
            return;
        }
        if (e.data.success && this.DecodeStreamActive) {
            var filteredData = [];
            for (var i = 0; i < e.data.result.length; i++) {
                if (this.Decoded.indexOf(e.data.result[i].Value) === -1 || this.ForceUnique === false) {
                    filteredData.push(e.data.result[i]);
                    if (this.ForceUnique) this.Decoded.push(e.data.result[i].Value);
                }
            }
            if (filteredData.length > 0) {
                this.StreamCallback(filteredData);
            }
        }
        if (this.DecodeStreamActive) {
            this.ScanContext.drawImage(this.Stream, 0, 0, this.ScanCanvas.width, this.ScanCanvas.height);
            this.DecoderWorker.postMessage({
                scan: this.ScanContext.getImageData(0, 0, this.ScanCanvas.width, this.ScanCanvas.height).data,
                scanWidth: this.ScanCanvas.width,
                scanHeight: this.ScanCanvas.height,
                multiple: this.config.multiple,
                decodeFormats: this.config.decodeFormats,
                cmd: 'normal',
                rotation: 1,
            });

        }
        if (!this.DecodeStreamActive) {
            this.Decoded = [];
        }
    },

    // The image decoding function, image is a data source for an image or an image element.
    DecodeImage: function (image) {
        var img = new Image();

        if (image instanceof Image || image instanceof HTMLImageElement) {
            image.exifdata = false;
            if (image.complete) {
                if (this.config.skipOrientation) {
                    this.BarcodeReaderDecodeImage(image, 1, '');
                } else {
                    EXIF.getData(image, function (exifImage) {
                        var orientation = EXIF.getTag(exifImage, 'Orientation');
                        var sceneType = EXIF.getTag(exifImage, 'SceneCaptureType');
                        if (typeof orientation !== 'number') orientation = 1;
                        this.BarcodeReaderDecodeImage(exifImage, orientation, sceneType);
                    });
                }
            } else {
                img.onload = function () {
                    if (this.config.skipOrientation) {
                        this.BarcodeReaderDecodeImage(img, 1, '');
                    } else {
                        EXIF.getData(this, function (exifImage) {
                            var orientation = EXIF.getTag(exifImage, 'Orientation');
                            var sceneType = EXIF.getTag(exifImage, 'SceneCaptureType');
                            if (typeof orientation !== 'number') orientation = 1;
                            this.BarcodeReaderDecodeImage(exifImage, orientation, sceneType);
                        });
                    }
                };
                img.src = image.src;
            }
        } else {
            img.onload = function () {
                if (this.config.skipOrientation) {
                    this.BarcodeReaderDecodeImage(img, 1, '');
                } else {
                    EXIF.getData(this, function (exifImage) {
                        var orientation = EXIF.getTag(exifImage, 'Orientation');
                        var sceneType = EXIF.getTag(exifImage, 'SceneCaptureType');
                        if (typeof orientation !== 'number') orientation = 1;
                        this.BarcodeReaderDecodeImage(exifImage, orientation, sceneType);
                    });
                }
            };
            img.src = image;
        }
    },

    // Starts the decoding of a stream, the stream is a video not a blob i.e it's an element.
    DecodeStream: function (stream) {
        this.Stream = stream;
        this.DecodeStreamActive = true;
        this.DecoderWorker.onmessage = this.BarcodeReaderStreamCallback.bind(this);
        this.ScanContext.drawImage(stream, 0, 0, this.ScanCanvas.width, this.ScanCanvas.height);
        this.DecoderWorker.postMessage({
            scan: this.ScanContext.getImageData(0, 0, this.ScanCanvas.width, this.ScanCanvas.height).data,
            scanWidth: this.ScanCanvas.width,
            scanHeight: this.ScanCanvas.height,
            multiple: this.config.multiple,
            decodeFormats: this.config.decodeFormats,
            cmd: 'normal',
            rotation: 1,
        });
    },

    // Stops the decoding of a stream.
    StopStreamDecode: function () {
        this.DecodeStreamActive = false;
        this.Decoded = [];
    },

    BarcodeReaderDecodeImage: function (image, orientation, sceneCaptureType) {
        if (orientation === 8 || orientation === 6) {
            if (sceneCaptureType === 'Landscape' && image.width > image.height) {
                orientation = 1;
                this.ScanCanvas.width = 640;
                this.ScanCanvas.height = 480;
            } else {
                this.ScanCanvas.width = 480;
                this.ScanCanvas.height = 640;
            }
        } else {
            this.ScanCanvas.width = 640;
            this.ScanCanvas.height = 480;
        }
        this.DecoderWorker.onmessage = this.BarcodeReaderImageCallback;
        this.ScanContext.drawImage(image, 0, 0, this.ScanCanvas.width, this.ScanCanvas.height);
        this.Orientation = orientation;
        this.DecoderWorker.postMessage({
            scan: this.ScanContext.getImageData(0, 0, this.ScanCanvas.width, this.ScanCanvas.height).data,
            scanWidth: this.ScanCanvas.width,
            scanHeight: this.ScanCanvas.height,
            multiple: this.config.multiple,
            decodeFormats: this.config.decodeFormats,
            cmd: 'normal',
            rotation: orientation,
            postOrientation: this.PostOrientation
        });
    },

    DetectVerticalSquash: function (img) {
        var ih = img.naturalHeight;
        var canvas = this.SquashCanvas;
        var alpha;
        var data;
        canvas.width = 1;
        canvas.height = ih;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
            data = ctx.getImageData(0, 0, 1, ih).data;
        } catch (err) {
            console.log('Cannot check verticalSquash: CORS?');
            return 1;
        }
        var sy = 0;
        var ey = ih;
        var py = ih;
        while (py > sy) {
            alpha = data[(py - 1) * 4 + 3];
            if (alpha === 0) {
                ey = py;
            } else {
                sy = py;
            }
            py = (ey + sy) >> 1;
        }
        var ratio = (py / ih);
        return (ratio === 0) ? 1 : ratio;
    },

    FixCanvas: function (canvas) {
        var ctx = canvas.getContext('2d');
        var drawImage = ctx.drawImage;
        ctx.drawImage = function (img, sx, sy, sw, sh, dx, dy, dw, dh) {
            var vertSquashRatio = 1;
            if (!!img && img.nodeName === 'IMG') {
                vertSquashRatio = this.DetectVerticalSquash(img);
                // sw || (sw = img.naturalWidth);
                // sh || (sh = img.naturalHeight);
            }
            if (arguments.length === 9)
                drawImage.call(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
            else if (typeof sw !== 'undefined')
                drawImage.call(ctx, img, sx, sy, sw, sh / vertSquashRatio);
            else
                drawImage.call(ctx, img, sx, sy);
        };
        return canvas;
    }
};
