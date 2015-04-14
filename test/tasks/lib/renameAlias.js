'use strict';

var assert = require('assert');
var bowerDirectory = require('bower-directory');
var sinon = require('sinon');
var mockery = require('mockery');
var path = require('path');

var bowerDir = path.resolve('assets/bower_components');
var renameAlias;

describe.only('renameAlias', function() {
	before(function() {
		sinon.stub(bowerDirectory, 'sync').returns(bowerDir);

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
		mockery.registerMock('bower-directory', bowerDirectory);

		// We need to delay requiring `renameAlias` until mockery has already been
		// enabled and prepared.
		renameAlias = require('../../../tasks/lib/renameAlias');
	});

	after(function() {
		mockery.disable();
	});

	it('should rename non relative paths to be relative to bower_components', function(done) {
		var parentPath = path.resolve('assets/src/metal-modal/modal.js');
		renameAlias('metal-tooltip/tooltip', parentPath, function(error, renamedPath) {
			assert.strictEqual(path.join(bowerDir, 'metal-tooltip/tooltip'), renamedPath);
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
