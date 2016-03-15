'use strict';

import { object } from 'metal';
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

	describe('Custom renderIncDom', function() {
		it('should render content specified by the component\'s renderIncDom', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('span', null, ['id', this.component_.id], 'foo', 'foo');
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('span', null, ['id', this.component_.id], 'foo', 'foo');
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
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

		it('should allow changing tag name of root element', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('span', null, ['id', this.component_.id]);
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementVoid('div', null, ['id', this.component_.id]);
			};

			var element = document.createElement('div');
			var parent = document.createElement('div');
			component = new TestComponent({
				element: element
			}).render(parent);
			assert.strictEqual(element, component.element);
			assert.strictEqual(parent, component.element.parentNode);
		});

		it('should guarantee that rendered component element always has id set', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.text(this.component_.foo);
				IncDom.elementClose('div');
			};

			component = new TestComponent().render();
			assert.strictEqual(component.id, component.element.id);
		});
	});

	describe('Existing Content', function() {
		it('should not change existing content if the same that would be rendered', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpen('div', null, 'class', 'inner');
				IncDom.text('foo');
				IncDom.elementClose('div');
				IncDom.elementClose('div');
			};

			var element = document.createElement('div');
			dom.append(element, '<div class="inner">foo</div>');
			var innerElement = element.querySelector('.inner');
			component = new TestComponent({
				element: element
			}).render();

			assert.strictEqual(element, component.element);
			assert.strictEqual(innerElement, component.element.querySelector('.inner'));
			assert.strictEqual('foo', component.element.textContent);
		});

		it('should override existing content if element tag is different from what would be rendered', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpen('div', null, 'class', 'inner');
				IncDom.text('foo');
				IncDom.elementClose('div');
				IncDom.elementClose('div');
			};

			var element = document.createElement('div');
			dom.append(element, '<span class="inner">foo</span>');
			var innerElement = element.querySelector('.inner');
			component = new TestComponent({
				element: element
			}).render();

			assert.strictEqual(element, component.element);
			assert.notStrictEqual(innerElement, component.element.querySelector('.inner'));
			assert.strictEqual('foo', component.element.textContent);
		});

		it('should not override existing content if only attributes are different', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpen('div', null, [], 'class', 'inner');
				IncDom.text('foo');
				IncDom.elementClose('div');
				IncDom.elementClose('div');
			};

			var element = document.createElement('div');
			dom.append(element, '<div class="inner2">foo</div>');
			var innerElement = element.querySelector('.inner2');
			component = new TestComponent({
				element: element
			}).render();

			assert.strictEqual(element, component.element);
			assert.strictEqual(innerElement, component.element.querySelector('.inner'));
			assert.strictEqual('foo', component.element.textContent);
			assert.ok(dom.hasClass(innerElement, 'inner'));
			assert.ok(!dom.hasClass(innerElement, 'inner2'));
		});
	});

	describe('Inline Listeners', function() {
		it('should attach listeners from "data-on<event>" attributes', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id], 'data-onclick', 'handleClick');
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
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

		it('should attach listeners on existing children from the given element', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
				IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();

			var element = document.createElement('div');
			dom.append(element, '<div></div>');
			var innerElement = element.childNodes[0];
			component = new TestComponent({
				element: element
			}).render();
			assert.strictEqual(innerElement, component.element.childNodes[0]);

			dom.triggerEvent(innerElement, 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should remove unused inline listeners when dom is updated', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
				IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				if (this.component_.keydown) {
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

		it('should remove all inline listeners when element is detached', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id], 'data-onkeydown', 'handleKeydown');
				IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();
			TestComponent.prototype.handleKeydown = sinon.stub();

			component = new TestComponent().render();
			sinon.spy(component, 'removeListener');
			component.detach();

			assert.strictEqual(2, component.removeListener.callCount);
			assert.notStrictEqual(-1, component.removeListener.args[0][0][0].indexOf('keydown'));
			assert.notStrictEqual(-1, component.removeListener.args[1][0][0].indexOf('click'));
		});
	});

	describe('Nested Components', function() {
		var ChildComponent;

		beforeEach(function() {
			ChildComponent = createTestComponentClass();
			ChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id], 'data-child', '1');
				IncDom.elementVoid('button', null, null, 'data-onclick', 'handleClick');
				IncDom.text(this.component_.foo);
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
				IncDom.elementVoid('ChildComponent', null, ['id', 'child'], 'foo', this.component_.foo);
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
				IncDom.elementVoid('ChildComponent', null, ['id', 'child'], 'foo', this.component_.foo);
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
				IncDom.elementVoid('ChildComponent', null, ['id', 'child'], 'foo', this.component_.foo);
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
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
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
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

		it('should create and render sub component instance from Component tag', function() {
			var TestChildComponent = createTestComponentClass();
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
				IncDom.elementVoid('Component', null, [], 'ctor', TestChildComponent, 'data', {
					id: 'child'
				});
				IncDom.elementClose('div');
			};
			component = new TestComponent().render();

			var child = component.components.child;
			assert.ok(child);
			assert.ok(child instanceof TestChildComponent);
			assert.strictEqual(child.element, component.element.querySelector('#child'));
		});

		it('should update sub component data from Component tag', function(done) {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.ATTRS = {
				foo: {}
			};

			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
				IncDom.elementVoid('Component', null, [], 'ctor', TestChildComponent, 'data', {
					foo: this.component_.foo,
					id: 'child'
				});
				IncDom.elementClose('div');
			};
			TestComponent.ATTRS = {
				foo: {}
			};
			component = new TestComponent({
				foo: 'foo'
			}).render();

			var child = component.components.child;
			assert.strictEqual('foo', child.foo);

			component.foo = 'bar';
			component.once('attrsSynced', function() {
				assert.strictEqual('bar', child.foo);
				done();
			});
		});

		it('should dispose sub components that are unused after an update', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.component_.id]);
				for (var i = 1; i <= this.component_.count; i++) {
						IncDom.elementVoid('ChildComponent', null, ['id', 'child' + i]);
				}
				IncDom.elementClose('div');
			};
			TestComponent.ATTRS = {
				count: {
					value: 3
				}
			};
			component = new TestComponent().render();
			var subComps = object.mixin({}, component.components);
			assert.strictEqual(3, Object.keys(subComps).length);
			assert.ok(subComps.child1);
			assert.ok(subComps.child2);
			assert.ok(subComps.child3);

			component.count = 2;
			component.once('attrsSynced', function() {
				assert.strictEqual(2, Object.keys(component.components).length);
				assert.ok(component.components.child1);
				assert.ok(component.components.child2);
				assert.ok(!component.components.child3);

				assert.ok(!subComps.child1.isDisposed());
				assert.ok(!subComps.child2.isDisposed());
				assert.ok(subComps.child3.isDisposed());
				done();
			});
		});
	});

	function createTestComponentClass(opt_renderer) {
		class TestComponent extends Component {
		}
		TestComponent.RENDERER = opt_renderer || createIncrementalDomRenderer();
		return TestComponent;
	}

	function createIncrementalDomRenderer() {
		class TestRenderer extends IncrementalDomRenderer {
		}
		return TestRenderer;
	}
});
