'use strict';

import array from '../array/array';
import core from '../core';
import Transport from './Transport';

/**
 * Provides XMLHttpRequest implementation for transport.
 * @constructor
 * @extends {Transport}
 */
var XhrTransport = function(uri) {
  XhrTransport.base(this, 'constructor', uri);

  this.sendInstances_ = [];
};
core.inherits(XhrTransport, Transport);

/**
 * Holds the initial default config that should be used for this transport.
 * @type {Object}
 * @const
 * @static
 */
XhrTransport.INITIAL_DEFAULT_CONFIG = {
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  method: 'POST',
  responseType: 'html'
};

/**
 * Holds all the valid values for the `responseType` configuration option.
 * @type {Object}
 * @const
 * @static
 */
XhrTransport.ResponseTypes = {
  HTML: 'html',
  JSON: 'json'
};

/**
 * Holds the XMLHttpRequest sent objects.
 * @type {Array.<XMLHttpRequest>}
 * @default null
 * @protected
 */
XhrTransport.prototype.sendInstances_ = null;

/**
 * Makes a XMLHttpRequest instance already open.
 * @param {!Object} config
 * @param {function(!Object)} successFn
 * @param {function(!Object)} errorFn
 * @return {XMLHttpRequest}
 * @protected
 */
XhrTransport.prototype.createXhr_ = function(config, successFn, errorFn) {
  var xhr = new XMLHttpRequest();
  xhr.onload = core.bind(this.onXhrLoad_, this, xhr, config, successFn);
  xhr.onerror = core.bind(this.onXhrError_, this, xhr, errorFn);
  this.openXhr_(xhr, config.method);
  this.setXhrHttpHeaders_(xhr, config.headers);

  return xhr;
};

/**
 * @inheritDoc
 */
XhrTransport.prototype.close = function() {
  for (var i = 0; i < this.sendInstances_.length; i++) {
    this.sendInstances_[i].abort();
  }
  this.sendInstances_ = [];
  this.emitAsync_('close');
  return this;
};

/**
 * Encodes a data chunk to be sent.
 * @param {*} data
 * @param {!Object} config
 * @return {*}
 * @protected
 */
XhrTransport.prototype.encodeData = function(data, config) {
  if (config.headers['Content-Type'] === 'application/json') {
    return JSON.stringify(data);
  } else {
    return data;
  }
};

/**
 * Decodes a data chunk received.
 * @param {*} data
 * @param {!Object} config
 * @return {*}
 * @override
 * @protected
 */
XhrTransport.prototype.decodeData = function(data, config) {
  if (config.responseType === XhrTransport.ResponseTypes.JSON) {
    return JSON.parse(data);
  } else {
    return data;
  }
};

/**
 * TODO(eduardo): replace with nextTick when available.
 */
XhrTransport.prototype.emitAsync_ = function(event, data) {
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
XhrTransport.prototype.onXhrError_ = function(xhr, opt_error) {
  if (opt_error) {
    var errorResponse = {
      error: new Error('Transport request error')
    };
    errorResponse.error.xhr = xhr;
    opt_error(errorResponse);
  }
  array.remove(this.sendInstances_, xhr);
};

/**
 * Fired when an xhr's `load` event is triggered.
 * @param {!XMLHttpRequest} xhr The xhr request that triggered the event.
 * @param {!Object} config
 * @param {function(!Object)} opt_success Function that will be called if the
 *   request is successful.
 * @protected
 */
XhrTransport.prototype.onXhrLoad_ = function(xhr, config, opt_success) {
  if (xhr.status === 200) {
    if (opt_success) {
      opt_success(this.decodeData(xhr.responseText, config));
    }
    array.remove(this.sendInstances_, xhr);
  } else {
    xhr.onerror();
  }
};

/**
 * @inheritDoc
 */
XhrTransport.prototype.open = function() {
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
 * @param {string} method Optional method to override the default.
 * @protected
 */
XhrTransport.prototype.openXhr_ = function(xhr, method) {
  xhr.open(method, this.getUri(), true);
};

/**
 * Sets the http headers of the given xhr request.
 * @param {!XMLHttpRequest} xhr The xhr request to set the headers for.
 * @param {!Object} headers Optional headers to override the default.
 * @protected
 */
XhrTransport.prototype.setXhrHttpHeaders_ = function(xhr, headers) {
  for (var i in headers) {
    xhr.setRequestHeader(i, headers[i]);
  }
};

/**
 * @inheritDoc
 */
XhrTransport.prototype.write = function(message, config, opt_success, opt_error) {
  var xhr = this.createXhr_(config, opt_success, opt_error);
  this.sendInstances_.push(xhr);

  message = this.encodeData(message, config);
  this.emitAsync_('message', message);
  xhr.send(message);
};

export default XhrTransport;
