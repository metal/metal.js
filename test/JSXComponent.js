'use strict';

import dom from 'metal-dom';
import JSXComponent from '../src/JSXComponent';

describe('JSXComponent', function() {
	var component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	it('should render contents from component\'s jsx function', function() {
		class TestComponent extends JSXComponent {
			render() {
				return <div class="test">Hello World</div>;
			}
		}

		component = new TestComponent();
		assert.strictEqual('DIV', component.element.tagName);
		assert.ok(dom.hasClass(component.element, 'test'));
		assert.strictEqual('Hello World', component.element.textContent);
	});

	it('should be able to use children through the state property', function() {
		class ChildComponent extends JSXComponent {
			render() {
				return <div>{this.children}</div>;
			}
		}

		class TestComponent extends JSXComponent {
			render() {
				return <ChildComponent key="child">Hello World</ChildComponent>;
			}
		}

		component = new TestComponent();
		assert.ok(component.components.child);
		assert.strictEqual(component.components.child.element, component.element);
		assert.strictEqual('DIV', component.element.tagName);
		assert.strictEqual('Hello World', component.element.textContent);
	});
});
