/*
   package.json config
   npm install
   grunt
 */

module.exports = function(grunt) {

  var fs = require('fs');
  // Project configuration.

  require('load-grunt-tasks')(grunt, {
    pattern: 'grunt-contrib-*'
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      all: {
        src: [
          "js/lib/json2.js",
          "js/lib/modernizr-2.0.6.js",
          "js/lib/jquery.js",
          "tools/bootstrap/js/bootstrap.js",
          "tools/codemirror/lib/codemirror.js",
          "tools/codemirror/mode/css/css.js",
          "js/lib/highcharts.js",
          "js/lib/mustache.js",
          "js/lib/cssmin.js",
          "tools/difflib/difflib.js",
          "tools/difflib/diffview.js",
          "js/main.js"
        ],
        dest: 'js/all.js'  
      }
    },
    clean: {
      all: ["js/all.js", "js/all.min.js"]
    },
    uglify: {
      all: {
        files: {
          'js/all.min.js': ['<%= concat.all.dest %>']  
        }
      }
    },
  });

  grunt.registerTask('default', ['clean:all', 'concat:all', 'uglify:all']);
};