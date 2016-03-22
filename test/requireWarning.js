'use strict';

import '../src/requireWarning';

describe('requireWarning', function() {
	beforeEach(function() {
		sinon.stub(console, 'error');
		sinon.stub(console, 'warn');
	});

	afterEach(function() {
		console.error.restore();
		console.warn.restore();
	});

	it('should log warning if incremental dom module is required before being declared', function() {
		assert.throws(() => goog.require('test.undeclared.incrementaldom'));
		assert.strictEqual(1, console.warn.callCount);
	});

	it('should not log warning if non incremental dom module is required before being declared', function() {
		assert.throws(() => goog.require('test.undeclared'));
		assert.strictEqual(0, console.warn.callCount);
	});

	it('should not log warning if incremental dom module is required after being declared', function() {
		goog.loadModule(() => goog.module('test.declared'));
		assert.doesNotThrow(() => goog.require('test.declared'));
		assert.strictEqual(0, console.warn.callCount);
	});
});
