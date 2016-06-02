'use strict';

import EventEmitter from '../src/EventEmitter';
import EventHandler from '../src/EventHandler';

describe('EventHandler', function() {
	it('should remove all added listeners', function() {
		var emitter1 = new EventEmitter();
		var emitter2 = new EventEmitter();
		var handler = new EventHandler();
		var listener1 = sinon.stub();
		var listener2 = sinon.stub();

		handler.add(
			emitter1.on('event1', listener1),
			emitter2.on('event2', listener2)
		);

		emitter1.on('event2', listener1);
		emitter2.on('event1', listener1);
		emitter2.on('event2', listener1);
		emitter1.on('event1', listener2);
		emitter1.on('event2', listener2);
		emitter2.on('event1', listener2);

		handler.removeAllListeners();

		emitter1.emit('event1');
		assert.strictEqual(0, listener1.callCount);
		assert.strictEqual(1, listener2.callCount);

		emitter1.emit('event2');
		assert.strictEqual(1, listener1.callCount);
		assert.strictEqual(2, listener2.callCount);

		emitter2.emit('event1');
		assert.strictEqual(2, listener1.callCount);
		assert.strictEqual(3, listener2.callCount);

		emitter2.emit('event2');
		assert.strictEqual(3, listener1.callCount);
		assert.strictEqual(3, listener2.callCount);
	});

	it('should clear listeners on dispose', function() {
		var emitter = new EventEmitter();
		var handler = new EventHandler();
		var listener = sinon.stub();

		handler.add(emitter.on('event', listener));
		handler.dispose();

		assert.ok(!handler.eventHandles_);
	});
});
