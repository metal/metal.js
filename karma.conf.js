'use strict';

var karmaConf = require('./karma-sauce.conf');

module.exports = function(config) {
	karmaConf(config);
	config.frameworks.push('source-map-support');
};
