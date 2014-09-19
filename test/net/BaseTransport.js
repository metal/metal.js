'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('BaseTransport', function() {
  it('should transport uri be specified', function() {
    assert.throws(function() {
      new lfr.BaseTransport();
    }, Error, 'Should throw transport uri not specified');

    assert.doesNotThrow(function() {
      new lfr.BaseTransport('');
    });
  });

  it('should set and get uri', function() {
    var transport = new lfr.BaseTransport('');
    assert.strictEqual('', transport.getUri());

    transport.setUri('http://liferay.com');
    assert.strictEqual('http://liferay.com', transport.getUri());
  });

  it('should change state when open/close event is emitted', function() {
    var transport = new lfr.BaseTransport('');
    assert.strictEqual('', transport.getState());

    transport.emit('open');
    assert.strictEqual('open', transport.getState());

    transport.emit('close');
    assert.strictEqual('closed', transport.getState());
  });

});
