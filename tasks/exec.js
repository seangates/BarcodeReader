'use strict';

module.exports = function exec(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-exec');

    // Options
    return {
        'ebayui-publish': {
            cmd: 'ebayui-publish',
            callback: function(stdErr, stdOut) {
                if (stdErr) {
                    grunt.log.error('Error running ebayui-publish. Please make sure ebayui-publish is installed globally.');
                }
            }
        }
    };
};
