(function() {
  'use strict';

  /**
   * Provides API for storing, retrieving, updating and removing data from
   * database.
   * @constructor
   * @param {!lfr.DbMechanism} mechanism The underlying DB mechanism.
   * @extends {lfr.EventEmitter}
   */
  lfr.Db = function(mechanism) {
    lfr.Db.base(this, 'constructor');

    if (!lfr.isDef(mechanism)) {
      throw new Error('Mechanism is not specified');
    }

    this.mechanism_ = mechanism;
  };
  lfr.inherits(lfr.Db, lfr.EventEmitter);

  /**
   * The mechanism used for storing, retrieving, updating and removing data
   * from database.
   * @type {lfr.DbMechanism}
   * @default null
   * @protected
   */
  lfr.Db.prototype.mechanism_ = null;

  /**
   * Timeout for performed database action in milliseconds.
   * @type {number}
   * @default 30000
   * @protected
   */
  lfr.Db.prototype.timeoutMs_ = 30000;

  /**
   * Sends message with GET http verb.
   * @param {*=} message The value which will be used to send data from
   *   the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Promise}
   */
  lfr.Db.prototype.get = function(data, opt_config) {
    return this.dispatchDeferredMechanismAction_(this.mechanism_.get, data, opt_config);
  };

  /**
   * Sends message with HEAD http verb.
   * @param {*=} message The value which will be used to send data from
   *   the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Promise}
   */
  lfr.Db.prototype.head = function(data, opt_config) {
    return this.dispatchDeferredMechanismAction_(this.mechanism_.head, data, opt_config);
  };

  /**
   * Sends message with DELETE http verb.
   * @param {*=} message The value which will be used to send data from
   *   the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Promise}
   */
  lfr.Db.prototype.delete = function(data, opt_config) {
    return this.dispatchDeferredMechanismAction_(this.mechanism_.delete, data, opt_config);
  };

  /**
   * Dispatches mechanism action with timeout support.
   * @param {!Function} handler
   * @param {!*} data Message object to the message.
   * @param {Object=} opt_config Optional configuration object with metadata
   *   about delete operation.
   * @return {Promise}
   */
  lfr.Db.prototype.dispatchDeferredMechanismAction_ = function(handler, data, opt_config) {
    var def = handler.call(this.mechanism_, data, opt_config);

    var timer = setTimeout(function() {
      def.cancel(new lfr.Promise.CancellationError('Timeout'));
    }, this.getTimeoutMs());

    def.thenAlways(function() {
      clearTimeout(timer);
    });

    return def;
  };

  /**
   * Gets timeout in milliseconds.
   * @return {number}
   */
  lfr.Db.prototype.getTimeoutMs = function() {
    return this.timeoutMs_;
  };

  /**
   * Sends message with PATCH http verb.
   * @param {*=} message The value which will be used to send data from
   *   the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Promise}
   */
  lfr.Db.prototype.patch = function(data, opt_config) {
    return this.dispatchDeferredMechanismAction_(this.mechanism_.patch, data, opt_config);
  };

  /**
   * Sends message with POST http verb.
   * @param {*=} message The value which will be used to send data from
   *   the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Promise}
   */
  lfr.Db.prototype.post = function(data, opt_config) {
    return this.dispatchDeferredMechanismAction_(this.mechanism_.post, data, opt_config);
  };

  /**
   * Sends message with PUT http verb.
   * @param {*=} message The value which will be used to send data from
   *   the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Promise}
   */
  lfr.Db.prototype.put = function(data, opt_config) {
    return this.dispatchDeferredMechanismAction_(this.mechanism_.put, data, opt_config);
  };

  /**
   * Sets timeout in milliseconds.
   * @param {number} timeoutMs
   */
  lfr.Db.prototype.setTimeoutMs = function(timeoutMs) {
    this.timeoutMs_ = timeoutMs;
  };

}());
