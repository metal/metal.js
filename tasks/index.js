'use strict';

var GlobalsFormatter = require('es6-module-transpiler-globals-formatter');
var gulp = require('gulp');
var normalizeOptions = require('./lib/options');
var registerSoyTask = require('./lib/soy');
var registerTestTasks = require('./lib/test');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var transpile = require('gulp-es6-module-transpiler');

function handleError(error) {
  console.error(error.toString());

  this.emit('end'); // jshint ignore:line
}

module.exports = function(options) {
  options = normalizeOptions(options);
  var taskPrefix = options.taskPrefix;
  registerSoyTask(options);
  registerTestTasks(options);

  gulp.task(taskPrefix + 'build:globals', [taskPrefix + 'soy'], function() {
    return gulp.src(options.buildSrc)
      .pipe(sourcemaps.init())
      .pipe(transpile({
        basePath: process.cwd(),
        bundleFileName: options.bundleFileName,
        formatter: new GlobalsFormatter({
          globalName: options.globalName
        })
      }))
      .pipe(babel({
        blacklist: 'useStrict',
        compact: false
      })).on('error', handleError)
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(options.buildDest));
  });
};
