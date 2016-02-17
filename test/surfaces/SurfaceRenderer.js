'use strict';

import { async, core, object } from 'metal';
import { dom, globalEval } from 'metal-dom';
import Component from '../../src/Component';
import ComponentCollector from '../../src/ComponentCollector';
import ComponentRegistry from '../../src/ComponentRegistry';
import SurfaceRenderer from '../../src/surfaces/SurfaceRenderer';

describe('SurfaceRenderer', function() {
	var component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
		SurfaceRenderer.surfacesCollector.removeAllSurfaces();
		ComponentCollector.components = {};
		ComponentRegistry.components_ = {};
		document.body.innerHTML = '';
	});

	describe('Function - getSurfaceContent', function() {
		it('should throw error if getSurfaceContent is not implemented', function() {
			class TestRenderer extends SurfaceRenderer {
			}
			class TestComponent extends Component {
			}
			TestComponent.RENDERER = TestRenderer;
			assert.throws(() => new TestComponent().render());
		});

		it('should call getSurfaceContent with opt_skipContents set to true when building element', function() {
			var TestComponent = createTestComponentClass();
			component = new TestComponent();
			var renderer = component.getRenderer();

			sinon.spy(renderer, 'getSurfaceContent');
			var element = component.element;
			assert.ok(element);
			assert.strictEqual(1, renderer.getSurfaceContent.callCount);

			var args = renderer.getSurfaceContent.args[0];
			assert.strictEqual(component.id, args[0].surfaceElementId);
			assert.ok(args[1], 'Should pass the opt_skipContents param as true');
		});

		it('should call getSurfaceContent with opt_skipContents set to false when rendering', function() {
			var TestComponent = createTestComponentClass();
			component = new TestComponent();
			var renderer = component.getRenderer();

			var element = component.element;
			assert.ok(element);

			sinon.spy(renderer, 'getSurfaceContent');
			component.render();
			assert.strictEqual(1, renderer.getSurfaceContent.callCount);

			var args = renderer.getSurfaceContent.args[0];
			assert.strictEqual(component.id, args[0].surfaceElementId);
			assert.ok(!args[1], 'Should not pass the opt_skipContents param as true');
		});
	});

	describe('Main Element', function() {
		it('should build component element as a simple div by default', function() {
			var TestComponent = createTestComponentClass();
			component = new TestComponent();
			assert.strictEqual('DIV', component.element.tagName);
		});

		it('should build element according to the value of the component\'s ELEMENT_TAG_NAME', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.ELEMENT_TAG_NAME = 'span';

			component = new TestComponent();
			assert.strictEqual('SPAN', component.element.tagName);
		});

		it('should build element according to the component\'s inherited ELEMENT_TAG_NAME', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.ELEMENT_TAG_NAME = 'span';

			class TestComponent2 extends TestComponent {
			}

			component = new TestComponent2();
			assert.strictEqual('SPAN', component.element.tagName);
		});

		it('should build element from the root surface content if id is included', function() {
			var TestComponent = createTestComponentClass({
				main: '<mycomp id="main" data-foo="foo"></mycomp>'
			});

			var component = new TestComponent({
				id: 'main'
			});

			assert.strictEqual('MYCOMP', component.element.tagName);
			assert.strictEqual('foo', component.element.getAttribute('data-foo'));
		});

		it('should not build element from the root surface content if id is not included', function() {
			var TestComponent = createTestComponentClass({
				main: '<mycomp data-foo="foo"></mycomp>'
			});
			var component = new TestComponent({
				id: 'main'
			});

			assert.strictEqual('DIV', component.element.tagName);
			assert.ok(!component.element.hasAttribute('data-foo'));
		});

		it('should build element from root surface\'s main element, without its children', function() {
			var TestComponent = createTestComponentClass({
				main: '<mycomp id="main">Content Here</mycomp>'
			});
			var component = new TestComponent({
				id: 'main'
			});

			assert.strictEqual('MYCOMP', component.element.tagName);
			assert.strictEqual(0, component.element.childNodes.length);
		});

		it('should ignore ELEMENT_TAG_NAME when root surface content can build element', function() {
			var TestComponent = createTestComponentClass({
				main: '<mycomp id="main" data-foo="foo"></mycomp>'
			});
			TestComponent.ELEMENT_TAG_NAME = 'span';

			var component = new TestComponent({
				id: 'main'
			});

			assert.strictEqual('MYCOMP', component.element.tagName);
		});
	});

	describe('Render', function() {
		it('should render the content defined by the root surface on the component', function() {
			var TestComponent = createTestComponentClass({
				main: '<span id="main">My content</span>'
			});

			var component = new TestComponent({
				id: 'main'
			}).render();

			assert.strictEqual('SPAN', component.element.tagName);
			assert.strictEqual('My content', component.element.innerHTML);
		});

		it('should render the content defined by all surfaces on the component', function() {
			var TestComponent = createTestComponentClass({
				main: '<span id="main">%%%%~s-main-s1~%%%%</span>',
				'main-s1': '<div id="main-s1">%%%%~s-main-ss1~%%%%%%%%~s-main-ss2~%%%%</div>',
				'main-ss1': '<span id="main-ss1">Sub Surface 1</span>',
				'main-ss2': '<span id="main-ss2">Sub Surface 2</span>'
			});

			var component = new TestComponent({
				id: 'main'
			}).render();

			var expectedContent = '<div id="main-s1">' +
				'<span id="main-ss1">Sub Surface 1</span>' +
				'<span id="main-ss2">Sub Surface 2</span>' +
				'</div>';
			assert.strictEqual(expectedContent, component.element.innerHTML);
		});

		it('should warn if tag from given element is different from the one returned by the renderer', function() {
			sinon.stub(console, 'error');

			var TestComponent = createTestComponentClass({
				main: '<span id="main"></span>'
			});

			var component = new TestComponent({
				id: 'main',
				element: document.createElement('div')
			}).render();

			assert.strictEqual('DIV', component.element.tagName);
			assert.strictEqual(1, console.error.callCount);
		});

		it('should override existing content from the main element', function() {
			var frag = dom.buildFragment('<div id="main"><div>Inner Content</div></div>');
			var element = frag.childNodes[0];
			var originalContent = element.childNodes[0];

			var TestComponent = createTestComponentClass({
				main: '<div id="main"><div>Inner Content</div></div>'
			});

			var component = new TestComponent({
				element: element
			}).render();
			assert.notStrictEqual(originalContent, component.element.childNodes[0]);
		});
	});

	describe('Decorate', function() {
		it('should not override content when component is decorated and html is correct', function() {
			var frag = dom.buildFragment('<div id="main"><div>Inner Content</div></div>');
			var element = frag.childNodes[0];
			var originalContent = element.childNodes[0];

			var TestComponent = createTestComponentClass({
				main: '<div id="main"><div>Inner Content</div></div>'
			});

			var component = new TestComponent({
				element: element
			}).decorate();
			assert.strictEqual(originalContent, component.element.childNodes[0]);
		});

		it('should override content when component is decorated and html is not correct', function() {
			var frag = dom.buildFragment('<div id="main"><div>Original Content</div></div>');
			var element = frag.childNodes[0];
			var originalContent = element.childNodes[0];

			var TestComponent = createTestComponentClass({
				main: '<div id="main"><span>New Content</span></div>'
			});

			var component = new TestComponent({
				element: element
			}).decorate();
			assert.notStrictEqual(originalContent, component.element.childNodes[0]);
		});

		it('should not rerender surfaces when component is decorated and html is correct', function() {
			var frag = dom.buildFragment('<div id="main"><div id="main-s1">Surface Content</div></div>');
			var element = frag.childNodes[0];
			var surfaceElement = element.childNodes[0];

			var TestComponent = createTestComponentClass({
				main: '<div id="main">%%%%~s-main-s1~%%%%</div>',
				'main-s1': '<div id="main-s1">Surface Content</div>'
			});

			var component = new TestComponent({
				element: element
			}).decorate();
			assert.strictEqual(surfaceElement, component.getRenderer().getSurfaceElement('main-s1'));
		});

		it('should rerender surfaces when component is decorated and main content html is not correct', function() {
			var frag = dom.buildFragment('<div id="main">wrong<div id="main-s1">Surface Content</div></div>');
			var element = frag.childNodes[0];
			var surfaceElement = element.childNodes[0];

			var TestComponent = createTestComponentClass({
				main: '<div id="main">%%%%~s-main-s1~%%%%</div>',
				'main-s1': '<div id="main-s1">Surface Content</div>'
			});

			var component = new TestComponent({
				element: element
			}).decorate();
			assert.notStrictEqual(surfaceElement, component.getRenderer().getSurfaceElement('main-s1'));
		});

		it('should rerender surfaces when component is decorated and surface html is not correct', function() {
			var frag = dom.buildFragment('<div id="main"><div id="main-s1">Wrong Content</div></div>');
			var element = frag.childNodes[0];
			var surfaceElement = element.childNodes[0];

			var TestComponent = createTestComponentClass({
				main: '<div id="main">%%%%~s-main-s1~%%%%</div>',
				'main-s1': '<div id="main-s1">Surface Content</div>'
			});

			var component = new TestComponent({
				element: element
			}).decorate();
			assert.notStrictEqual(surfaceElement, component.getRenderer().getSurfaceElement('main-s1'));
		});
	});

	describe('Surfaces', function() {
		it('should add a surface for the main element automatically', function() {
			var TestComponent = createTestComponentClass();
			component = new TestComponent();
			var surfaces = component.getRenderer().getSurfaces();

			assert.strictEqual(1, Object.keys(surfaces).length);
			assert.ok(surfaces[component.id]);
		});

		it('should aggregate surfaces hierarchically from static hint', function() {
			var ParentComponent = createTestComponentClass();
			ParentComponent.SURFACES = {
				header: {},
				bottom: {}
			};

			class ChildComponent extends ParentComponent {
			}
			ChildComponent.SURFACES = {
				content: {}
			};

			var child = new ChildComponent();
			var renderer = child.getRenderer();
			assert.deepEqual(['bottom', 'content', 'header', child.id], Object.keys(renderer.getSurfaces()).sort());
		});

		it('should dynamically add surfaces', function() {
			var CustomComponent = createTestComponentClass();
			var custom = new CustomComponent();
			var renderer = custom.getRenderer();

			var headerSurfaceConfig = {};
			renderer.addSurface('header', headerSurfaceConfig);
			renderer.addSurface('bottom');
			assert.strictEqual(headerSurfaceConfig, renderer.getSurface('header'));
			assert.deepEqual(['bottom', 'header', custom.id], Object.keys(renderer.getSurfaces()).sort());
			assert.strictEqual(null, renderer.getSurface('unknown'));
		});

		it('should not share same surface config object between instances', function() {
			var CustomComponent = createTestComponentClass();
			CustomComponent.SURFACES = {
				header: {}
			};

			var renderer1 = new CustomComponent().getRenderer();
			var renderer2 = new CustomComponent().getRenderer();

			assert.ok(renderer1.getSurface('header') !== renderer2.getSurface('header'));
		});

		it('should have information about child and parent surfaces on surface object', function() {
			var CustomComponent = createTestComponentClass({
				main: '%%%%~s-main-foo~%%%%',
				'main-foo': '%%%%~s-main-nestedFoo~%%%%',
				'main-nestedFoo': 'Nested'
			});

			var custom = new CustomComponent({
				id: 'main'
			}).render();
			var renderer = custom.getRenderer();

			assert.deepEqual(['main-nestedFoo'], renderer.getSurface('foo').children);
			assert.strictEqual('main', renderer.getSurface('foo').parent);
			assert.deepEqual([], renderer.getSurface('nestedFoo').children);
			assert.strictEqual('main-foo', renderer.getSurface('nestedFoo').parent);
		});

		it('should create surface placeholders through the buildPlaceholder function', function() {
			var CustomComponent = createTestComponentClass({
				custom: comp => {
					var placeholer1 = comp.getRenderer().buildPlaceholder('custom-foo', {
						renderAttrs: ['foo', 'bar']
					});
					var placeholer2 = comp.getRenderer().buildPlaceholder();
					return placeholer1 + placeholer2;
				}
			});

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			var renderer = custom.getRenderer();

			assert.deepEqual(['foo', 'bar'], renderer.getSurface('foo').renderAttrs);
			assert.ok(renderer.getSurface('s1'));
		});

		it('should remove surface and its element from dom', function() {
			var CustomComponent = createTestComponentClass({
				custom: '%%%%~s-custom-header~%%%%',
			});

			var custom = new CustomComponent({
				id: 'custom'
			}).render();
			var renderer = custom.getRenderer();

			renderer.removeSurface('header');
			assert.strictEqual(null, renderer.getSurface('header'));
			assert.strictEqual(null, renderer.getSurfaceElement('header'));
			assert.strictEqual(null, document.getElementById('custom-header'));
			assert.doesNotThrow(function() {
				renderer.removeSurface('header');
			});
		});

		it('should remove surfaces from collector when component is disposed', function() {
			var CustomComponent = createTestComponentClass();
			var custom = new CustomComponent({
				id: 'custom'
			});
			var renderer = custom.getRenderer();
			renderer.addSurface('header');

			assert.ok(SurfaceRenderer.surfacesCollector.getSurface('custom-header'));
			custom.dispose();
			assert.ok(!SurfaceRenderer.surfacesCollector.getSurface('custom-header'));
		});

		it('should return renderer instance from surface methods', function() {
			var CustomComponent = createTestComponentClass();
			var custom = new CustomComponent();
			var renderer = custom.getRenderer();

			assert.strictEqual(renderer, renderer.addSurface('header'));
			assert.strictEqual(renderer, renderer.addSurfaces({}));
			assert.strictEqual(renderer, renderer.removeSurface('header'));
		});

		describe('Render Attributes', function() {
			it('should automatically create attrs from render attrs of added surfaces', function() {
				var CustomComponent = createTestComponentClass();
				var custom = new CustomComponent();
				custom.getRenderer().addSurfaces({
					header: {
						renderAttrs: ['headerContent', 'fontSize']
					}
				});
				assert.deepEqual({}, custom.getAttrConfig('headerContent'));
				assert.deepEqual({}, custom.getAttrConfig('fontSize'));
			});

			it('should automatically create attrs from render attrs from SURFACES static variable', function() {
				var CustomComponent = createTestComponentClass();
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
				var CustomComponent = createTestComponentClass();
				var custom = new CustomComponent();
				var headerContentConfig = {
					value: 'My Header Content'
				};
				custom.addAttr('headerContent', headerContentConfig);
				custom.getRenderer().addSurfaces({
					header: {
						renderAttrs: ['headerContent', 'fontSize']
					}
				});
				assert.strictEqual(headerContentConfig, custom.getAttrConfig('headerContent'));
				assert.deepEqual({}, custom.getAttrConfig('fontSize'));
			});

			it('should rerender surfaces when the values of their render attributes change', function(done) {
				var TestComponent = createTestComponentClass({
					main: '<span id="main">%%%%~s-main-foo~%%%%</span>',
					'main-foo': comp => comp.foo + comp.bar
				});
				TestComponent.SURFACES = {
					foo: {
						renderAttrs: ['foo', 'bar']
					}
				};

				var component = new TestComponent({
					id: 'main',
					foo: 'foo',
					bar: 'bar'
				}).render();
				var fooSurface = component.getRenderer().getSurfaceElement('main-foo');
				assert.strictEqual('foobar', fooSurface.textContent);

				component.foo = 'bar';
				component.bar = 'foo';
				component.once('attrsSynced', function() {
					assert.strictEqual('barfoo', fooSurface.textContent);
					done();
				});
			});

			it('should rerender surface when render attrs that were added later change', function(done) {
				var CustomComponent = createTestComponentClass({
					main: '%%%%~s-main-foo~%%%%',
					'main-foo': comp => comp.foo
				});

				var custom = new CustomComponent({
					id: 'main'
				});
				var renderer = custom.getRenderer();
				renderer.addSurface('foo');
				custom.render();

				renderer.addSurface('foo', {
					renderAttrs: ['foo']
				});
				custom.foo = 'foo';
				custom.once('attrsChanged', function() {
					assert.strictEqual('foo', renderer.getSurfaceElement('foo').textContent);
					done();
				});
			});

			it('should rerender element content when its render attrs change', function(done) {
				var CustomComponent = createTestComponentClass({
					main: comp => {
						comp.getRenderer().addSurface(comp.id, {
							renderAttrs: ['foo']
						});
						return '<div>' + comp.foo + '</div>';
					}
				});

				var custom = new CustomComponent({
					id: 'main',
					foo: 'foo'
				}).render();

				assert.strictEqual('foo', custom.element.textContent);
				custom.foo = 'bar';
				custom.once('attrsSynced', function() {
					assert.strictEqual('bar', custom.element.textContent);
					done();
				});
			});

			it('should not rerender surface twice if both it and its parent change with render attrs', function(done) {
				var CustomComponent = createTestComponentClass({
					main: '%%%%~s-main-foo~%%%%',
					'main-foo': comp => comp.foo + '%%%%~s-main-nestedFoo~%%%%',
					'main-nestedFoo': comp => comp.foo
				});
				CustomComponent.SURFACES = {
					foo: {
						renderAttrs: ['foo']
					},
					nestedFoo: {
						renderAttrs: ['foo']
					}
				};

				var custom = new CustomComponent({
					id: 'main'
				}).render();
				var renderer = custom.getRenderer();
				sinon.spy(renderer, 'getSurfaceContent');

				custom.foo = 'bar';
				custom.once('attrsSynced', function() {
					assert.strictEqual(2, renderer.getSurfaceContent.callCount);
					assert.strictEqual('main-foo', renderer.getSurfaceContent.args[0][0].surfaceElementId);
					assert.strictEqual('main-nestedFoo', renderer.getSurfaceContent.args[1][0].surfaceElementId);
					done();
				});
			});

			it('should not rerender surfaces the value of non-render attributes change', function(done) {
				var TestComponent = createTestComponentClass({
					main: '<span id="main">%%%%~s-main-foo~%%%%</span>',
					'main-foo': '<div>foo</div>'
				});
				TestComponent.ATTRS = {
					foo: {}
				};

				var component = new TestComponent({
					id: 'main',
					foo: 'foo'
				}).render();
				var renderer = component.getRenderer();
				var child = renderer.getSurfaceElement('main-foo').childNodes[0];

				component.foo = 'bar';
				component.once('attrsSynced', function() {
					assert.strictEqual(child, renderer.getSurfaceElement('main-foo').childNodes[0]);
					done();
				});
			});

			it('should not rerender surface when its render attrs change but content stays the same', function(done) {
				var CustomComponent = createTestComponentClass({
					main: '%%%%~s-main-oddsOrEven~%%%%',
					'main-oddsOrEven': comp => {
						return comp.number % 2 === 0 ? 'Even' : 'Odds';
					}
				});
				var custom = new CustomComponent({
					id: 'main',
					number: 2
				});
				var renderer = custom.getRenderer();
				renderer.addSurface('oddsOrEven', {
					renderAttrs: ['number']
				});
				custom.render();

				var initialContent = renderer.getSurfaceElement('oddsOrEven').childNodes[0];
				custom.number = 4;
				custom.once('attrsChanged', function() {
					assert.strictEqual(initialContent, renderer.getSurfaceElement('oddsOrEven').childNodes[0]);
					done();
				});
			});

			it('should rerender surface even when content doesn\'t change if its cache was cleared', function(done) {
				var CustomComponent = createTestComponentClass({
					main: '%%%%~s-main-foo~%%%%',
					'main-foo': 'Same Content'
				});
				CustomComponent.SURFACES = {
					foo: {
						renderAttrs: ['foo']
					}
				};

				var custom = new CustomComponent({
					id: 'main'
				}).render();
				var renderer = custom.getRenderer();

				renderer.clearSurfaceCache('foo');
				var surfaceContent = renderer.getSurfaceElement('foo').childNodes[0];
				custom.foo = 1;
				custom.once('attrsChanged', function() {
					assert.notStrictEqual(surfaceContent, renderer.getSurfaceElement('foo').childNodes[0]);
					done();
				});
			});

			it('should not rerender surface even when content changes if surface is static', function(done) {
				var CustomComponent = createTestComponentClass({
					main: '%%%%~s-main-foo~%%%%',
					'main-foo': comp => comp.foo
				});
				CustomComponent.SURFACES = {
					foo: {
						renderAttrs: ['foo'],
						static: true
					}
				};
				var custom = new CustomComponent({
					id: 'main',
					foo: 'foo'
				}).render();
				var renderer = custom.getRenderer();

				var surfaceContent = renderer.getSurfaceElement('foo').childNodes[0];
				assert.strictEqual('foo', surfaceContent.textContent);

				custom.foo = 'bar';
				custom.once('attrsChanged', function() {
					assert.strictEqual(surfaceContent, renderer.getSurfaceElement('foo').childNodes[0]);
					done();
				});
			});

			it('should automatically remove unused surfaces after repaint', function(done) {
				var CustomComponent = createTestComponentClass({
					main: '%%%%~s-main-foo~%%%%',
					'main-foo': comp => {
						var content = '';
						for (var i = 0; i < comp.count; i++) {
							content += `%%%%~s-main-s${i}~%%%%`;
						}
						return content;
					}
				});
				CustomComponent.SURFACES = {
					foo: {
						renderAttrs: ['count']
					}
				};

				var custom = new CustomComponent({
					id: 'main',
					count: 3
				}).render();
				var renderer = custom.getRenderer();
				assert.ok(renderer.getSurface('s0'));
				assert.ok(renderer.getSurface('s1'));
				assert.ok(renderer.getSurface('s2'));

				custom.count = 1;
				custom.once('attrsChanged', function() {
					assert.ok(renderer.getSurface('s0'));
					assert.ok(!renderer.getSurface('s1'));
					assert.ok(!renderer.getSurface('s2'));
					done();
				});
			});
		});

		describe('Surface Element', function() {
			it('should use div as the default tagName for surface elements', function() {
				var CustomComponent = createTestComponentClass();
				var custom = new CustomComponent();
				var renderer = custom.getRenderer();

				renderer.addSurface('header');
				custom.render();
				assert.strictEqual('div', renderer.getSurfaceElement('header').tagName.toLowerCase());
			});

			it('should overwrite surface element tagName via SURFACE_TAG_NAME static hint', function() {
				var CustomComponent = createTestComponentClass();
				CustomComponent.SURFACE_TAG_NAME = 'span';

				var custom = new CustomComponent();
				var renderer = custom.getRenderer();

				renderer.addSurface('header');
				custom.render();
				assert.strictEqual('span', renderer.getSurfaceElement('header').tagName.toLowerCase());
			});

			it('should use first defined SURFACE_TAG_NAME static hint', function() {
				var CustomComponent = createTestComponentClass();
				CustomComponent.SURFACE_TAG_NAME = 'span';

				class ChildComponent extends CustomComponent {
				}
				var custom = new ChildComponent();
				var renderer = custom.getRenderer();

				renderer.addSurface('header');
				custom.render();
				assert.strictEqual('span', renderer.getSurfaceElement('header').tagName.toLowerCase());
			});

			it('should use the surface\'s content\'s root element if it has the surface id', function() {
				var CustomComponent = createTestComponentClass({
					main: '%%%%~s-main-header~%%%%%%%%~s-main-bottom~%%%%',
					'main-header': '<header id="main-header" class="testHeader" data-foo="foo"></header>',
					'main-bottom': '<bottom id="main-bottom" class="testBottom" data-bar="bar"></bottom>'
				});

				var custom = new CustomComponent({
					id: 'main'
				});
				var renderer = custom.getRenderer();
				renderer.addSurface('header');
				renderer.addSurface('bottom');
				custom.render();

				var headerElement = renderer.getSurfaceElement('header');
				var bottomElement = renderer.getSurfaceElement('bottom');
				assert.strictEqual('HEADER', headerElement.tagName);
				assert.strictEqual('testHeader', headerElement.className);
				assert.strictEqual('foo', headerElement.getAttribute('data-foo'));
				assert.strictEqual('BOTTOM', bottomElement.tagName);
				assert.strictEqual('testBottom', bottomElement.className);
				assert.strictEqual('bar', bottomElement.getAttribute('data-bar'));
			});

			it('should replace surface element if its definition in the surface\'s content changes', function(done) {
				var CustomComponent = createTestComponentClass({
					main: '%%%%~s-main-dynamic~%%%%',
					'main-dynamic': comp => {
						return '<' + comp.tag + ' id="main-dynamic"></' + comp.tag + '>';
					}
				});
				CustomComponent.SURFACES = {
					dynamic: {
						renderAttrs: ['tag']
					}
				};

				var custom = new CustomComponent({
					id: 'main',
					tag: 'div'
				}).render();
				var renderer = custom.getRenderer();

				var surfaceElement = renderer.getSurfaceElement('dynamic');
				assert.strictEqual('DIV', surfaceElement.tagName);

				custom.tag = 'span';
				custom.once('attrsChanged', function() {
					var newSurfaceElement = renderer.getSurfaceElement('dynamic');
					assert.notStrictEqual(surfaceElement, newSurfaceElement);
					assert.strictEqual('SPAN', newSurfaceElement.tagName);
					done();
				});
			});

			it('should only create surface element if it hasn\'t been created before', function() {
				var CustomComponent = createTestComponentClass();
				CustomComponent.SURFACES = {
					header: {}
				};

				var custom = new CustomComponent();
				var renderer = custom.getRenderer();
				var surface = renderer.getSurfaceElement('header');

				assert.ok(surface);
				assert.strictEqual(surface, renderer.getSurfaceElement('header'));
			});

			it('should get surface element from the document when it exists', function() {
				dom.enterDocument(dom.buildFragment(
					'<div id="custom"><div id="custom-header"></div></div>'
				));
				var surface = document.querySelector('#custom-header');

				var CustomComponent = createTestComponentClass();
				CustomComponent.SURFACES = {
					header: {}
				};
				var custom = new CustomComponent({
					element: '#custom'
				});

				assert.strictEqual(surface, custom.getRenderer().getSurfaceElement('header'));
			});

			it('should return null when element is requested for unknown surface', function() {
				var CustomComponent = createTestComponentClass();
				var custom = new CustomComponent().render();
				assert.strictEqual(null, custom.getRenderer().getSurfaceElement('unknown'));
			});
		});

		describe('Event - renderSurface', function() {
			it('should emit "renderSurface" event for the main component surface on render', function() {
				var CustomComponent = createTestComponentClass();
				var custom = new CustomComponent();

				var listener = sinon.stub();
				custom.getRenderer().on('renderSurface', listener);
				custom.render();

				assert.strictEqual(1, listener.callCount);
				assert.deepEqual(custom.id, listener.args[0][0].surfaceId);
			});

			it('should emit "renderSurface" event for each surface that will be rendered on attr change', function(done) {
				var CustomComponent = createTestComponentClass({
					main: '%%%%~s-main-header~%%%%%%%%~s-main-body~%%%%%%%%~s-main-bottom~%%%%'
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
				var custom = new CustomComponent({
					id: 'main'
				}).render();

				var listener = sinon.stub();
				custom.getRenderer().on('renderSurface', listener);

				custom.foo = 2;
				custom.once('attrsChanged', function() {
					assert.strictEqual(2, listener.callCount);
					var surfaceIds = [listener.args[0][0].surfaceId, listener.args[1][0].surfaceId];
					assert.deepEqual(['bottom', 'header'], surfaceIds.sort());
					done();
				});
			});

			it('should not render surfaces that had their "renderSurface" event prevented', function(done) {
				var CustomComponent = createTestComponentClass({
					main: '%%%%~s-main-header~%%%%%%%%~s-main-bottom~%%%%',
					'main-header': comp => comp.foo,
					'main-bottom': comp => comp.foo
				});
				CustomComponent.SURFACES = {
					header: {
						renderAttrs: ['foo']
					},
					bottom: {
						renderAttrs: ['foo']
					}
				};
				var custom = new CustomComponent({
					id: 'main'
				}).render();
				var renderer = custom.getRenderer();

				renderer.on('renderSurface', function(data, event) {
					if (data.surfaceId === 'header') {
						event.preventDefault();
					}
				});

				custom.foo = 'foo';
				custom.once('attrsChanged', function() {
					assert.strictEqual('foo', renderer.getSurfaceElement('bottom').textContent);
					assert.strictEqual('', renderer.getSurfaceElement('header').textContent);
					done();
				});
			});
		});

		describe('Subcomponent Surfaces', function() {
			var ChildComponent;

			beforeEach(function() {
				ChildComponent = createTestComponentClass();
				ChildComponent.ATTRS = {
					foo: {}
				};
				ComponentRegistry.register(ChildComponent, 'ChildComponent');
			});

			it('should render sub component from surface', function() {
				var CustomComponent = createTestComponentClass({
					custom: '%%%%~s-child~%%%%'
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
				assert.strictEqual(child.element, custom.getRenderer().getSurfaceElement('child'));
			});

			it('should get element for component surface', function() {
				var CustomComponent = createTestComponentClass();
				var custom = new CustomComponent();
				var renderer = custom.getRenderer();

				renderer.addSurface('comp', {
					componentName: 'ChildComponent'
				});
				assert.strictEqual(
					custom.components.comp.element,
					renderer.getSurfaceElement('comp')
				);
			});

			it('should return null when getting element of component surface for component that isn\'t registered', function() {
				var CustomComponent = createTestComponentClass();
				var custom = new CustomComponent();
				var renderer = custom.getRenderer();

				renderer.addSurface('comp', {
					componentName: 'ChildComponent'
				});
				Component.componentsCollector.removeComponent(custom.components.comp);
				assert.ok(!renderer.getSurfaceElement('comp'));
			});

			it('should render sub component\'s content according to its renderer', function() {
				ChildComponent.RENDERER.prototype.getSurfaceContent = function() {
					return '<child id="child" data-foo="foo">Child Content</child>';
				};

				var CustomComponent = createTestComponentClass({
					custom: '%%%%~s-child~%%%%'
				});
				CustomComponent.SURFACES = {
					child: {
						componentName: 'ChildComponent'
					}
				};

				var custom = new CustomComponent({
					id: 'custom'
				}).render();

				var child = custom.components.child;
				assert.strictEqual('CHILD', child.element.tagName);
				assert.strictEqual('foo', child.element.getAttribute('data-foo'));
				assert.strictEqual('Child Content', child.element.textContent);
			});

			it('should render sub component that has hifen on id', function() {
				var CustomComponent = createTestComponentClass({
					custom: '%%%%~s-my-child~%%%%'
				});
				CustomComponent.SURFACES = {
					'my-child': {
						componentName: 'ChildComponent'
					}
				};

				var custom = new CustomComponent({
					id: 'custom'
				}).render();

				var child = custom.components['my-child'];
				assert.ok(child);
				assert.strictEqual(child.element, custom.element.querySelector('#my-child'));
			});

			it('should create sub component from placeholder passing defined config data', function() {
				var CustomComponent = createTestComponentClass({
					custom: comp => {
						return comp.getRenderer().buildPlaceholder('child', {
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

				var child = custom.components.child;
				assert.ok(child);
				assert.strictEqual(child.element, custom.element.querySelector('#child'));
				assert.strictEqual('foo', child.foo);
			});

			it('should update existing component from placeholder', function(done) {
				var CustomComponent = createTestComponentClass({
					custom: '%%%%~s-custom-foo~%%%%',
					'custom-foo': comp => {
						return comp.getRenderer().buildPlaceholder('child', {
							componentData: {
								foo: comp.foo
							},
							componentName: 'ChildComponent'
						});
					}
				});
				CustomComponent.SURFACES = {
					foo: {
						renderAttrs: ['foo']
					}
				};

				var custom = new CustomComponent({
					foo: 'foo',
					id: 'custom'
				}).render();
				var child = custom.components.child;
				assert.strictEqual('foo', child.foo);

				custom.foo = 'bar';
				child.once('attrsChanged', function() {
					assert.strictEqual('bar', child.foo);
					done();
				});
			});

			it('should reposition previously rendered component instances', function(done) {
				var CustomComponent = createTestComponentClass({
					custom: '%%%%~s-custom-invert~%%%%',
					'custom-invert': comp => {
						if (comp.invert) {
							return '%%%%~s-child2~%%%%%%%%~s-child1~%%%%';
						} else {
							return '%%%%~s-child1~%%%%%%%%~s-child2~%%%%';
						}
					}
				});
				CustomComponent.SURFACES = {
					child1: {
						componentName: 'ChildComponent'
					},
					child2: {
						componentName: 'ChildComponent'
					},
					invert: {
						renderAttrs: ['invert']
					}
				};

				var custom = new CustomComponent({
					id: 'custom'
				}).render();
				var child1 = custom.components.child1;
				var child2 = custom.components.child2;
				var childElements = custom.element.querySelectorAll('.component');
				assert.strictEqual(childElements[0], child1.element);
				assert.strictEqual(childElements[1], child2.element);

				custom.invert = true;
				custom.once('attrsSynced', function() {
					childElements = custom.element.querySelectorAll('.component');
					assert.strictEqual(childElements[0], child2.element);
					assert.strictEqual(childElements[1], child1.element);
					done();
				});
			});

			it('should correctly position sub component even if its element had already been set', function() {
				var CustomComponent = createTestComponentClass({
					custom: '%%%%~s-child~%%%%'
				});
				CustomComponent.SURFACES = {
					child: {
						componentName: 'ChildComponent'
					}
				};

				var childElement = document.createElement('div');
				ChildComponent.prototype.created_ = function() {
					Component.prototype.created_.call(this);
					this.element = childElement;
				};

				var custom = new CustomComponent({
					id: 'custom'
				}).render();

				var child = custom.components.child;
				assert.ok(child);
				assert.strictEqual(child.element, childElement);
				assert.strictEqual(child.element, custom.element.querySelector('#child'));
				assert.ok(!child.element.querySelector('#child'));
			});

			it('should render nested component correctly when element is not on document', function() {
				var CustomComponent = createTestComponentClass({
					custom: '%%%%~s-child~%%%%'
				});
				CustomComponent.SURFACES = {
					child: {
						componentName: 'ChildComponent'
					}
				};

				var element = document.createElement('div');
				var custom = new CustomComponent({
					id: 'custom'
				}).render(element);

				var child = custom.components.child;
				assert.ok(child);
				assert.strictEqual(ChildComponent, child.constructor);
				assert.strictEqual(custom.element.querySelector('#child'), child.element);
			});

			it('should create sub components when parent is decorated', function() {
				var frag = dom.buildFragment('<div id="custom"><div id="child"></div></div>');
				dom.enterDocument(frag);
				var childElement = document.getElementById('child');

				var CustomComponent = createTestComponentClass({
					custom: '<div id="custom">%%%%~s-child~%%%%</div>'
				});
				CustomComponent.SURFACES = {
					child: {
						componentName: 'ChildComponent'
					}
				};

				var custom = new CustomComponent({
					element: '#custom'
				}).decorate();

				var child = custom.components.child;
				assert.ok(child);
				assert.strictEqual(child.element, custom.element.querySelector('#child'));
				assert.strictEqual(childElement, child.element);
			});

			it('should update sub components when parent is decorated and html is not correct', function() {
				var frag = dom.buildFragment('<div id="custom"><div id="child">wrong</div></div>');
				dom.enterDocument(frag);
				var childElement = document.getElementById('child');

				var CustomComponent = createTestComponentClass({
					custom: '<div id="custom">%%%%~s-child~%%%%</div>'
				});
				CustomComponent.SURFACES = {
					child: {
						componentName: 'ChildComponent'
					}
				};

				var custom = new CustomComponent({
					element: '#custom'
				}).decorate();
				assert.notStrictEqual(childElement, custom.components.child.element);
			});

			it('should automatically dispose unused sub components after repaint', function(done) {
				var CustomComponent = createTestComponentClass({
					custom: '%%%%~s-custom-count~%%%%',
					'custom-count': comp => {
						var content = '';
						for (var i = 0; i < comp.count; i++) {
							content += comp.getRenderer().buildPlaceholder('comp' + i, {
								componentName: 'ChildComponent'
							});
						}
						return content;
					}
				});
				CustomComponent.SURFACES = {
					count: {
						renderAttrs: ['count']
					}
				};

				var custom = new CustomComponent({
					count: 3,
					id: 'custom'
				}).render();
				var comps = object.mixin({}, custom.components);
				assert.strictEqual(3, Object.keys(comps).length);

				custom.count = 1;
				custom.once('attrsChanged', function() {
					assert.ok(custom.components.comp0);
					assert.ok(!custom.components.comp1);
					assert.ok(!custom.components.comp2);
					assert.ok(!comps.comp0.isDisposed());
					assert.ok(comps.comp1.isDisposed());
					assert.ok(comps.comp2.isDisposed());
					done();
				});
			});
		});

		describe('Element Extended Content', function() {
			it('should return whole content HTML when "getElementExtendedContent" is called', function() {
				var CustomComponent = createTestComponentClass({
					custom: '%%%%~s-custom-header~%%%%',
					'custom-header': 'Header'
				});
				var custom = new CustomComponent({
					id: 'custom'
				}).render();

				assert.strictEqual(
					'<div id="custom-header">Header</div>',
					custom.getRenderer().getElementExtendedContent()
				);
			});

			it('should return empty string if "getElementExtendedContent" is called but content wasn\'t defined', function() {
				var CustomComponent = createTestComponentClass();
				var custom = new CustomComponent().render();
				assert.strictEqual('', custom.getRenderer().getElementExtendedContent());
			});
		});

		describe('Generated Ids', function() {
			it('should render surfaces with generated ids', function() {
				var CustomComponent = createTestComponentClass({
					custom: '%%%%~s~%%%%',
					'custom-s1': '%%%%~s~%%%%%%%%~s~%%%%'
				});

				var custom = new CustomComponent({
					id: 'custom'
				}).render();
				assert.strictEqual(1, custom.element.childNodes.length);

				var renderer = custom.getRenderer();
				var s1 = renderer.getSurfaceElement('s1');
				assert.strictEqual(custom.element.childNodes[0], s1);
				assert.strictEqual(2, s1.childNodes.length);
				assert.strictEqual(s1.childNodes[0], renderer.getSurfaceElement('s1-s1'));
				assert.strictEqual(s1.childNodes[1], renderer.getSurfaceElement('s1-s2'));
			});
		});

		it('should update only the surface with generated id when its content were the only one changed', function(done) {
			var CustomComponent = createTestComponentClass({
				custom: '%%%%~s~%%%%',
				'custom-s1': '<div class="s1">%%%%~s~%%%%%%%%~s~%%%%</div>',
				'custom-s1-s1': comp => '<div class="s1S1">' + comp.foo + '</div>',
				'custom-s1-s2': '<div class="s1S2">Fixed</div>'
			});
			CustomComponent.SURFACES = {
				's1-s1': {
					renderAttrs: ['foo']
				}
			};

			var custom = new CustomComponent({
				foo: 'foo',
				id: 'custom'
			}).render();
			var s1 = custom.element.querySelector('.s1');
			var s1S1 = custom.element.querySelector('.s1S1');
			var s1S2 = custom.element.querySelector('.s1S2');

			custom.foo = 'bar';
			custom.on('attrsChanged', function() {
				assert.strictEqual(s1, custom.element.querySelector('.s1'));
				assert.strictEqual(s1S2, custom.element.querySelector('.s1S2'));
				assert.notStrictEqual(s1S1, custom.element.querySelector('.s1S1'));
				assert.strictEqual('bar', custom.element.querySelector('.s1S1').textContent);
				done();
			});
		});
	});

	describe('Inline Events', function() {
		it('should attach listeners from element content', function() {
			var CustomComponent = createTestComponentClass({
				main: '<button class="elementButton" data-onclick="handleClick"></button>'
			});
			CustomComponent.prototype.handleClick = sinon.stub();

			var comp = new CustomComponent({
				id: 'main'
			}).render();
			var button = comp.element.querySelector('.elementButton');
			dom.triggerEvent(button, 'click');
			assert.strictEqual(1, comp.handleClick.callCount);
		});

		it('should attach listeners from element tag', function() {
			var CustomComponent = createTestComponentClass({
				main: '<div id="main" data-onclick="handleClick"></div>'
			});
			CustomComponent.prototype.handleClick = sinon.stub();

			var custom = new CustomComponent({
				id: 'main'
			}).render();
			dom.triggerEvent(custom.element, 'click');
			assert.strictEqual(1, custom.handleClick.callCount);
		});

		it('should attach listeners from surface content', function() {
			var CustomComponent = createTestComponentClass({
				main: '%%%%~s-main-foo~%%%%',
				'main-foo': '<button class="fooButton" data-onclick="handleClick"></button>'
			});
			CustomComponent.prototype.handleClick = sinon.stub();

			var custom = new CustomComponent({
				id: 'main'
			}).render();
			var button = custom.element.querySelector('.fooButton');
			dom.triggerEvent(button, 'click');
			assert.strictEqual(1, custom.handleClick.callCount);
		});

		it('should attach listeners from surface element tag', function() {
			var CustomComponent = createTestComponentClass({
				main: '%%%%~s-main-foo~%%%%',
				'main-foo': '<div id="main-foo" data-onclick="handleClick"></div>'
			});
			CustomComponent.prototype.handleClick = sinon.stub();

			var custom = new CustomComponent({
				id: 'main'
			}).render();
			var element = custom.element.querySelector('#main-foo');
			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, custom.handleClick.callCount);
		});

		it('should attach listeners from element content after decorating', function() {
			var CustomComponent = createTestComponentClass({
				main: '<div id="main" data-onclick="handleClick"></div>'
			});
			CustomComponent.prototype.handleClick = sinon.stub();
			dom.enterDocument(dom.buildFragment('<div id="main" data-onclick="handleClick"></div>'));

			var custom = new CustomComponent({
				element: '#main'
			}).decorate();
			dom.triggerEvent(custom.element, 'click');
			assert.strictEqual(1, custom.handleClick.callCount);
		});

		it('should attach listeners when component is rendered as sub component', function() {
			var EventsTestComponent = createTestComponentClass({
				events: '<button data-onclick="handleClick"></button>'
			});
			EventsTestComponent.prototype.handleClick = sinon.stub();
			ComponentRegistry.register(EventsTestComponent, 'EventsTestComponent');

			var CustomComponent = createTestComponentClass({
				main: '%%%%~s-events~%%%%'
			});
			CustomComponent.SURFACES = {
				events: {
					componentName: 'EventsTestComponent'
				}
			};

			var custom = new CustomComponent({
				id: 'main'
			}).render();
			var button = custom.element.querySelector('button');
			dom.triggerEvent(button, 'click');
			assert.strictEqual(1, custom.components.events.handleClick.callCount);
		});

		it('should attach listeners when component is decorated as sub component', function() {
			var EventsTestComponent = createTestComponentClass({
				events: '<button id="events" data-onclick="handleClick"></button>'
			});
			EventsTestComponent.prototype.handleClick = sinon.stub();
			ComponentRegistry.register(EventsTestComponent, 'EventsTestComponent');

			var CustomComponent = createTestComponentClass({
				main: '<div id="main">%%%%~s-events~%%%%</div>'
			});
			CustomComponent.SURFACES = {
				events: {
					componentName: 'EventsTestComponent'
				}
			};

			var content = '<div id="main"><button id="events" data-onclick="handleClick"></button></div>';
			dom.enterDocument(dom.buildFragment(content));

			var custom = new CustomComponent({
				element: '#main'
			}).decorate();
			var button = custom.element.querySelector('button');
			dom.triggerEvent(button, 'click');
			assert.strictEqual(1, custom.components.events.handleClick.callCount);
		});

		it('should detach unused listeners after surface update', function(done) {
			var CustomComponent = createTestComponentClass({
				main: '%%%%~s-main-mouseover~%%%%<div data-onclick="handleClick"></div>',
				'main-mouseover': comp => {
					return comp.mouseover ? '<div data-onmouseover="handleMouseOver"></div>' : '';
				}
			});
			CustomComponent.SURFACES = {
				mouseover: {
					renderAttrs: ['mouseover']
				}
			};
			CustomComponent.prototype.handleClick = sinon.stub();
			CustomComponent.prototype.handleMouseOver = sinon.stub();

			var custom = new CustomComponent({
				id: 'main',
				mouseover: true
			}).render();
			sinon.spy(custom.element, 'removeEventListener');
			custom.mouseover = false;
			custom.once('attrsSynced', function() {
				assert.strictEqual(1, custom.element.removeEventListener.callCount);
				assert.strictEqual('mouseover', custom.element.removeEventListener.args[0][0]);
				done();
			});
		});

		it('should detach all listeners when element is detached', function() {
			var CustomComponent = createTestComponentClass({
				main: '<div data-onclick="handleClick" data-onmouseover="handleMouseOver"></div>'
			});
			CustomComponent.prototype.handleClick = sinon.stub();
			CustomComponent.prototype.handleMouseOver = sinon.stub();

			var custom = new CustomComponent({
				id: 'main'
			}).render();
			sinon.spy(custom.element, 'removeEventListener');
			custom.detach();

			assert.strictEqual(2, custom.element.removeEventListener.callCount);
			assert.strictEqual('click', custom.element.removeEventListener.args[0][0]);
			assert.strictEqual('mouseover', custom.element.removeEventListener.args[1][0]);
		});
	});

	describe('Script tags', function() {
		afterEach(function() {
			window.testScriptEvaluated = null;
		});

		it('should evaluate script tags without src rendered by components', function(done) {
			var CustomComponent = createTestComponentClass({
				main: '<script>window.testScriptEvaluated = true</script>'
			});
			new CustomComponent({
				id: 'main'
			}).render();

			async.nextTick(function() {
				assert.ok(window.testScriptEvaluated);
				done();
			});
		});

		it('should evaluate script tags with src', function() {
			sinon.spy(globalEval, 'runScriptsInElement');
			var CustomComponent = createTestComponentClass({
				main: '<script src="test/fixtures/script.js"></script>'
			});
			new CustomComponent({
				id: 'main'
			}).render();
			assert.strictEqual(1, globalEval.runScriptsInElement.callCount);
		});

		it('should evaluate script tags with the js type', function(done) {
			var CustomComponent = createTestComponentClass({
				main: '<script type="text/javascript">window.testScriptEvaluated = true</script>'
			});
			new CustomComponent({
				id: 'main'
			}).render();

			async.nextTick(function() {
				assert.ok(window.testScriptEvaluated);
				done();
			});
		});

		it('should not evaluate script tags with a non js type', function(done) {
			var CustomComponent = createTestComponentClass({
				main: '<script type="text/html">My template</script>'
			});
			new CustomComponent({
				id: 'main'
			}).render();

			async.nextTick(function() {
				assert.ok(!window.testScriptEvaluated);
				done();
			});
		});

		it('should evaluate script tags on surfaces', function(done) {
			var CustomComponent = createTestComponentClass({
				main: '%%%%~s-main-foo~%%%%',
				'main-foo': '<script>window.testScriptEvaluated = true</script>'
			});
			new CustomComponent({
				id: 'main'
			}).render();

			async.nextTick(function() {
				assert.ok(window.testScriptEvaluated);
				done();
			});
		});

		it('should evaluate script tags on surfaces when they change', function(done) {
			var CustomComponent = createTestComponentClass({
				main: '%%%%~s-main-foo~%%%%',
				'main-foo': comp => '<script>window.testScriptEvaluated = \'' + comp.foo + '\'</script>'
			});
			CustomComponent.SURFACES = {
				foo: {
					renderAttrs: ['foo']
				}
			};
			var custom = new CustomComponent({
				id: 'main'
			}).render();

			custom.foo = 'foo';
			custom.once('attrsSynced', function() {
				async.nextTick(function() {
					assert.strictEqual('foo', window.testScriptEvaluated);
					done();
				});
			});
		});
	});

	function createTestComponentClass(opt_content) {
		class TestComponent extends Component {
		}
		TestComponent.RENDERER = createTestRenderer(opt_content);
		return TestComponent;
	}

	function createTestRenderer(opt_content) {
		var contentConfig = opt_content || {};
		class TestRenderer extends SurfaceRenderer {
			getSurfaceContent(surface) {
				var content = contentConfig[surface.surfaceElementId];
				return core.isFunction(content) ? content(this.component_) : content;
			}
		}
		return TestRenderer;
	}
});
