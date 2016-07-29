'use strict';

import { core } from 'metal';

/**
 * Provides access to various type validators that will return an
 * instance of Error when validation fails.
 */
const validators = {
	any: () => true,
	array: validateType('array'),
	bool: validateType('boolean'),
	func: validateType('function'),
	number: validateType('number'),
	object: validateType('object'),
	string: validateType('string'),

	/**
	 * Creates a validator that checks the values of an array against a type.
	 * @param {function()} validator Type validator to check each index against.
	 * @return {function()} Validator.
	 */
	arrayOf: function(validator) {
		return (value, name, context) => {
			if (!Array.isArray(value)) {
				return composeError('Expected an array.', name, context);
			} else {
				const testArray = value.every(
					item => {
						return !(validator(item, name) instanceof Error);
					}
				);

				if (!testArray) {
					return composeError('Expected an array of single type', name, context);
				}
			}

			return true;
		};
	},

	/**
	 * Creates a validator that compares a value to a specific class.
	 * @param {function()} expectedClass Class to check value against.
	 * @return {function()} Validator.
	 */
	instanceOf: function(expectedClass) {
		return (value, name, context) => {
			if (!(value instanceof expectedClass)) {
				return composeError(`Expected instance of ${expectedClass}`, name, context);
			}

			return true;
		};
	},

	/**
	 * Creates a validator that checks a value against a single type, null, or undefined.
	 * @param {function()} typeValidator Validator to check value against.
	 * @return {function()} Validator.
	 */
	maybe: function(typeValidator) {
		return (value, name, context) => {
			const validation = typeValidator(value, name);

			if (!core.isDef(value) || core.isNull(value) || !(validation instanceof Error)) {
				return true;
			}

			return composeError(`${validation.toString()} or null`, name, context);
		};
	},

	/**
	 * Creates a validator that checks the values of an object against a type.
	 * @param {function()} typeValidator Validator to check value against.
	 * @return {function()} Validator.
	 */
	objectOf: function(typeValidator) {
		return (value, name, context) => {
			let success = true;

			for (let key in value) {
				success = !(typeValidator(value[key], null) instanceof Error);
			}

			if (!success) {
				return composeError('Expected object of one type', name, context);
			}

			return true;
		};
	},

	/**
	 * Creates a validator that checks equality against specific values.
	 * @param {!Array} arrayOfValues Array of values to check equality against.
	 * @return {function()} Validator.
	 */
	oneOf: function(arrayOfValues) {
		if (!Array.isArray(arrayOfValues)) {
			return (value, name, context) => composeError(`Expected an array, but received type '${getStateType(arrayOfValues)}'.`, name, context);
		}

		return (value, name, context) => {
			for (let i = 0; i < arrayOfValues.length; i++) {
				const oneOfValue = arrayOfValues[i];

				if (value === oneOfValue) {
					return true;
				}
			}

			return composeError('Expected one of given values.', name, context);
		};
	},

	/**
	 * Creates a validator that checks a value against multiple types and only has to pass one.
	 * @param {!Array} arrayOfTypeValidators Array of validators to check value against.
	 * @return {function()} Validator.
	 */
	oneOfType: function(arrayOfTypeValidators) {
		if (!Array.isArray(arrayOfTypeValidators)) {
			return (value, name, context) => composeError(`Expected an array, but received type '${getStateType(arrayOfTypeValidators)}'.`, name, context);
		}

		return (value, name, context) => {
			for (let i = 0; i < arrayOfTypeValidators.length; i++) {
				const validator = arrayOfTypeValidators[i];

				if (!(validator(value, name) instanceof Error)) {
					return true;
				}
			}

			return composeError('Expected one of given types.', name, context);
		};
	},

	/**
	 * Creates a validator that checks the shape of an object.
	 * @param {!Object} shape An object containing type validators for each key.
	 * @return {function()} Validator.
	 */
	shapeOf: function(shape) {
		const type = getStateType(shape);
		if (type !== 'object') {
			return (value, name, context) => composeError(`Expected an object, but received type '${type}'.`, name, context);
		}

		return (value, name, context) => {
			for (let key in shape) {
				const validator = shape[key];
				const valueForKey = value[key];

				if (validator(valueForKey, null) instanceof Error) {
					return composeError('Expected object with a specific shape', name, context);
				}
			}

			return true;
		};
	}
};

/**
 * Composes a warning a warning message.
 * @param {string} error Error message to display to console.
 * @param {?string} name Name of state property that is giving the error.
 * @param {Object} context.
 * @return {!Error} Instance of Error class.
 */
function composeError(error, name, context) {
	const componentName = context ? core.getFunctionName(context.constructor) : null;
	const parentComponent = context && context.getRenderer ? context.getRenderer().lastParentComponent_ : null;
	const parentComponentName = parentComponent ? core.getFunctionName(parentComponent.constructor) : null;

	const location = parentComponentName ? `Check render method of '${parentComponentName}'.` : '';

	return new Error(`Warning: Invalid state passed to '${name}'. ${error} Passed to '${componentName}'. ${location}`);
}

/**
 * Checks type of given value.
 * @param {*} value Any value.
 * @return {string} Type of value.
 */
function getStateType(value) {
	const stateType = typeof value;
	if (Array.isArray(value)) {
		return 'array';
	}

	return stateType;
}

/**
 * Creates a validator that checks against a specific primitive type.
 * @param {string} expectedType Type to check against.
 * @return {function()} Validator.
 */
function validateType(expectedType) {
	return (value, name, context) => {
		const type = getStateType(value);

		if (type !== expectedType) {
			return composeError(`Expected type '${expectedType}', but received type '${type}'.`, name, context);
		}

		return true;
	};
}

export default validators;
