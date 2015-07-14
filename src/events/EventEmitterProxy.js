'use strict';

import core from '../core';
import dom from '../dom/dom';
import Disposable from '../disposable/Disposable';

/**
 * EventEmitterProxy utility. It's responsible for linking two EventEmitter
 * instances together, emitting events from the first emitter through the
 * second one. That means that listening to a supported event on the target
 * emitter will mean listening to it on the origin emitter as well.
 * @param {EventEmitter | Element} originEmitter Events originated on this emitter
 *   will be fired for the target emitter's listeners as well. Can be either a real
 *   EventEmitter instance or a DOM element.
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
		this.blacklist_ = opt_blacklist || {};

		/**
		 * The origin emitter. This emitter's events will be proxied through the
		 * target emitter.
		 * @type {EventEmitter}
		 * @protected
		 */
		this.originEmitter_ = originEmitter;

		/**
		 * Holds a map of events from the origin emitter that are already being proxied.
		 * @type {Object}
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
	 * @inheritDoc
	 */
	disposeInternal() {
		var removeFnName = this.originEmitter_.removeEventListener ? 'removeEventListener' : 'removeListener';
		for (var event in this.proxiedEvents_) {
			this.originEmitter_[removeFnName](event, this.proxiedEvents_[event]);
		}

		this.proxiedEvents_ = null;
		this.originEmitter_ = null;
		this.targetEmitter_ = null;
	}

	/**
	 * Proxies the given event from the origin to the target emitter.
	 * @param {string} event
	 */
	proxyEvent_(event) {
		if (!this.shouldProxyEvent_(event)) {
			return;
		}

		var self = this;
		this.proxiedEvents_[event] = function() {
			var args = [event].concat(Array.prototype.slice.call(arguments, 0));
			self.targetEmitter_.emit.apply(self.targetEmitter_, args);
		};

		if (core.isElement(this.originEmitter_) || core.isDocument(this.originEmitter_)) {
			dom.on(this.originEmitter_, event, this.proxiedEvents_[event]);
		} else {
			this.originEmitter_.on(event, this.proxiedEvents_[event]);
		}
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
		return !this.proxiedEvents_[event] &&
			(!(this.originEmitter_.removeEventListener || this.originEmitter_.addEventListener) ||
			dom.supportsEvent(this.originEmitter_, event));
	}

	/**
	 * Starts proxying all events from the origin to the target emitter.
	 * @protected
	 */
	startProxy_() {
		this.targetEmitter_.on('newListener', this.proxyEvent_.bind(this));
	}
}

export default EventEmitterProxy;
