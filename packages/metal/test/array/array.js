'use strict';

import array from '../../src/array/array';

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

	it('should return first defined value', function() {
		assert.strictEqual(1, array.firstDefinedValue([1, 2, 3]));
		assert.strictEqual(1, array.firstDefinedValue([undefined, undefined, 1, 2, 3]));
		assert.strictEqual(null, array.firstDefinedValue([undefined, undefined, null, 2, 3]));
	});

	describe('equal', function() {
		it('should return true for arrays pointing to the same reference', function() {
			const arr = [1, 2];
			assert.ok(array.equal(arr, arr));
		});

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

	describe('slice', function() {
		it('should slice given array starting from the specified index', function() {
			var arr = [0, 1, 2, 3, 4, 5];
			assert.deepEqual([3, 4, 5], array.slice(arr, 3));
		});

		it('should slice given array with the specified range', function() {
			var arr = [0, 1, 2, 3, 4, 5];
			assert.deepEqual([3, 4], array.slice(arr, 3, 5));
		});

		it('should slice arguments object', function() {
			function sliceArgs() {
				return array.slice(arguments, 3, 5);
			}
			assert.deepEqual([3, 4], sliceArgs(0, 1, 2, 3, 4, 5));
		});
	});
});
