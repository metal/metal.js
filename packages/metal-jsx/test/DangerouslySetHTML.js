'use strict';

import DangerouslySetHTML from '../src/DangerouslySetHTML';
import JSXComponent from '../src/JSXComponent';

describe('JSXComponent', function() {
	let component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	it('should render', function() {
		component = new DangerouslySetHTML();
		assert.strictEqual('SPAN', component.element.tagName);
	});

	it('should render with custom tag', function() {
		component = new DangerouslySetHTML({tag: 'div'});
		assert.strictEqual('DIV', component.element.tagName);
	});

	it('should render with html content', function() {
		let content = '<h2>hello</h2><div><span>world</span></div>';

		component = new DangerouslySetHTML({content: content});
		assert.strictEqual(content, component.element.innerHTML);
	});

	it('should render inside of another component', function() {
		let content = '<h2>hello</h2><div><span>world</span></div>';

		class TestComponent extends JSXComponent {
			render() {
				return (
					<div>
						<DangerouslySetHTML content={content} ref="inner" />
					</div>
				);
			}
		}

		component = new TestComponent();
		assert.strictEqual(content, component.refs.inner.element.innerHTML);
	});
});
