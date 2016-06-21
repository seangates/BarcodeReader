/* global $, document */
'use strict';
var $ = require('jquery');
var chai = require('chai');
var expect = chai.expect;
var dataMockOne = require('./mock-data').variationOne;
var dataMockTwo = require('./mock-data').variationTwo;
var widget = require('../index');

/**
 *
 * @param dataModel
 * @returns {MarkoWidget} instance
 */
function renderWidget(dataModel) {
    return widget
        .render(dataModel)
        .appendTo(document.body)
        .getWidget();
}

describe('barcode-reader test suite', function suite() {
    var widget;

    afterEach(function fn() {
        widget.destroy();
    });
    it('[barcode-reader] variation one should render to html', function () {
        widget = renderWidget(dataMockOne);

        var innerText = $('.barcode-reader-wrapper .innerText').text().trim();
        expect(innerText).to.equal('yo mon - variation one!');
    });
    it('[barcode-reader] variation two should render to html', function () {
        widget = renderWidget(dataMockTwo);

        var innerText = $('.barcode-reader-wrapper .innerText').text().trim();
        expect(innerText).to.equal('yo mon - variation two!');
    });
    it('[barcode-reader] should render nested content', function () {
        widget = renderWidget(dataMockTwo);

        var $wrapper = $('.barcode-reader-wrapper');
        var innerText = $wrapper.find('.nested-content').text().trim();
        expect(innerText).to.equal('Component nested content');
    });
    it('[barcode-reader] should have yo-mon class (testing options)', function () {
        widget = renderWidget(dataMockOne);

        var hasClass = $('.barcode-reader-wrapper').hasClass('yo-mon');
        expect(hasClass).to.be.true;
    });
});