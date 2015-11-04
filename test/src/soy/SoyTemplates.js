'use strict';

import SoyTemplates from '../../../src/soy/SoyTemplates';

describe('SoyTemplates', function() {
	it('should add and return component templates', function() {
		var myTemplates = {};
		SoyTemplates.set('SoyTemplates1', myTemplates);
		assert.strictEqual(myTemplates, SoyTemplates.get('SoyTemplates1'));
	});

	it('should return empty object for non existing component', function() {
		assert.deepEqual({}, SoyTemplates.get('SoyTemplatesNonExisting'));
	});

	it('should return templates for all components', function() {
		SoyTemplates.set('SoyTemplates1', {});
		assert.ok(Object.keys(SoyTemplates.get()).length > 0);
	});

	it('should return specific component template', function() {
		var myTemplates = {
			test: function() {
			}
		};
		SoyTemplates.set('SoyTemplates1', myTemplates);
		assert.strictEqual(myTemplates.test, SoyTemplates.get('SoyTemplates1', 'test'));
	});
});
