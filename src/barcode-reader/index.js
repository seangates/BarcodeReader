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

    stream: null,

    init: function () {
        var BarcodeReader = require('./barcode-reader');

        this.BarcodeReader = new BarcodeReader({
            scanCanvasWidth: 1280,
            scanCanvasHeight: 720,
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

        this.on('startScanning', this.startScanning.bind(this));
    },

    startScanning: function () {
        this.once('update', function () {
            var video = this.getEl('video');
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
                        video.src = window.URL.createObjectURL(localMediaStream);
                        video.onloadedmetadata = function (e) {
                            console.log('video loaded', video.videoWidth, video.videoHeight);
                            video.play();
                            this.BarcodeReader.DecodeStream(video);
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
