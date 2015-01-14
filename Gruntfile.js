module.exports = function (grunt){
	grunt.initConfig({
		yeoman: {
            // configurable paths
            app: require('./bower.json').appPath || 'app',
            dist: 'build'
        },
		pkg : grunt.file.readJSON('./package.json'),
		// Automatically inject Bower components into the app
        bowerInstall : {
            dist: {
                src: ['<%= yeoman.app %>/index.html'],
                ignorePath: '<%= yeoman.app %>/'
			}
        },
        watch : {
        	options: {
        		livereload : true
        	},
        	site: {
        		files : ['<%= yeoman.app %>/index.html', '<%= yeoman.app %>/**/*.html'],
        		tasks : ['shell:jekyllBuild']
        	},
        	css: {
        		files : ['<%= yeoman.app %>/sass/*.scss'],
        		tasks : ['sass', 'shell:jekyllBuild']
        	},
        	scripts: {
        		files : ['<%= yeoman.app %>/**/*.js'],
        		tasks : ['shell:jekyllBuild']
        	}
        },
		sass: {
			dist: {
				options: {
					style: 'expanded'
				},
		      	// building the files dynamically http://gruntjs.com/configuring-tasks
				files: [{
					// set to true to enable the following options
					expand: true,
					// all src matches are relative to (but don't include) this path.
					cwd: '',
					// source of sass files
					src: ['<%= yeoman.app %>/sass/*.scss'],
					// destination of compiled sass
					dest: '<%= yeoman.app %>/styles',
					// extention to use
					ext: '.css',
					// Remove all path parts from generated dest paths.
					flatten : true
				}]
			}
		},
		useminPrepare : {
			jekyllMinPrep : {
				src : ['<%= yeoman.app %>/index.html'],
				options: {
					dest : '<%= yeoman.dist %>/jekyll'
				}
			}
		},
		usemin : {
			html : ['<%= yeoman.dist %>/jekyll/index.html'],
			options: {
				blockReplacements: {
					css: function (block) {
						return '<link rel="stylesheet" href="{{site.baseurl}}/' + block.dest + '">';
					},
					js: function (block) {
						return '<script type="text/javascript" src="{{site.baseurl}}/' + block.dest + '"></script>';
					}
				}
			}
		},
		copy : {
			jekyllCopy : {
				src : '<%= yeoman.app %>/index.html',
				dest : '<%= yeoman.dist %>/jekyll/index.html',
				options: {
					process: function (content, srcpath) {
						return "---\nlayout: default\n---\n\n".concat(content);
					}
				}
			}
		},
        shell: {
            jekyllServe: {
                command: 'jekyll serve --baseurl='
            },
            jekyllBuild: {
                command: 'jekyll build --config=_config-dev.yml'
            }
        }
	});

	// load npm dependencies
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-bower-install');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-usemin');


	grunt.registerTask('serve', [
		'shell:jekyllServe'
    ]);

	grunt.registerTask('build', [
        'bowerInstall',
		'sass',
		'copy:jekyllCopy',
		'useminPrepare:jekyllMinPrep',
		'concat',
		'cssmin',
		'uglify',
		'usemin',
		'shell:jekyllBuild',
		'watch'
    ]);


};