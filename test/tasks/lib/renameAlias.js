'use strict';

var assert = require('assert');
var bowerDirectory = require('bower-directory');
var path = require('path');
var renameAlias = require('../../../tasks/lib/renameAlias');

var bowerDir = bowerDirectory.sync();

describe('renameAlias', function() {
	it('should rename paths with "bower:" prefix to be relative to bower_components', function() {
		var parentPath = path.resolve('assets/src/metal-modal/modal.js');
		var renamedPath = renameAlias('bower:metal-tooltip/tooltip', parentPath);
		assert.strictEqual(path.join(bowerDir, 'metal-tooltip/tooltip'), renamedPath);
	});

	it('should not rename absolute paths', function() {
		var parentPath = path.resolve('assets/src/metal-modal/modal.js');
		var renamedPath = renameAlias('/metal-tooltip/tooltip', parentPath);
		assert.strictEqual('/metal-tooltip/tooltip', renamedPath);
	});

	it('should rename relative paths to be relative to the parent path', function() {
		var parentPath = path.resolve('assets/src/metal-modal/modal.js');
		var renamedPath = renameAlias('./modal.soy', parentPath);
		assert.strictEqual(path.resolve('assets/src/metal-modal/modal.soy'), renamedPath);
	});
});
