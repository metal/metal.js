(function() {
  'use strict';

  /**
   * Implementation of a WebChannel transport.
   * @constructor
   * @param {!lfr.Transport} opt_transport Optional transport. If not
   *   specified defaults to <code>lfr.WebSocketTransport(location.origin +
   *   location.pathname)</code>.
   */
  lfr.WebChannelTransport = function(opt_transport) {
    lfr.WebChannelTransport.base(this, 'constructor');

    if (!opt_transport) {
      if (!window.location) {
        throw new Error('WebChannelTransport cannot resolve transport uri');
      }
      opt_transport = new lfr.WebSocketTransport(window.location.origin + window.location.pathname);
    }

    this.pendingRequests_ = [];
    this.setTransport(opt_transport);
  };
  lfr.inherits(lfr.WebChannelTransport, lfr.Disposable);

  /**
   * Holds pending requests.
   * @type {Array}
   * @default null
   * @protected
   */
  lfr.WebChannelTransport.prototype.pendingRequests_ = null;

  /**
   * Holds the transport.
   * @type {lfr.Transport}
   * @default null
   * @protected
   */
  lfr.WebChannelTransport.prototype.transport_ = null;

  /**
   * Creates a deferred request based that method and provided user data.
   * @protected
   * @param {!string} method The action method.
   * @param {!*} value The value which should be stored to
   *   the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Promise}
   */
  lfr.WebChannelTransport.prototype.createDeferredRequest_ = function(method, data, opt_config) {
    var self = this;
    var nextRid = ((Math.random() * 1e9) >>> 0);
    var message = {
      id: nextRid,
      config: opt_config,
      data: data,
      _method: method
    };

    var def = new lfr.Promise(function(resolve, reject) {
      self.pendingRequests_.push({
        message: message,
        reject: reject,
        resolve: resolve,
        status: lfr.WebChannel.MessageStatus.PENDING
      });
      self.processPendingRequests_();
    });

    // Removes itself from pending requests when it's done.
    def.thenAlways(function() {
      lfr.array.removeAt(self.pendingRequests_, self.findPendingRequestById_(message.id));
    });

    return def;
  };

  /**
   * Sends message with DELETE http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannelTransport.prototype.delete = function(message, opt_config) {
    return this.createDeferredRequest_(lfr.WebChannel.HttpVerbs.DELETE, message, opt_config);
  };

  /**
   * Finds a pending request by id.
   * @param {number} id Message random id.
   * @return {?Object} Returns pending request object, returns null if not
   *   found.
   * @protected
   */
  lfr.WebChannelTransport.prototype.findPendingRequestById_ = function(id) {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      if (id === this.pendingRequests_[i].message.id) {
        return this.pendingRequests_[i];
      }
    }
    return null;
  };

  /**
   * Sends message with GET http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannelTransport.prototype.get = function(message, opt_config) {
    return this.createDeferredRequest_(lfr.WebChannel.HttpVerbs.GET, message, opt_config);
  };

  /**
   * Gets the transport used to send messages to the server.
   * @return {lfr.Transport} The transport used to send messages to the
   *   server.
   */
  lfr.WebChannelTransport.prototype.getTransport = function() {
    return this.transport_;
  };

  /**
   * Sends message with HEAD http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannelTransport.prototype.head = function(message, opt_config) {
    return this.createDeferredRequest_(lfr.WebChannel.HttpVerbs.HEAD, message, opt_config);
  };

  /**
   * Event listener to transport `close` event.
   * @protected
   */
  lfr.WebChannelTransport.prototype.onTransportClose_ = function() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      this.pendingRequests_[i].status = lfr.WebChannel.MessageStatus.PENDING;
    }
  };

  /**
   * Event listener to transport `error` event.
   * @protected
   */
  lfr.WebChannelTransport.prototype.onTransportError_ = function() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      this.pendingRequests_[i].reject(new lfr.Promise.CancellationError('Transport error'));
    }
  };

  /**
   * Event listener to transport `open` event.
   * @protected
   */
  lfr.WebChannelTransport.prototype.onTransportOpen_ = function() {
    this.processPendingRequests_();
  };

  /**
   * Event listener to transport `data` event.
   * @protected
   * @param {*} data
   */
  lfr.WebChannelTransport.prototype.onTransportReceiveData_ = function(data) {
    if (!data) {
      console.warn('Malformed data arrived');
      return;
    }
    var pendingRequest = this.findPendingRequestById_(data.id);
    if (pendingRequest) {
      pendingRequest.resolve(data);
    }
  };

  /**
   * Sends message with PATCH http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannelTransport.prototype.patch = function(message, opt_config) {
    return this.createDeferredRequest_(lfr.WebChannel.HttpVerbs.PATCH, message, opt_config);
  };

  /**
   * Sends message with POST http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannelTransport.prototype.post = function(message, opt_config) {
    return this.createDeferredRequest_(lfr.WebChannel.HttpVerbs.POST, message, opt_config);
  };

  /**
   * Processes pending requests.
   * @protected
   */
  lfr.WebChannelTransport.prototype.processPendingRequests_ = function() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      var pendingRequest = this.pendingRequests_[i];
      if (pendingRequest.status === lfr.WebChannel.MessageStatus.PENDING) {
        pendingRequest.status = lfr.WebChannel.MessageStatus.SENT;
        this.transport_.send(pendingRequest.message);
      }
    }
  };

  /**
   * Sends message with PUT http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannelTransport.prototype.put = function(message, opt_config) {
    return this.createDeferredRequest_(lfr.WebChannel.HttpVerbs.PUT, message, opt_config);
  };

  /**
   * Sets the transport used to send pending requests to the server.
   * @param {lfr.Transport} transport
   */
  lfr.WebChannelTransport.prototype.setTransport = function(transport) {
    if (this.transport_) {
      this.transport_.dispose();
    }
    this.transport_ = transport.open();
    this.transport_.on('close', lfr.bind(this.onTransportClose_, this));
    this.transport_.on('data', lfr.bind(this.onTransportReceiveData_, this));
    this.transport_.on('error', lfr.bind(this.onTransportError_, this));
    this.transport_.on('open', lfr.bind(this.onTransportOpen_, this));
  };

}());
