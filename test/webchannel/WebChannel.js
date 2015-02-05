'use strict';

import createFakeSocketIO from '../fixture/FakeSocketIO';
import FakeTransport from '../fixture/FakeTransport';
import WebChannel from '../../src/webchannel/WebChannel';
import WebSocketTransport from '../../src/net/WebSocketTransport';

var FakeSocketIO = createFakeSocketIO();

describe('WebChannel', function() {
  describe('default transport', function() {
    before(function() {
      window.io = function() {
        return new FakeSocketIO();
      };
    });

    after(function() {
      window.io = null;
    });

    it('should not throw error when transport is not specified', function() {
      assert.doesNotThrow(function() {
        new WebChannel();
      });
    });

    it('should default to web socket when transport is not specified', function() {
      var channel = new WebChannel();
      var transport = channel.getTransport();
      assert.ok(transport instanceof WebSocketTransport);
      assert.strictEqual(window.location.origin + window.location.pathname, transport.getUri());
    });
  });

  it('should not throw error when transport is specified', function() {
    assert.doesNotThrow(function() {
      new WebChannel(new FakeTransport(''));
    }, Error);
  });

  it('should retrieve the specified transport', function() {
    var transport = new FakeTransport('uri');
    var channel = new WebChannel(transport);
    assert.strictEqual(transport, channel.getTransport());
  });

  it('should set timeout', function() {
    var channel = new WebChannel(new FakeTransport('uri'));
    channel.setTimeoutMs(0);
    assert.strictEqual(0, channel.getTimeoutMs());
  });

  it('should head message', function(done) {
    assertRequestSent('head', WebChannel.HttpVerbs.HEAD, done);
  });

  it('should patch message', function(done) {
    assertRequestSent('patch', WebChannel.HttpVerbs.PATCH, done);
  });

  it('should post message', function(done) {
    assertRequestSent('post', WebChannel.HttpVerbs.POST, done);
  });

  it('should put message', function(done) {
    assertRequestSent('put', WebChannel.HttpVerbs.PUT, done);
  });

  it('should get message', function(done) {
    assertRequestSent('get', WebChannel.HttpVerbs.GET, done);
  });

  it('should delete message', function(done) {
    assertRequestSent('delete', WebChannel.HttpVerbs.DELETE, done);
  });

  it('should timeout action', function(done) {
    var channel = new WebChannel(new FakeTransport('uri'));
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
    var channel = new WebChannel(new FakeTransport('uri'));
    channel.post(Math.PI).then(function(data) {
      assert.strictEqual(data, Math.PI);
      done();
    });
    assert.strictEqual(channel.pendingRequests_[0].status, WebChannel.MessageStatus.SENT);
    channel.getTransport().close();
    setTimeout(function() {
      assert.strictEqual(channel.pendingRequests_[0].status, WebChannel.MessageStatus.PENDING);
      channel.getTransport().open();
    }, 0);
  });

  it('should cancel message when it receives error response', function(done) {
    var transport = new FakeTransport('uri');
    var channel = new WebChannel(transport);
    var firstRequest = channel.post(Math.PI);

    // Simulate an error response for the next request.
    sinon.stub(transport, 'write', function(message, config, success, error) {
      setTimeout(function() {
        error();
      }, 0);
    });

    channel.post(Math.PI).thenCatch(function() {
      firstRequest.then(function() {
        done();
      });
    });
  });

  it('should cancel pending messages when transport emits error', function(done) {
    var transport = new FakeTransport('uri');
    var channel = new WebChannel(transport);
    var firstRequest = channel.post(Math.PI);
    var secondRequest = channel.post(Math.PI);

    firstRequest.thenCatch(function() {
      secondRequest.thenCatch(function() {
        done();
      });
    });

    transport.emit('error', new Error('Number not known in this galaxy'));
  });

  it('should not remove message from queue when mismatch message id arrives', function(done) {
    var channel = new WebChannel(new FakeTransport('uri'));
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

  it('should emit events from transport', function() {
    var transport = new FakeTransport('uri');
    var channel = new WebChannel(transport);

    var listener = sinon.stub();
    channel.on('event1', listener);
    transport.emit('event1');
    assert.strictEqual(1, listener.callCount);
  });

  it('should dispose web channel', function(done) {
    var channel = new WebChannel(new FakeTransport('uri'));
    channel.getTransport().once('close', function() {
      done();
    });
    channel.dispose();
  });
});

function assertRequestSent(sendFnName, httpVerb, done) {
  var transport = new FakeTransport('uri');
  sinon.spy(transport, 'send');

  var channel = new WebChannel(transport);
  var config = {
    config1: 'config1Value'
  };
  channel[sendFnName](Math.PI, config).then(function(data) {
    assert.strictEqual(data, Math.PI);
    assert.strictEqual(1, transport.send.callCount);

    var call = transport.send.getCall(0);
    assert.strictEqual(Math.PI, call.args[0]);
    assert.strictEqual(httpVerb, call.args[1].method);
    assert.strictEqual('config1Value', call.args[1].config1);

    done();
  });
}
