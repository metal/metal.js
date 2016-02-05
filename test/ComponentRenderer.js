'use strict';

import ComponentRenderer from '../src/ComponentRenderer';

describe('ComponentRenderer', function() {
	it('should define the static getSurfaceContent function', function() {
		assert.ok(ComponentRenderer.getSurfaceContent);
		assert.doesNotThrow(ComponentRenderer.getSurfaceContent);
	});
});
