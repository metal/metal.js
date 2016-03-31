'use strict';

class object {
	/**
	 * Copies all the members of a source object to a target object.
	 * @param {Object} target Target object.
	 * @param {...Object} var_args The objects from which values will be copied.
	 * @return {Object} Returns the target object reference.
	 */
	static mixin(target) {
		var key, source;
		for (var i = 1; i < arguments.length; i++) {
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
		var scope = opt_obj || window;
		var parts = name.split('.');
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
		var mappedObj = {};
		var keys = Object.keys(obj);
		for (var i = 0; i < keys.length; i++) {
			mappedObj[keys[i]] = fn(keys[i], obj[keys[i]]);
		}
		return mappedObj;
	}
}

export default object;
