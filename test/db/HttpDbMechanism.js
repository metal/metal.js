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

  it('should add message to the queue on post', function(done) {
    var httpDbMechanism = new lfr.HttpDbMechanism('liferay.com');

    httpDbMechanism.once('addToQueue', function() {
      done();
    });

    httpDbMechanism.post({
      name: 'Pedro',
      age: 23
    });

    assert.strictEqual(1, httpDbMechanism.queue_.length);
  });

  it('should add message to the queue on put', function(done) {
    var httpDbMechanism = new lfr.HttpDbMechanism('liferay.com');

    httpDbMechanism.once('addToQueue', function() {
      done();
    });

    httpDbMechanism.put({
      name: 'Pedro',
      age: 24
    });

    assert.strictEqual(1, httpDbMechanism.queue_.length);
  });

  it('should add message to the queue on delete', function(done) {
    var httpDbMechanism = new lfr.HttpDbMechanism('liferay.com');

    httpDbMechanism.once('addToQueue', function() {
      done();
    });

    httpDbMechanism.delete({
      name: 'Pedro'
    });

    assert.strictEqual(1, httpDbMechanism.queue_.length);
  });

  it('should add message to the queue on get', function(done) {
    var httpDbMechanism = new lfr.HttpDbMechanism('liferay.com');

    httpDbMechanism.once('addToQueue', function() {
      done();
    });

    httpDbMechanism.get({
      name: 'Pedro'
    });

    assert.strictEqual(1, httpDbMechanism.queue_.length);
  });

  it('should remove message from the queue on data arriving', function(done) {
    var httpDbMechanism = new lfr.HttpDbMechanism('liferay.com');

    var queueMessage = httpDbMechanism.post({
      name: 'Pedro',
      age: 25
    });

    assert.strictEqual(1, httpDbMechanism.queue_.length);

    httpDbMechanism.on('data', function(event) {
      assert.strictEqual(event.messageId, queueMessage.messageId);

      done();
    });

    httpDbMechanism.getTransport().emit('data', {
      data: {
        messageId: queueMessage.messageId,
        status: {
          code: 0
        }
      }
    });
  });

  it('should not remove messages from queue in case of message ID mismatch', function() {
    var httpDbMechanism = new lfr.HttpDbMechanism('liferay.com');

    httpDbMechanism.post({
      name: 'Pedro',
      age: 25
    });

    assert.strictEqual(1, httpDbMechanism.queue_.length);

    httpDbMechanism.getTransport().emit('data', {
      data: {
        messageId: 'Invalid message Id',
        status: {
          code: 0
        }
      }
    });

    // Because of non matching Id, the queue should have still one item
    assert.strictEqual(1, httpDbMechanism.queue_.length);
  });

  it('should call callback function if provided once server returns response', function(done) {
    var httpDbMechanism = new lfr.HttpDbMechanism('liferay.com');

    var queueMessage = httpDbMechanism.post({
      name: 'Pedro',
      age: 25
    }, function() {
        done();
      });

    assert.strictEqual(1, httpDbMechanism.queue_.length);

    httpDbMechanism.getTransport().emit('data', {
      data: {
        messageId: queueMessage.messageId,
        status: {
          code: 0
        }
      }
    });
  });

  it('should try to resend messages if connection is lost', function(done) {
    var httpDbMechanism = new lfr.HttpDbMechanism('liferay.com');

    httpDbMechanism.getTransport().close();

    httpDbMechanism.setResendMessagesTimeout(50);

    var queueMessage;

    // Transport will be closed asynchronously, setTimeout is needed here
    setTimeout(function() {
      queueMessage = httpDbMechanism.post({
        name: 'Pedro',
        age: 25
      });

      assert.strictEqual(1, httpDbMechanism.queue_.length);

      // Since transport is closed, queue will be processed on given timeout
      // and if transport is opened, pending messages will be resend.
      assert.ok(httpDbMechanism.resendMessagesHandler_);

      var i = 0;

      // Transport is closed, so several interactions will pass but the messages in the
      // queue won't be send.
      var handler = setInterval(function() {
        // Assert the queue still has one item
        assert.strictEqual(1, httpDbMechanism.queue_.length);

        // On third iteration open the transport
        if (++i === 3) {
          httpDbMechanism.getTransport().open();

          // Simulate returned response from the server
          httpDbMechanism.getTransport().emit('data', {
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
            assert.strictEqual(0, httpDbMechanism.queue_.length);

            done();
          }, 100);
        }
      }, 20);
    }, 0);
  });

});
