'use strict';

import { async, core, object } from 'metal';
import dom from 'metal-dom';
import { getData } from '../src/data';
import { sunset } from '../../../test-utils';
import { CHILD_OWNER } from '../src/children/children';
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
			class TestRenderer extends IncrementalDomRenderer.constructor {
				renderIncDom() {
					IncDom.elementOpen('span', null, null, 'foo', 'foo');
					IncDom.text('bar');
					IncDom.elementClose('span');
				}
			}

			class TestComponent extends Component {
			}
			TestComponent.RENDERER = new TestRenderer();

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

		it('should add/remove css classes via "elementClasses"', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementVoid('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent({
				elementClasses: 'test'
			});
			assert.ok(dom.hasClass(component.element, 'test'));

			component.elementClasses = 'test2';
			component.once('stateSynced', function() {
				assert.ok(!dom.hasClass(component.element, 'test'));
				assert.ok(dom.hasClass(component.element, 'test2'));
				done();
			});
		});

		it('should add/remove css classes by using both "class" and "elementClasses"', function(done) {
			class TestComponent extends Component {
				render() {
					var cssClass = this.foo ? 'foo' : 'bar';
					IncDom.elementVoid('button', null, [], 'foo', 'foo', 'class', cssClass);
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

		it('should not cause css classes to be added twice due to "elementClasses"', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementVoid('div', null, null, 'class', 'test1   test2');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent({
				elementClasses: 'test2 test3'
			});
			assert.strictEqual('test1 test2 test3', component.element.getAttribute('class'));
		});

		it('should store references to node elements via "ref"', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div', null, null, 'ref', 'root');
					IncDom.elementVoid('span', null, null, 'ref', 'child1');
					IncDom.elementVoid('span', null, null, 'ref', 'child2');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent();
			assert.strictEqual(component.element, component.refs.root);
			assert.strictEqual(component.element.childNodes[0], component.refs.child1);
			assert.strictEqual(component.element.childNodes[1], component.refs.child2);
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

		it('should reattach events with same name on same element for different components', function() {
			class TestComponent extends Component {
				created() {
					sinon.stub(this, 'handleClick');
				}

				handleClick() {
				}

				render() {
					IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent();
			const element = component.element;
			component.element = null;
			component.dispose();

			component = new TestComponent({
				element
			});
			dom.triggerEvent(element, 'click');
			assert.equal(1, component.handleClick.callCount);
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
			assert.strictEqual(child, component.refs.child);
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
				sinon.spy(child, 'render');
				child.once('stateSynced', function() {
					assert.strictEqual(0, child.render.callCount);
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
				sinon.spy(child, 'render');
				child.once('stateSynced', function() {
					assert.strictEqual(1, child.render.callCount);
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

		it('should pass key to sub components until root element is reached', function() {
			class TestChildComponent extends Component {
				render() {
					IncDom.elementVoid(ChildComponent, null, ['ref', 'child']);
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementVoid(TestChildComponent, 'rootKey', ['ref', 'child']);
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			const lastChild = component.components.child.components.child;
			assert.strictEqual('rootKey', lastChild.element.__incrementalDOMData.key);

			const innerElement = lastChild.element.childNodes[0];
			assert.notStrictEqual('rootKey', innerElement.__incrementalDOMData.key);
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
					if (this.removeEvent) {
						IncDom.elementOpen('div');
					} else {
						IncDom.elementOpen('div', null, null, 'onClick', 'handleClick');
					}
					IncDom.elementClose('div');
				}
			}
			TestChildComponent.prototype.handleClick = sinon.stub();
			TestChildComponent.RENDERER = IncrementalDomRenderer;
			TestChildComponent.STATE = {
				removeEvent: {
				}
			};

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

		it('should render sub component without storing its instance if no ref is given', function() {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid('ChildComponent', null, null, 'foo', 'bar');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();

			assert.strictEqual(0, Object.keys(component.components).length);
			assert.strictEqual(1, component.element.childNodes.length);
			assert.strictEqual('CHILD', component.element.childNodes[0].tagName);
			assert.strictEqual('bar', component.element.childNodes[0].textContent);
		});

		it('should reuse sub component even when it receives no ref', function(done) {
			var creationCount = 0;
			class TestChildComponent extends Component {
				created() {
					creationCount++;
				}

				render() {
					IncDom.elementOpen('div');
					IncDom.text(this.foo);
					IncDom.elementClose('div');
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;
			TestChildComponent.STATE = {
				foo: {
				}
			};

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid(TestChildComponent, null, null, 'foo', this.foo);
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
			assert.strictEqual(1, creationCount);
			assert.strictEqual(1, component.element.childNodes.length);
			assert.strictEqual('foo', component.element.childNodes[0].textContent);

			component.foo = 'foo2';
			component.once('stateSynced', function() {
				assert.strictEqual(1, creationCount);
				assert.strictEqual(1, component.element.childNodes.length);
				assert.strictEqual('foo2', component.element.childNodes[0].textContent);
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
					IncDom.elementVoid(ChildComponent);
					IncDom.elementVoid(ChildComponent, null, null, 'foo', 'bar');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				add: {
				}
			};

			var children = [];
			sinon.stub(ChildComponent.prototype, 'created', function() {
				children.push(this);
			});

			component = new TestComponent();
			assert.strictEqual(2, component.element.childNodes.length);
			assert.strictEqual('CHILD', component.element.childNodes[0].tagName);
			assert.strictEqual('foo', component.element.childNodes[0].textContent);
			assert.strictEqual('CHILD', component.element.childNodes[1].tagName);
			assert.strictEqual('bar', component.element.childNodes[1].textContent);
			assert.strictEqual(2, children.length);
			assert.strictEqual(component.element.childNodes[0], children[0].element);
			assert.strictEqual(component.element.childNodes[1], children[1].element);

			component.add = true;
			component.once('stateSynced', function() {
				assert.strictEqual(2, ChildComponent.prototype.created.callCount);
				assert.strictEqual(3, component.element.childNodes.length);
				assert.strictEqual('DIV', component.element.childNodes[0].tagName);
				assert.strictEqual('CHILD', component.element.childNodes[1].tagName);
				assert.strictEqual('foo', component.element.childNodes[1].textContent);
				assert.strictEqual('CHILD', component.element.childNodes[2].tagName);
				assert.strictEqual('bar', component.element.childNodes[2].textContent);
				assert.strictEqual(component.element.childNodes[1], children[0].element);
				assert.strictEqual(component.element.childNodes[2], children[1].element);
				done();
			});
		});

		it('should reuse correct children according to their "key" after an update', function(done) {
			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					if (this.switch) {
						IncDom.elementVoid(ChildComponent, 'child2');
						IncDom.elementVoid(ChildComponent, 'child1');
					} else {
						IncDom.elementVoid(ChildComponent, 'child1');
						IncDom.elementVoid(ChildComponent, 'child2');
					}
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				switch: {
				}
			};

			var children = [];
			sinon.stub(ChildComponent.prototype, 'created', function() {
				children.push(this);
			});

			component = new TestComponent();
			assert.strictEqual(2, component.element.childNodes.length);
			assert.strictEqual(2, children.length);
			assert.strictEqual(component.element.childNodes[0], children[0].element);
			assert.strictEqual(component.element.childNodes[1], children[1].element);

			component.switch = true;
			component.once('stateSynced', function() {
				assert.strictEqual(2, component.element.childNodes.length);
				assert.strictEqual(2, children.length);
				assert.strictEqual(component.element.childNodes[0], children[1].element);
				assert.strictEqual(component.element.childNodes[1], children[0].element);
				done();
			});
		});

		it('should not reuse component that was created in another parent', function(done) {
			const grandChildInstances = [];
			class GrandChildComponent extends Component {
				created() {
					grandChildInstances.push(this);
				}
				render() {
					IncDom.elementVoid('span');
				}
			}
			GrandChildComponent.RENDERER = IncrementalDomRenderer;

			class TestChildComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid(GrandChildComponent);
					IncDom.elementClose('div');
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child' + this.number);
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				number: {
					value: 1
				}
			};

			component = new TestComponent();
			assert.strictEqual(1, grandChildInstances.length);

			component.number = 2;
			component.once('stateSynced', function() {
				assert.strictEqual(2, grandChildInstances.length);
				assert.ok(grandChildInstances[0].isDisposed());
				assert.ok(!grandChildInstances[1].isDisposed());
				assert.strictEqual(grandChildInstances[1].element, component.element.querySelector('span'));
				done();
			});
		});

		it('should not throw error trying to reuse component that was disposed', function(done) {
			const childInstances = [];
			class TestChildComponent extends Component {
				created() {
					childInstances.push(this);
				}
				render() {
					IncDom.elementVoid('span');
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementVoid(TestChildComponent);
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				foo: {
				}
			};

			component = new TestComponent();
			assert.strictEqual(1, childInstances.length);
			childInstances[0].dispose();

			component.foo = true;
			component.once('stateSynced', function() {
				assert.strictEqual(2, childInstances.length);
				assert.ok(childInstances[0].isDisposed());
				assert.ok(!childInstances[1].isDisposed());
				assert.strictEqual(component.element, childInstances[1].element);
				done();
			});
		});

		it('should reuse previous internal state data on sub component rerender', function(done) {
			ChildComponent.STATE = {
				foo: {
					internal: true
				}
			};

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					if (this.noFoo) {
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child');
					} else {
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child', 'foo', 'foo');
					}
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				noFoo: {
				}
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual('foo', child.foo);

			component.noFoo = true;
			component.once('stateSynced', function() {
				assert.strictEqual('foo', child.foo);
				done();
			});
		});

		it('should not reuse previous non internal state data on sub component rerender', function(done) {
			ChildComponent.STATE = {
				foo: {
					value: 'defaultFoo'
				}
			};

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					if (this.noFoo) {
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child');
					} else {
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child', 'foo', 'foo');
					}
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				noFoo: {
				}
			};
			component = new TestComponent();

			var child = component.components.child;
			assert.strictEqual('foo', child.foo);

			component.noFoo = true;
			component.once('stateSynced', function() {
				assert.strictEqual('defaultFoo', child.foo);
				done();
			});
		});

		it('should return the component that started the patch operation', function() {
			class TestChildComponent extends Component {
				render() {
					const patchingComp = IncrementalDomRenderer.getPatchingComponent();
					assert.ok(patchingComp instanceof TestComponent);
					IncDom.elementVoid('div');
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementVoid(TestChildComponent);
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;
			component = new TestComponent();
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

		it('should dispose sub components when component is disposed', function() {
			const children = [];
			class TestChildComponent extends Component {
				created() {
					children.push(this);
				}
			}
			TestChildComponent.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncDom.elementOpen('div');
					IncDom.elementVoid(TestChildComponent);
					IncDom.elementVoid(TestChildComponent, null, null, 'ref', 'child');
					IncDom.elementClose('div');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent();
			assert.strictEqual(2, children.length);
			assert.ok(!children[0].isDisposed());
			assert.ok(!children[1].isDisposed());

			component.dispose();
			assert.ok(children[0].isDisposed());
			assert.ok(children[1].isDisposed());
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
					value: true,
					internal: true
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

		describe('Children data', function() {
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

				var children = child.children;
				assert.ok(children);

				assert.strictEqual(1, children.length);
				assert.ok(!children[0].text);
				assert.strictEqual('span', children[0].tag);
				assert.ok(children[0].props);
				assert.strictEqual(1, children[0].props.children.length);
				assert.strictEqual('Hello World', children[0].props.children[0].text);
				assert.ok(!children[0].props.children[0].props);
			});

			it('should render children via "IncrementalDomRenderer.renderChild"', function() {
				class TestChildComponent extends Component {
					render() {
						IncDom.elementOpen('child');
						this.children.forEach(IncrementalDomRenderer.renderChild);
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
						this.children.forEach(IncrementalDomRenderer.renderChild);
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

			it('should render only selected nodes from "children"', function() {
				class TestChildComponent extends Component {
					render() {
						IncDom.elementOpen('child');
						IncrementalDomRenderer.renderChild(this.children[1]);
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
						this.children.forEach(IncrementalDomRenderer.renderChild);
						IncDom.elementClose('child');
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;

				class TestNestedChildComponent extends Component {
					render() {
						IncDom.elementOpen(TestChildComponent, null, null, 'ref', 'nestedChild1');
						IncDom.elementOpen('div');
						this.children.forEach(IncrementalDomRenderer.renderChild);
						IncDom.elementClose('div');
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
				assert.strictEqual(child2.element, child1.element.childNodes[0].childNodes[0]);
			});

			it('should add dom element references to the component that requested them', function() {
				class TestChildComponent extends Component {
					render() {
						IncDom.elementOpen('child');
						this.children.forEach(IncrementalDomRenderer.renderChild);
						IncDom.elementClose('child');
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;

				class TestNestedChildComponent extends Component {
					render() {
						IncDom.elementOpen(TestChildComponent);
						IncDom.elementOpen('div');
						this.children.forEach(IncrementalDomRenderer.renderChild);
						IncDom.elementClose('div');
						IncDom.elementClose(TestChildComponent);
					}
				}
				TestNestedChildComponent.RENDERER = IncrementalDomRenderer;

				class TestComponent extends Component {
					render() {
						IncDom.elementOpen('div');
						IncDom.elementOpen(TestNestedChildComponent);
						IncDom.elementVoid('span', null, null, 'ref', 'childEl');
						IncDom.elementClose(TestNestedChildComponent);
						IncDom.elementClose('div');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
				component = new TestComponent();

				var childEl = component.refs.childEl;
				assert.ok(childEl);
				assert.ok(core.isElement(childEl));
				assert.strictEqual('SPAN', childEl.tagName);
			});

			it('should not add references from child component in its parent', function() {
				class Wrapper extends Component {
					render() {
						IncDom.elementOpen('div');
						this.children.forEach(IncrementalDomRenderer.renderChild);
						IncDom.elementClose('div');
					}
				}
				Wrapper.RENDERER = IncrementalDomRenderer;

				class ChildComponent extends Component {
					render() {
						IncDom.elementVoid('div', null, null, 'ref', 'el');
					}
				}
				ChildComponent.RENDERER = IncrementalDomRenderer;

				class TestComponent extends Component {
					render() {
						IncDom.elementOpen(Wrapper);
						IncDom.elementOpen('div');
						IncDom.elementVoid(ChildComponent, null, null, 'ref', 'child');
						IncDom.elementClose('div');
						IncDom.elementClose(Wrapper);
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;

				component = new TestComponent();
				const child = component.refs.child;
				assert.ok(child);
				assert.ok(child.refs.el);
				assert.ok(!component.refs.el);
			});

			it('should render children components with changed props', function() {
				class TestChildComponent extends Component {
					render() {
						IncrementalDOM.elementOpen('child');
						if (this.children.length) {
							this.children[0].props = object.mixin({}, this.children[0].props, {
								foo: 'changedFoo'
							});
							this.children.forEach(IncrementalDomRenderer.renderChild);
						}
						if (this.foo) {
							IncrementalDOM.text(this.foo);
						}
						IncrementalDOM.elementClose('child');
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;
				TestChildComponent.STATE = {
					foo: {
					}
				};

				class TestNestedChildComponent extends Component {
					render() {
						IncDom.elementOpen(TestChildComponent);
						this.children.forEach(IncrementalDomRenderer.renderChild);
						IncDom.elementClose(TestChildComponent);
					}
				}
				TestNestedChildComponent.RENDERER = IncrementalDomRenderer;

				class TestComponent extends Component {
					render() {
						IncDom.elementOpen(TestNestedChildComponent);
						IncDom.elementVoid(TestChildComponent, null, null, 'foo', 'foo');
						IncDom.elementClose(TestNestedChildComponent);
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;
				component = new TestComponent();

				assert.strictEqual(1, component.element.childNodes.length);
				assert.strictEqual('changedFoo', component.element.childNodes[0].textContent);
			});

			it('should render correctly when recursive children are used', function() {
				class TestChildComponent extends Component {
					render() {
						IncDom.elementOpen('child');
						this.children.forEach(IncrementalDomRenderer.renderChild);
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
				var children = child.children;
				assert.ok(children);

				component.foo = 'foo2';
				component.once('stateSynced', function() {
					assert.strictEqual(children, child.children);
					done();
				});
			});

			it('should use the same element from children sub component if no wrapper is given', function() {
				class TestChildComponent extends Component {
					render() {
						this.children.forEach(IncrementalDomRenderer.renderChild);
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

			it('should reuse children components when rerendered after update', function(done) {
				class TestChildComponent extends Component {
					render() {
						IncrementalDOM.elementOpen('div');
						IncrementalDOM.text(this.foo);
						this.children.forEach(IncrementalDomRenderer.renderChild);
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

				sinon.spy(ChildComponent.prototype, 'created');
				component = new TestComponent();
				assert.strictEqual(1, ChildComponent.prototype.created.callCount);

				component.components.child.foo = 'foo2';
				component.components.child.once('stateSynced', function() {
					assert.strictEqual(1, ChildComponent.prototype.created.callCount);
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
					this.children.forEach(IncrementalDomRenderer.renderChild);
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
						IncrementalDomRenderer.renderChild(this.children[this.index]);
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
				child.once('stateSynced', function() {
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
						if (!this.remove) {
							IncDom.elementOpen(ChildComponent, null, null, 'ref', 'innerChild');
						}
						IncDom.elementClose('div');
					}
				}
				TestChildComponent.RENDERER = IncrementalDomRenderer;
				TestChildComponent.STATE = {
					remove: {
					}
				};

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
					IncrementalDomRenderer.renderChild(this.children[this.index]);
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

		it('should not dispose unused sub component if "skipNextChildrenDisposal" is called', function(done) {
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
			component.getRenderer().skipNextChildrenDisposal(component);
			component.once('stateSynced', function() {
				assert.strictEqual(0, child.render.callCount);
				assert.ok(!child.isDisposed());
				done();
			});
		});

		describe('Compatibility Mode', function() {
			afterEach(function() {
				core.disableCompatibilityMode();
			});

			it('should not store component references via "key" when not on compatibility mode', function() {
				class TestComponent extends Component {
					render() {
						IncDom.elementVoid(ChildComponent, null, null, 'key', 'child');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;

				component = new TestComponent();
				assert.ok(!component.components.child);
			});

			it('should store component references via "key" on compatibility mode', function() {
				core.enableCompatibilityMode();
				class TestComponent extends Component {
					render() {
						IncDom.elementVoid(ChildComponent, null, null, 'key', 'child');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;

				component = new TestComponent();
				assert.ok(component.components.child);
				assert.ok(component.components.child instanceof ChildComponent);
			});

			it('should store component references via "ref" instead of "key" when both are present', function() {
				core.enableCompatibilityMode();
				class TestComponent extends Component {
					render() {
						IncDom.elementVoid(ChildComponent, null, null, 'key', 'keyChild', 'ref', 'refChild');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;

				component = new TestComponent();
				assert.ok(!component.components.keyChild);
				assert.ok(component.components.refChild);
				assert.ok(component.components.refChild instanceof ChildComponent);
			});

			it('should store component references via "key" when renderer is enabled by compatibility mode', function() {
				class TestRendererClass extends IncrementalDomRenderer.constructor {
				}
				const TestRenderer = new TestRendererClass();
				core.enableCompatibilityMode({
					renderers: [TestRenderer]
				});

				class TestComponent extends Component {
					render() {
						IncDom.elementVoid(ChildComponent, null, null, 'key', 'child');
					}
				}
				TestComponent.RENDERER = TestRenderer;

				component = new TestComponent();
				assert.ok(component.components.child);
				assert.ok(component.components.child instanceof ChildComponent);
			});

			it('should store component references via "key" when renderer is enabled by compatibility mode via its name', function() {
				class TestRendererClass extends IncrementalDomRenderer.constructor {
				}
				const TestRenderer = new TestRendererClass();
				TestRenderer.RENDERER_NAME = 'test';
				core.enableCompatibilityMode({
					renderers: ['test']
				});

				class TestComponent extends Component {
					render() {
						IncDom.elementVoid(ChildComponent, null, null, 'key', 'child');
					}
				}
				TestComponent.RENDERER = TestRenderer;

				component = new TestComponent();
				assert.ok(component.components.child);
				assert.ok(component.components.child instanceof ChildComponent);
			});

			it('should not store component references via "key" when renderer is not enabled by compatibility mode', function() {
				class TestRendererClass extends IncrementalDomRenderer.constructor {
				}
				const TestRenderer = new TestRendererClass();
				core.enableCompatibilityMode({
					renderers: [TestRenderer]
				});

				class TestComponent extends Component {
					render() {
						IncDom.elementVoid(ChildComponent, null, null, 'key', 'child');
					}
				}
				TestComponent.RENDERER = IncrementalDomRenderer;

				component = new TestComponent();
				assert.ok(!component.components.child);
			});

			describe('Sunset Tests', sunset(function() {
				it('should not store component references via "key" on compatibility mode after version 3.x', function() {
					core.enableCompatibilityMode();
					class TestComponent extends Component {
						render() {
							IncDom.elementVoid(ChildComponent, null, null, 'key', 'child');
						}
					}
					TestComponent.RENDERER = IncrementalDomRenderer;

					component = new TestComponent();
					assert.ok(!component.components.child);
				});
			}));
		});
	});

	describe('Function - shouldUpdate', function() {
		it('should only rerender after state change if "shouldUpdate" returns true', function(done) {
			class TestComponent extends Component {
				render() {}

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
			sinon.spy(component, 'render');

			component.bar = 'bar2';
			component.once('stateSynced', function() {
				assert.strictEqual(0, component.render.callCount);
				component.foo = 'foo2';
				component.once('stateSynced', function() {
					assert.strictEqual(1, component.render.callCount);
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
			var fn = props => {
				IncDom.elementOpen('span', null, null, 'foo', props.foo);
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

	describe('Dispose', function() {
		it('should remove component with ref from owner', function() {
			class Child extends Component {
			}
			Child.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncrementalDOM.elementVoid(Child, null, null, 'ref', 'child');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent();
			var child = component.components.child;

			child.dispose();
			assert.ok(child.isDisposed());
			assert.ok(!component.components.child);
		});

		it('should not remove different component with same ref from owner', function() {
			class Child extends Component {
			}
			Child.RENDERER = IncrementalDomRenderer;

			class TestComponent extends Component {
				render() {
					IncrementalDOM.elementVoid(Child, null, null, 'ref', 'child');
				}
			}
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent();
			var child = component.components.child;
			component.components.child = new Child();

			child.dispose();
			assert.ok(child.isDisposed());
			assert.ok(component.components.child);
			assert.ok(!component.components.child.isDisposed());
		});
	});

	describe('IncrementalDomRenderer.isIncDomNode', function() {
		it('should check if given data is an incremental dom node', function() {
			assert.ok(!IncrementalDomRenderer.isIncDomNode({}));
			assert.ok(!IncrementalDomRenderer.isIncDomNode({
					tag: 'span'
				}));
			assert.ok(IncrementalDomRenderer.isIncDomNode({
				[CHILD_OWNER]: true
			}));
		});
	});

	it('should return the component\'s incremental dom renderer object', function() {
		component = new Component();
		const data = IncrementalDomRenderer.getData(component);
		assert.strictEqual(getData(component), data);
	});

	it('should return the component\'s config object', function() {
		component = new Component();
		const config = IncrementalDomRenderer.getConfig(component);
		assert.strictEqual(getData(component).config, config);
	});
});
