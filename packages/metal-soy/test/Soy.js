'use strict';

import dom from 'metal-dom';
import Component from 'metal-component';
import { HelloWorld as HelloWorldComponent, templates as helloWorldTemplates } from './assets/HelloWorld.soy.js';
import { IJData as IJDataComponent } from './assets/IJData.soy.js';
import { Events as EventsComponent } from './assets/Events.soy.js';

// For now we can't follow alphabetical order here, since HelloWorld.soy needs
// to be imported before ExternalTemplate.soy, since ExternalTemplate depends
// on it.
// TODO: We should have a better dependency management for soy files so that
// the order in which they're required doesn't matter.
import { ExternalTemplate as ExternalTemplateComponent } from './assets/ExternalTemplate.soy.js';
import { Functions as FunctionsComponent } from './assets/Functions.soy.js';
import { HtmlContent as HtmlContentComponent } from './assets/HtmlContent.soy.js';
import { Nested as NestedComponent } from './assets/Nested.soy.js';
import { NestedDataAll as NestedDataAllComponent } from './assets/NestedDataAll.soy.js';
import { NestedLevels as NestedLevelsComponent } from './assets/NestedLevels.soy.js';
import { NestedMultiple as NestedMultipleComponent } from './assets/NestedMultiple.soy.js';
import { NestedNoData as NestedNoDataComponent } from './assets/NestedNoData.soy.js';
import { TemplateData as TemplateDataComponent } from './assets/TemplateData.soy.js';
import Soy from '../src/Soy';

describe('Soy', function() {
	var comp;

	afterEach(function() {
		if (comp) {
			comp.dispose();
		}
	});

	describe('Rendering', function() {
		it('should render component\'s "render" template', function() {
			comp = new HelloWorldComponent();
			assert.strictEqual('SPAN', comp.element.tagName);
			assert.ok(dom.hasClass(comp.element, 'render'));
			assert.strictEqual('Hello World!', comp.element.textContent);
		});

		it('should add soy param as state keys automatically', function() {
			comp = new HelloWorldComponent({
				name: 'Foo'
			});
			assert.strictEqual('Foo', comp.name);
		});

		it('should pass state values to "render template"', function() {
			comp = new HelloWorldComponent({
				name: 'Foo'
			});
			assert.strictEqual('SPAN', comp.element.tagName);
			assert.strictEqual('Hello Foo!', comp.element.textContent);
		});

		it('should update content when state values change', function(done) {
			comp = new HelloWorldComponent({
				name: 'Foo'
			});

			comp.name = 'Bar';
			comp.once('stateSynced', function() {
				assert.strictEqual('Hello Bar!', comp.element.textContent);
				done();
			});
		});

		describe('Should Update', function() {
			beforeEach(function() {
				sinon.spy(IncrementalDOM, 'patchOuter');
			});

			afterEach(function() {
				IncrementalDOM.patchOuter.restore();
				delete HelloWorldComponent.prototype.shouldUpdate;
			});

			it('should not trigger update when changed state key is not used by template', function(done) {
				comp = new HelloWorldComponent();
				comp.visible = false;
				comp.once('stateSynced', function() {
					assert.strictEqual(0, IncrementalDOM.patchOuter.callCount);
					done();
				});
			});

			it('should not trigger update when shouldUpdate returns false', function(done) {
				HelloWorldComponent.prototype.shouldUpdate = function() {
					return false;
				};
				comp = new HelloWorldComponent();

				comp.name = 'Bar';
				comp.once('stateSynced', function() {
					assert.strictEqual(0, IncrementalDOM.patchOuter.callCount);
					done();
				});
			});

			it('should trigger update when state key is not used by template if component shouldUpdate returns true', function(done) {
				HelloWorldComponent.prototype.shouldUpdate = function() {
					return true;
				};
				comp = new HelloWorldComponent();
				comp.visible = false;

				comp.foo = 'Bar';
				comp.once('stateSynced', function() {
					assert.strictEqual(1, IncrementalDOM.patchOuter.callCount);
					done();
				});
			});
		});

		it('should not add sub template soy params as state keys', function() {
			comp = new TemplateDataComponent({
				foo: 'foo'
			});
			assert.ok(!comp.foo);
		});

		it('should pass non state config data to sub templates', function() {
			comp = new TemplateDataComponent({
				foo: 'foo'
			});
			assert.strictEqual('foo', comp.element.textContent);
		});

		it('should not throw error if rendering component with no templates', function() {
			class NoTemplateComponent extends Component {
			}
			NoTemplateComponent.RENDERER = Soy;

			assert.doesNotThrow(function() {
				comp = new NoTemplateComponent();
			});
		});

		it('should not throw error if updating component with no templates', function(done) {
			class NoTemplateComponent extends Component {
			}
			NoTemplateComponent.STATE = {
				foo: {
				}
			};
			NoTemplateComponent.RENDERER = Soy;

			comp = new NoTemplateComponent();
			sinon.spy(IncrementalDOM, 'patchOuter');

			comp.foo = 'Bar';
			comp.once('stateSynced', function() {
				assert.strictEqual(0, IncrementalDOM.patchOuter.callCount);
				IncrementalDOM.patchOuter.restore();
				done();
			});
		});

		it('should render contents from external templates', function() {
			comp = new ExternalTemplateComponent();
			assert.strictEqual('DIV', comp.element.tagName);
			assert.strictEqual('Hello External!', comp.element.textContent);
		});

		it('should allow specifying injected data content', function() {
			Soy.setInjectedData({
				content: 'Foo'
			});
			comp = new IJDataComponent();
			assert.strictEqual('DIV', comp.element.tagName);
			assert.strictEqual('Foo', comp.element.textContent);
		});

		it('should not throw error if setting injected data to null', function() {
			Soy.setInjectedData(null);
			comp = new IJDataComponent();
			assert.strictEqual('DIV', comp.element.tagName);
			assert.strictEqual('', comp.element.textContent);
		});

		it('should allow registering template with any name for a component', function() {
			class TestComponent extends Component {
			}
			Soy.register(TestComponent, helloWorldTemplates, 'content');

			comp = new TestComponent();
			assert.strictEqual('SPAN', comp.element.tagName);
			assert.ok(dom.hasClass(comp.element, 'content'));
			assert.strictEqual('Hello World!', comp.element.textContent);
		});

		it('should use last component registration for the same template', function() {
			class TestComponent extends Component {
			}
			Soy.register(TestComponent, helloWorldTemplates, 'content');

			class TestComponent2 extends Component {
			}
			Soy.register(TestComponent2, helloWorldTemplates, 'content');

			assert.strictEqual(TestComponent.TEMPLATE, TestComponent2.TEMPLATE);
			assert.strictEqual(TestComponent2, TestComponent2.TEMPLATE.componentCtor);
		});

		it('should give precendence to the component\'s own "render" function over template', function() {
			class TestComponent extends Component {
				render() {
					IncrementalDOM.elementVoid('render');
				}
			}
			Soy.register(TestComponent, helloWorldTemplates, 'content');

			comp = new TestComponent();
			assert.strictEqual('RENDER', comp.element.tagName);
		});

		it('should not throw error if soy template doesn\'t have params/types info', function() {
			class TestComponent extends Component {
			}
			Soy.register(
				TestComponent,
				{
					render: () => IncrementalDOM.elementVoid('div')
				}
			);
			assert.doesNotThrow(() => comp = new TestComponent());
		});
	});

	describe('HTML attributes', function() {
		it('should render html string attributes correctly', function() {
			comp = new HtmlContentComponent({
				content: '<span class="custom">HTML Content</span>'
			});

			assert.strictEqual(1, comp.element.childNodes.length);
			assert.strictEqual('SPAN', comp.element.childNodes[0].tagName);
			assert.ok(dom.hasClass(comp.element.childNodes[0], 'custom'));
			assert.strictEqual('HTML Content', comp.element.childNodes[0].textContent);
		});

		it('should render html sanitized object attributes correctly', function() {
			comp = new HtmlContentComponent({
				content: {
					content: '<span class="custom">HTML Content</span>',
					contentKind: 'HTML'
				}
			});

			assert.strictEqual(1, comp.element.childNodes.length);
			assert.strictEqual('SPAN', comp.element.childNodes[0].tagName);
			assert.ok(dom.hasClass(comp.element.childNodes[0], 'custom'));
			assert.strictEqual('HTML Content', comp.element.childNodes[0].textContent);
		});
	});

	describe('Inline Events', function() {
		beforeEach(function() {
			EventsComponent.prototype.handleClick = sinon.stub();
			FunctionsComponent.prototype.handleClick = sinon.stub();
		});

		it('should attach inline events found in component\'s soy template', function() {
			comp = new EventsComponent();

			dom.triggerEvent(comp.element, 'click');
			assert.strictEqual(0, comp.handleClick.callCount);

			dom.triggerEvent(comp.element.querySelector('button'), 'click');
			assert.strictEqual(1, comp.handleClick.callCount);
		});

		it('should attach function listeners found in component\'s soy template', function() {
			comp = new FunctionsComponent();

			dom.triggerEvent(comp.element, 'click');
			assert.strictEqual(0, comp.handleClick.callCount);

			dom.triggerEvent(comp.element.querySelector('button'), 'click');
			assert.strictEqual(1, comp.handleClick.callCount);
		});

		it('should bind function listeners to component', function() {
			var context;
			FunctionsComponent.prototype.handleClick = function() {
				context = this;
			};
			comp = new FunctionsComponent();

			dom.triggerEvent(comp.element.querySelector('button'), 'click');
			assert.strictEqual(comp, context);
		});

		it('should not add prototype functions to the state', function() {
			comp = new FunctionsComponent();
			assert.ok(!comp.getStateKeys.handleClick);
		});
	});

	describe('Nested Components', function() {
		it('should render and instantiate nested components', function() {
			comp = new NestedComponent();

			var nested = comp.components.hello;
			assert.ok(nested instanceof HelloWorldComponent);
			assert.strictEqual(nested.element, comp.element.childNodes[0]);
			assert.strictEqual('Hello World!', nested.element.textContent);
		});

		it('should pass data to nested components', function() {
			comp = new NestedComponent({
				name: 'Foo'
			});

			var nested = comp.components.hello;
			assert.ok(nested instanceof HelloWorldComponent);
			assert.strictEqual(nested.element, comp.element.childNodes[0]);
			assert.strictEqual('Hello Foo!', nested.element.textContent);
		});

		it('should pass data via `data="all"` to nested components', function() {
			comp = new NestedDataAllComponent({
				name: 'Foo'
			});

			var nested = comp.components.hello;
			assert.ok(nested instanceof HelloWorldComponent);
			assert.strictEqual(nested.element, comp.element.childNodes[0]);
			assert.strictEqual('Hello Foo!', nested.element.textContent);
		});

		it('should render and instantiate nested components even without ref', function() {
			comp = new NestedNoDataComponent();
			assert.strictEqual(1, comp.element.childNodes.length);
			assert.strictEqual('Hello World!', comp.element.childNodes[0].textContent);
		});

		it('should render and instantiate nested components inside nested components', function() {
			comp = new NestedLevelsComponent({
				name: 'Foo'
			});

			var nested = comp.components.nested;
			assert.ok(nested instanceof NestedComponent);
			assert.strictEqual(nested.element, comp.element.childNodes[0]);

			var nested2 = nested.components.hello;
			assert.ok(nested2 instanceof HelloWorldComponent);
			assert.strictEqual(nested2.element, nested.element.childNodes[0]);
			assert.strictEqual('Hello Foo!', nested2.element.textContent);
		});

		it('should render and instantiate multiple nested components', function() {
			comp = new NestedMultipleComponent({
				count: 2
			});

			var nested1 = comp.components.hello1;
			assert.ok(nested1 instanceof HelloWorldComponent);
			assert.strictEqual(nested1.element, comp.element.childNodes[0]);
			assert.strictEqual('Hello World!', nested1.element.textContent);

			var nested2 = comp.components.hello2;
			assert.ok(nested2 instanceof HelloWorldComponent);
			assert.strictEqual(nested2.element, comp.element.childNodes[1]);
			assert.strictEqual('Hello World!', nested2.element.textContent);
		});
	});

	describe('Soy.getTemplate', function() {
		it('should not throw error if called for undeclared namespace', function() {
			assert.doesNotThrow(() => Soy.getTemplate('Undeclared.incrementaldom', 'render'));
		});

		it('should throw error if returned function is called for undeclared namespace', function() {
			var template = Soy.getTemplate('Undeclared.incrementaldom', 'render');
			assert.throws(template);
		});

		it('should not throw error if namespace is declared before returned function is called', function() {
			var template = Soy.getTemplate('DeclaredLater.incrementaldom', 'render');
			var module = {
				render: sinon.stub()
			};
			goog.loadModule(function() {
				goog.module('DeclaredLater.incrementaldom');
				return module;
			});
			template();
			assert.strictEqual(1, module.render.callCount);
		});
	});

	describe('Soy.toHtmlString', function() {
		it('should convert given incremental dom function into an html string', function() {
			var fn = function() {
				IncrementalDOM.elementOpen('div', null, [], 'class', 'toHtmlString');
				IncrementalDOM.text('To Convert');
				IncrementalDOM.elementClose('div');
			};
			var str = Soy.toHtmlString(fn);
			assert.strictEqual('<div class="toHtmlString">To Convert</div>', str);
		});
	});

	describe('Soy.toIncDom', function() {
		it('should convert given html string into an incremental dom function', function() {
			var str = '<div class="toHtmlString">To Convert</div>';
			var fn = Soy.toIncDom(str);

			var element = document.createElement('div');
			IncrementalDOM.patch(element, fn);
			assert.strictEqual(str, element.innerHTML);
		});

		it('should convert given sanitized html object into an incremental dom function', function() {
			var str = '<div class="toHtmlString">To Convert</div>';
			var fn = Soy.toIncDom({
				content: str,
				contentKind: 'HTML'
			});

			var element = document.createElement('div');
			IncrementalDOM.patch(element, fn);
			assert.strictEqual(str, element.innerHTML);
		});

		it('should not try to convert param that is not a string or a sanitized html object', function() {
			var fn = sinon.stub();
			assert.strictEqual(fn, Soy.toIncDom(fn));
		});
	});
});
