'use strict';

import dom from '../../../src/dom/dom';
import globalEval from '../../../src/eval/globalEval';

describe('globalEval', function() {
	before(function() {
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
		globalEval.run('var testScript = 2 + 2;');
		assert.ok(!document.head.querySelector('script'));
	});

	it('should evaluate script file in global scope', function(done) {
		globalEval.runFile('test/fixtures/script.js');

		var script = document.head.querySelector('script');
		dom.on(script, 'load', function() {
			assert.strictEqual(5, window.testScript);
			done();
		});
	});

	it('should remove created script tag after evaluated script file is loaded', function(done) {
		globalEval.runFile('test/fixtures/script.js');

		var script = document.head.querySelector('script');
		dom.on(script, 'load', function() {
			assert.ok(!document.head.querySelector('script'));
			done();
		});
	});

	it('should remove created script tag after evaluated script file throws error', function(done) {
		globalEval.runFile('test/fixtures/unexistingScript.js');

		var script = document.head.querySelector('script');
		dom.on(script, 'error', function() {
			assert.ok(!document.head.querySelector('script'));
			done();
		});
	});

	it('should call callback function after script file is run', function(done) {
		globalEval.runFile('test/fixtures/script.js', function() {
			assert.strictEqual(5, window.testScript);
			assert.ok(!document.head.querySelector('script'));
			done();
		});
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
		script.src = 'test/fixtures/script.js';
		dom.enterDocument(script);

		globalEval.runScript(script);
		var newScript = document.head.querySelector('script');
		dom.on(newScript, 'load', function() {
			assert.strictEqual(5, window.testScript);
			done();
		});
	});

	it('should call callback function after script tag with file src is run', function(done) {
		var script = document.createElement('script');
		script.src = 'test/fixtures/script.js';
		dom.enterDocument(script);

		globalEval.runScript(script, function() {
			assert.strictEqual(5, window.testScript);
			assert.ok(!document.head.querySelector('script'));
			done();
		});
	});

	it('should run all script tags inside given element', function() {
		var element = dom.buildFragment(
			'<div><script>var testScript = 2 + 2;</script></div><script>var testScript2 = 2 + 3;</script>'
		);
		globalEval.runScriptsInElement(element);
		assert.strictEqual(4, window.testScript);
		assert.strictEqual(5, window.testScript2);
		assert.ok(!document.head.querySelector('script'));
	});

	it('should run script tags inside given element in order', function(done) {
		var element = dom.buildFragment(
			'<script src="test/fixtures/script.js"></script><div><script>var testScript = 2 + 2;</script></div>'
		);

		globalEval.runScriptsInElement(element, function() {
			assert.strictEqual(4, window.testScript);
			assert.ok(!document.head.querySelector('script'));
			done();
		});
	});

	it('should not throw errors if trying to run scripts on element without any scripts', function() {
		var element = dom.buildFragment('<div></div>');
		assert.doesNotThrow(function() {
			globalEval.runScriptsInElement(element);
		});
	});

	it('should call given callback immediately if no script tags exist in received element', function() {
		var element = dom.buildFragment('<div></div>');
		var callback = sinon.stub();
		globalEval.runScriptsInElement(element, callback);
		assert.strictEqual(1, callback.callCount);
	});
});
