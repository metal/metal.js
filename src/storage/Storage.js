(function() {
  'use strict';

  /**
   * Provides a convenient API for data persistence using a selected data
   * storage mechanism.
   * @param {!lfr.StorageMechanism} mechanism The underlying storage
   *   mechanism.
   * @constructor
   */
  lfr.Storage = function(mechanism) {
    this.mechanism = mechanism;
  };

  /**
   * Invalid value error thrown by the storage.
   * @type {string}
   * @const
   */
  lfr.Storage.INVALID_VALUE = 'Storage: Invalid value was encountered';

  /**
   * The mechanism used to persist key-value pairs.
   * @protected {lfr.StorageMechanism}
   * @type {lfr.StorageMechanism}
   * @default null
   */
  lfr.Storage.prototype.mechanism = null;

  /**
   * Gets the underlying storage mechanism.
   * @return {lfr.StorageMechanism}
   */
  lfr.Storage.prototype.getMechanism = function() {
    return this.mechanism;
  };

  /**
   * Sets an item in the data storage.
   * @param {string} key The key to set.
   * @param {*} value The value to serialize to a string and save.
   */
  lfr.storage.Storage.prototype.set = function(key, value) {
    if (!lfr.isDef(value)) {
      this.mechanism.remove(key);
      return;
    }
    this.mechanism.set(key, lfr.json.serialize(value));
  };

  /**
   * Sets the underlying storage mechanism.
   * @param {lfr.StorageMechanism} mechanism
   */
  lfr.Storage.prototype.setMechanism = function(mechanism) {
    this.mechanism = mechanism;
  };

  /**
   * Gets an item from the data storage.
   * @param {string} key The key to get.
   * @return {*} Deserialized value or undefined if not found.
   */
  lfr.storage.Storage.prototype.get = function(key) {
    var json;
    try {
      json = this.mechanism.get(key);
    } catch (e) {
      return undefined;
    }
    if (lfr.isNull(json)) {
      return undefined;
    }
    try {
      return JSON.parse(json);
    } catch (e) {
      throw lfr.Storage.INVALID_VALUE;
    }
  };

  /**
   * Removes an item from the data storage.
   * @param {string} key The key to remove.
   */
  lfr.storage.Storage.prototype.remove = function(key) {
    this.mechanism.remove(key);
  };

}());
