'use strict';

import { array, async, object } from 'metal';
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

	describe('Default render', function() {
		it('should render empty div element by default', function() {
			class TestComponent extends Component {
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent();
			assert.strictEqual('DIV', component.element.tagName);
			assert.strictEqual(0, component.element.childNodes.length);
		});
	});

	describe('Custom component render', function() {
		it('should render content specified by the renderer\'s "renderIncDom" function', function() {
			class TestRenderer extends IncrementalDomRenderer {
				renderIncDom() {
					IncDom.elementOpen('span', null, null, 'foo', 'foo');
					IncDom.text('bar');
					IncDom.elementClose('span');
				}
			}

			class TestComponent extends Component {
			}
			TestComponent.RENDERER = TestRenderer;

			component = new TestComponent();
			assert.strictEqual('SPAN', component.element.tagName);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});

		it('should render content specified by the component\'s "render" function', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('span', null, null, 'foo', 'foo');
					IncDom.text('bar');
					IncDom.elementClose('span');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent();
			assert.strictEqual('SPAN', component.element.tagName);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});

		it('should render custom content inside given element', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('span', null, null, 'foo', 'foo');
					IncDom.text('bar');
					IncDom.elementClose('span');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			var element = document.createElement('span');
			component = new TestComponent({
				element: element
			});
			assert.strictEqual(element, component.element);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});

		it('should run component\'s "rendered" lifecycle method on first render', function() {
			var calledArgs = [];
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('span', null, null, 'foo', 'foo');
					IncDom.text('bar');
					IncDom.elementClose('span');
				}

				rendered() {
					calledArgs.push(arguments);
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent();
			assert.strictEqual(1, calledArgs.length);
			assert.ok(calledArgs[0][0]);
		});

		it('should update content when state values change', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.text(this.foo);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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

		it('should update content synchronously when SYNC_UPDATES is true', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.text(this.foo);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};
			TestComponent.SYNC_UPDATES = true;

			component = new TestComponent();
			assert.strictEqual('foo', component.element.textContent);

			component.foo = 'bar';
			assert.strictEqual('bar', component.element.textContent);
		});

		it('should rerender immediately if state is changed inside "rendered" and SYNC_UPDATES is true', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.text(this.foo);
					IncDom.elementClose('div');
				}

				rendered() {
					if (!this.foo) {
						this.foo = 'foo';
					}
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				foo: {
				}
			};
			TestComponent.SYNC_UPDATES = true;

			component = new TestComponent();
			assert.strictEqual('foo', component.element.textContent);
		});

		it('should run component\'s "rendered" lifecycle method on updates', function(done) {
			var calledArgs = [];
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.text(this.foo);
					IncDom.elementClose('div');
				}

				rendered() {
					calledArgs.push(arguments);
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};

			component = new TestComponent();
			component.foo = 'bar';
			component.once('stateSynced', function() {
				assert.strictEqual(2, calledArgs.length);
				assert.ok(calledArgs[0][0]);
				assert.ok(!calledArgs[1][0]);
				done();
			});
		});

		it('should allow changing tag name of root element', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('span');
					IncDom.text('bar');
					IncDom.elementClose('span');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			var element = document.createElement('div');
			component = new TestComponent({
				element: element
			});
			assert.notStrictEqual(element, component.element);
			assert.strictEqual('SPAN', component.element.tagName);
		});

		it('should attach given element on specified parent', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementVoid('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

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
			class TestComponent extends Component {
				render() {}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent();
			assert.ok(!component.element);
		});

		it('should reposition component on requested parent when its content is back after an update', function(done) {
			class TestComponent extends Component {
				render() {
					if (!this.noElement) {
						IncrementalDOM.elementVoid('div');
					}
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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

			class TestComponent extends Component {
				render() {
					IncDom.elementOpenStart('input');
					IncDom.attr('type', 'checkbox');
					if (this.checked) {
						IncDom.attr('checked', '');
					}
					IncDom.elementOpenEnd('input');
					IncDom.elementClose('input');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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

		it('should change input value via "value" attribute even after it\'s manually changed', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementVoid('input', null, [], 'value', this.value);
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				value: {
					value: 'foo'
				}
			};

			component = new TestComponent();
			assert.strictEqual('foo', component.element.value);

			component.element.value = 'userValue';
			component.value = 'bar';
			component.once('stateSynced', function() {
				assert.strictEqual('bar', component.element.value);
				done();
			});
		});

		it('should add/remove css classes by using both "class" and "elementClasses"', function(done) {
			class TestComponent extends Component {
				render() {
					var cssClass = this.foo ? 'foo' : 'bar';
					IncDom.elementVoid('button', null, [], 'class', cssClass);
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				foo: {
					value: true
				}
			};

			component = new TestComponent({
				elementClasses: 'test'
			});
			assert.ok(dom.hasClass(component.element, 'foo'));
			assert.ok(!dom.hasClass(component.element, 'bar'));
			assert.ok(dom.hasClass(component.element, 'test'));

			component.foo = false;
			component.once('stateSynced', function() {
				assert.ok(!dom.hasClass(component.element, 'foo'));
				assert.ok(dom.hasClass(component.element, 'bar'));
				assert.ok(dom.hasClass(component.element, 'test'));
				done();
			});
		});

		it('should pass config data via the constructor', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('span', null, null, 'foo', this.config.foo);
					IncDom.text('bar');
					IncDom.elementClose('span');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			var container = document.createElement('span');
			component = IncrementalDomRenderer.render(
				TestComponent,
				{
					foo: 'fooValue'
				},
				container
			);

			assert.strictEqual(container, component.element.parentNode);
			assert.strictEqual('fooValue', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});
	});

	describe('Existing Content', function() {
		it('should not change existing content if the same that would be rendered', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementOpen('div', null, [], 'class', 'inner');
					IncDom.text('foo');
					IncDom.elementClose('div');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

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
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementOpen('div', null, 'class', 'inner');
					IncDom.text('foo');
					IncDom.elementClose('div');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

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
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementOpen('div', null, [], 'class', 'inner');
					IncDom.text('foo');
					IncDom.elementClose('div');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

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
		it('should attach listeners from "on<EventName>" attributes', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('div', null, null, 'onClick', 'handleClick');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent();
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element.childNodes[0], 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should not set "on<EventName>" string values as dom attributes', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementVoid('div', null, null, 'onClick', 'handleClick');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent();
			assert.ok(!component.element.getAttribute('onclick'));
			assert.ok(!component.element.getAttribute('onClick'));
		});

		it('should attach listeners from "data-on<eventname>" attributes', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent();
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element.childNodes[0], 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should set "data-on<eventname>" string values as dom attributes', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent();
			assert.strictEqual('handleClick', component.element.getAttribute('data-onclick'));
		});

		it('should attach listeners from attributes in existing elements', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.prototype.handleClick = sinon.stub();

			var element = document.createElement('div');
			element.setAttribute('data-onclick', 'handleClick');
			dom.enterDocument(element);

			component = new TestComponent({
				element: element
			});

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(1, component.handleClick.callCount);
			assert.strictEqual(component.element, element);
		});

		it('should attach listeners from root element', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div', null, null, 'onClick', 'handleClick');
					IncDom.elementVoid('div');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent();
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should attach listeners from elementOpenStart/elementOpenEnd calls', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementOpenStart('div');
					IncDom.attr('onClick', 'handleClick');
					IncDom.elementOpenEnd();
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent();
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element.childNodes[0], 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should attach listeners on existing children from the given element', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('div', null, null, 'onClick', 'handleClick');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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

		it('should provide delegateTarget as the element that the listener was attached to', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div', null, null, 'onClick', 'handleElementClick');
					IncDom.elementOpen('div', null, null, 'onClick', 'handleClick');
					IncDom.elementVoid('div', null, null, 'class', 'inner');
					IncDom.elementClose('div');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			var event1;
			TestComponent.prototype.handleElementClick = function(event) {
				event1 = object.mixin({}, event);
			};
			var event2;
			TestComponent.prototype.handleClick = function(event) {
				event2 = object.mixin({}, event);
			};

			component = new TestComponent();
			var innerElement = component.element.querySelector('.inner');
			dom.triggerEvent(innerElement, 'click');

			assert.ok(event1);
			assert.strictEqual(innerElement, event1.target);
			assert.strictEqual(component.element, event1.delegateTarget);

			assert.ok(event2);
			assert.strictEqual(innerElement, event2.target);
			assert.strictEqual(component.element.childNodes[0], event2.delegateTarget);
		});

		it('should remove unused inline listeners when dom is updated', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('div', null, null, 'onClick', 'handleClick');
					if (this.keydown) {
						IncDom.elementVoid('div', null, null, 'onKeyDown', 'handleKeydown');
					} else {
						IncDom.elementVoid('div', null, null);
					}
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				keydown: {
					value: true
				}
			};
			TestComponent.prototype.handleClick = sinon.stub();
			TestComponent.prototype.handleKeydown = sinon.stub();

			component = new TestComponent();
			dom.triggerEvent(component.element.childNodes[1], 'keydown');
			assert.strictEqual(1, component.handleKeydown.callCount);

			component.keydown = false;
			component.once('stateSynced', function() {
				dom.triggerEvent(component.element.childNodes[1], 'keydown');
				assert.strictEqual(1, component.handleKeydown.callCount);
				done();
			});
		});

		it('should attach listeners functions passed to "on<EventName>" attributes', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('div', null, null, 'onClick', this.handleClick);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent();
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element.childNodes[0], 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should update inline listeners when dom is updated', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					var fn = this.switch ? this.handleClick2 : this.handleClick;
					IncDom.elementVoid('div', null, null, 'onClick', fn);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				switch: {}
			};
			TestComponent.prototype.handleClick = sinon.stub();
			TestComponent.prototype.handleClick2 = sinon.stub();

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
			class ChildComponentClass extends Component {
				render() {
					IncDom.elementOpen('child', null, null, 'data-child', '1');
					IncDom.elementVoid('button', null, null, 'onClick', 'handleClick');
					IncDom.text(this.foo);
					IncDom.elementClose('child');
				}
			}
			ChildComponent = ChildComponentClass;
			ChildComponent.RENDERER = IncrementalDomRenderer;
			ChildComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};
			ChildComponent.prototype.handleClick = sinon.stub();
			ComponentRegistry.register(ChildComponent, 'ChildComponent');
		});

		it('should create sub component instance', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('ChildComponent', null, null, 'ref', 'child');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var child = component.components.child;
			assert.ok(child);
			assert.ok(child instanceof ChildComponent);
		});

		it('should render sub component at specified place', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('ChildComponent', null, null, 'ref', 'child');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual(child.element, component.element.querySelector('child'));
			assert.strictEqual('foo', child.element.textContent);
			assert.ok(child.element.hasAttribute('data-child'));
		});

		it('should run component\'s lifecycle methods when rendered as sub component', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('ChildComponent', null, null, 'ref', 'child');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			sinon.spy(ChildComponent.prototype, 'rendered');
			sinon.spy(ChildComponent.prototype, 'attached');
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual(1, child.rendered.callCount);
			assert.ok(child.rendered.args[0][0]);
			assert.strictEqual(1, child.attached.callCount);
		});

		it('should pass state to sub component', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('ChildComponent', null, null, 'ref', 'child', 'foo', 'bar');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual('bar', child.foo);
			assert.strictEqual('bar', child.element.textContent);
		});

		it('should update sub component state and content', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('ChildComponent', null, null, 'ref', 'child', 'foo', this.foo);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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

		it('should run component\'s lifecycle methods when updated as sub component', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('ChildComponent', null, null, 'ref', 'child', 'foo', this.foo);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};

			sinon.spy(ChildComponent.prototype, 'rendered');
			sinon.spy(ChildComponent.prototype, 'attached');
			component = new TestComponent();

			component.foo = 'bar';
			component.once('stateSynced', function() {
				var child = component.components.child;
				assert.strictEqual(2, child.rendered.callCount);
				assert.ok(!child.rendered.args[1][0]);
				assert.strictEqual(1, child.attached.callCount);
				done();
			});
		});

		it('should not try to rerender sub component later when state changes during parent rendering', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('ChildComponent', null, null, 'ref', 'child', 'foo', this.foo);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('ChildComponent', null, null, 'ref', 'child', 'foo', this.foo);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('ChildComponent', 'childKey', ['ref', 'child']);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual('childKey', child.element.__incrementalDOMData.key);

			child.foo = 'bar';
			child.once('stateSynced', function() {
				assert.strictEqual('childKey', child.element.__incrementalDOMData.key);
				assert.strictEqual(child.element, component.element.querySelector('child'));
				assert.strictEqual('bar', child.element.textContent);
				done();
			});
		});

		it('should attach sub component inline listeners', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('ChildComponent', null, null, 'ref', 'child');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual(0, child.handleClick.callCount);

			var button = child.element.querySelector('button');

			dom.triggerEvent(button, 'click');
			assert.strictEqual(1, child.handleClick.callCount);
		});

		it('should detach unused sub component inline listeners after parent update', function(done) {
			class TestChildComponent extends Component {
				render() {
					if (this.config.removeEvent) {
						IncDom.elementOpen('div');
					} else {
						IncDom.elementOpen('div', null, null, 'onClick', 'handleClick');
					}
					IncDom.elementClose('div');
				}
			}
			TestChildComponent.prototype.handleClick = sinon.stub();
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child', 'removeEvent', this.removeEvent);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				removeEvent: {
				}
			};
			component = new TestComponent();
			var child = component.components.child;

			dom.triggerEvent(child.element, 'click');
			assert.strictEqual(1, child.handleClick.callCount);

			component.removeEvent = true;
			component.once('stateSynced', function() {
				dom.triggerEvent(child.element, 'click');
				assert.strictEqual(1, child.handleClick.callCount);
				done();
			});
		});

		it('should generate sub component ref if none is given', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('ChildComponent');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var refs = Object.keys(component.components);
			assert.strictEqual(1, refs.length);
			var child = component.components[refs[0]];
			assert.ok(child instanceof ChildComponent);
		});

		it('should update sub component with generated ref', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('ChildComponent');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var key = Object.keys(component.components)[0];
			var child = component.components[key];
			child.foo = 'bar';
			child.once('stateSynced', function() {
				assert.strictEqual(child, component.components[key]);
				assert.strictEqual(child.element, component.element.querySelector('child'));
				assert.strictEqual('bar', child.element.textContent);
				done();
			});
		});

		it('should reuse correct children after an update', function(done) {
			class TestChildComponent extends Component {
				render() {
					IncDom.elementVoid('div');
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					if (this.add) {
						IncDom.elementVoid(TestChildComponent);
					}
					IncDom.elementVoid(ChildComponent, null, null, 'foo', 'bar');
					IncDom.elementVoid(ChildComponent);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				add: {
				}
			};
			component = new TestComponent();

			var refs = Object.keys(component.components).sort();
			assert.strictEqual(2, refs.length);
			var child1 = component.components[refs[0]];
			var child2 = component.components[refs[1]];

			component.add = true;
			component.once('stateSynced', function() {
				var refs2 = Object.keys(component.components).sort();
				assert.strictEqual(3, refs2.length);
				assert.strictEqual(child1, component.components[refs2[0]]);
				assert.strictEqual(child2, component.components[refs2[1]]);
				assert.ok(component.components[refs2[2]] instanceof TestChildComponent);

				assert.strictEqual(3, component.element.childNodes.length);
				assert.strictEqual(component.components[refs2[2]].element, component.element.childNodes[0]);
				assert.strictEqual(child1.element, component.element.childNodes[1]);
				assert.strictEqual(child2.element, component.element.childNodes[2]);

				assert.strictEqual('bar', child1.foo);
				assert.strictEqual('foo', child2.foo);
				done();
			});
		});

		it('should clear config variable on each sub component rerender', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					if (this.noBar) {
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child');
					} else {
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child', 'bar', 'bar');
					}
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				noBar: {
				}
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual('bar', child.config.bar);

			component.noBar = true;
			component.once('stateSynced', function() {
				assert.ok(!child.config.bar);
				done();
			});
		});

		it('should call "configChanged" lifecycle function with new and previous config', function(done) {
			ChildComponent.prototype.configChanged = sinon.stub();

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child', 'bar', this.bar);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				bar: {
					value: 'bar'
				}
			};
			component = new TestComponent();

			var child = component.components.child;
			var config = child.config;
			assert.strictEqual('bar', config.bar);
			assert.strictEqual(1, child.configChanged.callCount);
			assert.strictEqual(config, child.configChanged.args[0][0]);
			assert.deepEqual({}, child.configChanged.args[0][1]);

			component.bar = 'bar2';
			component.once('stateSynced', function() {
				var newConfig = child.config;
				assert.notStrictEqual(config, newConfig);
				assert.strictEqual('bar2', newConfig.bar);
				assert.strictEqual(2, child.configChanged.callCount);
				assert.strictEqual(newConfig, child.configChanged.args[1][0]);
				assert.strictEqual(config, child.configChanged.args[1][1]);
				done();
			});
		});

		it('should call "configChanged" lifecycle event with new and previous config', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child', 'bar', this.bar);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				bar: {
					value: 'bar'
				}
			};
			component = new TestComponent();

			var child = component.components.child;
			var config = child.config;
			assert.strictEqual('bar', config.bar);

			var listener = sinon.stub();
			child.on('configChanged', listener);

			component.bar = 'bar2';
			component.once('stateSynced', function() {
				var newConfig = child.config;
				assert.notStrictEqual(config, newConfig);
				assert.strictEqual('bar2', newConfig.bar);
				assert.strictEqual(1, listener.callCount);
				assert.ok(listener.args[0][0]);
				assert.strictEqual(newConfig, listener.args[0][0].newVal);
				assert.strictEqual(config, listener.args[0][0].prevVal);
				done();
			});
		});

		it('should render sub component via elementOpen/elementClose', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementOpen('ChildComponent', null, null, 'ref', 'child');
					IncDom.elementClose('ChildComponent');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual(child.element, component.element.querySelector('child'));
			assert.strictEqual('foo', child.element.textContent);
			assert.ok(child.element.hasAttribute('data-child'));
		});

		it('should render sub component via elementOpenStart/elementOpenEnd', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementOpenStart('ChildComponent');
					IncDom.attr('ref', 'child');
					IncDom.attr('foo', 'bar');
					IncDom.elementOpenEnd();
					IncDom.elementClose('ChildComponent');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual('bar', child.foo);
			assert.strictEqual(child.element, component.element.querySelector('child'));
			assert.strictEqual('bar', child.element.textContent);
			assert.ok(child.element.hasAttribute('data-child'));
		});

		it('should create and render sub component instance from constructor tag', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var child = component.components.child;
			assert.ok(child instanceof ChildComponent);
			assert.strictEqual(child.element, component.element.querySelector('child'));
			assert.strictEqual('foo', child.element.textContent);
			assert.ok(child.element.hasAttribute('data-child'));
		});

		it('should update sub component data from constructor tag', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid(ChildComponent, null, [], 'ref', 'child', 'foo', this.foo);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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
			class TestChildComponent extends Component {
				render() {
					IncDom.elementVoid('div');
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					if (this.switch) {
						IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child');
					} else {
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child');
					}
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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
				assert.ok(child.isDisposed());
				assert.ok(!newChild.isDisposed());
				done();
			});
		});

		it('should call "detached" lifecycle function and event when sub component is removed', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					if (!this.remove) {
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child');
					}
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				remove: {
				}
			};

			component = new TestComponent();
			var child = component.components.child;
			assert.ok(!child.isDisposed());
			sinon.spy(child, 'detached');

			component.remove = true;
			child.once('detached', function() {
				async.nextTick(function() {
					assert.ok(!component.components.child);
					assert.ok(child.isDisposed());
					assert.strictEqual(1, child.detached.callCount);
					done();
				});
			});
		});

		it('should pass rendering data to component\'s config property"', function() {
			class TestChildComponent extends Component {
				render() {
					IncDom.elementVoid('child', null, null, 'data-foo', this.config.foo);
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid(TestChildComponent, null, [], 'ref', 'child', 'foo', 'foo');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual('foo', child.element.getAttribute('data-foo'));
		});

		it('should use the same element from sub component if no wrapper is given', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual(child.element, component.element);
		});

		it('should position previously empty child component correctly inside parent', function(done) {
			class TestChildComponent extends Component {
				render() {
					if (!this.empty) {
						IncrementalDOM.elementVoid('div');
					}
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;
			TestChildComponent.STATE = {
				empty: {
					value: true
				}
			};

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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

		it('should not render sub component with SYNC_UPDATES twice', function(done) {
			ChildComponent.SYNC_UPDATES = true;

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child', 'foo', this.foo);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				foo: {
					value: 'foo'
				}
			};

			component = new TestComponent();
			var child = component.components.child;
			sinon.spy(child, 'render');

			component.foo = 'bar';
			component.once('stateSynced', function() {
				assert.strictEqual(1, child.render.callCount);
				done();
			});
		});

		describe('Children config', function() {
			it('should pass tree of incremental dom calls as "children"', function() {
				class TestChildComponent extends Component {
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;

				class TestComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'child');
						IncDom.elementOpen('span');
						IncDom.text('Hello World');
						IncDom.elementClose('span');
						IncDom.elementClose(TestChildComponent);
						IncDom.elementClose('div');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
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
				class TestChildComponent extends Component {
					render() {
						IncDom.elementOpen('child');
						this.config.children.forEach(IncrementalDomRenderer.renderChild);
						IncDom.elementClose('child');
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;

				class TestComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'child');
						IncDom.elementOpen('span');
						IncDom.text('Hello World');
						IncDom.elementClose('span');
						IncDom.elementClose(TestChildComponent);
						IncDom.elementClose('div');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
				component = new TestComponent();

				var child = component.components.child;
				assert.ok(child instanceof TestChildComponent);
				assert.strictEqual(1, child.element.childNodes.length);
				assert.strictEqual('SPAN', child.element.childNodes[0].tagName);
				assert.strictEqual('Hello World', child.element.childNodes[0].textContent);
			});

			it('should render empty string children', function() {
				class TestChildComponent extends Component {
					render() {
						IncDom.elementOpen('child');
						this.config.children.forEach(IncrementalDomRenderer.renderChild);
						IncDom.elementClose('child');
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;

				class TestComponent extends Component {
					render() {
						IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'child');
						IncDom.text('foo');
						IncDom.text('');
						IncDom.text(' bar');
						IncDom.elementClose(TestChildComponent);
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
				component = new TestComponent();

				var child = component.components.child;
				assert.strictEqual('foo bar', child.element.textContent);
			});

			it('should render only selected nodes from "children" config', function() {
				class TestChildComponent extends Component {
					render() {
						IncDom.elementOpen('child');
						IncrementalDomRenderer.renderChild(this.config.children[1]);
						IncDom.elementClose('child');
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;

				class TestComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'child');
						IncDom.elementVoid('span', null, ['class', 'first']);
						IncDom.elementVoid('span', null, ['class', 'second']);
						IncDom.elementVoid('span', null, ['class', 'third']);
						IncDom.elementClose(TestChildComponent);
						IncDom.elementClose('div');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
				component = new TestComponent();

				var child = component.components.child;
				assert.strictEqual(1, child.element.childNodes.length);
				assert.strictEqual('SPAN', child.element.childNodes[0].tagName);
				assert.ok(dom.hasClass(child.element.childNodes[0], 'second'));
			});

			it('should add children component instances to the component that defined them', function() {
				class TestChildComponent extends Component {
					render() {
						IncDom.elementOpen('child');
						this.config.children.forEach(IncrementalDomRenderer.renderChild);
						IncDom.elementClose('child');
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;

				class TestNestedChildComponent extends Component {
					render() {
						IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'nestedChild1');
						this.config.children.forEach(IncrementalDomRenderer.renderChild);
						IncDom.elementClose(TestChildComponent);
					}
				}
				TestNestedChildComponent.RENDERER = IncrementalDomRenderer;

				class TestComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						IncDom.elementOpen(TestNestedChildComponent, null, null, 'ref', 'child1');
						IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child2');
						IncDom.elementClose(TestNestedChildComponent);
						IncDom.elementClose('div');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
				component = new TestComponent();

				var child1 = component.components.child1;
				var child2 = component.components.child2;
				assert.ok(child1 instanceof TestNestedChildComponent);
				assert.ok(child2 instanceof TestChildComponent);
				assert.ok(child1.components.nestedChild1 instanceof TestChildComponent);
				assert.ok(!child1.components.child1);
				assert.ok(!child1.components.child2);

				assert.strictEqual(child1.element, component.element.childNodes[0]);
				assert.strictEqual(child2.element, child1.element.childNodes[0]);
			});

			it('should render correctly when recursive children are used', function() {
				class TestChildComponent extends Component {
					render() {
						IncDom.elementOpen('child');
						this.config.children.forEach(IncrementalDomRenderer.renderChild);
						IncDom.elementClose('child');
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;

				class TestComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'child');
						IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'child2');
						IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'child3');
						IncDom.elementOpen('span');
						IncDom.text('Hello World');
						IncDom.elementClose('span');
						IncDom.elementClose(TestChildComponent);
						IncDom.elementClose(TestChildComponent);
						IncDom.elementClose(TestChildComponent);
						IncDom.elementClose('div');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
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
				class TestComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child', 'foo', this.foo);
						IncDom.elementClose('div');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
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

			it('should use the same element from children sub component if no wrapper is given', function() {
				class TestChildComponent extends Component {
					render() {
						this.config.children.forEach(IncrementalDomRenderer.renderChild);
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;

				class TestComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'child');
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child2');
						IncDom.elementClose(TestChildComponent);
						IncDom.elementClose('div');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
				component = new TestComponent();

				var child = component.components.child;
				var child2 = component.components.child2;
				assert.strictEqual(child.element, child2.element);
				assert.notStrictEqual(component.element, child.element);
			});

			it('should use same keys for children components when rerendered after update', function(done) {
				class TestChildComponent extends Component {
					render() {
						IncrementalDOM.elementOpen('div');
						IncrementalDOM.text(this.foo);
						this.config.children.forEach(IncrementalDomRenderer.renderChild);
						IncrementalDOM.elementClose('div');
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;
				TestChildComponent.STATE = {
					foo: {
						value: 'foo'
					}
				};

				class TestComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'child');
						IncDom.elementVoid(ChildComponent);
						IncDom.elementClose(TestChildComponent);
						IncDom.elementClose('div');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
				component = new TestComponent();

				var components = object.mixin(component.components);
				assert.strictEqual(2, Object.keys(components).length);

				var keys = Object.keys(components).concat();
				array.remove(keys, 'child');
				var child2Key = keys[0];

				components.child.foo = 'foo2';
				components.child.once('stateSynced', function() {
					assert.strictEqual(2, Object.keys(component.components).length);
					assert.deepEqual(
						Object.keys(components).sort(),
						Object.keys(component.components).sort()
					);
					assert.strictEqual(components.child, component.components.child);
					assert.strictEqual(components[child2Key], component.components[child2Key]);
					assert.ok(!component.components.sub1);
					done();
				});
			});
		});

		it('should pass context data to all descendants', function() {
			class TestGrandChildComponent extends Component {
				render() {
					IncDom.elementVoid('grandchild');
				}
			}
			TestGrandChildComponent.RENDERER = IncrementalDomRenderer;

			class TestChildComponent extends Component {
				getChildContext() {
					return {
						bar: 'bar'
					};
				}

				render() {
					IncDom.elementOpen('child');
					this.config.children.forEach(IncrementalDomRenderer.renderChild);
					IncDom.elementClose('child');
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				getChildContext() {
					return {
						foo: 'foo'
					};
				}

				render() {
					IncDom.elementOpen('div');
					IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'child');
					IncDom.elementVoid(TestGrandChildComponent, null, null, 'ref', 'grandChild');
					IncDom.elementClose(TestChildComponent);
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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

		it('should pass context data sub components rendered via "IncrementalDomRenderer.render"', function() {
			class TestChildComponent extends Component {
				render() {
					IncDom.elementVoid('child');
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			var element = document.createElement('div');
			var tempComp;
			class TestComponent extends Component {
				getChildContext() {
					return {
						foo: 'foo'
					};
				}

				render() {
					IncDom.elementVoid('div');
				}

				rendered() {
					var fn = () => {
						IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child');
					};
					tempComp = IncrementalDomRenderer.render(fn, element);
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var child = tempComp.components.child;
			assert.ok(child instanceof TestChildComponent);
			assert.ok(!component.context.foo);
			assert.ok(!component.context.bar);
			assert.strictEqual('foo', child.context.foo);
		});

		describe('Non Incremental DOM sub component', function() {
			var originalWarnFn = console.warn;

			beforeEach(function() {
				console.warn = sinon.stub();
			});

			afterEach(function() {
				console.warn = originalWarnFn;
			});

			it('should warn if rendering sub component that doesn\'t use incremental dom', function() {
				class TestChildComponent extends Component {
					constructor() {
						super();
						this.element = document.createElement('div');
					}
				}
				class TestComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						IncDom.elementVoid(TestChildComponent);
						IncDom.elementClose('div');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;

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

				class TestComponent extends Component {
					render() {
						IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
				component = new TestComponent();

				var child = component.components.child;
				assert.strictEqual(child.element, component.element);
			});
		});

		describe('Dispose Unused Sub Components', function() {
			it('should dispose sub components that are unused after an update', function(done) {
				class TestComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						for (var i = 1; i <= this.count; i++) {
							IncDom.elementVoid('ChildComponent', null, ['ref', 'child' + i]);
						}
						IncDom.elementClose('div');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
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

			it('should dispose unused sub component before triggering update rerender', function(done) {
				class TestComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						if (this.foo === 'foo') {
							IncDom.elementVoid('ChildComponent', null, null, 'ref', 'child');
						}
						IncDom.elementClose('div');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
				TestComponent.STATE = {
					foo: {
						value: 'foo'
					}
				};
				component = new TestComponent();
				var child = component.components.child;
				sinon.spy(child, 'render');

				component.foo = 'bar';
				child.foo = 'bar';
				component.once('stateSynced', function() {
					assert.strictEqual(0, child.render.callCount);
					assert.ok(child.isDisposed());
					done();
				});
			});

			it('should dispose sub components from "children" that are unused after an update', function(done) {
				class TestChildComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						IncrementalDomRenderer.renderChild(
							this.config.children[this.index]
						);
						IncDom.elementClose('div');
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;
				TestChildComponent.STATE = {
					index: {
						value: 0
					}
				};

				class TestComponent extends Component {
					render() {
						IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'child');
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'item1');
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'item2');
						IncDom.elementClose(TestChildComponent);
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;

				component = new TestComponent();
				var child = component.components.child;
				var item1 = component.components.item1;
				assert.ok(item1);
				assert.ok(!component.components.item2);
				assert.ok(!item1.isDisposed());

				child.index = 1;
				component.once('stateSynced', function() {
					assert.strictEqual(child, component.components.child);
					assert.ok(!component.components.item1);
					assert.ok(component.components.item2);
					assert.ok(item1.isDisposed());
					done();
				});
			});

			it('should dispose sub components from sub components that are unused after a parent update', function(done) {
				class TestChildComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						if (!this.config.remove) {
							IncDom.elementOpen(ChildComponent, null, null, 'ref', 'innerChild');
						}
						IncDom.elementClose('div');
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;

				class TestComponent extends Component {
					render() {
						IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child', 'remove', this.remove);
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
				TestComponent.STATE = {
					remove: {
					}
				};

				component = new TestComponent();
				var child = component.components.child;
				var innerChild = child.components.innerChild;
				assert.ok(innerChild);

				component.remove = true;
				component.once('stateSynced', function() {
					assert.strictEqual(child, component.components.child);
					assert.ok(!child.isDisposed());
					assert.ok(!child.components.innerChild);
					assert.ok(innerChild.isDisposed());
					done();
				});
			});
		});

		it('should not remove reusable element from disposed component', function(done) {
			class TestChildComponent extends Component {
				render() {
					IncDom.elementOpen('child');
					IncrementalDomRenderer.renderChild(this.config.children[this.index]);
					IncDom.elementClose('child');
				}
			}
			TestChildComponent.STATE = {
				index: {
					value: 0
				}
			};
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'child');
					IncDom.elementVoid(ChildComponent, null, null, 'foo', 'foo1', 'ref', 'grandchild1');
					IncDom.elementVoid(ChildComponent, null, null, 'foo', 'foo2', 'ref', 'grandchild2');
					IncDom.elementClose(TestChildComponent);
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			var child = component.components.child;
			var child1 = component.components.grandchild1;
			assert.ok(child1);
			assert.strictEqual('foo1', child1.foo);
			assert.strictEqual(child1.element, child.element.childNodes[0]);
			assert.ok(!child1.isDisposed());
			assert.ok(!component.components.foo2);

			var child1Element = child1.element;
			child.index = 1;
			child.once('stateSynced', function() {
				assert.ok(!component.components.grandchild1);
				assert.ok(child1.isDisposed());

				var child2 = component.components.grandchild2;
				assert.ok(child2);
				assert.strictEqual('foo2', child2.foo);
				assert.strictEqual(child2.element, child.element.childNodes[0]);
				assert.strictEqual(child1Element, child2.element);
				assert.ok(!child2.isDisposed());
				done();
			});
		});

		it('should not remove reusable element from disposed component\'s sub components', function(done) {
			class TestChildComponent extends Component {
				render() {
					IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child');
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					if (this.switch) {
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child2');
					} else {
						IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child1');
					}
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				switch: {
				}
			};
			component = new TestComponent();

			var child = component.components.child1;
			assert.ok(child instanceof TestChildComponent);
			assert.strictEqual(child.element, component.element.childNodes[0]);

			component.switch = true;
			component.once('stateSynced', function() {
				assert.ok(!component.components.child1);
				assert.ok(child.isDisposed());

				child = component.components.child2;
				assert.ok(child instanceof ChildComponent);
				assert.strictEqual(child.element, component.element.childNodes[0]);
				assert.ok(!child.isDisposed());
				done();
			});
		});

		it('should not dispose new sub component with same ref as unused sub component', function(done) {
			class TestChildComponent extends Component {
				render() {
					IncrementalDOM.elementVoid('child');
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					if (this.switch) {
						IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child');
					} else {
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child');
					}
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				switch: {
				}
			};
			component = new TestComponent();
			var child = component.components.child;
			assert.ok(child instanceof ChildComponent);

			component.switch = true;
			component.once('stateSynced', function() {
				var newChild = component.components.child;
				assert.ok(newChild instanceof TestChildComponent);
				assert.notStrictEqual(child, newChild);
				assert.ok(child.isDisposed());
				assert.ok(!newChild.isDisposed());
				assert.strictEqual(newChild.element, component.element.childNodes[0]);
				done();
			});
		});
	});

	describe('Function - shouldUpdate', function() {
		it('should only rerender after state change if "shouldUpdate" returns true', function(done) {
			class TestComponent extends Component {
				shouldUpdate(changes) {
					return changes.foo && (changes.foo.prevVal !== changes.foo.newVal);
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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
				sinon.spy(IncrementalDOM, 'skipNode');
			});

			afterEach(function() {
				IncrementalDOM.skipNode.restore();
			});

			it('should not rerender child component if its "shouldUpdate" returns false', function(done) {
				class TestChildComponent extends Component {
					render() {
						IncDom.elementOpen('span');
						IncDom.text('Child');
						IncDom.elementClose('span');
					}

					shouldUpdate() {
						return false;
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;

				class TestComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						IncDom.text(this.foo);
						IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child');
						IncDom.elementClose('div');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
				TestComponent.STATE = {
					foo: {
						value: 'foo'
					}
				};

				component = new TestComponent();
				var child = component.components.child;

				component.foo = 'foo2';
				component.once('stateSynced', function() {
					assert.strictEqual(1, IncrementalDOM.skipNode.callCount);
					assert.strictEqual('foo2', component.element.childNodes[0].textContent);
					assert.strictEqual(child.element, component.element.childNodes[1]);
					assert.strictEqual('SPAN', child.element.tagName);
					assert.strictEqual('Child', child.element.textContent);
					done();
				});
			});
		});

		it('should correctly reposition child component even if its "shouldUpdate" returns false', function(done) {
			class TestChildComponent extends Component {
				render() {
					IncDom.elementOpen('span');
					IncDom.text('Child');
					IncDom.elementClose('span');
				}

				shouldUpdate() {
					return false;
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					if (this.wrap) {
						IncDom.elementOpen('div', null, [], 'class', 'wrapper');
					}
					IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child');
					if (this.wrap) {
						IncDom.elementClose('div');
					}
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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
			class TestChildComponent extends Component {
				render() {}

				shouldUpdate() {
					return false;
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.text(this.foo);
					IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
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

		it('should render componentless function via "IncrementalDomRenderer.render"', function() {
			var fn = config => {
				IncDom.elementOpen('span', null, null, 'foo', config.foo);
				IncDom.text('bar');
				IncDom.elementClose('span');
			};

			var container = document.createElement('span');
			IncrementalDomRenderer.render(
				fn,
				{
					foo: 'fooValue'
				},
				container
			);

			assert.strictEqual(1, container.childNodes.length);
			assert.strictEqual('fooValue', container.childNodes[0].getAttribute('foo'));
			assert.strictEqual('bar', container.childNodes[0].textContent);
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
});
