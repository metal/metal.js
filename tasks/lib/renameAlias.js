'use strict';

var bowerDirectory = require('bower-directory');
var path = require('path');

var bowerDir = bowerDirectory.sync();
function renameAlias(originalPath, parentPath, callback) {
	callback(null, renameAliasSync(originalPath, parentPath));
}

function renameAliasSync(originalPath, parentPath) {
	if (originalPath[0] === '.') {
		return path.resolve(path.dirname(parentPath), originalPath);
	} else if (originalPath.substr(0, 6) === 'bower:') {
		return path.join(bowerDir, originalPath.substr(6));
	} else {
		return originalPath;
	}
}

module.exports = renameAlias;
module.exports.renameAliasSync = renameAliasSync;
