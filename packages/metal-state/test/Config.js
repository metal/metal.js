'use strict';

import core from 'metal';
import Config from '../src/Config';

describe('Config', function() {
	it('should return config with "internal" flag set to true by default', function() {
		let config = Config.internal();
		assert.ok(core.isObject(config));

		let expected = {
			internal: true,
		};
		assert.deepEqual(expected, config.config);
	});

	it('should return config with "internal" flag set to the given vaue', function() {
		let internal = false;
		let config = Config.internal(internal);
		assert.ok(core.isObject(config));
		assert.deepEqual(
			{
				internal,
			},
			config.config
		);
	});

	it('should return config with "required" flag set to true by default', function() {
		let config = Config.required();
		assert.ok(core.isObject(config));

		let expected = {
			required: true,
		};
		assert.deepEqual(expected, config.config);
	});

	it('should return config with "required" flag set to the given vaue', function() {
		let required = false;
		let config = Config.required(required);
		assert.ok(core.isObject(config));
		assert.deepEqual(
			{
				required,
			},
			config.config
		);
	});

	it('should return config with specified "value"', function() {
		let value = 10;
		let config = Config.value(10);
		assert.ok(core.isObject(config));
		assert.deepEqual(
			{
				value,
			},
			config.config
		);
	});

	it('should return config with specified "valueFn"', function() {
		let valueFn = () => {};
		let config = Config.valueFn(valueFn);
		assert.ok(core.isObject(config));
		assert.deepEqual(
			{
				valueFn,
			},
			config.config
		);
	});

	it('should return config with "writeOnce" flag set to false by default', function() {
		let config = Config.writeOnce();
		assert.ok(core.isObject(config));

		let expected = {
			writeOnce: false,
		};
		assert.deepEqual(expected, config.config);
	});

	it('should return config with "writeOnce" flag set to the given vaue', function() {
		let writeOnce = true;
		let config = Config.writeOnce(writeOnce);
		assert.ok(core.isObject(config));
		assert.deepEqual(
			{
				writeOnce,
			},
			config.config
		);
	});

	it('should return config with specified "setter"', function() {
		let setter = () => {};
		let config = Config.setter(setter);
		assert.ok(core.isObject(config));
		assert.deepEqual(
			{
				setter,
			},
			config.config
		);
	});

	it('should return config with specified "validator"', function() {
		let validator = () => {};
		let config = Config.validator(validator);
		assert.ok(core.isObject(config));
		assert.deepEqual(
			{
				validator,
			},
			config.config
		);
	});

	it('should return config with "any" validator from "validators"', function() {
		let config = Config.any();
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(10));
		assert.ok(config.config.validator('test'));
	});

	it('should return config with "array" validator from "validators"', function() {
		let config = Config.array();
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(['one']));
		assert.ok(config.config.validator(10) instanceof Error);
	});

	it('should return config with "arrayOf" validator from "validators"', function() {
		let config = Config.arrayOf(Config.number());
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator([1, 2]));
		assert.ok(config.config.validator([1, 'one']) instanceof Error);
		assert.ok(config.config.validator(['one']) instanceof Error);
	});

	it('should return config with "bool" validator from "validators"', function() {
		let config = Config.bool();
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(true));
		assert.ok(config.config.validator(10) instanceof Error);
	});

	it('should return config with "func" validator from "validators"', function() {
		let config = Config.func();
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(function() {}));
		assert.ok(config.config.validator(10) instanceof Error);
	});

	it('should return config with "instanceOf" validator from "validators"', function() {
		class TestClass {}
		class TestClass2 {}

		let config = Config.instanceOf(TestClass);
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(new TestClass()));
		assert.ok(config.config.validator(new TestClass2()) instanceof Error);
	});

	it('should return config with "number" validator from "validators"', function() {
		let config = Config.number();
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(10));
		assert.ok(config.config.validator('test') instanceof Error);
	});

	it('should return config with "object" validator from "validators"', function() {
		let config = Config.object();
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator({}));
		assert.ok(config.config.validator('test') instanceof Error);
	});

	it('should return config with "objectOf" validator from "validators"', function() {
		let config = Config.objectOf(Config.number());
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator({foo: 1}));
		assert.ok(config.config.validator({foo: 'test'}) instanceof Error);
	});

	it('should return config with "oneOf" validator from "validators"', function() {
		var config = Config.oneOf([1, 'one']);
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(1));
		assert.ok(config.config.validator('one'));
		assert.ok(config.config.validator(2) instanceof Error);
		assert.ok(config.config.validator(false) instanceof Error);

		var config = Config.oneOf([1, 'one']).required();
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(1));
		assert.ok(config.config.validator('one'));
		assert.ok(config.config.validator(2) instanceof Error);
		assert.ok(config.config.validator(false) instanceof Error);
	});

	it('should return config with "oneOfType" validator from "validators"', function() {
		let config = Config.oneOfType([Config.string(), Config.number()]);
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(1));
		assert.ok(config.config.validator('one'));
		assert.ok(config.config.validator({}) instanceof Error);
		assert.ok(config.config.validator(false) instanceof Error);
	});

	it('should return config with "shapeOf" validator from "validators"', function() {
		let shape = {
			one: Config.string(),
			two: {
				three: {
					four: Config.number(),
				},
			},
			five: Config.arrayOf(Config.string()),
		};

		let pass = {
			one: 'one',
			two: {
				three: {
					four: 4,
				},
			},
			five: ['five'],
		};

		let fail = {
			one: 'one',
			two: {
				three: {
					four: 'four',
				},
			},
			five: 5,
		};

		let config = Config.arrayOf(Config.shapeOf(shape));
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(pass));
		assert.ok(config.config.validator(fail) instanceof Error);
	});

	it('should return config with "string" validator from "validators"', function() {
		let config = Config.string();
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator('test'));
		assert.ok(config.config.validator(10) instanceof Error);
	});

	it('should return config with data from multiple calls', function() {
		let setter = () => {};
		let config = Config.required(true)
			.number()
			.value(10)
			.setter(setter);
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
