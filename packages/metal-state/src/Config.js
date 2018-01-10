'use strict';

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
	 * An object that contains a validator function.
	 * @typedef {!Object} ConfigWithValidator
	 */

	/**
	 * Function that creates `State` object with an `any` validator.
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	any: setPrimitiveValidators('any'),

	/**
	 * Function that creates `State` object with an `array` validator.
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	array: setPrimitiveValidators('array'),

	/**
	 * Function that creates `State` object with an `arrayOf` validator.
	 * @param {ConfigWithValidator} stateConfig `State` configuration object
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	arrayOf: setNestedValidators('arrayOf'),

	/**
	 * Function that creates `State` object with a `bool` validator.
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	bool: setPrimitiveValidators('bool'),

	/**
	 * Function that creates `State` object with a `func` validator.
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	func: setPrimitiveValidators('func'),

	/**
	 * Creates `State` configuration object with a `rangeOf` validator.
	 * @param {!Number} min The minimum value allowed.
	 * @param {!Number} max The maximum value allowed.
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	inRange(min, max) {
		return this.validator(validators.inRange(min, max));
	},

	/**
	 * Function that creates `State` object with an `instanceOf` validator.
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	instanceOf: setExplicitValueValidators('instanceOf'),

	/**
	 * Function that creates `State` object with a `number` validator.
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	number: setPrimitiveValidators('number'),

	/**
	 * Function that creates `State` object with an `object` validator.
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	object: setPrimitiveValidators('object'),

	/**
	 * Function that creates `State` object with an `objectOf` validator.
	 * @param {ConfigWithValidator} stateConfig `State` configuration object
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	objectOf: setNestedValidators('objectOf'),

	/**
	 * Function that creates `State` object with an `oneOf` validator.
	 * @param {!Array} values `State` configuration object
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	oneOf: setExplicitValueValidators('oneOf'),

	/**
	 * Creates `State` configuration object with an `oneOfType` validator.
	 * @param {ConfigWithValidator[]} validatorArray Array of `State` configuration objects.
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	oneOfType(validatorArray) {
		validatorArray = validatorArray.map(
			configObj => configObj.config.validator
		);

		return this.validator(validators.oneOfType(validatorArray));
	},

	/**
	 * Creates `State` configuration object with a `shapeOf` validator.
	 * @param {!Object.<string, ConfigWithValidator>} shapeObj Values being `State` configuration objects.
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	shapeOf(shapeObj) {
		shapeObj = destructShapeOfConfigs(shapeObj);

		return this.validator(validators.shapeOf(shapeObj));
	},

	/**
	 * Function that creates `State` object with an `string` validator.
	 * @return {ConfigWithValidator} `State` configuration object.
	 */
	string: setPrimitiveValidators('string'),

	/**
	 * Adds the `internal` flag to the `State` configuration.
	 * @param {boolean} internal Flag to set "internal" to. True by default.
	 * @return {!Object} `State` configuration object.
	 */
	internal(internal = true) {
		return mergeConfig(this, {
			internal,
		});
	},

	/**
	 * Adds the `required` flag to the `State` configuration.
	 * @param {boolean} required Flag to set "required" to. True by default.
	 * @return {!Object} `State` configuration object.
	 */
	required(required = true) {
		return mergeConfig(this, {
			required,
		});
	},

	/**
	 * Adds a setter to the `State` configuration.
	 * @param {!function()} setter
	 * @return {!Object} `State` configuration object.
	 */
	setter(setter) {
		return mergeConfig(this, {
			setter,
		});
	},

	/**
	 * Adds a validator to the `State` configuration.
	 * @param {!function()} validator
	 * @return {!Object} `State` configuration object.
	 */
	validator(validator) {
		return mergeConfig(this, {
			validator,
		});
	},

	/**
	 * Adds a default value to the `State` configuration.
	 * @param {*} value
	 * @return {!Object} `State` configuration object.
	 */
	value(value) {
		return mergeConfig(this, {
			value,
		});
	},

	/**
	 * Adds a valueFn that will return a default value for the `State` configuration.
	 * @param {!function()} valueFn
	 * @return {!Object} `State` configuration object.
	 */
	valueFn(valueFn) {
		return mergeConfig(this, {
			valueFn,
		});
	},

	/**
	 * Adds the `writeOnce` flag to the `State` configuration.
	 * @param {boolean} writeOnce Flag to set "writeOnce" to. False by default.
	 * @return {!Object} `State` configuration object.
	 */
	writeOnce(writeOnce = false) {
		return mergeConfig(this, {
			writeOnce,
		});
	},
};

/**
 * Recursively sets validators for shapeOf.
 * @param {!Object} shape The shape of specific types.
 * @return {!Object} Shape object with validators as values.
 */
function destructShapeOfConfigs(shape) {
	const keys = Object.keys(shape);

	const retShape = {};

	keys.forEach(key => {
		const value = shape[key];

		retShape[key] =
			value.config && value.config.validator
				? value.config.validator
				: destructShapeOfConfigs(value);
	});

	return retShape;
}

/**
 * Merges the given config object into the one that has been built so far.
 * @param {!Object} context The object calling this function.
 * @param {!Object} config The object to merge to the built config.
 * @return {!Object} The final object containing the built config.
 */
function mergeConfig(context, config) {
	let obj = context;
	const objConfig = obj.config || {};

	obj = Object.create(Config);
	obj.config = {};

	Object.assign(obj.config, objConfig, config);
	return obj;
}

/**
 * Calls validators with provided argument.
 * @param {string} name The name of the validator.
 * @return {function()}
 */
function setExplicitValueValidators(name) {
	return function(arg) {
		return this.validator(validators[name](arg));
	};
}

/**
 * Calls validators with a single nested config.
 * @param {string} name The name of the validator.
 * @return {!function()}
 */
function setNestedValidators(name) {
	return function(arg) {
		return this.validator(validators[name](arg.config.validator));
	};
}

/**
 * Adds primitive type validators to the config object.
 * @param {string} name The name of the validator.
 * @return {!function()}
 */
function setPrimitiveValidators(name) {
	return function() {
		return this.validator(validators[name]);
	};
}

export default Config;
