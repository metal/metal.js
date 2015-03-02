'use strict';

import {async} from '../../src/promise/Promise';

var createFakeXMLHttpRequest = function(status, responseText) {
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

  FakeXMLHttpRequest.prototype.open = function(method, uri) {
    this.method = method;
    this.uri = uri;
  };

  FakeXMLHttpRequest.prototype.send = function(body) {
    this.body = body;

    if (this.status === 200 || this.status === 304) {
      async.nextTick(this.onload);
    } else {
      async.nextTick(this.onerror);
    }
  };

  FakeXMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    this.headers[header] = value;
  };

  return FakeXMLHttpRequest;
};

export default createFakeXMLHttpRequest;
