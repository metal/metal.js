'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('Transport', function() {
  it('should default state be empty', function() {
    var transport = new lfr.Transport();
    assert.strictEqual('', transport.getState());
  });

  it('should not send packet when not open', function() {
    var transport = new lfr.Transport();
    assert.throws(function() {
      transport.send(null);
    }, Error, 'Should throw error when transport is not open');
  });

  it('should not send packet from abstract transport', function() {
    var transport = new lfr.Transport();
    transport.setState('open');
    assert.throws(function() {
      transport.send(null);
    }, Error, 'Should throw unimplemented abstract method error');
  });

});
