module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        options: {
          sourceMap: true,
          outputStyle: 'nested'
        },
        files: {
          '_dev/css/style.sass.css': '_dev/scss/style.scss'
        }
      }
    },
    autoprefixer: {
      style: {
        options: {
          browsers: ['last 2 versions', 'ie 8', 'ie 9']
        },
        src: '_dev/css/style.sass.css',
        dest: '_dev/css/style.autoprefixer.css'
      }
    },
    combine_mq: {
      style: {
        src: '<%= autoprefixer.style.dest %>',
        dest: '_dev/css/style.combine_mq.css'
      }
    },
    concat: {
      options: {
        separator: '\n'
      },
      css: {
        src: ['_dev/css/normalize.css', 'bower_components/photoswipe/dist/photoswipe.css', 'bower_components/photoswipe/dist/default-skin/default-skin.css', '<%= combine_mq.style.dest %>'],
        dest: '_dev/css/style.concat.css'
      }
    },
    cssmin: {
      options: {
        keepSpecialComments: 1,
        sourceMap: true
      },
      target: {
        files: {
          'css/style.css': '<%= concat.css.dest %>'
        }
      }
    },
    watch: {
      sass: {
        files: '_dev/scss/*.scss',
        tasks: ['sass', 'autoprefixer', 'combine_mq', 'concat:css', 'cssmin']
      },
      js: {
        files: '_dev/js/*',
        tasks: ['concat:fullJs', 'uglify']
      }
    },
    uglify: {
      options: {
        // banner: '/*! <%= pkg.name %> <%= grunt.template.today('yyyy-mm-dd') %> */\n'
      },
      js: {
        src: 'bower_components/Text-Gradiator/js/text-gradiator.js',
        dest: 'js/text-gradiator.min.js'
      }
    }
  });

  // Load the plugin that provides the 'uglify' task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-combine-mq');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['sass', 'autoprefixer', 'combine_mq', 'concat', 'cssmin', 'uglify', 'watch']);

};
