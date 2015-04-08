'use strict';

var bowerDirectory = require('bower-directory');
var path = require('path');

var bowerDirectory = bowerDirectory.sync();
function renameAlias(originalPath, parentName, callback) {
	if (originalPath[0] === '.') {
		callback(path.resolve(path.dirname(parentName), originalPath));
	} else {
		callback(path.join(bowerDirectory, originalPath));
	}
}

module.exports = renameAlias;
