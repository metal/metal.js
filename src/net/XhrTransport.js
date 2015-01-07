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
   */
  lfr.XhrTransport.DEFAULT_HTTP_HEADERS = {
    'X-Requested-With': 'XMLHttpRequest'
  };

  /**
   * Holds default http method to set on request.
   * @type {string}
   */
  lfr.XhrTransport.DEFAULT_METHOD = 'POST';

  /**
   * Holds the XMLHttpRequest sent objects.
   * @type {Array.<XMLHttpRequest>}
   * @default null
   * @protected
   */
  lfr.XhrTransport.prototype.sendInstances_ = null;

  /**
   * Makes a XMLHttpRequest instance already open.
   * @param {Object} config
   * @param {function(!Object)} successFn
   * @param {function(!Object)} errorFn
   * @return {XMLHttpRequest}
   * @protected
   */
  lfr.Transport.prototype.createXhr_ = function(config, successFn, errorFn) {
    if (!config) {
      config = {};
    }

    var xhr = new XMLHttpRequest();
    xhr.onload = lfr.bind(this.onXhrLoad_, this, xhr, successFn);
    xhr.onerror = lfr.bind(this.onXhrError_, this, xhr, errorFn);
    this.openXhr_(xhr, config.method);
    this.setXhrHttpHeaders_(xhr, config.headers);

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
   * Fired when an xhr's `error` event is triggered.
   * @param {!XMLHttpRequest} xhr The xhr request that triggered the event.
   * @param {function(!Object)} opt_error Function that will be called for this error.
   * @protected
   */
  lfr.XhrTransport.prototype.onXhrError_ = function(xhr, opt_error) {
    if (opt_error) {
      var errorResponse = {
        error: new Error('Transport request error')
      };
      errorResponse.error.xhr = xhr;
      opt_error(errorResponse);
    }
    lfr.array.remove(this.sendInstances_, xhr);
  };

  /**
   * Fired when an xhr's `load` event is triggered.
   * @param {!XMLHttpRequest} xhr The xhr request that triggered the event.
   * @param {function(!Object)} opt_success Function that will be called if the
   *   request is successful.
   * @protected
   */
  lfr.XhrTransport.prototype.onXhrLoad_ = function(xhr, opt_success) {
    if (xhr.status === 200) {
      if (opt_success) {
        opt_success(this.decodeData(xhr.responseText));
      }
      lfr.array.remove(this.sendInstances_, xhr);
    } else {
      xhr.onerror();
    }
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
   * Opens the given xhr request.
   * @param {!XMLHttpRequest} xhr The xhr request to open.
   * @param {string=} opt_method Optional method to override the default.
   * @protected
   */
  lfr.XhrTransport.prototype.openXhr_ = function(xhr, opt_method) {
    var method = lfr.XhrTransport.DEFAULT_METHOD;
    if (opt_method) {
      method = opt_method;
    }
    xhr.open(method, this.getBaseUri(), true);
  };

  /**
   * Sets the http headers of the given xhr request.
   * @param {!XMLHttpRequest} xhr The xhr request to set the headers for.
   * @param {Object} opt_headers Optional headers to override the default.
   * @protected
   */
  lfr.XhrTransport.prototype.setXhrHttpHeaders_ = function(xhr, opt_headers) {
    var headers = lfr.XhrTransport.DEFAULT_HTTP_HEADERS;
    if (opt_headers) {
      headers = opt_headers;
    }
    for (var i in headers) {
      xhr.setRequestHeader(i, headers[i]);
    }
  };

  /**
   * @inheritDoc
   */
  lfr.XhrTransport.prototype.write = function(message, opt_config, opt_success, opt_error) {
    var xhr = this.createXhr_(opt_config, opt_success, opt_error);
    this.sendInstances_.push(xhr);
    this.emitAsync_('message', message);
    xhr.send(message);
  };

}());
