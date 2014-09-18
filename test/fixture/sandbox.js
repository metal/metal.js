'use strict';

var nodeunit = require('nodeunit');

if (typeof exports === 'object') {
  var context = nodeunit.utils.sandbox(['./build/lfr.js'], {});
  module.exports = context.lfr;
}
