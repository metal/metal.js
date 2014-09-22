(function() {
  'use strict';

  /**
   * Provides API for storing, retrieving, updating and removing data from database.
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
   * Adds new entries to database.
   * @param {!(Object|string)} data Data object which should be stored to the database
   * @param {function} opt_callback Callback function which will be called as soon as data is being added to the database
   * @param {Object} opt_config Optional configuration object with metadata about add operation
   */
  lfr.Db.prototype.add = function(data, opt_callback, opt_config) {
    this.mechanism_.add(data, lfr.rbind(this.onDataAdd_, this, opt_callback), opt_config);
  };

  /**
   * Retrieves existing entries from database.
   * @param {!(Object|string)} data Specifies the data query which should be used in order to retrieve data from the database
   * @param {function} opt_callback Optional callback function which will be called as soon as data is retrieved from the database
   * @param {Object} opt_config Optional configuration object with metadata about the query
   */
  lfr.Db.prototype.find = function(data, opt_callback, opt_config) {
    this.mechanism_.find(data, lfr.rbind(this.onDataFind_, this, opt_callback), opt_config);
  };

  /**
   * Removes entries from database.
   * @param {!(Object|string)} data Data object or Id to the data, which should be removed from the database
   * @param {[type]} opt_callback Optional callback function which will be called as soon as data is removed from the database
   * @param {[type]} opt_config Optional configuration object with metadata about remove operation
   */
  lfr.Db.prototype.remove = function(data, opt_callback, opt_config) {
    this.mechanism_.remove(data, lfr.rbind(this.onDataRemove_, this, opt_callback), opt_config);
  };

  /**
   * Updates existing entries into the database.
   * @param {!(Object|string)} data Data object or Id to the data, which should be updated into the database
   * @param {[type]} opt_callback Optional callback function which will be called as soon as data is updated into the database
   * @param {[type]} opt_config Optional configuration object with metadata about update operation
   */
  lfr.Db.prototype.update = function(data, opt_callback, opt_config) {
    this.mechanism_.update(data, lfr.rbind(this.onDataUpdate_, this, opt_callback), opt_config);
  };

  /**
   * Called when data is being added to database. In case of error, emits `error` event with an instance of Error object
   * as payload. In case of success, emits `add` event with the returned data as payload. If provided, user specified callback
   * will be called in both cases with an instance of Error as first argument, and the returned data from the `add` operation
   * as second one.
   * @param {Error} err If available, contains the error of add operation
   * @param {*} data The returned result from add operation
   * @param {function} opt_callback Optional callback as specified from the user
   */
  lfr.Db.prototype.onDataAdd_ = function(err, data, opt_callback) {
    if (err) {
      this.emit('error', err);
    }
    else {
      this.emit('add', { data: data});
    }

    if (opt_callback) {
      opt_callback(err, data);
    }
  };

  /**
   * Called when data is being retrieved from database. In case of error, emits `error` event with an instance of Error object
   * as payload. In case of success, emits `find` event with the returned data as payload. If provided, user specified callback
   * will be called in both cases with an instance of Error object as first argument, and the returned data from the retrieving
   * operation as second one.
   * @param {Error} err If available, contains the error of find operation
   * @param {*} data The returned result from find operation
   * @param {function} opt_callback Optional callback as specified from the user
   */
  lfr.Db.prototype.onDataFind_ = function(err, data, opt_callback) {
    if (err) {
      this.emit('error', err);
    }
    else {
      this.emit('find', { data: data});
    }

    if (opt_callback) {
      opt_callback(err, data);
    }
  };

  /**
   * Called when data is being removed from database. In case of error, emits `error` event with an instance of Error object
   * as payload. In case of success, emits `remove` event with the returned data as payload. If provided, user specified callback
   * will be called in both cases with an instance of Error object as first argument, and the returned data from remove operation as second one.
   * @param {Error} err If available, contains the error of remove operation
   * @param {*} data The result of remove operation
   * @param {function} opt_callback Optional callback as specified from the user
   */
  lfr.Db.prototype.onDataRemove_ = function(err, data, opt_callback) {
    if (err) {
      this.emit('error', err);
    }
    else {
      this.emit('remove', { data: data});
    }

    if (opt_callback) {
      opt_callback(err, data);
    }
  };

  /**
   * Called when data is being updated into the database. In case of error, emits `error` event with an instance of Error object
   * as payload. In case of success, emits `update` event with the returned data as payload. If provided, user specified callback
   * will be called in both cases with an instance of Error object as first argument, and the returned data from update operation as second one.
   * @param {Error} err If available, contains the error of update operation
   * @param {*} data The result of update operation
   * @param {function} opt_callback Optional callback as specified from the user
   */
  lfr.Db.prototype.onDataUpdate_ = function(err, data, opt_callback) {
    if (err) {
      this.emit('error', err);
    }
    else {
      this.emit('update', { data: data});
    }

    if (opt_callback) {
      opt_callback(err, data);
    }
  };

}());