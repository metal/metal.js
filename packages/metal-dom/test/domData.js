'use strict';

import domData from '../src/domData';

describe('domData', function() {
	it('should get data object from element', function() {
		var data = domData.get(document.createElement('div'));
		assert.ok(data);
		assert.ok(data.delegating);
		assert.ok(data.listeners);
	});

	it('should return same data object for the same element', function() {
		var element = document.createElement('div');
		assert.strictEqual(domData.get(element), domData.get(element));
	});

	it('should return different data objects for the different elements', function() {
		var element1 = document.createElement('div');
		var element2 = document.createElement('div');
		assert.notStrictEqual(domData.get(element1), domData.get(element2));
	});
});
