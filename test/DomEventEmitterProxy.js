'use strict';

import dom from '../src/dom';
import features from '../src/features';
import DomEventEmitterProxy from '../src/DomEventEmitterProxy';
import { EventEmitter } from 'metal-events';

describe('DomEventEmitterProxy', function() {
	afterEach(function() {
		document.body.innerHTML = '';
	});

	it('should proxy event from event emitter origin to target', function() {
		var origin = new EventEmitter();
		var target = new EventEmitter();
		new DomEventEmitterProxy(origin, target);

		var listener = sinon.stub();
		target.on('event1', listener);
		origin.emit('event1', 1, 2);

		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(1, listener.args[0][0]);
		assert.strictEqual(2, listener.args[0][1]);
	});

	it('should proxy event from dom element origin to target', function() {
		var origin = document.createElement('div');
		document.body.appendChild(origin);

		var target = new EventEmitter();
		new DomEventEmitterProxy(origin, target);

		var listener = sinon.stub();
		target.on('click', listener);
		dom.triggerEvent(origin, 'click');

		assert.strictEqual(1, listener.callCount);
		assert.ok(listener.args[0][0]);
		document.body.removeChild(origin);
	});

	it('should proxy custom event from dom element origin to target', function() {
		var origin = document.createElement('div');
		document.body.appendChild(origin);

		var target = new EventEmitter();
		new DomEventEmitterProxy(origin, target);

		var listener = sinon.stub();
		target.on('transitionend', listener);
		dom.triggerEvent(origin, features.checkAnimationEventName().transition);

		assert.strictEqual(1, listener.callCount);
	});

	it('should not proxy unsupported dom event from dom element', function() {
		var origin = document.createElement('div');
		origin.addEventListener = sinon.stub();

		var target = new EventEmitter();
		new DomEventEmitterProxy(origin, target);

		target.on('event1', sinon.stub());
		assert.strictEqual(0, origin.addEventListener.callCount);
	});

	it('should proxy event from document to target', function() {
		var target = new EventEmitter();
		new DomEventEmitterProxy(document, target);

		var listener = sinon.stub();
		target.on('click', listener);
		dom.triggerEvent(document, 'click');

		assert.strictEqual(1, listener.callCount);
	});

	it('should not proxy event emitter events after disposed', function() {
		var origin = new EventEmitter();
		var target = new EventEmitter();
		var proxy = new DomEventEmitterProxy(origin, target);

		var listener = sinon.stub();
		target.on('event1', listener);

		proxy.dispose();
		origin.emit('event1', 1, 2);
		assert.strictEqual(0, listener.callCount);
	});

	it('should not proxy dom events after disposed', function() {
		var origin = document.createElement('div');

		var target = new EventEmitter();
		var proxy = new DomEventEmitterProxy(origin, target);

		var listener = sinon.stub();
		target.on('click', listener);

		proxy.dispose();
		dom.triggerEvent(origin, 'click');
		assert.strictEqual(0, listener.callCount);
	});
});
