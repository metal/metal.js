'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('Transport', function() {
  it('should set uri from constructor', function() {
    var transport = new lfr.Transport('http://liferay.com');
    assert.strictEqual('http://liferay.com', transport.getBaseUri(), 'Should set uri from constructor');
  });

  it('should default state be empty', function() {
    var transport = new lfr.Transport('');
    assert.strictEqual('', transport.getState());
  });

  it('should throw error when a message is sent before open', function() {
    var transport = new lfr.Transport('');
    assert.throws(function() {
      transport.send(null);
    }, Error);
  });

  it('should throw error when a message is sent from abstract transport', function() {
    var transport = new lfr.Transport('');
    transport.setState('open');
    assert.throws(function() {
      transport.send(null);
    }, Error);
  });

  it('should throw error when uri is not specified', function() {
    assert.throws(function() {
      new lfr.Transport();
    }, Error);

    assert.doesNotThrow(function() {
      new lfr.Transport('');
    });
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
