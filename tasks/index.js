'use strict';

var normalizeOptions = require('./lib/options');
var registerBuildTask = require('./lib/build');
var renameAlias = require('./lib/renameAlias');
var registerSoyTask = require('./lib/soy');
var registerTestTasks = require('./lib/test');

var metaljs = function(options) {
	options = normalizeOptions(options);
	registerSoyTask(options);
	registerTestTasks(options);
	registerBuildTask(options);
};
metaljs.renameAlias = renameAlias;

module.exports = metaljs;
