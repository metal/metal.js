'use strict';

var assert = require('assert');
var createFakeSocketIO = require('../fixture/FakeSocketIO');
require('../fixture/sandbox.js');

describe('HttpDbMechanism', function() {
  before(function() {
    global.FakeSocketIO = createFakeSocketIO();
  });

  beforeEach(function() {
    global.io = function() {
      return new global.FakeSocketIO();
    };
  });

  it('should throw error when uri is not specified', function() {
    assert.throws(function() {
      new lfr.HttpDbMechanism();
    }, Error);

    assert.doesNotThrow(function() {
      new lfr.HttpDbMechanism('');
    });
  });

  it('should set transport', function() {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    var xhrTransport = new lfr.XhrTransport('');
    mechanism.setTransport(xhrTransport);
    assert.strictEqual(xhrTransport, mechanism.getTransport());
  });

  it('should add message to the pending request queue on post', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');

    mechanism.once('request', function() {
      done();
    });

    mechanism.post({
      name: 'Pedro',
      age: 23
    });

    assert.strictEqual(1, mechanism.pendingRequests_.length);
  });

  it('should add message to the pending request queue on put', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');

    mechanism.once('request', function() {
      done();
    });

    mechanism.put({
      name: 'Pedro',
      age: 24
    });

    assert.strictEqual(1, mechanism.pendingRequests_.length);
  });

  it('should add message to the pending request queue on delete', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');

    mechanism.once('request', function() {
      done();
    });

    mechanism.delete({
      name: 'Pedro'
    });

    assert.strictEqual(1, mechanism.pendingRequests_.length);
  });

  it('should add message to the pending request queue on get', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');

    mechanism.once('request', function() {
      done();
    });

    mechanism.get({
      name: 'Pedro'
    });

    assert.strictEqual(1, mechanism.pendingRequests_.length);
  });

  it('should remove message from the pending request queue on data arriving', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');

    var queueMessage = mechanism.post({
      name: 'Pedro',
      age: 25
    });

    assert.strictEqual(1, mechanism.pendingRequests_.length);

    mechanism.on('data', function(event) {
      assert.strictEqual(event.messageId, queueMessage.messageId);

      done();
    });

    mechanism.getTransport().emit('data', {
      data: {
        messageId: queueMessage.messageId,
        status: {
          code: 0
        }
      }
    });
  });

  it('should not remove messages from pending request queue in case of message ID mismatch', function() {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');

    mechanism.post({
      name: 'Pedro',
      age: 25
    });

    assert.strictEqual(1, mechanism.pendingRequests_.length);

    mechanism.getTransport().emit('data', {
      data: {
        messageId: 'Invalid message Id',
        status: {
          code: 0
        }
      }
    });

    // Because of non matching Id, the queue should have still one item
    assert.strictEqual(1, mechanism.pendingRequests_.length);
  });

  it('should call callback function if provided once server returns response', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');

    var queueMessage = mechanism.post({
      name: 'Pedro',
      age: 25
    }, function() {
        done();
      });

    assert.strictEqual(1, mechanism.pendingRequests_.length);

    mechanism.getTransport().emit('data', {
      data: {
        messageId: queueMessage.messageId,
        status: {
          code: 0
        }
      }
    });
  });

  it('should try to resend messages if connection is lost', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    mechanism.setRetryDelayMs(5);

    var transport = mechanism.getTransport();
    transport.close();
    transport.on('close', function() {
      var queueMessage = mechanism.post({
        name: 'Pedro',
        age: 25
      });

      assert.strictEqual(1, mechanism.pendingRequests_.length);

      // Since transport is closed, queue will be processed on given timeout
      // and if transport is opened, pending messages will be resend.
      assert.ok(mechanism.retryTimeoutHandler_);

      // Transport is closed, so several interactions will pass but the messages in the
      // queue won't be send.
      var i = 0;
      var handler = setInterval(function() {
        // Assert the queue still has one item
        assert.strictEqual(1, mechanism.pendingRequests_.length);

        // On third iteration open the transport
        if (++i === 3) {
          mechanism.getTransport().open();

          // Simulate returned response from the server
          mechanism.getTransport().emit('data', {
            data: {
              messageId: queueMessage.messageId,
              status: {
                code: 0
              }
            }
          });
          clearInterval(handler);
          // Assert the queue has been processed.
          setTimeout(function() {
            assert.strictEqual(0, mechanism.pendingRequests_.length);
            done();
          }, 10);
        }
      }, 0);
    });
  });

  it('should not fail when request with transport closed', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    var transport = mechanism.getTransport();
    transport.close();
    transport.on('close', function() {
      mechanism.on('request', function() {
        assert.strictEqual(0, mechanism.pendingRequests_.length);
        done();
      });
      mechanism.emit('request');
    });
  });

});
