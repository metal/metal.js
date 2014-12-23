'use strict';

var assert = require('assert');
var sinon = require('sinon');
var createFakeSocketIO = require('../fixture/FakeSocketIO');
require('../fixture/sandbox.js');

describe('WebChannel', function() {
  before(function() {
    global.FakeSocketIO = createFakeSocketIO();
  });

  beforeEach(function() {
    global.io = function() {
      return new global.FakeSocketIO();
    };
    global.window.location = {
      origin: 'http://localhost',
      pathname: '/pathname'
    };
  });

  it('should not throw error when transport is specified', function() {
    assert.doesNotThrow(function() {
      new lfr.WebChannel(new lfr.WebSocketTransport(''));
    }, Error);
  });

  it('should not throw error when transport is not specified', function() {
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

  it('should retrieve the specified transport', function() {
    var transport = new lfr.WebSocketTransport('uri');
    var channel = new lfr.WebChannel(transport);
    assert.strictEqual(transport, channel.getTransport());
  });

  it('should retrieve the same transport if changed via setter', function() {
    var transport = new lfr.WebSocketTransport('uri');
    var channel = new lfr.WebChannel();
    channel.setTransport(transport);
    assert.strictEqual(transport, channel.getTransport());
  });

  it('should set timeout', function() {
    var channel = new lfr.WebChannel();
    channel.setTimeoutMs(0);
    assert.strictEqual(0, channel.getTimeoutMs());
  });

  it('should head message', function(done) {
    var channel = new lfr.WebChannel();
    var config = {};
    channel.head(Math.PI, config).then(function(data) {
      assert.strictEqual(data.config, config);
      assert.strictEqual(data.data, Math.PI);
      assert.strictEqual(data._method, lfr.WebChannel.HttpVerbs.HEAD);
      done();
    });
  });

  it('should patch message', function(done) {
    var channel = new lfr.WebChannel();
    var config = {};
    channel.patch(Math.PI, config).then(function(data) {
      assert.strictEqual(data.config, config);
      assert.strictEqual(data.data, Math.PI);
      assert.strictEqual(data._method, lfr.WebChannel.HttpVerbs.PATCH);
      done();
    });
  });

  it('should post message', function(done) {
    var channel = new lfr.WebChannel();
    var config = {};
    channel.post(Math.PI, config).then(function(data) {
      assert.strictEqual(data.config, config);
      assert.strictEqual(data.data, Math.PI);
      assert.strictEqual(data._method, lfr.WebChannel.HttpVerbs.POST);
      done();
    });
  });

  it('should put message', function(done) {
    var channel = new lfr.WebChannel();
    var config = {};
    channel.put(Math.PI, config).then(function(data) {
      assert.strictEqual(data.config, config);
      assert.strictEqual(data.data, Math.PI);
      assert.strictEqual(data._method, lfr.WebChannel.HttpVerbs.PUT);
      done();
    });
  });

  it('should get message', function(done) {
    var channel = new lfr.WebChannel();
    var config = {};
    channel.get(Math.PI, config).then(function(data) {
      assert.strictEqual(data.config, config);
      assert.strictEqual(data.data, Math.PI);
      assert.strictEqual(data._method, lfr.WebChannel.HttpVerbs.GET);
      done();
    });
  });

  it('should delete message', function(done) {
    var channel = new lfr.WebChannel();
    var config = {};
    channel.delete(Math.PI, config).then(function(data) {
      assert.strictEqual(data.config, config);
      assert.strictEqual(data.data, Math.PI);
      assert.strictEqual(data._method, lfr.WebChannel.HttpVerbs.DELETE);
      done();
    });
  });

  it('should timeout action', function(done) {
    var channel = new lfr.WebChannel();
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

  it('should send pending messages when transport reopens', function(done) {
    var channel = new lfr.WebChannel();
    channel.post(Math.PI).then(function(data) {
      assert.strictEqual(data.data, Math.PI);
      assert.strictEqual(data._method, lfr.WebChannel.HttpVerbs.POST);
      done();
    });
    assert.strictEqual(channel.pendingRequests_[0].status, lfr.WebChannel.MessageStatus.SENT);
    channel.getTransport().close();
    setTimeout(function() {
      assert.strictEqual(channel.pendingRequests_[0].status, lfr.WebChannel.MessageStatus.PENDING);
      channel.getTransport().open();
    }, 0);
  });

  it('should cancel pending messages when transport emits error', function(done) {
    var channel = new lfr.WebChannel();
    channel.post(Math.PI).thenCatch(function() {
      done();
    });
    channel.getTransport().emit('error', new Error('Number not known in this galaxy'));
  });

  it('should warn when malformed data arrives', function(done) {
    var originalWarningFn = console.warn;
    console.warn = sinon.stub();

    var channel = new lfr.WebChannel();
    channel.getTransport().on('data', function() {
      assert.strictEqual(1, console.warn.callCount);

      console.warn = originalWarningFn;
      done();
    });

    channel.getTransport().emit('data', null);
  });

  it('should not remove message from queue when mismatch message id arrives', function(done) {
    var channel = new lfr.WebChannel();
    channel.get().then(function() {
      done();
    });
    channel.getTransport().on('data', function() {
      assert.strictEqual(1, channel.pendingRequests_.length);
    });
    channel.getTransport().emit('data', {
      id: -1
    });
  });

  it('should dispose web channel', function() {
    var channel = new lfr.WebChannel();
    channel.dispose();
    assert.ok(!channel.getTransport());
  });

});
