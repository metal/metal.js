'use strict';

import core from 'metal';
import validators from '../src/validators';

describe('validators', function() {
	it('should validate an array', function() {
		assert.isTrue(validators.array([], null, this));

		assert.ok(validators.array('string', null, this) instanceof Error);
	});

	it('should validate a boolean', function() {
		assert.isTrue(validators.bool(true));

		assert.ok(validators.bool('true') instanceof Error);
	});

	it('should validate a function', function() {
		const testFn = function() {
			return;
		};

		assert.isTrue(validators.func(testFn));

		assert.ok(validators.func('testFn') instanceof Error);
	});

	it('should validate a number', function() {
		assert.isTrue(validators.number(1));

		assert.ok(validators.number('1') instanceof Error);
	});

	it('should validate a object', function() {
		const obj = {};

		assert.isTrue(validators.object(obj));

		assert.ok(validators.object('obj') instanceof Error);
	});

	it('should validate a string', function() {
		assert.isTrue(validators.string('testString'));

		assert.ok(validators.string(false) instanceof Error);
	});

	it('should validate any type', function() {
		const validator = validators.any();
		assert.isTrue(validator('testString'));
		assert.isTrue(validator(false));
		assert.isTrue(validator({}));
		assert.isTrue(validator(1));
		assert.isTrue(validator(function() {}));
	});

	it('should throw error if a non-function is passed to arrayOf', function() {
		assert.throws(function() {
			validators.arrayOf(2);
		}, 'Expected type function, but received type number. passed to arrayOf.');
	});

	it('should validate an array of a single type', function() {
		const arrayOfNumbers = validators.arrayOf(validators.number);

		assert.isTrue(arrayOfNumbers([1, 2, 3, 4]));

		assert.ok(arrayOfNumbers([1, 2, 3, '4']) instanceof Error);

		assert.ok(arrayOfNumbers({}) instanceof Error);
	});

	it('should validate an instance of a class', function() {
		class TestClass {}
		class TestClass2 {}

		const instanceOfFn = validators.instanceOf(TestClass);

		assert.isTrue(instanceOfFn(new TestClass()));

		assert.ok(instanceOfFn(new TestClass2()) instanceof Error);
	});

	it('should validate a single type or null', function() {
		assert.isTrue(validators.number(1));
		assert.isTrue(validators.number(null));
		assert.isTrue(validators.number(undefined));
		assert.ok(validators.number('1') instanceof Error);

		assert.isTrue(validators.object({}));
		assert.isTrue(validators.object(null));
		assert.isTrue(validators.object(undefined));
		assert.ok(validators.object(1) instanceof Error);
	});

	it('should validate equality against an array of values', function() {
		const validator = validators.oneOf(['one', 1]);

		assert.isTrue(validator('one'));
		assert.isTrue(validator(1));

		assert.ok(validator('1') instanceof Error);
	});

	it('should fail if an array is not supplied to oneOf', function() {
		const validator = validators.oneOf({});
		assert.ok(validator({}) instanceof Error);
	});

	it('should validate one of certain types', function() {
		const oneOfType = validators.oneOfType([
			validators.string,
			validators.number,
		]);

		assert.isTrue(oneOfType('test'));

		assert.isTrue(oneOfType(1));

		assert.ok(oneOfType({}) instanceof Error);
	});

	it('should fail if an array is not supplied to oneOfType', function() {
		const validator = validators.oneOfType({
			one: validators.string,
		});

		assert.ok(validator({}) instanceof Error);
	});

	it('should throw error if a non-function is passed to objectOf', function() {
		assert.throws(function() {
			validators.objectOf(2);
		}, 'Expected type function, but received type number. passed to objectOf.');
	});

	it('should validate an object with certain types of values', function() {
		const objectOf = validators.objectOf(validators.number);

		assert.isTrue(
			objectOf({
				a: 1,
				b: 2,
			})
		);

		assert.ok(
			objectOf({
				a: '1',
				b: '2',
			}) instanceof Error
		);
	});

	it('should validate a shape of an object', function() {
		const shape = validators.shapeOf({
			a: validators.string,
			b: validators.number,
		});

		assert.isTrue(
			shape({
				a: '1',
				b: 2,
			})
		);

		assert.ok(
			shape({
				a: '1',
				b: '2',
			}) instanceof Error
		);
	});

	it('should validate a shape nested within a shape', function() {
		const shape = validators.shapeOf({
			a: validators.shapeOf({
				b: {
					config: {
						required: true,
						validator: validators.string,
					},
				},
			}),
		});

		assert.isTrue(
			shape({
				a: {
					b: 'test',
				},
			})
		);

		assert.ok(
			shape({
				a: {
					b: 1,
				},
			}) instanceof Error
		);

		assert.ok(
			shape({
				a: 1,
			}) instanceof Error
		);
	});

	it('should return validator function instead of running it if no arg is passed to type validator', function() {
		let validatorFn = validators.bool();
		assert.isTrue(core.isFunction(validatorFn));
		assert.isTrue(validatorFn(true));
		assert.ok(validatorFn('true') instanceof Error);
	});

	it('should throw error if a non-object is passed to shapeOf', function() {
		assert.throws(function() {
			validators.shapeOf(2);
		}, 'Expected type object, but received type number. passed to shapeOf.');
	});

	it('should emit warning message', function() {
		const COMPONENT_NAME = 'componentName';
		const NAME = 'name';
		const PARENT_COMPONENT_NAME = 'parentComponent';

		const ERROR_MESSAGE =
			`Error: Invalid state passed to '${NAME}'. ` +
			`Expected type 'string', but received type 'number'. ` +
			`Passed to '${COMPONENT_NAME}'. Check render ` +
			`method of '${PARENT_COMPONENT_NAME}'.`;

		const context = {
			getRenderer: function() {
				return {
					getParent: () => {
						return {
							constructor: {
								name: PARENT_COMPONENT_NAME,
							},
						};
					},
				};
			},
			constructor: {
				name: COMPONENT_NAME,
			},
		};

		const resultError = validators.string(1, NAME, context);

		assert.equal(resultError, ERROR_MESSAGE);
	});
});
