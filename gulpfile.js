var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var _         = require('underscore');
var html2js   = require('gulp-ng-html2js');
var jade      = require('gulp-jade');
var jshint    = require('gulp-jshint');
var uglify    = require('gulp-uglifyjs');

// @todo add sizing as separate task
// @todo update scss generation
// @todo should pipe app-templates into app-scripts

var paths = {
  gulp: ['./gulpfile.js'],
  js  : ['./src/app/*.js', './src/app/**/*.js', './src/common/**/*.js'],
  jade: ['./src/app/**/*.jade'],
  sass: ['./src/styles/**/*.scss']
};

gulp.task('default', ['sass', 'lint', 'app-templates', 'app-scripts']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done)
    ;
});

gulp.task('lint', function() {
  return gulp.src( _.flatten( [ paths.gulp, paths.js ] ) )
    .pipe( jshint() )
    .pipe( jshint.reporter('jshint-stylish') );
});

gulp.task('app-scripts', function() {
  return gulp.src( paths.js )
    .pipe( concat('app.js') )
    .pipe( gulp.dest('./www/js/') )
    ;
});

gulp.task('app-templates', function() {
  return gulp.src( paths.jade )
    .pipe( jade({
      locals: {},
      pretty: true,
    }))
    .pipe( gulp.dest('./www/') )
    // @todo should minify html here
    .pipe( html2js({
        moduleName: 'app-templates',
        prefix: '',
    }))
    .pipe( concat('templates.js' ) )
    .pipe( gulp.dest( './www/js' ) )
    .pipe( uglify( 'templates.min.js', {
      outSourceMap: true,
    }))
    .pipe( gulp.dest('./www/js') )
    ;
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
