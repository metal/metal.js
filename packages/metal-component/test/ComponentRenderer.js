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

	it('should return the component via getComponent()', function() {
		const renderer = new ComponentRenderer(componentStub);
		assert.strictEqual(componentStub, renderer.getComponent());
	});

	it('should set element to simple empty div as the default render implementation', function() {
		const renderer = new ComponentRenderer(componentStub);
		renderer.render();
		assert.ok(isElement(componentStub.element));
		assert.strictEqual('DIV', componentStub.element.tagName);
	});

	it('should call component\'s "informRendered" function after rendered', function() {
		const renderer = new ComponentRenderer(componentStub);
		assert.equal(0, componentStub.informRendered.callCount);

		renderer.render();
		assert.equal(1, componentStub.informRendered.callCount);
	});

	it('should return nothing by default from getExtraDataConfig', function() {
		const renderer = new ComponentRenderer(componentStub);
		assert.strictEqual(null, renderer.getExtraDataConfig());
	});

	it('should have a function called "update"', function() {
		const renderer = new ComponentRenderer(componentStub);
		assert.ok(isFunction(renderer.update));
		assert.doesNotThrow(() => renderer.update());
	});
});
