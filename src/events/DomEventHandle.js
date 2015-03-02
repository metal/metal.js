'use strict';

import EventHandle from '../events/EventHandle';

/**
 * This is a special EventHandle, that is responsible for dom events, instead
 * of EventEmitter events.
 * @param {!EventEmitter} emitter Emitter the event was subscribed to.
 * @param {string} event The name of the event that was subscribed to.
 * @param {!Function} listener The listener subscribed to the event.
 * @constructor
 * @extends {EventHandle}
 */
class DomEventHandle extends EventHandle {
  constructor(emitter, event, listener) {
    super(emitter, event, listener);
  }

  /**
   * @inheritDoc
   */
  removeListener() {
    this.emitter_.removeEventListener(this.event_, this.listener_);
  }
}

export default DomEventHandle;
