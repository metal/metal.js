import Component from 'metal-component';
import MyComponent from './fixtures/MyComponent';
import { assert } from 'chai';

describe('Isomorphic Rendering', () => {
	it('should render component to string', () => {
		const htmlString = Component.renderToString(MyComponent, {
			message: 'Hello, World!'
		});

		assert.equal(htmlString, '<div>Hello, World!</div>');
	});
});
