'use strict';

import domData from '../src/domData';

describe('domData', function() {
	describe('get', function() {
		it('should get data object from element', function() {
			let data = domData.get(document.createElement('div'));
			assert.ok(data);
		});

		it('should return same data object for the same element', function() {
			let element = document.createElement('div');
			assert.strictEqual(domData.get(element), domData.get(element));
		});

		it('should return different data objects for the different elements', function() {
			let element1 = document.createElement('div');
			let element2 = document.createElement('div');
			assert.notStrictEqual(domData.get(element1), domData.get(element2));
		});

		it('should set initialValue only if value does not exist', function() {
			let element = document.createElement('div');
			let key = domData.get(element, 'key', 'foo');
			assert.strictEqual(key, 'foo');

			key = domData.get(element, 'key', 'bar');
			assert.strictEqual(key, 'foo');
		});

		it('should allow initialValue to be falsy', function() {
			let element = document.createElement('div');
			let key = domData.get(element, 'key', 0);
			assert.strictEqual(key, 0);

			key = domData.get(element, 'key', 1);
			assert.strictEqual(key, 0);
		});

		it('should not overwrite initialValue with undefined', function() {
			let element = document.createElement('div');
			let key = domData.get(element, 'key', 'foo');
			assert.strictEqual(key, 'foo');

			key = domData.get(element, 'key');
			assert.strictEqual(key, 'foo');
		});
	});

	describe('has', function() {
		it('should return false if no data object exists', function() {
			let element = document.createElement('div');
			assert.strictEqual(domData.has(element), false);
		});

		it('should return true if data object exists', function() {
			let element = document.createElement('div');
			domData.get(element);
			assert.strictEqual(domData.has(element), true);
		});
	});

	describe('set', function() {
		it('should get data object from element', function() {
			let element = document.createElement('div');
			domData.set(element, 'value', 20);
			let data = domData.get(element);
			assert.deepEqual(data, {
				value: 20,
			});
		});

		it('should get data value from element', function() {
			let element = document.createElement('img');
			domData.set(element, 'value', true);
			let data = domData.get(element, 'value');
			assert.strictEqual(data, true);
		});

		it('should create data object without a value', function() {
			let element = document.createElement('div');
			domData.set(element);
			let data = domData.get(element);
			assert.deepEqual(data, {});
		});

		it('should overwrite a data value using set', function() {
			let element = document.createElement('div');
			domData.set(element, 'value', true);
			assert.strictEqual(domData.get(element, 'value'), true);
			domData.set(element, 'value', 20);
			assert.strictEqual(domData.get(element, 'value'), 20);
		});

		it('should set falsy value', function() {
			let element = document.createElement('div');
			domData.set(element, 'value', false);
			assert.strictEqual(domData.get(element, 'value'), false);
			domData.set(element, 'value', 0);
			assert.strictEqual(domData.get(element, 'value'), 0);
		});
	});
});
