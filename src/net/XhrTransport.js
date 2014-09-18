(function() {

  'use strict';

  /**
   * XhrTransport utility.
   * @constructor
   * @extends {lfr.Transport}
   */
  lfr.XhrTransport = function(uri) {
    lfr.XhrTransport.base(this, 'constructor', uri);
  };
  lfr.inherits(lfr.XhrTransport, lfr.BaseTransport);

  /**
   * Holds default http headers to set on request.
   * @type {Object}
   * @default {
   *   'X-Requested-With': 'XMLHttpRequest'
   * }
   * @protected
   */
  lfr.XhrTransport.prototype.httpHeaders = {
    'X-Requested-With': 'XMLHttpRequest'
  };

  /**
   * Holds default http method to set on request.
   * @type {string}
   * @default GET
   * @protected
   */
  lfr.XhrTransport.prototype.httpMethod = 'GET';

  /**
   * Holds the XMLHttpRequest sent objects.
   * @type {Array.<XMLHttpRequest>}
   * @default null
   */
  lfr.XhrTransport.prototype.sendInstances_ = null;

  /**
   * Makes a XMLHttpRequest instance already open.
   * @return {XMLHttpRequest}
   * @protected
   */
  lfr.Transport.prototype.createXhr_ = function() {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      if (xhr.status === 200) {
        var payload = {
          data: xhr.responseText
        };
        self.emit('data', payload);
        self.emit('message', payload);
        lfr.array.remove(self.sendInstances_, xhr);
        return;
      }
      xhr.onerror();
    };
    xhr.onerror = function() {
      var error = new Error('Transport request error');
      error.xhr = xhr;
      self.emit('error', {
        error: error
      });
      lfr.array.remove(self.sendInstances_, xhr);
    };
    xhr.open(self.getHttpMethod(), this.getUri(), true);
    var headers = self.getHttpHeaders();
    if (headers) {
      for (var i in headers) {
        xhr.setRequestHeader(i, headers[i]);
      }
    }
    return xhr;
  };

  /**
   * @inheritDoc
   */
  lfr.XhrTransport.prototype.close = function() {
    for (var i = 0; i < this.sendInstances_.length; i++) {
      this.sendInstances_[i].abort();
    }
    this.sendInstances_ = [];
    this.emit('close');
  };

  /**
   * Gets the http headers.
   * @return {Object}
   */
  lfr.XhrTransport.prototype.getHttpHeaders = function() {
    return this.httpHeaders;
  };

  /**
   * Gets the http method.
   * @return {string}
   */
  lfr.XhrTransport.prototype.getHttpMethod = function() {
    return this.httpMethod;
  };

  /**
   * @inheritDoc
   */
  lfr.XhrTransport.prototype.open = function() {
    var state = this.getState();
    if (state === 'opening' || state === 'open') {
      console.warn('Transport is already open');
      return;
    }
    this.emit('open');
  };

  /**
   * Sets the http headers.
   * @param {Object} httpHeaders
   */
  lfr.XhrTransport.prototype.setHttpHeaders = function(httpHeaders) {
    this.httpHeaders = httpHeaders;
  };

  /**
   * Sets the http method.
   * @param {string} httpMethod
   */
  lfr.XhrTransport.prototype.setHttpMethod = function(httpMethod) {
    this.httpMethod = httpMethod;
  };

  /**
   * @inheritDoc
   */
  lfr.XhrTransport.prototype.write = function(data) {
    var xhr = this.createXhr_();
    this.sendInstances_.push(xhr);
    xhr.send(data);
  };

}());
