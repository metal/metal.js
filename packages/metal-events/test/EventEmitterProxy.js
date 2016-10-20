'use strict';

import EventEmitter from '../src/EventEmitter';
import EventEmitterProxy from '../src/EventEmitterProxy';

describe.skip('EventEmitterProxy', function() {
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

	it('should not proxy event that is both whitelisted and blacklisted', function() {
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

	it('should not proxy "newListener" event from origin to target', function() {
		var origin = new EventEmitter();
		var target = new EventEmitter();
		new EventEmitterProxy(origin, target);

		var listener = sinon.stub();
		target.on('newListener', listener);
		origin.emit('newListener');

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

	it('should change the emitter that events are proxied from', function() {
		var origin = new EventEmitter();
		var target = new EventEmitter();
		var proxy = new EventEmitterProxy(origin, target);

		var listener = sinon.stub();
		target.on('event1', listener);

		var origin2 = new EventEmitter();
		proxy.setOriginEmitter(origin2);

		origin.emit('event1', 1, 2);
		assert.strictEqual(0, listener.callCount);

		origin2.emit('event1', 1, 2);
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(1, listener.args[0][0]);
		assert.strictEqual(2, listener.args[0][1]);
	});

	it('should remove listeners after changing the emitter that events were proxied from', function() {
		var target = new EventEmitter();
		var proxy = new EventEmitterProxy(new EventEmitter(), target);

		var listener = sinon.stub();
		target.on('event1', listener);

		var origin2 = new EventEmitter();
		proxy.setOriginEmitter(origin2);
		proxy.dispose();

		origin2.emit('event1', 1, 2);
		assert.strictEqual(0, listener.callCount);
	});

	it('should not throw error if origin emitter is set to null', function() {
		var origin = new EventEmitter();
		var target = new EventEmitter();
		var proxy = new EventEmitterProxy(origin, target);

		var listener = sinon.stub();
		target.on('event1', listener);

		assert.doesNotThrow(() => proxy.setOriginEmitter(null));
	});

	it('should pass proxied events to new origin emitters, even when no emitter exists for a while', function() {
		var origin = new EventEmitter();
		var target = new EventEmitter();
		var proxy = new EventEmitterProxy(origin, target);

		var listener = sinon.stub();
		target.on('event1', listener);

		proxy.setOriginEmitter(null);

		var origin2 = new EventEmitter();
		proxy.setOriginEmitter(origin2);

		origin.emit('event1', 1, 2);
		assert.strictEqual(0, listener.callCount);

		origin2.emit('event1', 1, 2);
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(1, listener.args[0][0]);
		assert.strictEqual(2, listener.args[0][1]);
	});

	it('should allow manually choosing events to be proxied', function() {
		var origin = new EventEmitter();
		var target = new EventEmitter();

		var listener = sinon.stub();
		target.on('event1', listener);

		var proxy = new EventEmitterProxy(origin, target);
		proxy.proxyEvent('event1');
		origin.emit('event1', 1, 2);

		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(1, listener.args[0][0]);
		assert.strictEqual(2, listener.args[0][1]);
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
