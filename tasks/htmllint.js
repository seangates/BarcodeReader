'use strict';

module.exports = function html(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-html');

    // Options
    return {
        all: {
            src: './.demo-page-dist/*.html',
            options: {
                ignore: [
                    'Start tag seen without seeing a doctype first. Expected “<!DOCTYPE html>”.',
                    'Unclosed element “init-widgets”.',
                    'Unclosed element “optimizer-page”.',
                    'Element “head” is missing a required instance of child element “title”.'
                ]
            }
        }
    };
};
