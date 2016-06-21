'use strict';

module.exports = function jshint(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Options
    return {
        files: [
            'widget.js',
            'index.js'
        ],
        options: {
            jshintrc: '.jshintrc'
        }
    };
};
