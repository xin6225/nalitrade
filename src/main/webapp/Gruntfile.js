module.exports = function(grunt) {
  'use strict';
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);

// Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
    '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>; */\n',
    // Task configuration.
    clean: {
     build: ['build', '.tscache']
    },

    less: {
     options: {
       strictMath: true
     },
     build: {
       files: [
         {'build/assets/styles/general.css': 'assets/styles/general.less'}
       ]
     },
     dist: {
       options: {
         plugins: [
           new (require('less-plugin-clean-css'))()
         ]
       },
       files: [
         {'build/assets/styles/general.min.css': 'assets/styles/general.less'}
       ]
     }
    },
  copy: {
   dist: {
     files: [
       {
         expand: true,
         cwd: 'src',
         src: ['index.html', 'assets/!(styles)/*'],
         dest: 'build'
       }
     ]
   }
  },
  handlebars: {
   compile: {
     options: {
       namespace: 'templates',
       amd: ['handlebars', 'app/helpers/TemplateHelpers'],
       processName: function(filePath) {
         var pieces = filePath.split('/');
         return pieces[pieces.length - 1].split('.')[0];
       }
     },
     files: {
       'build/templates/<%= pkg.name %>.js': 'templates/*.hbs'
     }
   }
  },
  watch: {
   src: {
     files: ['app/**/*.ts'],
     tasks: ['ts'],
     options: {
       livereload: true
     }
   },
   templates: {
     files: 'templates/*.hbs',
     tasks: 'handlebars',
     options: {
       livereload: true
     }
   },
   less: {
     files: 'assets/styles/*.less',
     tasks: 'less:build',
     options: {
       livereload: true
     }
   }
  },
  ts: {
   default: {
     options: {
       fast: 'never'
     },
     tsconfig: true
   }
  }
  });

  // Default task.
  grunt.registerTask('default', ['serve']);
  grunt.registerTask('compile', ['less:build', 'handlebars', 'ts']);
  grunt.registerTask('serve', ['compile', 'connect', 'watch']);

  // this task does the same as serve, but leaves TS compilation to the IDE. Compiled js files are watched instead for reload
  grunt.registerTask('serve2', function() {
    var srcOptions = {
      files: 'build/app/**/*.js',
      options: {
        livereload: true
      }
    };
    grunt.config('watch.src', srcOptions);
    grunt.task.run(['less:build', 'handlebars', 'connect', 'watch'])
  });

  grunt.registerTask('dist', ['clean', 'compile', 'less:dist', 'copy']);
};