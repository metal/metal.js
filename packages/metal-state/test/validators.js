'use strict';

import validators from '../src/validators';

describe('validators', function() {
	it('should validate an array', function() {
		assert.isTrue(validators.array([], null, this));

		assert.instanceOf(validators.array('string', null, this), Error);
	});

	it('should validate a boolean', function() {
		assert.isTrue(validators.bool(true));

		assert.instanceOf(validators.bool('true'), Error);
	});

	it('should validate a function', function() {
		const testFn = function() {
			return;
		};

		assert.isTrue(validators.func(testFn));

		assert.instanceOf(validators.func('testFn'), Error);
	});

	it('should validate a number', function() {
		assert.isTrue(validators.number(1));

		assert.instanceOf(validators.number('1'), Error);
	});

	it('should validate a object', function() {
		const obj = {};

		assert.isTrue(validators.object(obj));

		assert.instanceOf(validators.object('obj'), Error);
	});

	it('should validate a string', function() {
		assert.isTrue(validators.string('testString'));

		assert.instanceOf(validators.string(false), Error);
	});

	it('should validate any type', function() {
		validators.any('testString');
		validators.any(false);
		validators.any({});
		validators.any(1);
		validators.any(function() {});

	});

	it('should validate an array of a single type', function() {
		const arrayOfNumbers = validators.arrayOf(validators.number);

		assert.isTrue(arrayOfNumbers([1, 2, 3, 4]));

		assert.instanceOf(arrayOfNumbers([1, 2, 3, '4']), Error);

		assert.instanceOf(arrayOfNumbers({}), Error);
	});

	it('should validate an instance of a class', function() {
		class TestClass {
		}
		class TestClass2 {
		}

		const instanceOfFn = validators.instanceOf(TestClass);

		assert.isTrue(instanceOfFn(new TestClass()));

		assert.instanceOf(instanceOfFn(new TestClass2()), Error);
	});

	it('should validate a single type or null', function() {
		let validator = validators.maybe(validators.number);

		assert.isTrue(validator(1));
		assert.isTrue(validator(null));
		assert.instanceOf(validator('1'), Error);

		validator = validators.maybe(validators.object);

		assert.isTrue(validator({}));
		assert.isTrue(validator(null));
		assert.instanceOf(validator(1), Error);
	});

	it('should validate equality against an array of values', function() {
		const validator = validators.oneOf(
			[
				'one',
				1
			]
		);

		assert.isTrue(validator('one'));
		assert.isTrue(validator(1));

		assert.instanceOf(validator('1'), Error);
	});

	it('should fail if an array is not supplied to oneOf', function() {
		const validator = validators.oneOf({});

		assert.instanceOf(validator(), Error);
	});

	it('should validate one of certain types', function() {
		const oneOfType = validators.oneOfType(
			[
				validators.string,
				validators.number
			]
		);

		assert.isTrue(oneOfType('test'));

		assert.isTrue(oneOfType(1));

		assert.instanceOf(oneOfType({}), Error);
	});

	it('should fail if an array is not supplied to oneOfType', function() {
		const validator = validators.oneOfType(
			{
				one: validators.string
			}
		);

		assert.instanceOf(validator(), Error);
	});

	it('should validate an object with certain types of values', function() {
		const objectOf = validators.objectOf(validators.number);

		assert.isTrue(objectOf({
			a: 1,
			b: 2
		}));

		assert.instanceOf(objectOf({
			a: '1',
			b: '2'
		}), Error);
	});

	it('should validate a shape of an object', function() {
		const shape = validators.shapeOf({
			a: validators.string,
			b: validators.number
		});

		assert.isTrue(shape({
			a: '1',
			b: 2
		}));

		assert.instanceOf(shape({
			a: '1',
			b: '2'
		}), Error);
	});

	it('should validate a shape nested within a shape', function() {
		const shape = validators.shapeOf({
			a: validators.shapeOf({
				b: validators.string
			})
		});

		assert.isTrue(shape({
			a: {
				b: 'test'
			}
		}));

		assert.instanceOf(shape({
			a: {
				b: 1
			}
		}), Error);

		assert.instanceOf(shape({
			a: 1
		}), Error);
	});

	it('should fail if an object is not supplied to shape', function() {
		const validator = validators.shapeOf(1);
		assert.instanceOf(validator(), Error);
	});

	it('should emit warning message', function() {
		const COMPONENT_NAME = 'componentName';
		const NAME = 'name';
		const PARENT_COMPONENT_NAME = 'parentComponent';

		const ERROR_MESSAGE = `Error: Warning: Invalid state passed to '${NAME}'. ` +
			`Expected type 'string', but received type 'number'. Passed to '${COMPONENT_NAME}'. Check render ` +
			`method of '${PARENT_COMPONENT_NAME}'.`;

		const context = {
			getRenderer: function() {
				return {
					lastParentComponent_: {
						constructor: {
							name: PARENT_COMPONENT_NAME
						}
					}
				};
			},
			constructor: {
				name: COMPONENT_NAME
			}
		};

		const resultError = validators.string(1, NAME, context);

		assert.equal(resultError, ERROR_MESSAGE);
	});
});
