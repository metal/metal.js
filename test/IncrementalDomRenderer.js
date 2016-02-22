'use strict';

import Component from 'metal-component';
import IncrementalDomRenderer from '../src/IncrementalDomRenderer';

describe('IncrementalDomRenderer', function() {
	var component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	describe('Default renderIncDom', function() {
		it('should build div element by default', function() {
			var Component = createTestComponentClass();
			component = new Component();
			assert.strictEqual('DIV', component.element.tagName);
		});

		it('should render empty div element by default', function() {
			var Component = createTestComponentClass();
			component = new Component().render();
			assert.strictEqual('DIV', component.element.tagName);
			assert.strictEqual(0, component.element.childNodes.length);
		});
	});

	describe('Component renderIncDom', function() {
		it('should render content specified by the component\'s renderIncDom', function() {
			var Component = createTestComponentClass();
			Component.prototype.renderIncDom = function() {
				IncrementalDOM.elementOpen('span', null, ['id', this.id], 'foo', 'foo');
				IncrementalDOM.text('bar');
				IncrementalDOM.elementClose('span');
			};

			component = new Component().render();
			assert.strictEqual('SPAN', component.element.tagName);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});

		it('should update content when attribute values change', function(done) {
			var Component = createTestComponentClass();
			Component.prototype.renderIncDom = function() {
				IncrementalDOM.elementOpen('div', null, ['id', this.id]);
				IncrementalDOM.text(this.foo);
				IncrementalDOM.elementClose('div');
			};
			Component.ATTRS = {
				foo: {
					value: 'foo'
				}
			};

			component = new Component().render();
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
			var Component = createTestComponentClass(CustomRenderer);
			CustomRenderer.prototype.renderIncDom = function() {
				IncrementalDOM.elementOpen('div', null, ['id', this.id]);
				IncrementalDOM.text(this.component_.foo);
				IncrementalDOM.elementClose('div');
			};
			Component.ATTRS = {
				foo: {
					value: 'foo'
				}
			};

			component = new Component().render();
			assert.strictEqual('foo', component.element.textContent);

			component.foo = 'bar';
			component.once('attrsSynced', function() {
				assert.strictEqual('bar', component.element.textContent);
				done();
			});
		});

		it('should render content specified by the renderer function defined by FN_NAME', function() {
			var Component = createTestComponentClass(CustomRenderer);
			CustomRenderer.prototype.renderFn = function() {
				IncrementalDOM.elementOpen('span', null, ['id', this.id], 'foo', 'foo');
				IncrementalDOM.text('bar');
				IncrementalDOM.elementClose('span');
			};
			CustomRenderer.FN_NAME = 'renderFn';

			component = new Component().render();
			assert.strictEqual('SPAN', component.element.tagName);
			assert.strictEqual('foo', component.element.getAttribute('foo'));
			assert.strictEqual('bar', component.element.textContent);
		});
	});

	function createTestComponentClass(opt_renderer) {
		class TestComponent extends Component {
		}
		TestComponent.RENDERER = opt_renderer || IncrementalDomRenderer;
		return TestComponent;
	}
});
