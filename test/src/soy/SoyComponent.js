'use strict';

import dom from '../../../src/dom/dom';
import ComponentCollector from '../../../src/component/ComponentCollector';
import ComponentRegistry from '../../../src/component/ComponentRegistry';
import SoyComponent from '../../../src/soy/SoyComponent';

import './assets/ChildrenTestComponent.soy.js';
import './assets/CustomTestComponent.soy.js';
import './assets/DeeplyNestedTestComponent.soy.js';
import './assets/EventsTestComponent.soy.js';
import './assets/NestedNoIdTestComponent.soy.js';
import './assets/NestedSurfacesTestComponent.soy.js';
import './assets/NestedTestComponent.soy.js';

describe('SoyComponent', function() {
	beforeEach(function() {
		document.body.innerHTML = '';
	});

	it('should sanitize html for use on soy templates', function() {
		var sanitized = SoyComponent.sanitizeHtml('<div></div>');
		assert.ok(sanitized instanceof soydata.SanitizedHtml);
	});

	it('should render element content with surfaces automatically from template', function() {
		var CustomTestComponent = createCustomTestComponentClass();
		CustomTestComponent.ATTRS = {
			footerContent: {},
			headerContent: {}
		};

		var custom = new CustomTestComponent({
			footerContent: 'My Footer',
			headerContent: 'My Header'
		});
		custom.render();

		assert.strictEqual(2, custom.element.childNodes.length);
		assert.strictEqual(custom.getSurfaceElement('header'), custom.element.childNodes[0]);
		assert.strictEqual('My Header', custom.element.childNodes[0].innerHTML);
		assert.strictEqual(custom.getSurfaceElement('footer'), custom.element.childNodes[1]);
		assert.strictEqual('My Footer', custom.element.childNodes[1].innerHTML);
	});

	it('should render element tag according to its template when defined', function() {
		var CustomTestComponent = createCustomTestComponentClass();

		var custom = new CustomTestComponent();
		custom.render();
		assert.strictEqual('CUSTOM', custom.element.tagName);
	});

	it('should not throw error if element template is not defined', function() {
		var NoTemplateTestComponent = createCustomTestComponentClass('NoTemplateTestComponent');
		var custom = new NoTemplateTestComponent();

		assert.doesNotThrow(function() {
			custom.render();
		});
	});

	it('should not throw error if surface template is not defined', function() {
		var CustomTestComponent = createCustomTestComponentClass();
		CustomTestComponent.ATTRS = {
			body: {}
		};
		CustomTestComponent.SURFACES = {
			body: {
				renderAttrs: ['body']
			}
		};

		var custom = new CustomTestComponent();

		assert.doesNotThrow(function() {
			custom.decorate();
		});
	});

	describe('Surfaces', function() {
		it('should automatically create surfaces for a component\'s templates', function() {
			var CustomTestComponent = createCustomTestComponentClass();

			var custom = new CustomTestComponent();
			var surfaces = custom.getSurfaces();
			assert.deepEqual(['header', 'footer'], Object.keys(surfaces));
		});

		it('should set surface renderAttrs to its template params', function() {
			var CustomTestComponent = createCustomTestComponentClass();

			var custom = new CustomTestComponent();
			var surfaces = custom.getSurfaces();
			assert.deepEqual(['headerContent'], surfaces.header.renderAttrs);
			assert.deepEqual(['footerContent'], surfaces.footer.renderAttrs);
		});

		it('should not override surface config when it already exists', function() {
			var CustomTestComponent = createCustomTestComponentClass();
			CustomTestComponent.SURFACES = {
				header: {
					renderAttrs: ['foo']
				}
			};

			var custom = new CustomTestComponent();
			var surfaces = custom.getSurfaces();
			assert.deepEqual(['foo'], surfaces.header.renderAttrs);
		});
	});

	describe('Nested Surfaces', function() {
		it('should correctly render nested surfaces', function() {
			var NestedSurfacesTestComponent = createCustomTestComponentClass('NestedSurfacesTestComponent');
			NestedSurfacesTestComponent.ATTRS = {
				items: {}
			};

			var custom = new NestedSurfacesTestComponent({
				id: 'custom',
				items: ['Item1', 'Item2']
			}).render();
			var element = custom.element;
			assert.strictEqual(custom.getSurfaceElement('title'), element.querySelector('#custom-title'));
			assert.strictEqual(custom.getSurfaceElement('0'), element.querySelector('#custom-0'));
			assert.strictEqual(custom.getSurfaceElement('list-s1'), element.querySelector('#custom-list-s1'));
			assert.strictEqual(custom.getSurfaceElement('list-s2'), element.querySelector('#custom-list-s2'));
		});

		it('should correctly update nested surfaces', function(done) {
			var NestedSurfacesTestComponent = createCustomTestComponentClass('NestedSurfacesTestComponent');
			NestedSurfacesTestComponent.ATTRS = {
				items: {}
			};

			var custom = new NestedSurfacesTestComponent({
				id: 'custom',
				items: ['Item1', 'Item2']
			}).render();
			var element = custom.element;
			var titleElement = custom.getSurfaceElement('title');
			var zeroElement = custom.getSurfaceElement('0');
			var listS1Element = custom.getSurfaceElement('list-s1');
			var listS2Element = custom.getSurfaceElement('list-s2');
			assert.strictEqual(2, custom.element.querySelector('.items').childNodes.length);

			custom.items = ['New Item1', 'New Item2', 'New Item3'];
			custom.once('attrsChanged', function() {
				assert.strictEqual(3, custom.element.querySelector('.items').childNodes.length);
				assert.strictEqual(titleElement, element.querySelector('#custom-title'));
				assert.strictEqual(zeroElement, element.querySelector('#custom-0'));
				assert.strictEqual('0', zeroElement.textContent);
				assert.strictEqual(listS1Element, element.querySelector('#custom-list-s1'));
				assert.strictEqual('New Item1', listS1Element.textContent);
				assert.strictEqual(listS2Element, element.querySelector('#custom-list-s2'));
				assert.strictEqual('New Item2', listS2Element.textContent);
				done();
			});
		});
	});

	describe('Nested Components', function() {
		beforeEach(function() {
			ComponentRegistry.components_ = {};
			ComponentCollector.components = {};

			var CustomTestComponent = createCustomTestComponentClass();
			CustomTestComponent.ATTRS = {
				footerContent: {},
				headerContent: {}
			};
			this.CustomTestComponent = CustomTestComponent;

			var EventsTestComponent = createCustomTestComponentClass('EventsTestComponent');
			EventsTestComponent.ATTRS = {
				footerButtons: {
					value: []
				}
			};
			EventsTestComponent.prototype.handleClick = sinon.stub();
			EventsTestComponent.prototype.handleMouseDown = sinon.stub();
			EventsTestComponent.prototype.handleMouseOver = sinon.stub();
		});

		it('should instantiate rendered child component', function() {
			var NestedTestComponent = createNestedTestComponentClass();
			var custom = new NestedTestComponent({
				id: 'nested'
			}).render();

			var child = custom.components.nestedMyChild0;
			assert.ok(child);
			assert.strictEqual(this.CustomTestComponent, child.constructor);
			assert.strictEqual('foo', child.headerContent);
			assert.strictEqual('footer', child.footerContent);
		});

		it('should instantiate rendered child component when decorating main component', function() {
			var NestedTestComponent = createNestedTestComponentClass();
			var custom = new NestedTestComponent({
				id: 'nested'
			}).decorate();

			var child = custom.components.nestedMyChild0;
			assert.ok(child);
			assert.strictEqual(this.CustomTestComponent, child.constructor);
			assert.strictEqual('foo', child.headerContent);
			assert.strictEqual('footer', child.footerContent);
		});

		it('should instantiate rendered child component without id', function() {
			var NestedNoIdTestComponent = createCustomTestComponentClass('NestedNoIdTestComponent');
			var custom = new NestedNoIdTestComponent({
				id: 'nested'
			}).render();

			assert.ok(custom.components['nested-c1']);
			assert.ok(custom.components['nested-foo-c1']);
		});

		it('should render nested components inside parent', function() {
			var NestedTestComponent = createNestedTestComponentClass();
			var custom = new NestedTestComponent({
				id: 'nested'
			}).render();

			var childPlaceholder = custom.element.querySelector('#nestedMyChild0');
			var child = custom.components.nestedMyChild0;

			assert.strictEqual(childPlaceholder, child.element);
			assert.strictEqual(2, childPlaceholder.childNodes.length);
		});

		it('should update rendered child component', function(done) {
			var test = this;
			var NestedTestComponent = createNestedTestComponentClass();
			var custom = new NestedTestComponent({
				id: 'nested'
			}).render();

			custom.foo = 'bar';
			custom.on('attrsChanged', function() {
				var child = custom.components.nestedMyChild0;
				assert.ok(child);
				assert.strictEqual(test.CustomTestComponent, child.constructor);
				assert.strictEqual('bar', child.headerContent);
				assert.ok(custom.element.querySelector('#' + child.id));

				done();
			});
		});

		it('should not update parent if only child components change', function(done) {
			var NestedTestComponent = createNestedTestComponentClass();
			var custom = new NestedTestComponent({
				count: 2
			}).render();

			var wrapper = custom.element.querySelector('.componentsWrapper');
			custom.foo = 'bar';
			custom.once('attrsChanged', function() {
				assert.strictEqual(wrapper, custom.element.querySelector('.componentsWrapper'));
				done();
			});
		});

		it('should pass children to nested components through surface attributes', function() {
			var ChildrenTestComponent = createCustomTestComponentClass('ChildrenTestComponent');
			ChildrenTestComponent.ATTRS = {
				bar: 'bar',
				children: {
					value: ''
				}
			};

			var DeeplyNestedTestComponent = createDeeplyNestedTestComponentClass();
			var component = new DeeplyNestedTestComponent({
				id: 'nested'
			}).render();

			var comps = component.components;
			var nestedMain = comps['nested-main'];
			assert.ok(nestedMain);
			assert.ok(!comps['nested-child1']);
			assert.ok(!comps['nested-child2']);
			assert.ok(!comps['nested-child3']);

			var child2 = nestedMain.components['nested-child2'];
			var child3 = nestedMain.components['nested-child3'];
			assert.ok(child2);
			assert.ok(child3);

			var child1 = child2.components['nested-child1'];
			assert.ok(child1);
		});

		it('should attach listeners to parent component when its id is the listener name\'s prefix', function() {
			var ChildrenTestComponent = createCustomTestComponentClass('ChildrenTestComponent');
			ChildrenTestComponent.ATTRS = {
				bar: 'bar',
				children: {
					value: ''
				}
			};

			var DeeplyNestedTestComponent = createDeeplyNestedTestComponentClass();
			var component = new DeeplyNestedTestComponent({
				id: 'nested'
			}).render();

			var parentButton = component.element.querySelector('.parentButton');
			dom.triggerEvent(parentButton, 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});
	});

	function createCustomTestComponentClass(name) {
		name = name || 'CustomTestComponent';
		class CustomTestComponent extends SoyComponent {
			constructor(opt_config) {
				super(opt_config);
			}
		}
		ComponentRegistry.register(name, CustomTestComponent);
		return CustomTestComponent;
	}

	function createNestedTestComponentClass() {
		var NestedTestComponent = createCustomTestComponentClass('NestedTestComponent');
		NestedTestComponent.ATTRS = {
			count: {
				value: 1
			},
			foo: {
				value: 'foo'
			},
			footerContent: {
				value: 'footer'
			}
		};
		return NestedTestComponent;
	}

	function createDeeplyNestedTestComponentClass() {
		createNestedTestComponentClass();
		var DeeplyNestedTestComponent = createCustomTestComponentClass('DeeplyNestedTestComponent');
		DeeplyNestedTestComponent.prototype.handleClick = sinon.stub();
		DeeplyNestedTestComponent.prototype.handleMouseDown = sinon.stub();
		DeeplyNestedTestComponent.prototype.handleMouseOver = sinon.stub();
		DeeplyNestedTestComponent.ATTRS = {
			bar: {
				value: 'bar'
			},
			footerButtons: {
				value: [{
					label: 'Ok'
				}]
			}
		};
		return DeeplyNestedTestComponent;
	}
});
