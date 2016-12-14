'use strict';

import core from 'metal';
import Config from '../src/Config';

describe('Config', function() {
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

	it('should return config with specific validator from "validators"', function() {
		var config = Config.number();
		assert.ok(core.isObject(config));
		assert.ok(core.isFunction(config.config.validator));
		assert.ok(config.config.validator(10));
		assert.ok(config.config.validator('test') instanceof Error);
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
