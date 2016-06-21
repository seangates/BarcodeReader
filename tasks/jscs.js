'use strict';

module.exports = function jscs(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-jscs');

    // Options
    return {
        src: [
            'src/**/index.js',
            'tasks/*.js'
        ],
        options: {
            config: '.jscsrc',
            verbose: true // If you need output with rule names http://jscs.info/overview.html#verbose
        }
    };
};
