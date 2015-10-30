'use strict';

import ComponentRenderer from '../../../src/component/ComponentRenderer';

describe('ComponentRenderer', function() {
	it('should define the static init function', function() {
		assert.ok(ComponentRenderer.init);
		assert.doesNotThrow(ComponentRenderer.init);
	});

	it('should define the static getSurfaceContent function', function() {
		assert.ok(ComponentRenderer.getSurfaceContent);
		assert.doesNotThrow(ComponentRenderer.getSurfaceContent);
	});
});
