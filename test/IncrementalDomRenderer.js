'use strict';

import dom from 'metal-dom';
import { Component, ComponentRegistry } from 'metal-component';
import IncrementalDomRenderer from '../src/IncrementalDomRenderer';

var IncDom = IncrementalDOM;

describe('IncrementalDomRenderer', function() {
	var component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	describe('Default renderIncDom', function() {
		it('should build div element by default', function() {
			var TestComponent = createTestComponentClass();
			component = new TestComponent().render();
			assert.strictEqual('DIV', component.element.tagName);
		});

		it('should render empty div element by default', function() {
			var TestComponent = createTestComponentClass();
			component = new TestComponent().render();
			assert.strictEqual('DIV', component.element.tagName);
			assert.strictEqual(0, component.element.childNodes.length);
		});
	});

	describe('Component renderIncDom', function() {
		it('should render content specified by the component\'s renderIncDom', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('span', null, ['id', this.id], 'foo', 'foo');
				IncDom.text('bar');
				IncDom.elementClose('span');
			};

			component = new TestComponent().render();
			assert.strictEqual('SPAN', component.element.tagName);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});

		it('should render content specified by the component\'s renderIncDom inside given element', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('span', null, ['id', this.id], 'foo', 'foo');
				IncDom.text('bar');
				IncDom.elementClose('span');
			};

			var element = document.createElement('span');
			component = new TestComponent({
				element: element
			}).render();
			assert.strictEqual(element, component.element);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});

		it('should update content when attribute values change', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.text(this.foo);
				IncDom.elementClose('div');
			};
			TestComponent.ATTRS = {
				foo: {
					value: 'foo'
				}
			};

			component = new TestComponent().render();
			assert.strictEqual('foo', component.element.textContent);

			component.foo = 'bar';
			component.once('attrsSynced', function() {
				assert.strictEqual('bar', component.element.textContent);
				done();
			});
		});

		it('should allow changing tag name of root element', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('span', null, ['id', this.id]);
				IncDom.text('bar');
				IncDom.elementClose('span');
			};

			var element = document.createElement('div');
			component = new TestComponent({
				element: element
			}).render();
			assert.notStrictEqual(element, component.element);
			assert.strictEqual('SPAN', component.element.tagName);
		});

		it('should attach given element on specified parent', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementVoid('div', null, ['id', this.id]);
			};

			var element = document.createElement('div');
			var parent = document.createElement('div');
			component = new TestComponent({
				element: element
			}).render(parent);
			assert.strictEqual(element, component.element);
			assert.strictEqual(parent, component.element.parentNode);
		});

		it('should guarantee that component element always has id set', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.text(this.foo);
				IncDom.elementClose('div');
			};

			component = new TestComponent().render();
			assert.strictEqual(component.id, component.element.id);
		});
	});

	describe('Subclass renderer renderIncDom', function() {
		var CustomRenderer;

		beforeEach(function() {
			class TestRenderer extends IncrementalDomRenderer {
			}
			CustomRenderer = TestRenderer;
		});

		it('should render and update content specified by the renderer\'s renderIncDom', function(done) {
			var TestComponent = createTestComponentClass(CustomRenderer);
			CustomRenderer.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.text(this.component_.foo);
				IncDom.elementClose('div');
			};
			TestComponent.ATTRS = {
				foo: {
					value: 'foo'
				}
			};

			component = new TestComponent().render();
			assert.strictEqual('foo', component.element.textContent);

			component.foo = 'bar';
			component.once('attrsSynced', function() {
				assert.strictEqual('bar', component.element.textContent);
				done();
			});
		});

		it('should render content specified by the renderer function defined by FN_NAME', function() {
			var TestComponent = createTestComponentClass(CustomRenderer);
			CustomRenderer.prototype.renderFn = function() {
				IncDom.elementOpen('span', null, ['id', this.id], 'foo', 'foo');
				IncDom.text('bar');
				IncDom.elementClose('span');
			};
			CustomRenderer.FN_NAME = 'renderFn';

			component = new TestComponent().render();
			assert.strictEqual('SPAN', component.element.tagName);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});
	});

	describe('Inline Listeners', function() {
		it('should attach listeners from "data-on<event>" attributes', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent().render();
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element.childNodes[0], 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should attach listeners from root element', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id], 'data-onclick', 'handleClick');
				IncDom.elementVoid('div');
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent().render();
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should attach listeners from elementOpenStart/elementOpenEnd calls', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementOpenStart('div');
				IncDom.attr('data-onclick', 'handleClick');
				IncDom.elementOpenEnd();
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent().render();
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element.childNodes[0], 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should remove unused inline listeners when dom is updated', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				if (this.keydown) {
					IncDom.elementVoid('div', null, null, 'data-onkeydown', 'handleKeydown');
				}
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();
			TestComponent.prototype.handleKeydown = sinon.stub();
			TestComponent.ATTRS = {
				keydown: {
					value: true
				}
			};

			component = new TestComponent().render();
			dom.triggerEvent(component.element.childNodes[1], 'keydown');
			assert.strictEqual(1, component.handleKeydown.callCount);

			sinon.spy(component, 'removeListener');
			component.keydown = false;
			component.once('attrsSynced', function() {
				assert.strictEqual(2, component.removeListener.callCount);
				assert.notStrictEqual(-1, component.removeListener.args[0][0][0].indexOf('keydown'));
				assert.strictEqual('attrsSynced', component.removeListener.args[1][0]);
				done();
			});
		});
	});

	describe('Nested Components', function() {
		var ChildComponent;

		beforeEach(function() {
			ChildComponent = createTestComponentClass();
			ChildComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id], 'data-child', '1');
				IncDom.elementVoid('button', null, null, 'data-onclick', 'handleClick');
				IncDom.text(this.foo);
				IncDom.elementClose('div');
			};
			ChildComponent.prototype.handleClick = sinon.stub();
			ChildComponent.ATTRS = {
				foo: {
					value: 'foo'
				}
			};
			ComponentRegistry.register(ChildComponent, 'ChildComponent');
		});

		it('should create sub component instance', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementVoid('ChildComponent', null, ['id', 'child']);
				IncDom.elementClose('div');
			};
			component = new TestComponent().render();

			var child = component.components.child;
			assert.ok(child);
			assert.ok(child instanceof ChildComponent);
		});

		it('should render sub component at specified place', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementVoid('ChildComponent', null, ['id', 'child']);
				IncDom.elementClose('div');
			};
			component = new TestComponent().render();

			var child = component.components.child;
			assert.strictEqual(child.element, component.element.querySelector('#child'));
			assert.strictEqual('foo', child.element.textContent);
			assert.ok(child.element.hasAttribute('data-child'));
		});

		it('should pass attributes to sub component', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementVoid('ChildComponent', null, ['id', 'child'], 'foo', 'bar');
				IncDom.elementClose('div');
			};
			component = new TestComponent().render();

			var child = component.components.child;
			assert.strictEqual('child', child.id);
			assert.strictEqual('bar', child.foo);
			assert.strictEqual('bar', child.element.textContent);
		});

		it('should update sub component attributes and content', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementVoid('ChildComponent', null, ['id', 'child'], 'foo', this.foo);
				IncDom.elementClose('div');
			};
			TestComponent.ATTRS = {
				foo: {
					value: 'foo'
				}
			};
			component = new TestComponent().render();

			component.foo = 'bar';
			component.once('attrsSynced', function() {
				var child = component.components.child;
				assert.strictEqual('bar', child.foo);
				assert.strictEqual('bar', child.element.textContent);
				done();
			});
		});

		it('should not try to rerender sub component later when attrs change during parent rendering', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementVoid('ChildComponent', null, ['id', 'child'], 'foo', this.foo);
				IncDom.elementClose('div');
			};
			TestComponent.ATTRS = {
				foo: {
					value: 'foo'
				}
			};
			component = new TestComponent().render();

			component.foo = 'bar';
			component.once('attrsSynced', function() {
				var child = component.components.child;
				sinon.spy(child.getRenderer(), 'patch');
				child.once('attrsSynced', function() {
					assert.strictEqual(0, child.getRenderer().patch.callCount);
					done();
				});
			});
		});

		it('should rerender sub component when attrs change after parent rendering', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementVoid('ChildComponent', null, ['id', 'child'], 'foo', this.foo);
				IncDom.elementClose('div');
			};
			TestComponent.ATTRS = {
				foo: {
					value: 'foo'
				}
			};
			component = new TestComponent().render();

			component.foo = 'bar';
			component.once('attrsSynced', function() {
				var child = component.components.child;
				child.foo = 'bar2';
				sinon.spy(child.getRenderer(), 'patch');
				child.once('attrsSynced', function() {
					assert.strictEqual(1, child.getRenderer().patch.callCount);
					assert.strictEqual('bar2', child.element.textContent);
					done();
				});
			});
		});

		it('should attach sub component inline listeners', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementVoid('ChildComponent', null, ['id', 'child']);
				IncDom.elementClose('div');
			};
			component = new TestComponent().render();

			var child = component.components.child;
			assert.strictEqual(0, child.handleClick.callCount);

			var button = child.element.querySelector('button');
			dom.triggerEvent(button, 'click');
			assert.strictEqual(1, child.handleClick.callCount);
		});

		it('should generate sub component id if none is given', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementVoid('ChildComponent');
				IncDom.elementClose('div');
			};
			component = new TestComponent().render();

			var componentNames = Object.keys(component.components);
			assert.strictEqual(1, componentNames.length);

			var child = component.components[componentNames[0]];
			assert.ok(child instanceof ChildComponent);
		});

		it('should render sub component via elementOpen/elementClose', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementOpen('ChildComponent', null, ['id', 'child']);
				IncDom.elementClose('ChildComponent');
				IncDom.elementClose('div');
			};
			component = new TestComponent().render();

			var child = component.components.child;
			assert.strictEqual(child.element, component.element.querySelector('#child'));
			assert.strictEqual('foo', child.element.textContent);
			assert.ok(child.element.hasAttribute('data-child'));
		});

		it('should render sub component via elementOpenStart/elementOpenEnd', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementOpenStart('ChildComponent', null, ['id', 'child']);
				IncDom.attr('foo', 'bar');
				IncDom.elementOpenEnd();
				IncDom.elementClose('ChildComponent');
				IncDom.elementClose('div');
			};
			component = new TestComponent().render();

			var child = component.components.child;
			assert.strictEqual('bar', child.foo);
			assert.strictEqual(child.element, component.element.querySelector('#child'));
			assert.strictEqual('bar', child.element.textContent);
			assert.ok(child.element.hasAttribute('data-child'));
		});
	});

	function createTestComponentClass(opt_renderer) {
		class TestComponent extends Component {
		}
		TestComponent.RENDERER = opt_renderer || IncrementalDomRenderer;
		return TestComponent;
	}
});
