'use strict';

import core from 'metal';
import Config from '../src/Config';

describe('Config', function() {
	it('should return config with "internal" flag set to true by default', function() {
		var config = Config.internal();
		assert.ok(core.isObject(config));

		var expected = {
			internal: true
		};
		assert.deepEqual(expected, config.config);
	});

	it('should return config with "internal" flag set to the given vaue', function() {
		var internal = false;
		var config = Config.internal(internal);
		assert.ok(core.isObject(config));
		assert.deepEqual({
			internal
		}, config.config);
	});

	it('should return config with "required" flag set to true by default', function() {
		var config = Config.required();
		assert.ok(core.isObject(config));

		var expected = {
			required: true
		};
		assert.deepEqual(expected, config.config);
	});

	it('should return config with "required" flag set to the given vaue', function() {
		var required = false;
		var config = Config.required(required);
		assert.ok(core.isObject(config));
		assert.deepEqual({
			required
		}, config.config);
	});

	it('should return config with specified "value"', function() {
		var value = 10;
		var config = Config.value(10);
		assert.ok(core.isObject(config));
		assert.deepEqual({
			value
		}, config.config);
	});

	it('should return config with specified "valueFn"', function() {
		var valueFn = () => {};
		var config = Config.valueFn(valueFn);
		assert.ok(core.isObject(config));
		assert.deepEqual({
			valueFn
		}, config.config);
	});

	it('should return config with specified "setter"', function() {
		var setter = () => {
		};
		var config = Config.setter(setter);
		assert.ok(core.isObject(config));
		assert.deepEqual({
			setter
		}, config.config);
	});

	it('should return config with specified "validator"', function() {
		var validator = () => {
		};
		var config = Config.validator(validator);
		assert.ok(core.isObject(config));
		assert.deepEqual({
			validator
		}, config.config);
	});

	it('should return config with "arrayOf" validator from "validators"', function() {
		var config = Config.arrayOf(Config.number());
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator([1, 2]));
		assert.ok(config.config.validator([1, 'one']) instanceof Error);
		assert.ok(config.config.validator(['one']) instanceof Error);
	});

	it('should return config with "instanceOf" validator from "validators"', function() {
		class TestClass {
		}
		class TestClass2 {
		}

		var config = Config.instanceOf(TestClass);
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(new TestClass()));
		assert.ok(config.config.validator(new TestClass2()) instanceof Error);
	});

	it('should return config with "number" validator from "validators"', function() {
		var config = Config.number();
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(10));
		assert.ok(config.config.validator('test') instanceof Error);
	});

	it('should return config with "oneOf" validator from "validators"', function() {
		var config = Config.oneOf([1, 'one']);
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(1));
		assert.ok(config.config.validator('one'));
		assert.ok(config.config.validator(2) instanceof Error);
		assert.ok(config.config.validator(false) instanceof Error);
	});

	it('should return config with "shapeOf" validator from "validators"', function() {
		var shape = {
			one: Config.string(),
			two: {
				three: {
					four: Config.number()
				}
			},
			five: Config.arrayOf(Config.string())
		};

		var pass = {
			one: 'one',
			two: {
				three: {
					four: 4
				}
			},
			five: ['five']
		};

		var fail = {
			one: 'one',
			two: {
				three: {
					four: 'four'
				}
			},
			five: 5
		};

		var config = Config.arrayOf(Config.shapeOf(shape));
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(pass));
		assert.ok(config.config.validator(fail) instanceof Error);
	});

	it('should return config with "string" validator from "validators"', function() {
		var config = Config.string();
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator('test'));
		assert.ok(config.config.validator(10) instanceof Error);
	});

	it('should return config with data from multiple calls', function() {
		var setter = () => {
		};
		var config = Config.required(true).number().value(10).setter(setter);
		assert.ok(core.isObject(config));

		assert.strictEqual(4, Object.keys(config.config).length);
		assert.strictEqual(true, config.config.required);
		assert.strictEqual(10, config.config.value);
		assert.strictEqual(setter, config.config.setter);
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(10));
		assert.ok(config.config.validator('test') instanceof Error);
	});
});
