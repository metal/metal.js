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
		var config = {};
		if (args[1]) {
			config.key = args[1];
		}
		var attrsArr = (args[2] || []).concat(args.slice(3));
		for (var i = 0; i < attrsArr.length; i += 2) {
			config[attrsArr[i]] = attrsArr[i + 1];
		}
		return config;
	}

	/**
	 * Builds an incremental dom call array from the given tag and config object.
	 * @param {string} tag
	 * @param {!Object} config
	 * @return {!Array}
	 */
	static buildCallFromConfig(tag, config) {
		var call = [tag, config.key, []];
		var keys = Object.keys(config);
		for (var i = 0; i < keys.length; i++) {
			if (keys[i] !== 'children') {
				call.push(keys[i], config[keys[i]]);
			}
		}
		return call;
	}

	/**
	 * Checks if the given tag represents a metal component.
	 * @param {string} tag
	 * @return {boolean}
	 */
	static isComponentTag(tag) {
		return !core.isString(tag) || tag[0] === tag[0].toUpperCase();
	}
}

export default IncrementalDomUtils;
