'use strict';

import dom from 'metal-dom';
import { Component, ComponentCollector, SurfaceRenderer } from 'metal-component';
import SoyAop from '../src/SoyAop';
import SoyRenderer from '../src/SoyRenderer';
import SoyTemplates from '../src/SoyTemplates';

import ChildrenTestComponent from './assets/ChildrenTestComponent.soy';
import ContentSurfaceTestComponent from './assets/ContentSurfaceTestComponent.soy';
import CustomTagTestComponent from './assets/CustomTagTestComponent.soy';
import CustomTestComponent from './assets/CustomTestComponent.soy';
import DeeplyNestedTestComponent from './assets/DeeplyNestedTestComponent.soy';
import EventsTestComponent from './assets/EventsTestComponent.soy';
import ExternalTemplateTestComponent from './assets/ExternalTemplateTestComponent.soy';
import ListTestComponent from './assets/ListTestComponent.soy';
import NestedNoIdTestComponent from './assets/NestedNoIdTestComponent.soy';
import NestedPrivateTemplateTestComponent from './assets/NestedPrivateTemplateTestComponent.soy';
import NestedSurfacesTestComponent from './assets/NestedSurfacesTestComponent.soy';
import NestedTestComponent from './assets/NestedTestComponent.soy';
import PrivateTemplateTestComponent from './assets/PrivateTemplateTestComponent.soy';
import StaticTestComponent from './assets/StaticTestComponent.soy';

describe('SoyRenderer', function() {
	beforeEach(function() {
		document.body.innerHTML = '';
		SurfaceRenderer.surfacesCollector.removeAllSurfaces();
	});

	it('should render element content with surfaces automatically from template', function() {
		var custom = new CustomTestComponent({
			footerContent: 'My Footer',
			headerContent: 'My Header'
		});
		var renderer = custom.getRenderer();
		custom.render();

		assert.strictEqual(3, custom.element.childNodes.length);
		assert.strictEqual('My Title', custom.element.childNodes[0].textContent);
		assert.strictEqual(renderer.getSurfaceElement('header'), custom.element.childNodes[1]);
		assert.strictEqual('My Header', custom.element.childNodes[1].innerHTML);
		assert.strictEqual(renderer.getSurfaceElement('footer'), custom.element.childNodes[2]);
		assert.strictEqual('My Footer', custom.element.childNodes[2].innerHTML);
	});

	it('should escape any html content rendered from a string attribute', function() {
		var custom = new CustomTestComponent({
			footerContent: '<div class="myFooter"></div>'
		});
		custom.render();

		assert.ok(!custom.element.querySelector('.myFooter'));
		assert.notStrictEqual(-1, custom.element.textContent.indexOf('<div class="myFooter"></div>'));
	});

	it('should not escape html content rendered from an html attribute', function() {
		class HtmlTestComponent extends CustomTestComponent {
		}
		HtmlTestComponent.ATTRS = {
			footerContent: {
				isHtml: true
			}
		};
		HtmlTestComponent.NAME = 'CustomTestComponent';

		var custom = new HtmlTestComponent({
			footerContent: '<div class="myFooter"></div>'
		}).render();
		assert.ok(custom.element.querySelector('.myFooter'));
	});

	it('should render non string html attribute correctly', function() {
		class HtmlTestComponent extends CustomTestComponent {
		}
		HtmlTestComponent.ATTRS = {
			footerContent: {
				isHtml: true
			}
		};
		HtmlTestComponent.NAME = 'CustomTestComponent';

		var custom = new HtmlTestComponent().render();
		var renderer = custom.getRenderer();
		assert.strictEqual('undefined', renderer.getSurfaceElement('footer').innerHTML);
	});

	it('should render element tag according to its template when defined', function() {
		var custom = new CustomTagTestComponent({
			elementClasses: 'myClass'
		}).render();
		assert.strictEqual('CUSTOM', custom.element.tagName);
		assert.strictEqual('component myClass', custom.element.className.trim());
		assert.strictEqual('foo', custom.element.getAttribute('data-foo'));
	});

	it('should render surface element tag according to its template when defined', function() {
		var custom = new CustomTagTestComponent({
			elementClasses: 'myClass'
		}).render();
		var surfaceElement = custom.getRenderer().getSurfaceElement('footer');
		assert.strictEqual('FOOTER', surfaceElement.tagName);
		assert.strictEqual('myFooter', surfaceElement.className);
		assert.strictEqual('bar', surfaceElement.getAttribute('data-bar'));
	});

	it('should not throw error if element template is not defined', function() {
		class NoTemplateTestComponent extends Component {
		}
		NoTemplateTestComponent.RENDERER = SoyRenderer;
		var custom = new NoTemplateTestComponent();

		assert.doesNotThrow(function() {
			custom.render();
		});
	});

	it('should not throw error if surface template is not defined', function() {
		class MyCustomTestComponent extends CustomTestComponent {
		}
		MyCustomTestComponent.SURFACES = {
			body: {
				renderAttrs: ['body']
			}
		};
		var custom = new MyCustomTestComponent();

		assert.doesNotThrow(function() {
			custom.decorate();
		});
	});

	it('should not throw error if template depends on array attr that was not defined on component', function() {
		var custom = new ListTestComponent({
			items: [1, 2, 3]
		});

		assert.doesNotThrow(function() {
			custom.render();
		});

		assert.strictEqual(3, custom.element.childNodes.length);
		assert.strictEqual('1', custom.element.childNodes[0].textContent);
		assert.strictEqual('2', custom.element.childNodes[1].textContent);
		assert.strictEqual('3', custom.element.childNodes[2].textContent);
	});

	it('should pass requested injected data to soy templates', function() {
		var ijData = {
			foo: 'foo'
		};
		SoyRenderer.setInjectedData(ijData);

		var templates = SoyTemplates.get('CustomTestComponent');
		sinon.spy(templates, 'header');
		var templateFn = templates.header;
		new CustomTestComponent().render();
		assert.strictEqual(ijData, templateFn.args[0][2]);

		templateFn.restore();
	});

	it('should pass an empty object as injected data if it\'s set to falsey value', function() {
		SoyRenderer.setInjectedData(null);

		var templates = SoyTemplates.get('CustomTestComponent');
		sinon.spy(templates, 'header');
		var templateFn = templates.header;
		new CustomTestComponent().render();
		assert.deepEqual({}, templateFn.args[0][2]);

		templateFn.restore();
	});

	describe('Sanitize Html', function() {
		it('should sanitize html for use on soy templates', function() {
			var sanitized = SoyRenderer.sanitizeHtml('<div>Content</div>');
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
		it('should only create surfaces either from non private template calls or calls with surface id', function() {
			var custom = new PrivateTemplateTestComponent({
				id: 'custom'
			}).render();
			var surfaces = custom.getRenderer().getSurfaces();
			assert.deepEqual(['custom', 'notPrivate', 'privateTemplate', 's1'], Object.keys(surfaces).sort());
		});

		it('should set surface renderAttrs to its template params', function() {
			var custom = new PrivateTemplateTestComponent().render();
			var surfaces = custom.getRenderer().getSurfaces();
			assert.deepEqual(['text'], surfaces.notPrivate.renderAttrs);
		});

		it('should only create surfaces on nested components either from non private template calls or calls with surface id', function() {
			var custom = new NestedPrivateTemplateTestComponent({
				id: 'nestedPrivate'
			}).render();
			var surfaces = custom.getRenderer().getSurfaces();
			var nestedSurfaces = custom.components['nestedPrivate-child1'].getRenderer().getSurfaces();
			assert.deepEqual(
				['nestedPrivate', 'nestedPrivate-child1', 'notPrivate', 'privateTemplate', 's1'],
				Object.keys(surfaces).sort()
			);
			assert.deepEqual(['children', 'nestedPrivate-child1'], Object.keys(nestedSurfaces).sort());
			assert.strictEqual('Surface', custom.element.querySelector('#nestedPrivate-notPrivate').textContent);
			assert.strictEqual('Surface', custom.element.querySelector('#nestedPrivate-privateTemplate').textContent);
			assert.strictEqual('Surface', custom.element.querySelector('#nestedPrivate-s1').textContent);
		});

		it('should set renderAttrs for main surface from the template params of the "render" template', function() {
			var custom = new ContentSurfaceTestComponent().render();
			var surfaces = custom.getRenderer().getSurfaces();
			assert.deepEqual(['foo'], surfaces[custom.id].renderAttrs);
		});

		it('should update element content if a param from the "render" template changes', function(done) {
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
			var comp = new StaticTestComponent({
				text: 'foo'
			}).render();
			var renderer = comp.getRenderer();

			var initialContent = renderer.getSurfaceElement('inner').childNodes[0];
			comp.text = 'bar';
			comp.once('attrsChanged', function() {
				assert.strictEqual(initialContent, renderer.getSurfaceElement('inner').childNodes[0]);
				done();
			});
		});
	});

	describe('Nested Surfaces', function() {
		it('should correctly render nested surfaces', function() {
			var custom = new NestedSurfacesTestComponent({
				id: 'custom',
				items: ['Item1', 'Item2']
			}).render();
			var renderer = custom.getRenderer();
			var element = custom.element;
			assert.strictEqual(renderer.getSurfaceElement('title'), element.querySelector('#custom-title'));
			assert.strictEqual(renderer.getSurfaceElement('0'), element.querySelector('#custom-0'));
			assert.strictEqual(renderer.getSurfaceElement('list-s1'), element.querySelector('#custom-list-s1'));
			assert.strictEqual(renderer.getSurfaceElement('list-s2'), element.querySelector('#custom-list-s2'));
		});

		it('should correctly update nested surfaces', function(done) {
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

		before(function() {
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
		});

		beforeEach(function() {
			ComponentCollector.components = {};

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
			nestedComp = new NestedTestComponent({
				id: 'nested'
			}).render();

			var child = nestedComp.components.nestedMyChild0;
			assert.ok(child);
			assert.strictEqual(CustomTestComponent, child.constructor);
			assert.strictEqual('foo', child.headerContent);
			assert.strictEqual('footer', child.footerContent);
		});

		it('should instantiate rendered child component when decorating main component', function() {
			nestedComp = new NestedTestComponent({
				id: 'nested'
			}).decorate();

			var child = nestedComp.components.nestedMyChild0;
			assert.ok(child);
			assert.strictEqual(CustomTestComponent, child.constructor);
			assert.strictEqual('foo', child.headerContent);
			assert.strictEqual('footer', child.footerContent);
		});

		it('should instantiate rendered child component without id', function() {
			nestedComp = new NestedNoIdTestComponent({
				id: 'nested'
			}).render();

			assert.ok(nestedComp.components['nested-s1']);
			assert.ok(nestedComp.components['nested-foo-s1']);
		});

		it('should render nested components inside parent', function() {
			nestedComp = new NestedTestComponent({
				id: 'nested'
			}).render();

			var childPlaceholder = nestedComp.element.querySelector('#nestedMyChild0');
			var child = nestedComp.components.nestedMyChild0;

			assert.strictEqual(childPlaceholder, child.element);
			assert.strictEqual(3, childPlaceholder.childNodes.length);
		});

		it('should update rendered child component', function(done) {
			nestedComp = new NestedTestComponent({
				id: 'nested'
			}).render();

			nestedComp.foo = 'bar';
			nestedComp.on('attrsChanged', function() {
				var child = nestedComp.components.nestedMyChild0;
				assert.ok(child);
				assert.strictEqual(CustomTestComponent, child.constructor);
				assert.strictEqual('bar', child.headerContent);
				assert.ok(nestedComp.element.querySelector('#' + child.id));

				done();
			});
		});

		it('should not update parent if only child components change', function(done) {
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
			ChildrenTestComponent.ATTRS = {
				bar: 'bar',
				children: {
					value: ''
				}
			};

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
			ChildrenTestComponent.ATTRS = {
				bar: 'bar',
				children: {
					value: ''
				}
			};

			nestedComp = new DeeplyNestedTestComponent({
				id: 'nested'
			}).render();

			var parentButton = nestedComp.element.querySelector('.parentButton');
			dom.triggerEvent(parentButton, 'click');
			assert.strictEqual(1, nestedComp.handleClick.callCount);
		});

		it('should render templates from other components', function() {
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
			var templateFn = SoyTemplates.get('CustomTestComponent', 'header');
			var comp = SoyRenderer.createComponentFromTemplate(templateFn);
			assert.ok(comp instanceof Component);

			comp.render();
			assert.strictEqual('undefined', comp.element.innerHTML);
		});

		it('should render component contents inside given element', function() {
			var templateFn = SoyTemplates.get('CustomTestComponent', 'header');
			var element = document.createElement('div');
			var comp = SoyRenderer.createComponentFromTemplate(templateFn, element);

			comp.render();
			assert.strictEqual(element, comp.element);
			assert.strictEqual('undefined', element.innerHTML);
		});

		it('should pass given data when rendering given template', function() {
			var templateFn = SoyTemplates.get('CustomTestComponent', 'header');
			var element = document.createElement('div');
			var comp = SoyRenderer.createComponentFromTemplate(templateFn, element, {
				headerContent: 'My Header'
			});

			comp.render();
			assert.strictEqual('My Header', element.innerHTML);
		});

		it('should pass correct params to soy template', function() {
			var templates = SoyTemplates.get('CustomTestComponent');
			templates.header = SoyAop.getOriginalFn(templates.header);
			sinon.spy(templates, 'header');
			var templateFn = templates.header;
			var data = {
				headerContent: 'My Header'
			};
			var comp = SoyRenderer.createComponentFromTemplate(templateFn, null, data);

			comp.render();
			assert.strictEqual(2, templateFn.callCount);
			assert.strictEqual('My Header', templateFn.args[1][0].headerContent);
			assert.ok(!templateFn.args[1][1]);
			assert.deepEqual({}, templateFn.args[1][2]);
		});
	});

	describe('renderFromTemplate', function() {
		afterEach(function() {
			ComponentCollector.components = {};
		});

		it('should render the given template in the specified element', function() {
			var element = document.createElement('div');
			var templateFn = SoyTemplates.get('CustomTestComponent', 'header');
			SoyRenderer.renderFromTemplate(templateFn, element);
			assert.strictEqual('undefined', element.innerHTML);
		});

		it('should render the given template with the given data', function() {
			var element = document.createElement('div');
			var templateFn = SoyTemplates.get('CustomTestComponent', 'header');
			var data = {
				headerContent: 'My Header'
			};
			SoyRenderer.renderFromTemplate(templateFn, element, data);
			assert.strictEqual('My Header', element.innerHTML);
		});

		it('should render the given template in the element with the specified id', function() {
			var element = document.createElement('div');
			element.id = 'comp';
			dom.enterDocument(element);
			var templateFn = SoyTemplates.get('CustomTestComponent', 'header');
			var data = {
				headerContent: 'My Header'
			};
			SoyRenderer.renderFromTemplate(templateFn, '#comp', data);
			assert.strictEqual('My Header', element.innerHTML);
		});

		it('should return a Component instance', function() {
			var element = document.createElement('div');
			var templateFn = SoyTemplates.get('CustomTestComponent', 'header');
			var comp = SoyRenderer.renderFromTemplate(templateFn, element);
			assert.ok(comp instanceof Component);
		});

		it('should instantiate components inside rendered template', function() {
			sinon.spy(CustomTestComponent.prototype, 'renderAsSubComponent');

			var element = document.createElement('div');
			var templateFn = SoyTemplates.get('NestedTestComponent', 'components');
			var data = {
				count: 2,
				id: 'nested',
				foo: 'foo'
			};
			var comp = SoyRenderer.renderFromTemplate(templateFn, element, data);
			assert.ok(comp.components.nestedMyChild0 instanceof CustomTestComponent);
			assert.ok(comp.components.nestedMyChild1 instanceof CustomTestComponent);
			assert.strictEqual(2, CustomTestComponent.prototype.renderAsSubComponent.callCount);
			CustomTestComponent.prototype.renderAsSubComponent.restore();
		});
	});

	describe('decorateFromTemplate', function() {
		it('should decorate component with custom tag correctly', function() {
			var element = document.createElement('custom');
			var templateFn = SoyTemplates.get('CustomTagTestComponent', 'render');
			var data = {
				count: 2,
				id: 'custom',
				footerContent: 'foo'
			};

			var comp = SoyRenderer.decorateFromTemplate(templateFn, element, data);
			assert.strictEqual(element, comp.element);
			assert.strictEqual(element.childNodes[0], comp.getRenderer().getSurfaceElement('footer'));
		});

		it('should decorate component with custom tag correctly even without specifying id', function() {
			var element = document.createElement('custom');
			element.id = 'custom';
			var templateFn = SoyTemplates.get('CustomTagTestComponent', 'render');
			var data = {
				count: 2,
				footerContent: 'foo'
			};

			var comp = SoyRenderer.decorateFromTemplate(templateFn, element, data);
			assert.strictEqual(element, comp.element);
			assert.strictEqual(element.childNodes[0], comp.getRenderer().getSurfaceElement('footer'));
		});

		it('should call renderAsSubComponent for components inside given template', function() {
			sinon.spy(CustomTestComponent.prototype, 'renderAsSubComponent');

			var element = document.createElement('div');
			var templateFn = SoyTemplates.get('NestedTestComponent', 'components');
			var data = {
				count: 2,
				id: 'nested',
				foo: 'foo'
			};
			var comp = SoyRenderer.decorateFromTemplate(templateFn, element, data);
			assert.ok(comp.components.nestedMyChild0 instanceof CustomTestComponent);
			assert.ok(comp.components.nestedMyChild1 instanceof CustomTestComponent);
			assert.strictEqual(2, CustomTestComponent.prototype.renderAsSubComponent.callCount);
			CustomTestComponent.prototype.renderAsSubComponent.restore();
		});
	});
});
