'use strict';

import async from '../../../src/async/async';
import core from '../../../src/core';
import dom from '../../../src/dom/dom';
import features from '../../../src/dom/features';
import object from '../../../src/object/object';
import Component from '../../../src/component/Component';
import ComponentCollector from '../../../src/component/ComponentCollector';
import ComponentRegistry from '../../../src/component/ComponentRegistry';
import ComponentRenderer from '../../../src/component/ComponentRenderer';

describe('Component', function() {
	afterEach(function() {
		document.body.innerHTML = '';
		Component.surfacesCollector.removeAllSurfaces();
	});

	describe('Lifecycle', function() {
		it('should test component render lifecycle', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-header') + comp.buildPlaceholder(comp.id + '-bottom');
				}
			});

			var custom = new CustomComponent({
				element: document.createElement('div')
			});
			var renderListener = sinon.stub();
			custom.on('render', renderListener);
			custom.render();

			sinon.assert.callOrder(
				CustomComponent.RENDERER.getSurfaceContent,
				renderListener,
				CustomComponent.prototype.attached
			);
			sinon.assert.callCount(renderListener, 1);
			sinon.assert.callCount(CustomComponent.RENDERER.getSurfaceContent, 3);
			sinon.assert.callCount(CustomComponent.prototype.attached, 1);

			var renderer = CustomComponent.RENDERER;
			assert.strictEqual(custom.id, renderer.getSurfaceContent.args[0][0].surfaceElementId);
			assert.strictEqual(custom.id + '-header', renderer.getSurfaceContent.args[1][0].surfaceElementId);
			assert.strictEqual(custom.id + '-bottom', renderer.getSurfaceContent.args[2][0].surfaceElementId);

			sinon.assert.notCalled(CustomComponent.prototype.detached);
		});

		it('should be able to manually invoke detach/attach lifecycle', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.render();
			sinon.assert.callCount(CustomComponent.prototype.attached, 1);

			custom.detach();
			custom.detach(); // Allow multiple
			assert.strictEqual(null, document.getElementById(custom.id));
			assert.strictEqual(false, custom.inDocument);
			sinon.assert.callCount(CustomComponent.prototype.detached, 1);

			custom.attach();
			custom.attach(); // Allow multiple
			assert.notStrictEqual(null, document.getElementById(custom.id));
			assert.strictEqual(true, custom.inDocument);
			sinon.assert.callCount(CustomComponent.prototype.attached, 2);
		});

		it('should return the renderer from getRenderer', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent().render();
			assert.strictEqual(CustomComponent.RENDERER, custom.getRenderer());
		});

		it('should use div as the default tagName for the component element', function() {
			var CustomComponent = createCustomComponentClass();

			var custom = new CustomComponent().render();
			assert.strictEqual('div', custom.element.tagName.toLowerCase());
		});

		it('should overwrite component element tagName', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ELEMENT_TAG_NAME = 'span';

			var custom = new CustomComponent();
			custom.render();
			assert.strictEqual('span', custom.element.tagName.toLowerCase());
		});

		it('should use first defined tag name', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ELEMENT_TAG_NAME = 'span';

			class ChildComponent extends CustomComponent {
			}

			var custom = new ChildComponent().render();
			assert.strictEqual('span', custom.element.tagName.toLowerCase());
		});

		it('should render the content string defined by the renderer', function() {
			var CustomComponent = createCustomComponentClass('<div>My content</div>');
			var custom = new CustomComponent();
			custom.render();

			assert.strictEqual('<div>My content</div>', custom.element.innerHTML);
		});

		it('should build element tag from renderer content if its string defines a wrapper with the component id', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				return '<span id="' + comp.id + '" data-foo="foo">My Content</span>';
			});
			CustomComponent.ELEMENT_TAG_NAME = 'span';

			var custom = new CustomComponent().render();
			assert.strictEqual('SPAN', custom.element.tagName);
			assert.strictEqual('foo', custom.element.getAttribute('data-foo'));
		});

		it('should not throw error if ELEMENT_TAG_NAME is different from element tag returned by the renderer', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				return '<span id="' + comp.id + '" data-foo="foo">My Content</span>';
			});

			sinon.stub(console, 'error');
			var custom = new CustomComponent().render();
			assert.strictEqual('SPAN', custom.element.tagName);
			assert.strictEqual(0, console.error.callCount);
			console.error.restore();
		});

		it('should warn if tag from given element is different from the one returned by the renderer', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				return '<span id="' + comp.id + '" data-foo="foo">My Content</span>';
			});

			sinon.stub(console, 'error');
			var custom = new CustomComponent({
				element: document.createElement('div')
			}).render();
			assert.strictEqual('DIV', custom.element.tagName);
			assert.strictEqual('foo', custom.element.getAttribute('data-foo'));
			assert.strictEqual(1, console.error.callCount);
			assert.notStrictEqual(-1, console.error.args[0][0].indexOf('CustomComponent'));
			console.error.restore();
		});

		it('should throw error when component renders and it was already rendered', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.render();
			assert.throws(function() {
				custom.render();
			}, Error);
			sinon.assert.callCount(CustomComponent.prototype.attached, 1);
		});

		it('should throw error when component decorates and it was already decorated', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.decorate();
			assert.throws(function() {
				custom.decorate();
			}, Error);
			sinon.assert.callCount(CustomComponent.prototype.attached, 1);
		});

		it('should not throw error if component doesn\'t set a custom renderer', function() {
			class CustomComponent extends Component {
			}

			assert.doesNotThrow(function() {
				var custom = new CustomComponent();
				custom.render();
				custom.detach();

				custom = new CustomComponent();
				custom.decorate();
			});
		});

		it('should return component instance from lifecycle methods', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();

			assert.strictEqual(custom, custom.render());
			assert.strictEqual(custom, custom.detach());

			custom = new CustomComponent();
			assert.strictEqual(custom, custom.decorate());

			custom.detach();
			assert.strictEqual(custom, custom.attach());
		});

		it('should add component to ComponentCollector after it\'s created', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent({
				id: 'custom'
			});
			assert.strictEqual(custom, ComponentCollector.components.custom);
		});

		it('should dispose component', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.render();

			var customId = custom.id;
			assert.notStrictEqual(null, document.getElementById(customId));
			custom.dispose();
			assert.strictEqual(null, document.getElementById(customId));

			sinon.assert.callCount(CustomComponent.prototype.detached, 1);
		});
	});

	describe('Attributes', function() {
		it('should set component id attr', function() {
			var CustomComponent = createCustomComponentClass();

			var custom = new CustomComponent({
				id: 'customId'
			});
			custom.render();
			assert.strictEqual('customId', custom.id);
		});

		it('should set component element attr', function() {
			var CustomComponent = createCustomComponentClass();

			var element = document.createElement('div');
			element.id = 'elementId';
			document.body.appendChild(element);

			var custom = new CustomComponent({
				element: element
			});
			custom.render();
			assert.strictEqual('elementId', custom.id);
			assert.strictEqual(element, custom.element);
		});

		it('should set component element attr from selector', function() {
			var CustomComponent = createCustomComponentClass();

			var element = document.createElement('div');
			element.className = 'myClass';
			document.body.appendChild(element);

			var custom = new CustomComponent({
				element: '.myClass'
			});
			custom.render();
			assert.strictEqual(element, custom.element);
		});

		it('should set component element to default value if selector doesn\'t match any element', function() {
			var CustomComponent = createCustomComponentClass();

			var custom = new CustomComponent({
				element: '.myClass'
			});
			custom.render();
			assert.ok(custom.element);
		});

		it('should set component element id from id attr', function() {
			var CustomComponent = createCustomComponentClass();

			var element = document.createElement('div');
			element.id = 'elementId';
			document.body.appendChild(element);

			var custom = new CustomComponent({
				element: element,
				id: 'customId'
			});
			custom.render();
			assert.strictEqual('customId', element.id);
			assert.strictEqual(element, custom.element);
		});

		it('should set component elementClasses attr', function(done) {
			var CustomComponent = createCustomComponentClass();

			var custom = new CustomComponent({
				elementClasses: 'foo bar'
			});
			custom.render();

			assert.strictEqual(3, getClassNames(custom.element).length);
			assert.strictEqual('component', getClassNames(custom.element)[0]);
			assert.strictEqual('foo', getClassNames(custom.element)[1]);
			assert.strictEqual('bar', getClassNames(custom.element)[2]);

			custom.elementClasses = 'other';
			async.nextTick(function() {
				assert.strictEqual(2, getClassNames(custom.element).length);
				assert.strictEqual('component', getClassNames(custom.element)[0]);
				assert.strictEqual('other', getClassNames(custom.element)[1]);
				done();
			});
		});

		it('should add default component elementClasses from static hint', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ELEMENT_CLASSES = 'overwritten1 overwritten2';

			var custom = new CustomComponent();
			custom.render();
			assert.strictEqual(3, getClassNames(custom.element).length);
			assert.strictEqual('overwritten1', getClassNames(custom.element)[0]);
			assert.strictEqual('overwritten2', getClassNames(custom.element)[1]);
			assert.strictEqual('component', getClassNames(custom.element)[2]);
		});

		it('should update element display value according to visible attr', function(done) {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent().render();

			assert.ok(custom.visible);
			assert.strictEqual('', custom.element.style.display);

			custom.visible = false;
			custom.once('attrsChanged', function() {
				assert.strictEqual('none', custom.element.style.display);
				custom.visible = true;
				custom.once('attrsChanged', function() {
					assert.strictEqual('', custom.element.style.display);
					done();
				});
			});
		});

		describe('events attr', function() {
			it('should attach events to specified functions', function() {
				var listener1 = sinon.stub();
				var listener2 = sinon.stub();
				var CustomComponent = createCustomComponentClass();

				var custom = new CustomComponent({
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
				var CustomComponent = createCustomComponentClass();

				sinon.stub(console, 'error');
				new CustomComponent({
					events: {
						event1: 'listener1'
					}
				});

				assert.strictEqual(1, console.error.callCount);
				console.error.restore();
			});

			it('should attach events to specified function name on another component', function() {
				var CustomComponent = createCustomComponentClass();
				var AnotherComponent = createCustomComponentClass();
				AnotherComponent.prototype.listener1 = sinon.stub();

				var another = new AnotherComponent({
					id: 'another'
				});
				var custom = new CustomComponent({
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

			it('should detach unused events when value of the "events" attribute is changed', function() {
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

		it('should fire synchronize attr synchronously on render and asynchronously when attr value change', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ATTRS = {
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

		it('should fire sync methods for attrs defined by super classes as well', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ATTRS = {
				foo: {
					value: 0
				}
			};

			class ChildComponent extends CustomComponent {
			}
			ChildComponent.ATTRS = {
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

		it('should emit "attrsSynced" event after attr changes update the component', function(done) {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ATTRS = {
				foo: {
					value: 0
				}
			};

			var custom = new CustomComponent().render();
			var listener = sinon.stub();
			custom.on('attrsSynced', listener);
			custom.foo = 1;
			custom.once('attrsChanged', function(data) {
				assert.strictEqual(1, listener.callCount);
				assert.strictEqual(data, listener.args[0][0]);
				done();
			});
		});

		it('should not allow defining attribute named components', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ATTRS = {
				components: {}
			};

			assert.throws(function() {
				new CustomComponent();
			});
		});

		it('should not allow defining attribute named elementContent', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ATTRS = {
				elementContent: {}
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
	});

	describe('Decorate', function() {
		beforeEach(function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					var placeholder = comp.buildPlaceholder(comp.id + '-footer', {
						renderAttrs: ['footerContent']
					});
					return '<custom id="' + comp.id + '">' + placeholder + '</custom>';
				} else {
					return '<footer id="' + comp.id + '-footer" class="myFooter" data-bar="bar">' + comp.footerContent + '</footer>';
				}
			});
			this.CustomComponent = CustomComponent;

			document.body.innerHTML = '';
		});

		it('should not rerender surfaces when component is decorated and html is correct', function() {
			dom.append(
				document.body,
				'<custom id="custom"><footer id="custom-footer" class="myFooter" data-bar="bar">My Footer</footer></custom>'
			);
			var footerElement = document.body.querySelector('#custom-footer');

			var custom = new this.CustomComponent({
				element: '#custom',
				footerContent: 'My Footer'
			}).decorate();

			assert.strictEqual(footerElement, custom.getSurfaceElement('footer'));
		});

		it('should rerender surfaces when component is decorated and main content html is not correct', function() {
			dom.append(
				document.body,
				'<custom id="custom">wrong<footer id="custom-footer" class="myFooter" data-bar="bar">My Footer</footer></custom>'
			);
			var footerElement = document.body.querySelector('#custom-footer');

			var custom = new this.CustomComponent({
				element: '#custom',
				footerContent: 'My Footer'
			}).decorate();

			assert.notStrictEqual(footerElement, custom.getSurfaceElement('footer'));
		});

		it('should rerender surfaces when component is decorated and surface html is not correct', function() {
			dom.append(
				document.body,
				'<custom id="custom"><footer id="custom-footer" class="myFooter" data-bar="bar">My Footer</footer></custom>'
			);
			var footerElement = document.body.querySelector('#custom-footer');

			var custom = new this.CustomComponent({
				element: '#custom',
				footerContent: 'My Footer 2'
			}).decorate();

			assert.notStrictEqual(footerElement, custom.getSurfaceElement('footer'));
		});
	});

	describe('Events', function() {
		it('should listen to events on the element through Component\'s "on" function', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.render();

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
			var custom = new CustomComponent();
			custom.render();

			var listener = sinon.stub();
			custom.on('transitionend', listener);

			dom.triggerEvent(custom.element, features.checkAnimationEventName().transition);
			assert.strictEqual(1, listener.callCount);
		});
	});

	describe('Surfaces', function() {
		it('should aggregate surfaces from hierarchy static hint', function() {
			var ParentComponent = createCustomComponentClass();
			ParentComponent.SURFACES = {
				header: {},
				bottom: {}
			};

			class ChildComponent extends ParentComponent {
			}
			ChildComponent.NAME = 'ChildComponent';
			ChildComponent.SURFACES = {
				content: {}
			};

			var child = new ChildComponent();
			assert.deepEqual(['bottom', 'content', 'header', child.id], Object.keys(child.getSurfaces()).sort());

			// Adds test coverage for skipping surfaces aggregation
			new ChildComponent();
		});

		it('should dynamically add surfaces', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			var headerSurfaceConfig = {};
			custom.addSurface('header', headerSurfaceConfig);
			custom.addSurface('bottom');
			assert.strictEqual(headerSurfaceConfig, custom.getSurface('header'));
			assert.deepEqual(['bottom', 'header', custom.id], Object.keys(custom.getSurfaces()).sort());
			assert.strictEqual(null, custom.getSurface('unknown'));
		});

		it('should emit "renderSurface" event for the main component surface on render', function() {
			var CustomComponent = createCustomComponentClass();
			ComponentRegistry.register(CustomComponent);
			var custom = new CustomComponent();

			var listener = sinon.stub();
			custom.on('renderSurface', listener);
			custom.render();

			assert.strictEqual(1, listener.callCount);
			assert.deepEqual(custom.id, listener.args[0][0].surfaceId);
		});

		it('should emit "renderSurface" event for each surface that will be rendered on attr change', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-header') + comp.buildPlaceholder(comp.id + '-body') +
						comp.buildPlaceholder(comp.id + '-bottom');
				}
			});
			CustomComponent.SURFACES = {
				header: {
					renderAttrs: ['foo']
				},
				body: {
					renderAttrs: ['bar']
				},
				bottom: {
					renderAttrs: ['foo', 'bar']
				}
			};
			ComponentRegistry.register(CustomComponent);
			var custom = new CustomComponent().render();

			var listener = sinon.stub();
			custom.on('renderSurface', listener);

			custom.foo = 2;
			custom.once('attrsChanged', function() {
				assert.strictEqual(2, listener.callCount);
				var surfaceIds = [listener.args[0][0].surfaceId, listener.args[1][0].surfaceId];
				assert.deepEqual(['bottom', 'header'], surfaceIds.sort());
				done();
			});
		});

		it('should not render surfaces that had their "renderSurface" event prevented', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-header') + comp.buildPlaceholder(comp.id + '-bottom');
				} else {
					return comp.foo;
				}
			});
			CustomComponent.SURFACES = {
				header: {
					renderAttrs: ['foo']
				},
				bottom: {
					renderAttrs: ['foo']
				}
			};
			ComponentRegistry.register(CustomComponent);
			var custom = new CustomComponent().render();

			custom.on('renderSurface', function(data, event) {
				if (data.surfaceId === 'header') {
					event.preventDefault();
				}
			});

			custom.foo = 'foo';
			custom.once('attrsChanged', function() {
				assert.strictEqual('foo', custom.getSurfaceElement('bottom').textContent);
				assert.strictEqual('', custom.getSurfaceElement('header').textContent);
				done();
			});
		});

		it('should use div as the default tagName for surface elements', function() {
			var CustomComponent = createCustomComponentClass();

			var custom = new CustomComponent();
			custom.addSurface('header');
			custom.render();
			assert.strictEqual('div', custom.getSurfaceElement('header').tagName.toLowerCase());
		});

		it('should overwrite surface element tagName', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.SURFACE_TAG_NAME = 'span';

			var custom = new CustomComponent();
			custom.addSurface('header');
			custom.render();
			assert.strictEqual('span', custom.getSurfaceElement('header').tagName.toLowerCase());
		});

		it('should use first defined surface tag name', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.SURFACE_TAG_NAME = 'span';

			class ChildComponent extends CustomComponent {
				constructor(opt_config) {
					super(opt_config);
				}
			}

			var custom = new ChildComponent();
			custom.addSurface('header');
			custom.render();
			assert.strictEqual('span', custom.getSurfaceElement('header').tagName.toLowerCase());
		});

		it('should create surface element if it hasn\'t been created before', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.SURFACES = {
				header: {}
			};

			var custom = new CustomComponent();
			var surface = custom.getSurfaceElement('header');

			assert.ok(surface);
			assert.strictEqual(surface, custom.getSurfaceElement('header'));
		});

		it('should not share same surface config object between instances', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.SURFACES = {
				header: {}
			};

			var custom1 = new CustomComponent();
			var custom2 = new CustomComponent();

			assert.ok(custom1.getSurface('header') !== custom2.getSurface('header'));
		});

		it('should get surface element from the document when it exists', function() {
			var element = document.createElement('div');
			element.id = 'custom';
			var surface = document.createElement('div');
			surface.id = 'custom-header';
			element.appendChild(surface);
			document.body.appendChild(element);

			var CustomComponent = createCustomComponentClass();
			CustomComponent.SURFACES = {
				header: {}
			};
			var custom = new CustomComponent({
				element: element
			});

			assert.strictEqual(surface, custom.getSurfaceElement('header'));
		});

		it('should return null when element is requested for unknown surface', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.render();
			assert.strictEqual(null, custom.getSurfaceElement('unknown'));
		});

		it('should get element for component surface', function() {
			var CustomComponent = createCustomComponentClass();
			ComponentRegistry.register(CustomComponent);
			var custom = new CustomComponent();
			custom.addSurface('comp', {
				componentName: 'CustomComponent'
			});
			assert.strictEqual(custom.components.comp.element, custom.getSurfaceElement('comp'));
		});

		it('should not throw error when getting element of component surface for component that isn\'t registered', function() {
			var CustomComponent = createCustomComponentClass();
			ComponentRegistry.register(CustomComponent);
			var custom = new CustomComponent();
			custom.addSurface('comp', {
				componentName: 'CustomComponent'
			});
			Component.componentsCollector.removeComponent(custom.components.comp);
			assert.ok(!custom.getSurfaceElement('comp'));
		});

		it('should remove surface and its element from dom', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-header');
				}
			});
			var custom = new CustomComponent({
				id: 'custom'
			});
			custom.render();
			custom.removeSurface('header');
			assert.strictEqual(null, custom.getSurface('header'));
			assert.strictEqual(null, custom.getSurfaceElement('header'));
			assert.strictEqual(null, document.getElementById('custom-header'));
			assert.doesNotThrow(function() {
				custom.removeSurface('header');
			});
		});

		it('should remove surfaces from collector when component is disposed', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent({
				id: 'custom'
			});
			custom.addSurface('header');

			assert.ok(Component.surfacesCollector.getSurface('custom-header'));
			custom.dispose();
			assert.ok(!Component.surfacesCollector.getSurface('custom-header'));
		});

		it('should render surface content from string', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-header') + comp.buildPlaceholder(comp.id + '-bottom');
				} else {
					switch (comp.getSurfaceId(surface)) {
						case 'header':
							return '<b>header</b>';
						case 'bottom':
							return '<span>bottom</span>';
					}
				}
			});
			var custom = new CustomComponent();
			custom.addSurface('header');
			custom.addSurface('bottom');
			custom.render();
			assert.strictEqual('<b>header</b>', custom.getSurfaceElement('header').innerHTML);
			assert.strictEqual('<span>bottom</span>', custom.getSurfaceElement('bottom').innerHTML);
		});

		it('should render surface element if it\'s defined in getSurfaceContent\'s string result', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-header') + comp.buildPlaceholder(comp.id + '-bottom');
				} else {
					switch (comp.getSurfaceId(surface)) {
						case 'header':
							return '<header id="' + comp.id + '-header" class="testHeader" data-foo="foo"><b>header</b></header>';
						case 'bottom':
							return '<bottom id="' + comp.id + '-bottom" class="testBottom" data-bar="bar"><span>bottom</span></bottom>';
					}
				}
			});
			var custom = new CustomComponent();
			custom.addSurface('header');
			custom.addSurface('bottom');
			custom.render();

			var headerElement = custom.getSurfaceElement('header');
			var bottomElement = custom.getSurfaceElement('bottom');
			assert.strictEqual('HEADER', headerElement.tagName);
			assert.strictEqual('testHeader', headerElement.className);
			assert.strictEqual('foo', headerElement.getAttribute('data-foo'));
			assert.strictEqual('BOTTOM', bottomElement.tagName);
			assert.strictEqual('testBottom', bottomElement.className);
			assert.strictEqual('bar', bottomElement.getAttribute('data-bar'));
		});

		it('should replace surface element if its definition in getSurfaceContent changes', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-dynamic', {
						renderAttrs: ['tag']
					});
				} else {
					return '<' + comp.tag + ' id="' + comp.id + '-dynamic"></' + comp.tag + '>';
				}
			});
			var custom = new CustomComponent({
				tag: 'div'
			}).render();

			var surfaceElement = custom.getSurfaceElement('dynamic');
			assert.strictEqual('DIV', surfaceElement.tagName);

			custom.tag = 'span';
			custom.once('attrsChanged', function() {
				var newSurfaceElement = custom.getSurfaceElement('dynamic');
				assert.notStrictEqual(surfaceElement, newSurfaceElement);
				assert.strictEqual('SPAN', newSurfaceElement.tagName);
				done();
			});
		});

		it('should automatically create attrs from render attrs of added surfaces', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.addSurfaces({
				header: {
					renderAttrs: ['headerContent', 'fontSize']
				}
			});
			assert.deepEqual({}, custom.getAttrConfig('headerContent'));
			assert.deepEqual({}, custom.getAttrConfig('fontSize'));
		});

		it('should automatically create attrs from render attrs from SURFACES static variable', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.SURFACES = {
				header: {
					renderAttrs: ['headerContent', 'fontSize']
				}
			};
			var custom = new CustomComponent({
				headerContent: 'My Header'
			});
			assert.deepEqual({}, custom.getAttrConfig('headerContent'));
			assert.strictEqual('My Header', custom.headerContent);
			assert.deepEqual({}, custom.getAttrConfig('fontSize'));
			assert.strictEqual(undefined, custom.fontSize);
		});

		it('should not override attr config when it already exists', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			var headerContentConfig = {
				value: 'My Header Content'
			};
			custom.addAttr('headerContent', headerContentConfig);
			custom.addSurfaces({
				header: {
					renderAttrs: ['headerContent', 'fontSize']
				}
			});
			assert.strictEqual(headerContentConfig, custom.getAttrConfig('headerContent'));
			assert.deepEqual({}, custom.getAttrConfig('fontSize'));
		});

		it('should render surface content when surface render attrs change', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-header') + comp.buildPlaceholder(comp.id + '-bottom');
				} else {
					switch (comp.getSurfaceId(surface)) {
						case 'header':
							return '<b style="font-size:' + comp.fontSize + ';">' + comp.headerContent + '</b>';
						case 'bottom':
							return '<span style="font-size:' + comp.fontSize + ';">' + comp.bottomContent + '</span>';
					}
				}
			});
			var custom = new CustomComponent();
			custom.addAttrs({
				headerContent: {
					value: 'header'
				},
				bottomContent: {
					value: 'bottom'
				},
				fontSize: {
					value: '10px'
				}
			});
			custom.addSurfaces({
				header: {
					renderAttrs: ['headerContent', 'fontSize']
				},
				bottom: {
					renderAttrs: ['bottomContent', 'fontSize']
				}
			});
			custom.render();

			custom.headerContent = 'modified1';
			// Asserts that surfaces will only re-paint on nextTick
			assert.strictEqual('header', custom.getSurfaceElement('header').querySelector('b').innerHTML);
			assert.strictEqual('10px', custom.getSurfaceElement('bottom').querySelector('span').style.fontSize);

			async.nextTick(function() {
				assert.strictEqual('modified1', custom.getSurfaceElement('header').querySelector('b').innerHTML);
				assert.strictEqual('10px', custom.getSurfaceElement('bottom').querySelector('span').style.fontSize);

				custom.fontSize = '20px';
				// Asserts that surfaces will only re-paint on nextTick
				assert.strictEqual('modified1', custom.getSurfaceElement('header').querySelector('b').innerHTML);
				assert.strictEqual('10px', custom.getSurfaceElement('bottom').querySelector('span').style.fontSize);

				async.nextTick(function() {
					assert.strictEqual('20px', custom.getSurfaceElement('header').querySelector('b').style.fontSize);
					assert.strictEqual('20px', custom.getSurfaceElement('bottom').querySelector('span').style.fontSize);

					// Asserts that it will not repaint if component is not in document
					custom.inDocument = false;
					custom.fontSize = '10px';
					async.nextTick(function() {
						assert.strictEqual('20px', custom.getSurfaceElement('header').querySelector('b').style.fontSize);
						assert.strictEqual('20px', custom.getSurfaceElement('bottom').querySelector('span').style.fontSize);
						done();
					});
				});
			});
		});

		it('should repaint surface when render attrs that were added later change', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					comp.buildPlaceholder(comp.id + '-foo');
				} else {
					return comp.foo;
				}
			});

			var custom = new CustomComponent();
			custom.addSurface('foo');
			custom.render();

			custom.addSurface('foo', {
				renderAttrs: ['foo']
			});
			custom.foo = 'foo';
			custom.once('attrsChanged', function() {
				assert.strictEqual('foo', custom.getSurfaceElement('foo').textContent);
				done();
			});
		});

		it('should not repaint surface when its render attrs change but content stays the same', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-oddsOrEven');
				} else {
					return comp.number % 2 === 0 ? 'Even' : 'Odds';
				}
			});
			var custom = new CustomComponent();
			custom.addAttrs({
				number: {
					value: 2
				}
			});
			custom.addSurfaces({
				oddsOrEven: {
					renderAttrs: ['number']
				}
			});
			custom.render();

			var initialContent = custom.getSurfaceElement('oddsOrEven').childNodes[0];
			custom.number = 4;
			custom.once('attrsChanged', function() {
				assert.strictEqual(initialContent, custom.getSurfaceElement('oddsOrEven').childNodes[0]);
				done();
			});
		});

		it('should not render surface content when surface render attrs change but event is prevented', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-header');
				} else {
					return '<b style="font-size:' + comp.fontSize + ';">' + comp.headerContent + '</b>';
				}
			});
			var custom = new CustomComponent();
			custom.addAttrs({
				headerContent: {
					value: 'header'
				},
				fontSize: {
					value: '10px'
				}
			});
			custom.addSurfaces({
				header: {
					renderAttrs: ['headerContent', 'fontSize']
				}
			});
			custom.render();

			var listener = sinon.spy(function(data, event) {
				event.preventDefault();
			});
			custom.once('renderSurface', listener);

			custom.headerContent = 'modified';
			custom.fontSize = '20px';
			async.nextTick(function() {
				assert.strictEqual('header', custom.getSurfaceElement('header').textContent);
				assert.strictEqual(1, listener.callCount);
				assert.strictEqual('header', listener.args[0][0].surfaceId);
				assert.deepEqual(['headerContent', 'fontSize'], listener.args[0][0].renderAttrs);
				done();
			});
		});

		it('should rerender surface even when content doesn\'t change if its cache was cleared', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-foo', {
						renderAttrs: ['foo']
					});
				} else {
					return 'Same Content';
				}
			});
			var custom = new CustomComponent().render();

			custom.clearSurfaceCache('foo');
			var surfaceContent = custom.getSurfaceElement('foo').childNodes[0];
			custom.foo = 1;
			custom.once('attrsChanged', function() {
				assert.notStrictEqual(surfaceContent, custom.getSurfaceElement('foo').childNodes[0]);
				done();
			});
		});

		it('should not rerender surface even when content changes if surface is static', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-foo', {
						renderAttrs: ['foo'],
						static: true
					});
				} else {
					return comp.foo;
				}
			});
			var custom = new CustomComponent({
				foo: 'foo'
			}).render();

			var surfaceContent = custom.getSurfaceElement('foo').childNodes[0];
			assert.strictEqual('foo', surfaceContent.textContent);

			custom.foo = 'bar';
			custom.once('attrsChanged', function() {
				assert.strictEqual(surfaceContent, custom.getSurfaceElement('foo').childNodes[0]);
				done();
			});
		});

		it('should not throw error if attrs, that are not render attrs of a surface, change', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-main', {
						renderAttrs: ['content']
					});
				}
			});
			CustomComponent.ATTRS = {
				other: {
					value: 'foo'
				}
			};

			var custom = new CustomComponent().render();
			custom.other = 'bar'; // This attr is not a render attr of any surface
			custom.content = 'bar'; // This attr is a render attr of the "main" surface
			custom.once('attrsChanged', function() {
				// Attributes should have been updated without any errors.
				assert.strictEqual('bar', custom.other);
				assert.strictEqual('bar', custom.content);
				done();
			});
		});

		it('should rerender element content when its render attrs change', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					comp.addSurface(comp.id, {
						renderAttrs: ['foo']
					});
					return '<div>' + comp.foo + '</div>';
				}
			});
			var custom = new CustomComponent({
				foo: 'foo'
			}).render();

			assert.strictEqual('foo', custom.element.textContent);
			custom.foo = 'bar';
			async.nextTick(function() {
				assert.strictEqual('bar', custom.element.textContent);
				done();
			});
		});

		it('should not rerender surface twice if both it and its parent change with render attrs', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-foo', {
						renderAttrs: ['foo']
					});
				} else {
					switch (comp.getSurfaceId(surface)) {
						case 'foo':
							var config = {
								renderAttrs: ['foo']
							};
							return comp.foo + comp.buildPlaceholder(comp.id + '-nestedFoo', config);
						case 'nestedFoo':
							return comp.foo;
					}
				}
			});

			var custom = new CustomComponent({
				element: document.createElement('div')
			}).render();

			var renderer = custom.getRenderer();
			renderer.getSurfaceContent.restore();
			sinon.spy(renderer, 'getSurfaceContent');

			custom.foo = 'bar';
			custom.once('attrsChanged', function() {
				assert.strictEqual(2, renderer.getSurfaceContent.callCount);
				assert.strictEqual(custom.id + '-foo', renderer.getSurfaceContent.args[0][0].surfaceElementId);
				assert.strictEqual(custom.id + '-nestedFoo', renderer.getSurfaceContent.args[1][0].surfaceElementId);
				done();
			});
		});

		it('should have information about child and parent surfaces on surface object', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-foo');
				} else {
					switch (comp.getSurfaceId(surface)) {
						case 'foo':
							return comp.buildPlaceholder(comp.id + '-nestedFoo');
						case 'nestedFoo':
							return 'Nested';
					}
				}
			});

			var custom = new CustomComponent().render();
			assert.deepEqual([custom.id + '-nestedFoo'], custom.getSurface('foo').children);
			assert.strictEqual(custom.id, custom.getSurface('foo').parent);
			assert.deepEqual([], custom.getSurface('nestedFoo').children);
			assert.strictEqual(custom.id + '-foo', custom.getSurface('nestedFoo').parent);
		});

		it('should return component instance from surface methods', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();

			assert.strictEqual(custom, custom.addSurface('header'));
			assert.strictEqual(custom, custom.addSurfaces({}));
			assert.strictEqual(custom, custom.removeSurface('header'));
		});

		it('should automatically remove unused surfaces after repaint', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					comp.addSurface(comp.id, {
						renderAttrs: ['count']
					});
					var content = '';
					for (var i = 0; i < comp.count; i++) {
						content += comp.buildPlaceholder(comp.id + '-surface' + i);
					}
					return content;
				}
			});

			var custom = new CustomComponent({
				count: 4
			}).render();
			assert.ok(custom.getSurface('surface0'));
			assert.ok(custom.getSurface('surface1'));
			assert.ok(custom.getSurface('surface2'));
			assert.ok(custom.getSurface('surface3'));

			custom.count = 2;
			custom.once('attrsChanged', function() {
				done();
				assert.ok(custom.getSurface('surface0'));
				assert.ok(custom.getSurface('surface1'));
				assert.ok(!custom.getSurface('surface2'));
				assert.ok(!custom.getSurface('surface3'));
			});
		});
	});

	describe('Surface Placeholders', function() {
		it('should replace surface placeholders with their real content', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return 'My surface: ' + comp.buildPlaceholder(comp.id + '-foo');
				} else {
					return 'foo';
				}
			});

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			var expected = 'My surface: <div id="custom-foo">foo</div>';
			assert.strictEqual(expected, custom.element.innerHTML);
			assert.strictEqual(custom.getSurfaceElement('foo'), custom.element.childNodes[1]);
		});
	});

	describe('Nested Surfaces', function() {
		it('should replace nested surface placeholders with their real content', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-header');
				} else {
					switch (comp.getSurfaceId(surface)) {
						case 'header':
							return comp.buildPlaceholder(comp.id + '-item1') + comp.buildPlaceholder(comp.id + '-item2');
						case 'item1':
							return 'Item 1' + comp.buildPlaceholder(comp.id + '-item1-name');
						case 'item1-name':
							return 'Item 1 Name';
						case 'item2':
							return 'Item 2';
					}
				}
			});

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			var listElement = custom.getSurfaceElement('header');
			var item1Element = custom.getSurfaceElement('item1');
			assert.strictEqual(2, listElement.childNodes.length);
			assert.strictEqual(item1Element, listElement.childNodes[0]);
			assert.strictEqual(2, item1Element.childNodes.length);
			assert.strictEqual('Item 1', item1Element.childNodes[0].textContent);
			assert.strictEqual(custom.getSurfaceElement('item1-name'), item1Element.childNodes[1]);
			assert.strictEqual(custom.getSurfaceElement('item2'), listElement.childNodes[1]);
		});

		it('should update nested and parent surfaces when their contents change', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-header', {
						renderAttrs: ['foo']
					});
				} else {
					switch (comp.getSurfaceId(surface)) {
						case 'header':
							return '<div class="headerInner">' + comp.foo + comp.buildPlaceholder(comp.id + '-bar') + '</div>';
						case 'bar':
							return '<div class="barInner">' + comp.foo + comp.buildPlaceholder(comp.id + '-foo') + '</div>';
						case 'foo':
							return '<div class="fooInner">' + comp.foo + '</div>';
					}
				}
			});

			var custom = new CustomComponent({
				foo: 'foo',
				id: 'custom'
			}).render();
			var headerInnerElement = custom.element.querySelector('.headerInner');
			var barInnerElement = custom.element.querySelector('.barInner');
			var fooInnerElement = custom.element.querySelector('.fooInner');

			custom.foo = 'bar';
			custom.on('attrsChanged', function() {
				assert.notStrictEqual(headerInnerElement, custom.element.querySelector('.headerInner'));
				assert.notStrictEqual(barInnerElement, custom.element.querySelector('.barInner'));
				assert.notStrictEqual(fooInnerElement, custom.element.querySelector('.fooInner'));
				assert.strictEqual('bar', custom.getSurfaceElement('foo').textContent);
				done();
			});
		});

		it('should not repaint nested surface when its render attrs change but content stays the same', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-header', {
						renderAttrs: ['foo']
					});
				} else {
					switch (comp.getSurfaceId(surface)) {
						case 'header':
							return comp.buildPlaceholder(comp.id + '-title', {}) + comp.buildPlaceholder(comp.id + '-subtitle', {});
						case 'title':
							return comp.foo.title;
						case 'subtitle':
							return comp.foo.subtitle;
					}
				}
			});
			var custom = new CustomComponent({
				foo: {
					subtitle: 'My Subtitle',
					title: 'My Title'
				}
			}).render();

			var initialHeaderContent = custom.getSurfaceElement('header').childNodes[0];
			var initialTitleContent = custom.getSurfaceElement('title').childNodes[0];
			var initialSubtitleContent = custom.getSurfaceElement('subtitle').childNodes[0];

			custom.foo = {
				subtitle: 'My Subtitle',
				title: 'New Title'
			};
			custom.once('attrsChanged', function() {
				assert.strictEqual(initialHeaderContent, custom.getSurfaceElement('header').childNodes[0]);
				assert.notStrictEqual(initialTitleContent, custom.getSurfaceElement('title').childNodes[0]);
				assert.strictEqual(initialSubtitleContent, custom.getSurfaceElement('subtitle').childNodes[0]);
				done();
			});
		});

		it('should only update nested surface when only its contents change', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-header', {
						renderAttrs: ['foo']
					});
				} else {
					switch (comp.getSurfaceId(surface)) {
						case 'header':
							return '<div class="headerInner">' + comp.buildPlaceholder(comp.id + '-bar') + '</div>';
						case 'bar':
							return '<div class="barInner">' + comp.buildPlaceholder(comp.id + '-foo') + '</div>';
						case 'foo':
							return '<div class="fooInner">' + comp.foo + '</div>';
					}
				}
			});

			var custom = new CustomComponent({
				foo: 'foo',
				id: 'custom'
			}).render();
			var headerInnerElement = custom.element.querySelector('.headerInner');
			var barInnerElement = custom.element.querySelector('.barInner');
			var fooInnerElement = custom.element.querySelector('.fooInner');

			custom.foo = 'bar';
			custom.on('attrsChanged', function() {
				assert.strictEqual(headerInnerElement, custom.element.querySelector('.headerInner'));
				assert.strictEqual(barInnerElement, custom.element.querySelector('.barInner'));
				assert.notStrictEqual(fooInnerElement, custom.element.querySelector('.fooInner'));
				assert.strictEqual('bar', custom.getSurfaceElement('foo').textContent);
				done();
			});
		});

		it('should return whole content HTML when "getElementExtendedContent" is called', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-header');
				} else {
					return 'Header';
				}
			});
			var custom = new CustomComponent({
				id: 'custom'
			}).render();

			assert.strictEqual(
				'<div id="custom-header">Header</div>',
				custom.getElementExtendedContent()
			);
		});

		it('should not throw error if "getElementContent" doesn\'t return string when "getElementExtendedContent" is called', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent({
				id: 'custom'
			}).render();

			assert.strictEqual('', custom.getElementExtendedContent());
		});

		describe('Generated Ids', function() {
			beforeEach(function() {
				this.CustomComponent = createCustomComponentClass(function(surface, comp) {
					if (surface.surfaceElementId === comp.id) {
						return comp.buildPlaceholder();
					} else {
						switch (comp.getSurfaceId(surface)) {
							case 's1':
								var content = '<div class="s1Inner">';
								for (var i = 0; i < comp.count; i++) {
									content += comp.buildPlaceholder();
								}
								return content + '</div>';
							default:
								return '<div class="nestedInner">Generated ' + comp.foo + '</div>';
						}
					}
				});
				this.CustomComponent.ATTRS = {
					count: {},
					foo: {}
				};
				this.CustomComponent.SURFACES = {
					s1: {
						renderAttrs: ['count', 'foo']
					}
				};
			});

			it('should render nested surfaces with generated ids', function() {
				var custom = new this.CustomComponent({
					count: 2,
					id: 'custom'
				}).render();
				assert.strictEqual(1, custom.element.childNodes.length);

				var s1Element = custom.getSurfaceElement('s1');
				assert.strictEqual(custom.element.childNodes[0], s1Element);
				var s1InnerElement = s1Element.querySelector('.s1Inner');
				assert.strictEqual(2, s1InnerElement.childNodes.length);

				var s1S1Element = custom.getSurfaceElement('s1-s1');
				var s1S2Element = custom.getSurfaceElement('s1-s2');
				assert.strictEqual(s1InnerElement.childNodes[0], s1S1Element);
				assert.strictEqual(s1InnerElement.childNodes[1], s1S2Element);
			});

			it('should only update nested surface when only its contents change', function(done) {
				var custom = new this.CustomComponent({
					count: 1,
					foo: 'foo',
					id: 'custom'
				}).render();
				var s1InnerElement = custom.element.querySelector('.s1Inner');
				var nestedInnerElement = custom.element.querySelector('.nestedInner');

				custom.foo = 'bar';
				custom.on('attrsChanged', function() {
					assert.strictEqual(s1InnerElement, custom.element.querySelector('.s1Inner'));
					assert.notStrictEqual(nestedInnerElement, custom.element.querySelector('.nestedInner'));
					assert.strictEqual('Generated bar', custom.getSurfaceElement('s1-s1').textContent);
					done();
				});
			});
		});
	});

	describe('Sub Components', function() {
		beforeEach(function() {
			document.body.innerHTML = '';
			ComponentCollector.components = {};
			Component.componentsCollector.nextComponentData_ = {};

			this.ChildComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return '<div id="' + comp.id + '">Child-' + comp.buildPlaceholder(comp.id + '-foo') + '</div>';
				} else {
					return '<span>' + comp.foo + '</span>';
				}
			});
			this.ChildComponent.ATTRS = {
				foo: {
					value: 'default'
				}
			};
			this.ChildComponent.SURFACES = {
				foo: {
					renderAttrs: ['foo']
				}
			};
			ComponentRegistry.register(this.ChildComponent, 'ChildComponent');
		});

		it('should instantiate sub component from placeholder', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder('child', {
						componentName: 'ChildComponent'
					});
				}
			});

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			assert.ok(custom.components.child);

			var child = custom.components.child;
			assert.strictEqual(child.element, custom.element.querySelector('#child'));
			assert.strictEqual(child.element, custom.getSurfaceElement('child'));
			assert.strictEqual('Child-default', child.element.textContent);
		});

		it('should render sub component\'s element according to its getElementContent method', function() {
			this.ChildComponent.RENDERER.getSurfaceContent = function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					var placeholder = comp.buildPlaceholder(comp.id + '-foo');
					return '<span id="' + comp.id + '" data-foo="foo">Child-' + placeholder + '</span>';
				} else {
					return '<span>' + comp.foo + '</span>';
				}
			};

			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder('child', {
						componentName: 'ChildComponent'
					});
				}
			});

			var custom = new CustomComponent({
				id: 'custom'
			}).render();

			var child = custom.components.child;
			assert.strictEqual('SPAN', child.element.tagName);
			assert.strictEqual('foo', child.element.getAttribute('data-foo'));
			assert.strictEqual('Child-default', child.element.textContent);
		});

		it('should instantiate sub component that has hifen on id from placeholder', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder('my-child', {
						componentName: 'ChildComponent'
					});
				}
			});

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			assert.ok(custom.components['my-child']);

			var child = custom.components['my-child'];
			assert.strictEqual(child.element, custom.element.querySelector('#my-child'));
			assert.strictEqual(child.element, custom.getSurfaceElement('my-child'));
			assert.strictEqual('Child-default', child.element.textContent);
		});

		it('should instantiate sub component from placeholder passing defined config data', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder('child', {
						componentData: {
							foo: comp.foo
						},
						componentName: 'ChildComponent'
					});
				}
			});
			CustomComponent.ATTRS = {
				foo: {}
			};

			var custom = new CustomComponent({
				foo: 'foo',
				id: 'custom'
			}).render();
			assert.ok(custom.components.child);

			var child = custom.components.child;
			assert.strictEqual(child.element, custom.element.querySelector('#child'));
			assert.strictEqual(child.element, custom.getSurfaceElement('child'));
			assert.strictEqual('foo', child.foo);
			assert.strictEqual('Child-foo', child.element.textContent);
		});

		it('should instantiate sub components when parent is decorated', function() {
			var element = document.createElement('div');
			element.id = 'custom';
			dom.append(element, '<div id="child">Child-<div id="child-foo"><span>default</span></div></div>');
			dom.append(document.body, element);

			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder('child', {
						componentName: 'ChildComponent'
					});
				}
			});

			var custom = new CustomComponent({
				element: '#custom'
			}).decorate();
			assert.ok(custom.components.child);

			var child = custom.components.child;
			assert.strictEqual(child.element, custom.element.querySelector('#child'));
			assert.strictEqual(child.element, custom.getSurfaceElement('child'));
			assert.strictEqual('Child-default', child.element.textContent);
		});

		it('should update sub components when parent is decorated and html is not correct', function() {
			var element = document.createElement('div');
			element.id = 'custom';
			dom.append(element, '<div id="child">Child <div id="child-foo"><span>default</span></div></div>');
			dom.append(document.body, element);
			var fooElement = document.body.querySelector('span');

			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder('child', {
						componentData: {
							foo: comp.foo
						},
						componentName: 'ChildComponent'
					});
				}
			});
			CustomComponent.ATTRS = {
				foo: {}
			};

			var custom = new CustomComponent({
				element: '#custom',
				foo: 'foo'
			}).decorate();

			var child = custom.components.child;
			assert.notStrictEqual(fooElement, child.element.querySelector('span'));
		});

		it('should not update sub components when parent is decorated and html is correct', function() {
			var element = document.createElement('div');
			element.id = 'custom';
			dom.append(element, '<div id="child">Child-<div id="child-foo"><span>foo</span></div></div>');
			dom.append(document.body, element);
			var fooElement = document.body.querySelector('span');

			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					var placeholder = comp.buildPlaceholder('child', {
						componentData: {
							foo: comp.foo
						},
						componentName: 'ChildComponent'
					});
					return '<div id="' + comp.id + '">' + placeholder + '</div>';
				}
			});
			CustomComponent.ATTRS = {
				foo: {}
			};

			var custom = new CustomComponent({
				element: '#custom',
				foo: 'foo'
			}).decorate();

			var child = custom.components.child;
			assert.strictEqual(fooElement, child.element.querySelector('span'));
		});

		it('should update existing component from placeholder', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-foo', {
						renderAttrs: ['foo']
					});
				} else {
					var placeholder = comp.buildPlaceholder('child', {
						componentData: {
							foo: comp.foo
						},
						componentName: 'ChildComponent'
					});
					return comp.getSurfaceId(surface) === 'foo' ? 'Surface ' + comp.foo + ': ' + placeholder : '';
				}
			});

			var custom = new CustomComponent({
				foo: 'foo',
				id: 'custom'
			}).render();
			var child = custom.components.child;
			assert.strictEqual('Child-foo', child.element.textContent);
			assert.strictEqual('Surface foo: Child-foo', custom.element.textContent);

			custom.foo = 'bar';
			custom.once('attrsChanged', function() {
				assert.strictEqual(child.element, custom.element.querySelector('#child'));
				assert.strictEqual(child.element, custom.getSurfaceElement('child'));
				assert.strictEqual('bar', child.foo);

				child.once('attrsChanged', function() {
					assert.strictEqual('Child-bar', child.element.textContent);
					assert.strictEqual('Surface bar: Child-bar', custom.element.textContent);
					done();
				});
			});
		});

		it('should not rerender sub component after update if its contents haven\'t changed', function(done) {
			var OddsOrEvenComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					comp.addSurface(comp.id, {
						renderAttrs: ['count']
					});
					return comp.count % 2 === 0 ? 'Even' : 'Odds';
				}
			});
			ComponentRegistry.register(OddsOrEvenComponent, 'OddsOrEvenComponent');

			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-child', {
						renderAttrs: ['count']
					});
				} else {
					return comp.buildPlaceholder('child', {
						componentData: {
							count: comp.count
						},
						componentName: 'OddsOrEvenComponent',
						renderAttrs: ['count']
					});
				}
			});

			var custom = new CustomComponent({
				count: 1
			}).render();
			var child = custom.components.child;
			var chidlContentNode = child.element.childNodes[0];
			assert.strictEqual('Odds', child.element.textContent);

			custom.count = 3;
			child.once('attrsChanged', function() {
				assert.strictEqual('Odds', child.element.textContent);
				assert.strictEqual(chidlContentNode, child.element.childNodes[0]);
				done();
			});
		});

		it('should instantiate sub component from surface definition', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder('child');
				}
			});
			CustomComponent.SURFACES = {
				child: {
					componentName: 'ChildComponent'
				}
			};

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			assert.ok(custom.components.child);

			var child = custom.components.child;
			assert.strictEqual(child.element, custom.element.querySelector('#child'));
			assert.strictEqual(child.element, custom.getSurfaceElement('child'));
			assert.strictEqual('Child-default', child.element.textContent);
		});

		it('should reposition previously rendered component instances', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-foo', {
						renderAttrs: ['invert']
					});
				} else {
					var placeholder1 = comp.buildPlaceholder('child1', {
						componentName: 'ChildComponent'
					});
					var placeholder2 = comp.buildPlaceholder('child2', {
						componentName: 'ChildComponent'
					});
					if (comp.invert) {
						return placeholder2 + placeholder1;
					} else {
						return placeholder1 + placeholder2;
					}
				}
			});

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			var child1 = custom.components.child1;
			var child2 = custom.components.child2;
			var childElements = custom.getSurfaceElement('foo').querySelectorAll('.component');
			assert.strictEqual(childElements[0], child1.element);
			assert.strictEqual(childElements[1], child2.element);

			custom.invert = true;
			custom.on('attrsChanged', function() {
				assert.strictEqual(child1, custom.components.child1);
				assert.strictEqual(child2, custom.components.child2);

				childElements = custom.getSurfaceElement('foo').querySelectorAll('.component');
				assert.strictEqual(childElements[0], child2.element);
				assert.strictEqual(childElements[1], child1.element);
				done();
			});
		});

		it('should correctly position nested component even if its element had already been set', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder('child', {
						componentName: 'ChildComponent'
					});
				}
			});

			var childElement;
			this.ChildComponent.prototype.created = function() {
				childElement = this.element;
			};
			sinon.spy(this.ChildComponent.prototype, 'renderAsSubComponent');

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			assert.ok(custom.components.child);

			var child = custom.components.child;
			assert.strictEqual(child.element, childElement);
			assert.strictEqual(child.element, custom.element.querySelector('#child'));
			assert.strictEqual(child.element, custom.getSurfaceElement('child'));
			assert.strictEqual('Child-default', child.element.textContent);
			assert.strictEqual(1, child.renderAsSubComponent.callCount);
			assert.ok(!child.element.querySelector('#child'));
		});

		it('should render nested component correctly when element is not on document', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder('child', {
						componentName: 'ChildComponent'
					});
				}
			});

			var element = document.createElement('div');
			var custom = new CustomComponent({
				id: 'custom'
			}).render(element);

			var child = custom.components.child;
			assert.ok(child);
			assert.strictEqual(this.ChildComponent, child.constructor);
			assert.strictEqual(custom.element.querySelector('#child'), child.element);
		});

		it('should get all sub components with ids matching a given prefix', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				var child1 = comp.buildPlaceholder('child-with-prefix1', {
					componentName: 'ChildComponent'
				});
				var child2 = comp.buildPlaceholder('child-without-prefix1', {
					componentName: 'ChildComponent'
				});
				var child3 = comp.buildPlaceholder('child-with-prefix2', {
					componentName: 'ChildComponent'
				});
				var child4 = comp.buildPlaceholder('child-without-prefix2', {
					componentName: 'ChildComponent'
				});
				return child1 + child2 + child3 + child4;
			});

			var custom = new CustomComponent({
				id: 'custom'
			}).render();

			var childrenWithPrefix = custom.getComponentsWithPrefix('child-with-prefix');
			assert.strictEqual(2, Object.keys(childrenWithPrefix).length);
			assert.ok(childrenWithPrefix['child-with-prefix1']);
			assert.ok(childrenWithPrefix['child-with-prefix2']);
		});

		it('should dispose sub components when parent component is disposed', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder('child', {
						componentName: 'ChildComponent'
					});
				}
			});

			var custom = new CustomComponent({
				id: 'custom'
			}).render();

			var child = custom.components.child;
			custom.dispose();
			assert.ok(child.isDisposed());
		});

		it('should not throw error when disposing a component with shared sub components', function() {
			var AnotherComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder('child', {
						componentName: 'ChildComponent'
					});
				}
			});
			ComponentRegistry.register(AnotherComponent, 'AnotherComponent');

			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					var placeholder1 = comp.buildPlaceholder('child', {
						componentName: 'ChildComponent'
					});
					var placeholder2 = comp.buildPlaceholder('another', {
						componentName: 'AnotherComponent'
					});
					return placeholder1 + placeholder2;
				}
			});

			var custom = new CustomComponent({
				id: 'custom'
			}).render();

			var child = custom.components.child;
			var another = custom.components.another;
			custom.dispose();
			assert.ok(child.isDisposed());
			assert.ok(another.isDisposed());
		});

		it('should automatically dispose unused sub components after repaint', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					comp.addSurface(comp.id, {
						renderAttrs: ['count']
					});
					var content = '';
					for (var i = 0; i < comp.count; i++) {
						content += comp.buildPlaceholder('comp' + i, {
							componentName: 'ChildComponent'
						});
					}
					return content;
				}
			});

			var custom = new CustomComponent({
				count: 4
			}).render();
			var comps = object.mixin({}, custom.components);
			assert.strictEqual(4, Object.keys(comps).length);

			custom.count = 2;
			custom.once('attrsChanged', function() {
				assert.ok(custom.components.comp0);
				assert.ok(custom.components.comp1);
				assert.ok(!custom.components.comp2);
				assert.ok(!custom.components.comp3);
				assert.ok(!comps.comp0.isDisposed());
				assert.ok(!comps.comp1.isDisposed());
				assert.ok(comps.comp2.isDisposed());
				assert.ok(comps.comp3.isDisposed());
				done();
			});
		});

		it('should automatically dispose unused sub components of sub components after repaint', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					comp.addSurface(comp.id, {
						renderAttrs: ['count']
					});
					var content = '';
					for (var i = 0; i < comp.count; i++) {
						content += comp.buildPlaceholder(comp.id + '-comp' + i, {
							componentName: 'ChildComponent'
						});
					}
					return content;
				}
			});
			ComponentRegistry.register(CustomComponent);

			var NestedComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					comp.addSurface(comp.id, {
						renderAttrs: ['count']
					});
					var content = '';
					for (var i = 0; i < comp.count; i++) {
						content += comp.buildPlaceholder('custom' + i, {
							componentData: {
								count: comp.count
							},
							componentName: 'CustomComponent'
						});
					}
					return content;
				}
			});

			var custom = new NestedComponent({
				count: 2
			}).render();
			var comps = object.mixin({}, custom.components);
			var nestedComps = object.mixin({}, comps.custom0.components);
			assert.strictEqual(2, Object.keys(comps).length);

			custom.count = 1;
			custom.once('attrsChanged', function() {
				assert.ok(custom.components.custom0);
				assert.ok(!custom.components.custom1);
				assert.ok(!comps.custom0.isDisposed());
				assert.ok(comps.custom1.isDisposed());

				comps.custom0.once('attrsChanged', function() {
					assert.ok(comps.custom0.components['custom0-comp0']);
					assert.ok(!comps.custom0.components['custom0-comp1']);
					assert.ok(!nestedComps['custom0-comp0'].isDisposed());
					assert.ok(nestedComps['custom0-comp1'].isDisposed());
					done();
				});
			});
		});

		it('should not throw error when disposing after subcomponents have already been disposed', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					comp.addSurface(comp.id, {
						renderAttrs: ['count']
					});
					var content = '';
					for (var i = 0; i < comp.count; i++) {
						content += comp.buildPlaceholder('comp' + i, {
							componentName: 'ChildComponent'
						});
					}
					return content;
				}
			});

			var custom = new CustomComponent({
				count: 4
			}).render();

			custom.count = 2;
			custom.once('attrsChanged', function() {
				assert.doesNotThrow(() => custom.dispose());
				done();
			});
		});
	});

	describe('Inline Events', function() {
		beforeEach(function() {
			ComponentCollector.components = {};

			var EventsTestComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return '<div id="' + comp.id + '" data-onclick="handleElementClicked">' +
						'<button class="elementButton" data-onclick="handleClick"></button>' +
						comp.buildPlaceholder(comp.id + '-foo') + '</div>';
				} else {
					var content = '<div id="' + surface.surfaceElementId + '" data-onclick="handleSurfaceClicked">';
					for (var i = 0; i < comp.count; i++) {
						content += '<button class="fooButton" data-onmouseover="handleMouseOver"></button>';
					}
					return content + '</div>';
				}
			});
			EventsTestComponent.ATTRS = {
				count: {
					value: 1
				}
			};
			EventsTestComponent.SURFACES = {
				foo: {
					renderAttrs: ['count']
				}
			};
			EventsTestComponent.prototype.handleClick = sinon.stub();
			EventsTestComponent.prototype.handleElementClicked = sinon.stub();
			EventsTestComponent.prototype.handleMouseOver = sinon.stub();
			EventsTestComponent.prototype.handleSurfaceClicked = sinon.stub();
			ComponentRegistry.register(EventsTestComponent, 'EventsTestComponent');
			this.EventsTestComponent = EventsTestComponent;
		});

		it('should attach listeners from element content', function() {
			var custom = new this.EventsTestComponent().render();
			var button = custom.element.querySelector('.elementButton');
			dom.triggerEvent(button, 'click');
			assert.strictEqual(1, custom.handleClick.callCount);
		});

		it('should attach listeners from element tag', function() {
			var custom = new this.EventsTestComponent().render();
			dom.triggerEvent(custom.element, 'click');
			assert.strictEqual(1, custom.handleElementClicked.callCount);
		});

		it('should attach listeners from surface content', function() {
			var custom = new this.EventsTestComponent().render();
			var button = custom.element.querySelector('.fooButton');
			dom.triggerEvent(button, 'mouseover');
			assert.strictEqual(1, custom.handleMouseOver.callCount);
		});

		it('should attach listeners from surface element tag', function() {
			var custom = new this.EventsTestComponent().render();
			dom.triggerEvent(custom.getSurfaceElement('foo'), 'click');
			assert.strictEqual(1, custom.handleSurfaceClicked.callCount);
		});

		it('should attach listeners from element content after decorating', function() {
			var content = '<button class="elementButton" data-onclick="handleClick"></button>' +
				'<div id="events-foo"><button class="fooButton" data-onmouseover="handleMouseOver"></button></div>';
			var element = document.createElement('div');
			element.id = 'events';
			dom.append(element, content);
			dom.append(document.body, element);

			var custom = new this.EventsTestComponent({
				element: '#events'
			}).decorate();
			var button = custom.element.querySelector('.elementButton');
			dom.triggerEvent(button, 'click');
			assert.strictEqual(1, custom.handleClick.callCount);
		});

		it('should attach listeners from surface content after decorating', function() {
			var content = '<button class="elementButton" data-onclick="handleClick"></button>' +
				'<div id="events-foo"><button class="fooButton" data-onmouseover="handleMouseOver"></button></div>';
			var element = document.createElement('div');
			element.id = 'events';
			dom.append(element, content);
			dom.append(document.body, element);

			var custom = new this.EventsTestComponent({
				element: '#events'
			}).decorate();
			var button = custom.element.querySelector('.fooButton');
			dom.triggerEvent(button, 'mouseover');
			assert.strictEqual(1, custom.handleMouseOver.callCount);
		});

		it('should attach listeners when component is rendered as sub component', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder('child', {
						componentName: 'EventsTestComponent'
					});
				}
			});

			var custom = new CustomComponent().render();
			var button = custom.element.querySelector('.elementButton');
			dom.triggerEvent(button, 'click');
			assert.strictEqual(1, custom.components.child.handleClick.callCount);

			button = custom.element.querySelector('.fooButton');
			dom.triggerEvent(button, 'mouseover');
			assert.strictEqual(1, custom.components.child.handleMouseOver.callCount);
		});

		it('should attach listeners when component is decorated as sub component', function() {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-foo');
				} else {
					return comp.buildPlaceholder('child', {
						componentName: 'EventsTestComponent'
					});
				}
			});

			var content = '<div id="events-foo"><div id="child"><button class="elementButton" data-onclick="handleClick"></button>' +
				'<div id="events-foo"><button class="fooButton" data-onmouseover="handleMouseOver"></button></div></div></div>';
			var element = document.createElement('div');
			element.id = 'events';
			dom.append(element, content);
			dom.append(document.body, element);

			var custom = new CustomComponent({
				element: '#events'
			}).decorate();
			var button = custom.element.querySelector('.elementButton');
			dom.triggerEvent(button, 'click');
			assert.strictEqual(1, custom.components.child.handleClick.callCount);

			button = custom.element.querySelector('.fooButton');
			dom.triggerEvent(button, 'mouseover');
			assert.strictEqual(1, custom.components.child.handleMouseOver.callCount);
		});

		it('should detach unused listeners after surface update', function(done) {
			var custom = new this.EventsTestComponent({
				count: 1
			}).render();
			sinon.spy(custom.element, 'removeEventListener');
			custom.count = 0;
			custom.on('attrsChanged', function() {
				assert.strictEqual(1, custom.element.removeEventListener.callCount);
				assert.strictEqual('mouseover', custom.element.removeEventListener.args[0][0]);
				done();
			});
		});

		it('should not detach listeners that are still useful after surface update', function(done) {
			var custom = new this.EventsTestComponent({
				count: 1
			}).render();
			sinon.spy(custom.element, 'removeEventListener');
			custom.count = 2;
			custom.on('attrsChanged', function() {
				assert.strictEqual(0, custom.element.removeEventListener.callCount);
				done();
			});
		});

		it('should detach all listeners when element is detached', function() {
			var custom = new this.EventsTestComponent({
				count: 1
			}).render();
			sinon.spy(custom.element, 'removeEventListener');
			custom.detach();

			assert.strictEqual(4, custom.element.removeEventListener.callCount);
			assert.strictEqual('click', custom.element.removeEventListener.args[0][0]);
			assert.strictEqual('click', custom.element.removeEventListener.args[1][0]);
			assert.strictEqual('click', custom.element.removeEventListener.args[2][0]);
			assert.strictEqual('mouseover', custom.element.removeEventListener.args[3][0]);
		});
	});

	describe('Script tags', function() {
		it('should evaluate script tags without src rendered by components', function(done) {
			var CustomComponent = createCustomComponentClass(function() {
				return '<script>window.testScriptEvaluated = true</script>';
			});
			new CustomComponent().render();

			async.nextTick(function() {
				assert.ok(window.testScriptEvaluated);
				window.testScriptEvaluated = null;
				done();
			});
		});

		it('should evaluate script tags with src', function(done) {
			var CustomComponent = createCustomComponentClass(function() {
				return '<script src="test/fixtures/script.js"></script>';
			});
			new CustomComponent().render();
			var script = document.head.querySelector('script');
			assert.ok(script);
			dom.on(script, 'load', function() {
				assert.ok(!document.head.querySelector('script'));
				done();
			});
		});

		it('should evaluate script tags with the js type', function(done) {
			var CustomComponent = createCustomComponentClass(function() {
				return '<script type="text/javascript">window.testScriptEvaluated = true</script>';
			});
			new CustomComponent().render();

			async.nextTick(function() {
				assert.ok(window.testScriptEvaluated);
				window.testScriptEvaluated = null;
				done();
			});
		});

		it('should not evaluate script tags with a non js type', function(done) {
			var CustomComponent = createCustomComponentClass(function() {
				return '<script type="text/html">My template</script>';
			});
			new CustomComponent().render();

			async.nextTick(function() {
				assert.ok(!window.testScriptEvaluated);
				done();
			});
		});

		it('should evaluate script tags on surfaces', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-foo');
				} else {
					return '<script>window.testScriptEvaluated = true</script>';
				}
			});
			new CustomComponent().render();

			async.nextTick(function() {
				assert.ok(window.testScriptEvaluated);
				window.testScriptEvaluated = null;
				done();
			});
		});

		it('should evaluate script tags on surfaces when they change', function(done) {
			var CustomComponent = createCustomComponentClass(function(surface, comp) {
				if (surface.surfaceElementId === comp.id) {
					return comp.buildPlaceholder(comp.id + '-foo', {
						renderAttrs: ['foo']
					});
				} else {
					return '<script>window.testScriptEvaluated = \'' + comp.foo + '\'</script>';
				}
			});
			var custom = new CustomComponent().render();

			custom.foo = 'foo';
			custom.once('attrsSynced', function() {
				async.nextTick(function() {
					assert.strictEqual('foo', window.testScriptEvaluated);
					window.testScriptEvaluated = null;
					done();
				});
			});
		});
	});

	function createCustomComponentClass(opt_rendererContentOrFn) {
		class CustomComponent extends Component {
			constructor(opt_config) {
				super(opt_config);
				if (this.created) {
					this.created();
				}
			}
		}
		CustomComponent.RENDERER = createCustomRenderer(opt_rendererContentOrFn);

		sinon.spy(CustomComponent.prototype, 'render');
		sinon.spy(CustomComponent.prototype, 'attached');
		sinon.spy(CustomComponent.prototype, 'detached');
		sinon.spy(CustomComponent.RENDERER, 'getSurfaceContent');

		return CustomComponent;
	}

	function createCustomRenderer(opt_rendererContentOrFn) {
		class CustomRenderer extends ComponentRenderer {
			static getSurfaceContent(surface, component) {
				if (core.isFunction(opt_rendererContentOrFn)) {
					return opt_rendererContentOrFn(surface, component);
				} else {
					return opt_rendererContentOrFn;
				}
			}
		}
		return CustomRenderer;
	}

	function getClassNames(element) {
		return element.className.trim().split(' ');
	}
});
