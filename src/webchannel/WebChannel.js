'use strict';

import array from '../array/array';
import EventEmitter from '../events/EventEmitter';
import EventEmitterProxy from '../events/EventEmitterProxy';
import {CancellablePromise} from '../promise/Promise';
import WebSocketTransport from '../net/WebSocketTransport';

/**
 * API for WebChannel messaging. Supports HTTP verbs for point-to-point
 * socket-like communication between a browser client and a remote origin.
 * @param {!Transport} opt_transport Optional transport. If not
 *   specified defaults to <code>WebSocketTransport(location.origin +
 *   location.pathname)</code>.
 * @constructor
 * @extends {EventEmitter}
 */
class WebChannel extends EventEmitter {
  constructor(opt_transport) {
    super();

    if (!opt_transport) {
      opt_transport = new WebSocketTransport(window.location.origin + window.location.pathname);
    }

    this.pendingRequests_ = [];
    this.setTransport_(opt_transport);
  }

  /**
   * Dispatches web channel transport action with timeout support.
   * @param {!Function} handler
   * @param {!*} data Message object to the message.
   * @param {Object=} opt_config Optional configuration object with metadata
   *   about delete operation.
   * @return {CancellablePromise}
   */
  createDeferredRequest_(method, data, opt_config) {
    var self = this;

    var config = opt_config ? opt_config : {};
    var request;

    var def = new CancellablePromise(function(resolve, reject) {
      config.method = method;

      request = {
        config: config,
        message: data,
        reject: reject,
        resolve: resolve,
        status: WebChannel.MessageStatus.PENDING
      };

      self.pendingRequests_.push(request);
      self.processPendingRequests_();
    });

    // Removes itself from pending requests when it's done.
    def.thenAlways(function() {
      array.remove(self.pendingRequests_, request);
    });

    this.startRequestTimer_(def);

    return def;
  }

  /**
   * Sends message with DELETE http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {CancellablePromise}
   */
  delete(message, opt_config) {
    return this.createDeferredRequest_(WebChannel.HttpVerbs.DELETE, message, opt_config);
  }

  /**
   * @inheritDoc
   */
  disposeInternal() {
    var self = this;
    this.transport_.once('close', function() {
      self.transport_ = null;

      self.eventEmitterProxy_.dispose();
      self.eventEmitterProxy_ = null;

      super.disposeInternal();
    });
    this.transport_.dispose();
  }

  /**
   * Sends message with GET http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {CancellablePromise}
   */
  get(message, opt_config) {
    return this.createDeferredRequest_(WebChannel.HttpVerbs.GET, message, opt_config);
  }

  /**
   * Gets timeout in milliseconds.
   * @return {number}
   */
  getTimeoutMs() {
    return this.timeoutMs_;
  }

  /**
   * Gets the transport used to send messages to the server.
   * @return {Transport} The transport used to send messages to the
   *   server.
   */
  getTransport() {
    return this.transport_;
  }

  /**
   * Sends message with HEAD http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {CancellablePromise}
   */
  head(message, opt_config) {
    return this.createDeferredRequest_(WebChannel.HttpVerbs.HEAD, message, opt_config);
  }

  /**
   * Event listener to transport `close` event.
   * @protected
   */
  onTransportClose_() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      this.pendingRequests_[i].status = WebChannel.MessageStatus.PENDING;
    }
  }

  /**
   * Event listener to transport `error` event.
   * @protected
   */
  onTransportError_() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      this.pendingRequests_[i].reject(new CancellablePromise.CancellationError('Transport error'));
    }
  }

  /**
   * Event listener to transport `open` event.
   * @protected
   */
  onTransportOpen_() {
    this.processPendingRequests_();
  }

  /**
   * Sends message with PATCH http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {CancellablePromise}
   */
  patch(message, opt_config) {
    return this.createDeferredRequest_(WebChannel.HttpVerbs.PATCH, message, opt_config);
  }

  /**
   * Sends message with POST http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {CancellablePromise}
   */
  post(message, opt_config) {
    return this.createDeferredRequest_(WebChannel.HttpVerbs.POST, message, opt_config);
  }

  /**
   * Processes pending requests.
   * @protected
   */
  processPendingRequests_() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      var pendingRequest = this.pendingRequests_[i];
      if (pendingRequest.status === WebChannel.MessageStatus.PENDING) {
        pendingRequest.status = WebChannel.MessageStatus.SENT;
        this.transport_.send(
          pendingRequest.message,
          pendingRequest.config,
          pendingRequest.resolve,
          pendingRequest.reject
        );
      }
    }
  }

  /**
   * Sends message with PUT http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {CancellablePromise}
   */
  put(message, opt_config) {
    return this.createDeferredRequest_(WebChannel.HttpVerbs.PUT, message, opt_config);
  }

  /**
   * Sets timeout in milliseconds.
   * @param {number} timeoutMs
   */
  setTimeoutMs(timeoutMs) {
    this.timeoutMs_ = timeoutMs;
  }

  /**
   * Sets the transport used to send pending requests to the server.
   * @param {Transport} transport
   * @protected
   */
  setTransport_(transport) {
    this.eventEmitterProxy_ = new EventEmitterProxy(transport, this);

    this.transport_ = transport;
    this.transport_.on('close', this.onTransportClose_.bind(this));
    this.transport_.on('error', this.onTransportError_.bind(this));
    this.transport_.on('open', this.onTransportOpen_.bind(this));
    this.transport_.open();
  }

  /**
   * Starts the timer for the given request's timeout.
   * @param {!CancellablePromise} requestPromise The promise object for the request.
   */
  startRequestTimer_(requestPromise) {
    var timer = setTimeout(function() {
      requestPromise.cancel(new CancellablePromise.CancellationError('Timeout'));
    }, this.getTimeoutMs());

    requestPromise.thenAlways(function() {
      clearTimeout(timer);
    });
  }
}

/**
 * Holds http verbs.
 * @type {Object}
 * @const
 * @static
 */
WebChannel.HttpVerbs = {
  DELETE: 'DELETE',
  GET: 'GET',
  HEAD: 'HEAD',
  PATCH: 'PATCH',
  POST: 'POST',
  PUT: 'PUT'
};

/**
 * Holds status of a request message.
 * @type {Object}
 * @const
 * @static
 */
WebChannel.MessageStatus = {
  PENDING: 0,
  SENT: 1
};

/**
 * EventEmitterProxy instance that proxies events from the transport to this
 * web channel.
 * @type {EventEmitterProxy}
 * @default null
 * @protected
 */
WebChannel.prototype.eventEmitterProxy_ = null;

/**
 * Holds pending requests.
 * @type {Array}
 * @default null
 * @protected
 */
WebChannel.prototype.pendingRequests_ = null;

/**
 * Timeout for performed database action in milliseconds.
 * @type {number}
 * @default 30000
 * @protected
 */
WebChannel.prototype.timeoutMs_ = 30000;

/**
 * Holds the transport.
 * @type {Transport}
 * @default null
 * @protected
 */
WebChannel.prototype.transport_ = null;

export default WebChannel;
