(function() {
  'use strict';

  /**
   * Provides mechanism for storing, retrieving, updating and removing data
   * from database.
   * @constructor
   * @param {!string} uri The data endpoint
   * @extends {lfr.EventEmitter}
   */
  lfr.HttpDbMechanism = function(uri) {
    lfr.HttpDbMechanism.base(this, 'constructor', uri);

    this.pendingRequests_ = [];
    this.transport_ = new lfr.WebSocketTransport(uri).open();
    this.transport_.on('close', lfr.bind(this.onTransportClose_, this));
    this.transport_.on('data', lfr.bind(this.onTransportReceiveData_, this));
    this.transport_.on('error', lfr.bind(this.onTransportError_, this));
    this.transport_.on('open', lfr.bind(this.onTransportOpen_, this));
  };
  lfr.inherits(lfr.HttpDbMechanism, lfr.DbMechanism);

  /**
   * Holds POST method values.
   * @type {Object}
   * @const
   * @static
   */
  lfr.HttpDbMechanism.HttpVerbs = {
    DELETE: 'DELETE',
    GET: 'GET',
    HEAD: 'HEAD',
    PATCH: 'PATCH',
    POST: 'POST',
    PUT: 'PUT'
  };

  /**
   * Holds pending requests.
   * @type {Array}
   * @default null
   * @protected
   */
  lfr.HttpDbMechanism.prototype.pendingRequests_ = null;

  /**
   * Holds a transport-based cross-browser/cross-device bi-directional
   * communication layer.
   * @type {lfr.Transport}
   * @default null
   * @protected
   */
  lfr.HttpDbMechanism.prototype.transport_ = null;

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
  lfr.HttpDbMechanism.prototype.createDeferredRequest_ = function(method, data, opt_config) {
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
        status: lfr.DbMechanism.MessageStatus.PENDING
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
   * @inheritDoc
   */
  lfr.HttpDbMechanism.prototype.delete = function(data, opt_config) {
    return this.createDeferredRequest_(lfr.HttpDbMechanism.HttpVerbs.DELETE, data, opt_config);
  };

  /**
   * Finds a pending request by id.
   * @param {number} id Message random id.
   * @return {?Object} Returns pending request object, returns null if not
   *   found.
   * @protected
   */
  lfr.HttpDbMechanism.prototype.findPendingRequestById_ = function(id) {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      if (id === this.pendingRequests_[i].message.id) {
        return this.pendingRequests_[i];
      }
    }
    return null;
  };

  /**
   * @inheritDoc
   */
  lfr.HttpDbMechanism.prototype.get = function(value, opt_config) {
    return this.createDeferredRequest_(lfr.HttpDbMechanism.HttpVerbs.GET, value, opt_config);
  };

  /**
   * @inheritDoc
   */
  lfr.HttpDbMechanism.prototype.head = function(data, opt_config) {
    return this.createDeferredRequest_(lfr.HttpDbMechanism.HttpVerbs.HEAD, data, opt_config);
  };

  /**
   * @inheritDoc
   */
  lfr.HttpDbMechanism.prototype.patch = function(data, opt_config) {
    return this.createDeferredRequest_(lfr.HttpDbMechanism.HttpVerbs.PATCH, data, opt_config);
  };

  /**
   * @inheritDoc
   */
  lfr.HttpDbMechanism.prototype.post = function(data, opt_config) {
    return this.createDeferredRequest_(lfr.HttpDbMechanism.HttpVerbs.POST, data, opt_config);
  };

  /**
   * @inheritDoc
   */
  lfr.HttpDbMechanism.prototype.put = function(data, opt_config) {
    return this.createDeferredRequest_(lfr.HttpDbMechanism.HttpVerbs.PUT, data, opt_config);
  };

  /**
   * Gets the transport used to send messages to the server.
   * @return {lfr.Transport} The transport used to send messages to the
   *   server.
   */
  lfr.HttpDbMechanism.prototype.getTransport = function() {
    return this.transport_;
  };

  /**
   * Event listener to transport `close` event.
   * @protected
   */
  lfr.HttpDbMechanism.prototype.onTransportClose_ = function() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      this.pendingRequests_[i].status = lfr.DbMechanism.MessageStatus.PENDING;
    }
  };

  /**
   * Event listener to transport `error` event.
   * @protected
   */
  lfr.HttpDbMechanism.prototype.onTransportError_ = function() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      this.pendingRequests_[i].reject(new lfr.Promise.CancellationError('Transport error'));
    }
  };

  /**
   * Event listener to transport `open` event.
   * @protected
   */
  lfr.HttpDbMechanism.prototype.onTransportOpen_ = function() {
    this.processPendingRequests_();
  };

  /**
   * Event listener to transport `data` event.
   * @protected
   * @param {*} data
   */
  lfr.HttpDbMechanism.prototype.onTransportReceiveData_ = function(data) {
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
   * Processes pending requests.
   * @protected
   */
  lfr.HttpDbMechanism.prototype.processPendingRequests_ = function() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      var pendingRequest = this.pendingRequests_[i];
      if (pendingRequest.status === lfr.DbMechanism.MessageStatus.PENDING) {
        pendingRequest.status = lfr.DbMechanism.MessageStatus.SENT;
        this.transport_.send(pendingRequest.message);
      }
    }
  };

  /**
   * Sets the transport used to send pending requests to the server.
   * @param {lfr.Transport} transport
   */
  lfr.HttpDbMechanism.prototype.setTransport = function(transport) {
    this.transport_ = transport;
  };

}());
