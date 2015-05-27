'use strict';

var assert = require('assert');
var bowerDirectory = require('bower-directory');
var path = require('path');
var renameAlias = require('../../../tasks/lib/renameAlias');

var bowerDir = bowerDirectory.sync();

describe('renameAlias', function() {
	it('should rename paths with "bower:" prefix to be relative to bower_components', function(done) {
		var parentPath = path.resolve('assets/src/metal-modal/modal.js');
		renameAlias('bower:metal-tooltip/tooltip', parentPath, function(error, renamedPath) {
			assert.strictEqual(path.join(bowerDir, 'metal-tooltip/tooltip'), renamedPath);
			done();
		});
	});

	it('should not rename absolute paths', function(done) {
		var parentPath = path.resolve('assets/src/metal-modal/modal.js');
		renameAlias('/metal-tooltip/tooltip', parentPath, function(error, renamedPath) {
			assert.strictEqual('/metal-tooltip/tooltip', renamedPath);
			done();
		});
	});

	it('should rename relative paths to be relative to the parent path', function(done) {
		var parentPath = path.resolve('assets/src/metal-modal/modal.js');
		renameAlias('./modal.soy', parentPath, function(error, renamedPath) {
			assert.strictEqual(path.resolve('assets/src/metal-modal/modal.soy'), renamedPath);
			done();
		});
	});
});
