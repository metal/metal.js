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

  it('should send post message', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    mechanism.on('request', function(requestData) {
      assert.strictEqual(Math.PI, requestData.message.data);
      assert.strictEqual(lfr.DbMechanism.STATUS_SENT, requestData.status);
      assert.strictEqual(lfr.HttpDbMechanism.METHOD_POST, requestData.message._method);
      done();
    });
    mechanism.post(Math.PI);
  });

  it('should send put message', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    mechanism.on('request', function(requestData) {
      assert.strictEqual(Math.PI, requestData.message.data);
      assert.strictEqual(lfr.DbMechanism.STATUS_SENT, requestData.status);
      assert.strictEqual(lfr.HttpDbMechanism.METHOD_PUT, requestData.message._method);
      done();
    });
    mechanism.put(Math.PI);
  });

  it('should send get message', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    mechanism.on('request', function(requestData) {
      assert.strictEqual(Math.PI, requestData.message.data);
      assert.strictEqual(lfr.DbMechanism.STATUS_SENT, requestData.status);
      assert.strictEqual(lfr.HttpDbMechanism.METHOD_GET, requestData.message._method);
      done();
    });
    mechanism.get(Math.PI);
  });

  it('should send delete message', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    mechanism.on('request', function(requestData) {
      assert.strictEqual(Math.PI, requestData.message.data);
      assert.strictEqual(lfr.DbMechanism.STATUS_SENT, requestData.status);
      assert.strictEqual(lfr.HttpDbMechanism.METHOD_DELETE, requestData.message._method);
      done();
    });
    mechanism.delete(Math.PI);
  });

  it('should add message to the queue', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    mechanism.on('request', function() {
      assert.strictEqual(1, mechanism.pendingRequests_.length);
      done();
    });
    mechanism.post(Math.PI);
  });

  it('should add message to the queue on put', function(done) {
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

  it('should add message to the queue on delete', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');

    mechanism.once('request', function() {
      done();
    });

    mechanism.delete({
      name: 'Pedro'
    });

    assert.strictEqual(1, mechanism.pendingRequests_.length);
  });

  it('should add message to the queue on get', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');

    mechanism.once('request', function() {
      done();
    });

    mechanism.get({
      name: 'Pedro'
    });

    assert.strictEqual(1, mechanism.pendingRequests_.length);
  });

  it('should remove message from the queue on data arriving', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');

    var queueMessage = mechanism.post({
      name: 'Pedro',
      age: 25
    });

    assert.strictEqual(1, mechanism.pendingRequests_.length);

    mechanism.on('data', function(data) {
      assert.strictEqual(data.id, queueMessage.message.id);
      assert.strictEqual(data.status, lfr.DbMechanism.STATUS_RECEIVED);

      done();
    });

    mechanism.getTransport().emit('data', {
      id: queueMessage.message.id,
      status: lfr.DbMechanism.STATUS_RECEIVED
    });
  });

  it('should not remove messages from queue in case of message ID mismatch', function() {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');

    mechanism.post({
      name: 'Pedro',
      age: 25
    });

    assert.strictEqual(1, mechanism.pendingRequests_.length);

    mechanism.getTransport().emit('data', {
      id: 'Invalid message Id',
      status: lfr.DbMechanism.STATUS_RECEIVED
    });

    // Because of non matching Id, the queue should have still one item
    assert.strictEqual(1, mechanism.pendingRequests_.length);
  });

  it('should call callback function if provided once server returns response', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');

    var queueMessage = mechanism.post(
      {
        name: 'Pedro',
        age: 25
      }, function(data) {
        assert.strictEqual(data.id, queueMessage.message.id);
        assert.strictEqual(data.status, lfr.DbMechanism.STATUS_RECEIVED);
        done();
      }
    );

    assert.strictEqual(1, mechanism.pendingRequests_.length);

    mechanism.getTransport().emit('data', {
      id: queueMessage.message.id,
      status: lfr.DbMechanism.STATUS_RECEIVED
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
            id: queueMessage.message.id,
            status: lfr.DbMechanism.STATUS_RECEIVED
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
        assert.strictEqual(1, mechanism.pendingRequests_.length);
        done();
      });
      mechanism.emit('request');
    });
  });

  it('should be able to change request data', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    var transport = mechanism.getTransport();
    mechanism.on('request', function(requestData) {
      requestData.message.pivot = 1;
    });
    transport.on('message', function(message) {
      assert.strictEqual(1, message.pivot);
      done();
    });
    mechanism.get();
  });

});
