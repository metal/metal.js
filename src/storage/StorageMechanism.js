(function() {
  'use strict';

  /**
   * Abstract interface for storing and retrieving data using some persistence
   * mechanism.
   * @constructor
   */
  lfr.StorageMechanism = function() {};

  /**
   * Set a value for a key.
   * @param {string} key The key to set.
   * @param {string} value The string to save.
   */
  lfr.storage.StorageMechanism.prototype.set = lfr.abstractMethod;

  /**
   * Get the value stored under a key.
   * @param {string} key The key to get.
   * @return {?string} The corresponding value, null if not found.
   */
  lfr.storage.StorageMechanism.prototype.get = lfr.abstractMethod;

  /**
   * Remove a key and its value.
   * @param {string} key The key to remove.
   */
  lfr.storage.StorageMechanism.prototype.remove = lfr.abstractMethod;

}());
