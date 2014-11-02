module.exports = (grunt) ->

  # configuration
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    # grunt sass
    sass:
      compile:
        options:
          style: 'expanded'
        files: [
          expand: true
          cwd: 'app/src/sass'
          src: ['**/*.scss']
          dest: 'app/build/css'
          ext: '.css'
        ]

    # grunt coffee
    coffee:
      compile:
        expand: true
        cwd: 'app/src/coffee'
        src: ['**/*.coffee']
        dest: 'app/build/js'
        ext: '.js'
        options:
          sourceMap: true
          bare: true
          preserve_dirs: true

    concat:
      options: {
        separator: ';'
      }
      dist: {
        src: ['app/build/js/abc.js', 'app/build/js/controllers/**/*.js', 'app/build/js/ember/**/*.js',
              'app/build/js/models/**/*.js', 'app/build/js/utilities/**/*.js', 'app/build/js/views/**/*.js',
              'app/build/js/main.js']
        dest: 'app/dist/<%= pkg.name %>.js'
      }

    uglify:
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      }
      dist: {
        files: {
          'app/dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }

    'http-server':
      dev:
        root: 'app/'
#        root: 'app/dist/'
        port: 8000
        host: "127.0.0.1"
        showDir : true
        autoIndex: true
        ext: "html"
        runInBackground: false

    # grunt watch (or simply grunt)
    watch:
      html:
        files: ['**/*.html']
      sass:
        files: '<%= sass.compile.files[0].src %>'
        tasks: ['sass']
      coffee:
        files: '<%= coffee.compile.src %>'
        tasks: ['coffee']
      options:
        livereload: true

  # load plugins
  grunt.loadNpmTasks 'grunt-contrib-sass'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-http-server'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-uglify'

  # tasks
  grunt.registerTask 'default', ['sass', 'coffee', 'watch']