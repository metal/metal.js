'use strict';

import domData from '../src/domData';
import DomDelegatedEventHandle from '../src/DomDelegatedEventHandle';

describe('DomDelegatedEventHandle', function() {
	it('should remove listener from the metal data listeners array', function() {
		var element = document.createElement('div');
		var data = domData.get(element);
		data.listeners.click = [() => {}, () => {}, () => {}];
		var fn = data.listeners.click[1];

		var handle = new DomDelegatedEventHandle(element, 'click', fn);
		handle.removeListener();
		assert.strictEqual(2, data.listeners.click.length);
		assert.strictEqual(-1, data.listeners.click.indexOf(fn));
	});

	it('should not throw error if trying to remove unexisting listener', function() {
		var element = document.createElement('div');
		var data = domData.get(element);
		data.listeners.click = [() => {}, () => {}, () => {}];

		var handle = new DomDelegatedEventHandle(element, 'click', () => {});
		handle.removeListener();
		assert.strictEqual(3, data.listeners.click.length);
	});

	it('should not throw error if element has no listeners to be removed', function() {
		var element = document.createElement('div');
		var handle = new DomDelegatedEventHandle(element, 'click', () => {});
		assert.doesNotThrow(() => handle.removeListener());
	});
});
