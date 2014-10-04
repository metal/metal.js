'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('WebChannel', function() {
  beforeEach(function() {
    global.window.location = {
      origin: 'http://localhost',
      pathname: '/pathname'
    };
  });

  it('should not throw error when web channel transport is specified', function() {
    assert.doesNotThrow(function() {
      new lfr.WebChannel(new lfr.WebChannelTransport());
    }, Error);
  });

  it('should not throw error when web channel transport is not specified', function() {
    assert.doesNotThrow(function() {
      new lfr.WebChannel();
    });
  });

  it('should throw error when web channel cannot resolve transport uri from window location', function() {
    global.window.location = null;
    assert.throws(function() {
      new lfr.WebChannel();
    });
  });

  it('should retrieve the specified web channel transport', function() {
    var channelTransport = new lfr.WebChannelTransport();
    var channel = new lfr.WebChannel(channelTransport);
    assert.strictEqual(channelTransport, channel.getWebChannelTransport());
  });

  it('should retrieve the same web channel transport if changed via setter', function() {
    var channelTransport = new lfr.WebChannelTransport();
    var channel = new lfr.WebChannel();
    channel.setWebChannelTransport(channelTransport);
    assert.strictEqual(channelTransport, channel.getWebChannelTransport());
  });

  it('should set timeout', function() {
    var FakeWebChannelTransport = createFakeWebChannelTransport();
    var channel = new lfr.WebChannel(new FakeWebChannelTransport());
    channel.setTimeoutMs(0);
    assert.strictEqual(0, channel.getTimeoutMs());
  });

  it('should head message', function(done) {
    var FakeWebChannelTransport = createFakeWebChannelTransport();
    var channel = new lfr.WebChannel(new FakeWebChannelTransport());
    channel.head(Math.PI).then(function(data) {
      assert.strictEqual(data, Math.PI);
      done();
    });
  });

  it('should patch message', function(done) {
    var FakeWebChannelTransport = createFakeWebChannelTransport();
    var channel = new lfr.WebChannel(new FakeWebChannelTransport());
    channel.patch(Math.PI).then(function(data) {
      assert.strictEqual(data, Math.PI);
      done();
    });
  });

  it('should post message', function(done) {
    var FakeWebChannelTransport = createFakeWebChannelTransport();
    var channel = new lfr.WebChannel(new FakeWebChannelTransport());
    channel.post(Math.PI).then(function(data) {
      assert.strictEqual(data, Math.PI);
      done();
    });
  });

  it('should put message', function(done) {
    var FakeWebChannelTransport = createFakeWebChannelTransport();
    var channel = new lfr.WebChannel(new FakeWebChannelTransport());
    channel.put(Math.PI).then(function(data) {
      assert.strictEqual(data, Math.PI);
      done();
    });
  });

  it('should get message', function(done) {
    var FakeWebChannelTransport = createFakeWebChannelTransport();
    var channel = new lfr.WebChannel(new FakeWebChannelTransport());
    channel.get(Math.PI).then(function(data) {
      assert.strictEqual(data, Math.PI);
      done();
    });
  });

  it('should delete message', function(done) {
    var FakeWebChannelTransport = createFakeWebChannelTransport();
    var channel = new lfr.WebChannel(new FakeWebChannelTransport());
    channel.delete(Math.PI).then(function(data) {
      assert.strictEqual(data, Math.PI);
      done();
    });
  });

  it('should timeout action', function(done) {
    var FakeWebChannelTransport = createFakeWebChannelTransport();
    var channel = new lfr.WebChannel(new FakeWebChannelTransport());
    channel.setTimeoutMs(0);
    channel.get(Math.PI)
      .thenCatch(function(reason) {
        assert.ok(reason instanceof Error);
        done();
      })
      .then(function() {
        assert.fail('Deferred should be cancelled with timeout error');
      });
  });

  function createFakeWebChannelTransport() {
    var FakeWebChannelTransport = function() {};
    var defer = function(data) {
      return new lfr.Promise(function(resolve) {
          setTimeout(function() {
            resolve(data);
          }, 10);
        });
    };
    FakeWebChannelTransport.prototype.delete = defer;
    FakeWebChannelTransport.prototype.get = defer;
    FakeWebChannelTransport.prototype.head = defer;
    FakeWebChannelTransport.prototype.patch = defer;
    FakeWebChannelTransport.prototype.post = defer;
    FakeWebChannelTransport.prototype.put = defer;
    return FakeWebChannelTransport;
  }

});
