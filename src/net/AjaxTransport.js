(function() {

  'use strict';

  /**
   * AjaxTransport utility.
   * @constructor
   * @extends {lfr.Transport}
   */
  lfr.AjaxTransport = function(uri) {
    lfr.AjaxTransport.base(this, 'constructor', uri);
  };
  lfr.inherits(lfr.AjaxTransport, lfr.Transport);

  /**
   * Holds default http headers to set on request.
   * @type {Object}
   * @default {
   *   'X-Requested-With': 'XMLHttpRequest'
   * }
   * @protected
   */
  lfr.AjaxTransport.prototype.httpHeaders = {
    'X-Requested-With': 'XMLHttpRequest'
  };

  /**
   * Holds default http method to set on request.
   * @type {string}
   * @default GET
   * @protected
   */
  lfr.AjaxTransport.prototype.httpMethod = 'GET';

  /**
   * Holds the XMLHttpRequest object while open.
   * @type {XMLHttpRequest}
   * @default null
   */
  lfr.AjaxTransport.prototype.xhr = null;

  /**
   * @inheritDoc
   */
  lfr.AjaxTransport.prototype.close = function() {
    this.xhr = null;
    this.emit('close');
  };

  /**
   * Gets the http headers.
   * @return {Object}
   */
  lfr.AjaxTransport.prototype.getHttpHeaders = function() {
    return this.httpHeaders;
  };

  /**
   * Gets the http method.
   * @return {string}
   */
  lfr.AjaxTransport.prototype.getHttpMethod = function() {
    return this.httpMethod;
  };

  /**
   * @inheritDoc
   */
  lfr.AjaxTransport.prototype.open = function() {
    var self = this;
    var state = this.getState();
    if (state === 'opening' || state === 'open') {
      this.close();
    }

    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      if (xhr.status === 200) {
        self.emit('data', {
          data: xhr.responseText
        });
        // AjaxTransport do not support persistent connections, waits nextTick
        // then auto-close it.
        setTimeout(lfr.bind(self.close, self), 0);
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
    };

    xhr.open(self.getHttpMethod(), this.getUri(), true);
    var headers = self.getHttpHeaders();
    if (headers) {
      for (var i in headers) {
        xhr.setRequestHeader(i, headers[i]);
      }
    }
    this.xhr = xhr;
    this.emit('open');
  };

  /**
   * Sets the http headers.
   * @param {Object} httpHeaders
   */
  lfr.AjaxTransport.prototype.setHttpHeaders = function(httpHeaders) {
    this.httpHeaders = httpHeaders;
  };

  /**
   * Sets the http method.
   * @param {string} httpMethod
   */
  lfr.AjaxTransport.prototype.setHttpMethod = function(httpMethod) {
    this.httpMethod = httpMethod;
  };

  /**
   * @inheritDoc
   */
  lfr.AjaxTransport.prototype.write = function(packets) {
    this.xhr.send(packets);
  };

}());
