'use strict';

var metalKarmaConfig = require('metal-karma-config');

module.exports = function (config) {
  metalKarmaConfig(config);
	config.files.push('vendor/incremental-dom.js');
};
