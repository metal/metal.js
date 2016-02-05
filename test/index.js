'use strict';

import defaultImport from '../src/index';
import dom from '../src/dom';
import features from '../src/features';
import globalEval from '../src/globalEval';
import * as namedImports from '../src/index';
import DomEventHandle from '../src/DomEventHandle';
import DomEventEmitterProxy from '../src/DomEventEmitterProxy';

describe('index', function() {
	it('should export dom by default', function() {
		assert.strictEqual(dom, defaultImport);
	});

	it('should export all inner classes by name', function() {
		assert.strictEqual(dom, namedImports.dom);
		assert.strictEqual(features, namedImports.features);
		assert.strictEqual(globalEval, namedImports.globalEval);
		assert.strictEqual(DomEventHandle, namedImports.DomEventHandle);
		assert.strictEqual(DomEventEmitterProxy, namedImports.DomEventEmitterProxy);
	});
});
