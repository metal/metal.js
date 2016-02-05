'use strict';

import EventEmitter from '../src/EventEmitter';
import EventEmitterProxy from '../src/EventEmitterProxy';

describe('EventEmitterProxy', function() {
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
});
