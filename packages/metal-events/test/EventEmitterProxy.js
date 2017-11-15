'use strict';

import EventEmitter from '../src/EventEmitter';
import EventEmitterProxy from '../src/EventEmitterProxy';

describe('EventEmitterProxy', function() {
	it('should proxy event from origin to target', function() {
		let origin = new EventEmitter();
		let target = new EventEmitter();
		new EventEmitterProxy(origin, target);

		let listener = sinon.stub();
		target.on('event1', listener);
		origin.emit('event1', 1, 2);

		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(1, listener.args[0][0]);
		assert.strictEqual(2, listener.args[0][1]);
	});

	it('should not proxy blacklisted event', function() {
		let origin = new EventEmitter();
		let target = new EventEmitter();
		new EventEmitterProxy(origin, target, {
			event1: true,
		});

		let listener = sinon.stub();
		target.on('event1', listener);
		origin.emit('event1', 1, 2);

		assert.strictEqual(0, listener.callCount);
	});

	it('should proxy only whitelisted events', function() {
		let origin = new EventEmitter();
		let target = new EventEmitter();
		new EventEmitterProxy(origin, target, null, {
			event1: true,
		});

		let listener = sinon.stub();
		target.on('event1', listener);
		target.on('event2', listener);
		origin.emit('event1', 1, 2);
		origin.emit('event2', 1, 2);

		assert.strictEqual(1, listener.callCount);
	});

	it('should not proxy event that is both whitelisted and blacklisted', function() {
		let origin = new EventEmitter();
		let target = new EventEmitter();
		new EventEmitterProxy(
			origin,
			target,
			{
				event1: true,
			},
			{
				event1: true,
			}
		);

		let listener = sinon.stub();
		target.on('event1', listener);
		target.on('event2', listener);
		origin.emit('event1', 1, 2);
		origin.emit('event2', 1, 2);

		assert.strictEqual(0, listener.callCount);
	});

	it('should only emit proxied event once per listener', function() {
		let origin = new EventEmitter();
		let target = new EventEmitter();
		new EventEmitterProxy(origin, target);

		let listener1 = sinon.stub();
		target.on('event1', listener1);
		let listener2 = sinon.stub();
		target.on('event1', listener2);
		origin.emit('event1', 1, 2);

		assert.strictEqual(1, listener1.callCount);
		assert.strictEqual(1, listener2.callCount);
	});

	it('should change the emitter that events are proxied from', function() {
		let origin = new EventEmitter();
		let target = new EventEmitter();
		let proxy = new EventEmitterProxy(origin, target);

		let listener = sinon.stub();
		target.on('event1', listener);

		let origin2 = new EventEmitter();
		proxy.setOriginEmitter(origin2);

		origin.emit('event1', 1, 2);
		assert.strictEqual(0, listener.callCount);

		origin2.emit('event1', 1, 2);
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(1, listener.args[0][0]);
		assert.strictEqual(2, listener.args[0][1]);
	});

	it('should remove listeners after changing the emitter that events were proxied from', function() {
		let target = new EventEmitter();
		let proxy = new EventEmitterProxy(new EventEmitter(), target);

		let listener = sinon.stub();
		target.on('event1', listener);

		let origin2 = new EventEmitter();
		proxy.setOriginEmitter(origin2);
		proxy.dispose();

		origin2.emit('event1', 1, 2);
		assert.strictEqual(0, listener.callCount);
	});

	it('should not throw error if origin emitter is set to null', function() {
		let origin = new EventEmitter();
		let target = new EventEmitter();
		let proxy = new EventEmitterProxy(origin, target);

		let listener = sinon.stub();
		target.on('event1', listener);

		assert.doesNotThrow(() => proxy.setOriginEmitter(null));
	});

	it('should pass proxied events to new origin emitters, even when no emitter exists for a while', function() {
		let origin = new EventEmitter();
		let target = new EventEmitter();
		let proxy = new EventEmitterProxy(origin, target);

		let listener = sinon.stub();
		target.on('event1', listener);

		proxy.setOriginEmitter(null);

		let origin2 = new EventEmitter();
		proxy.setOriginEmitter(origin2);

		origin.emit('event1', 1, 2);
		assert.strictEqual(0, listener.callCount);

		origin2.emit('event1', 1, 2);
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(1, listener.args[0][0]);
		assert.strictEqual(2, listener.args[0][1]);
	});

	it('should allow manually choosing events to be proxied', function() {
		let origin = new EventEmitter();
		let target = new EventEmitter();

		let listener = sinon.stub();
		target.on('event1', listener);

		let proxy = new EventEmitterProxy(origin, target);
		proxy.proxyEvent('event1');
		origin.emit('event1', 1, 2);

		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(1, listener.args[0][0]);
		assert.strictEqual(2, listener.args[0][1]);
	});

	it('should not proxy events after disposed', function() {
		let origin = new EventEmitter();
		let target = new EventEmitter();
		let proxy = new EventEmitterProxy(origin, target);

		let listener = sinon.stub();
		target.on('event1', listener);

		proxy.dispose();
		origin.emit('event1', 1, 2);
		assert.strictEqual(0, listener.callCount);
	});
});
