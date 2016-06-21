'use strict';

module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),

    getInitialState: function (input) {
        return {
            barcode: null
        };
    },

    getTemplateData: function (state) {
        return {
            barcode: state.barcode
        };
    },

    startScanning: function () {
        this.getWidget('reader').emit('startScanning');
    },

    readBarCode: function (barcode) {
        this.setState('barcode', barcode);
    }
});
