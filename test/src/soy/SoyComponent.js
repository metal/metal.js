'use strict';

import dom from '../../../src/dom/dom';
import Component from '../../../src/component/Component';
import ComponentCollector from '../../../src/component/ComponentCollector';
import ComponentRegistry from '../../../src/component/ComponentRegistry';
import SoyComponent from '../../../src/soy/SoyComponent';
import SoyComponentAop from '../../../src/soy/SoyComponentAop';

import './assets/ChildrenTestComponent.soy.js';
import './assets/ContentSurfaceTestComponent.soy.js';
import './assets/CustomTagTestComponent.soy.js';
import './assets/CustomTestComponent.soy.js';
import './assets/DeeplyNestedTestComponent.soy.js';
import './assets/EventsTestComponent.soy.js';
import './assets/ExternalTemplateTestComponent.soy.js';
import './assets/NestedNoIdTestComponent.soy.js';
import './assets/NestedPrivateTemplateTestComponent.soy.js';
import './assets/NestedSurfacesTestComponent.soy.js';
import './assets/NestedTestComponent.soy.js';
import './assets/PrivateTemplateTestComponent.soy.js';

describe('SoyComponent', function() {
	beforeEach(function() {
		document.body.innerHTML = '';
		Component.surfacesCollector.removeAllSurfaces();
	});

	it('should render element content with surfaces automatically from template', function() {
		var CustomTestComponent = createCustomTestComponentClass();
		var custom = new CustomTestComponent({
			footerContent: 'My Footer',
			headerContent: 'My Header'
		});
		custom.render();

		assert.strictEqual(3, custom.element.childNodes.length);
		assert.strictEqual('My Title', custom.element.childNodes[0].textContent);
		assert.strictEqual(custom.getSurfaceElement('header'), custom.element.childNodes[1]);
		assert.strictEqual('My Header', custom.element.childNodes[1].innerHTML);
		assert.strictEqual(custom.getSurfaceElement('footer'), custom.element.childNodes[2]);
		assert.strictEqual('My Footer', custom.element.childNodes[2].innerHTML);
	});

	it('should render element tag according to its template when defined', function() {
		var CustomTagTestComponent = createCustomTestComponentClass('CustomTagTestComponent');

		var custom = new CustomTagTestComponent({
			elementClasses: 'myClass'
		}).render();
		assert.strictEqual('CUSTOM', custom.element.tagName);
		assert.strictEqual('component myClass', custom.element.className.trim());
		assert.strictEqual('foo', custom.element.getAttribute('data-foo'));
	});

	it('should render surface element tag according to its template when defined', function() {
		var CustomTagTestComponent = createCustomTestComponentClass('CustomTagTestComponent');

		var custom = new CustomTagTestComponent({
			elementClasses: 'myClass'
		}).render();
		var surfaceElement = custom.getSurfaceElement('footer');
		assert.strictEqual('FOOTER', surfaceElement.tagName);
		assert.strictEqual('myFooter', surfaceElement.className);
		assert.strictEqual('bar', surfaceElement.getAttribute('data-bar'));
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

	it('should pass requested injected data to soy templates', function() {
		var ijData = {
			foo: 'foo'
		};
		SoyComponent.setInjectedData(ijData);

		var CustomTestComponent = createCustomTestComponentClass();
		sinon.spy(ComponentRegistry.Templates.CustomTestComponent, 'header');
		new CustomTestComponent().render();
		assert.strictEqual(ijData, ComponentRegistry.Templates.CustomTestComponent.header.args[0][2]);

		ComponentRegistry.Templates.CustomTestComponent.header.restore();
	});

	it('should pass an empty object as injected data if it\'s set to falsey value', function() {
		SoyComponent.setInjectedData(null);

		var CustomTestComponent = createCustomTestComponentClass();
		sinon.spy(ComponentRegistry.Templates.CustomTestComponent, 'header');
		var templateFn = ComponentRegistry.Templates.CustomTestComponent.header;
		new CustomTestComponent().render();
		assert.deepEqual({}, templateFn.args[0][2]);

		templateFn.restore();
	});

	describe('Sanitize Html', function() {
		it('should sanitize html for use on soy templates', function() {
			var sanitized = SoyComponent.sanitizeHtml('<div>Content</div>');
			assert.ok(sanitized instanceof soydata.SanitizedHtml);
			assert.strictEqual('<div>Content</div>', sanitized.content);
		});

		it('should convert regular object with sanitized html to SanitizedHtml instance', function() {
			var sanitizedObj = {
				content: '<div>Content</div>',
				contentKind: 'HTML'
			};
			var sanitized = soydata.SanitizedHtml.from(sanitizedObj);
			assert.ok(sanitized instanceof soydata.SanitizedHtml);
			assert.strictEqual('<div>Content</div>', sanitized.content);
		});
	});

	describe('Surfaces', function() {
		it('should automatically create surfaces for a component\'s non private templates', function() {
			var PrivateTemplateTestComponent = createCustomTestComponentClass('PrivateTemplateTestComponent');

			var custom = new PrivateTemplateTestComponent();
			var surfaces = custom.getSurfaces();
			assert.deepEqual(['notPrivate'], Object.keys(surfaces));
		});

		it('should set surface renderAttrs to its template params', function() {
			var PrivateTemplateTestComponent = createCustomTestComponentClass('PrivateTemplateTestComponent');

			var custom = new PrivateTemplateTestComponent();
			var surfaces = custom.getSurfaces();
			assert.deepEqual(['text'], surfaces.notPrivate.renderAttrs);
		});

		it('should not override surface config when it already exists', function() {
			var PrivateTemplateTestComponent = createCustomTestComponentClass('PrivateTemplateTestComponent');
			PrivateTemplateTestComponent.SURFACES = {
				notPrivate: {
					renderAttrs: ['foo']
				}
			};

			var custom = new PrivateTemplateTestComponent();
			var surfaces = custom.getSurfaces();
			assert.deepEqual(['foo'], surfaces.notPrivate.renderAttrs);
		});

		it('should only create surfaces either from non private template calls or calls with surface id', function() {
			var PrivateTemplateTestComponent = createCustomTestComponentClass('PrivateTemplateTestComponent');

			var custom = new PrivateTemplateTestComponent({
				id: 'custom'
			}).render();
			var surfaces = custom.getSurfaces();
			assert.deepEqual(['custom', 'notPrivate', 'privateTemplate', 's1'], Object.keys(surfaces).sort());
		});

		it('should only create surfaces on nested components either from non private template calls or calls with surface id', function() {
			createCustomTestComponentClass('ChildrenTestComponent');
			var NestedPrivateTemplateTestComponent = createCustomTestComponentClass('NestedPrivateTemplateTestComponent');

			var custom = new NestedPrivateTemplateTestComponent({
				id: 'nestedPrivate'
			}).render();
			var surfaces = custom.getSurfaces();
			var nestedSurfaces = custom.components['nestedPrivate-child1'].getSurfaces();
			assert.deepEqual(
				['nestedPrivate', 'nestedPrivate-child1', 'notPrivate', 'privateTemplate', 's1'],
				Object.keys(surfaces).sort()
			);
			assert.deepEqual(['children', 'nestedPrivate-child1'], Object.keys(nestedSurfaces).sort());
			assert.strictEqual('Surface', custom.element.querySelector('#nestedPrivate-notPrivate').textContent);
			assert.strictEqual('Surface', custom.element.querySelector('#nestedPrivate-privateTemplate').textContent);
			assert.strictEqual('Surface', custom.element.querySelector('#nestedPrivate-s1').textContent);
		});

		it('should set renderAttrs for main surface from the template params of the "content" template', function() {
			var ContentSurfaceTestComponent = createCustomTestComponentClass('ContentSurfaceTestComponent');

			var custom = new ContentSurfaceTestComponent().render();
			var surfaces = custom.getSurfaces();
			assert.deepEqual(['foo'], surfaces[custom.id].renderAttrs);
		});

		it('should update element content if param from "content" changes', function(done) {
			var ContentSurfaceTestComponent = createCustomTestComponentClass('ContentSurfaceTestComponent');

			var custom = new ContentSurfaceTestComponent({
				foo: 'foo',
				id: 'custom'
			}).render();
			assert.strictEqual('foo<div id="custom-body">Body</div>', custom.element.innerHTML);

			custom.foo = 'bar';
			custom.once('attrsChanged', function() {
				assert.strictEqual('bar<div id="custom-body">Body</div>', custom.element.innerHTML);
				done();
			});
		});

		it('should not repaint surface if it has @static doc tag, even when its contents would change', function(done) {
			var StaticTestComponent = createCustomTestComponentClass('StaticTestComponent');
			var comp = new StaticTestComponent({
				text: 'foo'
			}).render();

			var initialContent = comp.getSurfaceElement('inner').childNodes[0];
			comp.text = 'bar';
			comp.once('attrsChanged', function() {
				assert.strictEqual(initialContent, comp.getSurfaceElement('inner').childNodes[0]);
				done();
			});
		});
	});

	describe('Nested Surfaces', function() {
		it('should correctly render nested surfaces', function() {
			var NestedSurfacesTestComponent = createCustomTestComponentClass('NestedSurfacesTestComponent');
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
			var custom = new NestedSurfacesTestComponent({
				id: 'custom',
				items: ['Item1', 'Item2']
			}).render();
			var element = custom.element;
			assert.strictEqual(2, custom.element.querySelector('.items').childNodes.length);

			custom.items = ['New Item1', 'New Item2', 'New Item3'];
			custom.once('attrsChanged', function() {
				assert.strictEqual(3, element.querySelector('.items').childNodes.length);
				assert.strictEqual('My List', element.querySelector('#custom-title').textContent);
				assert.strictEqual('0', element.querySelector('#custom-0').textContent);
				assert.strictEqual('New Item1', element.querySelector('#custom-list-s1').textContent);
				assert.strictEqual('New Item2', element.querySelector('#custom-list-s2').textContent);
				assert.strictEqual('New Item3', element.querySelector('#custom-list-s3').textContent);
				done();
			});
		});
	});

	describe('Nested Components', function() {
		var nestedComp;
		beforeEach(function() {
			ComponentRegistry.components_ = {};
			ComponentCollector.components = {};

			var CustomTestComponent = createCustomTestComponentClass();
			this.CustomTestComponent = CustomTestComponent;

			var EventsTestComponent = createCustomTestComponentClass('EventsTestComponent');
			EventsTestComponent.prototype.handleClick = sinon.stub();
			EventsTestComponent.prototype.handleMouseDown = sinon.stub();
			EventsTestComponent.prototype.handleMouseOver = sinon.stub();
		});

		afterEach(function() {
			if (nestedComp) {
				nestedComp.dispose();
			}
		});

		it('should instantiate rendered child component', function() {
			var NestedTestComponent = createNestedTestComponentClass();
			nestedComp = new NestedTestComponent({
				id: 'nested'
			}).render();

			var child = nestedComp.components.nestedMyChild0;
			assert.ok(child);
			assert.strictEqual(this.CustomTestComponent, child.constructor);
			assert.strictEqual('foo', child.headerContent);
			assert.strictEqual('footer', child.footerContent);
		});

		it('should instantiate rendered child component when decorating main component', function() {
			var NestedTestComponent = createNestedTestComponentClass();
			nestedComp = new NestedTestComponent({
				id: 'nested'
			}).decorate();

			var child = nestedComp.components.nestedMyChild0;
			assert.ok(child);
			assert.strictEqual(this.CustomTestComponent, child.constructor);
			assert.strictEqual('foo', child.headerContent);
			assert.strictEqual('footer', child.footerContent);
		});

		it('should instantiate rendered child component without id', function() {
			var NestedNoIdTestComponent = createCustomTestComponentClass('NestedNoIdTestComponent');
			nestedComp = new NestedNoIdTestComponent({
				id: 'nested'
			}).render();

			assert.ok(nestedComp.components['nested-s1']);
			assert.ok(nestedComp.components['nested-foo-s1']);
		});

		it('should render nested components inside parent', function() {
			var NestedTestComponent = createNestedTestComponentClass();
			nestedComp = new NestedTestComponent({
				id: 'nested'
			}).render();

			var childPlaceholder = nestedComp.element.querySelector('#nestedMyChild0');
			var child = nestedComp.components.nestedMyChild0;

			assert.strictEqual(childPlaceholder, child.element);
			assert.strictEqual(3, childPlaceholder.childNodes.length);
		});

		it('should update rendered child component', function(done) {
			var test = this;
			var NestedTestComponent = createNestedTestComponentClass();
			nestedComp = new NestedTestComponent({
				id: 'nested'
			}).render();

			nestedComp.foo = 'bar';
			nestedComp.on('attrsChanged', function() {
				var child = nestedComp.components.nestedMyChild0;
				assert.ok(child);
				assert.strictEqual(test.CustomTestComponent, child.constructor);
				assert.strictEqual('bar', child.headerContent);
				assert.ok(nestedComp.element.querySelector('#' + child.id));

				done();
			});
		});

		it('should not update parent if only child components change', function(done) {
			// HERE
			var NestedTestComponent = createNestedTestComponentClass();
			nestedComp = new NestedTestComponent({
				count: 2
			}).render();

			var wrapper = nestedComp.element.querySelector('.componentsWrapper');
			nestedComp.foo = 'bar';
			nestedComp.once('attrsChanged', function() {
				assert.strictEqual(wrapper, nestedComp.element.querySelector('.componentsWrapper'));
				done();
			});
		});

		it('should pass non attribute params to sub component templates', function() {
			var NestedTestComponent = createNestedTestComponentClass();
			NestedTestComponent.ATTRS.extra = {};
			nestedComp = new NestedTestComponent({
				count: 2,
				extra: 'Extra'
			}).render();
			var extraElement = nestedComp.element.querySelector('.extra');
			assert.ok(extraElement);
			assert.strictEqual('Extra', extraElement.textContent);
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
			nestedComp = new DeeplyNestedTestComponent({
				id: 'nested'
			}).render();

			var comps = nestedComp.components;
			assert.ok(comps['nested-main']);
			assert.ok(comps['nested-child1']);
			assert.ok(comps['nested-child2']);
			assert.ok(comps['nested-child3']);

			assert.ok(comps['nested-main'].element.querySelector('#nested-child2'));
			assert.ok(comps['nested-main'].element.querySelector('#nested-child3'));
			assert.ok(comps['nested-child2'].element.querySelector('#nested-child1'));
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
			nestedComp = new DeeplyNestedTestComponent({
				id: 'nested'
			}).render();

			var parentButton = nestedComp.element.querySelector('.parentButton');
			dom.triggerEvent(parentButton, 'click');
			assert.strictEqual(1, nestedComp.handleClick.callCount);
		});

		it('should render templates from other components', function() {
			createNestedTestComponentClass();
			var ExternalTemplateTestComponent = createCustomTestComponentClass('ExternalTemplateTestComponent');
			ExternalTemplateTestComponent.ATTRS = {
				count: {
					value: 2
				}
			};
			nestedComp = new ExternalTemplateTestComponent({
				id: 'nested'
			}).render();

			assert.ok(nestedComp.components.nestedMyChild0);
			assert.ok(nestedComp.components.nestedMyChild1);
		});
	});

	describe('createComponentFromTemplate', function() {
		it('should create and instantiate soy component using given template', function() {
			var templateFn = ComponentRegistry.Templates.CustomTestComponent.header;
			var comp = SoyComponent.createComponentFromTemplate(templateFn);
			assert.ok(comp instanceof SoyComponent);

			comp.render();
			assert.strictEqual('undefined', comp.element.innerHTML);
		});

		it('should render component contents inside given element', function() {
			var templateFn = ComponentRegistry.Templates.CustomTestComponent.header;
			var element = document.createElement('div');
			var comp = SoyComponent.createComponentFromTemplate(templateFn, element);

			comp.render();
			assert.strictEqual(element, comp.element);
			assert.strictEqual('undefined', element.innerHTML);
		});

		it('should pass given data when rendering given template', function() {
			var templateFn = ComponentRegistry.Templates.CustomTestComponent.header;
			var element = document.createElement('div');
			var comp = SoyComponent.createComponentFromTemplate(templateFn, element, {
				headerContent: 'My Header'
			});

			comp.render();
			assert.strictEqual('My Header', element.innerHTML);
		});

		it('should pass correct params to soy template', function() {
			ComponentRegistry.Templates.CustomTestComponent.header = SoyComponentAop.getOriginalFn(
				ComponentRegistry.Templates.CustomTestComponent.header
			);
			sinon.spy(ComponentRegistry.Templates.CustomTestComponent, 'header');
			var templateFn = ComponentRegistry.Templates.CustomTestComponent.header;
			var data = {
				headerContent: 'My Header'
			};
			var comp = SoyComponent.createComponentFromTemplate(templateFn, null, data);

			comp.render();
			assert.strictEqual(2, templateFn.callCount);
			assert.strictEqual('My Header', templateFn.args[1][0].headerContent);
			assert.ok(!templateFn.args[1][1]);
			assert.deepEqual({}, templateFn.args[1][2]);
		});
	});

	describe('renderFromTemplate', function() {
		afterEach(function() {
			ComponentRegistry.components_ = {};
			ComponentCollector.components = {};
		});

		it('should render the given template in the specified element', function() {
			var element = document.createElement('div');
			var templateFn = ComponentRegistry.Templates.CustomTestComponent.header;
			SoyComponent.renderFromTemplate(templateFn, element);
			assert.strictEqual('undefined', element.innerHTML);
		});

		it('should render the given template with the given data', function() {
			var element = document.createElement('div');
			var templateFn = ComponentRegistry.Templates.CustomTestComponent.header;
			var data = {
				headerContent: 'My Header'
			};
			SoyComponent.renderFromTemplate(templateFn, element, data);
			assert.strictEqual('My Header', element.innerHTML);
		});

		it('should render the given template in the element with the specified id', function() {
			var element = document.createElement('div');
			element.id = 'comp';
			dom.enterDocument(element);
			var templateFn = ComponentRegistry.Templates.CustomTestComponent.header;
			var data = {
				headerContent: 'My Header'
			};
			SoyComponent.renderFromTemplate(templateFn, '#comp', data);
			assert.strictEqual('My Header', element.innerHTML);
		});

		it('should return a SoyComponent instance', function() {
			var element = document.createElement('div');
			var templateFn = ComponentRegistry.Templates.CustomTestComponent.header;
			var comp = SoyComponent.renderFromTemplate(templateFn, element);
			assert.ok(comp instanceof SoyComponent);
		});

		it('should instantiate components inside rendered template', function() {
			var CustomTestComponent = createCustomTestComponentClass();
			sinon.spy(CustomTestComponent.prototype, 'renderAsSubComponent');

			var element = document.createElement('div');
			var templateFn = ComponentRegistry.Templates.NestedTestComponent.components;
			var data = {
				count: 2,
				id: 'nested',
				foo: 'foo'
			};
			var comp = SoyComponent.renderFromTemplate(templateFn, element, data);
			assert.ok(comp.components.nestedMyChild0 instanceof CustomTestComponent);
			assert.ok(comp.components.nestedMyChild1 instanceof CustomTestComponent);
			assert.strictEqual(2, CustomTestComponent.prototype.renderAsSubComponent.callCount);
		});
	});

	describe('decorateFromTemplate', function() {
		it('should decorate component with custom tag correctly', function() {
			createCustomTestComponentClass('CustomTagTestComponent');
			var element = document.createElement('custom');
			var templateFn = ComponentRegistry.Templates.CustomTagTestComponent.content;
			var data = {
				count: 2,
				id: 'custom',
				footerContent: 'foo'
			};

			var comp = SoyComponent.decorateFromTemplate(templateFn, element, data);
			assert.strictEqual(element, comp.element);
			assert.strictEqual(element.childNodes[0], comp.getSurfaceElement('footer'));
		});

		it('should decorate component with custom tag correctly even without specifying id', function() {
			createCustomTestComponentClass('CustomTagTestComponent');
			var element = document.createElement('custom');
			element.id = 'custom';
			var templateFn = ComponentRegistry.Templates.CustomTagTestComponent.content;
			var data = {
				count: 2,
				footerContent: 'foo'
			};

			var comp = SoyComponent.decorateFromTemplate(templateFn, element, data);
			assert.strictEqual(element, comp.element);
			assert.strictEqual(element.childNodes[0], comp.getSurfaceElement('footer'));
		});

		it('should call decorateAsSubComponent for components inside given template', function() {
			var CustomTestComponent = createCustomTestComponentClass();
			sinon.spy(CustomTestComponent.prototype, 'decorateAsSubComponent');

			var element = document.createElement('div');
			var templateFn = ComponentRegistry.Templates.NestedTestComponent.components;
			var data = {
				count: 2,
				id: 'nested',
				foo: 'foo'
			};
			var comp = SoyComponent.decorateFromTemplate(templateFn, element, data);
			assert.ok(comp.components.nestedMyChild0 instanceof CustomTestComponent);
			assert.ok(comp.components.nestedMyChild1 instanceof CustomTestComponent);
			assert.strictEqual(2, CustomTestComponent.prototype.decorateAsSubComponent.callCount);
		});
	});

	function createCustomTestComponentClass(name) {
		name = name || 'CustomTestComponent';
		class CustomTestComponent extends SoyComponent {
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
