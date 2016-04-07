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
		it('should render empty div element by default', function() {
			var TestComponent = createTestComponentClass();
			component = new TestComponent();
			assert.strictEqual('DIV', component.element.tagName);
			assert.strictEqual(0, component.element.childNodes.length);
		});
	});

	describe('Custom renderIncDom', function() {
		it('should render content specified by the component\'s renderIncDom', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('span', null, null, 'foo', 'foo');
				IncDom.text('bar');
				IncDom.elementClose('span');
			};

			component = new TestComponent();
			assert.strictEqual('SPAN', component.element.tagName);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});

		it('should pass initial config object to renderIncDom', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function(data) {
				IncDom.elementOpen('span', null, null, 'foo', data.foo);
				IncDom.text('bar');
				IncDom.elementClose('span');
			};

			var config = {
				foo: 'foo'
			};
			component = new TestComponent(config);
			assert.strictEqual('SPAN', component.element.tagName);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});

		it('should render content specified by the component\'s renderIncDom inside given element', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('span', null, null, 'foo', 'foo');
				IncDom.text('bar');
				IncDom.elementClose('span');
			};

			var element = document.createElement('span');
			component = new TestComponent({
				element: element
			});
			assert.strictEqual(element, component.element);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});

		it('should update content when state values change', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.text(this.component_.foo);
				IncDom.elementClose('div');
			};
			TestComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};

			component = new TestComponent();
			assert.strictEqual('foo', component.element.textContent);

			component.foo = 'bar';
			component.once('stateSynced', function() {
				assert.strictEqual('bar', component.element.textContent);
				done();
			});
		});

		it('should allow changing tag name of root element', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('span');
				IncDom.text('bar');
				IncDom.elementClose('span');
			};

			var element = document.createElement('div');
			component = new TestComponent({
				element: element
			});
			assert.notStrictEqual(element, component.element);
			assert.strictEqual('SPAN', component.element.tagName);
		});

		it('should attach given element on specified parent', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementVoid('div');
			};

			var element = document.createElement('div');
			var parent = document.createElement('div');
			component = new TestComponent(
				{
					element: element
				},
				parent
			);
			assert.strictEqual(element, component.element);
			assert.strictEqual(parent, component.element.parentNode);
		});

		it('should uncheck input element when "checked" attribute is removed', function(done) {
			var input = document.createElement('input');
			input.type = 'checkbox';
			input.checked = true;

			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpenStart('input');
				IncDom.attr('type', 'checkbox');
				if (this.component_.checked) {
					IncDom.attr('checked', '');
				}
				IncDom.elementOpenEnd('input');
			};
			TestComponent.STATE = {
				checked: {
				}
			};

			component = new TestComponent({
				checked: true,
				element: input
			});
			assert.ok(input.checked);

			component.checked = false;
			component.once('stateSynced', function() {
				assert.ok(!input.checked);
				done();
			});
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
			});

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
			});

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
			});

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
				IncDom.elementOpen('div');
				IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent();
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element.childNodes[0], 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should attach listeners from root element', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, null, 'data-onclick', 'handleClick');
				IncDom.elementVoid('div');
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent();
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should attach listeners from elementOpenStart/elementOpenEnd calls', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpenStart('div');
				IncDom.attr('data-onclick', 'handleClick');
				IncDom.elementOpenEnd();
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent();
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element.childNodes[0], 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should attach listeners on existing children from the given element', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();

			var element = document.createElement('div');
			dom.append(element, '<div></div>');
			var innerElement = element.childNodes[0];
			component = new TestComponent({
				element: element
			});
			assert.strictEqual(innerElement, component.element.childNodes[0]);

			dom.triggerEvent(innerElement, 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should remove unused inline listeners when dom is updated', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				if (this.component_.keydown) {
					IncDom.elementVoid('div', null, null, 'data-onkeydown', 'handleKeydown');
				}
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();
			TestComponent.prototype.handleKeydown = sinon.stub();
			TestComponent.STATE = {
				keydown: {
					value: true
				}
			};

			component = new TestComponent();
			dom.triggerEvent(component.element.childNodes[1], 'keydown');
			assert.strictEqual(1, component.handleKeydown.callCount);

			sinon.spy(component, 'removeListener');
			component.keydown = false;
			component.once('stateSynced', function() {
				assert.strictEqual(2, component.removeListener.callCount);
				assert.notStrictEqual(-1, component.removeListener.args[0][0][0].indexOf('keydown'));
				assert.strictEqual('stateSynced', component.removeListener.args[1][0]);
				done();
			});
		});

		it('should remove all inline listeners when element is detached', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, null, 'data-onkeydown', 'handleKeydown');
				IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();
			TestComponent.prototype.handleKeydown = sinon.stub();

			component = new TestComponent();
			sinon.spy(component, 'removeListener');
			component.detach();

			assert.strictEqual(2, component.removeListener.callCount);
			assert.notStrictEqual(-1, component.removeListener.args[0][0][0].indexOf('keydown'));
			assert.notStrictEqual(-1, component.removeListener.args[1][0][0].indexOf('click'));
		});

		it('should attach listeners functions passed to "data-on<event>" attributes', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('div', null, null, 'data-onclick', this.component_.handleClick);
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent();
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element.childNodes[0], 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should update inline listeners when dom is updated', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				var fn = this.component_.switch ? this.component_.handleClick2 : this.component_.handleClick;
				IncDom.elementVoid('div', null, null, 'data-onclick', fn);
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();
			TestComponent.prototype.handleClick2 = sinon.stub();
			TestComponent.STATE = {
				switch: {}
			};

			component = new TestComponent();
			dom.triggerEvent(component.element.childNodes[0], 'click');
			assert.strictEqual(1, component.handleClick.callCount);
			assert.strictEqual(0, component.handleClick2.callCount);

			component.switch = true;
			component.once('stateSynced', function() {
				dom.triggerEvent(component.element.childNodes[0], 'click');
				assert.strictEqual(1, component.handleClick.callCount);
				assert.strictEqual(1, component.handleClick2.callCount);
				done();
			});
		});
	});

	describe('Nested Components', function() {
		var ChildComponent;

		beforeEach(function() {
			ChildComponent = createTestComponentClass();
			ChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('child', null, null, 'data-child', '1');
				IncDom.elementVoid('button', null, null, 'data-onclick', 'handleClick');
				IncDom.text(this.component_.foo);
				IncDom.elementClose('child');
			};
			ChildComponent.prototype.handleClick = sinon.stub();
			ChildComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};
			ComponentRegistry.register(ChildComponent, 'ChildComponent');
		});

		it('should create sub component instance', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('ChildComponent', null, ['key', 'child']);
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.ok(child);
			assert.ok(child instanceof ChildComponent);
		});

		it('should render sub component at specified place', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('ChildComponent', null, ['key', 'child']);
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual(child.element, component.element.querySelector('child'));
			assert.strictEqual('foo', child.element.textContent);
			assert.ok(child.element.hasAttribute('data-child'));
		});

		it('should pass state to sub component', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('ChildComponent', null, ['key', 'child'], 'foo', 'bar');
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual('bar', child.foo);
			assert.strictEqual('bar', child.element.textContent);
		});

		it('should update sub component state and content', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('ChildComponent', null, ['key', 'child'], 'foo', this.component_.foo);
				IncDom.elementClose('div');
			};
			TestComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};
			component = new TestComponent();

			component.foo = 'bar';
			component.once('stateSynced', function() {
				var child = component.components.child;
				assert.strictEqual('bar', child.foo);
				assert.strictEqual('bar', child.element.textContent);
				done();
			});
		});

		it('should not try to rerender sub component later when state changes during parent rendering', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('ChildComponent', null, ['key', 'child'], 'foo', this.component_.foo);
				IncDom.elementClose('div');
			};
			TestComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};
			component = new TestComponent();

			component.foo = 'bar';
			component.once('stateSynced', function() {
				var child = component.components.child;
				sinon.spy(child.getRenderer(), 'patch');
				child.once('stateSynced', function() {
					assert.strictEqual(0, child.getRenderer().patch.callCount);
					done();
				});
			});
		});

		it('should rerender sub component when state changes after parent rendering', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('ChildComponent', null, ['key', 'child'], 'foo', this.component_.foo);
				IncDom.elementClose('div');
			};
			TestComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};
			component = new TestComponent();

			component.foo = 'bar';
			component.once('stateSynced', function() {
				var child = component.components.child;
				child.foo = 'bar2';
				sinon.spy(child.getRenderer(), 'patch');
				child.once('stateSynced', function() {
					assert.strictEqual(1, child.getRenderer().patch.callCount);
					assert.strictEqual('bar2', child.element.textContent);
					done();
				});
			});
		});

		it('should not remove sub component key when it updates itself', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('ChildComponent', null, ['key', 'child']);
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual('child', child.element.__incrementalDOMData.key);

			child.foo = 'bar';
			child.once('stateSynced', function() {
				assert.strictEqual('child', child.element.__incrementalDOMData.key);
				assert.strictEqual(child.element, component.element.querySelector('child'));
				assert.strictEqual('bar', child.element.textContent);
				done();
			});
		});

		it('should attach sub component inline listeners', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('ChildComponent', null, ['key', 'child']);
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual(0, child.handleClick.callCount);

			var button = child.element.querySelector('button');
			dom.triggerEvent(button, 'click');
			assert.strictEqual(1, child.handleClick.callCount);
		});

		it('should generate sub component key if none is given', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('ChildComponent');
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.sub0;
			assert.ok(child instanceof ChildComponent);
		});

		it('should update sub component with generated key', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('ChildComponent');
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.sub0;
			child.foo = 'bar';
			child.once('stateSynced', function() {
				assert.strictEqual(child, component.components.sub0);
				assert.strictEqual(child.element, component.element.querySelector('child'));
				assert.strictEqual('bar', child.element.textContent);
				done();
			});
		});

		it('should render sub component via elementOpen/elementClose', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpen('ChildComponent', null, ['key', 'child']);
				IncDom.elementClose('ChildComponent');
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual(child.element, component.element.querySelector('child'));
			assert.strictEqual('foo', child.element.textContent);
			assert.ok(child.element.hasAttribute('data-child'));
		});

		it('should render sub component via elementOpenStart/elementOpenEnd', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpenStart('ChildComponent', null, ['key', 'child']);
				IncDom.attr('foo', 'bar');
				IncDom.elementOpenEnd();
				IncDom.elementClose('ChildComponent');
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual('bar', child.foo);
			assert.strictEqual(child.element, component.element.querySelector('child'));
			assert.strictEqual('bar', child.element.textContent);
			assert.ok(child.element.hasAttribute('data-child'));
		});

		it('should create and render sub component instance from Component tag', function() {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementVoid('child');
			};
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('Component', null, [], 'ctor', TestChildComponent, 'data', {
					key: 'child'
				});
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.ok(child);
			assert.ok(child instanceof TestChildComponent);
			assert.strictEqual(child.element, component.element.querySelector('child'));
		});

		it('should create and render sub component instance with no data from Component tag', function() {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementVoid('child');
			};
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('Component', null, [], 'ctor', TestChildComponent);
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.sub0;
			assert.ok(child);
			assert.ok(child instanceof TestChildComponent);
			assert.strictEqual(child.element, component.element.querySelector('child'));
		});

		it('should update sub component data from Component tag', function(done) {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementVoid('child');
			};
			TestChildComponent.STATE = {
				foo: {}
			};

			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('Component', null, [], 'ctor', TestChildComponent, 'data', {
					foo: this.component_.foo,
					key: 'child'
				});
				IncDom.elementClose('div');
			};
			TestComponent.STATE = {
				foo: {}
			};
			component = new TestComponent({
				foo: 'foo'
			});

			var child = component.components.child;
			assert.strictEqual('foo', child.foo);

			component.foo = 'bar';
			component.once('stateSynced', function() {
				assert.strictEqual('bar', child.foo);
				done();
			});
		});

		it('should pass rendering data to sub component\'s "renderIncDom"', function() {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.RENDERER.prototype.renderIncDom = function(config = {}) {
				IncDom.elementVoid('child', null, null, 'data-foo', config.foo);
			};
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('Component', null, [], 'ctor', TestChildComponent, 'data', {
					key: 'child',
					foo: 'foo'
				});
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual('foo', child.element.getAttribute('data-foo'));
		});

		it('should not keep sub component rendering data on parent component', function() {
			var TestChildComponent = createTestComponentClass();
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('Component', null, [], 'ctor', TestChildComponent, 'data', {
					foo: 'foo'
				});
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			assert.ok(!component.getRenderer().getRenderingData().foo);
		});

		it('should warn if rendering sub component that doesn\'t use incremental dom', function() {
			class TestChildComponent extends Component {
				constructor() {
					super();
					this.element = document.createElement('div');
				}
			}
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('Component', null, [], 'ctor', TestChildComponent);
				IncDom.elementClose('div');
			};

			sinon.stub(console, 'warn');
			component = new TestComponent();
			assert.strictEqual(1, console.warn.callCount);
			console.warn.restore();
		});

		it('should dispose sub components that are unused after an update', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				for (var i = 1; i <= this.component_.count; i++) {
					IncDom.elementVoid('ChildComponent', null, ['key', 'child' + i]);
				}
				IncDom.elementClose('div');
			};
			TestComponent.STATE = {
				count: {
					value: 3
				}
			};
			component = new TestComponent();
			var subComps = object.mixin({}, component.components);
			assert.strictEqual(3, Object.keys(subComps).length);
			assert.ok(subComps.child1);
			assert.ok(subComps.child2);
			assert.ok(subComps.child3);

			component.count = 2;
			component.once('stateSynced', function() {
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
