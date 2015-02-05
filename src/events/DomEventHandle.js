'use strict';

import core from '../core';
import EventHandle from '../events/EventHandle';

/**
 * This is a special EventHandle, that is responsible for dom events, instead
 * of EventEmitter events.
 * @param {!EventEmitter} emitter Emitter the event was subscribed to.
 * @param {string} event The name of the event that was subscribed to.
 * @param {!Function} listener The listener subscribed to the event.
 * @constructor
 */
var DomEventHandle = function(emitter, event, listener) {
  DomEventHandle.base(this, 'constructor', emitter, event, listener);
};
core.inherits(DomEventHandle, EventHandle);

/**
 * @inheritDoc
 */
DomEventHandle.prototype.removeListener = function() {
  this.emitter_.removeEventListener(this.event_, this.listener_);
};

export default DomEventHandle;
