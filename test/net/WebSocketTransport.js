'use strict';

var assert = require('assert');
var sinon = require('sinon');
require('../fixture/sandbox.js');

describe('WebSocketTransport', function() {
  before(function() {
    global.FakeSocketIO = createFakeSocketIO();
  });

  beforeEach(function() {
    global.io = function() {
      return new global.FakeSocketIO();
    };
  });

  it('should throw error when Socket.IO not found', function() {
    var transport = new lfr.WebSocketTransport('http://liferay.com');
    global.io = null;
    assert.throws(function() {
      transport.open();
    }, Error);
  });

  it('should connection open', function(done) {
    var transport = new lfr.WebSocketTransport('http://liferay.com');
    var stubOpen = sinon.stub();
    transport.on('open', stubOpen);
    transport.open();
    // Waits connection to open asynchronously
    assert.strictEqual(0, stubOpen.callCount);
    setTimeout(function() {
      assert.strictEqual(1, stubOpen.callCount);
      done();
    }, 0);
  });

  it('should connection warn when open multiple times', function(done) {
    var originalWarningFn = console.warn;
    console.warn = sinon.stub();

    var transport = new lfr.WebSocketTransport('http://liferay.com');
    var stubOpen = sinon.stub();
    transport.on('open', stubOpen);
    transport.open();
    transport.open();
    transport.open();
    // Waits connection to open asynchronously
    assert.strictEqual(0, stubOpen.callCount);
    setTimeout(function() {
      assert.strictEqual(2, console.warn.callCount, 'Should warn when open');
      assert.strictEqual(1, stubOpen.callCount, 'Should not emit open twice');

      console.warn = originalWarningFn;
      done();
    }, 0);
  });

  it('should connection reopen without warn', function(done) {
    var originalWarningFn = console.warn;
    console.warn = sinon.stub();

    var transport = new lfr.WebSocketTransport('http://liferay.com');
    transport.close();

    var stubClose = sinon.stub();
    var stubOpen = sinon.stub();
    transport.on('close', stubClose);
    transport.on('open', stubOpen);
    transport.open();
    // Waits connection to open asynchronously
    assert.strictEqual(0, stubOpen.callCount);
    setTimeout(function() {
      assert.strictEqual(1, stubOpen.callCount);
      transport.close();
      // Waits connection to close asynchronously
      assert.strictEqual(0, stubClose.callCount);
      setTimeout(function() {
        transport.open();
        // Waits connection to open asynchronously
        assert.strictEqual(1, stubOpen.callCount);
        setTimeout(function() {
          assert.strictEqual(1, stubClose.callCount, 'Should not emit close twice');
          assert.strictEqual(2, stubOpen.callCount, 'Should emit open twice');
          assert.strictEqual(0, console.warn.callCount, 'Should warn when open');

          console.warn = originalWarningFn;
          done();
        }, 0);
      }, 0);
    }, 0);
  });

  it('should handle successful send message', function(done) {
    var transport = new lfr.WebSocketTransport('http://liferay.com');
    var stubMessage = sinon.stub();
    transport.on('message', stubMessage);
    transport.open();
    // Waits connection to open asynchronously
    setTimeout(function() {
      transport.send('message');
      // Waits connection to send asynchronously
      setTimeout(function() {
        assert.strictEqual('message', stubMessage.getCall(0).args[0].data, 'Should set message content');
        done();
      }, 0);
    }, 0);
  });

  it('should handle successful receive data', function(done) {
    var transport = new lfr.WebSocketTransport('http://liferay.com');
    var stubData = sinon.stub();
    transport.on('data', stubData);
    transport.open();
    // Waits connection to open asynchronously
    setTimeout(function() {
      transport.socket.emit('data', 'data');
      // Waits connection to send asynchronously
      setTimeout(function() {
        assert.strictEqual('data', stubData.getCall(0).args[0].data, 'Should receive emitted data');
        done();
      }, 0);
    }, 0);
  });

  it('should handle failing send data', function(done) {
    var transport = new lfr.WebSocketTransport('http://liferay.com');
    var stubError = sinon.stub();
    transport.on('error', stubError);

    transport.open();
    // Waits connection to open asynchronously
    setTimeout(function() {
      transport.send();
      transport.socket.emit('error', 'reason');
      // Waits connection to send asynchronously
      setTimeout(function() {
        var error = stubError.getCall(0).args[0].error;
        assert.ok(error instanceof Error);
        assert.ok(error.socket instanceof global.FakeSocketIO);
        assert.strictEqual('reason', error.message);
        done();
      }, 0);
    }, 0);
  });
});

function createFakeSocketIO() {
  var FakeSocketIO = function() {
    FakeSocketIO.base(this, 'constructor');
  };
  lfr.inherits(FakeSocketIO, lfr.EventEmitter);

  FakeSocketIO.prototype.close = function() {
    var self = this;
    setTimeout(function() {
      self.emit('disconnect');
    }, 0);
  };
  FakeSocketIO.prototype.open = function() {
    var self = this;
    setTimeout(function() {
      self.emit('connect');
    }, 0);
  };
  FakeSocketIO.prototype.send = function(message) {
    var self = this;
    setTimeout(function() {
      self.emit('message', message);
    }, 0);
  };
  return FakeSocketIO;
}
