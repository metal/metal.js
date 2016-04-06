'use strict';

import core from 'metal';
import Component from '../src/Component';
import ComponentRenderer from '../src/ComponentRenderer';

describe('ComponentRenderer', function() {
	var renderer;

	afterEach(function() {
		renderer.dispose();
	});

	it('should call the render method when the component is rendered', function() {
		var component = new Component();

		sinon.spy(ComponentRenderer.prototype, 'render');
		renderer = new ComponentRenderer(component);

		component.emit('render');
		assert.strictEqual(1, renderer.render.callCount);
		ComponentRenderer.prototype.render.restore();
	});

	it('should set element to simple empty div as the default render implementation', function() {
		var component = new Component();
		renderer = new ComponentRenderer(component);
		component.emit('render');

		assert.ok(core.isElement(component.element));
		assert.strictEqual('DIV', component.element.tagName);
	});

	it('should not call the render method after disposed', function() {
		var component = new Component();

		sinon.spy(ComponentRenderer.prototype, 'render');
		renderer = new ComponentRenderer(component);

		renderer.dispose();
		component.emit('render');
		assert.strictEqual(0, renderer.render.callCount);
		ComponentRenderer.prototype.render.restore();
	});

	it('should not call the update method if state changes before render', function(done) {
		var component = new Component({}, false);
		renderer = new ComponentRenderer(component);
		sinon.spy(renderer, 'update');

		component.addToState('foo');
		component.foo = 'foo';
		component.once('stateChanged', function() {
			assert.strictEqual(0, renderer.update.callCount);
			done();
		});
	});

	it('should call the update method if state changes after render', function(done) {
		var component = new Component();
		renderer = new ComponentRenderer(component);
		sinon.spy(renderer, 'update');

		component.addToState('foo');
		component.emit('render');

		component.foo = 'foo';
		component.once('stateChanged', function() {
			assert.strictEqual(1, renderer.update.callCount);

			component.foo = 'bar';
			component.once('stateChanged', function() {
				assert.strictEqual(2, renderer.update.callCount);
				done();
			});
		});
	});

	it('should not call update method after disposed', function(done) {
		var component = new Component();
		renderer = new ComponentRenderer(component);
		sinon.spy(renderer, 'update');

		component.addToState('foo');
		component.emit('render');
		renderer.dispose();

		component.foo = 'foo';
		component.once('stateChanged', function() {
			assert.strictEqual(0, renderer.update.callCount);
			done();
		});
	});
});
