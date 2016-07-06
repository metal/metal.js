'use strict';

import { array, object, Disposable } from 'metal';

/**
 * EventEmitterProxy utility. It's responsible for linking two EventEmitter
 * instances together, emitting events from the first emitter through the
 * second one. That means that listening to a supported event on the target
 * emitter will mean listening to it on the origin emitter as well.
 * @param {EventEmitter} originEmitter Events originated on this emitter
 *   will be fired for the target emitter's listeners as well.
 * @param {EventEmitter} targetEmitter Event listeners attached to this emitter
 *   will also be triggered when the event is fired by the origin emitter.
 * @param {Object} opt_blacklist Optional blacklist of events that should not be
 *   proxied.
 * @constructor
 * @extends {Disposable}
 */
class EventEmitterProxy extends Disposable {
	constructor(originEmitter, targetEmitter, opt_blacklist, opt_whitelist) {
		super();

		/**
		 * Map of events that should not be proxied.
		 * @type {Object}
		 * @protected
		 */
		this.blacklist_ = object.mixin({
			newListener: true
		}, opt_blacklist);

		/**
		 * The origin emitter. This emitter's events will be proxied through the
		 * target emitter.
		 * @type {EventEmitter}
		 * @protected
		 */
		this.originEmitter_ = originEmitter;

		/**
		 * A list of events that are pending to be listened by an actual origin
		 * emitter. Events are stored here when the origin doesn't exist, so they
		 * can be set on a new origin when one is set.
		 * @type {!Array}
		 * @protected
		 */
		this.pendingEvents_ = [];

		/**
		 * Holds a map of events from the origin emitter that are already being proxied.
		 * @type {Object<string, !EventHandle>}
		 * @protected
		 */
		this.proxiedEvents_ = {};

		/**
		 * The target emitter. This emitter will emit all events that come from
		 * the origin emitter.
		 * @type {EventEmitter}
		 * @protected
		 */
		this.targetEmitter_ = targetEmitter;

		/**
		 * Map of events that should be proxied. If whitelist is set blacklist is ignored.
		 * @type {Object}
		 * @protected
		 */
		this.whitelist_ = opt_whitelist;

		this.startProxy_();
	}

	/**
	 * Adds the given listener for the given event.
	 * @param {string} event
	 * @param {!function()} listener
	 * @return {!EventHandle} The listened event's handle.
	 * @protected
	 */
	addListener_(event, listener) {
		return this.originEmitter_.on(event, listener);
	}

	/**
	 * Adds the proxy listener for the given event.
	 * @param {string} event
	 * @return {!EventHandle} The listened event's handle.
	 * @protected
	 */
	addListenerForEvent_(event) {
		return this.addListener_(event, this.emitOnTarget_.bind(this, event));
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		this.removeListeners_();
		this.proxiedEvents_ = null;
		this.originEmitter_ = null;
		this.targetEmitter_ = null;
	}

	/**
	 * Emits the specified event type on the target emitter.
	 * @param {string} eventType
	 * @protected
	 */
	emitOnTarget_(eventType) {
		var args = [eventType].concat(array.slice(arguments, 1));
		this.targetEmitter_.emit.apply(this.targetEmitter_, args);
	}

	/**
	 * Proxies the given event from the origin to the target emitter.
	 * @param {string} event
	 */
	proxyEvent(event) {
		if (this.shouldProxyEvent_(event)) {
			this.tryToAddListener_(event);
		}
	}

	/**
	 * Removes the proxy listener for all events.
	 * @protected
	 */
	removeListeners_() {
		var events = Object.keys(this.proxiedEvents_);
		for (var i = 0; i < events.length; i++) {
			this.proxiedEvents_[events[i]].removeListener();
		}
		this.proxiedEvents_ = {};
		this.pendingEvents_ = [];
	}

	/**
	 * Changes the origin emitter. This automatically detaches any events that
	 * were already being proxied from the previous emitter, and starts proxying
	 * them on the new emitter instead.
	 * @param {!EventEmitter} originEmitter
	 */
	setOriginEmitter(originEmitter) {
		var events = this.originEmitter_ ?
			Object.keys(this.proxiedEvents_) :
			this.pendingEvents_;
		this.removeListeners_();
		this.originEmitter_ = originEmitter;
		events.forEach(event => this.proxyEvent(event));
	}

	/**
	 * Checks if the given event should be proxied.
	 * @param {string} event
	 * @return {boolean}
	 * @protected
	 */
	shouldProxyEvent_(event) {
		if (this.whitelist_ && !this.whitelist_[event]) {
			return false;
		}
		if (this.blacklist_[event]) {
			return false;
		}
		return !this.proxiedEvents_[event];
	}

	/**
	 * Starts proxying all events from the origin to the target emitter.
	 * @protected
	 */
	startProxy_() {
		this.targetEmitter_.on('newListener', this.proxyEvent.bind(this));
	}

	/**
	 * Adds a listener to the origin emitter, if it exists. Otherwise, stores
	 * the pending listener so it can be used on a future origin emitter.
	 * @param {string} event
	 * @protected
	 */
	tryToAddListener_(event) {
		if (this.originEmitter_) {
			this.proxiedEvents_[event] = this.addListenerForEvent_(event);
		} else {
			this.pendingEvents_.push(event);
		}
	}
}

export default EventEmitterProxy;
