'use strict';

import {Disposable} from 'metal';

/**
 * EventHandle utility. Holds information about an event subscription, and
 * allows removing them easily.
 * EventHandle is a Disposable, but it's important to note that the
 * EventEmitter that created it is not the one responsible for disposing it.
 * That responsibility is for the code that holds a reference to it.
 * @extends {Disposable}
 */
class EventHandle extends Disposable {
	/**
	 * EventHandle constructor
	 * @param {!EventEmitter} emitter Emitter the event was subscribed to.
	 * @param {string} event The name of the event that was subscribed to.
	 * @param {!Function} listener The listener subscribed to the event.
	 */
	constructor(emitter, event, listener) {
		super();

		/**
		 * The EventEmitter instance that the event was subscribed to.
		 * @type {EventEmitter}
		 * @protected
		 */
		this.emitter_ = emitter;

		/**
		 * The name of the event that was subscribed to.
		 * @type {string}
		 * @protected
		 */
		this.event_ = event;

		/**
		 * The listener subscribed to the event.
		 * @type {Function}
		 * @protected
		 */
		this.listener_ = listener;
	}

	/**
	 * Disposes of this instance's object references.
	 * @override
	 */
	disposeInternal() {
		this.removeListener();
		this.emitter_ = null;
		this.listener_ = null;
	}

	/**
	 * Removes the listener subscription from the emitter.
	 */
	removeListener() {
		if (!this.emitter_.isDisposed()) {
			this.emitter_.removeListener(this.event_, this.listener_);
		}
	}
}

export default EventHandle;
