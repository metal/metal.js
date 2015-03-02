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
}

export default object;
