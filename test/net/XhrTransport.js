'use strict';

var assert = require('assert');
var sinon = require('sinon');
var createFakeXMLHttpRequest = require('../fixture/FakeXMLHttpRequest');
require('../fixture/sandbox.js');

describe('XhrTransport', function() {
  beforeEach(function() {
    global.XMLHttpRequest = createFakeXMLHttpRequest(200, 'data');
  });

  it('should set uri from constructor', function() {
    var transport = new lfr.XhrTransport('http://liferay.com');
    assert.strictEqual('http://liferay.com', transport.getUri(), 'Should set uri from constructor');
  });

  it('should connection open', function(done) {
    var transport = new lfr.XhrTransport('http://liferay.com');
    var stubOpen = sinon.stub();
    transport.on('open', stubOpen);
    transport.open();
    assert.strictEqual(0, stubOpen.callCount, 'Should open be asynchronous');
    transport.on('open', function() {
      assert.strictEqual(1, stubOpen.callCount);
      done();
    });
  });

  it('should connection warn when open multiple times', function(done) {
    var originalWarningFn = console.warn;
    console.warn = sinon.stub();

    var transport = new lfr.XhrTransport('http://liferay.com');
    var stubOpen = sinon.stub();
    transport.on('open', stubOpen);
    transport.open();
    transport.open();
    transport.open();
    assert.strictEqual(0, stubOpen.callCount, 'Should open be asynchronous');
    transport.on('open', function() {
      assert.strictEqual(1, stubOpen.callCount, 'Should not emit open twice');
      assert.strictEqual(2, console.warn.callCount, 'Should warn when open');

      console.warn = originalWarningFn;
      done();
    });
  });

  it('should connection reopen without warn', function(done) {
    var originalWarningFn = console.warn;
    console.warn = sinon.stub();

    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.close();

    var stubClose = sinon.stub();
    var stubOpen = sinon.stub();
    transport.on('close', stubClose);
    transport.on('open', stubOpen);
    transport.open();
    assert.strictEqual(0, stubOpen.callCount, 'Should open be asynchronous');
    transport.once('open', function() {
      assert.strictEqual(1, stubOpen.callCount);
      transport.close();
      assert.strictEqual(0, stubClose.callCount, 'Should close be asynchronous');
      transport.once('close', function() {
        transport.open();
        assert.strictEqual(1, stubOpen.callCount, 'Should open be asynchronous');
        transport.once('open', function() {
          assert.strictEqual(1, stubClose.callCount, 'Should not emit close twice');
          assert.strictEqual(2, stubOpen.callCount, 'Should emit open twice');
          assert.strictEqual(0, console.warn.callCount, 'Should warn when open');

          console.warn = originalWarningFn;
          done();
        });
      });
    });
  });

  it('should queue pending requests', function(done) {
    var transport = new lfr.XhrTransport('http://liferay.com');

    var stubMessage = sinon.stub();
    transport.on('message', stubMessage);

    transport.open();
    transport.on('open', function() {
      transport.send();
      transport.send();
      assert.strictEqual(2, transport.sendInstances_.length, 'Should queue requests be synchronous');
      transport.close();
      transport.on('close', function() {
        assert.strictEqual(0, transport.sendInstances_.length, 'Should clear requests queue after sending all');
        done();
      });
    });
  });

  it('should handle successful send message', function(done) {
    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    transport.on('open', function() {
      transport.on('message', function(data) {
        assert.strictEqual('message', data, 'Should set request message');
        done();
      });
      transport.send('message');
    });
  });

  it('should handle successful received data', function(done) {
    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    transport.on('open', function() {
      transport.send({}, {}, function(data) {
        assert.strictEqual('data', data, 'Should use responseText as data');
        done();
      });
    });
  });

  it('should send request using the default method', function() {
    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    transport.send('message');
    assert.strictEqual(1, XMLHttpRequest.requests.length);

    var request = XMLHttpRequest.requests[0];
    assert.strictEqual('POST', request.method);
  });

  it('should send request using the requested method', function() {
    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    transport.send('message', {
      method: 'GET'
    });
    assert.strictEqual(1, XMLHttpRequest.requests.length);

    var request = XMLHttpRequest.requests[0];
    assert.strictEqual('GET', request.method);
  });

  it('should send request using the requested headers', function() {
    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    transport.send('message', {
      headers: {
        header1: 'header1Value'
      }
    });
    assert.strictEqual(1, XMLHttpRequest.requests.length);

    var request = XMLHttpRequest.requests[0];
    assert.strictEqual('header1Value', request.headers.header1);
  });

  it('should not run success handler for failures', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(404);

    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    transport.on('open', function() {
      var successFn = sinon.stub();
      transport.send({}, {}, successFn);
      process.nextTick(function() {
        assert.strictEqual(0, successFn.callCount);
        done();
      });
    });
  });

  it('should handle failing send data', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(404);

    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    transport.on('open', function() {
      transport.send({}, {}, null, function(response) {
        var error = response.error;
        assert.ok(error instanceof Error);
        assert.ok(error.xhr instanceof global.XMLHttpRequest);
        done();
      });
    });
  });

  it('should fail on unknown response status', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(304);

    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    transport.on('open', function() {
      transport.send({}, {}, null, function(response) {
        var error = response.error;
        assert.ok(error instanceof Error);
        assert.ok(error.xhr instanceof global.XMLHttpRequest);
        done();
      });
    });
  });

  it('should abort requests when close', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(200);

    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    transport.on('open', function() {
      transport.send();
      assert.ok(!global.XMLHttpRequest.requests[0].aborted);
      // Should abort xhr synchronously
      transport.close();
      assert.ok(global.XMLHttpRequest.requests[0].aborted);
      done();
    });
  });

  it('should abort requests when disposed', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(200);

    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    transport.on('open', function() {
      transport.send();
      assert.ok(!global.XMLHttpRequest.requests[0].aborted);
      // Should abort xhr synchronously
      transport.dispose();
      assert.ok(global.XMLHttpRequest.requests[0].aborted);
      done();
    });
  });
});
