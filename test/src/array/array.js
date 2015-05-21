'use strict';

import array from '../../../src/array/array';

describe('array', function() {
	it('should remove an item from an array', function() {
		var arr = [1, 2, 3, 4, 5];

		array.remove(arr, 3);
		assert.deepEqual([1, 2, 4, 5], arr);
	});

	it('should ignore call to remove item that doesn\'t exist', function() {
		var arr = [1, 2, 3, 4, 5];

		array.remove(arr, 6);
		assert.deepEqual([1, 2, 3, 4, 5], arr);
	});

	it('should remove an item at the specified index', function() {
		var arr = [1, 2, 3, 4, 5];

		array.removeAt(arr, 3);
		assert.deepEqual([1, 2, 3, 5], arr);
	});

	it('should remove an item at the specified negative index', function() {
		var arr = [1, 2, 3, 4, 5];

		array.removeAt(arr, -2);
		assert.deepEqual([1, 2, 3, 5], arr);
	});

	it('should ignore call to remove item on invalid position', function() {
		var arr = [1, 2, 3, 4, 5];

		array.removeAt(arr, 6);
		assert.deepEqual([1, 2, 3, 4, 5], arr);
	});

	it('should flatten the array', function() {
		var arr = [1, [2, [3, [4, [5]]]]];

		assert.deepEqual([1, 2, 3, 4, 5], array.flatten(arr));
		assert.deepEqual([1, [2, [3, [4, [5]]]]], arr);
	});

	describe('equal', function() {
		it('should return false for arrays with different length', function() {
			assert.ok(!array.equal([1, 2], [1, 2, 3]));
		});

		it('should return false for arrays with different object instances', function() {
			assert.ok(!array.equal([1, {}], [1, {}]));
		});

		it('should return true for arrays with the same content', function() {
			assert.ok(array.equal([], []));
			assert.ok(array.equal([1, 2], [1, 2]));
			var obj = {};
			assert.ok(array.equal([1, obj], [1, obj]));
		});
	});
});
