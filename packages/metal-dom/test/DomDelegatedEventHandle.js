'use strict';

import domData from '../src/domData';
import DomDelegatedEventHandle from '../src/DomDelegatedEventHandle';

describe('DomDelegatedEventHandle', function() {
	it('should remove listener from the metal data listeners array', function() {
		let element = document.createElement('div');
		let listeners = domData.get(element, 'listeners', {});
		listeners.click = [() => {}, () => {}, () => {}];
		let fn = listeners.click[1];

		let handle = new DomDelegatedEventHandle(element, 'click', fn);
		handle.removeListener();
		assert.strictEqual(2, listeners.click.length);
		assert.strictEqual(-1, listeners.click.indexOf(fn));
	});

	it('should not throw error if trying to remove unexisting listener', function() {
		let element = document.createElement('div');
		let listeners = domData.get(element, 'listeners', {});
		listeners.click = [() => {}, () => {}, () => {}];

		let handle = new DomDelegatedEventHandle(element, 'click', () => {});
		handle.removeListener();
		assert.strictEqual(3, listeners.click.length);
	});

	it('should not throw error if element has no listeners to be removed', function() {
		let element = document.createElement('div');
		let handle = new DomDelegatedEventHandle(element, 'click', () => {});
		assert.doesNotThrow(() => handle.removeListener());
	});
});
