'use strict';

require('marko/node-require').install();

var express = require('express');
var serveStatic = require('serve-static');
var lasso = require('lasso');
var testPage = require('./test-page.marko');

lasso.configure({
    plugins: [
        'lasso-less',
        'lasso-marko',
        'lasso-autoprefixer'
    ],
    outputDir: __dirname + '/static',
    bundlingEnabled: false,
    minify: false,
    fingerprintsEnabled: false
});

var app = express();

app.use('/static', serveStatic(__dirname + '/static'));
app.get('/barcode-reader', function handler(req, res) {
    testPage.render({}, res);
});

app.listen(process.env.PORT || 8080, function () {
    console.log("Starting playground...");

    if (process.send) {
        process.send('online');
    }
});

module.exports = app;
