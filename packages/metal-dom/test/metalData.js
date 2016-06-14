'use strict';

import metalData from '../src/metalData';

describe('metalData', function() {
	it('should get data object from element', function() {
		var data = metalData.get(document.createElement('div'));
		assert.ok(data);
		assert.ok(data.delegating);
		assert.ok(data.listeners);
	});

	it('should return same data object for the same element', function() {
		var element = document.createElement('div');
		assert.strictEqual(metalData.get(element), metalData.get(element));
	});

	it('should return different data objects for the different elements', function() {
		var element1 = document.createElement('div');
		var element2 = document.createElement('div');
		assert.notStrictEqual(metalData.get(element1), metalData.get(element2));
	});
});
