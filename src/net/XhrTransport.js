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
        self.emit('data', {
          data: self.decodeData(xhr.responseText)
        });
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
    this.emitAsync_('close');
    return this;
  };

  /**
   * TODO(eduardo): replace with lfr.nextTick when available.
   */
  lfr.XhrTransport.prototype.emitAsync_ = function(event, data) {
    var self = this;
    clearTimeout(this.timer_);
    this.timer_ = setTimeout(function() {
      self.emit(event, data);
    }, 0);
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
    if (this.isOpen()) {
      console.warn('Transport is already open');
      return;
    }
    this.emit('opening');
    this.emitAsync_('open');
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
  lfr.XhrTransport.prototype.write = function(message) {
    var xhr = this.createXhr_();
    this.sendInstances_.push(xhr);
    this.emitAsync_('message', {
      data: message
    });
    xhr.send(message);
  };

}());
