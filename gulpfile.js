var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var _           = require('underscore');
var html2js     = require('gulp-ng-html2js');
var jade        = require('gulp-jade');
var jshint      = require('gulp-jshint');
var merge       = require('merge-stream');
var ngAnnotate  = require('gulp-ng-annotate');
var preprocess  = require('gulp-preprocess');
var spawn       = require('child_process').spawn;
var uglify      = require('gulp-uglifyjs');

// @todo add sizing as separate task
// @todo update scss generation
// @todo should handle app-templates and app-script better

var dist_dir = './www/';

var paths = {
  gulp: ['./gulpfile.js'],
  js  : ['./src/app/*.js', './src/app/**/*.js', './src/common/**/*.js', '!**/*.spec.js' ],
  jade: ['./src/app/**/*.jade', './src/common/**/*.jade', '!**/*.tpl.jade'],
  jade_tpl: ['./src/app/**/*.tpl.jade', './src/common/**/*.tpl.jade'],
  sass: ['./src/styles/**/*.scss'],
  libs: {
    js:
      [
        './vendor/ionic/js/ionic.bundle.js'
      ],
    js_min:
      [
        './vendor/ionic/js/ionic.bundle.min.js'
      ]
  },
  assets: ['./assets/**'],
  fonts: ['./vendor/ionic/fonts/*'],
};

gulp.task('default', ['dev']);
gulp.task('dev', ['app-fonts', 'app-assets', 'app-styles', 'lint', 'app-html', 'lib-scripts', 'app-scripts-dev']);
gulp.task('stg', ['app-fonts', 'app-assets', 'app-styles', 'lint', 'app-html', 'lib-scripts', 'app-scripts-stg']);
gulp.task('prd', ['app-fonts', 'app-assets', 'app-styles', 'lint', 'app-html', 'lib-scripts', 'app-scripts-prd']);

gulp.task('app-fonts', function() {
  return gulp.src( paths.fonts )
    .pipe( gulp.dest( dist_dir + 'fonts/' ) )
    ;
});

gulp.task('app-assets', function() {
  return gulp.src( paths.assets )
    .pipe( gulp.dest( dist_dir + 'assets/' ) )
    ;
});

gulp.task('app-styles', function( done ) {
  gulp.src( paths.sass )
    .pipe( sass({
      errLogToConsole: true
    }) )
    .pipe( gulp.dest( dist_dir + 'css/' ) )
    .pipe( minifyCss({
      keepSpecialComments: 0
    }))
    .pipe( rename({ extname: '.min.css' }) )
    .pipe( gulp.dest( dist_dir + 'css/' ) )
    .on('end', done)
    ;
});

gulp.task('lint', function() {
  return gulp.src( _.flatten( [ paths.gulp, paths.js ] ) )
    .pipe( jshint() )
    .pipe( jshint.reporter('jshint-stylish') );
});

app_scripts = function( env ) {
  return function() {
    var templates_js = gulp.src( paths.jade_tpl )
      .pipe( jade({
        locals: {},
        pretty: false,
      }))
      .pipe( gulp.dest('./www/') )
      .pipe( html2js({
        moduleName: 'app-templates',
        prefix: '',
      }))
      ;

    return merge( templates_js, gulp.src( paths.js ) )
      .pipe( preprocess({ context: { NODE_ENV: env } }) )
      .pipe( concat('app.js') )
      .pipe( gulp.dest( dist_dir + 'js/' ) )
      .pipe( ngAnnotate() )
      .pipe( uglify( 'app.min.js', {
        outSourceMap: true,
      }))
      .pipe( gulp.dest( dist_dir + 'js/' ) )
      ;
  };
};

gulp.task('app-scripts-dev', app_scripts( 'development' ));
gulp.task('app-scripts-stg', app_scripts( 'staging' ));
gulp.task('app-scripts-prd', app_scripts( 'production' ));

gulp.task('lib-scripts', function() {
  return gulp.src( paths.libs.js )
    .pipe( concat('libs.js') )
    .pipe( gulp.dest( dist_dir + 'js/' ) )
    ;
});

gulp.task('lib-scripts-min', function() {
  return gulp.src( paths.libs.js_min )
    .pipe( concat('libs.min.js') )
    .pipe( gulp.dest( dist_dir + 'js/' ) )
    ;
});

gulp.task('app-html', function() {
  return gulp.src( paths.jade )
    .pipe( jade({
      locals: {},
      pretty: true,
    }))
    .pipe( gulp.dest('./www/') )
    ;
});

gulp.task('watch', function() {
  gulp.watch( paths.gulp, ['reload'] );
  gulp.watch( paths.js, ['lint', 'app-scripts-dev'] );
  gulp.watch( paths.jade_tpl, ['app-scripts-dev'] );
  gulp.watch( paths.sass, ['app-styles'] );
  gulp.watch( paths.jade, ['app-html'] );
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

// http://stackoverflow.com/questions/22886682/how-can-gulp-be-restarted-on-gulpfile-change
gulp.task('reload', function() {
  var process;
  var spawnChildren = function() {
    // kill previous spawned process
    if( process ) {
      process.kill();
    }

    // `spawn` a child `gulp` process linked to the parent `stdio`
    process = spawn( 'gulp', [], { stdio: 'inherit' } );
  };

  gulp.watch( ['./gulpfile.js'], spawnChildren );
  spawnChildren();
});
