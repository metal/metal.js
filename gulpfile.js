'use strict';

var del = require('del');
var gulp = require('gulp');
var path = require('path');
var pkg = require('./package.json');
var plugins = require('gulp-load-plugins')();
var registerTasks = require('./index');
var runSequence = require('run-sequence');

registerTasks({
  bundleFileName: 'metal.js',
  corePathFromSoy: function(file) {
    return path.relative(path.dirname(file.path), path.resolve('src'));
  },
  soyDest: function(file) {
    if (file.base === path.resolve('temp')) {
      return 'test';
    } else {
      return file.base;
    }
  },
  soyGeneratedOutputGlob: false,
  soyGenerationGlob: '**/test/**/*.soy',
  soySrc: ['src/**/*.soy', 'test/**/*.soy']
});

gulp.task('build', function(done) {
  runSequence('clean', ['build:globals', 'build:min'], done);
});

gulp.task('build:min', ['build:globals'], function() {
  return gulp.src('build/metal.js')
    .pipe(plugins.rename('metal-min.js'))
    .pipe(plugins.uglify({
      compress: {drop_console: true},
      preserveComments: 'some'
    }))
    .pipe(banner())
    .pipe(gulp.dest('build'));
});

gulp.task('clean', function(done) {
  del(['build'], done);
});

gulp.task('lint', function() {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(require('jshint-stylish')));
});

function banner() {
  var stamp = [
    '/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>',
    ' * @link http://liferay.com',
    ' * @license BSD',
    ' */',
    ''
  ].join('\n');

  return plugins.header(stamp, {
    pkg: pkg
  });
}
