'use strict';

import IncrementalDomAop from '../src/IncrementalDomAop';

describe('IncrementalDomAop', function() {
	afterEach(function() {
		IncrementalDomAop.stopInterception();
	});

	describe('elementOpen', function(){
		it('should intercept elementOpen calls with specified function', function() {
			var original = IncrementalDOM.elementOpen;
			var fn = sinon.stub();
			IncrementalDomAop.startInterception(fn);
			assert.notStrictEqual(original, IncrementalDOM.elementOpen);

			IncrementalDOM.elementOpen('div', 'key', 'statics', 'name', 'value');
			assert.strictEqual(1, fn.callCount);
			assert.strictEqual(original, fn.args[0][0]);
			assert.strictEqual('div', fn.args[0][1]);
			assert.strictEqual('key', fn.args[0][2]);
			assert.strictEqual('statics', fn.args[0][3]);
			assert.strictEqual('name', fn.args[0][4]);
			assert.strictEqual('value', fn.args[0][5]);
		});

		it('should stop intercepting elementOpen calls', function() {
			var original = IncrementalDOM.elementOpen;
			var fn = sinon.stub();
			IncrementalDomAop.startInterception(fn);
			assert.notStrictEqual(original, IncrementalDOM.elementOpen);

			IncrementalDomAop.stopInterception();
			assert.strictEqual(original, IncrementalDOM.elementOpen);
		});
	});

	describe('elementVoid', function() {
		beforeEach(function() {
			sinon.stub(IncrementalDOM, 'elementClose');
		});

		afterEach(function() {
			IncrementalDOM.elementClose.restore();
		});

		it('should intercept elementOpen from elementVoid calls with specified function', function() {
			var originalVoid = IncrementalDOM.elementVoid;
			var originalOpen = IncrementalDOM.elementOpen;
			var fn = sinon.stub();
			IncrementalDomAop.startInterception(fn);
			assert.notStrictEqual(originalVoid, IncrementalDOM.elementVoid);
			assert.strictEqual(0, IncrementalDOM.elementClose.callCount);

			IncrementalDOM.elementVoid('div', 'key', 'statics', 'name', 'value');
			assert.strictEqual(1, fn.callCount);
			assert.strictEqual(originalOpen, fn.args[0][0]);
			assert.strictEqual('div', fn.args[0][1]);
			assert.strictEqual('key', fn.args[0][2]);
			assert.strictEqual('statics', fn.args[0][3]);
			assert.strictEqual('name', fn.args[0][4]);
			assert.strictEqual('value', fn.args[0][5]);
			assert.strictEqual(1, IncrementalDOM.elementClose.callCount);
		});

		it('should stop intercepting elementOpen from elementVoid calls', function() {
			var original = IncrementalDOM.elementVoid;
			var fn = sinon.stub();
			IncrementalDomAop.startInterception(fn);
			assert.notStrictEqual(original, IncrementalDOM.elementVoid);

			IncrementalDomAop.stopInterception();
			assert.strictEqual(original, IncrementalDOM.elementVoid);
		});
	});

	describe('elementOpenStart/elementOpenEnd', function() {
		it('should intercept elementOpen from elementOpenEnd calls with specified function', function() {
			var originalEnd = IncrementalDOM.elementOpenEnd;
			var originalOpen = IncrementalDOM.elementOpen;
			var fn = sinon.stub();
			IncrementalDomAop.startInterception(fn);
			assert.notStrictEqual(originalEnd, IncrementalDOM.elementOpenEnd);

			IncrementalDOM.elementOpenStart('div', 'key', 'statics');
			IncrementalDOM.attr('name', 'value');
			IncrementalDOM.attr('name2', 'value2');
			IncrementalDOM.elementOpenEnd('div');
			assert.strictEqual(1, fn.callCount);
			assert.strictEqual(originalOpen, fn.args[0][0]);
			assert.strictEqual('div', fn.args[0][1]);
			assert.strictEqual('key', fn.args[0][2]);
			assert.strictEqual('statics', fn.args[0][3]);
			assert.strictEqual('name', fn.args[0][4]);
			assert.strictEqual('value', fn.args[0][5]);
			assert.strictEqual('name2', fn.args[0][6]);
			assert.strictEqual('value2', fn.args[0][7]);
		});

		it('should stop intercepting elementOpen from elementOpenEnd calls', function() {
			var original = IncrementalDOM.elementOpenEnd;
			var fn = sinon.stub();
			IncrementalDomAop.startInterception(fn);
			assert.notStrictEqual(original, IncrementalDOM.elementOpenEnd);

			IncrementalDomAop.stopInterception();
			assert.strictEqual(original, IncrementalDOM.elementOpenEnd);
		});
	});

	describe('Nested interceptions', function() {
		it('should use last registered function for intercepting', function() {
			var fn = sinon.stub();
			IncrementalDomAop.startInterception(fn);
			var fn2 = sinon.stub();
			IncrementalDomAop.startInterception(fn2);

			IncrementalDOM.elementOpen('div');
			assert.strictEqual(0, fn.callCount);
			assert.strictEqual(1, fn2.callCount);
		});

		it('should revert to previous registered function when stopping interception', function() {
			var original = IncrementalDOM.elementOpen;

			var fn = sinon.stub();
			IncrementalDomAop.startInterception(fn);
			var fn2 = sinon.stub();
			IncrementalDomAop.startInterception(fn2);

			IncrementalDomAop.stopInterception();
			IncrementalDOM.elementOpen('div');
			assert.strictEqual(1, fn.callCount);
			assert.strictEqual(0, fn2.callCount);

			IncrementalDomAop.stopInterception();
			assert.strictEqual(1, fn.callCount);
			assert.strictEqual(0, fn2.callCount);
			assert.strictEqual(original, IncrementalDOM.elementOpen);
		});
	});
});
