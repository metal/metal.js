'use strict';

import domData from '../src/domData';

describe('domData', function() {
	it('should set data object from element', function() {
		let data = domData.set(document.createElement('div'));
		assert.ok(data);
	});

	it('should return same data object for the same element', function() {
		let element = document.createElement('div');
		assert.strictEqual(domData.get(element), domData.get(element));
	});

	it('should return different data objects for the different elements', function() {
		let element1 = document.createElement('div');
		let element2 = document.createElement('div');
		assert.notStrictEqual(domData.set(element1), domData.set(element2));
	});
});
