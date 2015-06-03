'use strict';

var buildLazyPipes = require('./buildLazyPipes');
var gulp = require('gulp');
var normalizeOptions = require('./options');
var runSequence = require('run-sequence');

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'build:globals', function(done) {
		runSequence(taskPrefix + 'soy', taskPrefix + 'build:globals:js', done);
	});

	gulp.task(taskPrefix + 'build:globals:js', function() {
		return gulp.src(options.buildSrc)
			.pipe(buildLazyPipes.buildGlobals(options)())
			.on('error', handleError);
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
