'use strict';
require('marko/node-require').install();

var express = require('express');
var serveStatic = require('serve-static');
var lasso = require('lasso');
var testPage = require('./test-page.marko');

lasso.configure({
  plugins: [
    'lasso-less', // Allow Less files to be rendered to CSS
    'lasso-marko', // Allow Marko templates to be compiled and transported to the browser
    'lasso-require'
  ],
  outputDir: __dirname + '/static', // Place all generated JS/CSS/etc. files into the "static" dir
  bundlingEnabled: false, // Only enable bundling in production
  minify: false, // Only minify JS and CSS code in production
  fingerprintsEnabled: false // Only add fingerprints to URLs in production
});

var app = express();
app.use('/static', serveStatic(__dirname + '/static'));
app.get('/barcode-reader', function handler(req, res) {
  testPage.render({}, res);
});

app.listen(process.env.PORT || 8080, function() {
  console.log("Starting playground...");

  if (process.send) {
      process.send('online');
  }
});

module.exports = app;
