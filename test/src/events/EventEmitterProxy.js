'use strict';

import dom from '../../../src/dom/dom';
import features from '../../../src/dom/features';
import EventEmitter from '../../../src/events/EventEmitter';
import EventEmitterProxy from '../../../src/events/EventEmitterProxy';

describe('EventEmitterProxy', function() {
	afterEach(function() {
		document.body.innerHTML = '';
	});

	it('should proxy event from origin to target', function() {
		var origin = new EventEmitter();
		var target = new EventEmitter();
		new EventEmitterProxy(origin, target);

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
		new EventEmitterProxy(origin, target);

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
		new EventEmitterProxy(origin, target);

		var listener = sinon.stub();
		target.on('transitionend', listener);
		dom.triggerEvent(origin, features.checkAnimationEventName().transition);

		assert.strictEqual(1, listener.callCount);
	});

	it('should not proxy unsupported dom event from dom element', function() {
		var origin = document.createElement('div');
		origin.addEventListener = sinon.stub();

		var target = new EventEmitter();
		new EventEmitterProxy(origin, target);

		target.on('event1', sinon.stub());
		assert.strictEqual(0, origin.addEventListener.callCount);
	});

	it('should proxy event from document to target', function() {
		var target = new EventEmitter();
		new EventEmitterProxy(document, target);

		var listener = sinon.stub();
		target.on('click', listener);
		dom.triggerEvent(document, 'click');

		assert.strictEqual(1, listener.callCount);
	});

	it('should not proxy blacklisted event', function() {
		var origin = new EventEmitter();
		var target = new EventEmitter();
		new EventEmitterProxy(origin, target, {
			event1: true
		});

		var listener = sinon.stub();
		target.on('event1', listener);
		origin.emit('event1', 1, 2);

		assert.strictEqual(0, listener.callCount);
	});

	it('should proxy only whitelisted events', function() {
		var origin = new EventEmitter();
		var target = new EventEmitter();
		new EventEmitterProxy(origin, target, null, {
			event1: true
		});

		var listener = sinon.stub();
		target.on('event1', listener);
		target.on('event2', listener);
		origin.emit('event1', 1, 2);
		origin.emit('event2', 1, 2);

		assert.strictEqual(1, listener.callCount);
	});

	it('should not proxy whitelisted and blacklisted events at the same time', function() {
		var origin = new EventEmitter();
		var target = new EventEmitter();
		new EventEmitterProxy(origin, target, {
			event1: true
		}, {
			event1: true
		});

		var listener = sinon.stub();
		target.on('event1', listener);
		target.on('event2', listener);
		origin.emit('event1', 1, 2);
		origin.emit('event2', 1, 2);

		assert.strictEqual(0, listener.callCount);
	});

	it('should only emit proxied event once per listener', function() {
		var origin = new EventEmitter();
		var target = new EventEmitter();
		new EventEmitterProxy(origin, target);

		var listener1 = sinon.stub();
		target.on('event1', listener1);
		var listener2 = sinon.stub();
		target.on('event1', listener2);
		origin.emit('event1', 1, 2);

		assert.strictEqual(1, listener1.callCount);
		assert.strictEqual(1, listener2.callCount);
	});

	it('should not proxy events after disposed', function() {
		var origin = new EventEmitter();
		var target = new EventEmitter();
		var proxy = new EventEmitterProxy(origin, target);

		var listener = sinon.stub();
		target.on('event1', listener);

		proxy.dispose();
		origin.emit('event1', 1, 2);
		assert.strictEqual(0, listener.callCount);
	});

	it('should not proxy dom events after disposed', function() {
		var origin = document.createElement('div');

		var target = new EventEmitter();
		var proxy = new EventEmitterProxy(origin, target);

		var listener = sinon.stub();
		target.on('click', listener);

		proxy.dispose();
		dom.triggerEvent(origin, 'click');
		assert.strictEqual(0, listener.callCount);
	});
});
