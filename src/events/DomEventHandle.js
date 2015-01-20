(function() {
  'use strict';

  /**
   * This is a special EventHandle, that is responsible for dom events, instead
   * of EventEmitter events.
   * @param {!lfr.EventEmitter} emitter Emitter the event was subscribed to.
   * @param {string} event The name of the event that was subscribed to.
   * @param {!Function} listener The listener subscribed to the event.
   * @constructor
   */
  lfr.DomEventHandle = function(emitter, event, listener) {
    lfr.DomEventHandle.base(this, 'constructor', emitter, event, listener);
  };
  lfr.inherits(lfr.DomEventHandle, lfr.EventHandle);

  /**
   * @inheritDoc
   */
  lfr.DomEventHandle.prototype.removeListener = function() {
    this.emitter_.removeEventListener(this.event_, this.listener_);
  };
}());
