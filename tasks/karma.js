'use strict';

module.exports = function fn(grunt) {
    grunt.loadNpmTasks('grunt-karma');

    // Debug options
    // grunt.option('debug', true);
    grunt.option('stack', true);

    var files = grunt.option('files') ? grunt.option('files').split(/\s*,\s*/) : [
        './node_modules/phantomjs-polyfill/bind-polyfill.js',
        './test/*test.js'
    ];
    var browsers = grunt.option('browsers') ? grunt.option('browsers').split(/\s*,\s*/) : [
        // a browser needs to be installed to work
        'PhantomJS_IDB'
        // 'Chrome',
        // 'ChromeCanary',
        // 'Safari',
        // 'Firefox',
        // 'Opera',
        // 'PhantomJS'
        // 'IE'
    ];
    var plugins = [
        'lasso-less',
        'lasso-marko'
    ];
    return {
        test: {
            browsers: browsers,
            reporters: [
                'mocha'
            ],
            lasso: {
                plugins: plugins,
                minify: false,
                bundlingEnabled: false,
                resolveCssUrls: true,
                cacheProfile: 'development',
                tempdir: './.test'
            }
        },

        coverage: {
            browsers: browsers,
            reporters: [
                'mocha',
                'lasso'
            ],
            lasso: {
                plugins: plugins,
                minify: false,
                bundlingEnabled: false,
                resolveCssUrls: true,
                cacheProfile: 'development',
                tempdir: './.coverage',
                coverage: {
                    files: 'index.js',
                    ignore: 'test/*.js',
                    reporters: [
                        {
                            type: 'json',
                            dir: './.coverage/json/'
                        },
                        {
                            type: 'html',
                            dir: './.coverage/html-client/'
                        }
                    ]
                }
            }
        },
        options: {
            frameworks: [
                'lasso',
                'mocha',
                'chai'
            ],
            files: files,
            plugins: [
                'karma-chai',
                'karma-mocha',
                'karma-lasso',
                'karma-mocha-reporter',
                'karma-phantomjs-launcher',
                'karma-chrome-launcher',
                'karma-firefox-launcher',
                'karma-safari-launcher',
                'karma-opera-launcher',
                'karma-ie-launcher'
            ],
            colors: true,
            autoWatch: grunt.option('watch') || false,
            singleRun: !grunt.option('watch'),
            client: {
                mocha: {
                    // set test-case timeout in milliseconds [2000]
                    timeout: 1000,
                    // check for global variable leaks. FIXME
                    ignoreLeaks: true,
                    // specify user-interface (bdd|tdd|exports).
                    ui: 'bdd',
                    // "slow" test threshold in milliseconds [75].
                    slow: 500
                }
            },
            customLaunchers: {
                IE9: {
                    base: 'IE',
                    'x-ua-compatible': 'IE=EmulateIE9'
                },
                IE8: {
                    base: 'IE',
                    'x-ua-compatible': 'IE=EmulateIE8'
                },
                'PhantomJS_IDB': {
                    base: 'PhantomJS',
                    options: {
                        settings: {
                            webSecurityEnabled: false
                        }
                    },
                    flags: ['--local-storage-path=./.test/html5-storage/']
                }
            },
            logLevel: grunt.option('debug') ? 'DEBUG' : 'WARN'
        }
    };
};
