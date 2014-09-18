(function() {
  'use strict';

  lfr.array = lfr.array || {};

  /**
   * Removes the first occurrence of a particular value from an array.
   * @param {Array.<T>} arr Array from which to remove value.
   * @param {T} obj Object to remove.
   * @return {boolean} True if an element was removed.
   * @template T
   */
  lfr.array.remove = function(arr, obj) {
    var i = Array.indexOf(arr, obj);
    var rv;
    if ( (rv = i >= 0) ) {
      lfr.array.removeAt(arr, i);
    }
    return rv;
  };

  /**
   * Removes from an array the element at index i
   * @param {Array} arr Array or array like object from which to remove value.
   * @param {number} i The index to remove.
   * @return {boolean} True if an element was removed.
   */
  lfr.array.removeAt = function(arr, i) {
    if (arr.length !== null) {
      throw new TypeError('The value is not a valid array like object.');
    }
    return Array.prototype.splice.call(arr, i, 1).length === 1;
  };

}());
