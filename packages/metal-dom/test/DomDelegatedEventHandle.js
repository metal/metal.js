'use strict';

import domData from '../src/domData';
import DomDelegatedEventHandle from '../src/DomDelegatedEventHandle';

describe('DomDelegatedEventHandle', function() {
	it('should remove listener from the metal data listeners array', function() {
		var element = document.createElement('div');
		var listeners = domData.get(element, 'listeners', {});
		listeners.click = [() => {
		}, () => {
		}, () => {
		}];
		var fn = listeners.click[1];

		var handle = new DomDelegatedEventHandle(element, 'click', fn);
		handle.removeListener();
		assert.strictEqual(2, listeners.click.length);
		assert.strictEqual(-1, listeners.click.indexOf(fn));
	});

	it('should not throw error if trying to remove unexisting listener', function() {
		var element = document.createElement('div');
		var listeners = domData.get(element, 'listeners', {});
		listeners.click = [() => {
		}, () => {
		}, () => {
		}];

		var handle = new DomDelegatedEventHandle(element, 'click', () => {
		});
		handle.removeListener();
		assert.strictEqual(3, listeners.click.length);
	});

	it('should not throw error if element has no listeners to be removed', function() {
		var element = document.createElement('div');
		var handle = new DomDelegatedEventHandle(element, 'click', () => {
		});
		assert.doesNotThrow(() => handle.removeListener());
	});
});
