'use strict';

import { async, core } from 'metal';
import { dom, features } from 'metal-dom';
import { validators } from 'metal-state';
import Component from '../src/Component';
import ComponentDataManager from '../src/ComponentDataManager';
import ComponentRenderer from '../src/ComponentRenderer';

describe('Component', function() {
	var comp;

	afterEach(function() {
		document.body.innerHTML = '';
		if (comp) {
			comp.dispose();
		}
	});

	describe('Lifecycle', function() {
		beforeEach(function() {
			sinon.spy(Component.prototype, 'attached');
			sinon.spy(Component.prototype, 'detached');
			sinon.spy(Component.prototype, 'disposed');

			sinon.spy(Component.RENDERER, 'render');
			sinon.spy(Component.RENDERER, 'update');
		});

		afterEach(function() {
			Component.prototype.attached.restore();
			Component.prototype.detached.restore();
			Component.prototype.disposed.restore();

			Component.RENDERER.render.restore();
			Component.RENDERER.update.restore();
		});

		it('should run component render lifecycle', function() {
			var renderListener = sinon.stub();
			class TestComponent extends Component {
				created() {
					this.on('render', renderListener);
				}
			}
			comp = new TestComponent();

			sinon.assert.callOrder(
				Component.RENDERER.render,
				renderListener,
				Component.prototype.attached
			);
			sinon.assert.callCount(Component.RENDERER.render, 1);
			sinon.assert.callCount(renderListener, 1);
			sinon.assert.callCount(Component.prototype.attached, 1);
			sinon.assert.notCalled(Component.prototype.detached);
		});

		it('should not run component render lifecycle if "false" is passed as second param', function() {
			var renderListener = sinon.stub();
			class TestComponent extends Component {
				created() {
					this.on('render', renderListener);
				}
			}
			comp = new TestComponent({}, false);

			sinon.assert.notCalled(Component.RENDERER.render);
			sinon.assert.notCalled(renderListener);
			sinon.assert.notCalled(Component.prototype.attached);
			sinon.assert.notCalled(Component.prototype.detached);
		});

		it('should be able to manually invoke detach/attach lifecycle', function() {
			comp = new Component();
			sinon.assert.callCount(Component.prototype.attached, 1);

			comp.detach();
			comp.detach(); // Allow multiple
			assert.ok(!comp.element.parentNode);
			assert.strictEqual(false, comp.inDocument);
			sinon.assert.callCount(Component.prototype.detached, 1);

			comp.attach();
			comp.attach(); // Allow multiple
			assert.ok(comp.element.parentNode);
			assert.strictEqual(true, comp.inDocument);
			sinon.assert.callCount(Component.prototype.attached, 2);
		});

		it('should not throw error if attach() is called before component is rendered', function() {
			comp = new Component({}, false);
			assert.doesNotThrow(() => comp.attach());
			assert.ok(comp.inDocument);
		});

		it('should emit "attached" event when component is attached', function() {
			comp = new Component({}, false);
			var listener = sinon.stub();
			comp.on('attached', listener);
			comp.attach('.parent', '.sibling');
			assert.strictEqual(1, listener.callCount);
			assert.strictEqual('.parent', listener.args[0][0].parent);
			assert.strictEqual('.sibling', listener.args[0][0].sibling);
		});

		it('should return attach data via the `getAttachData` function', function() {
			comp = new Component({}, false);
			comp.attach('.parent', '.sibling');
			var attachData = comp.getAttachData();
			assert.ok(attachData);
			assert.strictEqual('.parent', attachData.parent);
			assert.strictEqual('.sibling', attachData.sibling);
		});

		it('should run "rendered" lifecycle method when the component is rendered', function() {
			class TestComponent extends Component {
			}
			sinon.spy(TestComponent.prototype, 'rendered');
			comp = new TestComponent();

			assert.strictEqual(1, comp.rendered.callCount);
			assert.ok(comp.rendered.args[0][0]);
		});

		it('should emit "rendered" event when the component is rendered', function() {
			var listener = sinon.stub();
			class TestComponent extends Component {
				created() {
					this.on('rendered', listener);
				}
			}
			comp = new TestComponent();

			assert.strictEqual(1, listener.callCount);
			assert.ok(listener.args[0][0]);
		});

		it('should return component instance from lifecycle triggering methods', function() {
			comp = new Component();
			assert.strictEqual(comp, comp.detach());
			assert.strictEqual(comp, comp.attach());
		});

		it('should dispose component', function() {
			comp = new Component();

			assert.ok(comp.element.parentNode);
			var element = comp.element;

			comp.dispose();
			assert.ok(!element.parentNode);

			sinon.assert.callCount(Component.prototype.detached, 1);
		});

		it('should call "disposed" lifecycle function when component is disposed', function() {
			comp = new Component();
			assert.strictEqual(0, comp.disposed.callCount);

			comp.dispose();
			assert.strictEqual(1, comp.disposed.callCount);
		});
	});

	describe('Element', function() {
		it('should create default value for component element after render', function() {
			comp = new Component();
			assert.ok(comp.element);
		});

		it('should not create default value for component element if not rendered', function() {
			comp = new Component({}, false);
			assert.ok(!comp.element);
		});

		it('should set component element', function() {
			var element = document.createElement('div');
			document.body.appendChild(element);

			comp = new Component({
				element: element
			});
			assert.strictEqual(element, comp.element);
		});

		it('should set component element from selector', function() {
			var element = document.createElement('div');
			element.className = 'myClass';
			document.body.appendChild(element);

			comp = new Component({
				element: '.myClass'
			});
			assert.strictEqual(element, comp.element);
		});

		it('should keep previous element if selector doesn\'t match anything', function() {
			comp = new Component({
				element: '.myClass'
			});
			assert.ok(comp.element);

			var element = document.createElement('div');
			comp.element = element;
			assert.strictEqual(element, comp.element);

			comp.element = '.wrongSelector';
			assert.strictEqual(element, comp.element);
		});

		it('should not set component element to value with invalid type', function() {
			comp = new Component();
			comp.element = 2;
			assert.ok(comp.element);
			assert.notStrictEqual(2, comp.element);
		});
	});

	describe('State', function() {
		it('should merge elementClasses with ELEMENT_CLASSES static hint', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ELEMENT_CLASSES = 'static';

			comp = new CustomComponent({
				elementClasses: 'class'
			});
			assert.strictEqual('class static', comp.elementClasses);
		});

		it('should allow setting element to null', function() {
			comp = new Component();
			assert.doesNotThrow(() => comp.element = null);
			assert.strictEqual(null, comp.element);
		});

		it('should not throw error if detached after element is set to null', function() {
			comp = new Component();
			comp.element = null;
			assert.doesNotThrow(() => comp.detach());
			assert.ok(!comp.inDocument);
		});

		it('should update element display value according to visible state', function(done) {
			comp = new Component();

			assert.ok(comp.visible);
			assert.strictEqual('', comp.element.style.display);

			comp.visible = false;
			comp.once('stateChanged', function() {
				assert.strictEqual('none', comp.element.style.display);
				comp.visible = true;
				comp.once('stateChanged', function() {
					assert.strictEqual('', comp.element.style.display);
					done();
				});
			});
		});

		it('should set display value on new element when changed', function() {
			comp = new Component({
				visible: false
			});
			comp.element = document.createElement('div');
			assert.strictEqual('none', comp.element.style.display);
		});

		it('should not throw error when trying to set display value before element is set', function(done) {
			comp = new Component({}, false);
			comp.visible = false;
			comp.once('stateSynced', function() {
				assert.ok(!comp.visible);
				done();
			});
		});

		it('should return initial config object received by the constructor', function() {
			var config = {};
			comp = new Component(config);
			assert.strictEqual(config, comp.getInitialConfig());
		});

		it('should return an array with all state property names', function() {
			comp = new Component();
			var expected = ['children', 'elementClasses', 'events', 'visible'];
			assert.deepEqual(expected, comp.getStateKeys().sort());
		});

		it('should return an object with all state properties', function() {
			comp = new Component({
				elementClasses: 'myClass'
			});
			var expected = {
				children: [],
				elementClasses: 'myClass',
				events: null,
				visible: true
			};
			assert.deepEqual(expected, comp.getState());
		});

		it('should set state values via the "setState" function', function() {
			comp = new Component();
			comp.setState({
				elementClasses: 'myClass',
				visible: false
			});
			assert.strictEqual('myClass', comp.elementClasses);
			assert.ok(!comp.visible);
		});

		describe('events state key', function() {
			it('should attach events to specified functions', function() {
				var CustomComponent = createCustomComponentClass();
				CustomComponent.prototype.listener1 = sinon.stub();
				const listener2 = sinon.stub();

				comp = new CustomComponent({
					events: {
						event1: 'listener1',
						event2: listener2
					}
				});

				comp.emit('event1');
				assert.strictEqual(1, CustomComponent.prototype.listener1.callCount);
				assert.strictEqual(0, listener2.callCount);

				comp.emit('event2');
				assert.strictEqual(1, CustomComponent.prototype.listener1.callCount);
				assert.strictEqual(1, listener2.callCount);
			});

			it('should attach events when "events" state property value changes', function() {
				var listener1 = sinon.stub();
				var listener2 = sinon.stub();

				comp = new Component();
				comp.events = {
					event1: listener1,
					event2: listener2
				};

				comp.emit('event1');
				assert.strictEqual(1, listener1.callCount);
				assert.strictEqual(0, listener2.callCount);

				comp.emit('event2');
				assert.strictEqual(1, listener1.callCount);
				assert.strictEqual(1, listener2.callCount);
			});

			it('should detach unused events when value of the "events" state key is changed', function() {
				var CustomComponent = createCustomComponentClass();
				CustomComponent.prototype.listener1 = sinon.stub();
				CustomComponent.prototype.listener2 = sinon.stub();

				comp = new CustomComponent({
					events: {
						event1: 'listener1'
					}
				});
				comp.events = {
					event2: 'listener2'
				};

				comp.emit('event1');
				assert.strictEqual(0, comp.listener1.callCount);

				comp.emit('event2');
				assert.strictEqual(1, comp.listener2.callCount);
			});
		});

		it('should synchronize state synchronously on render and asynchronously when state value changes', function(done) {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.STATE = {
				foo: {
					value: 0
				}
			};
			CustomComponent.prototype.syncUnkown = sinon.spy();
			CustomComponent.prototype.syncFoo = sinon.spy();

			comp = new CustomComponent({
				foo: 10
			});
			sinon.assert.notCalled(CustomComponent.prototype.syncUnkown);
			sinon.assert.callCount(CustomComponent.prototype.syncFoo, 1);
			assert.strictEqual(10, CustomComponent.prototype.syncFoo.args[0][0]);

			comp.foo = 20;
			sinon.assert.callCount(CustomComponent.prototype.syncFoo, 1);
			async.nextTick(function() {
				sinon.assert.callCount(CustomComponent.prototype.syncFoo, 2);
				assert.strictEqual(20, CustomComponent.prototype.syncFoo.args[1][0]);

				comp.unknown = 20;
				sinon.assert.notCalled(CustomComponent.prototype.syncUnkown);
				async.nextTick(function() {
					sinon.assert.notCalled(CustomComponent.prototype.syncUnkown);
					done();
				});
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
			ChildComponent.prototype.syncFoo = sinon.spy();
			ChildComponent.prototype.syncBar = sinon.spy();
			ChildComponent.STATE = {
				bar: {
					value: 1
				}
			};

			comp = new ChildComponent();
			sinon.assert.callCount(comp.syncFoo, 1);
			sinon.assert.callCount(comp.syncBar, 1);
		});

		it('should emit "stateSynced" event after state changes update the component', function(done) {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.STATE = {
				foo: {
					value: 0
				}
			};

			comp = new CustomComponent();
			var listener = sinon.stub();
			comp.on('stateSynced', listener);
			comp.foo = 1;
			comp.once('stateChanged', function(data) {
				assert.strictEqual(1, listener.callCount);
				assert.strictEqual(data, listener.args[0][0]);
				done();
			});
		});

		it('should emit "rendered" event with "false" as the first arg when updated by the renderer', function(done) {
			class CustomRenderer extends ComponentRenderer.constructor {
				update(component) {
					component.informRendered();
				}
			}

			class TestComponent extends Component {
			}
			TestComponent.RENDERER = new CustomRenderer();

			comp = new TestComponent();
			var listener = sinon.stub();
			comp.on('rendered', listener);

			comp.visible = false;
			comp.once('stateChanged', function() {
				assert.strictEqual(1, listener.callCount);
				assert.ok(!listener.args[0][0]);
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
			comp = new CustomComponent();
			assert.strictEqual(document.body, comp.element.parentNode);
		});

		it('should render component on specified default parent if no parent is specified', function() {
			var defaultParent = document.createElement('div');

			class CustomComponent extends Component {
				created() {
					this.DEFAULT_ELEMENT_PARENT = defaultParent;
				}
			}
			comp = new CustomComponent();
			assert.strictEqual(defaultParent, comp.element.parentNode);
		});

		it('should render component on requested parent', function() {
			var container = document.createElement('div');
			document.body.appendChild(container);

			var CustomComponent = createCustomComponentClass();
			comp = new CustomComponent({}, container);
			assert.strictEqual(container, comp.element.parentNode);
		});

		it('should render component on requested parent selector', function() {
			var container = document.createElement('div');
			container.className = 'myContainer';
			document.body.appendChild(container);

			var CustomComponent = createCustomComponentClass();
			comp = new CustomComponent({}, '.myContainer');
			assert.strictEqual(container, comp.element.parentNode);
		});

		it('should render component via Component.render', function() {
			class CustomComponent extends Component {
				constructor(...args) {
					super(...args);
					assert.ok(!this.wasRendered);
				}
			}

			var container = document.createElement('div');
			comp = Component.render(
				CustomComponent,
				{
					foo: 'fooValue'
				},
				container
			);

			assert.ok(comp instanceof CustomComponent);
			assert.ok(comp.wasRendered);
			assert.ok(comp.element);
			assert.strictEqual(container, comp.element.parentNode);
			assert.strictEqual('fooValue', comp.getInitialConfig().foo);
		});

		it('should render component via Component.render without config', function() {
			class CustomComponent extends Component {
				constructor(...args) {
					super(...args);
					assert.ok(!this.wasRendered);
				}
			}

			var container = document.createElement('div');
			comp = Component.render(
				CustomComponent,
				container
			);

			assert.ok(comp instanceof CustomComponent);
			assert.ok(comp.wasRendered);
			assert.ok(comp.element);
			assert.strictEqual(container, comp.element.parentNode);
		});

		it('should attach component on requested parent at specified position', function() {
			var container = document.createElement('div');
			var sibling1 = document.createElement('div');
			var sibling2 = document.createElement('div');
			container.appendChild(sibling1);
			container.appendChild(sibling2);
			document.body.appendChild(container);

			var CustomComponent = createCustomComponentClass();
			comp = new CustomComponent();
			comp.detach();
			comp.attach(container, sibling2);

			assert.strictEqual(container, comp.element.parentNode);
			assert.strictEqual(comp.element, sibling1.nextSibling);
			assert.strictEqual(sibling2, comp.element.nextSibling);
		});

		it('should attach component according to specified sibling selector', function() {
			var container = document.createElement('div');
			var sibling1 = document.createElement('div');
			var sibling2 = document.createElement('div');
			sibling2.className = 'mySibling';
			container.appendChild(sibling1);
			container.appendChild(sibling2);
			document.body.appendChild(container);

			var CustomComponent = createCustomComponentClass();
			comp = new CustomComponent();
			comp.detach();
			comp.attach(container, '.mySibling');

			assert.strictEqual(container, comp.element.parentNode);
			assert.strictEqual(comp.element, sibling1.nextSibling);
			assert.strictEqual(sibling2, comp.element.nextSibling);
		});
	});

	describe('Updates', function() {
		it('should call renderer\'s update method if state changes', function(done) {
			var CustomComponent = createCustomComponentClass();
			comp = new CustomComponent();
			const renderer = comp.getRenderer();
			sinon.spy(renderer, 'update');

			comp.visible = false;
			comp.once('stateChanged', function() {
				assert.strictEqual(1, renderer.update.callCount);
				done();
			});
		});

		it('should not call renderer\'s update method if state changes before render', function(done) {
			var CustomComponent = createCustomComponentClass();
			comp = new CustomComponent({}, false);
			const renderer = comp.getRenderer();
			sinon.spy(renderer, 'update');

			comp.visible = false;
			async.nextTick(function() {
				assert.strictEqual(0, renderer.update.callCount);
				done();
			});
		});

		it('should not call renderer\'s update method if state changes while skipping updates', function(done) {
			var CustomComponent = createCustomComponentClass();
			comp = new CustomComponent();
			const renderer = comp.getRenderer();
			sinon.spy(renderer, 'update');

			comp.startSkipUpdates();
			comp.visible = false;
			comp.once('stateChanged', function() {
				assert.strictEqual(0, renderer.update.callCount);

				comp.stopSkipUpdates();
				comp.visible = true;
				comp.once('stateChanged', function() {
					assert.strictEqual(1, renderer.update.callCount);
					done();
				});
			});
		});

		describe('SYNC_UPDATES', function() {
			it('should call the renderer\'s update method synchronously if state changes', function() {
				const CustomComponent = createCustomComponentClass();
				CustomComponent.SYNC_UPDATES = true;

				comp = new CustomComponent();
				const renderer = comp.getRenderer();
				sinon.spy(renderer, 'update');

				comp.visible = false;
				const expectedData = {
					visible: {
						key: 'visible',
						prevVal: true,
						newVal: false
					}
				};
				assert.strictEqual(1, renderer.update.callCount);
				assert.strictEqual(comp, renderer.update.args[0][0]);
				assert.deepEqual(expectedData, renderer.update.args[0][1].changes);
			});

			it('should not call the renderer\'s update method asynchronously if state changes', function(done) {
				const CustomComponent = createCustomComponentClass();
				CustomComponent.SYNC_UPDATES = true;

				comp = new CustomComponent();
				const renderer = comp.getRenderer();

				comp.visible = false;
				sinon.spy(renderer, 'update');
				comp.once('stateSynced', function() {
					assert.strictEqual(0, renderer.update.callCount);
					done();
				});
			});

			it('should not call the renderer\'s update method when state changes before render', function() {
				const CustomComponent = createCustomComponentClass();
				CustomComponent.SYNC_UPDATES = true;

				comp = new CustomComponent({}, false);
				const renderer = comp.getRenderer();
				sinon.spy(renderer, 'update');

				comp.visible = false;
				assert.strictEqual(0, renderer.update.callCount);
			});
		});
	});

	describe('Events', function() {
		it('should listen to events on the element through Component\'s "on" function', function() {
			comp = new Component();

			var element = comp.element;
			element.onclick = null;
			var listener = sinon.stub();
			comp.on('click', listener);

			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, listener.callCount);

			comp.dispose();
			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should listen to delegate events on the element', function() {
			var CustomComponent = createCustomComponentClass('<div class="foo"></div>');
			comp = new CustomComponent();

			var fooElement = comp.element.querySelector('.foo');
			var listener = sinon.stub();
			comp.delegate('click', '.foo', listener);

			dom.triggerEvent(fooElement, 'click');
			assert.strictEqual(1, listener.callCount);

			comp.dispose();
			dom.triggerEvent(fooElement, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should listen to custom events on the element', function() {
			var CustomComponent = createCustomComponentClass();
			comp = new CustomComponent();

			var listener = sinon.stub();
			comp.on('transitionend', listener);

			dom.triggerEvent(comp.element, features.checkAnimationEventName().transition);
			assert.strictEqual(1, listener.callCount);
		});

		it('should transfer events listened through "on" function to new element', function() {
			comp = new Component();
			var element = comp.element;
			var listener = sinon.stub();
			comp.on('click', listener);

			var newElement = document.createElement('div');
			dom.enterDocument(newElement);
			comp.element = newElement;

			dom.triggerEvent(element, 'click');
			assert.strictEqual(0, listener.callCount);

			dom.triggerEvent(newElement, 'click');
			assert.strictEqual(1, listener.callCount);

			comp.dispose();
			dom.triggerEvent(newElement, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should transfer delegate events listened on the component to the new element', function() {
			var CustomComponent = createCustomComponentClass('<div class="foo"></div>');
			comp = new CustomComponent();

			var fooElement = comp.element.querySelector('.foo');
			var listener = sinon.stub();
			comp.delegate('click', '.foo', listener);

			var newElement = document.createElement('div');
			dom.enterDocument(newElement);
			comp.element = newElement;
			dom.append(newElement, '<div class="foo"></div>');

			dom.triggerEvent(fooElement, 'click');
			assert.strictEqual(0, listener.callCount);

			var newFooElement = newElement.querySelector('.foo');
			dom.triggerEvent(newFooElement, 'click');
			assert.strictEqual(1, listener.callCount);

			comp.dispose();
			dom.triggerEvent(newFooElement, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should not reattach element listeners if its set to itself again', function() {
			comp = new Component();
			var listener = sinon.stub();
			comp.on('click', listener);

			comp.element.removeEventListener = sinon.stub();
			comp.element = comp.element;

			assert.strictEqual(0, comp.element.removeEventListener.callCount);
		});

		it('should listen to events on the element even before it\'s created', function() {
			comp = new Component({}, false);
			var listener = sinon.stub();
			comp.on('click', listener);

			var element = document.createElement('div');
			dom.enterDocument(element);
			comp.element = element;
			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should listen to delegate events on the element even before it\'s created', function() {
			comp = new Component({}, false);
			var listener = sinon.stub();
			comp.delegate('click', '.foo', listener);

			var element = document.createElement('div');
			dom.enterDocument(element);
			dom.append(element, '<div class="foo"></div>');
			comp.element = element;

			dom.triggerEvent(element.querySelector('.foo'), 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should not reatach element listeners that were detached when element changes', function() {
			comp = new Component();
			var listener = sinon.stub();
			var handle = comp.on('click', listener);
			handle.removeListener();

			var newElement = document.createElement('div');
			comp.element = newElement;

			dom.triggerEvent(newElement, 'click');
			assert.strictEqual(0, listener.callCount);
		});

		it('should not reatach delegate listeners that were detached when element changes', function() {
			var CustomComponent = createCustomComponentClass('<div class="foo"></div>');
			comp = new CustomComponent();

			var listener = sinon.stub();
			var handle = comp.delegate('click', '.foo', listener);
			handle.removeListener();

			var newElement = document.createElement('div');
			comp.element = newElement;
			dom.append(newElement, '<div class="foo"></div>');

			dom.triggerEvent(newElement.querySelector('.foo'), 'click');
			assert.strictEqual(0, listener.callCount);
		});

		it('should be able to detach element listener that was attached before element changed', function() {
			var comp = new Component();
			var listener = sinon.stub();
			var handle = comp.on('click', listener);

			var newElement = document.createElement('div');
			comp.element = newElement;

			handle.removeListener();
			dom.triggerEvent(newElement, 'click');
			assert.strictEqual(0, listener.callCount);
		});

		it('should be able to detach delegate listener that was attached before element changed', function() {
			var CustomComponent = createCustomComponentClass('<div class="foo"></div>');
			comp = new CustomComponent();

			var listener = sinon.stub();
			var handle = comp.delegate('click', '.foo', listener);

			var newElement = document.createElement('div');
			comp.element = newElement;
			dom.append(newElement, '<div class="foo"></div>');

			handle.removeListener();
			dom.triggerEvent(newElement.querySelector('.foo'), 'click');
			assert.strictEqual(0, listener.callCount);
		});
	});

	describe('Validators', function() {
		let originalConsoleErrorFn = console.error;

		beforeEach(function() {
			console.error = sinon.stub();
		});

		afterEach(function() {
			console.error = originalConsoleErrorFn;
		});

		it('should warn if validator fails on initial value', function() {
			class TestComponent extends Component {
			}
			TestComponent.STATE = {
				foo: {
					validator: validators.string
				}
			};
			comp = new TestComponent({
				foo: 10
			});
			assert.strictEqual(1, console.error.callCount);
		});
	});

	it('should get the renderer instance', function() {
		class TestComponent extends Component {
		}
		comp = new TestComponent();

		var renderer = comp.getRenderer();
		assert.ok(renderer instanceof ComponentRenderer.constructor);
	});

	it('should get the data manager', function() {
		class TestComponent extends Component {
		}
		comp = new TestComponent();
		assert.strictEqual(ComponentDataManager, comp.getDataManager());
	});

	it('should check if the given function is a component constructor', function() {
		class TestComponent extends Component {
		}
		assert.ok(Component.isComponentCtor(Component));
		assert.ok(Component.isComponentCtor(TestComponent));
		assert.ok(!Component.isComponentCtor(() => {
			}));
		var fn = () => {
		};
		assert.ok(!Component.isComponentCtor(fn.bind(this)));
	});

	function createCustomComponentClass(opt_rendererContentOrFn) {
		class CustomComponent extends Component {
		}
		CustomComponent.RENDERER = createCustomRenderer(opt_rendererContentOrFn);
		return CustomComponent;
	}

	function createCustomRenderer(opt_rendererContentOrFn) {
		class CustomRenderer extends ComponentRenderer.constructor {
			render(component) {
				super.render(component);
				if (core.isFunction(opt_rendererContentOrFn)) {
					opt_rendererContentOrFn();
				} else {
					component.element.innerHTML = opt_rendererContentOrFn;
				}
			}
		}
		return new CustomRenderer();
	}
});
