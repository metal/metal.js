'use strict';

import domData from '../src/domData';
import { globals } from 'metal';

describe('domData', function() {
	it('should get data object from element', function() {
		var data = domData.get(document.createElement('div'));
		assert.ok(data);
	});

	it('should return same data object for the same element', function() {
		var element = globals.document.createElement('div');
		assert.strictEqual(domData.get(element), domData.get(element));
	});

	it('should return different data objects for the different elements', function() {
		var element1 = globals.document.createElement('div');
		var element2 = globals.document.createElement('div');
		assert.notStrictEqual(domData.get(element1), domData.get(element2));
	});
});
