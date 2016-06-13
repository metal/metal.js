'use strict';

var karmaConf = require('./karma.conf.js');

module.exports = function(config) {
	karmaConf(config);

	var index = config.frameworks.indexOf('source-map-support');
	config.frameworks.splice(index, 1);
};
