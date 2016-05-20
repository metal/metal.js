'use strict';

import core from 'metal';

/**
 * Utility functions used to handle incremental dom calls.
 */
class IncrementalDomUtils {
	/**
	 * Builds the component config object from its incremental dom call's
	 * arguments.
	 * @param {!Array} args
	 * @return {!Object}
	 */
	static buildConfigFromCall(args) {
		var config = {
			key: args[1]
		};
		var attrsArr = (args[2] || []).concat(args.slice(3));
		for (var i = 0; i < attrsArr.length; i += 2) {
			config[attrsArr[i]] = attrsArr[i + 1];
		}
		return config;
	}

	/**
	 * Checks if the given tag represents a metal component.
	 * @param {string} tag
	 * @param {boolean}
	 */
	static isComponentTag(tag) {
		return !core.isString(tag) || tag[0] === tag[0].toUpperCase();
	}
}

export default IncrementalDomUtils;
