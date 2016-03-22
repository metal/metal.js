'use strict';

import { object } from 'metal';
import SoyAop from '../src/SoyAop';

describe('SoyAop', function() {
	afterEach(function() {
		SoyAop.stopAllInterceptions();
	});

	it('should intercept calls to template functions that were registered', function() {
		var templates = {
			fn1: sinon.stub(),
			fn2: sinon.stub(),
			fn3: sinon.stub()
		};
		var originals = object.mixin({}, templates);
		SoyAop.registerForInterception(templates, 'fn1');
		SoyAop.registerForInterception(templates, 'fn2');

		var interceptor = sinon.stub();
		SoyAop.startInterception(interceptor);

		templates.fn1();
		assert.strictEqual(0, originals.fn1.callCount);
		assert.strictEqual(1, interceptor.callCount);

		templates.fn2();
		assert.strictEqual(0, originals.fn2.callCount);
		assert.strictEqual(2, interceptor.callCount);

		templates.fn3();
		assert.strictEqual(1, originals.fn3.callCount);
		assert.strictEqual(2, interceptor.callCount);
	});

	it('should get original function', function() {
		var templates = {
			fn1: sinon.stub(),
			fn2: sinon.stub()
		};
		var originals = object.mixin({}, templates);
		SoyAop.registerForInterception(templates, 'fn1');
		SoyAop.registerForInterception(templates, 'fn2');

		var interceptor = sinon.stub();
		SoyAop.startInterception(interceptor);

		assert.notStrictEqual(originals.fn1, templates.fn1);
		assert.strictEqual(originals.fn1, SoyAop.getOriginalFn(templates.fn1));
		assert.strictEqual(originals.fn1, SoyAop.getOriginalFn(originals.fn1));

		assert.notStrictEqual(originals.fn2, templates.fn2);
		assert.strictEqual(originals.fn2, SoyAop.getOriginalFn(templates.fn2));
		assert.strictEqual(originals.fn2, SoyAop.getOriginalFn(originals.fn2));
	});

	it('should pass correct params to intercepted call', function() {
		var templates = {
			fn1: sinon.stub(),
			fn2: sinon.stub()
		};
		SoyAop.registerForInterception(templates, 'fn1');
		SoyAop.registerForInterception(templates, 'fn2');

		var interceptor = sinon.stub();
		SoyAop.startInterception(interceptor);

		var data = {};
		var ijData = {};
		templates.fn1(data, null, ijData);
		assert.strictEqual(SoyAop.getOriginalFn(templates.fn1), interceptor.args[0][0]);
		assert.strictEqual(data, interceptor.args[0][1]);
		assert.strictEqual(ijData, interceptor.args[0][3]);

		templates.fn2(data, null, ijData);
		assert.strictEqual(SoyAop.getOriginalFn(templates.fn2), interceptor.args[1][0]);
		assert.strictEqual(data, interceptor.args[1][1]);
		assert.strictEqual(ijData, interceptor.args[1][3]);
	});

	it('should stop intercepting calls to template functions', function() {
		var templates = {
			fn: sinon.stub()
		};
		SoyAop.registerForInterception(templates, 'fn');

		var interceptor = sinon.stub();
		SoyAop.startInterception(interceptor);
		SoyAop.stopInterception(interceptor);

		templates.fn({}, null, {});
		assert.strictEqual(1, SoyAop.getOriginalFn(templates.fn).callCount);
		assert.strictEqual(0, interceptor.callCount);
	});

	it('should restart intercepting calls to template functions', function() {
		var templates = {
			fn: sinon.stub()
		};
		SoyAop.registerForInterception(templates, 'fn');

		var interceptor = sinon.stub();
		SoyAop.startInterception(interceptor);
		SoyAop.stopInterception(interceptor);
		SoyAop.startInterception(interceptor);

		templates.fn({}, null, {});
		assert.strictEqual(0, SoyAop.getOriginalFn(templates.fn).callCount);
		assert.strictEqual(1, interceptor.callCount);
	});

	it('should go back to previous intercepting function when interception is stopped', function() {
		var templates = {
			fn: sinon.stub()
		};
		SoyAop.registerForInterception(templates, 'fn');

		var interceptor1 = sinon.stub();
		var interceptor2 = sinon.stub();

		SoyAop.startInterception(interceptor1);
		SoyAop.startInterception(interceptor2);

		templates.fn({}, null, {});
		assert.strictEqual(0, SoyAop.getOriginalFn(templates.fn).callCount);
		assert.strictEqual(0, interceptor1.callCount);
		assert.strictEqual(1, interceptor2.callCount);

		SoyAop.stopInterception();
		templates.fn({}, null, {});
		assert.strictEqual(0, SoyAop.getOriginalFn(templates.fn).callCount);
		assert.strictEqual(1, interceptor1.callCount);
		assert.strictEqual(1, interceptor2.callCount);

		SoyAop.stopInterception();
		templates.fn({}, null, {});
		assert.strictEqual(1, SoyAop.getOriginalFn(templates.fn).callCount);
		assert.strictEqual(1, interceptor1.callCount);
		assert.strictEqual(1, interceptor2.callCount);
	});

	it('should register templates after interception has already started', function() {
		var interceptor = sinon.stub();
		SoyAop.startInterception(interceptor);

		var templates = {
			fn: sinon.stub()
		};
		SoyAop.registerForInterception(templates, 'fn');

		templates.fn({}, null, {});
		assert.strictEqual(0, SoyAop.getOriginalFn(templates.fn).callCount);
		assert.strictEqual(1, interceptor.callCount);
	});

	it('should not replace template function if it has already been replaced', function() {
		SoyAop.startInterception(sinon.stub());

		var templates = {
			fn: sinon.stub()
		};
		SoyAop.registerForInterception(templates, 'fn');

		var replacedFn = templates.fn;
		SoyAop.registerForInterception(templates, 'fn');
		assert.strictEqual(replacedFn, templates.fn);
	});
});
