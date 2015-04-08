'use strict';

var bowerDirectory = require('bower-directory');
var GlobalsFormatter = require('es6-module-transpiler-globals-formatter');
var gulp = require('gulp');
var normalizeOptions = require('./options');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var rename = require('gulp-es6-imports-renamer');
var runSequence = require('run-sequence');
var transpile = require('gulp-es6-module-transpiler');
var path = require('path');
var plugins = require('gulp-load-plugins')();

module.exports = function(options) {
	options = normalizeOptions(options);
	var taskPrefix = options.taskPrefix;

	gulp.task(taskPrefix + 'build:globals', [taskPrefix + 'soy'], function(done) {
		runSequence(taskPrefix + 'soy', taskPrefix + 'globals', done);
	});

	gulp.task(taskPrefix + 'globals', function() {
		return gulp.src(options.buildSrc)
			.pipe(sourcemaps.init())
			.pipe(rename({
				basePath: process.cwd(),
				renameDependencies: true,
				renameFn: renameFn
			})).on('error', handleError)
			.pipe(transpile({
				basePath: process.cwd(),
				bundleFileName: options.bundleFileName,
				formatter: new GlobalsFormatter({
					globalName: options.globalName
				})
			})).on('error', handleError)
			.pipe(babel({
				blacklist: 'useStrict',
				compact: false
			})).on('error', handleError)
			.pipe(plugins.wrapper({
				header: ';(function() {\n',
				footer: '\n}());'
			}))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(options.buildDest));
	});

	gulp.task(taskPrefix + 'watch:globals', function(done) { // jshint ignore:line
		gulp.watch(options.buildSrc, [taskPrefix + 'globals']);
		gulp.watch(options.soySrc, [taskPrefix + 'soy']);
	});
};

// Private helpers
function handleError(error) {
	console.error(error.toString());

	this.emit('end'); // jshint ignore:line
}

var bowerDirectory = bowerDirectory.sync();
function renameFn(originalPath, parentName, callback) {
	if (originalPath[0] === '.') {
		callback(path.resolve(path.dirname(parentName), originalPath));
	} else {
		callback(path.join(bowerDirectory, originalPath));
	}
}
