'use strict';

module.exports = function clean(grunt) {
    grunt.loadNpmTasks('grunt-contrib-clean');
    return {
        test: {
            src: [
                './*.marko.js',    // this folder sometimes causes caching issue
                '.beans',
                '.demo-page-src',
                '.demo-page-dist',
                '.cache',
                '.coverage',
                '.test'
            ]
        }
    };
};
