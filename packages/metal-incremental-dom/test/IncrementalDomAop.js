'use strict';

import core from 'metal';
import dom from 'metal-dom';
import IncrementalDomAop from '../src/IncrementalDomAop';

describe('IncrementalDomAop', function() {
	var element;

	beforeEach(function() {
		element = document.createElement('div');
		dom.enterDocument(element);
	});

	afterEach(function() {
		IncrementalDomAop.stopInterception();
		dom.exitDocument(element);
	});

	describe('Original Functions', function() {
		it('should return the original functions', function() {
			var originalFns = IncrementalDomAop.getOriginalFns();
			assert.ok(originalFns);
			assert.ok(originalFns.attr);
			assert.ok(originalFns.attributes);
			assert.ok(originalFns.elementClose);
			assert.ok(originalFns.elementOpen);
			assert.ok(originalFns.elementOpenEnd);
			assert.ok(originalFns.elementOpenStart);
			assert.ok(originalFns.elementVoid);
			assert.ok(originalFns.text);
		});
	});

	describe('elementOpen', function() {
		it('should intercept elementOpen calls with specified function', function() {
			var fn = sinon.stub();
			IncrementalDomAop.startInterception({
				elementOpen: fn
			});
			IncrementalDOM.elementOpen('div', 'key', 'statics', 'name', 'value');

			assert.strictEqual(1, fn.callCount);
			assert.strictEqual('div', fn.args[0][0]);
			assert.strictEqual('key', fn.args[0][1]);
			assert.strictEqual('statics', fn.args[0][2]);
			assert.strictEqual('name', fn.args[0][3]);
			assert.strictEqual('value', fn.args[0][4]);
		});

		it('should stop intercepting elementOpen calls', function() {
			var fn = sinon.stub();
			IncrementalDomAop.startInterception({
				elementOpen: fn
			});
			IncrementalDomAop.stopInterception();

			IncrementalDOM.patch(element, () => IncrementalDOM.elementOpen('div'));
			assert.strictEqual(0, fn.callCount);
		});
	});

	describe('elementVoid', function() {
		it('should intercept elementOpen and elementClose from elementVoid calls with specified function', function() {
			var openFn = sinon.stub();
			var closeFn = sinon.stub();
			IncrementalDomAop.startInterception({
				elementClose: closeFn,
				elementOpen: openFn
			});

			IncrementalDOM.elementVoid('div', 'key', 'statics', 'name', 'value');
			assert.strictEqual(1, openFn.callCount);
			assert.strictEqual('div', openFn.args[0][0]);
			assert.strictEqual('key', openFn.args[0][1]);
			assert.strictEqual('statics', openFn.args[0][2]);
			assert.strictEqual('name', openFn.args[0][3]);
			assert.strictEqual('value', openFn.args[0][4]);
			assert.strictEqual(1, closeFn.callCount);
		});

		it('should stop intercepting elementOpen from elementVoid calls', function() {
			var fn = sinon.stub();
			IncrementalDomAop.startInterception({
				elementOpen: fn
			});
			IncrementalDomAop.stopInterception();

			IncrementalDOM.patch(element, () => IncrementalDOM.elementVoid('div'));
			assert.strictEqual(0, fn.callCount);
		});
	});

	describe('elementOpenStart/elementOpenEnd', function() {
		it('should intercept elementOpen from elementOpenEnd calls with specified function', function() {
			var fn = sinon.stub();
			IncrementalDomAop.startInterception({
				elementOpen: fn
			});

			IncrementalDOM.elementOpenStart('div', 'key', 'statics');
			IncrementalDOM.attr('name', 'value');
			IncrementalDOM.attr('name2', 'value2');
			IncrementalDOM.elementOpenEnd('div');
			assert.strictEqual(1, fn.callCount);
			assert.strictEqual('div', fn.args[0][0]);
			assert.strictEqual('key', fn.args[0][1]);
			assert.strictEqual('statics', fn.args[0][2]);
			assert.strictEqual('name', fn.args[0][3]);
			assert.strictEqual('value', fn.args[0][4]);
			assert.strictEqual('name2', fn.args[0][5]);
			assert.strictEqual('value2', fn.args[0][6]);
		});

		it('should stop intercepting elementOpen from elementOpenEnd calls', function() {
			var fn = sinon.stub();
			IncrementalDomAop.startInterception({
				elementOpen: fn
			});
			IncrementalDomAop.stopInterception();

			IncrementalDOM.patch(element, () => {
				IncrementalDOM.elementOpenStart('div');
				IncrementalDOM.elementOpenEnd('div');
			});
			assert.strictEqual(0, fn.callCount);
		});
	});

	describe('text', function() {
		it('should intercept "text" calls with specified function', function() {
			var fn = sinon.stub();
			IncrementalDomAop.startInterception({
				text: fn
			});

			IncrementalDOM.text('foo');
			assert.strictEqual(1, fn.callCount);
			assert.strictEqual('foo', fn.args[0][0]);
		});

		it('should stop intercepting "text" calls', function() {
			var fn = sinon.stub();
			IncrementalDomAop.startInterception({
				text: fn
			});
			IncrementalDomAop.stopInterception();

			IncrementalDOM.patch(element, () => IncrementalDOM.text('foo'));
			assert.strictEqual(0, fn.callCount);
		});
	});

	describe('attributes', function() {
		it('should intercept attribute calls with specified function', function() {
			var fn = sinon.stub();
			IncrementalDomAop.startInterception({
				attributes: fn
			});

			var element = document.createElement('div');
			IncrementalDOM.attributes[IncrementalDOM.symbols.default](element, 'name', 'value');

			assert.strictEqual(1, fn.callCount);
			assert.ok(core.isElement(fn.args[0][0]));
			assert.strictEqual('name', fn.args[0][1]);
			assert.strictEqual('value', fn.args[0][2]);
		});

		it('should stop intercepting attribute calls', function() {
			var fn = sinon.stub();
			IncrementalDomAop.startInterception({
				attributes: fn
			});
			IncrementalDomAop.stopInterception();

			IncrementalDOM.attributes[IncrementalDOM.symbols.default](element, 'name', 'value');
			assert.strictEqual(0, fn.callCount);
		});
	});

	describe('Nested interceptions', function() {
		afterEach(function() {
			IncrementalDomAop.stopInterception();
		});

		it('should use last registered function for intercepting', function() {
			var fn = sinon.stub();
			IncrementalDomAop.startInterception({
				elementOpen: fn
			});
			var fn2 = sinon.stub();
			IncrementalDomAop.startInterception({
				elementOpen: fn2
			});

			IncrementalDOM.elementOpen('div');
			assert.strictEqual(0, fn.callCount);
			assert.strictEqual(1, fn2.callCount);
		});

		it('should revert to previous registered function when stopping interception', function() {
			var fn = sinon.stub();
			IncrementalDomAop.startInterception({
				elementOpen: fn
			});
			var fn2 = sinon.stub();
			IncrementalDomAop.startInterception({
				elementOpen: fn2
			});

			IncrementalDomAop.stopInterception();
			IncrementalDOM.elementOpen('div');
			assert.strictEqual(1, fn.callCount);
			assert.strictEqual(0, fn2.callCount);

			IncrementalDomAop.stopInterception();
			IncrementalDOM.patch(element, () => {
				IncrementalDOM.elementOpen('div');
				IncrementalDOM.elementClose('div');
			});
			assert.strictEqual(1, fn.callCount);
			assert.strictEqual(0, fn2.callCount);
		});
	});
});
