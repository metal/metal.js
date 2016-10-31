'use strict';

const METAL_DATA = '__metal_data__';

class domData {
	/**
	 * Gets Metal.js's data for the given element.
	 * @param {!Element} element
	 * @param {string=} opt_name Optional property from the data to be returned.
	 * @param {*} opt_initialVal Optinal value to the set the requested property
	 *     to if it doesn't exist yet in the data.
	 * @return {!Object}
	 */
	static get(element, opt_name, opt_initialVal) {
		if (!element[METAL_DATA]) {
			element[METAL_DATA] = {};
		}
		if (!opt_name) {
			return element[METAL_DATA];
		}
		if (!element[METAL_DATA][opt_name] && opt_initialVal) {
			element[METAL_DATA][opt_name] = opt_initialVal;
		}
		return element[METAL_DATA][opt_name];
	}

	/**
	 * Checks if the given element has data stored in it.
	 * @param {!Element} element
	 * @return {boolean}
	 */
	static has(element) {
		return !!element[METAL_DATA];
	}
}

export default domData;
