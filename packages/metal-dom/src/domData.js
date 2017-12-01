'use strict';

import {isDef} from 'metal';

const METAL_DATA = '__metal_data__';

/**
 * Set of utilities for dom data operations
 */
class domData {
	/**
	 * Gets Metal.js's data for the given element.
	 * @param {!Element} element
	 * @param {string=} name Optional property from the data to be returned.
	 * @param {*=} initialValue Optional value to the set the requested property
	 *     to if it doesn't exist yet in the data.
	 * @return {!Object}
	 */
	static get(element, name, initialValue) {
		if (!element[METAL_DATA]) {
			element[METAL_DATA] = {};
		}
		if (!name) {
			return element[METAL_DATA];
		}
		if (!isDef(element[METAL_DATA][name]) && isDef(initialValue)) {
			element[METAL_DATA][name] = initialValue;
		}
		return element[METAL_DATA][name];
	}

	/**
	 * Checks if the given element has data stored in it.
	 * @param {!Element} element
	 * @return {boolean}
	 */
	static has(element) {
		return !!element[METAL_DATA];
	}

	/**
	 * Sets Metal.js's data for the given element.
	 * @param {!Element} element
	 * @param {string=} name Property from the data to be set.
	 * @param {*=} value Value to be set on the element.
	 * @return {!Object|*}
	 */
	static set(element, name, value) {
		if (!element[METAL_DATA]) {
			element[METAL_DATA] = {};
		}
		if (!name || !isDef(value)) {
			return element[METAL_DATA];
		}
		element[METAL_DATA][name] = value;
		return element[METAL_DATA][name];
	}
}

export default domData;
