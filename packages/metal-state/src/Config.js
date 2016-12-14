'use strict';

import { object } from 'metal';
import validators from './validators';

/**
 * Sugar api that can be used as an alternative for manually building `State`
 * configuration in the expected format. For example, instead of having
 * something like this:
 *
 * ```js
 * MyClass.STATE = {
 *   foo: {
 *     required: true,
 *     validator: validators.number,
 *     value: 13
 *   }
 * };
 * ```
 *
 * You could instead do:
 *
 * ```js
 * MyClass.STATE = {
 *   foo: Config.required().number().value(13)
 * };
 * ```
 */
const Config = {
	/**
	 * Adds the `required` flag to the `State` configuration.
	 * @param {boolean} required Flag to set "required" to. True by default.
	 * @return {!Object} `State` configuration object.
	 */
	required(required = true) {
		return mergeConfig(this, {
			required
		});
	},

	/**
	 * Adds a setter to the `State` configuration.
	 * @param {!function()} setter
	 * @return {!Object} `State` configuration object.
	 */
	setter(setter) {
		return mergeConfig(this, {
			setter
		});
	},

	/**
	 * Adds a validator to the `State` configuration.
	 * @param {!function()} validator
	 * @return {!Object} `State` configuration object.
	 */
	validator(validator) {
		return mergeConfig(this, {
			validator
		});
	},

	/**
	 * Adds a default value to the `State` configuration.
	 * @param {*} value
	 * @return {!Object} `State` configuration object.
	 */
	value(value) {
		return mergeConfig(this, {
			value
		});
	}
};

/**
 * Merges the given config object into the one that has been built so far.
 * @param {!Object} context The object calling this function.
 * @param {!Object} config The object to merge to the built config.
 * @return {!Object} The final object containing the built config.
 */
function mergeConfig(context, config) {
	let obj = context;
	if (obj === Config) {
		obj = Object.create(Config);
		obj.config = {};
	}
	object.mixin(obj.config, config);
	return obj;
}

// Add all validators to `Config`.
const fnNames = Object.keys(validators);
fnNames.forEach(
	name => Config[name] = function() {
		return this.validator(validators[name]);
	}
);

export default Config;
