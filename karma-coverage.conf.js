'use strict';

var metalKarmaConfig = require('metal-karma-config/coverage');

module.exports = function (config) {
  metalKarmaConfig(config, true);
  config.files.push('vendor/incremental-dom.js');
};
