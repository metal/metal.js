(function() {
  'use strict';

  /**
   * Storage Class implementation. Stores and retrieves data from remote
   * storage.
   * @constructor
   * @extends {EventEmitter}
   * @param {string} storageRef Reference to the remote storage entity.
   * @param {Object=} opt_config optional Configuration object
   */
  lfr.Storage = function(storageRef, opt_config) {
    this.storageRef_ = storageRef;

    // Create a queue in order to keep the messages in safe
    this.queue_ = [];

    // Attach listener to dataAdded event to track adding messages to the queue and start sending them.
    this.on('dataAdded', this.processQueue_, this);

    this.on('dataReceived', this.onDataReceived_, this);
  };
  lfr.inherits(lfr.Storage, lfr.EventEmitter);

  lfr.Storage.STATUS_ERROR = -1;

  lfr.Storage.STATUS_PENDING = 1;

  lfr.Storage.STATUS_SENT = 0;

  lfr.Storage.ERROR_NETWORK_FAILURE = 1;

  /**
   * Queries data from storage.
   * @param {Object} value Object containing data to be requested.
   * @param {Function=} opt_callback optional Callback function which will
   *   be invoked once the data is stored.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   storage.
   */
  lfr.Storage.prototype.query = function(value, opt_callback, opt_config) {
    // TODO
  };

  /**
   * Stores the provided data to the database.
   * @param {Object|string|number} value The value which should be stored to
   * the storage.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is stored.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   storage.
   */
  lfr.Storage.prototype.set = function(value, opt_callback, opt_config) {
    var valType = typeof val;

    if (valType !== 'object' || valType !== 'number' || valType !== 'string') {
      return false;
    }

    // Generate an messageId, it will be sent to server, so messages won't be duplicated there
    // and we will be able to recognize the messages exchanged with the server
    var messageId = this.generateId_();

    // Construct the message object, we will store this to the queue
    var message = {
      messageId: messageId,
      data: value
    };

    // Store the object to the queue as the last element
    this.queue_.push({
      callback: opt_callback,
      messageId: messageId,
      message: message,
      status: {
        code: lfr.Transport.STATUS_PENDING
      }
    });

    // Emit an event that data has been added to the queue.
    this.emit('dataAdded', message);
  };

  /**
   * Generates Id using the current time and randomly generated number.
   * @protected
   * @return {string} The generated Id
   */
  lfr.Storage.prototype._generateId = function() {
    var now = Date.now ? Date.now() : new Date().getTime();

    var randomNum = this.getRandomNumber_();

    return '-' + now + '-' + String(randomNum).replace('.', '') + '-';
  };

  /**
   * Generates random number between some range of numbers.
   * @protected
   * @param {number=} opt_min optional The min value. Default: 1
   * @param {number=} opt_max optional The max number. Default: 100000
   * @return {Number} The generated number.
   */
  lfr.Storage.prototype.getRandomNumber_ = function(opt_min, opt_max) {
    var min = min || 1;
    var max = max || 100000;

    return Math.random() * (max - min) + min;
  };

  /**
   * Event listener to dataReceived event.
   * @protected
   * @param {object} event EventFacade object
   */
  lfr.Storage.prototype.onDataReceived_ = function(event) {
    var value = event.val;

    for (var i = 0; i < this.queue_.length; ++i) {
      var queueMessage = this.queue_[i];

      // Check if current message in the queue has the same messageId as those which came from the server.
      if (queueMessage.messageId === value.messageId) {

        // If the status is sent, remove it from the queue and emit an event
        if (value.status === lfr.Storage.STATUS_SENT) {
          this.queue_.splice(i, 1);

          this.emit('messageReceived', queueMessage.message);
        } else {
          // change the status to error with the response code as provided from the server
          queueMessage.status = {
            code: lfr.Transport.STATUS_ERROR,
            reason: value.code
          };
        }
      }
    }
  };

  /**
   * Processes the queue and sends all unsent or previously failed messages.
   * @protected
   */
  lfr.Storage.prototype.processQueue_ = function() {
    // We clear here the timeout because there are two ways to invoke this function:
    // 1. As result of firing dataAdded event
    // 2. As result of timeout
    //
    // There could be situation like this:
    // - dataAdded has been emitd, so this function will be invoked
    // - however, previously this function has started already a timeout and it will be
    // invoked in some time.
    //
    // In this case we have to cancel the timeout, process the queue and start it again,
    // if there are still messages.

    clearTimeout(this.processQueueHandler_);

    for (var i = 0; i < this.queue_.length; ++i) {
      var queueMessage = this.queue_[i];

      // We will send messages which are pending or failed, but with network failure error only
      if (status.code === lfr.Transport.STATUS_PENDING ||
        (status.code === lfr.Transport.STATUS_ERROR && status.reason === lfr.Transport.ERROR_NETWORK_FAILURE)) {

        var userMessage = queueMessage.message;

        lfr.Transport.getSingleton().send(userMessage);

        queueMessage.status = lfr.Transport.STATUS_SENT;
      }
    }

    if (this.queue_.length) {
      this.processQueueHandler_ = setTimeout(this.processQueue_, 500);
    }
  };
}());