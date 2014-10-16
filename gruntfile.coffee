module.exports = (grunt) ->

  # configuration
  grunt.initConfig

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

    copy:
      main:
        files: [
          {
            expand: true
            flatten: true
            src: ['app/src/js/vendor/**']
            dest: 'app/build/js/vendor'
            filter: 'isFile'
          }
        ]

    'http-server':
      dev:
        root: 'app/'
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
  grunt.loadNpmTasks 'grunt-contrib-copy'

  # tasks
  grunt.registerTask 'default', ['sass', 'coffee', 'copy', 'watch']