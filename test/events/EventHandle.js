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
});
