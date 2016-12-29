'use strict';

class object {
	/**
	 * Copies all the members of a source object to a target object.
	 * @param {Object} target Target object.
	 * @param {...Object} var_args The objects from which values will be copied.
	 * @return {Object} Returns the target object reference.
	 */
	static mixin(target) {
		let key, source;
		for (let i = 1; i < arguments.length; i++) {
			source = arguments[i];
			for (key in source) {
				target[key] = source[key];
			}
		}
		return target;
	}

	/**
	 * Returns an object based on its fully qualified external name.
	 * @param {string} name The fully qualified name.
	 * @param {object=} opt_obj The object within which to look; default is
	 *     <code>window</code>.
	 * @return {?} The value (object or primitive) or, if not found, undefined.
	 */
	static getObjectByName(name, opt_obj) {
		const scope = opt_obj || window;
		const parts = name.split('.');
		return parts.reduce((part, key) => part[key], scope);
	}

	/**
	 * Returns a new object with the same keys as the given one, but with
	 * their values set to the return values of the specified function.
	 * @param {!Object} obj
	 * @param {!function(string, *)} fn
	 * @return {!Object}
	 */
	static map(obj, fn) {
		const mappedObj = {};
		const keys = Object.keys(obj);
		for (let i = 0; i < keys.length; i++) {
			mappedObj[keys[i]] = fn(keys[i], obj[keys[i]]);
		}
		return mappedObj;
	}

	/**
	 * Checks if the two given objects are equal. This is done via a shallow
	 * check, including only the keys directly contained by the 2 objects.
	 * @return {boolean}
	 */
	static shallowEqual(obj1, obj2) {
		if (obj1 === obj2) {
			return true;
		}

		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);
		if (keys1.length !== keys2.length) {
			return false;
		}

		for (let i = 0; i < keys1.length; i++) {
			if (obj1[keys1[i]] !== obj2[keys1[i]]) {
				return false;
			}
		}
		return true;
	}
}

export default object;
