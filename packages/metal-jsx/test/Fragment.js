'use strict';

import Fragment from '../src/Fragment';
import JSXComponent from '../src/JSXComponent';

describe('Fragment', function() {
	let component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	it('should render children with no wrapping element', function() {
		class TestComponent extends JSXComponent {
			render() {
				return (
					<div>
						<Fragment>
							<span>foo</span>
							<span>bar</span>
							<span>baz</span>
						</Fragment>
					</div>
				);
			}
		}

		component = new TestComponent();

		assert.strictEqual(
			'<span>foo</span><span>bar</span><span>baz</span>',
			component.element.innerHTML
		);
	});

	it('should render be able to map through fragments', function() {
		class TestComponent extends JSXComponent {
			render() {
				return (
					<div>
						{[0, 1, 2].map(i => (
							<Fragment key={i}>
								<span>foo {i}</span>
								<span>bar {i}</span>
								<span>baz {i}</span>
							</Fragment>
						))}
					</div>
				);
			}
		}

		component = new TestComponent();

		assert.strictEqual(
			'<span>foo 0</span><span>bar 0</span><span>baz 0</span><span>foo 1</span><span>bar 1</span><span>baz 1</span><span>foo 2</span><span>bar 2</span><span>baz 2</span>',
			component.element.innerHTML
		);
	});

	it('should not set elementClasses prop', function() {
		class TestComponent extends JSXComponent {
			render() {
				return (
					<Fragment elementClasses="test">
						<span>foo</span>
					</Fragment>
				);
			}
		}

		component = new TestComponent();

		assert.strictEqual('<span>foo</span>', component.element.outerHTML);
	});
});
