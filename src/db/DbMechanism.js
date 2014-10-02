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
   * Holds pending status of a request.
   * @type {number}
   * @const
   * @static
   */
  lfr.DbMechanism.STATUS_PENDING = 0;

  /**
   * Holds sent status of a request.
   * @type {number}
   * @const
   * @static
   */
  lfr.DbMechanism.STATUS_SENT = 1;

  /**
   * Holds received status of a request.
   * @type {number}
   * @const
   * @static
   */
  lfr.DbMechanism.STATUS_RECEIVED = 2;

  /**
   * Holds the db mechanism uri.
   * @type {string}
   * @default ''
   * @protected
   */
  lfr.DbMechanism.prototype.uri_ = '';

  /**
   * Deletes data from database.
   * @param {!(Object|string|number)} value The value which will be used to
   *   retrieve data from the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is retrieved from the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   */
  lfr.DbMechanism.prototype.delete = lfr.abstractMethod;

  /**
   * Retrieves data from database.
   * @param {!(Object|string|number)} value The value which will be used to retrieve data from
   *   the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is retrieved from the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   */
  lfr.DbMechanism.prototype.get = lfr.abstractMethod;

  /**
   * Gets the db mechanism uri.
   * @return {string}
   */
  lfr.DbMechanism.prototype.getUri = function() {
    return this.uri_;
  };

  /**
   * Stores data to database.
   * @param {!(Object|string|number)} value The value which should be stored to
   *   the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is stored to the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
   */
  lfr.DbMechanism.prototype.post = lfr.abstractMethod;

  /**
   * Retrieves data from database.
   * @param {!(Object|string|number)} value The value which will be used to
   *   retrieve data from the database.
   * @param {Function=} opt_callback optional Callback function which will be
   *   invoked once the data is retrieved from the database.
   * @param {Object=} opt_config optional Data payload to be provided to the
   *   database.
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
