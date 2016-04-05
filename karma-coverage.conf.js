'use strict';

var metalKarmaConfig = require('metal-karma-config/no-soy-coverage');

module.exports = function (config) {
  metalKarmaConfig(config);
  config.files.push('vendor/incremental-dom.js');
};
