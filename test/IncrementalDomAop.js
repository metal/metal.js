'use strict';

import IncrementalDomAop from '../src/IncrementalDomAop';

describe('IncrementalDomAop', function() {
	afterEach(function() {
		IncrementalDomAop.stopInterception();
	});

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

	it('should intercept elementVoid calls with specified function', function() {
		var original = IncrementalDOM.elementVoid;
		var fn = sinon.stub();
		IncrementalDomAop.startInterception(fn);
		assert.notStrictEqual(original, IncrementalDOM.elementVoid);

		IncrementalDOM.elementVoid('div', 'key', 'statics', 'name', 'value');
		assert.strictEqual(1, fn.callCount);
		assert.strictEqual(original, fn.args[0][0]);
		assert.strictEqual('div', fn.args[0][1]);
		assert.strictEqual('key', fn.args[0][2]);
		assert.strictEqual('statics', fn.args[0][3]);
		assert.strictEqual('name', fn.args[0][4]);
		assert.strictEqual('value', fn.args[0][5]);
	});

	it('should stop intercepting elementVoid calls', function() {
		var original = IncrementalDOM.elementVoid;
		var fn = sinon.stub();
		IncrementalDomAop.startInterception(fn);
		assert.notStrictEqual(original, IncrementalDOM.elementVoid);

		IncrementalDomAop.stopInterception();
		assert.strictEqual(original, IncrementalDOM.elementVoid);
	});

	it('should intercept elementOpenEnd calls with specified function', function() {
		var original = IncrementalDOM.elementOpenEnd;
		var fn = sinon.stub();
		IncrementalDomAop.startInterception(fn);
		assert.notStrictEqual(original, IncrementalDOM.elementOpenEnd);

		IncrementalDOM.elementOpenEnd('div');
		assert.strictEqual(1, fn.callCount);
		assert.strictEqual(original, fn.args[0][0]);
		assert.strictEqual('div', fn.args[0][1]);
	});

	it('should stop intercepting elementOpenEnd calls', function() {
		var original = IncrementalDOM.elementOpenEnd;
		var fn = sinon.stub();
		IncrementalDomAop.startInterception(fn);
		assert.notStrictEqual(original, IncrementalDOM.elementOpenEnd);

		IncrementalDomAop.stopInterception();
		assert.strictEqual(original, IncrementalDOM.elementOpenEnd);
	});
});
