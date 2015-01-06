'use strict';

function createFakeXMLHttpRequest(status, responseText) {
  var FakeXMLHttpRequest = function() {
    this.aborted = false;
    this.body = null;
    this.headers = {};
    this.responseText = responseText;
    this.status = status;
    FakeXMLHttpRequest.requests.push(this);
  };

  FakeXMLHttpRequest.requests = [];

  FakeXMLHttpRequest.prototype.abort = function() {
    this.aborted = true;
  };

  FakeXMLHttpRequest.prototype.open = function(method) {
    this.method = method;
  };

  FakeXMLHttpRequest.prototype.send = function(body) {
    this.body = body;

    if (this.status === 200 || this.status === 304) {
      process.nextTick(this.onload);
    } else {
      process.nextTick(this.onerror);
    }
  };

  FakeXMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    this.headers[header] = value;
  };

  return FakeXMLHttpRequest;
}

module.exports = createFakeXMLHttpRequest;
