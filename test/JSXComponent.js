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
});
