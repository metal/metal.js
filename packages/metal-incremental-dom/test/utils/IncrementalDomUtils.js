'use strict';

import IncrementalDomUtils from '../../src/utils/IncrementalDomUtils';

describe('IncrementalDomUtils', function() {
	it('should detect if given tag is for a component', function() {
		assert.ok(!IncrementalDomUtils.isComponentTag('span'));
		assert.ok(!IncrementalDomUtils.isComponentTag('div'));
		assert.ok(IncrementalDomUtils.isComponentTag('Div'));
		assert.ok(IncrementalDomUtils.isComponentTag(sinon.stub()));
	});

	it('should build configuration object from incremental dom call', function() {
		var config = IncrementalDomUtils.buildConfigFromCall([
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
