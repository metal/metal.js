(function() {
  'use strict';

  var originalStopPropagation = Event.prototype.stopPropagation;

  /**
   * Overwrites the original `stopPropagation` function from `Event` to update
   * the `stopped` property when called. Calls the original function.
   */
  Event.prototype.stopPropagation = function() {
    originalStopPropagation.call(this);
    this.stopped = true;
  };

  var originalStopImmediatePropagation = Event.prototype.stopImmediatePropagation;

  /**
   * Overwrites the original `stopImmediatePropagation` function from `Event`
   * to update the `stopped` property when called. Calls the original function.
   */
  Event.prototype.stopImmediatePropagation = function() {
    originalStopImmediatePropagation.call(this);
    this.stopped = true;
  };
}());
