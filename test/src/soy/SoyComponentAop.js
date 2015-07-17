'use strict';

import ComponentRegistry from '../../../src/component/ComponentRegistry';
import SoyComponentAop from '../../../src/soy/SoyComponentAop';

describe('SoyComponentAop', function() {
	beforeEach(function() {
		ComponentRegistry.Templates = {
			TestComponent: {
				test: sinon.stub()
			},
			TestComponent2: {
				test2: sinon.stub()
			}
		};
		SoyComponentAop.registeredTemplates_ = false;
	});

	it('should intercept calls to template functions', function() {
		var interceptor = sinon.stub();
		var originalFn1 = ComponentRegistry.Templates.TestComponent.test;
		var originalFn2 = ComponentRegistry.Templates.TestComponent2.test2;
		SoyComponentAop.startInterception(interceptor);

		ComponentRegistry.Templates.TestComponent.test({}, null, {});
		assert.strictEqual(0, originalFn1.callCount);
		assert.strictEqual(1, interceptor.callCount);

		ComponentRegistry.Templates.TestComponent2.test2({}, null, {});
		assert.strictEqual(0, originalFn2.callCount);
		assert.strictEqual(2, interceptor.callCount);
	});

	it('should pass correct params to intercepted call', function() {
		var interceptor = sinon.stub();
		SoyComponentAop.startInterception(interceptor);

		var data = {};
		var ijData = {};
		ComponentRegistry.Templates.TestComponent.test(data, null, ijData);
		assert.strictEqual('TestComponent', interceptor.args[0][0]);
		assert.strictEqual('test', interceptor.args[0][1]);
		assert.strictEqual(data, interceptor.args[0][3]);
		assert.strictEqual(ijData, interceptor.args[0][5]);

		ComponentRegistry.Templates.TestComponent2.test2(data, null, ijData);
		assert.strictEqual('TestComponent2', interceptor.args[1][0]);
		assert.strictEqual('test2', interceptor.args[1][1]);
		assert.strictEqual(data, interceptor.args[1][3]);
		assert.strictEqual(ijData, interceptor.args[1][5]);
	});

	it('should stop intercepting calls to template functions', function() {
		var interceptor = sinon.stub();
		var originalFn1 = ComponentRegistry.Templates.TestComponent.test;
		var originalFn2 = ComponentRegistry.Templates.TestComponent2.test2;
		SoyComponentAop.startInterception(interceptor);
		SoyComponentAop.stopInterception(interceptor);

		ComponentRegistry.Templates.TestComponent.test({}, null, {});
		assert.strictEqual(1, originalFn1.callCount);
		assert.strictEqual(0, interceptor.callCount);

		ComponentRegistry.Templates.TestComponent2.test2({}, null, {});
		assert.strictEqual(1, originalFn2.callCount);
		assert.strictEqual(0, interceptor.callCount);
	});

	it('should restart intercepting calls to template functions', function() {
		var interceptor = sinon.stub();
		var originalFn1 = ComponentRegistry.Templates.TestComponent.test;
		var originalFn2 = ComponentRegistry.Templates.TestComponent2.test2;
		SoyComponentAop.startInterception(interceptor);
		SoyComponentAop.stopInterception(interceptor);
		SoyComponentAop.startInterception(interceptor);

		ComponentRegistry.Templates.TestComponent.test({}, null, {});
		assert.strictEqual(0, originalFn1.callCount);
		assert.strictEqual(1, interceptor.callCount);

		ComponentRegistry.Templates.TestComponent2.test2({}, null, {});
		assert.strictEqual(0, originalFn2.callCount);
		assert.strictEqual(2, interceptor.callCount);
	});

	it('should register templates after interception has already started', function() {
		var interceptor = sinon.stub();
		SoyComponentAop.startInterception(interceptor);

		ComponentRegistry.Templates.NewComponent = {
			test: sinon.stub()
		};
		var originalFn = ComponentRegistry.Templates.NewComponent.test;
		SoyComponentAop.registerTemplates('NewComponent');

		ComponentRegistry.Templates.NewComponent.test({}, null, {});
		assert.strictEqual(0, originalFn.callCount);
		assert.strictEqual(1, interceptor.callCount);
	});

	it('should not replace template function if it has already been replaced', function() {
		SoyComponentAop.startInterception(sinon.stub());

		ComponentRegistry.Templates.NewComponent = {
			test: sinon.stub()
		};
		SoyComponentAop.registerTemplates('NewComponent');

		var replacedFn = ComponentRegistry.Templates.NewComponent.test;
		SoyComponentAop.registerTemplates('NewComponent');
		assert.strictEqual(replacedFn, ComponentRegistry.Templates.NewComponent.test);
	});

	it('should get original function', function() {
		var interceptor = sinon.stub();
		var originalFn1 = ComponentRegistry.Templates.TestComponent.test;
		var originalFn2 = ComponentRegistry.Templates.TestComponent2.test2;
		SoyComponentAop.startInterception(interceptor);

		var currentFn1 = ComponentRegistry.Templates.TestComponent.test;
		assert.notStrictEqual(originalFn1, currentFn1);
		assert.strictEqual(originalFn1, SoyComponentAop.getOriginalFn(currentFn1));
		assert.strictEqual(originalFn1, SoyComponentAop.getOriginalFn(originalFn1));

		var currentFn2 = ComponentRegistry.Templates.TestComponent2.test2;
		assert.notStrictEqual(originalFn2, currentFn2);
		assert.strictEqual(originalFn2, SoyComponentAop.getOriginalFn(currentFn2));
		assert.strictEqual(originalFn2, SoyComponentAop.getOriginalFn(originalFn2));
	});
});
