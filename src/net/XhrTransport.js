(function() {

  'use strict';

  /**
   * Provides XMLHttpRequest implementation for transport.
   * @constructor
   * @extends {lfr.Transport}
   */
  lfr.XhrTransport = function(uri) {
    lfr.XhrTransport.base(this, 'constructor', uri);

    this.sendInstances_ = [];
  };
  lfr.inherits(lfr.XhrTransport, lfr.Transport);

  /**
   * Holds default http headers to set on request.
   * @type {Object}
   * @default {
   *   'X-Requested-With': 'XMLHttpRequest'
   * }
   * @protected
   */
  lfr.XhrTransport.prototype.httpHeaders_ = {
    'X-Requested-With': 'XMLHttpRequest'
  };

  /**
   * Holds default http method to set on request.
   * @type {string}
   * @default GET
   * @protected
   */
  lfr.XhrTransport.prototype.httpMethod_ = 'GET';

  /**
   * Holds the XMLHttpRequest sent objects.
   * @type {Array.<XMLHttpRequest>}
   * @default null
   * @protected
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
          data: self.decodeData(xhr.responseText)
        };
        self.emit('data', payload);
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
    var self = this;

    for (var i = 0; i < this.sendInstances_.length; i++) {
      this.sendInstances_[i].abort();
    }
    this.sendInstances_ = [];

    // TODO(eduardo): replace with nextTick.
    setTimeout(function() {
      self.emit('close');
    }, 0);

    return this;
  };

  /**
   * Gets the http headers.
   * @return {Object}
   */
  lfr.XhrTransport.prototype.getHttpHeaders = function() {
    return this.httpHeaders_;
  };

  /**
   * Gets the http method.
   * @return {string}
   */
  lfr.XhrTransport.prototype.getHttpMethod = function() {
    return this.httpMethod_;
  };

  /**
   * @inheritDoc
   */
  lfr.XhrTransport.prototype.open = function() {
    var self = this;

    if (this.isOpen()) {
      console.warn('Transport is already open');
      return;
    }

    this.emit('opening');
    // TODO(eduardo): replace with nextTick.
    setTimeout(function() {
      self.emit('open');
    }, 0);

    return this;
  };

  /**
   * Sets the http headers.
   * @param {Object} httpHeaders
   */
  lfr.XhrTransport.prototype.setHttpHeaders = function(httpHeaders) {
    this.httpHeaders_ = httpHeaders;
  };

  /**
   * Sets the http method.
   * @param {string} httpMethod
   */
  lfr.XhrTransport.prototype.setHttpMethod = function(httpMethod) {
    this.httpMethod_ = httpMethod;
  };

  /**
   * @inheritDoc
   */
  lfr.XhrTransport.prototype.write = function(packet) {
    var xhr = this.createXhr_();
    this.sendInstances_.push(xhr);
    xhr.send(packet);
  };

}());
