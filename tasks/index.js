'use strict';

var buildLazyPipes = require('./lib/buildLazyPipes');
var normalizeOptions = require('./lib/options');
var renameAlias = require('./lib/renameAlias');

var metaljs = function(options) {
	options = normalizeOptions(options);
	if (options.registerSoyTasks) {
		require('./lib/soy')(options);
	}
	if (options.registerTestTasks) {
		require('./lib/test')(options);
	}
	if (options.registerBuildTasks) {
		require('./lib/build')(options);
	}
};
metaljs.buildLazyPipes = buildLazyPipes;
metaljs.renameAlias = renameAlias;

module.exports = metaljs;
