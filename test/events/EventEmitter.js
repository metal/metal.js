'use strict';

var assert = require('assert');
var sinon = require('sinon');
require('../fixture/sandbox.js');

describe('EventEmitter', function() {
  beforeEach(function() {
    this.emitter = new lfr.EventEmitter();
  });

  afterEach(function() {
    this.emitter.dispose();
  });

  it('should emit and listen to events', function() {
    var listener = sinon.stub();

    this.emitter.emit('event');
    assert.strictEqual(0, listener.callCount);

    this.emitter.on('event', listener);

    this.emitter.emit('event');
    assert.strictEqual(1, listener.callCount);
  });

  it('should work with namespaced events', function() {
    var listener = sinon.stub();

    this.emitter.on('namespaced.event.1', listener);

    this.emitter.emit('namespaced');
    assert.strictEqual(0, listener.callCount);

    this.emitter.emit('namespaced.event.1');
    assert.strictEqual(1, listener.callCount);
  });

  it('should work with namespaced events with wildcards', function() {
    var listener1 = sinon.stub();
    var listener2 = sinon.stub();
    var listener3 = sinon.stub();
    var listener4 = sinon.stub();

    this.emitter.on('namespaced.event.1', listener1);
    this.emitter.on('namespaced.event.2', listener2);
    this.emitter.on('namespaced.event.*', listener3);
    this.emitter.on('namespaced.*.1', listener4);

    this.emitter.emit('namespaced.event.1');
    assert.strictEqual(1, listener1.callCount);
    assert.strictEqual(0, listener2.callCount);
    assert.strictEqual(1, listener3.callCount);
    assert.strictEqual(1, listener4.callCount);

    this.emitter.emit('namespaced.string.1');
    assert.strictEqual(1, listener1.callCount);
    assert.strictEqual(0, listener2.callCount);
    assert.strictEqual(1, listener3.callCount);
    assert.strictEqual(2, listener4.callCount);

    this.emitter.emit('*.event.*');
    assert.strictEqual(2, listener1.callCount);
    assert.strictEqual(1, listener2.callCount);
    assert.strictEqual(2, listener3.callCount);
    assert.strictEqual(3, listener4.callCount);
  });

  it('should work with namespaced events using custom delimiter', function() {
    var listener1 = sinon.stub();
    var listener2 = sinon.stub();

    this.emitter.setDelimiter('::');
    this.emitter.on('namespaced::event::2', listener1);
    this.emitter.on('namespaced::*::1', listener2);

    this.emitter.emit('namespaced::event::1');
    assert.strictEqual(0, listener1.callCount);
    assert.strictEqual(1, listener2.callCount);

    this.emitter.emit('namespaced::string::1');
    assert.strictEqual(0, listener1.callCount);
    assert.strictEqual(2, listener2.callCount);

    this.emitter.emit('*::event::*');
    assert.strictEqual(1, listener1.callCount);
    assert.strictEqual(3, listener2.callCount);
  });

  it('should listen to multiple events on the same call', function() {
    var listener = sinon.stub();

    this.emitter.on(['namespaced.event', 'event'], listener);

    this.emitter.emit('namespaced.event');
    assert.strictEqual(1, listener.callCount);

    this.emitter.emit('event');
    assert.strictEqual(2, listener.callCount);
  });

  it('should listen to events through `addListener`', function() {
    var listener = sinon.stub();

    this.emitter.addListener(['namespaced.event', 'event'], listener);

    this.emitter.emit('namespaced.event');
    assert.strictEqual(1, listener.callCount);

    this.emitter.emit('event');
    assert.strictEqual(2, listener.callCount);
  });

  it('should listen to event a single time through `once`', function() {
    var listener = sinon.stub();

    this.emitter.once('event', listener);
    assert.strictEqual(0, listener.callCount);

    this.emitter.emit('event');
    assert.strictEqual(1, listener.callCount);

    this.emitter.emit('event');
    assert.strictEqual(1, listener.callCount);
  });

  it('should listen to multiple events on the same call to `once`', function() {
    var listener = sinon.stub();

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
    var listener = sinon.stub();

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
    var listener = sinon.stub();

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
    var listener = sinon.stub();

    this.emitter.many('event', 0, listener);
    this.emitter.emit('event');
    assert.strictEqual(0, listener.callCount);

    this.emitter.many('event', -1, listener);
    this.emitter.emit('event');
    assert.strictEqual(0, listener.callCount);
  });

  it('should detach events', function() {
    var listener = sinon.stub();
    var listener2 = sinon.stub();

    this.emitter.on('event', listener);
    this.emitter.on('event', listener2);

    this.emitter.off('event', listener2);
    this.emitter.emit('event');
    assert.strictEqual(1, listener.callCount);
    assert.strictEqual(0, listener2.callCount);
  });

  it('should detach listeners subscribed multiple times to same event', function() {
    var listener = sinon.stub();
    var listener2 = sinon.stub();

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
    var listener = sinon.stub();
    var listener2 = sinon.stub();

    this.emitter.on('event', listener);
    var handle = this.emitter.on('event', listener2);

    handle.removeListener();
    this.emitter.emit('event');
    assert.strictEqual(1, listener.callCount);
    assert.strictEqual(0, listener2.callCount);
  });

  it('should detach events that were listened together', function() {
    var listener = sinon.stub();
    var listener2 = sinon.stub();

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
    var listener = sinon.stub();
    var listener2 = sinon.stub();

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
    var listener = sinon.stub();
    var listener2 = sinon.stub();

    this.emitter.on(['event', 'event2'], listener);
    var handle = this.emitter.on(['event', 'event2'], listener2);
    handle.removeListener();

    this.emitter.emit('event');
    assert.strictEqual(1, listener.callCount);
    assert.strictEqual(0, listener2.callCount);

    this.emitter.emit('event2');
    assert.strictEqual(2, listener.callCount);
    assert.strictEqual(0, listener2.callCount);
  });

  it('should detach events listened through `once`', function() {
    var listener = sinon.stub();

    this.emitter.once('event', listener);
    this.emitter.off('event', listener);
    this.emitter.emit('event');

    assert.strictEqual(0, listener.callCount);
  });

  it('should detach events listened through `once` via return value', function() {
    var listener = sinon.stub();

    var handle = this.emitter.once('event', listener);
    handle.removeListener();
    this.emitter.emit('event');

    assert.strictEqual(0, listener.callCount);
  });

  it('should detach events listened through `many`', function() {
    var listener = sinon.stub();

    this.emitter.many('event', 2, listener);
    this.emitter.off('event', listener);
    this.emitter.emit('event');

    assert.strictEqual(0, listener.callCount);
  });

  it('should detach events listened together through `many`', function() {
    var listener = sinon.stub();

    this.emitter.many(['event', 'event2'], 2, listener);
    this.emitter.off(['event', 'event2'], listener);

    this.emitter.emit('event');
    this.emitter.emit('event2');
    assert.strictEqual(0, listener.callCount);
  });

  it('should detach events listened together through `many` via return value', function() {
    var listener = sinon.stub();

    var handle = this.emitter.many(['event', 'event2'], 2, listener);
    handle.removeListener();

    this.emitter.emit('event');
    this.emitter.emit('event2');
    assert.strictEqual(0, listener.callCount);
  });

  it('should detach events listened through `many` via return value', function() {
    var listener = sinon.stub();

    var handle = this.emitter.many('event', 2, listener);
    handle.removeListener();
    this.emitter.emit('event');

    assert.strictEqual(0, listener.callCount);
  });

  it('should detach events through `removeListener`', function() {
    var listener = sinon.stub();
    var listener2 = sinon.stub();

    this.emitter.on('event', listener);
    this.emitter.on('event', listener2);

    this.emitter.removeListener('event', listener2);
    this.emitter.emit('event');
    assert.strictEqual(1, listener.callCount);
    assert.strictEqual(0, listener2.callCount);
  });

  it('should remove all listeners', function() {
    var listener1 = sinon.stub();
    var listener2 = sinon.stub();

    this.emitter.on('event1', listener1);
    this.emitter.on('event2', listener2);

    this.emitter.removeAllListeners();
    this.emitter.emit('event1');
    this.emitter.emit('event2');

    assert.strictEqual(0, listener1.callCount);
    assert.strictEqual(0, listener2.callCount);
  });

  it('should remove all listeners of the given type', function() {
    var listener1 = sinon.stub();
    var listener2 = sinon.stub();

    this.emitter.on('event1', listener1);
    this.emitter.on('event2', listener2);

    this.emitter.removeAllListeners('event1');
    this.emitter.emit('event1');
    assert.strictEqual(0, listener1.callCount);

    this.emitter.emit('event2');
    assert.strictEqual(1, listener2.callCount);
  });

  it('should remove all listeners of the given types', function() {
    var listener1 = sinon.stub();
    var listener2 = sinon.stub();
    var listener3 = sinon.stub();

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

  it('should warn when max number of listeners is reached', function() {
    var originalWarningFn = console.warn;
    console.warn = sinon.stub();

    this.emitter.setMaxListeners(2);
    this.emitter.on('event', sinon.stub());
    this.emitter.on('event', sinon.stub());
    this.emitter.on('event1', sinon.stub());
    assert.strictEqual(0, console.warn.callCount, 'Should not warn before max');

    this.emitter.on(['event', 'event1'], sinon.stub());
    assert.strictEqual(1, console.warn.callCount, 'Max listeners reached for event');

    this.emitter.on('event', sinon.stub());
    assert.strictEqual(1, console.warn.callCount, 'Should not warn twice for same type');

    this.emitter.on('event1', sinon.stub());
    assert.strictEqual(2, console.warn.callCount, 'Max listeners reached for event1');

    console.warn = originalWarningFn;
  });

  it('should only allow functions as listeners', function() {
    var self = this;

    assert.throws(
      function() {
        self.emitter.addListener('event', {});
      },
      TypeError
    );

    assert.throws(
      function() {
        self.emitter.off('event', {});
      },
      TypeError
    );
  });

  it('should pass requested arguments to listener on emit', function() {
    var listener = sinon.stub();

    this.emitter.on('event', listener);
    this.emitter.emit('event', 'arg1', 2);

    sinon.assert.calledWithExactly(listener, 'arg1', 2);
  });

  it('should pass facade as first argument when requested', function() {
    var listener = sinon.stub();

    this.emitter.setShouldUseFacade(true);
    this.emitter.on('event', listener);
    this.emitter.emit('event', 'arg1', 2);

    sinon.assert.calledWithExactly(
      listener,
      sinon.match({ type: 'event' }),
      'arg1',
      2
    );
  });

  it('should dispose the listeners tree on dispose', function() {
    var tree = this.emitter.listenersTree_;

    this.emitter.dispose();
    assert.ok(tree.isDisposed());
    assert.ok(!this.emitter.listenersTree_);
  });
});
