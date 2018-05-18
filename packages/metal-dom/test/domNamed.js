'use strict';

import dom from '../src/all/dom';
import {toElement} from '../src/domNamed';

describe('domNamed', function() {
	describe('toElement', function() {
		it('should match string selectors', function() {
			let parent = document.createElement('div');
			let child = document.createElement('div');
			parent.id = 'parent';
			dom.addClasses(child, 'child');
			dom.append(parent, child);
			dom.append(document.body, parent);

			assert.strictEqual(parent, toElement('#parent'));
			assert.strictEqual(child, toElement('.child'));
			assert.strictEqual(child, toElement('#parent>.child'));
			assert.strictEqual(child, toElement('#parent > .child'));
		});
	});
});
