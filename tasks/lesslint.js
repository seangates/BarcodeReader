'use strict';

module.exports = function lesslint(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-lesslint');

    // Options
    return {
        src: ['*.less'],
        options: {
            csslint: {
                'box-model': false
            }
        }
    };
};
