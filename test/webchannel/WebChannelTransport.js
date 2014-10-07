'use strict';

var assert = require('assert');
var sinon = require('sinon');
var createFakeSocketIO = require('../fixture/FakeSocketIO');
require('../fixture/sandbox.js');

describe('WebChannelTransport', function() {
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

  it('should not throw error when transport is not specified', function() {
    assert.doesNotThrow(function() {
      new lfr.WebChannelTransport();
    }, Error);
  });

  it('should not throw error when transport is specified', function() {
    assert.doesNotThrow(function() {
      new lfr.WebChannelTransport(new lfr.WebSocketTransport(''));
    });
  });

  it('should retrieve the specified transport', function() {
    var transport = new lfr.WebSocketTransport('uri');
    var channelTransport = new lfr.WebChannelTransport(transport);
    assert.strictEqual(transport, channelTransport.getTransport());
  });

  it('should retrieve the same transport if changed via setter', function() {
    var transport = new lfr.WebSocketTransport('uri');
    var channelTransport = new lfr.WebChannelTransport();
    channelTransport.setTransport(transport);
    assert.strictEqual(transport, channelTransport.getTransport());
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

  it('should send pending messages when transport reopens', function(done) {
    var channelTransport = new lfr.WebChannelTransport();
    var channel = new lfr.WebChannel(channelTransport);
    channel.post(Math.PI).then(function(data) {
      assert.strictEqual(data.data, Math.PI);
      assert.strictEqual(data._method, lfr.WebChannel.HttpVerbs.POST);
      done();
    });
    assert.strictEqual(channelTransport.pendingRequests_[0].status, lfr.WebChannel.MessageStatus.SENT);
    channelTransport.getTransport().close();
    setTimeout(function() {
      assert.strictEqual(channelTransport.pendingRequests_[0].status, lfr.WebChannel.MessageStatus.PENDING);
      channelTransport.getTransport().open();
    }, 0);
  });

  it('should cancel pending messages when transport emits error', function(done) {
    var channelTransport = new lfr.WebChannelTransport();
    var channel = new lfr.WebChannel(channelTransport);
    channel.post(Math.PI).thenCatch(function() {
      done();
    });
    channelTransport.getTransport().emit('error', new Error('Number not known in this galaxy'));
  });

  it('should warn when malformed data arrives', function(done) {
    var originalWarningFn = console.warn;
    console.warn = sinon.stub();

    var channelTransport = new lfr.WebChannelTransport();
    channelTransport.getTransport().on('data', function() {
      assert.strictEqual(1, console.warn.callCount);

      console.warn = originalWarningFn;
      done();
    });

    channelTransport.getTransport().emit('data', null);
  });

  it('should not remove message from queue when mismatch message id arrives', function(done) {
    var channelTransport = new lfr.WebChannelTransport();
    var channel = new lfr.WebChannel(channelTransport);
    channel.get().then(function() {
      done();
    });
    channelTransport.getTransport().on('data', function() {
      assert.strictEqual(1, channelTransport.pendingRequests_.length);
    });
    channelTransport.getTransport().emit('data', {
      id: -1
    });
  });

  it('should dispose web channel transport', function() {
    var channel = new lfr.WebChannelTransport();
    channel.dispose();
    assert.ok(!channel.getTransport());
  });

});
