'use strict';

import dom from 'metal-dom';
import Component from 'metal-component';
import JSX from '../src/JSX';

describe('JSX', function() {
	var component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	it('should render contents from component\'s jsx function', function() {
		class TestComponent extends Component {
			jsx() {
				return <div class="test">Hello World</div>;
			}
		}
		JSX.register(TestComponent);

		component = new TestComponent().render();
		assert.strictEqual('DIV', component.element.tagName);
		assert.ok(dom.hasClass(component.element, 'test'));
		assert.strictEqual('Hello World', component.element.textContent);
	});

	it('should not throw error if no jsx function is implemented', function() {
		class TestComponent extends Component {
		}
		JSX.register(TestComponent);

		component = new TestComponent().render();
		assert.strictEqual('DIV', component.element.tagName);
		assert.strictEqual('', component.element.textContent);
	});

	it('should create and render sub components', function() {
		class ChildComponent extends Component {
			jsx() {
				return <div class="child">Child</div>;
			}
		}
		JSX.register(ChildComponent);

		class TestComponent extends Component {
			jsx() {
				return <div class="test">
					<ChildComponent key="child"></ChildComponent>
				</div>;
			}
		}
		JSX.register(TestComponent);

		component = new TestComponent().render();
		var child = component.components.child;
		assert.ok(child);
		assert.strictEqual('DIV', child.element.tagName);
		assert.ok(dom.hasClass(child.element, 'child'));
		assert.strictEqual('Child', child.element.textContent);
		assert.strictEqual(child.element, component.element.childNodes[0]);
	});
});
