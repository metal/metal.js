'use strict';

import async from '../../../src/async/async';
import dom from '../../../src/dom/dom';
import Component from '../../../src/component/Component';
import ComponentCollector from '../../../src/component/ComponentCollector';
import ComponentRegistry from '../../../src/component/ComponentRegistry';

describe('Component', function() {
	afterEach(function() {
		document.body.innerHTML = '';
	});

	describe('Lifecycle', function() {
		it('should test component render lifecycle', function() {
			var CustomComponent = createCustomComponentClass();

			CustomComponent.SURFACES = {
				header: {},
				bottom: {}
			};

			var custom = new CustomComponent();
			custom.render();

			sinon.assert.callOrder(
				CustomComponent.prototype.renderInternal,
				CustomComponent.prototype.getSurfaceContent,
				CustomComponent.prototype.attached
			);

			sinon.assert.callCount(CustomComponent.prototype.renderInternal, 1);
			sinon.assert.callCount(CustomComponent.prototype.attached, 1);

			sinon.assert.callCount(CustomComponent.prototype.getSurfaceContent, 2);
			assert.strictEqual('header', CustomComponent.prototype.getSurfaceContent.args[0][0]);
			assert.strictEqual('bottom', CustomComponent.prototype.getSurfaceContent.args[1][0]);

			sinon.assert.notCalled(CustomComponent.prototype.decorateInternal);
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

			sinon.assert.callOrder(
				CustomComponent.prototype.decorateInternal,
				CustomComponent.prototype.getSurfaceContent,
				CustomComponent.prototype.attached);

			sinon.assert.callCount(CustomComponent.prototype.decorateInternal, 1);
			sinon.assert.callCount(CustomComponent.prototype.attached, 1);

			sinon.assert.callCount(CustomComponent.prototype.getSurfaceContent, 2);
			assert.strictEqual('header', CustomComponent.prototype.getSurfaceContent.args[0][0]);
			assert.strictEqual('bottom', CustomComponent.prototype.getSurfaceContent.args[1][0]);

			sinon.assert.notCalled(CustomComponent.prototype.renderInternal);
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

		it('should render the content returned by getElementContent', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return '<div>My content</div>';
			};
			var custom = new CustomComponent();
			custom.render();

			assert.strictEqual('<div>My content</div>', custom.element.innerHTML);
		});

		it('should throw error when component renders and it was already rendered', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.render();
			assert.throws(function() {
				custom.render();
			}, Error);
			sinon.assert.callCount(CustomComponent.prototype.renderInternal, 1);
			sinon.assert.callCount(CustomComponent.prototype.attached, 1);
		});

		it('should throw error when component decorates and it was already decorated', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();
			custom.decorate();
			assert.throws(function() {
				custom.decorate();
			}, Error);
			sinon.assert.callCount(CustomComponent.prototype.decorateInternal, 1);
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

			var custom = new ChildComponent();
			custom.render();
			assert.strictEqual('span', custom.element.tagName.toLowerCase());
		});

		it('should return component instance from lifecycle methods', function() {
			var CustomComponent = createCustomComponentClass();
			var custom = new CustomComponent();

			assert.strictEqual(custom, custom.render());
			assert.strictEqual(custom, custom.detach());
			assert.strictEqual(custom, custom.decorate());

			custom.detach();
			assert.strictEqual(custom, custom.attach());
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
			CustomComponent.prototype.renderInternal = function() {
				this.element.innerHTML = '<div class="foo"></div>';
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
			CustomComponent.prototype.renderInternal = function() {
				this.element.appendChild(surface);
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

		it('should remove surface and its element from dom', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.renderInternal = function() {
				// Creates surface element and appends to component element
				this.element.appendChild(this.getSurfaceElement('header'));
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

		it('should render surface content', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.renderInternal = function() {
				this.element.appendChild(this.getSurfaceElement('header'));
				this.element.appendChild(this.getSurfaceElement('bottom'));
			};
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

		it('should render surface content when surface render attrs change', function(done) {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.renderInternal = function() {
				this.element.appendChild(this.getSurfaceElement('header'));
				this.element.appendChild(this.getSurfaceElement('bottom'));
			};
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

		it('should not cache surface content if not string', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.renderInternal = function() {
				this.element.appendChild(this.getSurfaceElement('header'));
				this.element.appendChild(this.getSurfaceElement('bottom'));
			};
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
				return 'My surface: %%%%~s-foo~%%%%';
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
			CustomComponent.prototype.renderInternal = function() {
				this.element.appendChild(this.getSurfaceElement('header'));
			};
			this.CustomComponent = CustomComponent;
		});

		it('should replace nested surface placeholders with their real content', function() {
			this.CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
				switch (surfaceId) {
					case 'header':
						return '%%%%~s-item1~%%%%%%%%~s-item2~%%%%';
					case 'item1':
						return 'Item 1%%%%~s-item1-name~%%%%';
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
						return '<div class="headerInner">' + this.foo + '%%%%~s-bar~%%%%</div>';
					case 'bar':
						return '<div class="barInner">' + this.foo + '%%%%~s-foo~%%%%</div>';
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
						return '<div class="headerInner">%%%%~s-bar~%%%%</div>';
					case 'bar':
						return '<div class="barInner">%%%%~s-foo~%%%%</div>';
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

		it('should reposition nested surfaces correctly after rerendering parent', function(done) {
			this.CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
				switch (surfaceId) {
					case 'header':
						return '<div class="headerInner">' + this.foo + ': %%%%~s-bar~%%%%</div>';
					case 'bar':
						return '<div class="barInner">%%%%~s-foo~%%%%</div>';
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
			var headerElement = custom.getSurfaceElement('header');
			var barElement = custom.getSurfaceElement('bar');
			var fooElement = custom.getSurfaceElement('foo');

			custom.foo = 'bar';
			custom.on('attrsChanged', function() {
				assert.strictEqual('bar: bar', custom.element.textContent);
				assert.notStrictEqual(headerInnerElement, custom.element.querySelector('.headerInner'));
				assert.strictEqual(barInnerElement, custom.element.querySelector('.barInner'));
				assert.notStrictEqual(fooInnerElement, custom.element.querySelector('.fooInner'));

				assert.strictEqual(headerElement, custom.element.childNodes[0]);
				assert.strictEqual(barElement, headerElement.querySelector('.headerInner').childNodes[1]);
				assert.strictEqual(fooElement, barInnerElement.childNodes[0]);
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
					return '%%%%~s~%%%%';
				};
				this.CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
					switch (surfaceId) {
						case 's1':
							var content = '<div class="s1Inner">';
							for (var i = 0; i < this.count; i++) {
								content += '%%%%~s~%%%%';
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

			it('should reuse deeply nested surfaces with generated ids', function(done) {
				var custom = new this.CustomComponent({
					count: 1,
					id: 'custom'
				}).render();
				var s1S1Element = custom.getSurfaceElement('s1-s1');

				custom.count = 2;
				custom.once('attrsChanged', function() {
					assert.strictEqual(s1S1Element, custom.getSurfaceElement('s1-s1'));
					done();
				});
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
				return 'Child %%%%~s-foo~%%%%';
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
				return '%%%%~c-child:ChildComponent~%%%%';
			};

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			assert.ok(custom.components.child);

			var child = custom.components.child;
			assert.strictEqual(child.element, custom.element.querySelector('#child'));
			assert.strictEqual(child.element, custom.getSurfaceElement('child'));
			assert.strictEqual('Child default', child.element.textContent);
		});

		it('should instantiate sub component that has hifen on id from placeholder', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return '%%%%~c-my-child:ChildComponent~%%%%';
			};

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			assert.ok(custom.components['my-child']);

			var child = custom.components['my-child'];
			assert.strictEqual(child.element, custom.element.querySelector('#my-child'));
			assert.strictEqual(child.element, custom.getSurfaceElement('my-child'));
			assert.strictEqual('Child default', child.element.textContent);
		});

		it('should instantiate sub component that has no id from placeholder', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return '%%%%~c:ChildComponent~%%%%';
			};

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			assert.ok(custom.components['custom-c1']);

			var child = custom.components['custom-c1'];
			assert.strictEqual('custom-c1', child.id);
			assert.strictEqual(child.element, custom.element.querySelector('#custom-c1'));
			assert.strictEqual(child.element, custom.getSurfaceElement('custom-c1'));
			assert.strictEqual('Child default', child.element.textContent);
		});

		it('should instantiate sub component from placeholder passing defined config data', function() {
			class CustomComponent extends Component {
				constructor(opt_config) {
					super(opt_config);
					Component.componentsCollector.setNextComponentData('child', {
						foo: this.foo
					});
				}
			}
			CustomComponent.ATTRS = {
				foo: {}
			};
			CustomComponent.prototype.getElementContent = function() {
				return '%%%%~c-child:ChildComponent~%%%%';
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
			assert.strictEqual('Child foo', child.element.textContent);
		});

		it('should instantiate sub components when parent is decorated', function() {
			var element = document.createElement('div');
			element.id = 'custom';
			dom.append(element, '<div id="child">Child <div id="child-foo"><span>default</span></div></div>');
			dom.append(document.body, element);

			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return '%%%%~c-child:ChildComponent~%%%%';
			};

			var custom = new CustomComponent({
				element: '#custom'
			}).decorate();
			assert.ok(custom.components.child);

			var child = custom.components.child;
			assert.strictEqual(child.element, custom.element.querySelector('#child'));
			assert.strictEqual(child.element, custom.getSurfaceElement('child'));
			assert.strictEqual('Child default', child.element.textContent);
		});

		it('should update sub components when parent is decorated and html is not correct', function() {
			var element = document.createElement('div');
			element.id = 'custom';
			dom.append(element, '<div id="child">Child <div id="child-foo"><span>default</span></div></div>');
			dom.append(document.body, element);
			var fooElement = document.body.querySelector('span');

			class CustomComponent extends Component {
				constructor(opt_config) {
					super(opt_config);
					Component.componentsCollector.setNextComponentData('child', {
						foo: this.foo
					});
				}
			}
			CustomComponent.ATTRS = {
				foo: {}
			};
			CustomComponent.prototype.getElementContent = function() {
				return '%%%%~c-child:ChildComponent~%%%%';
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
			dom.append(element, '<div id="child">Child <div id="child-foo"><span>foo</span></div></div>');
			dom.append(document.body, element);
			var fooElement = document.body.querySelector('span');

			class CustomComponent extends Component {
				constructor(opt_config) {
					super(opt_config);
					Component.componentsCollector.setNextComponentData('child', {
						foo: this.foo
					});
				}
			}
			CustomComponent.ATTRS = {
				foo: {}
			};
			CustomComponent.prototype.getElementContent = function() {
				return '%%%%~c-child:ChildComponent~%%%%';
			};

			var custom = new CustomComponent({
				element: '#custom',
				foo: 'foo'
			}).decorate();

			var child = custom.components.child;
			assert.strictEqual(fooElement, child.element.querySelector('span'));
		});

		it('should update existing component from placeholder', function(done) {
			class CustomComponent extends Component {
				constructor(opt_config) {
					super(opt_config);
					Component.componentsCollector.setNextComponentData('child', {
						foo: this.foo
					});
					this.on('fooChanged', function() {
						Component.componentsCollector.setNextComponentData('child', {
							foo: this.foo
						});
					});
				}
			}
			CustomComponent.ATTRS = {
				foo: {}
			};
			CustomComponent.SURFACES = {
				foo: {
					renderAttrs: ['foo']
				}
			};
			CustomComponent.prototype.getElementContent = function() {
				return '%%%%~s-foo~%%%%';
			};
			CustomComponent.prototype.getSurfaceContent = function(surfaceId) {
				return surfaceId === 'foo' ? 'Surface ' + this.foo + ': %%%%~c-child:ChildComponent~%%%%' : '';
			};

			var custom = new CustomComponent({
				foo: 'foo',
				id: 'custom'
			}).render();
			var child = custom.components.child;
			assert.strictEqual('Child foo', child.element.textContent);
			assert.strictEqual('Surface foo: Child foo', custom.element.textContent);

			custom.foo = 'bar';
			custom.once('attrsChanged', function() {
				assert.strictEqual(child.element, custom.element.querySelector('#child'));
				assert.strictEqual(child.element, custom.getSurfaceElement('child'));
				assert.strictEqual('bar', child.foo);

				child.once('attrsChanged', function() {
					assert.strictEqual('Child bar', child.element.textContent);
					assert.strictEqual('Surface bar: Child bar', custom.element.textContent);
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
			CustomComponent.prototype.renderInternal = function() {
				dom.append(this.element, this.getSurfaceElement('child'));
			};

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			assert.ok(custom.components.child);

			var child = custom.components.child;
			assert.strictEqual(child.element, custom.element.querySelector('#child'));
			assert.strictEqual(child.element, custom.getSurfaceElement('child'));
			assert.strictEqual('Child default', child.element.textContent);
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
				return '%%%%~s-foo~%%%%';
			};
			CustomComponent.prototype.getSurfaceContent = function() {
				if (this.invert) {
					return '%%%%~c-child2:ChildComponent~%%%%%%%%~c-child1:ChildComponent~%%%%';
				} else {
					return '%%%%~c-child1:ChildComponent~%%%%%%%%~c-child2:ChildComponent~%%%%';
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
				return '%%%%~c-child:ChildComponent~%%%%';
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
			assert.strictEqual('Child default', child.element.textContent);
			assert.strictEqual(1, child.renderAsSubComponent.callCount);
		});

		it('should render nested component correctly when element is not on document', function() {
			var CustomComponent = createCustomComponentClass();
			CustomComponent.prototype.getElementContent = function() {
				return '%%%%~c-child:ChildComponent~%%%%';
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
					'%%%%~s-foo~%%%%';
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

		it('should attach listeners from surface content', function() {
			var custom = new this.EventsTestComponent().render();
			var button = custom.element.querySelector('.fooButton');
			dom.triggerEvent(button, 'mouseover');
			assert.strictEqual(1, custom.handleMouseOver.callCount);
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
				return '%%%%~c-child:EventsTestComponent~%%%%';
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
				return '%%%%~s-foo~%%%%';
			};
			CustomComponent.prototype.getSurfaceContent = function() {
				return '%%%%~c-child:EventsTestComponent~%%%%';
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

		sinon.spy(CustomComponent.prototype, 'decorateInternal');
		sinon.spy(CustomComponent.prototype, 'getSurfaceContent');
		sinon.spy(CustomComponent.prototype, 'attached');
		sinon.spy(CustomComponent.prototype, 'detached');
		sinon.spy(CustomComponent.prototype, 'renderInternal');

		return CustomComponent;
	}

	function getClassNames(element) {
		return element.className.trim().split(' ');
	}
});
