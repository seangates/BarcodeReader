'use strict';
var path = require('path');
var fse = require('fs-extra');
var glob = require('glob');
var pathToJson = path.resolve('./package.json');

// Add a note to the component's package.json file to record the last code coverage number.
module.exports = function recordCoverage(callback) {
    fse.readJson(pathToJson, function(err, packageObj) {
        if (err) {
            callback(err);
            return;
        }
        updateCoverage(packageObj, callback);
    });
};

function updateCoverage(packageObj, callback) {
    glob(path.join('.coverage', 'json', 'PhantomJS *', 'coverage-final.json'), function(err, matches) {
        if (err) {
            console.log(err);
            writeCoverage(packageObj, 0, callback);
            return;
        }
        if (matches.length > 0) {
            fse.readJson(matches[0], function(err, coverageObj) {
                if (err) {
                    console.log(err);
                    writeCoverage(packageObj, 0, callback);
                    return;
                }
                calculateCoverage(packageObj, coverageObj, callback);
            });
        } else {
            calculateCoverage(packageObj, {}, callback);
        }
    });
}

function calculateCoverage(packageObj, coverageObj, callback) {
    var numberOfLines = 0,
        linesCovered = 0,
        pageData = coverageObj[Object.keys(coverageObj)[0]], // get the top page data... probably
        lines = {},
        coverage = 0;
    if (pageData) {
        lines = pageData.l || {};
    }
    for (var line in lines) {
        numberOfLines++;
        if (lines[line] !== 0) {
            linesCovered++;
        }
    }
    if (numberOfLines) {
        coverage = Math.floor(linesCovered / numberOfLines * 100);
    }
    writeCoverage(packageObj, coverage, callback);
}

function writeCoverage(packageObj, coverage, callback) {
    packageObj.ebayui = packageObj.ebayui || {};
    packageObj.ebayui.coverage = coverage;
    console.log('Lines covered: ' + coverage);
    fse.writeJson(pathToJson, packageObj, callback);
}

