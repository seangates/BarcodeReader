'use strict';

var MarkoWidgetDemo = require('marko-widget-demo');
var recordCoverage = require('./tasks/record-coverage.js');

module.exports = function (grunt) {
    // Load the project's grunt tasks from a directory
    require('grunt-config-dir')(grunt, {
        configDir: require('path').join(__dirname, 'tasks')
    });

    // App tasks
    grunt.registerTask('lint', ['jshint', 'jscs', 'lesslint']);
    grunt.registerTask('unit-test', ['karma:test']);
    grunt.registerTask('coverage', ['karma:coverage', 'record-coverage']);

    grunt.registerTask('demo', 'Generate demo page', function () {
        var done = this.async();

        var widgetDemo = new MarkoWidgetDemo(__dirname);

        widgetDemo.generate({}, function (err) {
            grunt.log.oklns("Finished generating demo page with all data variations");
            done();
        });
    });

    grunt.registerTask('demo-html-lint', ['demo', 'htmllint']);
    grunt.registerTask('publish', ['exec:ebayui-publish']);

    grunt.registerTask('record-coverage', 'Add coverage number to package.json', function() {
        var done = this.async();
        recordCoverage(function(err) {
            if(err) {
                grunt.log.errorlns(err);
            } else {
                grunt.log.oklns('Coverage recorded in package.json');
            }
            done();
        });
    });



    grunt.registerTask('default', ['clean', 'lint', 'coverage', 'demo-html-lint']);

};
