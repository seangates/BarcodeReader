'use strict';

module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),

    getInitialState: function (input) {
        return {
            streaming: false
        };
    },

    getTemplateData: function (state) {
        return {
            streaming: state.streaming
        };
    },

    canvas: null,
    ctx: null,
    video: null,
    stream: null,
    localized: [],
    position: {},

    init: function () {
        var BarcodeReader = require('./barcode-reader');

        this.BarcodeReader = new BarcodeReader({
            scanCanvasWidth: 1280,
            scanCanvasHeight: 720,
            localizationFeedback: true,
            onLocalization: function (localized) {
                this.localized = localized;
            }.bind(this),
            onScan: function (barCodes) {
                if (barCodes.length > 0) {
                    this.stream.getTracks()[0].stop();
                    this.BarcodeReader.StopStreamDecode();
                    this.emit('readBarCodes', barCodes);
                    this.setState('streaming', false);
                    console.table(barCodes);
                }
            }.bind(this)
        });
    },

    draw: function () {
        var self = this;

        try {
            self.ctx.drawImage(self.video, 0, 0);

            if (self.localized.length > 0) {
                self.ctx.beginPath();
                self.ctx.lineWIdth = '2';
                self.ctx.strokeStyle = 'red';
                self.localized.forEach(function (localizedItem) {
                    self.ctx.rect(localizedItem.x, localizedItem.y, localizedItem.width, localizedItem.height);
                }.bind(this));
                self.ctx.stroke();
            }

            setTimeout(self.draw.bind(this), 20);
        } catch (e) {
            if (e.name === 'NS_ERROR_NOT_AVAILABLE') {
                setTimeout(self.draw.bind(this), 20);
            } else {
                throw e;
            }
        }
    },

    initBarcodeReader: function () {
        this.once('update', function () {
            this.canvas = this.el.getElementsByTagName('canvas')[0];
            this.ctx = this.canvas.getContext('2d');
            this.video = document.createElement('video');

            var n = navigator;

            n.getUserMedia = (n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia || n.msGetUserMedia);

            if (n.getUserMedia) {
                n.getUserMedia({
                        video: {
                            optional: [
                                { minWidth: 1280 }
                            ]
                        }
                    },
                    function (localMediaStream) {
                        this.stream = localMediaStream;
                        this.video.src = window.URL.createObjectURL(localMediaStream);
                        this.video.onloadedmetadata = function (e) {
                            console.log('video loaded', this.video.videoWidth, this.video.videoHeight);
                            this.video.play();
                            this.draw();
                            this.BarcodeReader.DecodeStream(this.video);
                        }.bind(this);
                    }.bind(this),
                    function (err) {
                        console.log('The following error occured: ' + err);
                    }
                );
            } else {
                console.log('getUserMedia not supported');
            }
        }.bind(this));

        this.setState('streaming', true);
    }
});
