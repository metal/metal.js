'use strict';

import core from '../core';

/**
 * Provides a convenient API for data persistence using a selected data
 * storage mechanism.
 * @param {!StorageMechanism} mechanism The underlying storage
 *   mechanism.
 * @constructor
 */
class Storage {
  constructor(mechanism) {
    this.mechanism_ = mechanism;
  }

  /**
   * Gets the underlying storage mechanism.
   * @return {StorageMechanism}
   */
  getMechanism() {
    return this.mechanism_;
  }

  /**
   * Sets an item in the data storage.
   * @param {string} key The key to set.
   * @param {*} value The value to serialize to a string and save.
   */
  set(key, value) {
    if (!core.isDef(value)) {
      this.mechanism_.remove(key);
      return;
    }
    this.mechanism_.set(key, JSON.stringify(value));
  }

  /**
   * Sets the underlying storage mechanism.
   * @param {StorageMechanism} mechanism
   */
  setMechanism(mechanism) {
    this.mechanism_ = mechanism;
  }

  /**
   * Gets an item from the data storage.
   * @param {string} key The key to get.
   * @return {*} Deserialized value or undefined if not found.
   */
  get(key) {
    var json;
    try {
      json = this.mechanism_.get(key);
    } catch (e) {
      return undefined;
    }
    if (core.isNull(json)) {
      return undefined;
    }
    try {
      return JSON.parse(json);
    } catch (e) {
      throw Storage.INVALID_VALUE;
    }
  }

  /**
   * Removes an item from the data storage.
   * @param {string} key The key to remove.
   */
  remove(key) {
    this.mechanism_.remove(key);
  }
}

/**
 * Invalid value error thrown by the storage.
 * @type {string}
 * @const
 * @static
 */
Storage.INVALID_VALUE = 'Storage: Invalid value was encountered';

/**
 * The mechanism used to persist key-value pairs.
 * @type {StorageMechanism}
 * @default null
 * @protected
 */
Storage.prototype.mechanism_ = null;

export default Storage;
