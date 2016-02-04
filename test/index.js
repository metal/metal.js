'use strict';

import dom from '../src/dom';
import features from '../src/features';
import defaultImport from '../src/index';
import * as namedImports from '../src/index';
import DomEventHandle from '../src/DomEventHandle';

describe('index', function() {
	it('should export dom by default', function() {
		assert.strictEqual(dom, defaultImport);
	});

	it('should export all inner classes by name', function() {
		assert.strictEqual(dom, namedImports.dom);
		assert.strictEqual(features, namedImports.features);
		assert.strictEqual(DomEventHandle, namedImports.DomEventHandle);
	});
});
