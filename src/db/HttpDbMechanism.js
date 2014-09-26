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
    // TODO: Researches how it behaves with XhrTransport as well.
    this.transport_ = new lfr.WebSocketTransport(uri).open();
    this.transport_.on('data', lfr.bind(this.onReceiveData_, this));
    this.transport_.on('open', lfr.bind(this.maybeRetryRequestData_, this));
    this.on('request', lfr.bind(this.maybeRetryRequestData_, this));
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
   * Holds pending status of a request.
   * @type {number}
   * @const
   * @static
   */
  lfr.HttpDbMechanism.STATUS_PENDING = 1;

  /**
   * Holds sent status of a request.
   * @type {number}
   * @const
   * @static
   */
  lfr.HttpDbMechanism.STATUS_SENT = 0;

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
      callback: opt_callback,
      message: {
        _method: method,
        config: opt_config,
        data: data,
        messageId: nextRid,
        namespace: this.transport_.socket.nsp
      },
      messageId: nextRid,
      status: {
        code: lfr.HttpDbMechanism.STATUS_PENDING
      }
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
    this.queueRequestData_(requestData);
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
    this.queueRequestData_(requestData);
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
    this.queueRequestData_(requestData);
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
    this.queueRequestData_(requestData);
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
   * Event listener to `data` event.
   * @protected
   * @param {Object} event EventFacade object
   */
  lfr.HttpDbMechanism.prototype.onReceiveData_ = function(event) {
    var data = event.data;

    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      var requestData = this.pendingRequests_[i];
      // Check if current message in the queue has the same messageId as those which came from the server.
      if (requestData.messageId === data.messageId) {
        lfr.array.removeAt(this.pendingRequests_, i);

        var payload = {
          config: requestData.message.config,
          data: requestData.message.data,
          messageId: requestData.messageId,
          status: data.status
        };

        this.emit('data', payload);

        if (lfr.isFunction(requestData.callback)) {
          requestData.callback(payload);
        }
      }
    }
  };

  /**
   * Processes the pending requests and sends all pending messages.
   * @protected
   */
  lfr.HttpDbMechanism.prototype.maybeRetryRequestData_ = function() {
    clearTimeout(this.retryTimeoutHandler_);

    if (!this.pendingRequests_.length) {
      return;
    }

    if (!this.transport_.isOpen()) {
      this.retryTimeoutHandler_ = setTimeout(lfr.bind(this.maybeRetryRequestData_, this), this.getRetryDelayMs());
      return;
    }

    for (var i = 0; i < this.pendingRequests_.length; ++i) {
      var requestData = this.pendingRequests_[i];
      if (requestData.status.code === lfr.HttpDbMechanism.STATUS_PENDING) {
        this.transport_.send(requestData.message);
        // TODO: Updates status code to send when message is confirmed to be sent.
        requestData.status.code = lfr.HttpDbMechanism.STATUS_SENT;
      }
    }
  };

  /**
   * Adds a message to the pending queue.
   * @protected
   * @param {Object} requestData
   */
  lfr.HttpDbMechanism.prototype.queueRequestData_ = function(requestData) {
    this.pendingRequests_.push(requestData);
    this.emit('request', requestData);
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
