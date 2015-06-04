'use strict';

var babelGlobals = require('gulp-babel-globals');
var lazypipe = require('lazypipe');
var renameAlias = require('./renameAlias');

function buildGlobals(options) {
	var babelGlobalsOptions = {
		babel: {
			compact: false,
			resolveModuleSource: renameAlias,
			sourceMaps: true
		},
		bundleFileName: options.bundleFileName,
		globalName: options.globalName
	};
	return lazypipe()
		.pipe(babelGlobals, babelGlobalsOptions);
}
module.exports.buildGlobals = buildGlobals;
