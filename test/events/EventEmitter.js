'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('EventEmitter', function() {
  beforeEach(function() {
    this.emitter = new lfr.EventEmitter();
  });

  afterEach(function() {
    this.emitter.removeAllListeners();
  });

  it('should work with namespaced events', function() {
    var listener = createStub();

    this.emitter.on('namespaced.event.1', listener);

    this.emitter.emit('namespaced');
    assert.strictEqual(0, listener.called);

    this.emitter.emit('namespaced.event.1');
    assert.strictEqual(1, listener.called);
  });

  it('should work with namespaced events with wildcards', function() {
    var listener1 = createStub();
    var listener2 = createStub();
    var listener3 = createStub();
    var listener4 = createStub();

    this.emitter.on('namespaced.event.1', listener1);
    this.emitter.on('namespaced.event.2', listener2);
    this.emitter.on('namespaced.event.*', listener3);
    this.emitter.on('namespaced.*.1', listener4);

    this.emitter.emit('namespaced.event.1');
    assert.strictEqual(1, listener1.called);
    assert.strictEqual(0, listener2.called);
    assert.strictEqual(1, listener3.called);
    assert.strictEqual(1, listener4.called);

    this.emitter.emit('namespaced.string.1');
    assert.strictEqual(1, listener1.called);
    assert.strictEqual(0, listener2.called);
    assert.strictEqual(1, listener3.called);
    assert.strictEqual(2, listener4.called);

    this.emitter.emit('*.event.*');
    assert.strictEqual(2, listener1.called);
    assert.strictEqual(1, listener2.called);
    assert.strictEqual(2, listener3.called);
    assert.strictEqual(3, listener4.called);
  });

  it('should listen to event a single time through `once`', function() {
    var listener = createStub();

    this.emitter.once('event', listener);
    assert.strictEqual(0, listener.called);

    this.emitter.emit('event');
    assert.strictEqual(1, listener.called);

    this.emitter.emit('event');
    assert.strictEqual(1, listener.called);
  });

  it('should listen to event a fixed number of times through `many`', function() {
    var listener = createStub();

    this.emitter.many('event', 2, listener);
    assert.strictEqual(0, listener.called);

    this.emitter.emit('event');
    assert.strictEqual(1, listener.called);

    this.emitter.emit('event');
    assert.strictEqual(2, listener.called);

    this.emitter.emit('event');
    assert.strictEqual(2, listener.called);
  });

  it('should detach events', function() {
    var listener = createStub();

    this.emitter.on('event', listener);
    assert.strictEqual(0, listener.called);

    this.emitter.emit('event');
    assert.strictEqual(1, listener.called);

    this.emitter.emit('event');
    assert.strictEqual(2, listener.called);

    this.emitter.off('event', listener);
    this.emitter.emit('event');
    assert.strictEqual(2, listener.called);
  });

  it('should detach events listened through `once`', function() {
    var listener = createStub();

    this.emitter.once('event', listener);
    this.emitter.off('event', listener);
    this.emitter.emit('event');

    assert.strictEqual(0, listener.called);
  });

  it('should detach events listened through `many`', function() {
    var listener = createStub();

    this.emitter.many('event', 2, listener);
    this.emitter.off('event', listener);
    this.emitter.emit('event');

    assert.strictEqual(0, listener.called);
  });

  it('should remove all listeners', function() {
    var listener1 = createStub();
    var listener2 = createStub();

    this.emitter.on('event1', listener1);
    this.emitter.on('event2', listener2);

    this.emitter.removeAllListeners();
    this.emitter.emit('event1');
    this.emitter.emit('event2');

    assert.strictEqual(0, listener1.called);
    assert.strictEqual(0, listener2.called);
  });

  it('should remove all listeners of the given type', function() {
    var listener1 = createStub();
    var listener2 = createStub();

    this.emitter.on('event1', listener1);
    this.emitter.on('event2', listener2);

    this.emitter.removeAllListeners('event1');
    this.emitter.emit('event1');
    assert.strictEqual(0, listener1.called);

    this.emitter.emit('event2');
    assert.strictEqual(1, listener2.called);
  });

  it('should warn when max number of listeners is reached', function() {
    var originalWarningFn = console.warn;
    console.warn = createStub();

    this.emitter.setMaxListeners(2);
    this.emitter.on('event', createStub());
    this.emitter.on('event', createStub());
    this.emitter.on('event1', createStub());
    assert.strictEqual(0, console.warn.called, 'Should not warn before max');

    this.emitter.on('event', createStub());
    assert.strictEqual(1, console.warn.called, 'Max listeners reached for event');

    this.emitter.on('event', createStub());
    assert.strictEqual(1, console.warn.called, 'Should not warn twice for same type');

    this.emitter.on('event1', createStub());
    this.emitter.on('event1', createStub());
    assert.strictEqual(2, console.warn.called, 'Max listeners reached for event1');

    console.warn = originalWarningFn;
  });
});

function createStub() {
  var stub = function() {
    stub.called++;
  };
  stub.called = 0;

  return stub;
}
