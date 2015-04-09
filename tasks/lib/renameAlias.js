'use strict';

var bowerDirectory = require('bower-directory');
var path = require('path');

var bowerDir = bowerDirectory.sync();
function renameAlias(originalPath, parentName, callback) {
	callback(null, renameAliasSync(originalPath, parentName));
}

function renameAliasSync(originalPath, parentName) {
	if (originalPath[0] === '.') {
		return path.resolve(path.dirname(parentName), originalPath);
	} else {
		return path.join(bowerDir, originalPath);
	}
}

module.exports = renameAlias;
module.exports.renameAliasSync = renameAliasSync;
