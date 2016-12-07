'use strict';

import { buildCallFromConfig, buildConfigFromCall } from '../src/callArgs';

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

	it('should build configuration object from incremental dom call', function() {
		const call = buildCallFromConfig('span', {
			key: 'key',
			attr1: 'attrVal1',
			attr2: 'attrVal2'
		});

		assert.equal(9, call.length);
		assert.equal('span', call[0]);
		assert.equal('key', call[1]);
		assert.deepEqual([], call[2]);
		assert.deepEqual('key', call[3]);
		assert.deepEqual('key', call[4]);
		assert.deepEqual('attr1', call[5]);
		assert.deepEqual('attrVal1', call[6]);
		assert.deepEqual('attr2', call[7]);
		assert.deepEqual('attrVal2', call[8]);
	});
});
