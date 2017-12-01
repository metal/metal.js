'use strict';

import domData from '../src/domData';

describe('domData', function() {
	it('should set data object from element', function() {
		let data = domData.set(document.createElement('div'));
		assert.ok(data);
	});

	it('should get data object from element', function() {
		let element = document.createElement('div');
		domData.set(element, 'value', 20);
		let data = domData.get(element);
		assert.strictEqual(JSON.stringify(data), '{"value":20}');
	});

	it('should get data value from element', function() {
		let element = document.createElement('img');
		domData.set(element, 'value', true);
		let data = domData.get(element, 'value');
		assert.strictEqual(data, true);
	});

	it('should set data without a value', function() {
		let element = document.createElement('div');
		domData.set(element);
		let data = domData.get(element);
		assert.strictEqual(JSON.stringify(data), '{}');
	});

	it('should overwrite a data object using set', function() {
		let element = document.createElement('div');
		domData.set(element, 'value', true);
		domData.set(element, 'value', 20);
		let data = domData.get(element);
		assert.strictEqual(data.value, 20);
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
