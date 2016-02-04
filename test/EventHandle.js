'use strict';

import EventHandle from '../src/EventHandle';
import EventEmitter from '../src/EventEmitter';

describe('EventHandle', function() {
	it('should unsubscribe the listener', function() {
		var emitter = new EventEmitter();
		var listener = sinon.stub();
		var handle = new EventHandle(emitter, 'event', listener);

		emitter.on('event', listener);
		emitter.on('event2', listener);
		handle.removeListener();

		emitter.emit('event');
		assert.strictEqual(0, listener.callCount);

		emitter.emit('event2');
		assert.strictEqual(1, listener.callCount);
	});

	it('should not throw error when removing listener on disposed emitter', function() {
		var emitter = new EventEmitter();
		var listener = sinon.stub();
		var handle = new EventHandle(emitter, 'event', listener);

		emitter.dispose();
		handle.removeListener();
	});

	it('should remove listeners when disposed', function() {
		var emitter = new EventEmitter();
		var listener = sinon.stub();
		var handle = new EventHandle(emitter, 'event', listener);
		emitter.on('event', listener);
		handle.dispose();
		emitter.emit('event');
		assert.strictEqual(0, listener.callCount);
	});
});
