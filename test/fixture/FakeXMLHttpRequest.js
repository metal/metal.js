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
    clearTimeout(this.timer);
  };

  FakeXMLHttpRequest.prototype.open = lfr.nullFunction;

  FakeXMLHttpRequest.prototype.send = function(body) {
    this.body = body;

    if (this.status === 200 || this.status === 304) {
      this.timer = setTimeout(this.onload, 0);
    } else {
      this.timer = setTimeout(this.onerror, 0);
    }
  };

  FakeXMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    this.headers[header] = value;
  };

  return FakeXMLHttpRequest;
}

module.exports = createFakeXMLHttpRequest;