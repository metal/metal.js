'use strict';

var nodeunit = require('nodeunit');

if (typeof exports === 'object') {
  var context = nodeunit.utils.sandbox(['./build/lfr.js'], {console: console});
  module.exports = context.lfr;
}
