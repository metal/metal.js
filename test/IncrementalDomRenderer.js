'use strict';

import dom from 'metal-dom';
import Component from 'metal-component';
import IncrementalDomRenderer from '../src/IncrementalDomRenderer';

var IncDom = IncrementalDOM;

describe('IncrementalDomRenderer', function() {
	var component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	it('should call patch only once on the component element when rendering', function() {
		var Component = createTestComponentClass();
		component = new Component();

		sinon.spy(IncDom, 'patch');
		sinon.spy(IncDom, 'patchOuter');
		component.render();
		assert.strictEqual(1, IncDom.patch.callCount);
		assert.strictEqual(0, IncDom.patchOuter.callCount);

		IncDom.patch.restore();
		IncDom.patchOuter.restore();
	});

	describe('Default renderIncDom', function() {
		it('should build div element by default', function() {
			var TestComponent = createTestComponentClass();
			component = new TestComponent();
			assert.strictEqual('DIV', component.element.tagName);
		});

		it('should render empty div element by default', function() {
			var TestComponent = createTestComponentClass();
			component = new TestComponent().render();
			assert.strictEqual('DIV', component.element.tagName);
			assert.strictEqual(0, component.element.childNodes.length);
		});
	});

	describe('Component renderIncDom', function() {
		it('should render content specified by the component\'s renderIncDom', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('span', null, ['id', this.id], 'foo', 'foo');
				IncDom.text('bar');
				IncDom.elementClose('span');
			};

			component = new TestComponent().render();
			assert.strictEqual('SPAN', component.element.tagName);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});

		it('should render content specified by the component\'s renderIncDom inside given element', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('span', null, ['id', this.id], 'foo', 'foo');
				IncDom.text('bar');
				IncDom.elementClose('span');
			};

			var element = document.createElement('span');
			component = new TestComponent({
				element: element
			}).render();
			assert.strictEqual(element, component.element);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});

		it('should update content when attribute values change', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.text(this.foo);
				IncDom.elementClose('div');
			};
			TestComponent.ATTRS = {
				foo: {
					value: 'foo'
				}
			};

			component = new TestComponent().render();
			assert.strictEqual('foo', component.element.textContent);

			component.foo = 'bar';
			component.once('attrsSynced', function() {
				assert.strictEqual('bar', component.element.textContent);
				done();
			});
		});
	});

	describe('Subclass renderer renderIncDom', function() {
		var CustomRenderer;

		beforeEach(function() {
			class TestRenderer extends IncrementalDomRenderer {
			}
			CustomRenderer = TestRenderer;
		});

		it('should render and update content specified by the renderer\'s renderIncDom', function(done) {
			var TestComponent = createTestComponentClass(CustomRenderer);
			CustomRenderer.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.text(this.component_.foo);
				IncDom.elementClose('div');
			};
			TestComponent.ATTRS = {
				foo: {
					value: 'foo'
				}
			};

			component = new TestComponent().render();
			assert.strictEqual('foo', component.element.textContent);

			component.foo = 'bar';
			component.once('attrsSynced', function() {
				assert.strictEqual('bar', component.element.textContent);
				done();
			});
		});

		it('should render content specified by the renderer function defined by FN_NAME', function() {
			var TestComponent = createTestComponentClass(CustomRenderer);
			CustomRenderer.prototype.renderFn = function() {
				IncDom.elementOpen('span', null, ['id', this.id], 'foo', 'foo');
				IncDom.text('bar');
				IncDom.elementClose('span');
			};
			CustomRenderer.FN_NAME = 'renderFn';

			component = new TestComponent().render();
			assert.strictEqual('SPAN', component.element.tagName);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});
	});

	describe('Inline Listeners', function() {
		it('should attach listeners from "data-on<event>" attributes', function() {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();

			component = new TestComponent().render();
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element, 'click');
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(component.element.childNodes[0], 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should remove unused inline listeners when dom is updated', function(done) {
			var TestComponent = createTestComponentClass();
			TestComponent.prototype.renderIncDom = function() {
				IncDom.elementOpen('div', null, ['id', this.id]);
				IncDom.elementVoid('div', null, null, 'data-onclick', 'handleClick');
				if (this.keydown) {
					IncDom.elementVoid('div', null, null, 'data-onkeydown', 'handleKeydown');
				}
				IncDom.elementClose('div');
			};
			TestComponent.prototype.handleClick = sinon.stub();
			TestComponent.prototype.handleKeydown = sinon.stub();
			TestComponent.ATTRS = {
				keydown: {
					value: true
				}
			};

			component = new TestComponent().render();
			dom.triggerEvent(component.element.childNodes[1], 'keydown');
			assert.strictEqual(1, component.handleKeydown.callCount);

			sinon.spy(component.element, 'removeEventListener');
			component.keydown = false;
			component.once('attrsSynced', function() {
				assert.strictEqual(1, component.element.removeEventListener.callCount);
				done();
			});
		});
	});

	function createTestComponentClass(opt_renderer) {
		class TestComponent extends Component {
		}
		TestComponent.RENDERER = opt_renderer || IncrementalDomRenderer;
		return TestComponent;
	}
});
