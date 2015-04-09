'use strict';

var babelGlobals = require('gulp-babel-globals');
var gulp = require('gulp');
var normalizeOptions = require('./options');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var renameAlias = require('./renameAlias');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'build:globals', function(done) {
		runSequence(taskPrefix + 'soy', taskPrefix + 'build:globals:js', done);
	});

	gulp.task(taskPrefix + 'build:globals:js', function() {
		return gulp.src(options.buildSrc)
			.pipe(sourcemaps.init())
			.pipe(babelGlobals({
				babelOptions: {
					compact: false,
					resolveModuleSource: renameAlias.renameAliasSync,
					sourceMaps: true
				},
				bundleFileName: options.bundleFileName,
				globalName: options.globalName
			})).on('error', handleError)
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(options.buildDest));
	});

	gulp.task(taskPrefix + 'watch:globals', function(done) { // jshint ignore:line
		gulp.watch(options.buildSrc, [taskPrefix + 'build:globals:js']);
		gulp.watch(options.soySrc, [taskPrefix + 'soy']);
	});
};

// Private helpers
function handleError(error) {
	console.error(error.toString());

	this.emit('end'); // jshint ignore:line
}
