'use strict';

import core from 'metal';
import Component from '../src/Component';
import ComponentRenderer from '../src/ComponentRenderer';

describe('ComponentRenderer', function() {
	var renderer;

	afterEach(function() {
		renderer.dispose();
	});

	it('should return a simple div element from buildElement', function() {
		renderer = new ComponentRenderer(new Component());
		var element = renderer.buildElement();
		assert.ok(core.isElement(element));
		assert.strictEqual('DIV', element.tagName);
	});

	it('should call the render method when the component is rendered', function() {
		var component = new Component();

		sinon.spy(ComponentRenderer.prototype, 'render');
		renderer = new ComponentRenderer(component);

		component.render();
		assert.strictEqual(1, renderer.render.callCount);
		ComponentRenderer.prototype.render.restore();
	});

	it('should not call the render method after disposed', function() {
		var component = new Component();

		sinon.spy(ComponentRenderer.prototype, 'render');
		renderer = new ComponentRenderer(component);

		renderer.dispose();
		component.render();
		assert.strictEqual(0, renderer.render.callCount);
		ComponentRenderer.prototype.render.restore();
	});

	it('should not call the update method if attributes change before render', function(done) {
		var component = new Component();
		renderer = new ComponentRenderer(component);
		sinon.spy(renderer, 'update');

		component.addAttr('foo');
		component.foo = 'foo';
		component.once('attrsChanged', function() {
			assert.strictEqual(0, renderer.update.callCount);
			done();
		});
	});

	it('should call the update method if attributes change after render', function(done) {
		var component = new Component();
		renderer = new ComponentRenderer(component);
		sinon.spy(renderer, 'update');

		component.addAttr('foo');
		component.render();

		component.foo = 'foo';
		component.once('attrsChanged', function() {
			assert.strictEqual(1, renderer.update.callCount);

			component.foo = 'bar';
			component.once('attrsChanged', function() {
				assert.strictEqual(2, renderer.update.callCount);
				done();
			});
		});
	});

	it('should not call update method after disposed', function(done) {
		var component = new Component();
		renderer = new ComponentRenderer(component);
		sinon.spy(renderer, 'update');

		component.addAttr('foo');
		component.render();
		renderer.dispose();

		component.foo = 'foo';
		component.once('attrsChanged', function() {
			assert.strictEqual(0, renderer.update.callCount);
			done();
		});
	});
});
