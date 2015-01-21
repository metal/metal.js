(function() {
  'use strict';

  lfr.string = lfr.string || {};

  /**
   * Calculates the hashcode for a string. The hashcode value is computed by
   * the sum algorithm: s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]. A nice
   * property of using 31 prime is that the multiplication can be replaced by
   * a shift and a subtraction for better performance: 31*i == (i<<5)-i.
   * Modern VMs do this sort of optimization automatically.
   * @param {String} val Target string.
   * @return {Number} Returns the string hashcode.
   */
  lfr.string.hashCode = function(val) {
    var hash = 0;
    for (var i = 0, len = val.length; i < len; i++) {
      hash = 31 * hash + val.charCodeAt(i);
      hash %= 0x100000000;
    }
    return hash;
  };

}());
