'use strict';

var bowerDirectory = require('bower-directory');
var path = require('path');

var bowerDir = bowerDirectory.sync();
function renameAlias(originalPath, parentName, callback) {
	if (originalPath[0] === '.') {
		callback(null, path.resolve(path.dirname(parentName), originalPath));
	} else {
		callback(null, path.join(bowerDir, originalPath));
	}
}

module.exports = renameAlias;
