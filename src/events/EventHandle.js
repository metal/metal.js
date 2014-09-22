(function() {
  'use strict';

  /**
   * EventHandle utility. Holds information about an event subscription, and
   * allows removing them easily.
   * EventHandle is a Disposable, but it's important to note that the
   * EventEmitter that created it is not the one responsible for disposing it.
   * That responsibility is for the code that holds a reference to it.
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
  lfr.inherits(lfr.EventHandle, lfr.Disposable);

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
   * Disposes of this instance's object references.
   * @override
   */
  lfr.EventHandle.prototype.disposeInternal = function() {
    delete this.emitter_;
    delete this.listener_;
  };

  /**
   * Removes the listener subscription from the emitter.
   */
  lfr.EventHandle.prototype.removeListener = function() {
    if (!this.emitter_.isDisposed()) {
      this.emitter_.removeListener(this.event_, this.listener_);
    }
  };

}());
