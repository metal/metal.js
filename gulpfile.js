'use strict';

var gulp = require('gulp');
var merge = require('merge-stream');
var pkg = require('./package.json');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

var mainFiles = [
  'src/lfr.js',
  'src/array/array.js',
  'src/promise/Promise.js',
  'src/disposable/Disposable.js',
  'src/structs/Trie.js',
  'src/structs/WildcardTrie.js',
  'src/events/EventHandle.js',
  'src/events/EventHandler.js',
  'src/events/EventEmitter.js',
  'src/events/EventEmitterProxy.js',
  'src/attribute/Attribute.js',
  'src/net/Transport.js',
  'src/net/XhrTransport.js',
  'src/net/WebSocketTransport.js',
  'src/webchannel/WebChannel.js',
];

gulp.task('build', ['clean'], function() {
  return runSequence('build-raw', 'build-min', 'build-debug');
});

gulp.task('build-raw', function() {
  return gulp.src(mainFiles)
    .pipe(plugins.concat('lfr.js'))
    .pipe(banner())
    .pipe(gulp.dest('build'));
});

gulp.task('build-min', function() {
  return gulp.src(mainFiles)
    .pipe(plugins.uglify({
      preserveComments: 'some'
    }))
    .pipe(plugins.concat('lfr-min.js'))
    .pipe(banner())
    .pipe(gulp.dest('build'));
});

gulp.task('build-debug', function() {
  return gulp.src(mainFiles)
    .pipe(plugins.concat('lfr-debug.js'))
    .pipe(banner())
    .pipe(gulp.dest('build'));
});

gulp.task('clean', function() {
  return gulp.src('build').pipe(plugins.rimraf());
});

gulp.task('format', function() {
  var src = gulp.src(['src/**/*.js'])
    .pipe(plugins.esformatter())
    .pipe(gulp.dest('src'));

  var test = gulp.src(['test/**/*.js'])
    .pipe(plugins.esformatter())
    .pipe(gulp.dest('test'));

    return merge(src, test);
});

gulp.task('lint', function() {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(require('jshint-stylish')));
});

gulp.task('test', function(done) {
  return runSequence('test-unit', 'test-complexity', done);
});

gulp.task('test-complexity', function() {
  return gulp.src(['src/**/*.js', '!src/promise/Promise.js', 'test/**/*.js'])
    .pipe(plugins.complexity({
      halstead: [12, 15, 20]
    }));
});

gulp.task('test-unit', function() {
  return gulp.src(['test/**/*.js', '!test/fixture/*.js'])
    .pipe(plugins.mocha());
});

gulp.task('test-cover', function() {
  return gulp.src(['src/**/*.js', '!src/promise/Promise.js'])
    .pipe(plugins.istanbul());
});

gulp.task('test-coverage', ['test-cover'], function() {
  return gulp.src(['test/**/*.js', '!test/fixture/*.js'])
    .pipe(plugins.mocha())
    .pipe(plugins.istanbul.writeReports());
});

gulp.task('test-watch', function() {
  gulp.watch('src/**/*.js', ['test-unit']);
});

gulp.task('watch', ['build'], function() {
  gulp.watch('src/**/*', ['build']);
});

// Private helpers
// ===============

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
