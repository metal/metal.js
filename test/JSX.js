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
});
