'use strict';

var pkg = require('./package.json');
var registerTasks = require('alloyui-tasks');

registerTasks({
  bundleFileName: 'aui.js',
  pkg: pkg
});
