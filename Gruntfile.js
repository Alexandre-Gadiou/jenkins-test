'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        config: {
            // configurable paths
            src: 'src/main',
            test: 'src/test',
            tmp: 'target/.tmp',
            dist: 'target/dist'
        },
        watch: {
            html: {
                files: ['<%= config.src %>/html/**/*.{html,ejs}'],
                tasks: ['buildHtml']
            },
            less: {
                files: ['<%= config.src %>/less/**/*.less'],
                tasks: ['less']
            },
            styles: {
                files: ['<%= config.src %>/webapp/css/**/*.css'],
                tasks: ['copy:styles', 'autoprefixer']
            },
            livereload: {
                options: {
                    livereload: 35729
                },
                files: [
                    '<%= config.src %>/html/**/*.{html,ejs}',
                    '<%= config.tmp %>/css/**/*.css',
                    '<%= config.src %>/webapp/javascript/**/*.js',
                    '<%= config.src %>/webapp/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        browserSync: {
            dev: {
                bsFiles: {
                    src: [
                        '<%= config.tmp %>/*.html',
                        '<%= config.tmp %>/css/*.css',
                        '<%= config.src %>/webapp/javascript/**/*.js'
                    ]
                },
                options: {
                    watchTask: true
                }
            }
        },
        autoprefixer: {
            options: ['last 1 version'],
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.tmp %>/css/',
                        src: '**/*.css',
                        dest: '<%= config.tmp %>/css/'
                    }
                ]
            }
        },
        connect: {
            proxies: [
                {
                    context: '/modules',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: false
                },
                {
                    context: '/files',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: false
                }
            ],
            options: {
                port: 9000,
                // Change this to 'localhost' to deny access to the server from outside.
                hostname: '0.0.0.0',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: false,
                    base: [
                        '/'
                    ],
                    middleware: function (connect) {
                        return [
                            proxySnippet,
                            connect.static('target/.tmp/'),
                            connect.static('src/main/webapp/'),
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        '<%= config.tmp %>',
                        '<%= config.test %>'
                    ]
                }
            },
            dist: {
                options: {
                    base: '<%= config.dist %>'
                }
            }
        },
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '<%= config.tmp %>',
                            '<%= config.dist %>/*',
                            '!<%= config.dist %>/.git*'
                        ]
                    }
                ]
            },
            server: '<%= config.tmp %>'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= config.src %>/webapp/javascript/{,*/}*.js'
            ]
        },
        less: {
            all: {
                options: {
                },
                files: {
                    '<%= config.tmp %>/css/main.css': '<%= config.src %>/less/main.less',
                    '<%= config.tmp %>/css/jahia.edit.css': '<%= config.src %>/less/jahia.edit.less',
                    '<%= config.tmp %>/css/jahia.render.css': '<%= config.src %>/less/jahia.render.less'
                }
            }
        },
        // not used since Uglify task does concat,
        // but still available if needed
        /*concat: {
         dist: {}
         },*/
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= config.dist %>/javascript/**/*.js',
                        '<%= config.dist %>/css/**/*.css',
                        '<%= config.dist %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= config.dist %>/fonts/*'
                    ]
                }
            }
        },
        buildHtml: {
            all: {
                options: {
                    templates: '<%= config.src %>/html/fragments/**/*.{html,ejs}',
                    templateNamespaceRoot: '<%= config.src %>/html/fragments/',
                    remoteCacheFolder: '<%= config.tmp %>/.cache',
                    remoteUrl: {
                        prefix: 'http://localhost:8080/cms/render/live/fr',
                        suffix: '.html.ajax'
                    }
                },
                expand: true,
                cwd: '<%= config.src %>/html/pages/',
                src: ['*.ejs'],
                dest: '<%= config.tmp %>',
                ext: '.html'
            }
        },
        useminPrepare: {
            html: '<%= config.src %>/html/**/*.html',
            options: {
                dest: '<%= config.dist %>'
            }
        },
        usemin: {
            html: ['<%= config.dist %>/**/*.html'],
            css: ['<%= config.dist %>/css/**/*.css'],
            options: {
                assetsDirs: ['<%= config.dist %>/**/'],
                dirs: ['<%= config.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.src %>/webapp/img',
                        src: '**/*.{jpg,jpeg}', // we don't optimize PNG files as it doesn't work on Linux. If you are not on Linux, feel free to use '{,*/}*.{png,jpg,jpeg}'
                        dest: '<%= config.dist %>/img'
                    }
                ]
            }
        },
        svgmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.src %>/webapp/img',
                        src: '**/*.svg',
                        dest: '<%= config.dist %>/img'
                    }
                ]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= config.dist %>/css/global.css': [
                        '<%= config.tmp %>/css/{,*/}*.css'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    conservativeCollapse: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.tmp %>',
                        src: ['*.html'],
                        dest: '<%= config.dist %>'
                    }
                ]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= config.src %>/webapp',
                        dest: '<%= config.dist %>',
                        src: [
                            'images/**/*.{png,gif,webp}',
                            'fonts/*'
                        ]
                    },
                    {
                        expand: true,
                        cwd: '<%= config.tmp %>/img',
                        dest: '<%= config.dist %>/img',
                        src: [
                            'generated/*'
                        ]
                    }
                ]
            },
            styles: {
                expand: true,
                cwd: '<%= config.src %>/webapp/css',
                dest: '<%= config.tmp %>/css/',
                src: '{,*/}*.css'
            }
        },
        concurrent: {
            server: [
                'less',
                'buildHtml',
                'copy:styles'
            ],
            test: [
                'less',
                'buildHtml',
                'copy:styles'
            ],
            dist: [
                'less',
                'buildHtml',
                'copy:styles',
                'imagemin',
                'svgmin'
            ]
        },
        karma: {
            unit: {
                configFile: '<%= config.test %>/javascript/karma.conf.js',
                singleRun: true
            }
        },
        replace: {
            dist: {
                src: ['<%= config.dist %>/{,*/}*.html'],
                overwrite: true,                                 // overwrite matched source files
                replacements: [
                    {
                        from: '//',
                        to: 'http://'
                    }
                ]
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= config.dist %>/javascript/global.js': [
                        '<%= config.src %>/webapp/javascript/main.js'
                    ]
                }
            }
        }
    });

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            'configureProxies',
            'connect:livereload',
            'browserSync',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        //'concat',
        'copy:dist',
        'cssmin',
        'replace',
        'uglify',
        //'rev',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('default', [
        //'test',
        'build'
    ]);
};