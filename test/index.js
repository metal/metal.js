'use strict';

import defaultImport from '../src/index';
import SoyAop from '../src/SoyAop';
import SoyRenderer from '../src/SoyRenderer';
import SoyTemplates from '../src/SoyTemplates';
import * as namedImports from '../src/index';

describe('index', function() {
	it('should export SoyRenderer by default', function() {
		assert.strictEqual(SoyRenderer, defaultImport);
	});

	it('should export all inner classes by name', function() {
		assert.strictEqual(SoyAop, namedImports.SoyAop);
		assert.strictEqual(SoyRenderer, namedImports.SoyRenderer);
		assert.strictEqual(SoyTemplates, namedImports.SoyTemplates);
	});
});
