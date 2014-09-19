(function() {
  'use strict';

  /**
   * EventHandle utility. Holds information about an event subscription, and
   * allows removing them easily.
   * @param {!lfr.EventEmitter} emitter Emitter the event was subscribed to.
   * @param {string} event The name of the event that was subscribed to.
   * @param {!Function} listener The listener subscribed to the event.
   * @constructor
   */
  lfr.EventHandle = function(emitter, event, listener) {
    this.emitter_ = emitter;
    this.event_ = event;
    this.listener_ = listener;
  };

  /**
   * The lfr.EventEmitter instance that the event was subscribed to.
   * @type {lfr.EventEmitter}
   * @protected
   */
  lfr.EventHandle.prototype.emitter_ = null;

  /**
   * The name of the event that was subscribed to.
   * @type {string}
   * @protected
   */
  lfr.EventHandle.prototype.event_ = null;

  /**
   * The listener subscribed to the event.
   * @type {Function}
   * @protected
   */
  lfr.EventHandle.prototype.listener_ = null;

  /**
   * Removes the listener subscription from the emitter.
   */
  lfr.EventHandle.prototype.removeListener = function() {
    this.emitter_.removeListener(this.event_, this.listener_);
  };

}());
