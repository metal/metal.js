'use strict';

import { async, core } from 'metal';
import { dom, features } from 'metal-dom';
import Component from '../src/Component';
import ComponentCollector from '../src/ComponentCollector';
import ComponentRegistry from '../src/ComponentRegistry';
import ComponentRenderer from '../src/ComponentRenderer';

describe('Component', function() {
	afterEach(function() {
		document.body.innerHTML = '';
	});

	describe('Lifecycle', function() {
		beforeEach(function() {
			sinon.spy(Component.prototype, 'render');
			sinon.spy(Component.prototype, 'attached');
			sinon.spy(Component.prototype, 'detached');

			sinon.spy(Component.RENDERER.prototype, 'render');
			sinon.spy(Component.RENDERER.prototype, 'update');
		});

		afterEach(function() {
			Component.prototype.render.restore();
			Component.prototype.attached.restore();
			Component.prototype.detached.restore();

			Component.RENDERER.prototype.render.restore();
			Component.RENDERER.prototype.update.restore();
		});

		it('should run component render lifecycle', function() {
			var custom = new Component();
			var renderListener = sinon.stub();
			custom.on('render', renderListener);
			custom.render();

			sinon.assert.callOrder(
				Component.prototype.render,
				Component.RENDERER.prototype.render,
				renderListener,
				Component.prototype.attached
			);
			sinon.assert.callCount(Component.prototype.render, 1);
			sinon.assert.callCount(Component.RENDERER.prototype.render, 1);
			sinon.assert.callCount(renderListener, 1);
			sinon.assert.callCount(Component.prototype.attached, 1);
			sinon.assert.notCalled(Component.prototype.detached);
		});

		it('should be able to manually invoke detach/attach lifecycle', function() {
			var custom = new Component();
			custom.render();
			sinon.assert.callCount(Component.prototype.attached, 1);

			custom.detach();
			custom.detach(); // Allow multiple
			assert.strictEqual(null, document.getElementById(custom.id));
			assert.strictEqual(false, custom.inDocument);
			sinon.assert.callCount(Component.prototype.detached, 1);

			custom.attach();
			custom.attach(); // Allow multiple
			assert.notStrictEqual(null, document.getElementById(custom.id));
			assert.strictEqual(true, custom.inDocument);
			sinon.assert.callCount(Component.prototype.attached, 2);
		});

		it('should throw error if attach() is called before render()', function() {
			var custom = new Component();
			assert.throws(() => custom.attach());
		});

		it('should throw error when component renders and it was already rendered', function() {
			var custom = new Component();
			custom.render();
			assert.throws(function() {
				custom.render();
			}, Error);
			sinon.assert.callCount(Component.prototype.attached, 1);
		});

		it('should throw error when component decorates and it was already decorated', function() {
			var custom = new Component();
			custom.decorate();
			assert.throws(function() {
				custom.decorate();
			}, Error);
			sinon.assert.callCount(Component.prototype.attached, 1);
		});

		it('should return component instance from lifecycle methods', function() {
			var custom = new Component();

			assert.strictEqual(custom, custom.render());
			assert.strictEqual(custom, custom.detach());

			custom = new Component();
			assert.strictEqual(custom, custom.decorate());

			custom.detach();
			assert.strictEqual(custom, custom.attach());
		});

		it('should add component to ComponentCollector after it\'s created', function() {
			var custom = new Component({
				id: 'custom'
			});
			assert.strictEqual(custom, ComponentCollector.components.custom);
		});

		it('should dispose component', function() {
			var custom = new Component();
			custom.render();

			var customId = custom.id;
			assert.notStrictEqual(null, document.getElementById(customId));
			custom.dispose();
			assert.strictEqual(null, document.getElementById(customId));

			sinon.assert.callCount(Component.prototype.detached, 1);
		});
	});

	describe('State', function() {
		it('should set component id', function() {
			var custom = new Component({
				id: 'customId'
			});
			custom.render();
			assert.strictEqual('customId', custom.id);
		});

		it('should generate id when none is given', function() {
			var custom = new Component();
			var custom2 = new Component();
			assert.notStrictEqual(custom.id, custom2.id);
		});

		it('should only create default value for component element after render', function() {
			var custom = new Component();
			assert.ok(!custom.element);
			custom.render();
			assert.ok(custom.element);
		});

		it('should set component element', function() {
			var element = document.createElement('div');
			element.id = 'elementId';
			document.body.appendChild(element);

			var custom = new Component({
				element: element
			});
			custom.render();
			assert.strictEqual('elementId', custom.id);
			assert.strictEqual(element, custom.element);
		});

		it('should set component element from selector', function() {
			var element = document.createElement('div');
			element.className = 'myClass';
			document.body.appendChild(element);

			var custom = new Component({
				element: '.myClass'
			});
			custom.render();
			assert.strictEqual(element, custom.element);
		});

		it('should keep previous element if selector doesn\'t match anything', function() {
			var custom = new Component({
				element: '.myClass'
			});
			assert.ok(!custom.element);

			var element = document.createElement('div');
			custom.element = element;
			assert.strictEqual(element, custom.element);

			custom.element = '.wrongSelector';
			assert.strictEqual(element, custom.element);
		});

		it('should set component element id from id', function() {
			var element = document.createElement('div');
			element.id = 'elementId';
			document.body.appendChild(element);

			var custom = new Component({
				element: element,
				id: 'customId'
			});
			custom.render();
			assert.strictEqual('customId', element.id);
			assert.strictEqual(element, custom.element);
		});

		it('should set id from given element when it has one', function() {
			var element = document.createElement('div');
			element.id = 'elementId';
			var custom = new Component({
				element: element
			});
			assert.strictEqual('elementId', custom.id);
		});

		it('should generate id if given element has none', function() {
			var custom = new Component({
				element: document.createElement('div')
			});
			assert.ok(custom.id);
		});

		it('should set id on new element when changed', function() {
			var custom = new Component({
				id: 'custom'
			}).render();
			custom.element = document.createElement('div');
			assert.strictEqual('custom', custom.id);
		});

		it('should set component elementClasses', function(done) {
			var custom = new Component({
				elementClasses: 'foo bar'
			});
			custom.render();

			assert.strictEqual(2, getClassNames(custom.element).length);
			assert.strictEqual('foo', getClassNames(custom.element)[0]);
			assert.strictEqual('bar', getClassNames(custom.element)[1]);

			custom.elementClasses = 'other';
			async.nextTick(function() {
				assert.strictEqual(1, getClassNames(custom.element).length);
				assert.strictEqual('other', getClassNames(custom.element)[0]);
				done();
			});
		});

		it('should add default component elementClasses from static hint', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ELEMENT_CLASSES = 'overwritten1 overwritten2';

			var custom = new CustomComponent();
			custom.render();
			assert.strictEqual(2, getClassNames(custom.element).length);
			assert.strictEqual('overwritten1', getClassNames(custom.element)[0]);
			assert.strictEqual('overwritten2', getClassNames(custom.element)[1]);
		});

		it('should set elementClasses on new element when changed', function() {
			var custom = new Component({
				elementClasses: 'testClass'
			}).render();
			custom.element = document.createElement('div');
			assert.ok(dom.hasClass(custom.element, 'testClass'));
		});

		it('should update element display value according to visible state', function(done) {
			var custom = new Component().render();

			assert.ok(custom.visible);
			assert.strictEqual('', custom.element.style.display);

			custom.visible = false;
			custom.once('stateChanged', function() {
				assert.strictEqual('none', custom.element.style.display);
				custom.visible = true;
				custom.once('stateChanged', function() {
					assert.strictEqual('', custom.element.style.display);
					done();
				});
			});
		});

		it('should set display value on new element when changed', function() {
			var custom = new Component({
				visible: false
			}).render();
			custom.element = document.createElement('div');
			assert.strictEqual('none', custom.element.style.display);
		});

		it('should only set display value on new element after render', function() {
			var custom = new Component({
				visible: false
			});
			custom.element = document.createElement('div');
			assert.notStrictEqual('none', custom.element.style.display);

			custom.render();
			assert.strictEqual('none', custom.element.style.display);
		});

		it('should not throw error when trying to set display value before element is set', function(done) {
			var custom = new Component();
			custom.visible = false;
			custom.once('stateSynced', function() {
				assert.ok(!custom.visible);
				done();
			});
		});

		it('should return initial config object received by the constructor', function() {
			var config = {};
			var custom = new Component(config);
			assert.strictEqual(config, custom.getInitialConfig());
		});

		describe('events state key', function() {
			it('should attach events to specified functions', function() {
				var listener1 = sinon.stub();
				var listener2 = sinon.stub();

				var custom = new Component({
					events: {
						event1: listener1,
						event2: listener2
					}
				});

				custom.emit('event1');
				assert.strictEqual(1, listener1.callCount);
				assert.strictEqual(0, listener2.callCount);

				custom.emit('event2');
				assert.strictEqual(1, listener1.callCount);
				assert.strictEqual(1, listener2.callCount);
			});

			it('should attach events to specified function names', function() {
				var CustomComponent = createCustomComponentClass();
				CustomComponent.prototype.listener1 = sinon.stub();

				var custom = new CustomComponent({
					events: {
						event1: 'listener1'
					}
				});

				custom.emit('event1');
				assert.strictEqual(1, custom.listener1.callCount);
			});

			it('should warn if trying to attach event to unexisting function name', function() {
				sinon.stub(console, 'error');
				new Component({
					events: {
						event1: 'listener1'
					}
				});

				assert.strictEqual(1, console.error.callCount);
				console.error.restore();
			});

			it('should attach events to specified function name on another component', function() {
				var AnotherComponent = createCustomComponentClass();
				AnotherComponent.prototype.listener1 = sinon.stub();

				var another = new AnotherComponent({
					id: 'another'
				});
				var custom = new Component({
					events: {
						event1: 'another:listener1'
					}
				});

				custom.emit('event1');
				assert.strictEqual(1, another.listener1.callCount);
			});

			it('should warn if trying to attach event to unexisting other component', function() {
				var CustomComponent = createCustomComponentClass();
				CustomComponent.prototype.listener1 = sinon.stub();

				sinon.stub(console, 'error');
				new CustomComponent({
					events: {
						event1: 'unexisting:listener1'
					}
				});

				assert.strictEqual(1, console.error.callCount);
				console.error.restore();
			});

			it('should attach delegate events with specified selector', function() {
				var CustomComponent = createCustomComponentClass('<button class="testButton"></button>');
				CustomComponent.prototype.listener1 = sinon.stub();

				var custom = new CustomComponent({
					events: {
						click: {
							fn: 'listener1',
							selector: '.testButton'
						}
					}
				}).render();

				dom.triggerEvent(custom.element, 'click');
				assert.strictEqual(0, custom.listener1.callCount);
				dom.triggerEvent(custom.element.querySelector('.testButton'), 'click');
				assert.strictEqual(1, custom.listener1.callCount);
			});

			it('should detach unused events when value of the "events" state key is changed', function() {
				var CustomComponent = createCustomComponentClass();
				CustomComponent.prototype.listener1 = sinon.stub();
				CustomComponent.prototype.listener2 = sinon.stub();

				var custom = new CustomComponent({
					events: {
						event1: 'listener1'
					}
				});
				custom.events = {
					event2: 'listener2'
				};

				custom.emit('event1');
				assert.strictEqual(0, custom.listener1.callCount);

				custom.emit('event2');
				assert.strictEqual(1, custom.listener2.callCount);
			});
		});

		it('should synchronize state synchronously on render and asynchronously when state value changes', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.STATE = {
				foo: {
					value: 0
				}
			};
			CustomComponent.prototype.syncUnkown = sinon.spy();
			CustomComponent.prototype.syncFoo = sinon.spy();

			var custom = new CustomComponent({
				foo: 10
			});
			sinon.assert.notCalled(CustomComponent.prototype.syncUnkown);
			sinon.assert.notCalled(CustomComponent.prototype.syncFoo);
			custom.render();
			sinon.assert.notCalled(CustomComponent.prototype.syncUnkown);
			sinon.assert.callCount(CustomComponent.prototype.syncFoo, 1);
			assert.strictEqual(10, CustomComponent.prototype.syncFoo.args[0][0]);

			custom.foo = 20;
			sinon.assert.callCount(CustomComponent.prototype.syncFoo, 1);
			async.nextTick(function() {
				sinon.assert.callCount(CustomComponent.prototype.syncFoo, 2);
				assert.strictEqual(20, CustomComponent.prototype.syncFoo.args[1][0]);
			});

			custom.unknown = 20;
			sinon.assert.notCalled(CustomComponent.prototype.syncUnkown);
			async.nextTick(function() {
				sinon.assert.notCalled(CustomComponent.prototype.syncUnkown);
			});
		});

		it('should fire sync methods for state keys defined by super classes as well', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.STATE = {
				foo: {
					value: 0
				}
			};

			class ChildComponent extends CustomComponent {
			}
			ChildComponent.STATE = {
				bar: {
					value: 1
				}
			};

			var custom = new ChildComponent();
			custom.syncFoo = sinon.spy();
			custom.syncBar = sinon.spy();
			custom.render();
			sinon.assert.callCount(custom.syncFoo, 1);
			sinon.assert.callCount(custom.syncBar, 1);
		});

		it('should emit "stateSynced" event after state changes update the component', function(done) {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.STATE = {
				foo: {
					value: 0
				}
			};

			var custom = new CustomComponent().render();
			var listener = sinon.stub();
			custom.on('stateSynced', listener);
			custom.foo = 1;
			custom.once('stateChanged', function(data) {
				assert.strictEqual(1, listener.callCount);
				assert.strictEqual(data, listener.args[0][0]);
				done();
			});
		});

		it('should not allow defining state key named components', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.STATE = {
				components: {}
			};

			assert.throws(function() {
				new CustomComponent();
			});
		});
	});

	describe('Render', function() {
		it('should render component on body if no parent is specified', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.render();

			assert.strictEqual(document.body, custom.element.parentNode);
		});

		it('should render component on specified default parent if no parent is specified', function() {
			var defaultParent = document.createElement('div');

			class CustomComponent extends Component {
				constructor(opt_config) {
					super(opt_config);
					this.DEFAULT_ELEMENT_PARENT = defaultParent;
				}
			}
			var custom = new CustomComponent();
			custom.render();

			assert.strictEqual(defaultParent, custom.element.parentNode);
		});

		it('should render component on requested parent', function() {
			var container = document.createElement('div');
			document.body.appendChild(container);

			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.render(container);

			assert.strictEqual(container, custom.element.parentNode);
		});

		it('should render component on requested parent selector', function() {
			var container = document.createElement('div');
			container.className = 'myContainer';
			document.body.appendChild(container);

			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.render('.myContainer');

			assert.strictEqual(container, custom.element.parentNode);
		});

		it('should render component on requested parent at specified position', function() {
			var container = document.createElement('div');
			var sibling1 = document.createElement('div');
			var sibling2 = document.createElement('div');
			container.appendChild(sibling1);
			container.appendChild(sibling2);
			document.body.appendChild(container);

			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.render(container, sibling2);

			assert.strictEqual(container, custom.element.parentNode);
			assert.strictEqual(custom.element, sibling1.nextSibling);
			assert.strictEqual(sibling2, custom.element.nextSibling);
		});

		it('should render component according to specified sibling selector', function() {
			var container = document.createElement('div');
			var sibling1 = document.createElement('div');
			var sibling2 = document.createElement('div');
			sibling2.className = 'mySibling';
			container.appendChild(sibling1);
			container.appendChild(sibling2);
			document.body.appendChild(container);

			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.render(container, '.mySibling');

			assert.strictEqual(container, custom.element.parentNode);
			assert.strictEqual(custom.element, sibling1.nextSibling);
			assert.strictEqual(sibling2, custom.element.nextSibling);
		});

		it('should render component without attaching it to a parent when specified', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.render(false);
			assert.ok(!custom.element.parentNode);

			custom.attach();
			assert.strictEqual(document.body, custom.element.parentNode);
		});

		it('should emit "render" event with the decorating key set to false when render is called', function() {
			var custom = new Component();
			var listenerFn = sinon.stub();
			custom.once('render', listenerFn);

			custom.render();

			assert.strictEqual(1, listenerFn.callCount);
			assert.ok(!listenerFn.args[0][0].decorating);
		});

		it('should emit "render" event with the decorating key set to true when decorate is called', function() {
			var custom = new Component();
			var listenerFn = sinon.stub();
			custom.once('render', listenerFn);

			custom.decorate();

			assert.strictEqual(1, listenerFn.callCount);
			assert.ok(listenerFn.args[0][0].decorating);
		});

		it('should not emit "render" event when renderAsSubComponent is called', function() {
			var custom = new Component({
				element: document.createElement('div')
			});
			var listenerFn = sinon.stub();
			custom.once('render', listenerFn);

			custom.renderAsSubComponent();
			assert.strictEqual(0, listenerFn.callCount);
		});
	});

	describe('Events', function() {
		it('should listen to events on the element through Component\'s "on" function', function() {
			var custom = new Component().render();

			var element = custom.element;
			element.onclick = null;
			var listener = sinon.stub();
			custom.on('click', listener);

			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, listener.callCount);

			custom.dispose();
			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should listen to delegate events on the element', function() {
			var CustomComponent = createCustomComponentClass('<div class="foo"></div>');
			var custom = new CustomComponent().render();

			var fooElement = custom.element.querySelector('.foo');
			var listener = sinon.stub();
			custom.delegate('click', '.foo', listener);

			dom.triggerEvent(fooElement, 'click');
			assert.strictEqual(1, listener.callCount);

			custom.dispose();
			dom.triggerEvent(fooElement, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should listen to custom events on the element', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent().render();

			var listener = sinon.stub();
			custom.on('transitionend', listener);

			dom.triggerEvent(custom.element, features.checkAnimationEventName().transition);
			assert.strictEqual(1, listener.callCount);
		});

		it('should transfer events listened through "on" function to new element', function() {
			var custom = new Component().render();
			var element = custom.element;
			var listener = sinon.stub();
			custom.on('click', listener);

			var newElement = document.createElement('div');
			custom.element = newElement;

			dom.triggerEvent(element, 'click');
			assert.strictEqual(0, listener.callCount);

			dom.triggerEvent(newElement, 'click');
			assert.strictEqual(1, listener.callCount);

			custom.dispose();
			dom.triggerEvent(newElement, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should transfer delegate events listened on the component to the new element', function() {
			var CustomComponent = createCustomComponentClass('<div class="foo"></div>');
			var custom = new CustomComponent().render();

			var fooElement = custom.element.querySelector('.foo');
			var listener = sinon.stub();
			custom.delegate('click', '.foo', listener);

			var newElement = document.createElement('div');
			custom.element = newElement;
			dom.append(newElement, '<div class="foo"></div>');

			dom.triggerEvent(fooElement, 'click');
			assert.strictEqual(0, listener.callCount);

			var newFooElement = newElement.querySelector('.foo');
			dom.triggerEvent(newFooElement, 'click');
			assert.strictEqual(1, listener.callCount);

			custom.dispose();
			dom.triggerEvent(newFooElement, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should not reattach element listeners if its set to itself again', function() {
			var custom = new Component().render();
			var listener = sinon.stub();
			custom.on('click', listener);

			custom.element.removeEventListener = sinon.stub();
			custom.element = custom.element;

			assert.strictEqual(0, custom.element.removeEventListener.callCount);
		});

		it('should listen to events on the element even before it\'s created', function() {
			var custom = new Component();
			var listener = sinon.stub();
			custom.on('click', listener);

			custom.render();
			var element = custom.element;
			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should listen to delegate events on the element even before it\'s created', function() {
			var custom = new Component();
			var listener = sinon.stub();
			custom.delegate('click', '.foo', listener);

			custom.render();
			var element = custom.element;
			dom.append(element, '<div class="foo"></div>');

			dom.triggerEvent(element.querySelector('.foo'), 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should not reatach element listeners that were detached when element changes', function() {
			var custom = new Component().render();
			var listener = sinon.stub();
			var handle = custom.on('click', listener);
			handle.removeListener();

			var newElement = document.createElement('div');
			custom.element = newElement;

			dom.triggerEvent(newElement, 'click');
			assert.strictEqual(0, listener.callCount);
		});

		it('should not reatach delegate listeners that were detached when element changes', function() {
			var CustomComponent = createCustomComponentClass('<div class="foo"></div>');
			var custom = new CustomComponent().render();

			var listener = sinon.stub();
			var handle = custom.delegate('click', '.foo', listener);
			handle.removeListener();

			var newElement = document.createElement('div');
			custom.element = newElement;
			dom.append(newElement, '<div class="foo"></div>');

			dom.triggerEvent(newElement.querySelector('.foo'), 'click');
			assert.strictEqual(0, listener.callCount);
		});

		it('should be able to detach element listener that was attached before element changed', function() {
			var custom = new Component().render();
			var listener = sinon.stub();
			var handle = custom.on('click', listener);

			var newElement = document.createElement('div');
			custom.element = newElement;

			handle.removeListener();
			dom.triggerEvent(newElement, 'click');
			assert.strictEqual(0, listener.callCount);
		});

		it('should be able to detach delegate listener that was attached before element changed', function() {
			var CustomComponent = createCustomComponentClass('<div class="foo"></div>');
			var custom = new CustomComponent().render();

			var listener = sinon.stub();
			var handle = custom.delegate('click', '.foo', listener);

			var newElement = document.createElement('div');
			custom.element = newElement;
			dom.append(newElement, '<div class="foo"></div>');

			handle.removeListener();
			dom.triggerEvent(newElement.querySelector('.foo'), 'click');
			assert.strictEqual(0, listener.callCount);
		});
	});

	describe('Sub Components', function() {
		var ChildComponent;

		before(function() {
			ChildComponent = createCustomComponentClass();
			ChildComponent.STATE = {
				foo: {}
			};
			ComponentRegistry.register(ChildComponent, 'ChildComponent');
		});

		it('should add a new sub component', function() {
			var custom = new Component();
			custom.addSubComponent('ChildComponent');
			assert.strictEqual(1, Object.keys(custom.components).length);

			var id = Object.keys(custom.components)[0];
			var sub = custom.components[id];
			assert.ok(sub instanceof ChildComponent);
			assert.strictEqual(id, sub.id);
		});

		it('should add a new sub component with data', function() {
			var custom = new Component();
			custom.addSubComponent('ChildComponent', {
				id: 'child',
				foo: 'foo'
			});
			assert.strictEqual(1, Object.keys(custom.components).length);

			var sub = custom.components.child;
			assert.ok(sub instanceof ChildComponent);
			assert.strictEqual('foo', sub.foo);
		});

		it('should not create a new component when one with the given id already exists', function() {
			var child = new ChildComponent({
				id: 'child'
			});
			var custom = new Component();
			custom.addSubComponent('ChildComponent', {
				id: 'child'
			});

			assert.strictEqual(child, custom.components.child);
		});

		it('should throw error if adding component as its own sub component', function() {
			var custom = new Component();
			assert.throws(function() {
				custom.addSubComponent('ChildComponent', {
					id: custom.id
				});
			});
		});

		it('should get all sub components with ids matching a given prefix', function() {
			var custom = new Component();
			custom.addSubComponent('ChildComponent', {
				id: 'child-with-prefix1'
			});
			custom.addSubComponent('ChildComponent', {
				id: 'child-without-prefix'
			});
			custom.addSubComponent('ChildComponent', {
				id: 'child-with-prefix2'
			});
			custom.addSubComponent('ChildComponent', {
				id: 'child-without-prefix2'
			});

			var childrenWithPrefix = custom.getComponentsWithPrefix('child-with-prefix');
			assert.strictEqual(2, Object.keys(childrenWithPrefix).length);
			assert.ok(childrenWithPrefix['child-with-prefix1']);
			assert.ok(childrenWithPrefix['child-with-prefix2']);
		});

		it('should dispose sub components when parent component is disposed', function() {
			var custom = new Component();
			custom.addSubComponent('ChildComponent', {
				id: 'child'
			});

			var child = custom.components.child;
			assert.ok(!child.isDisposed());

			custom.dispose();
			assert.ok(child.isDisposed());
		});

		it('should not throw error when disposing a component with shared sub components', function() {
			class AnotherComponent extends Component {
				constructor(opt_config) {
					super(opt_config);
					custom.addSubComponent('ChildComponent', {
						id: 'child'
					});
				}
			}
			ComponentRegistry.register(AnotherComponent);

			var custom = new Component();
			custom.addSubComponent('ChildComponent', {
				id: 'child'
			});
			custom.addSubComponent('AnotherComponent', {
				id: 'another'
			});

			var child = custom.components.child;
			var another = custom.components.another;
			assert.ok(!child.isDisposed());
			assert.ok(!another.isDisposed());

			custom.dispose();
			assert.ok(child.isDisposed());
			assert.ok(another.isDisposed());
		});

		it('should not throw error when disposing after subcomponents have already been disposed', function() {
			var custom = new Component();
			custom.addSubComponent('ChildComponent', {
				id: 'child'
			});

			custom.components.child.dispose();
			assert.doesNotThrow(custom.dispose.bind(custom));
		});
	});

	it('should get the renderer instance', function() {
		class TestComponent extends Component {
		}
		var custom = new TestComponent();

		var renderer = custom.getRenderer();
		assert.ok(renderer instanceof ComponentRenderer);
	});

	function createCustomComponentClass(opt_rendererContentOrFn) {
		class CustomComponent extends Component {
		}
		CustomComponent.RENDERER = createCustomRenderer(opt_rendererContentOrFn);
		return CustomComponent;
	}

	function createCustomRenderer(opt_rendererContentOrFn) {
		class CustomRenderer extends ComponentRenderer {
			render() {
				super.render();
				if (core.isFunction(opt_rendererContentOrFn)) {
					opt_rendererContentOrFn();
				} else {
					this.component_.element.innerHTML = opt_rendererContentOrFn;
				}
			}
		}
		return CustomRenderer;
	}

	function getClassNames(element) {
		return element.className.trim().split(' ');
	}
});
