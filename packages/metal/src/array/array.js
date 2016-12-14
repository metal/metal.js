'use strict';

import { isDef } from '../core';

class array {
	/**
	 * Checks if the given arrays have the same content.
	 * @param {!Array<*>} arr1
	 * @param {!Array<*>} arr2
	 * @return {boolean}
	 */
	static equal(arr1, arr2) {
		if (arr1.length !== arr2.length) {
			return false;
		}
		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Returns the first value in the given array that isn't undefined.
	 * @param {!Array} arr
	 * @return {*}
	 */
	static firstDefinedValue(arr) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] !== undefined) {
				return arr[i];
			}
		}
	}

	/**
	 * Transforms the input nested array to become flat.
	 * @param {Array.<*|Array.<*>>} arr Nested array to flatten.
	 * @param {Array.<*>} opt_output Optional output array.
	 * @return {Array.<*>} Flat array.
	 */
	static flatten(arr, opt_output) {
		var output = opt_output || [];
		for (let i = 0; i < arr.length; i++) {
			if (Array.isArray(arr[i])) {
				array.flatten(arr[i], output);
			} else {
				output.push(arr[i]);
			}
		}
		return output;
	}

	/**
	 * Removes the first occurrence of a particular value from an array.
	 * @param {Array.<T>} arr Array from which to remove value.
	 * @param {T} obj Object to remove.
	 * @return {boolean} True if an element was removed.
	 * @template T
	 */
	static remove(arr, obj) {
		const i = arr.indexOf(obj);
		let rv;
		if ( (rv = i >= 0) ) {
			array.removeAt(arr, i);
		}
		return rv;
	}

	/**
	 * Removes from an array the element at index i
	 * @param {Array} arr Array or array like object from which to remove value.
	 * @param {number} i The index to remove.
	 * @return {boolean} True if an element was removed.
	 */
	static removeAt(arr, i) {
		return Array.prototype.splice.call(arr, i, 1).length === 1;
	}

	/**
	 * Slices the given array, just like Array.prototype.slice, but this
	 * is faster and working on all array-like objects (like arguments).
	 * @param {!Object} arr Array-like object to slice.
	 * @param {number} start The index that should start the slice.
	 * @param {number=} opt_end The index where the slice should end, not
	 *   included in the final array. If not given, all elements after the
	 *   start index will be included.
	 * @return {!Array}
	 */
	static slice(arr, start, opt_end) {
		const sliced = [];
		const end = isDef(opt_end) ? opt_end : arr.length;
		for (let i = start; i < end; i++) {
			sliced.push(arr[i]);
		}
		return sliced;
	}
}

export default array;
