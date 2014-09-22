'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('Transport', function() {
  it('should default state be empty', function() {
    var transport = new lfr.Transport('');
    assert.strictEqual('', transport.getState());
  });

  it('should not send packet when not open', function() {
    var transport = new lfr.Transport('');
    assert.throws(function() {
      transport.send(null);
    }, Error, 'Should throw error when transport is not open');
  });

  it('should not send packet from abstract transport', function() {
    var transport = new lfr.Transport('');
    transport.setState('open');
    assert.throws(function() {
      transport.send(null);
    }, Error, 'Should throw unimplemented abstract method error');
  });

  it('should transport uri be specified', function() {
    assert.throws(function() {
      new lfr.Transport();
    }, Error, 'Should throw transport uri not specified');

    assert.doesNotThrow(function() {
      new lfr.Transport('');
    });
  });

  it('should set and get uri', function() {
    var transport = new lfr.Transport('');
    assert.strictEqual('', transport.getUri());

    transport.setUri('http://liferay.com');
    assert.strictEqual('http://liferay.com', transport.getUri());
  });

  it('should change state when open/close event is emitted', function() {
    var transport = new lfr.Transport('');
    assert.strictEqual('', transport.getState());

    transport.emit('open');
    assert.strictEqual('open', transport.getState());

    transport.emit('close');
    assert.strictEqual('closed', transport.getState());
  });

});
