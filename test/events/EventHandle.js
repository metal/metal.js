'use strict';

var assert = require('assert');
var sinon = require('sinon');
require('../fixture/sandbox.js');

describe('EventHandle', function() {
  it('should unsubscribe the listener', function() {
    var emitter = new lfr.EventEmitter();
    var listener = sinon.stub();
    var handle = new lfr.EventHandle(emitter, 'event', listener);

    emitter.on('event', listener);
    emitter.on('event2', listener);
    handle.removeListener();

    emitter.emit('event');
    assert.strictEqual(0, listener.callCount);

    emitter.emit('event2');
    assert.strictEqual(1, listener.callCount);
  });

  it('should not throw error when removing listener on disposed emitter', function() {
    var emitter = new lfr.EventEmitter();
    var listener = sinon.stub();
    var handle = new lfr.EventHandle(emitter, 'event', listener);

    emitter.dispose();
    handle.removeListener();
  });

  it('should delete emitter and listener references when disposed', function() {
    var emitter = new lfr.EventEmitter();
    var listener = sinon.stub();
    var handle = new lfr.EventHandle(emitter, 'event', listener);

    handle.dispose();
    assert.ok(!handle.emitter_);
    assert.ok(!handle.listener_);
  });
});
