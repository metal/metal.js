'use strict';

import {EventHandle} from 'metal-events';

/**
 * This is a special EventHandle, that is responsible for dom events, instead
 * of EventEmitter events.
 * @extends {EventHandle}
 */
class DomEventHandle extends EventHandle {
	/**
	 * The constructor for `DomEventHandle`.
	 * @param {!EventEmitter} emitter Emitter the event was subscribed to.
	 * @param {string} event The name of the event that was subscribed to.
	 * @param {!Function} listener The listener subscribed to the event.
	 * @param {boolean} capture Flag indicating if listener should be triggered
	 *   during capture phase, instead of during the bubbling phase. Defaults to false.
	 * @constructor
	 */
	constructor(emitter, event, listener, capture) {
		super(emitter, event, listener);
		this.capture_ = capture;
	}

	/**
	 * @inheritDoc
	 */
	removeListener() {
		this.emitter_.removeEventListener(
			this.event_,
			this.listener_,
			this.capture_
		);
	}
}

export default DomEventHandle;
