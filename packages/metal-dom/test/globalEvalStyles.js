'use strict';

import { async } from 'metal';
import * as dom from '../src/dom';
import globalEvalStyles from '../src/globalEvalStyles';

describe('globalEvalStyles', function() {
	before(function() {
		if (typeof process !== 'undefined') {
			// Skip this test in Node.js environment.
			this.skip();
		}
	});

	afterEach(function() {});

	it('should evaluate style code', function() {
		var style = globalEvalStyles.run('body{background-color:rgb(255, 0, 0);}');
		assertComputedStyle('backgroundColor', 'rgb(255, 0, 0)');
		dom.exitDocument(style);
	});

	it('should leave created style tag in document after code is evaluated', function() {
		var style = globalEvalStyles.run('');
		assert.ok(style.parentNode);
		dom.exitDocument(style);
	});

	it('should evaluate style file', function(done) {
		var style = globalEvalStyles.runFile('fixtures/style.css', function() {
			assertComputedStyle('backgroundColor', 'rgb(0, 255, 0)');
			dom.exitDocument(style);
			done();
		});
	});

	it('should leave created style file in document after code is evaluated', function(done) {
		var style = globalEvalStyles.runFile('fixtures/style.css', function() {
			assert.ok(style.parentNode);
			dom.exitDocument(style);
			done();
		});
	});

	it('should run code inside style tag in global scope', function() {
		var style = document.createElement('style');
		style.innerHTML = 'body{background-color:rgb(255, 0, 0);}';

		var newStyle = globalEvalStyles.runStyle(style);
		assertComputedStyle('backgroundColor', 'rgb(255, 0, 0)');
		dom.exitDocument(newStyle);
	});

	it('should leave created style element in document after code is evaluated', function(done) {
		var style = document.createElement('style');
		style.innerHTML = 'body{background-color:rgb(255, 0, 0);}';

		var newStyle = globalEvalStyles.runStyle(style, function() {
			assert.ok(newStyle.parentNode);
			dom.exitDocument(newStyle);
			done();
		});
	});

	it('should not evaluate style element with tel different from stylesheet', function(done) {
		var link = document.createElement('link');
		link.innerHTML = 'body{background-color:rgb(255, 0, 0);}';
		link.rel = 'unknown';
		dom.enterDocument(link);

		sinon.spy(globalEvalStyles, 'run');
		globalEvalStyles.runStyle(link, function() {
			assert.strictEqual(0, globalEvalStyles.run.callCount);
			globalEvalStyles.run.restore();
			done();
		});
	});

	it('should run file referenced by specified style element', function(done) {
		var link = document.createElement('link');
		link.href = 'fixtures/style.css';
		link.rel = 'stylesheet';

		var newStyle = globalEvalStyles.runStyle(link, function() {
			assertComputedStyle('backgroundColor', 'rgb(0, 255, 0)');
			dom.exitDocument(newStyle);
			done();
		});
	});

	it('should be able to overwrite append function', function() {
		var appendFn = sinon.stub();
		var style = document.createElement('style');
		var newStyle = globalEvalStyles.runStyle(style, null, appendFn);
		assert.strictEqual(1, appendFn.callCount);
		dom.exitDocument(newStyle);
		globalEvalStyles.run('', appendFn);
		assert.strictEqual(2, appendFn.callCount);
	});

	it('should run all styles tags inside given element', function(done) {
		var element = dom.buildFragment(
			'<div><style>body{background-color:rgb(255, 0, 0);}</style></div><style>body{margin-top:10px;}</style>'
		);
		globalEvalStyles.runStylesInElement(element, function() {
			assertComputedStyle('backgroundColor', 'rgb(255, 0, 0)');
			assertComputedStyle('marginTop', '10px');
			done();
		});
	});

	it('should run styles tags inside given element in order', function(done) {
		var element = dom.buildFragment(
			'<div><style>body{background-color:rgb(255, 0, 0);}</style></div><style>body{background-color:rgb(0, 255, 0);}</style>'
		);
		globalEvalStyles.runStylesInElement(element, function() {
			assertComputedStyle('backgroundColor', 'rgb(0, 255, 0)');
			done();
		});
	});

	it('should not throw errors if trying to run styles on element without any styles', function() {
		var element = dom.buildFragment('<div></div>');
		assert.doesNotThrow(function() {
			globalEvalStyles.runStylesInElement(element);
		});
	});

	it('should call given callback on nextTick if no style tags exist in received element', function(done) {
		var element = dom.buildFragment('<div></div>');
		var callback = sinon.stub();
		globalEvalStyles.runStylesInElement(element, callback);
		assert.strictEqual(0, callback.callCount);
		async.nextTick(function() {
			assert.strictEqual(1, callback.callCount);
			done();
		});
	});

});


function assertComputedStyle(property, value) {
	assert.strictEqual(value, window.getComputedStyle(document.body, null)[property]);
}
