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

    this.queue_ = [];

    this.transport_ = new lfr.WebSocketTransport(uri).open();

    // Attach listener to addToQueue event in order to track start sending messages immediately.
    this.on('addToQueue', lfr.bind(this.sendMessages_, this));

    // Attach listener to data event in order to track receiving data from the Transport.
    this.transport_.on('data', lfr.bind(this.onData_, this));

    // Subscribe to transport open event in order to process the message queue immediately once
    // the connection to the server has been re-established.
    this.transport_.on('open', lfr.bind(this.sendMessages_, this));
  };
  lfr.inherits(lfr.HttpDbMechanism, lfr.DbMechanism);

  /**
   * The returned handler of an established timeout for resending failed or
   * pending messages in the queue.
   * @type {Object|Number}
   * @default null
   * @protected
   */
  lfr.HttpDbMechanism.prototype.resendMessagesHandler_ = null;

  /**
   * Timeout in milliseconds, which provides the time which have to pass
   * between two attempts of resending pending messages.
   * @type {number}
   * @default 500 (milliseconds)
   * @protected
   */
  lfr.HttpDbMechanism.prototype.resendMessagesTimeout_ = 500;

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
   * Holds the maximum value of generated random number.
   * @type {number}
   * @const
   * @static
   */
  lfr.HttpDbMechanism.RANDOM_NUM_MAX = 100000;

  /**
   * Holds the minimum value of generated random number.
   * @type {number}
   * @const
   * @static
   */
  lfr.HttpDbMechanism.RANDOM_NUM_MIN = 1;

  /**
   * Holds pending status of a message.
   * @type {number}
   * @const
   * @static
   */
  lfr.HttpDbMechanism.MESSAGE_STATUS_PENDING = 1;

  /**
   * Holds sent status of a message.
   * @type {number}
   * @const
   * @static
   */
  lfr.HttpDbMechanism.MESSAGE_STATUS_SENT = 0;

  /**
   * Deletes data from database.
   * @param {!*} data The value which will be used to delete data from
   *   the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is retrieved from the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Object} The constructed and stored to the queue message.
   */
  lfr.HttpDbMechanism.prototype.delete = function(data, opt_callback, opt_config) {
    var queueMessage = this.createMessage_(lfr.HttpDbMechanism.METHOD_DELETE, data, opt_callback, opt_config);

    this.addMessageToQueue_(queueMessage);

    return queueMessage;
  };

  /**
   * Retrieves data from database.
   * @param {!*} value The value which will be used to retrieve data from
   *   the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is retrieved from the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Object} The constructed and stored to the queue message.
   */
  lfr.HttpDbMechanism.prototype.get = function(value, opt_callback, opt_config) {
    var queueMessage = this.createMessage_(lfr.HttpDbMechanism.METHOD_GET, value, opt_callback, opt_config);

    this.addMessageToQueue_(queueMessage);

    return queueMessage;
  };

  /**
   * Stores data to database.
   * @param {!*} data The value which should be stored to
   *   the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is stored to the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Object} The constructed and stored to the queue message.
   */
  lfr.HttpDbMechanism.prototype.post = function(data, opt_callback, opt_config) {
    var queueMessage = this.createMessage_(lfr.HttpDbMechanism.METHOD_POST, data, opt_callback, opt_config);

    this.addMessageToQueue_(queueMessage);

    return queueMessage;
  };

  /**
   * Updates already existing data in database.
   * @param {!*} data The data which have to be updated into the the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is retrieved from the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Object} The constructed and stored to the queue message.
   */
  lfr.HttpDbMechanism.prototype.put = function(data, opt_callback, opt_config) {
    var queueMessage = this.createMessage_(lfr.HttpDbMechanism.METHOD_PUT, data, opt_callback, opt_config);

    this.addMessageToQueue_(queueMessage);

    return queueMessage;
  };

  /**
   * Adds a message to the queue.
   * @protected
   * @param {Object} queueMessage
   */
  lfr.HttpDbMechanism.prototype.addMessageToQueue_ = function(queueMessage) {
    // Store the object to the queue as the last element
    this.queue_.push(queueMessage);

    // Emit an event that data has been added to the queue.
    this.emit('addToQueue', queueMessage);
  };

  /**
   * Creates a message based on method and provided user data.
   * @protected
   * @param {!string} method The action method.
   * @param {!*} value The value which should be stored to
   *   the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is stored to the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Object} The created queue message.
   */
  lfr.HttpDbMechanism.prototype.createMessage_ = function(method, data, opt_callback, opt_config) {
    // Generate a messageId, it will be sent to server, so messages won't be duplicated there
    // and we will be able to recognize the messages exchanged with the server
    var messageId = this.generateId_();

    var queueMessage = {
      callback: opt_callback,
      message: {
        _method: method,
        config: opt_config,
        data: data,
        messageId: messageId,
        serviceName: this.transport_.socket.nsp
      },
      messageId: messageId,
      status: {
        code: lfr.HttpDbMechanism.MESSAGE_STATUS_PENDING
      }
    };

    return queueMessage;
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
   * Gets the resend messages timeout value.
   * @return {number}
   */
  lfr.HttpDbMechanism.prototype.getResendMessagesTimeout_ = function() {
    return this.resendMessagesTimeout_;
  };

  /**
   * Generates Id using the current time and randomly generated number.
   * @protected
   * @return {string} The generated Id.
   */
  lfr.HttpDbMechanism.prototype.generateId_ = function() {
    var randomNum = this.generateRandomNumber_();

    return '-' + Date.now() + '-' + String(randomNum).replace('.', '') + '-';
  };

  /**
   * Generates random number using minimum and maximum range.
   * @protected
   * @param {number=} opt_min optional The min value.
   * @see {@link lfr.HttpDbMechanism.RANDOM_NUM_MIN}
   * @param {number=} opt_max optional The max number.
   * @see {@link lfr.HttpDbMechanism.RANDOM_NUM_MAX}
   * @return {Number} The generated number.
   */
  lfr.HttpDbMechanism.prototype.generateRandomNumber_ = function(opt_min, opt_max) {
    var min = opt_min || lfr.HttpDbMechanism.RANDOM_NUM_MIN;
    var max = opt_max || lfr.HttpDbMechanism.RANDOM_NUM_MAX;

    return Math.random() * (max - min) + min;
  };

  /**
   * Event listener to `data` event.
   * @protected
   * @param {Object} event EventFacade object
   */
  lfr.HttpDbMechanism.prototype.onData_ = function(event) {
    var data = event.data;

    for (var i = 0; i < this.queue_.length; ++i) {
      var queueMessage = this.queue_[i];

      // Check if current message in the queue has the same messageId as those which came from the server.
      if (queueMessage.messageId === data.messageId) {
        // Remove the message from the queue
        this.queue_.splice(i, 1);

        var payload = {
          config: queueMessage.message.config,
          data: queueMessage.message.data,
          messageId: queueMessage.messageId,
          status: data.status
        };

        this.emit('data', payload);

        if (lfr.isFunction(queueMessage.callback)) {
          queueMessage.callback(payload);
        }
      }
    }
  };

  /**
   * Processes the queue and sends all pending messages.
   * @protected
   */
  lfr.HttpDbMechanism.prototype.sendMessages_ = function() {
    // We clear here the timeout because there are two ways to invoke this function:
    // 1. As result of firing addToQueue event.
    // 2. As result of timeout.
    //
    // There could be situation like this:
    // - dataAdded has been emitted, so this function will be invoked
    // - however, previously this function has started already a timeout and it will be
    // invoked in some time.
    //
    // In this case we have to cancel the timeout, process the queue and start it again,
    // if there are still messages.

    clearTimeout(this.resendMessagesHandler_);

    // If there is an transport error, try to send the messages again in some timeout.

    if (!this.transport_.isOpen() && this.queue_.length) {
      this.resendMessagesHandler_ = setTimeout(lfr.bind(this.sendMessages_, this), this.getResendMessagesTimeout_());

      return;
    }

    // Process the queue and send all pending messages.
    for (var i = 0; i < this.queue_.length; ++i) {
      var queueMessage = this.queue_[i];

      var status = queueMessage.status;

      if (status.code === lfr.HttpDbMechanism.MESSAGE_STATUS_PENDING) {
        var userMessage = queueMessage.message;

        this.transport_.send(userMessage);

        // Change the status code of the queue message to sent
        queueMessage.status.code = lfr.HttpDbMechanism.MESSAGE_STATUS_SENT;
      }
    }
  };

  /**
   * Sets the value of the timeout on which pending messages will be resend.
   * @param {number} resendMessagesTimeout The timeout for resending the
   *   pending messages.
   */
  lfr.HttpDbMechanism.prototype.setResendMessagesTimeout = function(resendMessagesTimeout) {
    this.resendMessagesTimeout_ = resendMessagesTimeout;
  };

}());