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

  it('should warn when open multiple times', function() {
    var originalWarningFn = console.warn;
    console.warn = sinon.stub();

    var transport = new lfr.XhrTransport('http://liferay.com');
    var listener1 = sinon.stub();
    transport.on('open', listener1);
    transport.open();
    transport.open();
    transport.open();
    assert.strictEqual(1, listener1.callCount, 'Should not emit open twice');
    assert.strictEqual(2, console.warn.callCount, 'Should warn when open');

    console.warn = originalWarningFn;
  });

  it('should reopen without warn', function() {
    var originalWarningFn = console.warn;
    console.warn = sinon.stub();

    var transport = new lfr.XhrTransport('http://liferay.com');
    var listener1 = sinon.stub();
    transport.on('close', listener1);
    transport.open();
    transport.close();
    transport.open();
    assert.strictEqual(1, listener1.callCount, 'Should not emit open twice');
    assert.strictEqual(0, console.warn.callCount, 'Should warn when open');

    console.warn = originalWarningFn;
  });

  it('should queue pending requests', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(200, 'data');

    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    transport.send();
    transport.send();
    assert.strictEqual(2, transport.sendInstances_.length, 'Should queue requests');

    setTimeout(function() {
      assert.strictEqual(0, transport.sendInstances_.length, 'Should clear requests queue');
      done();
    }, 0);
  });

  it('should handle successful send data', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(200, 'data');

    var transport = new lfr.XhrTransport('http://liferay.com');
    var listener1 = sinon.stub();
    var listener2 = sinon.stub();
    transport.on('data', listener1);
    transport.on('message', listener2);
    transport.open();
    transport.send('body');

    var pendingXhr = global.XMLHttpRequest.requests[0];
    setTimeout(function() {
      assert.strictEqual('body', pendingXhr.body, 'Should set request body');
      assert.strictEqual(listener1.getCall(0).args[0].data, 'data', 'Should use responseText as event.data of data event');
      assert.strictEqual(listener2.getCall(0).args[0].data, 'data', 'Should use responseText as event.data of message event');
      done();
    }, 0);
  });

  it('should handle failing send data', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(404);

    var transport = new lfr.XhrTransport('http://liferay.com');
    var listener1 = sinon.stub();
    transport.on('error', listener1);

    transport.open();
    transport.send();

    setTimeout(function() {
      var error = listener1.getCall(0).args[0].error;
      assert.ok(error instanceof Error);
      assert.ok(error.xhr instanceof global.XMLHttpRequest);
      done();
    }, 0);
  });

  it('should fail on unknown response status', function(done) {
    global.XMLHttpRequest = createFakeXMLHttpRequest(304);

    var transport = new lfr.XhrTransport('http://liferay.com');
    var listener1 = sinon.stub();
    transport.on('error', listener1);

    transport.open();
    transport.send();

    setTimeout(function() {
      var error = listener1.getCall(0).args[0].error;
      assert.ok(error instanceof Error);
      assert.ok(error.xhr instanceof global.XMLHttpRequest);
      done();
    }, 0);
  });

  it('should abort requests when close', function() {
    global.XMLHttpRequest = createFakeXMLHttpRequest(200);

    var transport = new lfr.XhrTransport('http://liferay.com');
    transport.open();
    transport.send();

    var pendingXhr = global.XMLHttpRequest.requests[0];
    assert.ok(!pendingXhr.aborted);
    transport.close();
    assert.ok(pendingXhr.aborted);
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
