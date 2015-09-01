'use strict';

import async from '../../../src/async/async';
import dom from '../../../src/dom/dom';
import features from '../../../src/dom/features';
import Component from '../../../src/component/Component';
import ComponentCollector from '../../../src/component/ComponentCollector';
import ComponentRegistry from '../../../src/component/ComponentRegistry';

describe('Component', function() {
	afterEach(function() {
		document.body.innerHTML = '';
		Component.surfacesCollector.removeAllSurfaces();
	});

	describe('Lifecycle', function() {
		it('should test component render lifecycle', function() {
			var CustomComponent = createCustomComponentClass();

			CustomComponent.SURFACES = {
				header: {},
				bottom: {}
			};

			var custom = new CustomComponent();
			var renderListener = sinon.stub();
			custom.on('render', renderListener);
			custom.render();

			sinon.assert.callCount(renderListener, 1);

			sinon.assert.callOrder(
				CustomComponent.prototype.getSurfaceContent,
				CustomComponent.prototype.attached
			);

			sinon.assert.callCount(CustomComponent.prototype.attached, 1);

			sinon.assert.callCount(CustomComponent.prototype.getSurfaceContent, 2);
			assert.strictEqual('header', CustomComponent.prototype.getSurfaceContent.args[0][0]);
			assert.strictEqual('bottom', CustomComponent.prototype.getSurfaceContent.args[1][0]);

			sinon.assert.called(CustomComponent.prototype.getElementContent);

			sinon.assert.notCalled(CustomComponent.prototype.detached);
		});

		it('should test component decorate lifecycle', function() {
			var CustomComponent = createCustomComponentClass();

			CustomComponent.SURFACES = {
				header: {},
				bottom: {}
			};

			var custom = new CustomComponent();
			custom.decorate();

			sinon.assert.callCount(CustomComponent.prototype.render, 1);
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

		it('should render the content string returned by getElementContent', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return '<div>My content</div>';
			};
			var custom = new CustomComponent();
			custom.render();

			assert.strictEqual('<div>My content</div>', custom.element.innerHTML);
		});

		it('should build element from getElementContent if its string defines a wrapper with the component id', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return '<span id="' + this.id + '" data-foo="foo">My Content</span>';
			};
			CustomComponent.ELEMENT_TAG_NAME = 'span';

			var custom = new CustomComponent().render();
			assert.strictEqual('SPAN', custom.element.tagName);
			assert.strictEqual('foo', custom.element.getAttribute('data-foo'));
		});

		it('should not throw error if ELEMENT_TAG_NAME is different from element tag returned by getElementContent', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return '<span id="' + this.id + '" data-foo="foo">My Content</span>';
			};
			CustomComponent.NAME = 'CustomComponent';

			sinon.stub(console, 'error');
			var custom = new CustomComponent().render();
			assert.strictEqual('SPAN', custom.element.tagName);
			assert.strictEqual(0, console.error.callCount);
			console.error.restore();
		});

		it('should throw error if tag from given element is different from the one returned by getElementContent', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return '<span id="' + this.id + '" data-foo="foo">My Content</span>';
			};
			CustomComponent.NAME = 'CustomComponent';

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

		it('should render the content element returned by getElementContent', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				var element = document.createElement('div');
				element.innerHTML = 'My content';
				return element;
			};
			var custom = new CustomComponent();
			custom.render();

			assert.strictEqual('<div>My content</div>', custom.element.innerHTML);
		});

		it('should build element from getElementContent if its element defines a wrapper with the component id', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				var element = document.createElement('span');
				element.id = this.id;
				element.setAttribute('data-foo', 'foo');
				dom.append(element, '<div>My content</div>');
				return element;
			};
			CustomComponent.ELEMENT_TAG_NAME = 'span';
			var custom = new CustomComponent();
			custom.render();

			assert.strictEqual('SPAN', custom.element.tagName);
			assert.strictEqual('foo', custom.element.getAttribute('data-foo'));
			assert.strictEqual('<div>My content</div>', custom.element.innerHTML);
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

		it('should not throw error if component doesn\'t implement lifecycle methods', function() {
			class CustomComponent extends Component {
				constructor(opt_config) {
					super(opt_config);
				}
			}
			CustomComponent.SURFACES = {
				body: {}
			};

			assert.doesNotThrow(function() {
				var custom = new CustomComponent();
				custom.render();
				custom.detach();

				custom = new CustomComponent();
				custom.decorate();
			});
		});

		it('should use div as the default tagName for the component element', function() {
			var CustomComponent = createCustomComponentClass();

			var custom = new CustomComponent();
			custom.render();
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
				constructor(opt_config) {
					super(opt_config);
				}
			}

			var custom = new ChildComponent().render();
			assert.strictEqual('span', custom.element.tagName.toLowerCase());
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
				var CustomComponent = createCustomComponentClass();
				CustomComponent.prototype.getElementContent = function() {
					return '<button class="testButton"></button>';
				};
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
				constructor(opt_config) {
					super(opt_config);
				}
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
			var CustomComponent = createCustomComponentClass();
			CustomComponent.SURFACES = {
				footer: {
					renderAttrs: ['footerContent']
				}
			};
			CustomComponent.prototype.getElementContent = function() {
				return '<custom id="' + this.id + '">' + this.buildPlaceholder(this.id + '-footer') + '</custom>';
			};
			CustomComponent.prototype.getSurfaceContent = function() {
				return '<footer id="' + this.id + '-footer" class="myFooter" data-bar="bar">' + this.footerContent + '</footer>';
			};
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

		it('should rerender surfaces when component is decorated and html is not correct', function() {
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
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return '<div class="foo"></div>';
			};
			var custom = new CustomComponent();
			custom.render();

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
				constructor(opt_config) {
					super(opt_config);
				}
			}

			ChildComponent.SURFACES = {
				content: {}
			};

			var child = new ChildComponent();
			assert.deepEqual(['header', 'bottom', 'content'], Object.keys(child.getSurfaces()));

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
			assert.deepEqual(['header', 'bottom'], Object.keys(custom.getSurfaces()));
			assert.strictEqual(null, custom.getSurface('unknown'));
		});

		it('should emit "renderSurface" event for each surface that will be rendered', function() {
			var CustomComponent = createCustomComponentClass();
			ComponentRegistry.register('CustomComponent', CustomComponent);
			var custom = new CustomComponent();
			custom.addSurface('header');
			custom.addSurface('bottom');

			var listener = sinon.stub();
			custom.on('renderSurface', listener);
			custom.render();

			assert.strictEqual(3, listener.callCount);
			var surfaceIds = [listener.args[0][0].surfaceId, listener.args[1][0].surfaceId, listener.args[2][0].surfaceId];
			assert.deepEqual(['bottom', 'header', custom.id], surfaceIds.sort());
		});

		it('should not render surfaces that had their "renderSurface" event prevented', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
				return surfaceId;
			};
			ComponentRegistry.register('CustomComponent', CustomComponent);
			var custom = new CustomComponent();
			custom.addSurface('header');
			custom.addSurface('bottom');

			custom.on('renderSurface', function(data, event) {
				if (data.surfaceId === 'header') {
					event.preventDefault();
				}
			});
			custom.render();

			assert.strictEqual('bottom', custom.getSurfaceElement('bottom').textContent);
			assert.notStrictEqual('header', custom.getSurfaceElement('header').textContent);
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

		it('should get surface element from element even if not on the document', function() {
			var surface = document.createElement('div');
			surface.id = 'custom-header';

			var CustomComponent = createCustomComponentClass();
			CustomComponent.SURFACES = {
				header: {}
			};
			CustomComponent.prototype.getElementContent = function() {
				return surface;
			};
			CustomComponent.prototype.getSurfaceContent = function() {
				return 'Header';
			};
			var custom = new CustomComponent({
				id: 'custom'
			});
			custom.render();

			assert.strictEqual(surface, custom.getSurfaceElement('header'));
			assert.strictEqual('Header', custom.getSurfaceElement('header').innerHTML);
		});

		it('should return null when element is requested for unknown surface', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.render();
			assert.strictEqual(null, custom.getSurfaceElement('unknown'));
		});

		it('should get element for component surface', function() {
			var CustomComponent = createCustomComponentClass();
			ComponentRegistry.register('CustomComponent', CustomComponent);
			var custom = new CustomComponent();
			custom.addSurface('comp', {
				componentName: 'CustomComponent'
			});
			assert.strictEqual(custom.components.comp.element, custom.getSurfaceElement('comp'));
		});

		it('should not throw error when getting element of component surface for component that isn\'t registered', function() {
			var CustomComponent = createCustomComponentClass();
			ComponentRegistry.register('CustomComponent', CustomComponent);
			var custom = new CustomComponent();
			custom.addSurface('comp', {
				componentName: 'CustomComponent'
			});
			Component.componentsCollector.removeComponent(custom.components.comp);
			assert.ok(!custom.getSurfaceElement('comp'));
		});

		it('should remove surface and its element from dom', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				// Creates surface element and appends to component element
				return this.getSurfaceElement('header');
			};
			var custom = new CustomComponent({
				id: 'custom'
			});
			custom.addSurface('header');
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
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
				switch (surfaceId) {
					case 'header':
						return '<b>header</b>';
					case 'bottom':
						return '<span>bottom</span>';
				}
			};
			var custom = new CustomComponent();
			custom.addSurface('header');
			custom.addSurface('bottom');
			custom.render();
			assert.strictEqual('<b>header</b>', custom.getSurfaceElement('header').innerHTML);
			assert.strictEqual('<span>bottom</span>', custom.getSurfaceElement('bottom').innerHTML);
		});

		it('should render surface element if it\'s defined in getSurfaceContent\'s string result', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
				switch (surfaceId) {
					case 'header':
						return '<header id="' + this.id + '-header" class="testHeader" data-foo="foo"><b>header</b></header>';
					case 'bottom':
						return '<bottom id="' + this.id + '-bottom" class="testBottom" data-bar="bar"><span>bottom</span></bottom>';
				}
			};
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
			var CustomComponent = createCustomComponentClass();
			CustomComponent.SURFACES = {
				dynamic: {
					renderAttrs: ['tag']
				}
			};
			CustomComponent.prototype.getElementContent = function() {
				return this.getSurfaceElement('dynamic');
			};
			CustomComponent.prototype.getSurfaceContent = function() {
				return '<' + this.tag + ' id="' + this.id + '-dynamic"></' + this.tag + '>';
			};
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

		it('should render surface content from element', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getSurfaceContent = function() {
				var content = document.createElement('b');
				content.innerHTML = 'header';
				return content;
			};
			var custom = new CustomComponent();
			custom.addSurface('header');
			custom.render();
			assert.strictEqual('<b>header</b>', custom.getSurfaceElement('header').innerHTML);
		});

		it('should render surface element if it\'s defined in getSurfaceContent\'s element result', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getSurfaceContent = function() {
				var frag = dom.buildFragment(
					'<header id="' + this.id + '-header" class="testHeader" data-foo="foo"><b>header</b></header>'
				);
				return frag.childNodes[0];
			};
			var custom = new CustomComponent();
			custom.addSurface('header');
			custom.render();

			var headerElement = custom.getSurfaceElement('header');
			assert.strictEqual('HEADER', headerElement.tagName);
			assert.strictEqual('testHeader', headerElement.className);
			assert.strictEqual('foo', headerElement.getAttribute('data-foo'));
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
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
				switch (surfaceId) {
					case 'header':
						return '<b style="font-size:' + this.fontSize + ';">' + this.headerContent + '</b>';
					case 'bottom':
						return '<span style="font-size:' + this.fontSize + ';">' + this.bottomContent + '</span>';
				}
			};
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

		it('should not render surface content when surface render attrs change but event is prevented', function(done) {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getSurfaceContent = function() {
				return '<b style="font-size:' + this.fontSize + ';">' + this.headerContent + '</b>';
			};
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
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getSurfaceContent = function() {
				return 'Same Content';
			};
			CustomComponent.SURFACES = {
				foo: {
					renderAttrs: ['foo']
				}
			};
			var custom = new CustomComponent().render();

			custom.clearSurfaceCache('foo');
			var surfaceContent = custom.getSurfaceElement('foo').childNodes[0];
			custom.foo = 1;
			custom.once('attrsChanged', function() {
				assert.notStrictEqual(surfaceContent, custom.getSurfaceElement('foo').childNodes[0]);
				done();
			});
		});

		it('should not throw error if attrs, that are not render attrs of a surface, change', function(done) {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ATTRS = {
				content: {
					value: 'foo'
				},
				other: {
					value: 'foo'
				}
			};
			CustomComponent.SURFACES = {
				main: {
					renderAttrs: ['content']
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
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.buildElementSurfaceData_ = function() {
				var data = Component.prototype.buildElementSurfaceData_.call(this);
				data.renderAttrs = ['foo'];
				return data;
			};
			CustomComponent.prototype.getElementContent = function() {
				return '<div>' + this.foo + '</div>';
			};
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

		it('should not cache surface content if not string', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
				switch (surfaceId) {
					case 'header':
						return '<div>static</div>';
					case 'body':
						return '<div>static</div>';
					case 'bottom':
						var bottom = document.createElement('div');
						bottom.innerHTML = 'static';
						return bottom;
				}
			};
			var custom = new CustomComponent();
			custom.addSurface('header');
			custom.addSurface('body');
			custom.addSurface('bottom');
			custom.render();

			var headerContent = custom.getSurfaceElement('header').childNodes[0];
			var bodyContent = custom.getSurfaceElement('body').childNodes[0];
			var bottomContent = custom.getSurfaceElement('bottom').childNodes[0];

			custom.renderSurfacesContent_({
				header: true,
				body: true,
				bottom: true
			});
			assert.strictEqual(headerContent, custom.getSurfaceElement('header').childNodes[0]);
			assert.strictEqual(bodyContent, custom.getSurfaceElement('body').childNodes[0]);
			assert.notStrictEqual(bottomContent, custom.getSurfaceElement('bottom').childNodes[0]);
		});

		it('should return component instance from surface methods', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();

			assert.strictEqual(custom, custom.addSurface('header'));
			assert.strictEqual(custom, custom.addSurfaces({}));
			assert.strictEqual(custom, custom.removeSurface('header'));
		});
	});

	describe('Surface Placeholders', function() {
		it('should replace surface placeholders with their real content', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return 'My surface: ' + this.buildPlaceholder(this.id + '-foo');
			};
			CustomComponent.prototype.getSurfaceContent = function() {
				return 'foo';
			};

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			var expected = 'My surface: <div id="custom-foo">foo</div>';
			assert.strictEqual(expected, custom.element.innerHTML);
			assert.strictEqual(custom.getSurfaceElement('foo'), custom.element.childNodes[1]);
		});
	});

	describe('Nested Surfaces', function() {
		beforeEach(function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ATTRS = {
				foo: {}
			};
			CustomComponent.SURFACES = {
				header: {
					renderAttrs: ['foo']
				}
			};
			CustomComponent.prototype.getElementContent = function() {
				return this.getSurfaceElement('header');
			};
			this.CustomComponent = CustomComponent;
		});

		it('should replace nested surface placeholders with their real content', function() {
			this.CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
				switch (surfaceId) {
					case 'header':
						return this.buildPlaceholder(this.id + '-item1') + this.buildPlaceholder(this.id + '-item2');
					case 'item1':
						return 'Item 1' + this.buildPlaceholder(this.id + '-item1-name');
					case 'item1-name':
						return 'Item 1 Name';
					case 'item2':
						return 'Item 2';
				}
			};

			var custom = new this.CustomComponent({
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
			this.CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
				switch (surfaceId) {
					case 'header':
						return '<div class="headerInner">' + this.foo + this.buildPlaceholder(this.id + '-bar') + '</div>';
					case 'bar':
						return '<div class="barInner">' + this.foo + this.buildPlaceholder(this.id + '-foo') + '</div>';
					case 'foo':
						return '<div class="fooInner">' + this.foo + '</div>';
				}
			};

			var custom = new this.CustomComponent({
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

		it('should only update nested surface when only its contents change', function(done) {
			this.CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
				switch (surfaceId) {
					case 'header':
						return '<div class="headerInner">' + this.buildPlaceholder(this.id + '-bar') + '</div>';
					case 'bar':
						return '<div class="barInner">' + this.buildPlaceholder(this.id + '-foo') + '</div>';
					case 'foo':
						return '<div class="fooInner">' + this.foo + '</div>';
				}
			};

			var custom = new this.CustomComponent({
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

		describe('Generated Ids', function() {
			beforeEach(function() {
				this.CustomComponent = createCustomComponentClass();
				this.CustomComponent.ATTRS = {
					count: {},
					foo: {}
				};
				this.CustomComponent.SURFACES = {
					s1: {
						renderAttrs: ['count', 'foo']
					}
				};
				this.CustomComponent.prototype.getElementContent = function() {
					return this.buildPlaceholder();
				};
				this.CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
					switch (surfaceId) {
						case 's1':
							var content = '<div class="s1Inner">';
							for (var i = 0; i < this.count; i++) {
								content += this.buildPlaceholder();
							}
							return content + '</div>';
						default:
							return '<div class="nestedInner">Generated ' + this.foo + '</div>';
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

			this.ChildComponent = createCustomComponentClass();
			this.ChildComponent.prototype.getElementContent = function() {
				return '<div id="' + this.id + '">Child-' + this.buildPlaceholder(this.id + '-foo') + '</div>';
			};
			this.ChildComponent.prototype.getSurfaceContent = function() {
				return '<span>' + this.foo + '</span>';
			};
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
			ComponentRegistry.register('ChildComponent', this.ChildComponent);
		});

		it('should instantiate sub component from placeholder', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder('child', {
					componentName: 'ChildComponent'
				});
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

		it('should render sub component\'s element according to its getElementContent method', function() {
			this.ChildComponent.prototype.getElementContent = function() {
				var placeholder = this.buildPlaceholder(this.id + '-foo');
				return '<span id="' + this.id + '" data-foo="foo">Child-' + placeholder + '</span>';
			};

			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder('child', {
					componentName: 'ChildComponent'
				});
			};

			var custom = new CustomComponent({
				id: 'custom'
			}).render();

			var child = custom.components.child;
			assert.strictEqual('SPAN', child.element.tagName);
			assert.strictEqual('foo', child.element.getAttribute('data-foo'));
			assert.strictEqual('Child-default', child.element.textContent);
		});

		it('should instantiate sub component that has hifen on id from placeholder', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder('my-child', {
					componentName: 'ChildComponent'
				});
			};

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
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ATTRS = {
				foo: {}
			};
			CustomComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder('child', {
					componentData: {
						foo: this.foo
					},
					componentName: 'ChildComponent'
				});
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

			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder('child', {
					componentName: 'ChildComponent'
				});
			};

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

			var CustomComponent = createCustomComponentClass();
			CustomComponent.ATTRS = {
				foo: {}
			};
			CustomComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder('child', {
					componentData: {
						foo: this.foo
					},
					componentName: 'ChildComponent'
				});
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

			var CustomComponent = createCustomComponentClass();
			CustomComponent.ATTRS = {
				foo: {}
			};
			CustomComponent.prototype.getElementContent = function() {
				var placeholder = this.buildPlaceholder('child', {
					componentData: {
						foo: this.foo
					},
					componentName: 'ChildComponent'
				});
				return '<div id="' + this.id + '">' + placeholder + '</div>';
			};

			var custom = new CustomComponent({
				element: '#custom',
				foo: 'foo'
			}).decorate();

			var child = custom.components.child;
			assert.strictEqual(fooElement, child.element.querySelector('span'));
		});

		it('should update existing component from placeholder', function(done) {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ATTRS = {
				foo: {}
			};
			CustomComponent.SURFACES = {
				foo: {
					renderAttrs: ['foo']
				}
			};
			CustomComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder(this.id + '-foo');
			};
			CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
				var placeholder = this.buildPlaceholder('child', {
					componentData: {
						foo: this.foo
					},
					componentName: 'ChildComponent'
				});
				return surfaceId === 'foo' ? 'Surface ' + this.foo + ': ' + placeholder : '';
			};

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

		it('should instantiate sub component from surface definition', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.SURFACES = {
				child: {
					componentName: 'ChildComponent'
				}
			};
			CustomComponent.prototype.getElementContent = function() {
				return this.getSurfaceElement('child');
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
			var CustomComponent = createCustomComponentClass();
			CustomComponent.ATTRS = {
				invert: {}
			};
			CustomComponent.SURFACES = {
				foo: {
					renderAttrs: ['invert']
				}
			};
			CustomComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder(this.id + '-foo');
			};
			CustomComponent.prototype.getSurfaceContent = function() {
				var placeholder1 = this.buildPlaceholder('child1', {
					componentName: 'ChildComponent'
				});
				var placeholder2 = this.buildPlaceholder('child2', {
					componentName: 'ChildComponent'
				});
				if (this.invert) {
					return placeholder2 + placeholder1;
				} else {
					return placeholder1 + placeholder2;
				}
			};

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

		it('should correctly position nested component even its element had already been set', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder('child', {
					componentName: 'ChildComponent'
				});
			};

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
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder('child', {
					componentName: 'ChildComponent'
				});
			};

			var element = document.createElement('div');
			var custom = new CustomComponent({
				id: 'custom'
			}).render(element);

			var child = custom.components.child;
			assert.ok(child);
			assert.strictEqual(this.ChildComponent, child.constructor);
			assert.strictEqual(custom.element.querySelector('#child'), child.element);
		});

		it('should dispose sub components when parent component is disposed', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder('child', {
					componentName: 'ChildComponent'
				});
			};

			var custom = new CustomComponent({
				id: 'custom'
			}).render();

			var child = custom.components.child;
			custom.dispose();
			assert.ok(child.isDisposed());
		});

		it('should not throw error when disposing a component with shared sub components', function() {
			var AnotherComponent = createCustomComponentClass();
			AnotherComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder('child', {
					componentName: 'ChildComponent'
				});
			};
			ComponentRegistry.register('AnotherComponent', AnotherComponent);

			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				var placeholder1 = this.buildPlaceholder('child', {
					componentName: 'ChildComponent'
				});
				var placeholder2 = this.buildPlaceholder('another', {
					componentName: 'AnotherComponent'
				});
				return placeholder1 + placeholder2;
			};

			var custom = new CustomComponent({
				id: 'custom'
			}).render();

			var child = custom.components.child;
			var another = custom.components.another;
			custom.dispose();
			assert.ok(child.isDisposed());
			assert.ok(another.isDisposed());
		});
	});

	describe('Inline Events', function() {
		beforeEach(function() {
			ComponentCollector.components = {};

			var EventsTestComponent = createCustomComponentClass();
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
			EventsTestComponent.prototype.getElementContent = function() {
				return '<button class="elementButton" data-onclick="handleClick"></button>' +
					this.buildPlaceholder(this.id + '-foo');
			};
			EventsTestComponent.prototype.getSurfaceContent = function() {
				var content = '';
				for (var i = 0; i < this.count; i++) {
					content += '<button class="fooButton" data-onmouseover="handleMouseOver"></button>';
				}
				return content;
			};
			EventsTestComponent.prototype.handleClick = sinon.stub();
			EventsTestComponent.prototype.handleMouseOver = sinon.stub();
			ComponentRegistry.register('EventsTestComponent', EventsTestComponent);
			this.EventsTestComponent = EventsTestComponent;
		});

		it('should attach listeners from element content', function() {
			var custom = new this.EventsTestComponent().render();
			var button = custom.element.querySelector('.elementButton');
			dom.triggerEvent(button, 'click');
			assert.strictEqual(1, custom.handleClick.callCount);
		});

		it('should attach listeners from element tag', function() {
			this.EventsTestComponent.prototype.getElementContent = function() {
				return '<div id="' + this.id + '" data-onclick="handleElementClicked"></div>';
			};
			this.EventsTestComponent.prototype.handleElementClicked = sinon.stub();

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
			var originalMethod = this.EventsTestComponent.prototype.getSurfaceContent;
			this.EventsTestComponent.prototype.getSurfaceContent = function(surfaceId) {
				var surfaceElementId = this.id + '-' + surfaceId;
				var content = originalMethod.call(this);
				return '<div id="' + surfaceElementId + '" data-onclick="handleSurfaceClicked">' + content + '</div>';
			};
			this.EventsTestComponent.prototype.handleSurfaceClicked = sinon.stub();

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
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder('child', {
					componentName: 'EventsTestComponent'
				});
			};

			var custom = new CustomComponent().render();
			var button = custom.element.querySelector('.elementButton');
			dom.triggerEvent(button, 'click');
			assert.strictEqual(1, custom.components.child.handleClick.callCount);

			button = custom.element.querySelector('.fooButton');
			dom.triggerEvent(button, 'mouseover');
			assert.strictEqual(1, custom.components.child.handleMouseOver.callCount);
		});

		it('should attach listeners when component is decorated as sub component', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return this.buildPlaceholder(this.id + '-foo');
			};
			CustomComponent.prototype.getSurfaceContent = function() {
				return this.buildPlaceholder('child', {
					componentName: 'EventsTestComponent'
				});
			};

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

			assert.strictEqual(2, custom.element.removeEventListener.callCount);
			assert.strictEqual('click', custom.element.removeEventListener.args[0][0]);
			assert.strictEqual('mouseover', custom.element.removeEventListener.args[1][0]);
		});
	});

	function createCustomComponentClass() {
		class CustomComponent extends Component {
			constructor(opt_config) {
				super(opt_config);
				if (this.created) {
					this.created();
				}
			}
		}

		sinon.spy(CustomComponent.prototype, 'getSurfaceContent');
		sinon.spy(CustomComponent.prototype, 'getElementContent');
		sinon.spy(CustomComponent.prototype, 'render');
		sinon.spy(CustomComponent.prototype, 'attached');
		sinon.spy(CustomComponent.prototype, 'detached');

		return CustomComponent;
	}

	function getClassNames(element) {
		return element.className.trim().split(' ');
	}
});
