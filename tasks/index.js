'use strict';

var normalizeOptions = require('./lib/options');
var registerBuildTask = require('./lib/build');
var registerSoyTask = require('./lib/soy');
var registerTestTasks = require('./lib/test');

module.exports = function(options) {
  options = normalizeOptions(options);
  registerSoyTask(options);
  registerTestTasks(options);
  registerBuildTask(options);
};
