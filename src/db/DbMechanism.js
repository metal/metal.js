(function() {
  'use strict';

  /**
   * Provides mechanism for storing, retrieving, updating and removing data from
   * database.
   * @constructor
   * @param {!string} uri The data endpoint.
   */
  lfr.DbMechanism = function(uri) {
    lfr.DbMechanism.base(this, 'constructor');

    if (!lfr.isDef(uri)) {
      throw new Error('Db mechanism uri not specified');
    }

    this.uri_ = uri;
  };
  lfr.inherits(lfr.DbMechanism, lfr.EventEmitter);

  /**
   * Holds status of a request message .
   * @type {Object}
   * @const
   * @static
   */
  lfr.DbMechanism.MessageStatus = {
    PENDING: 0,
    SENT: 1
  };

  /**
   * Holds the db mechanism uri.
   * @type {string}
   * @default ''
   * @protected
   */
  lfr.DbMechanism.prototype.uri_ = '';

  /**
   * Sends message with DELETE http verb.
   * @param {*=} message The value which will be used to
   *   retrieve data from the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Promise}
   */
  lfr.DbMechanism.prototype.delete = lfr.abstractMethod;

  /**
   * Sends message with GET http verb.
   * @param {*=} message The value which will be used to retrieve data from
   *   the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Promise}
   */
  lfr.DbMechanism.prototype.get = lfr.abstractMethod;

  /**
   * Sends message with HEAD http verb.
   * @param {*=} message The value which will be used to send data from
   *   the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Promise}
   */
  lfr.DbMechanism.prototype.head = lfr.abstractMethod;


  /**
   * Gets the db mechanism uri.
   * @return {string}
   */
  lfr.DbMechanism.prototype.getUri = function() {
    return this.uri_;
  };

  /**
   * Sends message with PATCH http verb.
   * @param {*=} message The value which will be used to patch data from
   *   the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Promise}
   */
  lfr.DbMechanism.prototype.patch = lfr.abstractMethod;

  /**
   * Sends message with POST http verb.
   * @param {*=} message The value which should be stored to
   *   the database.
   * @return {Promise}
   */
  lfr.DbMechanism.prototype.post = lfr.abstractMethod;

  /**
   * Sends message with PUT http verb.
   * @param {*=} message The value which will be used to
   *   retrieve data from the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   * @return {Promise}
   */
  lfr.DbMechanism.prototype.put = lfr.abstractMethod;

  /**
   * Sets the db mechanism uri.
   * @return {string}
   */
  lfr.DbMechanism.prototype.setUri = function(uri) {
    this.uri_ = uri;
  };

}());
