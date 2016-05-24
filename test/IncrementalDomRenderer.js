'use strict';

import { object } from 'metal';
import dom from 'metal-dom';
import { Component, ComponentRegistry } from 'metal-component';
import IncrementalDomChildren from '../src/children/IncrementalDomChildren';
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

	describe('Custom component renderIncDom', function() {
		it('should render content specified by the component\'s render function', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.render = function() {
				IncDom.elementOpen('span', null, null, 'foo', 'foo');
				IncDom.text('bar');
				IncDom.elementClose('span');
			};

			component = new TestComponent();
			assert.strictEqual('SPAN', component.element.tagName);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});
	});

	describe('Custom renderer renderIncDom', function() {
		it('should render content specified by the renderer\'s renderIncDom', function() {
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

		it('should render content specified by the renderer\'s renderIncDom inside given element', function() {
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

		it('should run component\'s "rendered" lifecycle method on first render', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('span', null, null, 'foo', 'foo');
				IncDom.text('bar');
				IncDom.elementClose('span');
			};
			sinon.spy(TestComponent.prototype, 'rendered');

			component = new TestComponent();
			assert.strictEqual(1, component.rendered.callCount);
			assert.ok(component.rendered.args[0][0]);
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

		it('should run component\'s "rendered" lifecycle method on updates', function(done) {
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
			sinon.spy(TestComponent.prototype, 'rendered');

			component = new TestComponent();
			component.foo = 'bar';
			component.once('stateSynced', function() {
				assert.strictEqual(2, component.rendered.callCount);
				assert.ok(!component.rendered.args[1][0]);
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

		it('should not throw error if no content is rendered for component', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
			};

			component = new TestComponent();
			assert.ok(!component.element);
		});

		it('should reposition component on requested parent when its content is back after an update', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				if (!this.component_.noElement) {
					IncrementalDOM.elementVoid('div');
				}
			};
			TestComponent.STATE = {
				noElement: {
				}
			};

			var parent = document.createElement('div');
			component = new TestComponent({}, parent);
			assert.ok(component.element);
			assert.strictEqual(parent, component.element.parentNode);

			var prevElement = component.element;
			component.noElement = true;
			component.once('stateSynced', function() {
				assert.ok(!component.element);
				assert.ok(!prevElement.parentNode);

				component.noElement = false;
				component.once('stateSynced', function() {
					assert.ok(component.element);
					assert.strictEqual(parent, component.element.parentNode);
					done();
				});
			});
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
				IncDom.elementClose('input');
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

		it('should add/remove html attributes by using boolean values', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementVoid('button', null, [], 'disabled', this.disabled);
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				disabled: {
					value: true
				}
			};

			component = new TestComponent();
			assert.ok(component.element.disabled);
			assert.strictEqual('', component.element.getAttribute('disabled'));

			component.disabled = false;
			component.once('stateSynced', function() {
				assert.ok(!component.element.disabled);
				assert.ok(!component.element.getAttribute('disabled'));
				done();
			});
		});
	});

	describe('Existing Content', function() {
		it('should not change existing content if the same that would be rendered', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpen('div', null, [], 'class', 'inner');
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

		it('should run component\'s "rendered" lifecycle method when rendered as sub component', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid('ChildComponent', null, ['key', 'child']);
				IncDom.elementClose('div');
			};

			sinon.spy(ChildComponent.prototype, 'rendered');
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual(1, child.rendered.callCount);
			assert.ok(child.rendered.args[0][0]);
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

		it('should run component\'s "rendered" lifecycle method when updated as sub component', function(done) {
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

			sinon.spy(ChildComponent.prototype, 'rendered');
			component = new TestComponent();

			component.foo = 'bar';
			component.once('stateSynced', function() {
				var child = component.components.child;
				assert.strictEqual(2, child.rendered.callCount);
				assert.ok(!child.rendered.args[1][0]);
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

		it('should not remove sub component key when this sub component updates itself', function(done) {
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

		it('should create and render sub component instance from constructor tag', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid(ChildComponent, null, ['key', 'child']);
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.ok(child instanceof ChildComponent);
			assert.strictEqual(child.element, component.element.querySelector('child'));
			assert.strictEqual('foo', child.element.textContent);
			assert.ok(child.element.hasAttribute('data-child'));
		});

		it('should update sub component data from constructor tag', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid(ChildComponent, 'child', [], 'foo', this.component_.foo);
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
				var newChild = component.components.child;
				assert.strictEqual(child, newChild);
				assert.strictEqual('bar', child.foo);
				done();
			});
		});

		it('should not reuse component with same key if constructor is different"', function(done) {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementVoid('div');
			};
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				if (this.component_.switch) {
					IncDom.elementVoid(TestChildComponent, 'child');
				} else {
					IncDom.elementVoid(ChildComponent, 'child');
				}
				IncDom.elementClose('div');
			};
			TestComponent.STATE = {
				switch: {
				}
			};

			component = new TestComponent();
			var child = component.components.child;
			assert.ok(child instanceof ChildComponent);
			assert.strictEqual(child.element, component.element.childNodes[0]);
			assert.strictEqual('CHILD', child.element.tagName);

			component.switch = true;
			component.once('stateSynced', function() {
				var newChild = component.components.child;
				assert.notStrictEqual(child, newChild);
				assert.ok(newChild instanceof TestChildComponent);
				assert.strictEqual(newChild.element, component.element.childNodes[0]);
				assert.strictEqual('DIV', newChild.element.tagName);
				done();
			});
		});

		it('should pass rendering data to component\'s config property"', function() {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementVoid('child', null, null, 'data-foo', this.component_.config.foo);
			};
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid(TestChildComponent, 'child', [], 'foo', 'foo');
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual('foo', child.element.getAttribute('data-foo'));
		});

		it('should pass tree of incremental dom calls as "children"', function() {
			var TestChildComponent = createTestComponentClass();
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpen(TestChildComponent, 'child');
				IncDom.elementOpen('span');
				IncDom.text('Hello World');
				IncDom.elementClose('span');
				IncDom.elementClose(TestChildComponent);
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.ok(child instanceof TestChildComponent);

			var children = child.config.children;
			assert.ok(children);

			assert.strictEqual(1, children.length);
			assert.ok(!children[0].text);
			assert.strictEqual('span', children[0].tag);
			assert.ok(children[0].config);
			assert.strictEqual(1, children[0].config.children.length);
			assert.strictEqual('Hello World', children[0].config.children[0].text);
			assert.ok(!children[0].config.children[0].config);
		});

		it('should render children via "IncrementalDomRenderer.renderChild"', function() {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('child');
				this.component_.config.children.forEach(IncrementalDomRenderer.renderChild);
				IncDom.elementClose('child');
			};
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpen(TestChildComponent, 'child');
				IncDom.elementOpen('span');
				IncDom.text('Hello World');
				IncDom.elementClose('span');
				IncDom.elementClose(TestChildComponent);
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.ok(child instanceof TestChildComponent);
			assert.strictEqual(1, child.element.childNodes.length);
			assert.strictEqual('SPAN', child.element.childNodes[0].tagName);
			assert.strictEqual('Hello World', child.element.childNodes[0].textContent);
		});

		it('should render only selected nodes from "children" config', function() {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('child');
				IncrementalDomRenderer.renderChild(this.component_.config.children[1]);
				IncDom.elementClose('child');
			};
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpen(TestChildComponent, 'child');
				IncDom.elementVoid('span', null, ['class', 'first']);
				IncDom.elementVoid('span', null, ['class', 'second']);
				IncDom.elementVoid('span', null, ['class', 'third']);
				IncDom.elementClose(TestChildComponent);
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual(1, child.element.childNodes.length);
			assert.strictEqual('SPAN', child.element.childNodes[0].tagName);
			assert.ok(dom.hasClass(child.element.childNodes[0], 'second'));
		});

		it('should render correctly when recursive children are used', function() {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('child');
				this.component_.config.children.forEach(IncrementalDomRenderer.renderChild);
				IncDom.elementClose('child');
			};
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpen(TestChildComponent, 'child');
				IncDom.elementOpen(TestChildComponent, 'child2');
				IncDom.elementOpen(TestChildComponent, 'child3');
				IncDom.elementOpen('span');
				IncDom.text('Hello World');
				IncDom.elementClose('span');
				IncDom.elementClose(TestChildComponent);
				IncDom.elementClose(TestChildComponent);
				IncDom.elementClose(TestChildComponent);
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			var child2 = component.components.child2;
			var child3 = component.components.child3;
			assert.ok(child instanceof TestChildComponent);
			assert.ok(child2 instanceof TestChildComponent);
			assert.ok(child3 instanceof TestChildComponent);
			assert.ok(!child.components.child2);
			assert.strictEqual(child.element, component.element.childNodes[0]);
			assert.strictEqual(1, child.element.childNodes.length);
			assert.strictEqual('CHILD', child.element.childNodes[0].tagName);
			assert.strictEqual(child2.element, child.element.childNodes[0]);
			assert.strictEqual(1, child2.element.childNodes.length);
			assert.strictEqual('CHILD', child2.element.childNodes[0].tagName);
			assert.strictEqual(child3.element, child2.element.childNodes[0]);
			assert.strictEqual(1, child3.element.childNodes.length);
			assert.strictEqual('Hello World', child2.element.childNodes[0].textContent);
		});

		it('should pass same children array when there are no children', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid(ChildComponent, 'child', [], 'foo', this.component_.foo);
				IncDom.elementClose('div');
			};
			TestComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};

			component = new TestComponent();
			var child = component.components.child;
			var children = child.config.children;
			assert.ok(children);

			component.foo = 'foo2';
			component.once('stateSynced', function() {
				assert.strictEqual(children, child.config.children);
				done();
			});
		});

		it('should pass context data to all descendants', function() {
			var TestGrandChildComponent = createTestComponentClass();
			TestGrandChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementVoid('grandchild');
			};

			var TestChildComponent = createTestComponentClass();
			TestChildComponent.prototype.getChildContext = function() {
				return {
					bar: 'bar'
				};
			};
			TestChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('child');
				this.component_.config.children.forEach(IncrementalDomRenderer.renderChild);
				IncDom.elementClose('child');
			};

			var TestComponent = createTestComponentClass();
			TestComponent.prototype.getChildContext = function() {
				return {
					foo: 'foo'
				};
			};
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpen(TestChildComponent, 'child');
				IncDom.elementVoid(TestGrandChildComponent, 'grandChild');
				IncDom.elementClose(TestChildComponent);
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			var grandChild = component.components.grandChild;
			assert.ok(child instanceof TestChildComponent);
			assert.ok(grandChild instanceof TestGrandChildComponent);
			assert.ok(!component.context.foo);
			assert.ok(!component.context.bar);
			assert.strictEqual('foo', child.context.foo);
			assert.ok(!child.context.bar);
			assert.strictEqual('foo', grandChild.context.foo);
			assert.strictEqual('bar', grandChild.context.bar);
		});

		it('should use the same element from sub component if no wrapper is given', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementVoid(ChildComponent, 'child');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual(child.element, component.element);
		});

		it('should use the same element from children sub component if no wrapper is given', function() {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.RENDERER.prototype.renderIncDom = function() {
				this.component_.config.children.forEach(IncrementalDomRenderer.renderChild);
			};

			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpen(TestChildComponent, 'child');
				IncDom.elementVoid(ChildComponent, 'child2');
				IncDom.elementClose(TestChildComponent);
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			var child2 = component.components.child2;
			assert.strictEqual(child.element, child2.element);
			assert.notStrictEqual(component.element, child.element);
		});

		it('should use same keys for children components when rerendered after update', function(done) {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncrementalDOM.elementOpen('div');
				IncrementalDOM.text(this.foo);
				this.component_.config.children.forEach(IncrementalDomRenderer.renderChild);
				IncrementalDOM.elementClose('div');
			};
			TestChildComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};

			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementOpen(TestChildComponent, 'child');
				IncDom.elementVoid(ChildComponent);
				IncDom.elementClose(TestChildComponent);
				IncDom.elementClose('div');
			};
			component = new TestComponent();
			assert.strictEqual(2, Object.keys(component.components).length);

			var child = component.components.child;
			var child2 = component.components.childsub0;
			assert.ok(child);
			assert.ok(child2);

			child.foo = 'foo2';
			child.once('stateSynced', function() {
				assert.strictEqual(2, Object.keys(component.components).length);
				assert.strictEqual(child, component.components.child);
				assert.strictEqual(child2, component.components.childsub0);
				assert.ok(!component.components.sub1);
				done();
			});
		});

		it('should position previously empty child component correctly inside parent', function(done) {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.RENDERER.prototype.renderIncDom = function() {
				if (!this.component_.empty) {
					IncrementalDOM.elementVoid('div');
				}
			};
			TestChildComponent.STATE = {
				empty: {
					value: true
				}
			};

			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.elementVoid(TestChildComponent, 'child');
				IncDom.elementClose('div');
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.ok(!child.element);
			assert.strictEqual(0, component.element.childNodes.length);

			child.empty = false;
			child.once('stateSynced', function() {
				assert.ok(child.element);
				assert.strictEqual(1, component.element.childNodes.length);
				assert.strictEqual(child.element, component.element.childNodes[0]);
				done();
			});
		});

		describe('Non Incremental DOM sub component', function() {
			beforeEach(function() {
				sinon.stub(console, 'warn');
			});

			afterEach(function() {
				console.warn.restore();
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
					IncDom.elementVoid(TestChildComponent);
					IncDom.elementClose('div');
				};

				component = new TestComponent();
				assert.strictEqual(1, console.warn.callCount);
			});

			it('should use the same element from sub component even if it doesn\'t use incremental dom', function() {
				class TestChildComponent extends Component {
					constructor() {
						super();
						this.element = document.createElement('div');
					}
				}

				var TestComponent = createTestComponentClass();
				TestComponent.RENDERER.prototype.renderIncDom = function() {
					IncDom.elementVoid(TestChildComponent, 'child');
				};
				component = new TestComponent();

				var child = component.components.child;
				assert.strictEqual(child.element, component.element);
			});
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

	describe('Function - shouldUpdate', function() {
		it('should only rerender after state change if "shouldUpdate" returns true', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.shouldUpdate = function(changes) {
				return changes.foo && (changes.foo.prevVal !== changes.foo.newVal);
			};
			TestComponent.STATE = {
				bar: {
					value: 'bar'
				},
				foo: {
					value: 'foo'
				}
			};

			component = new TestComponent();
			var renderer = component.getRenderer();
			sinon.spy(renderer, 'patch');

			component.bar = 'bar2';
			component.once('stateSynced', function() {
				assert.strictEqual(0, renderer.patch.callCount);
				component.foo = 'foo2';
				component.once('stateSynced', function() {
					assert.strictEqual(1, renderer.patch.callCount);
					done();
				});
			});
		});

		describe('Nested Components', function() {
			beforeEach(function() {
				sinon.spy(IncrementalDOM, 'skip');
			});

			afterEach(function() {
				IncrementalDOM.skip.restore();
			});

			it('should not rerender child component if its "shouldUpdate" returns false', function(done) {
				var TestChildComponent = createTestComponentClass();
				TestChildComponent.RENDERER.prototype.renderIncDom = function() {
					IncDom.elementOpen('span');
					IncDom.text('Child');
					IncDom.elementClose('span');
				};
				TestChildComponent.prototype.shouldUpdate = function() {
					return false;
				};

				var TestComponent = createTestComponentClass();
				TestComponent.RENDERER.prototype.renderIncDom = function() {
					IncDom.elementOpen('div');
					IncDom.text(this.component_.foo);
					IncDom.elementVoid(TestChildComponent, 'child');
					IncDom.elementClose('div');
				};
				TestComponent.STATE = {
					foo: {
						value: 'foo'
					}
				};

				component = new TestComponent();
				var child = component.components.child;

				component.foo = 'foo2';
				component.once('stateSynced', function() {
					assert.strictEqual(1, IncrementalDOM.skip.callCount);
					assert.strictEqual('foo2', component.element.childNodes[0].textContent);
					assert.strictEqual(child.element, component.element.childNodes[1]);
					assert.strictEqual('SPAN', child.element.tagName);
					assert.strictEqual('Child', child.element.textContent);
					done();
				});
			});
		});

		it('should correctly reposition child component even if its "shouldUpdate" returns false', function(done) {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('span');
				IncDom.text('Child');
				IncDom.elementClose('span');
			};
			TestChildComponent.prototype.shouldUpdate = function() {
				return false;
			};

			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				if (this.component_.wrap) {
					IncDom.elementOpen('div', null, [], 'class', 'wrapper');
				}
				IncDom.elementVoid(TestChildComponent, 'child');
				if (this.component_.wrap) {
					IncDom.elementClose('div');
				}
				IncDom.elementClose('div');
			};
			TestComponent.STATE = {
				wrap: {
				}
			};

			component = new TestComponent();
			var child = component.components.child;
			assert.strictEqual(1, component.element.childNodes.length);
			assert.strictEqual(child.element, component.element.childNodes[0]);
			assert.strictEqual('SPAN', child.element.tagName);
			assert.strictEqual('Child', child.element.textContent);

			component.wrap = true;
			component.once('stateSynced', function() {
				assert.strictEqual(1, component.element.childNodes.length);
				assert.ok(dom.hasClass(component.element.childNodes[0], 'wrapper'));
				assert.strictEqual(child.element, component.element.childNodes[0].childNodes[0]);
				assert.strictEqual('SPAN', child.element.tagName);
				assert.strictEqual('Child', child.element.textContent);
				done();
			});
		});

		it('should skip child update without error if it had no element before', function(done) {
			var TestChildComponent = createTestComponentClass();
			TestChildComponent.prototype.render = function() {
			};
			TestChildComponent.prototype.shouldUpdate = function() {
				return false;
			};

			var TestComponent = createTestComponentClass();
			TestComponent.RENDERER.prototype.renderIncDom = function() {
				IncDom.elementOpen('div');
				IncDom.text(this.component_.foo);
				IncDom.elementVoid(TestChildComponent, 'child');
				IncDom.elementClose('div');
			};
			TestComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};

			component = new TestComponent();
			var child = component.components.child;
			sinon.spy(child, 'render');

			component.foo = 'foo2';
			component.once('stateSynced', function() {
				assert.strictEqual(0, child.render.callCount);
				assert.strictEqual(1, component.element.childNodes.length);
				assert.strictEqual('foo2', component.element.childNodes[0].textContent);
				assert.ok(!child.element);
				done();
			});
		});
	});

	describe('Componentless function tags', function() {
		it('should render componentless function passed as incremental dom tag', function() {
			var TestFunction = ({foo}) => {
				IncDom.elementOpen('span');
				IncDom.text(foo);
				return IncDom.elementClose('span');
			};

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid(TestFunction, null, [], 'foo', 'foo');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent();
			assert.strictEqual(0, Object.keys(component.components).length);
			assert.strictEqual(1, component.element.childNodes.length);
			assert.strictEqual('SPAN', component.element.childNodes[0].tagName);
			assert.strictEqual('foo', component.element.childNodes[0].textContent);
		});

		it('should render children from componentless function passed as incremental dom tag', function() {
			var TestFunction = ({children}) => {
				IncDom.elementOpen('span');
				children.forEach(IncrementalDomRenderer.renderChild);
				return IncDom.elementClose('span');
			};

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementOpen(TestFunction, null, [], 'foo', 'foo');
					IncDom.text('children');
					IncDom.elementClose(TestFunction);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent();
			assert.strictEqual(0, Object.keys(component.components).length);
			assert.strictEqual(1, component.element.childNodes.length);
			assert.strictEqual('SPAN', component.element.childNodes[0].tagName);
			assert.strictEqual('children', component.element.childNodes[0].textContent);
		});
	});

	describe('IncrementalDomRenderer.isIncDomNode', function() {
		it('should check if given data is an incremental dom node', function() {
			assert.ok(!IncrementalDomRenderer.isIncDomNode({}));
			assert.ok(!IncrementalDomRenderer.isIncDomNode({
				tag: 'span'
			}));
			assert.ok(IncrementalDomRenderer.isIncDomNode({
				[IncrementalDomChildren.CHILD_OWNER]: true
			}));
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
