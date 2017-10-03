import Component from 'metal-component';
import MyComponent from './fixtures/MyComponent';
import MyJSXComponent from './fixtures/MyJSXComponent';
import { assert } from 'chai';

describe('Isomorphic Rendering', () => {
	it('should render soy component to string', () => {
		const htmlString = Component.renderToString(MyComponent, {
			message: 'Hello, Soy!'
		});

		assert.equal(htmlString, '<div>Hello, Soy!</div>');
	});

	it('should render jsx component to string', () => {
		const htmlString = Component.renderToString(MyJSXComponent, {
			message: 'Hello, JSX!'
		});

		assert.equal(htmlString, '<div>Hello, JSX!</div>');
	});
});
