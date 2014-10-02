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

    this.on('request', lfr.bind(this.onMechanismRequestData_, this));
    this.transport_.on('data', lfr.bind(this.onTransportReceiveData_, this));
    this.transport_.on('error', lfr.bind(this.onTransportError_, this));
    this.transport_.on('open', lfr.bind(this.onTransportOpen_, this));
  };
  lfr.inherits(lfr.HttpDbMechanism, lfr.DbMechanism);

  /**
   * Holds POST method value.
   * @type {number}
   * @const
   * @static
   */
  lfr.HttpDbMechanism.METHOD_POST = 'POST';

  /**
   * Holds GET method value.
   * @type {number}
   * @const
   * @static
   */
  lfr.HttpDbMechanism.METHOD_GET = 'GET';

  /**
   * Holds DELETE method value.
   * @type {number}
   * @const
   * @static
   */
  lfr.HttpDbMechanism.METHOD_DELETE = 'DELETE';

  /**
   * Holds PUT method value.
   * @type {number}
   * @const
   * @static
   */
  lfr.HttpDbMechanism.METHOD_PUT = 'PUT';

  /**
   * Holds pending requests.
   * @type {Array}
   * @default null
   * @protected
   */
  lfr.HttpDbMechanism.prototype.pendingRequests_ = null;

  /**
   * Timeout in milliseconds, which provides the time which have to pass
   * between two attempts of resending pending requests.
   * @type {number}
   * @default 500 (milliseconds)
   * @protected
   */
  lfr.HttpDbMechanism.prototype.retryDelayMs_ = 500;

  /**
   * The returned handler of an established timeout for resending failed or
   * pending requests in the queue.
   * @type {number}
   * @default null
   * @protected
   */
  lfr.HttpDbMechanism.prototype.retryTimeoutHandler_ = null;

  /**
   * Holds a transport-based cross-browser/cross-device bi-directional
   * communication layer.
   * @type {lfr.Transport}
   * @default null
   * @protected
   */
  lfr.HttpDbMechanism.prototype.transport_ = null;

  /**
   * Creates a request data based on method and provided user data.
   * @protected
   * @param {!string} method The action method.
   * @param {!*} value The value which should be stored to
   *   the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is stored to the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Object} The created pending request data.
   */
  lfr.HttpDbMechanism.prototype.createRequestData_ = function(method, data, opt_callback, opt_config) {
    var nextRid = ((Math.random() * 1e9) >>> 0);
    return {
      status: lfr.DbMechanism.STATUS_PENDING,
      message: {
        _method: method,
        id: nextRid,
        config: opt_config,
        data: data
      },
      callback: opt_callback
    };
  };

  /**
   * Deletes data from database.
   * @param {!*} data The value which will be used to delete data from
   *   the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is retrieved from the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Object} The constructed and stored to the pending request queue.
   */
  lfr.HttpDbMechanism.prototype.delete = function(data, opt_callback, opt_config) {
    var requestData = this.createRequestData_(lfr.HttpDbMechanism.METHOD_DELETE, data, opt_callback, opt_config);
    this.emit('request', requestData);
    return requestData;
  };

  /**
   * Retrieves data from database.
   * @param {!*} value The value which will be used to retrieve data from
   *   the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is retrieved from the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Object} The constructed and stored to the pending request queue.
   */
  lfr.HttpDbMechanism.prototype.get = function(value, opt_callback, opt_config) {
    var requestData = this.createRequestData_(lfr.HttpDbMechanism.METHOD_GET, value, opt_callback, opt_config);
    this.emit('request', requestData);
    return requestData;
  };

  /**
   * Stores data to database.
   * @param {!*} data The value which should be stored to
   *   the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is stored to the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Object} The constructed and stored to the pending request queue.
   */
  lfr.HttpDbMechanism.prototype.post = function(data, opt_callback, opt_config) {
    var requestData = this.createRequestData_(lfr.HttpDbMechanism.METHOD_POST, data, opt_callback, opt_config);
    this.emit('request', requestData);
    return requestData;
  };

  /**
   * Updates already existing data in database.
   * @param {!*} data The data which have to be updated into the the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is retrieved from the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Object} The constructed and stored to the pending request queue.
   */
  lfr.HttpDbMechanism.prototype.put = function(data, opt_callback, opt_config) {
    var requestData = this.createRequestData_(lfr.HttpDbMechanism.METHOD_PUT, data, opt_callback, opt_config);
    this.emit('request', requestData);
    return requestData;
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
   * Gets the retry timeout value.
   * @return {number}
   */
  lfr.HttpDbMechanism.prototype.getRetryDelayMs = function() {
    return this.retryDelayMs_;
  };

  /**
   * Processes the pending requests and sends all pending messages.
   * @protected
   */
  lfr.HttpDbMechanism.prototype.maybeRequestData_ = function() {
    clearTimeout(this.retryTimeoutHandler_);

    if (!this.pendingRequests_.length) {
      return;
    }

    if (!this.transport_.isOpen()) {
      this.retryTimeoutHandler_ = setTimeout(lfr.bind(this.maybeRequestData_, this), this.getRetryDelayMs());
      return;
    }
    console.log('maybeRequestData_');
    this.processPendingRequests_();
  };

  /**
   * Event listener to mechanism `request` event.
   * @protected
   * @param {*} data
   */
  lfr.HttpDbMechanism.prototype.onMechanismRequestData_ = function(requestData) {
    this.pendingRequests_.push(requestData);
    this.maybeRequestData_();
  };

  /**
   * Event listener to transport `error` event.
   * @protected
   * @param {Error} err
   */
  lfr.HttpDbMechanism.prototype.onTransportError_ = function() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      this.pendingRequests_[i].status = lfr.DbMechanism.STATUS_PENDING;
    }
  };

  /**
   * Event listener to transport `open` event.
   * @protected
   */
  lfr.HttpDbMechanism.prototype.onTransportOpen_ = function() {
    this.maybeRequestData_();
  };

  /**
   * Event listener to transport `data` event.
   * @protected
   * @param {*} data
   */
  lfr.HttpDbMechanism.prototype.onTransportReceiveData_ = function(data) {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      var requestData = this.pendingRequests_[i];
      if (requestData.message.id === data.id) {
        this.processReceivedData_(requestData, data);
        lfr.array.removeAt(this.pendingRequests_, i);
      }
    }
  };

  /**
   * Processes received request data.
   * @param {Object} data
   * @param {Object} status
   * @protected
   */
  lfr.HttpDbMechanism.prototype.processReceivedData_ = function(requestData, data) {
    requestData.status = lfr.DbMechanism.STATUS_RECEIVED;
    this.emit('data', data);
    if (lfr.isFunction(requestData.callback)) {
      requestData.callback(data);
    }
  };

  /**
   * Processes pending requests.
   * @protected
   */
  lfr.HttpDbMechanism.prototype.processPendingRequests_ = function() {
    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      var requestData = this.pendingRequests_[i];
      if (requestData.status === lfr.DbMechanism.STATUS_PENDING) {
        requestData.status = lfr.DbMechanism.STATUS_SENT;
        this.transport_.send(requestData.message);
      }
    }
  };

  /**
   * Sets the value of the timeout on which pending messages will be resend.
   * @param {number} retryDelayMs The timeout for resending the
   *   pending requests.
   */
  lfr.HttpDbMechanism.prototype.setRetryDelayMs = function(retryDelayMs) {
    this.retryDelayMs_ = retryDelayMs;
  };

  /**
   * Sets the transport used to send pending requests to the server.
   * @param {lfr.Transport} transport
   */
  lfr.HttpDbMechanism.prototype.setTransport = function(transport) {
    this.transport_ = transport;
  };

}());
