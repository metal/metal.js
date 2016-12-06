'use strict';

import { buildConfigFromCall } from '../src/callArgs';

describe('callArgs', function() {
	it('should build configuration object from incremental dom call', function() {
		var config = buildConfigFromCall([
			'span',
			'key',
			['static1', 'staticVal1', 'static2', 'staticVal2'],
			'attr1',
			'attrVal1'
		]);
		assert.deepEqual({
			key: 'key',
			static1: 'staticVal1',
			static2: 'staticVal2',
			attr1: 'attrVal1'
		}, config);
	});
});
