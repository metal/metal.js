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
   * Retrieves existing entries from database.
   * @param {!(Object|string)} data Specifies the data query which should be
   *   used in order to retrieve data from the database.
   * @return {Promise}
   */
  lfr.Db.prototype.get = function(data, opt_config) {
    return this.mechanism_.get(data, opt_config);
  };

  /**
   * Removes entries from database.
   * @param {!(Object|string)} data Data object or Id to the data, which
   *   should be removed from the database.
   * @param {Object=} opt_config Optional configuration object with metadata
   *   about delete operation.
   * @return {Promise}
   */
  lfr.Db.prototype.delete = function(data, opt_config) {
    return this.mechanism_.delete(data, opt_config);
  };
  /**
   * Stores new entries to database.
   * @param {!(Object|string)} data Data object which should be stored to the
   *   database.
   * @param {Object} opt_config Optional configuration object with metadata
   *   about post operation.
   * @return {Promise}
   */
  lfr.Db.prototype.post = function(data, opt_config) {
    return this.mechanism_.post(data, opt_config);
  };

  /**
   * Updates existing entries into the database.
   * @param {!(Object|string)} data Data object or Id to the data, which
   *   should be updated into the database.
   * @param {Object} opt_config Optional configuration object with metadata
   *   about put operation.
   * @return {Promise}
   */
  lfr.Db.prototype.put = function(data, opt_config) {
    return this.mechanism_.put(data, opt_config);
  };

}());
