'use strict';

/**
 * Builds the component config object from its incremental dom call's
 * arguments.
 * @param {!Array} args
 * @return {!Object}
 */
export function buildConfigFromCall(args) {
	const config = {};
	if (args[1]) {
		config.key = args[1];
	}
	const attrsArr = (args[2] || []).concat(args.slice(3));
	for (let i = 0; i < attrsArr.length; i += 2) {
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
export function buildCallFromConfig(tag, config) {
	const call = [tag, config.key, []];
	const keys = Object.keys(config);
	for (let i = 0; i < keys.length; i++) {
		if (keys[i] !== 'children') {
			call.push(keys[i], config[keys[i]]);
		}
	}
	return call;
}
