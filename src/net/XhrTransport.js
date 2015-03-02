'use strict';

import array from '../array/array';
import core from '../core';
import Transport from './Transport';

/**
 * Provides XMLHttpRequest implementation for transport.
 * @param {string} uri
 * @constructor
 * @extends {Transport}
 */
class XhrTransport extends Transport {
  constructor(uri) {
    super(uri);

    this.sendInstances_ = [];
  }

  /**
   * @inheritDoc
   */
  close() {
    for (var i = 0; i < this.sendInstances_.length; i++) {
      this.sendInstances_[i].abort();
    }
    this.sendInstances_ = [];
    this.emitAsync_('close');
    return this;
  }

  /**
   * Encodes a data chunk to be sent.
   * @param {*} data
   * @param {!Object} config
   * @return {*}
   * @protected
   */
  encodeData(data, config) {
    if (config.headers['Content-Type'] === 'application/json') {
      return JSON.stringify(data);
    } else {
      return data;
    }
  }

  /**
   * Decodes a data chunk received.
   * @param {*} data
   * @param {!Object} config
   * @return {*}
   * @override
   * @protected
   */
  decodeData(data, config) {
    if (config.responseType === XhrTransport.ResponseTypes.JSON) {
      return JSON.parse(data);
    } else {
      return data;
    }
  }

  /**
   * TODO(eduardo): replace with nextTick when available.
   */
  emitAsync_(event, data) {
    var self = this;
    clearTimeout(this.timer_);
    this.timer_ = setTimeout(function() {
      self.emit(event, data);
    }, 0);
  }

  /**
   * Fired when an xhr's `error` event is triggered.
   * @param {!XMLHttpRequest} xhr The xhr request that triggered the event.
   * @param {function(!Object)} opt_error Function that will be called for this error.
   * @protected
   */
  onXhrError_(xhr, opt_error) {
    if (opt_error) {
      var errorResponse = {
        error: new Error('Transport request error')
      };
      errorResponse.error.xhr = xhr;
      opt_error(errorResponse);
    }
    array.remove(this.sendInstances_, xhr);
  }

  /**
   * Fired when an xhr's `load` event is triggered.
   * @param {!XMLHttpRequest} xhr The xhr request that triggered the event.
   * @param {!Object} config
   * @param {function(!Object)} opt_success Function that will be called if the
   *   request is successful.
   * @protected
   */
  onXhrLoad_(xhr, config, opt_success) {
    if (xhr.status === 200) {
      if (opt_success) {
        opt_success(this.decodeData(xhr.responseText, config));
      }
      array.remove(this.sendInstances_, xhr);
    } else {
      xhr.onerror();
    }
  }

  /**
   * @inheritDoc
   */
  open() {
    if (this.isOpen()) {
      console.warn('Transport is already open');
      return;
    }
    this.emit('opening');
    this.emitAsync_('open');
    return this;
  }

  /**
   * Serializes message as query string.
   * @param {*} message
   * @param @param {!Object} config
   * @return {string}
   */
  serializeMessageAsQueryString(message, config) {
    if (!core.isObject(message)) {
      message = {
        data: message
      };
    }
    var query = '';
    for (var key in message) {
      query += key + '=' + encodeURIComponent(this.encodeData(message[key], config)) + '&';
    }
    return query.slice(0, -1);
  }

  /**
   * Sets the http headers of the given xhr request.
   * @param {!XMLHttpRequest} xhr The xhr request to set the headers for.
   * @param {!Object} headers Optional headers to override the default.
   * @protected
   */
  setXhrHttpHeaders_(xhr, headers) {
    for (var i in headers) {
      xhr.setRequestHeader(i, headers[i]);
    }
  }

  /**
   * @inheritDoc
   */
  write(message, config, opt_success, opt_error) {
    var xhr = new XMLHttpRequest();
    xhr.onload = core.bind(this.onXhrLoad_, this, xhr, config, opt_success);
    xhr.onerror = core.bind(this.onXhrError_, this, xhr, opt_error);

    var uri = this.getUri();

    if (config.method.toUpperCase() === 'GET') {
      uri += (uri.indexOf('?') > -1) ? '&' : '?';
      uri += this.serializeMessageAsQueryString(message, config);
    }
    else {
      message = this.encodeData(message, config);
    }

    xhr.open(config.method, uri, true);
    this.setXhrHttpHeaders_(xhr, config.headers);
    this.emitAsync_('message', message);
    this.sendInstances_.push(xhr);
    xhr.send(message);
  }
}

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

export default XhrTransport;
