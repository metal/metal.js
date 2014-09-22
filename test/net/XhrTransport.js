'use strict';

var assert = require('assert');
var sinon = require('sinon');
require('../fixture/sandbox.js');

describe('XhrTransport', function() {
  it('should set http method', function() {
    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.setHttpMethod('POST');
    assert.strictEqual('POST', transport.getHttpMethod(), 'Should warn when open');
  });

  it('should set http headers', function() {
    var transport = new lfr.XhrTransport('http://liferay.com');
    var headers = {
      foo: 1
    };
    transport.setHttpHeaders(headers);
    assert.strictEqual(headers, transport.getHttpHeaders(), 'Should set http headers');
  });

  it('should connection open', function(done) {
    var transport = new lfr.XhrTransport('http://liferay.com');
    var stubOpenListener = sinon.stub();
    transport.on('open', stubOpenListener);
    transport.open();
    // Waits connection to open asynchronously
    assert.strictEqual(0, stubOpenListener.callCount);
    setTimeout(function() {
      assert.strictEqual(1, stubOpenListener.callCount);
      done();
    }, 0);
  });

  it('should connection warn when open multiple times', function(done) {
    var originalWarningFn = console.warn;
    console.warn = sinon.stub();

    var transport = new lfr.XhrTransport('http://liferay.com');
    var stubOpenListener = sinon.stub();
    transport.on('open', stubOpenListener);
    transport.open();
    transport.open();
    transport.open();
    // Waits connection to open asynchronously
    assert.strictEqual(0, stubOpenListener.callCount);
    setTimeout(function() {
      assert.strictEqual(2, console.warn.callCount, 'Should warn when open');
      assert.strictEqual(1, stubOpenListener.callCount, 'Should not emit open twice');

      console.warn = originalWarningFn;
      done();
    }, 0);
  });

  it('should connection reopen without warn', function(done) {
    var originalWarningFn = console.warn;
    console.warn = sinon.stub();

    var transport = new lfr.XhrTransport('http://liferay.com');
    var stubCloseListener = sinon.stub();
    var stubOpenListener = sinon.stub();
    transport.on('close', stubCloseListener);
    transport.on('open', stubOpenListener);
    transport.open();
    // Waits connection to open asynchronously
    assert.strictEqual(0, stubOpenListener.callCount);
    setTimeout(function() {
      assert.strictEqual(1, stubOpenListener.callCount);
      transport.close();
      // Waits connection to close asynchronously
      assert.strictEqual(0, stubCloseListener.callCount);
      setTimeout(function() {
        transport.open();
        // Waits connection to open asynchronously
        assert.strictEqual(1, stubOpenListener.callCount);
        setTimeout(function() {
          assert.strictEqual(1, stubCloseListener.callCount, 'Should not emit close twice');
          assert.strictEqual(2, stubOpenListener.callCount, 'Should emit open twice');
          assert.strictEqual(0, console.warn.callCount, 'Should warn when open');

          console.warn = originalWarningFn;
          done();
        }, 0);
      }, 0);
    }, 0);
  });

  it('should queue pending requests', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(200, 'data');

    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    // Waits connection to open asynchronously
    setTimeout(function() {
      transport.send();
      transport.send();
      assert.strictEqual(2, transport.sendInstances_.length, 'Should queue requests');
      // Waits connection to send asynchronously
      setTimeout(function() {
        assert.strictEqual(0, transport.sendInstances_.length, 'Should clear requests queue');
        done();
      }, 0);
    }, 0);
  });

  it('should handle successful send data', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(200, 'data');

    var transport = new lfr.XhrTransport('http://liferay.com');
    var stubDataListener = sinon.stub();
    transport.on('data', stubDataListener);
    transport.open();
    // Waits connection to open asynchronously
    setTimeout(function() {
      transport.send('body');
      // Waits connection to send asynchronously
      setTimeout(function() {
        assert.strictEqual('body', global.XMLHttpRequest.requests[0].body, 'Should set request body');
        assert.strictEqual(stubDataListener.getCall(0).args[0].data, 'data', 'Should use responseText as event.data of data event');
        done();
      }, 0);
    }, 0);
  });

  it('should handle successful send data without http headers', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(200, 'data');

    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.setHttpHeaders(null);
    var stubDataListener = sinon.stub();
    transport.on('data', stubDataListener);
    transport.open();
    // Waits connection to open asynchronously
    setTimeout(function() {
      transport.send('body');
      // Waits connection to send asynchronously
      setTimeout(function() {
        assert.strictEqual('body', global.XMLHttpRequest.requests[0].body, 'Should set request body');
        assert.strictEqual(stubDataListener.getCall(0).args[0].data, 'data', 'Should use responseText as event.data of packet event');
        done();
      }, 0);
    }, 0);
  });

  it('should handle failing send data', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(404);

    var transport = new lfr.XhrTransport('http://liferay.com');
    var stubErrorListener = sinon.stub();
    transport.on('error', stubErrorListener);

    transport.open();
    // Waits connection to open asynchronously
    setTimeout(function() {
      transport.send();
      // Waits connection to send asynchronously
      setTimeout(function() {
        var error = stubErrorListener.getCall(0).args[0].error;
        assert.ok(error instanceof Error);
        assert.ok(error.xhr instanceof global.XMLHttpRequest);
        done();
      }, 0);
    }, 0);
  });

  it('should fail on unknown response status', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(304);

    var transport = new lfr.XhrTransport('http://liferay.com');
    var stubErrorListener = sinon.stub();
    transport.on('error', stubErrorListener);

    transport.open();
    // Waits connection to open asynchronously
    setTimeout(function() {
      transport.send();
      // Waits connection to send asynchronously
      setTimeout(function() {
        var error = stubErrorListener.getCall(0).args[0].error;
        assert.ok(error instanceof Error);
        assert.ok(error.xhr instanceof global.XMLHttpRequest);
        done();
      }, 0);
    }, 0);
  });

  it('should abort requests when close', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(200);

    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    // Waits connection to open asynchronously
    setTimeout(function() {
      transport.send();
      assert.ok(!global.XMLHttpRequest.requests[0].aborted);
      // Should abort xhr synchronously
      transport.close();
      assert.ok(global.XMLHttpRequest.requests[0].aborted);
      done();
    }, 0);
  });
});

function createFakeXMLHttpRequest(status, responseText) {
  var FakeXMLHttpRequest = function() {
    this.aborted = false;
    this.body = null;
    this.headers = {};
    this.responseText = responseText;
    this.status = status;
    FakeXMLHttpRequest.requests.push(this);
  };
  FakeXMLHttpRequest.prototype.abort = function() {
    this.aborted = true;
  };
  FakeXMLHttpRequest.prototype.open = lfr.nullFunction;
  FakeXMLHttpRequest.prototype.send = function(body) {
    this.body = body;
    if (this.status === 200 || this.status === 304) {
      setTimeout(this.onload, 0);
    } else {
      setTimeout(this.onerror, 0);
    }
  };
  FakeXMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    this.headers[header] = value;
  };
  FakeXMLHttpRequest.requests = [];
  return FakeXMLHttpRequest;
}
