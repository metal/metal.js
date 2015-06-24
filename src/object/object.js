'use strict';

import core from '../core';

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
	 * @return {?} The value (object or primitive) or, if not found, null.
	 */
	static getObjectByName(name, opt_obj) {
		var parts = name.split('.');
		var cur = opt_obj || window;
		var part;
		while ((part = parts.shift())) {
			if (core.isDefAndNotNull(cur[part])) {
				cur = cur[part];
			} else {
				return null;
			}
		}
		return cur;
	}
}

export default object;
