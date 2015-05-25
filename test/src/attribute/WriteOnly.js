'use strict';

import writeOnce from '../../../src/attribute/WriteOnce';

describe('WriteOnce', function() {
	it('should add a writeOnce property to the attribute\'s config', function() {
		var target = {};
		writeOnce(target, 'prop');
		assert.deepPropertyVal(target, 'ATTRS.prop.writeOnce', true);
	});
});