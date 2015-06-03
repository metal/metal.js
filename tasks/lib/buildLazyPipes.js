'use strict';

var babelGlobals = require('gulp-babel-globals');
var gulp = require('gulp');
var lazypipe = require('lazypipe');
var renameAlias = require('./renameAlias');
var sourcemaps = require('gulp-sourcemaps');

function buildGlobals(options) {
	var babelGlobalsOptions = {
		babelOptions: {
			compact: false,
			resolveModuleSource: renameAlias,
			sourceMaps: true
		},
		bundleFileName: options.bundleFileName,
		globalName: options.globalName
	};
	return lazypipe()
		.pipe(sourcemaps.init)
		.pipe(babelGlobals, babelGlobalsOptions)
		.pipe(sourcemaps.write, './')
		.pipe(gulp.dest, options.buildDest);
}
module.exports.buildGlobals = buildGlobals;
