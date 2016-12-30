'use strict';

import { async } from 'metal';
import * as dom from '../src/dom';
import globalEval from '../src/globalEval';

describe('globalEval', function() {
	before(function() {
		if (typeof process !== 'undefined') {
			// Skip this test in Node.js environment.
			this.skip();
		}
		window.testScript = null;
	});

	afterEach(function() {
		window.testScript = null;
	});

	it('should evaluate script code in global scope', function() {
		globalEval.run('var testScript = 2 + 2;');
		assert.strictEqual(4, window.testScript);
	});

	it('should not leave created script tag in document after code is evaluated', function() {
		var newScript = globalEval.run('var testScript = 2 + 2;');
		assert.ok(!newScript.parentNode);
	});

	it('should evaluate script file in global scope', function(done) {
		var newScript = globalEval.runFile('fixtures/script.js');

		dom.on(newScript, 'load', function() {
			assert.strictEqual(5, window.testScript);
			done();
		});
	});

	it('should remove created script tag after evaluated script file is loaded', function(done) {
		var newScript = globalEval.runFile('fixtures/script.js');

		dom.on(newScript, 'load', function() {
			assert.ok(!newScript.parentNode);
			done();
		});
	});

	it('should remove created script tag after evaluated script file throws error', function(done) {
		var newScript = globalEval.runFile('fixtures/unexistingScript.js');

		dom.on(newScript, 'error', function() {
			assert.ok(!newScript.parentNode);
			done();
		});
	});

	it('should call callback function after script file is run', function(done) {
		var newScript = globalEval.runFile('fixtures/script.js', function() {
			assert.strictEqual(5, window.testScript);
			assert.ok(!newScript.parentNode);
			done();
		});
	});

	it('should be able to overwrite append function', function() {
		var appendFn = sinon.stub();
		var script = document.createElement('script');
		globalEval.runScript(script, null, appendFn);
		assert.strictEqual(1, appendFn.callCount);
		script.src = 'fixtures/script.js';
		globalEval.runScript(script, null, appendFn);
		assert.strictEqual(2, appendFn.callCount);
	});

	it('should run code inside script tag in global scope', function() {
		var script = document.createElement('script');
		script.text = 'var testScript = "script with code";';

		globalEval.runScript(script);
		assert.strictEqual('script with code', window.testScript);
	});

	it('should remove script element from the document when it\'s evaluated', function() {
		var script = document.createElement('script');
		script.text = 'var testScript = "script with code";';
		dom.enterDocument(script);

		globalEval.runScript(script);
		assert.strictEqual('script with code', window.testScript);
		assert.ok(!script.parentNode);
	});

	it('should not evaluate script element with type different from javascript', function(done) {
		var script = document.createElement('script');
		script.text = 'Regular text file';
		script.type = 'text/plain';
		dom.enterDocument(script);

		sinon.spy(globalEval, 'run');
		globalEval.runScript(script, function() {
			assert.strictEqual(0, globalEval.run.callCount);
			globalEval.run.restore();
			done();
		});
	});

	it('should call callback function after script tag with inline content is run', function(done) {
		var script = document.createElement('script');
		script.text = 'var testScript = "script with code";';
		dom.enterDocument(script);

		globalEval.runScript(script, function() {
			assert.strictEqual('script with code', window.testScript);
			assert.ok(!script.parentNode);
			done();
		});
	});

	it('should run file referenced by specified script element in global scope', function(done) {
		var script = document.createElement('script');
		script.src = 'fixtures/script.js';
		dom.enterDocument(script);

		var newScript = globalEval.runScript(script);
		dom.on(newScript, 'load', function() {
			assert.strictEqual(5, window.testScript);
			done();
		});
	});

	it('should call callback function after script tag with file src is run', function(done) {
		var script = document.createElement('script');
		script.src = 'fixtures/script.js';
		dom.enterDocument(script);

		var newScript = globalEval.runScript(script, function() {
			assert.strictEqual(5, window.testScript);
			assert.ok(!newScript.parentNode);
			done();
		});
	});

	it('should run all script tags inside given element', function(done) {
		var element = dom.buildFragment(
			'<div><script>var testScript = 2 + 2;</script></div><script>var testScript2 = 2 + 3;</script>'
		);
		globalEval.runScriptsInElement(element, function() {
			assert.strictEqual(4, window.testScript);
			assert.strictEqual(5, window.testScript2);
			assert.ok(!document.head.querySelector('script'));
			done();
		});
	});

	it('should run script tags inside given element in order', function(done) {
		var element = dom.buildFragment(
			'<script src="fixtures/script.js"></script><div><script>var testScript = 2 + 2;</script></div>'
		);

		globalEval.runScriptsInElement(element, function() {
			assert.strictEqual(4, window.testScript);
			assert.ok(!document.head.querySelector('script'));
			done();
		});
	});

	it('should be able to overwrite append function from element', function(done) {
		var element = dom.buildFragment(
			'<script src="fixtures/script.js"></script><div><script>var testScript = 2 + 1;</script>'
		);
		var appendFn = sinon.spy(function(script) {
			document.head.appendChild(script);
		});
		globalEval.runScriptsInElement(element, function() {
			assert.strictEqual(2, appendFn.callCount);
			done();
		}, appendFn);
	});

	it('should not throw errors if trying to run scripts on element without any scripts', function() {
		var element = dom.buildFragment('<div></div>');
		assert.doesNotThrow(function() {
			globalEval.runScriptsInElement(element);
		});
	});

	it('should call given callback on nextTick if no script tags exist in received element', function(done) {
		var element = dom.buildFragment('<div></div>');
		var callback = sinon.stub();
		globalEval.runScriptsInElement(element, callback);
		assert.strictEqual(0, callback.callCount);
		async.nextTick(function() {
			assert.strictEqual(1, callback.callCount);
			done();
		});
	});
});
