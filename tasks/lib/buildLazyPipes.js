'use strict';

var babelGlobals = require('gulp-babel-globals');
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
		.pipe(sourcemaps.write, './');
}
module.exports.buildGlobals = buildGlobals;
