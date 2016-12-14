'use strict';

import { Disposable } from 'metal';

/**
 * EventHandler utility. It's useful for easily removing a group of
 * listeners from different EventEmitter instances.
 * @constructor
 * @extends {Disposable}
 */
class EventHandler extends Disposable {
	constructor() {
		super();

		/**
		 * An array that holds the added event handles, so the listeners can be
		 * removed later.
		 * @type {Array.<EventHandle>}
		 * @protected
		 */
		this.eventHandles_ = [];
	}

	/**
	 * Adds event handles to be removed later through the `removeAllListeners`
	 * method.
	 * @param {...(!EventHandle)} var_args
	 */
	add() {
		for (let i = 0; i < arguments.length; i++) {
			this.eventHandles_.push(arguments[i]);
		}
	}

	/**
	 * Disposes of this instance's object references.
	 * @override
	 */
	disposeInternal() {
		this.eventHandles_ = null;
	}

	/**
	 * Removes all listeners that have been added through the `add` method.
	 */
	removeAllListeners() {
		for (let i = 0; i < this.eventHandles_.length; i++) {
			this.eventHandles_[i].removeListener();
		}

		this.eventHandles_ = [];
	}
}

export default EventHandler;
