'use strict';

import { isElement, isFunction } from 'metal';
import ComponentRenderer from '../src/ComponentRenderer';

describe('ComponentRenderer', function() {
	let componentStub;

	beforeEach(function() {
		componentStub = {
			informRendered: sinon.stub()
		};
	});

	it('should set element to simple empty div as the default render implementation', function() {
		ComponentRenderer.render(componentStub);
		assert.ok(isElement(componentStub.element));
		assert.strictEqual('DIV', componentStub.element.tagName);
	});

	it('should call component\'s "informRendered" function after rendered', function() {
		ComponentRenderer.render(componentStub);
		assert.equal(1, componentStub.informRendered.callCount);
	});

	it('should return nothing by default from getExtraDataConfig', function() {
		assert.equal(undefined, ComponentRenderer.getExtraDataConfig(componentStub));
	});

	it('should have a function called "update"', function() {
		assert.ok(isFunction(ComponentRenderer.update));
		assert.doesNotThrow(() => ComponentRenderer.update(componentStub));
	});
});
