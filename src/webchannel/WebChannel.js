(function() {
  'use strict';

  /**
   * API for WebChannel messaging. Supports HTTP verbs for point-to-point
   * socket-like communication between a browser client and a remote origin.
   * @constructor
   * @param {!lfr.Transport} opt_transport Optional transport. If not
   *   specified defaults to <code>lfr.WebSocketTransport(location.origin +
   *   location.pathname)</code>.
   * @extends {lfr.EventEmitter}
   */
  lfr.WebChannel = function(opt_transport) {
    lfr.WebChannel.base(this, 'constructor');

    if (!opt_transport) {
      if (!window.location) {
        throw new Error('WebChannel cannot resolve transport uri');
      }
      opt_transport = new lfr.WebSocketTransport(window.location.origin + window.location.pathname);
    }

    this.pendingRequests_ = [];
    this.setTransport_(opt_transport);
  };
  lfr.inherits(lfr.WebChannel, lfr.EventEmitter);

  /**
   * Holds http verbs.
   * @type {Object}
   * @const
   * @static
   */
  lfr.WebChannel.HttpVerbs = {
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
  lfr.WebChannel.MessageStatus = {
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
  lfr.WebChannel.prototype.eventEmitterProxy_ = null;

  /**
   * Holds pending requests.
   * @type {Array}
   * @default null
   * @protected
   */
  lfr.WebChannel.prototype.pendingRequests_ = null;

  /**
   * Timeout for performed database action in milliseconds.
   * @type {number}
   * @default 30000
   * @protected
   */
  lfr.WebChannel.prototype.timeoutMs_ = 30000;

  /**
   * Holds the transport.
   * @type {lfr.Transport}
   * @default null
   * @protected
   */
  lfr.WebChannel.prototype.transport_ = null;

  /**
   * Dispatches web channel transport action with timeout support.
   * @param {!Function} handler
   * @param {!*} data Message object to the message.
   * @param {Object=} opt_config Optional configuration object with metadata
   *   about delete operation.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.createDeferredRequest_ = function(method, data, opt_config) {
    var self = this;

    var config = opt_config ? opt_config : {};
    var request;

    var def = new lfr.Promise(function(resolve, reject) {
      config.method = method;

      request = {
        config: config,
        message: data,
        reject: reject,
        resolve: resolve,
        status: lfr.WebChannel.MessageStatus.PENDING
      };

      self.pendingRequests_.push(request);
      self.processPendingRequests_();
    });

    // Removes itself from pending requests when it's done.
    def.thenAlways(function() {
      lfr.array.remove(self.pendingRequests_, request);
    });

    this.startRequestTimer_(def);

    return def;
  };

  /**
   * Sends message with DELETE http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.delete = function(message, opt_config) {
    return this.createDeferredRequest_(lfr.WebChannel.HttpVerbs.DELETE, message, opt_config);
  };

  /**
   * @inheritDoc
   */
  lfr.WebChannel.prototype.disposeInternal = function() {
    var self = this;
    this.transport_.once('close', function() {
      self.transport_ = null;

      self.eventEmitterProxy_.dispose();
      self.eventEmitterProxy_ = null;

      lfr.WebChannel.base(self, 'disposeInternal');
    });
    this.transport_.dispose();
  };

  /**
   * Sends message with GET http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.get = function(message, opt_config) {
    return this.createDeferredRequest_(lfr.WebChannel.HttpVerbs.GET, message, opt_config);
  };

  /**
   * Gets timeout in milliseconds.
   * @return {number}
   */
  lfr.WebChannel.prototype.getTimeoutMs = function() {
    return this.timeoutMs_;
  };

  /**
   * Gets the transport used to send messages to the server.
   * @return {lfr.Transport} The transport used to send messages to the
   *   server.
   */
  lfr.WebChannel.prototype.getTransport = function() {
    return this.transport_;
  };

  /**
   * Sends message with HEAD http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.head = function(message, opt_config) {
    return this.createDeferredRequest_(lfr.WebChannel.HttpVerbs.HEAD, message, opt_config);
  };

  /**
   * Event listener to transport `close` event.
   * @protected
   */
  lfr.WebChannel.prototype.onTransportClose_ = function() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      this.pendingRequests_[i].status = lfr.WebChannel.MessageStatus.PENDING;
    }
  };

  /**
   * Event listener to transport `error` event.
   * @protected
   */
  lfr.WebChannel.prototype.onTransportError_ = function() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      this.pendingRequests_[i].reject(new lfr.Promise.CancellationError('Transport error'));
    }
  };

  /**
   * Event listener to transport `open` event.
   * @protected
   */
  lfr.WebChannel.prototype.onTransportOpen_ = function() {
    this.processPendingRequests_();
  };

  /**
   * Sends message with PATCH http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.patch = function(message, opt_config) {
    return this.createDeferredRequest_(lfr.WebChannel.HttpVerbs.PATCH, message, opt_config);
  };

  /**
   * Sends message with POST http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.post = function(message, opt_config) {
    return this.createDeferredRequest_(lfr.WebChannel.HttpVerbs.POST, message, opt_config);
  };

  /**
   * Processes pending requests.
   * @protected
   */
  lfr.WebChannel.prototype.processPendingRequests_ = function() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      var pendingRequest = this.pendingRequests_[i];
      if (pendingRequest.status === lfr.WebChannel.MessageStatus.PENDING) {
        pendingRequest.status = lfr.WebChannel.MessageStatus.SENT;
        this.transport_.send(
          pendingRequest.message,
          pendingRequest.config,
          pendingRequest.resolve,
          pendingRequest.reject
        );
      }
    }
  };

  /**
   * Sends message with PUT http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.put = function(message, opt_config) {
    return this.createDeferredRequest_(lfr.WebChannel.HttpVerbs.PUT, message, opt_config);
  };

  /**
   * Sets timeout in milliseconds.
   * @param {number} timeoutMs
   */
  lfr.WebChannel.prototype.setTimeoutMs = function(timeoutMs) {
    this.timeoutMs_ = timeoutMs;
  };

  /**
   * Sets the transport used to send pending requests to the server.
   * @param {lfr.Transport} transport
   * @protected
   */
  lfr.WebChannel.prototype.setTransport_ = function(transport) {
    this.eventEmitterProxy_ = new lfr.EventEmitterProxy(transport, this);

    this.transport_ = transport;
    this.transport_.on('close', lfr.bind(this.onTransportClose_, this));
    this.transport_.on('error', lfr.bind(this.onTransportError_, this));
    this.transport_.on('open', lfr.bind(this.onTransportOpen_, this));
    this.transport_.open();
  };

  /**
   * Starts the timer for the given request's timeout.
   * @param {!Promise} requestPromise The promise object for the request.
   */
  lfr.WebChannel.prototype.startRequestTimer_ = function(requestPromise) {
    var timer = setTimeout(function() {
      requestPromise.cancel(new lfr.Promise.CancellationError('Timeout'));
    }, this.getTimeoutMs());

    requestPromise.thenAlways(function() {
      clearTimeout(timer);
    });
  };

}());
