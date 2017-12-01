'use strict';

import EventEmitter from '../src/EventEmitter';

describe('EventEmitter', function() {
	beforeEach(function() {
		this.emitter = new EventEmitter();
	});

	afterEach(function() {
		this.emitter.dispose();
	});

	it('should emit and listen to events', function() {
		let listener = sinon.stub();

		this.emitter.emit('event');
		assert.strictEqual(0, listener.callCount);

		this.emitter.on('event', listener);

		this.emitter.emit('event');
		assert.strictEqual(1, listener.callCount);
	});

	it('should listen to multiple events on the same call', function() {
		let listener = sinon.stub();

		this.emitter.on(['event1', 'event2'], listener);

		this.emitter.emit('event1');
		assert.strictEqual(1, listener.callCount);

		this.emitter.emit('event2');
		assert.strictEqual(2, listener.callCount);
	});

	it('should listen to events through `addListener`', function() {
		let listener = sinon.stub();

		this.emitter.addListener(['event1', 'event2'], listener);

		this.emitter.emit('event1');
		assert.strictEqual(1, listener.callCount);

		this.emitter.emit('event2');
		assert.strictEqual(2, listener.callCount);
	});

	it('should listen to event a single time through `once`', function() {
		let listener = sinon.stub();

		this.emitter.once('event', listener);
		assert.strictEqual(0, listener.callCount);

		this.emitter.emit('event');
		assert.strictEqual(1, listener.callCount);

		this.emitter.emit('event');
		assert.strictEqual(1, listener.callCount);
	});

	it('should listen to multiple events on the same call to `once`', function() {
		let listener = sinon.stub();

		this.emitter.once(['event', 'event2'], listener);
		assert.strictEqual(0, listener.callCount);

		this.emitter.emit('event');
		assert.strictEqual(1, listener.callCount);

		this.emitter.emit('event');
		assert.strictEqual(1, listener.callCount);

		this.emitter.emit('event2');
		assert.strictEqual(2, listener.callCount);

		this.emitter.emit('event2');
		assert.strictEqual(2, listener.callCount);
	});

	it('should listen to event a fixed number of times through `many`', function() {
		let listener = sinon.stub();

		this.emitter.many('event', 2, listener);
		assert.strictEqual(0, listener.callCount);

		this.emitter.emit('event');
		assert.strictEqual(1, listener.callCount);

		this.emitter.emit('event');
		assert.strictEqual(2, listener.callCount);

		this.emitter.emit('event');
		assert.strictEqual(2, listener.callCount);
	});

	it('should listen to multiple events on the same call to `many`', function() {
		let listener = sinon.stub();

		this.emitter.many(['event', 'event2'], 2, listener);

		this.emitter.emit('event');
		assert.strictEqual(1, listener.callCount);

		this.emitter.emit('event');
		assert.strictEqual(2, listener.callCount);

		this.emitter.emit('event');
		assert.strictEqual(2, listener.callCount);

		this.emitter.emit('event2');
		assert.strictEqual(3, listener.callCount);

		this.emitter.emit('event2');
		assert.strictEqual(4, listener.callCount);

		this.emitter.emit('event2');
		assert.strictEqual(4, listener.callCount);
	});

	it('should ignore calls to `many` with non positive number', function() {
		let listener = sinon.stub();

		this.emitter.many('event', 0, listener);
		this.emitter.emit('event');
		assert.strictEqual(0, listener.callCount);

		this.emitter.many('event', -1, listener);
		this.emitter.emit('event');
		assert.strictEqual(0, listener.callCount);
	});

	it('should run listeners in the order they were added', function() {
		let order = '';
		let listener1 = function() {
			order += '1';
		};
		let listener2 = function() {
			order += '2';
		};

		this.emitter.on('event', listener1);
		this.emitter.on('event', listener2);
		this.emitter.emit('event');

		assert.strictEqual(order, '12');
	});

	it('should return all listeners for given event type', function() {
		let listener1 = sinon.stub();
		let listener2 = sinon.stub();
		let listener3 = sinon.stub();

		this.emitter.on('event', listener1);
		this.emitter.on('anotherEvent', listener2);
		this.emitter.on('event', listener3, true);

		assert.deepEqual([listener1, listener3], this.emitter.listeners('event'));
		assert.deepEqual([listener2], this.emitter.listeners('anotherEvent'));
		assert.deepEqual([], this.emitter.listeners('noListeners'));
	});

	it('should detach events', function() {
		let listener = sinon.stub();
		let listener2 = sinon.stub();

		this.emitter.on('event', listener);
		this.emitter.on('event', listener2);

		this.emitter.off('event', listener2);
		this.emitter.emit('event');
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(0, listener2.callCount);
	});

	it('should detach listeners subscribed multiple times to same event', function() {
		let listener = sinon.stub();
		let listener2 = sinon.stub();

		this.emitter.on('event', listener);
		this.emitter.on('event', listener);
		this.emitter.on('event', listener);
		this.emitter.on('event', listener2);

		this.emitter.off('event', listener);
		this.emitter.emit('event');
		assert.strictEqual(0, listener.callCount);
		assert.strictEqual(1, listener2.callCount);
	});

	it('should detach events via return value', function() {
		let listener = sinon.stub();
		let listener2 = sinon.stub();

		this.emitter.on('event', listener);
		let handle = this.emitter.on('event', listener2);

		handle.removeListener();
		this.emitter.emit('event');
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(0, listener2.callCount);
	});

	it('should detach events that were listened together', function() {
		let listener = sinon.stub();
		let listener2 = sinon.stub();

		this.emitter.on(['event', 'event2'], listener);
		this.emitter.on(['event', 'event2'], listener2);
		this.emitter.off(['event', 'event2'], listener2);

		this.emitter.emit('event');
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(0, listener2.callCount);

		this.emitter.emit('event2');
		assert.strictEqual(2, listener.callCount);
		assert.strictEqual(0, listener2.callCount);
	});

	it('should detach multiple events with the same call', function() {
		let listener = sinon.stub();
		let listener2 = sinon.stub();

		this.emitter.on('event', listener);
		this.emitter.on('event2', listener);
		this.emitter.on('event2', listener2);
		this.emitter.off(['event', 'event2'], listener);

		this.emitter.emit('event');
		assert.strictEqual(0, listener.callCount);
		assert.strictEqual(0, listener2.callCount);

		this.emitter.emit('event2');
		assert.strictEqual(0, listener.callCount);
		assert.strictEqual(1, listener2.callCount);
	});

	it('should detach events that were listened together via return value', function() {
		let listener = sinon.stub();
		let listener2 = sinon.stub();

		this.emitter.on(['event', 'event2'], listener);
		let handle = this.emitter.on(['event', 'event2'], listener2);
		handle.removeListener();

		this.emitter.emit('event');
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(0, listener2.callCount);

		this.emitter.emit('event2');
		assert.strictEqual(2, listener.callCount);
		assert.strictEqual(0, listener2.callCount);
	});

	it('should detach events listened through `once`', function() {
		let listener = sinon.stub();

		this.emitter.once('event', listener);
		this.emitter.off('event', listener);
		this.emitter.emit('event');

		assert.strictEqual(0, listener.callCount);
	});

	it('should detach events listened through `once` via return value', function() {
		let listener = sinon.stub();

		let handle = this.emitter.once('event', listener);
		handle.removeListener();
		this.emitter.emit('event');

		assert.strictEqual(0, listener.callCount);
	});

	it('should detach events listened through `many`', function() {
		let listener = sinon.stub();

		this.emitter.many('event', 2, listener);
		this.emitter.off('event', listener);
		this.emitter.emit('event');

		assert.strictEqual(0, listener.callCount);
	});

	it('should detach events listened together through `many`', function() {
		let listener = sinon.stub();

		this.emitter.many(['event', 'event2'], 2, listener);
		this.emitter.off(['event', 'event2'], listener);

		this.emitter.emit('event');
		this.emitter.emit('event2');
		assert.strictEqual(0, listener.callCount);
	});

	it('should detach events listened together through `many` via return value', function() {
		let listener = sinon.stub();

		let handle = this.emitter.many(['event', 'event2'], 2, listener);
		handle.removeListener();

		this.emitter.emit('event');
		this.emitter.emit('event2');
		assert.strictEqual(0, listener.callCount);
	});

	it('should detach events listened through `many` via return value', function() {
		let listener = sinon.stub();

		let handle = this.emitter.many('event', 2, listener);
		handle.removeListener();
		this.emitter.emit('event');

		assert.strictEqual(0, listener.callCount);
	});

	it('should detach events through `removeListener`', function() {
		let listener = sinon.stub();
		let listener2 = sinon.stub();

		this.emitter.on('event', listener);
		this.emitter.on('event', listener2);

		this.emitter.removeListener('event', listener2);
		this.emitter.emit('event');
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual(0, listener2.callCount);
	});

	it('should not throw error when detaching event type that was never used before', function() {
		let listener = sinon.stub();
		assert.doesNotThrow(
			function() {
				this.emitter.off('event', listener);
			}.bind(this)
		);
	});

	it('should remove all listeners', function() {
		let listener1 = sinon.stub();
		let listener2 = sinon.stub();

		this.emitter.on('event1', listener1);
		this.emitter.on('event2', listener2);

		this.emitter.removeAllListeners();
		this.emitter.emit('event1');
		this.emitter.emit('event2');

		assert.strictEqual(0, listener1.callCount);
		assert.strictEqual(0, listener2.callCount);
	});

	it('should remove all listeners of the given type', function() {
		let listener1 = sinon.stub();
		let listener2 = sinon.stub();

		this.emitter.on('event1', listener1);
		this.emitter.on('event2', listener2);

		this.emitter.removeAllListeners('event1');
		this.emitter.emit('event1');
		assert.strictEqual(0, listener1.callCount);

		this.emitter.emit('event2');
		assert.strictEqual(1, listener2.callCount);
	});

	it('should remove all listeners of the given types', function() {
		let listener1 = sinon.stub();
		let listener2 = sinon.stub();
		let listener3 = sinon.stub();

		this.emitter.on('event1', listener1);
		this.emitter.on('event2', listener2);
		this.emitter.on('event3', listener3);

		this.emitter.removeAllListeners(['event1', 'event2']);
		this.emitter.emit('event1');
		assert.strictEqual(0, listener1.callCount);

		this.emitter.emit('event2');
		assert.strictEqual(0, listener2.callCount);

		this.emitter.emit('event3');
		assert.strictEqual(1, listener3.callCount);
	});

	it('should not throw error if trying to remove all listeners before any were subscribed', function() {
		assert.doesNotThrow(() => this.emitter.removeAllListeners());
	});

	it('should only allow functions as listeners', function() {
		let self = this;

		assert.throws(function() {
			self.emitter.addListener('event', {});
		}, TypeError);

		assert.throws(function() {
			self.emitter.off('event', {});
		}, TypeError);
	});

	it('should pass requested arguments to listener on emit', function() {
		let listener = sinon.stub();

		this.emitter.on('event', listener);
		this.emitter.emit('event', 'arg1', 2);

		sinon.assert.calledWithExactly(listener, 'arg1', 2);
	});

	it('should pass facade as last argument when requested', function() {
		let listener = sinon.stub();

		this.emitter.setShouldUseFacade(true);
		this.emitter.on('event', listener);
		this.emitter.emit('event', 'arg1', 2);

		sinon.assert.calledWithExactly(
			listener,
			'arg1',
			2,
			sinon.match({
				preventDefault: sinon.match.func,
				target: this.emitter,
				type: 'event',
			})
		);
	});

	it('should set preventedDefault flag to true on facade when preventDefault is called', function() {
		let listener = sinon.stub();

		this.emitter.setShouldUseFacade(true);
		this.emitter.once('event', function(event) {
			assert.ok(!event.preventedDefault);
			event.preventDefault();
		});
		this.emitter.once('event', listener);
		this.emitter.emit('event');

		assert.equal(1, listener.callCount);
		assert.ok(listener.args[0][0].preventedDefault);
	});

	it('should emit listener marked as default last', function() {
		let listener1 = sinon.stub();
		let listener2 = sinon.stub();
		let listenerDefault = sinon.spy(function() {
			assert.strictEqual(1, listener1.callCount);
			assert.strictEqual(1, listener2.callCount);
		});

		this.emitter.on('event', listenerDefault, true);
		this.emitter.on('event', listener1);
		this.emitter.on('event', listener2);
		this.emitter.emit('event');

		assert.strictEqual(1, listenerDefault.callCount);
	});

	it('should not call default listener if "preventDefault" is called', function() {
		let listener1 = sinon.spy(function(event) {
			event.preventDefault();
		});
		let listener2 = sinon.stub();
		let listenerDefault = sinon.stub();

		this.emitter.setShouldUseFacade(true);
		this.emitter.on('event', listenerDefault, true);
		this.emitter.on('event', listener1);
		this.emitter.on('event', listener2);
		this.emitter.emit('event');

		assert.strictEqual(0, listenerDefault.callCount);
		assert.strictEqual(1, listener1.callCount);
		assert.strictEqual(1, listener2.callCount);
	});

	it('should allow listening to all event types via "*"', function() {
		const listener = sinon.stub();
		this.emitter.setShouldUseFacade(true);
		this.emitter.on('*', listener);
		this.emitter.emit('event1');
		this.emitter.emit('event2');
		this.emitter.emit('event3');

		assert.equal(3, listener.callCount);
		assert.equal('event1', listener.args[0][0].type);
		assert.equal('event2', listener.args[1][0].type);
		assert.equal('event3', listener.args[2][0].type);
	});

	it('should remove all listeners on dispose', function() {
		let listener = sinon.stub();
		this.emitter.on('event', listener);

		this.emitter.dispose();
		this.emitter.emit('event');

		assert.strictEqual(0, listener.callCount);
	});
});
