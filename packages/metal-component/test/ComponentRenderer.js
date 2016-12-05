'use strict';

import core from 'metal';
import Component from '../src/Component';
import ComponentRenderer from '../src/ComponentRenderer';

describe('ComponentRenderer', function() {
	var component;

	afterEach(function() {
		component.dispose();
	});

	it('should return the component via getComponent()', function() {
		component = new Component();
		const renderer = component.getRenderer();
		assert.strictEqual(component, renderer.getComponent());
	});

	it('should call the render method when the component is rendered', function() {
		sinon.spy(ComponentRenderer.prototype, 'render');
		component = new Component();
		const renderer = component.getRenderer();
		assert.strictEqual(1, renderer.render.callCount);
		ComponentRenderer.prototype.render.restore();
	});

	it('should set element to simple empty div as the default render implementation', function() {
		component = new Component();
		assert.ok(core.isElement(component.element));
		assert.strictEqual('DIV', component.element.tagName);
	});

	it('should not call the update method if state changes before render', function(done) {
		var TestComponent = createTestComponent();
		component = new TestComponent({}, false);
		const renderer = component.getRenderer();
		sinon.spy(renderer, 'update');

		component.foo = 'foo';
		component.once('stateChanged', function() {
			assert.strictEqual(0, renderer.update.callCount);
			done();
		});
	});

	it('should call the update method asynchronously if state changes', function(done) {
		var TestComponent = createTestComponent();
		component = new TestComponent();
		const renderer = component.getRenderer();
		sinon.spy(renderer, 'update');

		renderer.render();
		component.foo = 'foo';
		assert.strictEqual(0, renderer.update.callCount);
		component.once('stateChanged', function() {
			assert.strictEqual(1, renderer.update.callCount);
			var expectedData = {
				foo: {
					key: 'foo',
					prevVal: undefined,
					newVal: 'foo'
				}
			};
			assert.deepEqual(expectedData, renderer.update.args[0][0].changes);

			component.foo = 'bar';
			component.once('stateChanged', function() {
				assert.strictEqual(2, renderer.update.callCount);
				expectedData = {
					foo: {
						key: 'foo',
						prevVal: 'foo',
						newVal: 'bar'
					},
				};
				assert.deepEqual(expectedData, renderer.update.args[1][0].changes);
				done();
			});
		});
	});

	function createTestComponent() {
		class TestComponent extends Component {
		}
		TestComponent.STATE = {
			foo: {
			}
		};
		return TestComponent;
	}
});
