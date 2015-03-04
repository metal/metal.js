'use strict';

import core from '../core';

/**
 * Abstract interface for storing and retrieving data using some persistence
 * mechanism.
 * @constructor
 */
class StorageMechanism {
  /**
   * Set a value for a key.
   * @param {string} key The key to set.
   * @param {string} value The string to save.
   */
  set() {
    core.abstractMethod();
  }

  /**
   * Get the value stored under a key.
   * @param {string} key The key to get.
   * @return {?string} The corresponding value, null if not found.
   */
  get() {
    core.abstractMethod();
  }

  /**
   * Remove a key and its value.
   * @param {string} key The key to remove.
   */
  remove() {
    core.abstractMethod();
  }
}

export default StorageMechanism;
