'use strict';

import validator from '../../../src/attribute/Validator';

describe('Validator', function() {
	it('should add a validator property to the attribute\'s config', function() {
		var stringValidator = (value) => {return typeof value === 'string'};

		var target = {};
		validator(stringValidator)(target, 'prop');
		assert.deepPropertyVal(target, 'ATTRS.prop.validator', stringValidator);
	});
});