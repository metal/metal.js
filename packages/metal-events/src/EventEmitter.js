'use strict';

import { array, Disposable, isFunction, isString } from 'metal';
import EventHandle from './EventHandle';

/**
 * EventEmitter utility.
 * @constructor
 * @extends {Disposable}
 */
class EventEmitter extends Disposable {
	constructor() {
		super();

		/**
		 * Holds event listeners scoped by event type.
		 * @type {!Object<string, !Array<!function()>>}
		 * @protected
		 */
		this.events_ = [];

		/**
		 * The maximum number of listeners allowed for each event type. If the number
		 * becomes higher than the max, a warning will be issued.
		 * @type {number}
		 * @protected
		 */
		this.maxListeners_ = 10;

		/**
		 * Configuration option which determines if an event facade should be sent
		 * as a param of listeners when emitting events. If set to true, the facade
		 * will be passed as the first argument of the listener.
		 * @type {boolean}
		 * @protected
		 */
		this.shouldUseFacade_ = false;
	}

	/**
	 * Adds a listener to the end of the listeners array for the specified events.
	 * @param {!(Array|string)} events
	 * @param {!Function} listener
	 * @param {boolean} opt_default Flag indicating if this listener is a default
	 *   action for this event. Default actions are run last, and only if no previous
	 *   listener call `preventDefault()` on the received event facade.
	 * @return {!EventHandle} Can be used to remove the listener.
	 */
	addListener(events, listener, opt_default) {
		this.validateListener_(listener);

		events = this.normalizeEvents_(events);
		for (var i = 0; i < events.length; i++) {
			this.addSingleListener_(events[i], listener, opt_default);
		}

		return new EventHandle(this, events, listener);
	}

	/**
	 * Adds a listener to the end of the listeners array for a single event.
	 * @param {string} event
	 * @param {!Function} listener
	 * @param {boolean} opt_default Flag indicating if this listener is a default
	 *   action for this event. Default actions are run last, and only if no previous
	 *   listener call `preventDefault()` on the received event facade.
	 * @return {!EventHandle} Can be used to remove the listener.
	 * @param {Function=} opt_origin The original function that was added as a
	 *   listener, if there is any.
	 * @protected
	 */
	addSingleListener_(event, listener, opt_default, opt_origin) {
		this.emit('newListener', event, listener);

		if (!this.events_[event]) {
			this.events_[event] = [];
		}
		this.events_[event].push({
			default: opt_default,
			fn: listener,
			origin: opt_origin
		});

		var listeners = this.events_[event];
		if (listeners.length > this.maxListeners_ && !listeners.warned) {
			console.warn(
				'Possible EventEmitter memory leak detected. %d listeners added ' +
				'for event %s. Use emitter.setMaxListeners() to increase limit.',
				listeners.length,
				event
			);
			listeners.warned = true;
		}
	}

	/**
	 * Disposes of this instance's object references.
	 * @override
	 */
	disposeInternal() {
		this.events_ = [];
	}

	/**
	 * Execute each of the listeners in order with the supplied arguments.
	 * @param {string} event
	 * @param {*} opt_args [arg1], [arg2], [...]
	 * @return {boolean} Returns true if event had listeners, false otherwise.
	 */
	emit(event) {
		var args = array.slice(arguments, 1);
		var listeners = (this.events_[event] || []).concat();

		var facade;
		if (this.getShouldUseFacade()) {
			facade = {
				preventDefault: function() {
					facade.preventedDefault = true;
				},
				target: this,
				type: event
			};
			args.push(facade);
		}

		var defaultListeners = [];
		for (var i = 0; i < listeners.length; i++) {
			if (listeners[i].default) {
				defaultListeners.push(listeners[i]);
			} else {
				listeners[i].fn.apply(this, args);
			}
		}
		if (!facade || !facade.preventedDefault) {
			for (var j = 0; j < defaultListeners.length; j++) {
				defaultListeners[j].fn.apply(this, args);
			}
		}

		if (event !== '*') {
			this.emit.apply(this, ['*', event].concat(args));
		}

		return listeners.length > 0;
	}

	/**
	 * Gets the configuration option which determines if an event facade should
	 * be sent as a param of listeners when emitting events. If set to true, the
	 * facade will be passed as the first argument of the listener.
	 * @return {boolean}
	 */
	getShouldUseFacade() {
		return this.shouldUseFacade_;
	}

	/**
	 * Returns an array of listeners for the specified event.
	 * @param {string} event
	 * @return {Array} Array of listeners.
	 */
	listeners(event) {
		return (this.events_[event] || []).map(listener => listener.fn);
	}

	/**
	 * Adds a listener that will be invoked a fixed number of times for the
	 * events. After each event is triggered the specified amount of times, the
	 * listener is removed for it.
	 * @param {!(Array|string)} events
	 * @param {number} amount The amount of times this event should be listened
	 * to.
	 * @param {!Function} listener
	 * @return {!EventHandle} Can be used to remove the listener.
	 */
	many(events, amount, listener) {
		events = this.normalizeEvents_(events);
		for (var i = 0; i < events.length; i++) {
			this.many_(events[i], amount, listener);
		}

		return new EventHandle(this, events, listener);
	}

	/**
	 * Adds a listener that will be invoked a fixed number of times for a single
	 * event. After the event is triggered the specified amount of times, the
	 * listener is removed.
	 * @param {string} event
	 * @param {number} amount The amount of times this event should be listened
	 * to.
	 * @param {!Function} listener
	 * @protected
	 */
	many_(event, amount, listener) {
		var self = this;

		if (amount <= 0) {
			return;
		}

		function handlerInternal() {
			if (--amount === 0) {
				self.removeListener(event, handlerInternal);
			}
			listener.apply(self, arguments);
		}

		self.addSingleListener_(event, handlerInternal, false, listener);
	}

	/**
	 * Checks if a listener object matches the given listener function. To match,
	 * it needs to either point to that listener or have it as its origin.
	 * @param {!Object} listenerObj
	 * @param {!Function} listener
	 * @return {boolean}
	 * @protected
	 */
	matchesListener_(listenerObj, listener) {
		return listenerObj.fn === listener ||
			(listenerObj.origin && listenerObj.origin === listener);
	}

	/**
	 * Converts the parameter to an array if only one event is given.
	 * @param  {!(Array|string)} events
	 * @return {!Array}
	 * @protected
	 */
	normalizeEvents_(events) {
		return isString(events) ? [events] : events;
	}

	/**
	 * Removes a listener for the specified events.
	 * Caution: changes array indices in the listener array behind the listener.
	 * @param {!(Array|string)} events
	 * @param {!Function} listener
	 * @return {!Object} Returns emitter, so calls can be chained.
	 */
	off(events, listener) {
		this.validateListener_(listener);

		events = this.normalizeEvents_(events);
		for (var i = 0; i < events.length; i++) {
			var listenerObjs = this.events_[events[i]] || [];
			this.removeMatchingListenerObjs_(listenerObjs, listener);
		}

		return this;
	}

	/**
	 * Adds a listener to the end of the listeners array for the specified events.
	 * @param {!(Array|string)} events
	 * @param {!Function} listener
	 * @return {!EventHandle} Can be used to remove the listener.
	 */
	on() {
		return this.addListener.apply(this, arguments);
	}

	/**
	 * Adds a one time listener for the events. This listener is invoked only the
	 * next time each event is fired, after which it is removed.
	 * @param {!(Array|string)} events
	 * @param {!Function} listener
	 * @return {!EventHandle} Can be used to remove the listener.
	 */
	once(events, listener) {
		return this.many(events, 1, listener);
	}

	/**
	 * Removes all listeners, or those of the specified events. It's not a good
	 * idea to remove listeners that were added elsewhere in the code,
	 * especially when it's on an emitter that you didn't create.
	 * @param {(Array|string)=} opt_events
	 * @return {!Object} Returns emitter, so calls can be chained.
	 */
	removeAllListeners(opt_events) {
		if (opt_events) {
			var events = this.normalizeEvents_(opt_events);
			for (var i = 0; i < events.length; i++) {
				this.events_[events[i]] = null;
			}
		} else {
			this.events_ = {};
		}
		return this;
	}

	/**
	 * Removes all listener objects from the given array that match the given
	 * listener function.
	 * @param {!Array.<Object>} listenerObjs
	 * @param {!Function} listener
	 * @protected
	 */
	removeMatchingListenerObjs_(listenerObjs, listener) {
		for (var i = listenerObjs.length - 1; i >= 0; i--) {
			if (this.matchesListener_(listenerObjs[i], listener)) {
				listenerObjs.splice(i, 1);
			}
		}
	}

	/**
	 * Removes a listener for the specified events.
	 * Caution: changes array indices in the listener array behind the listener.
	 * @param {!(Array|string)} events
	 * @param {!Function} listener
	 * @return {!Object} Returns emitter, so calls can be chained.
	 */
	removeListener() {
		return this.off.apply(this, arguments);
	}

	/**
	 * By default EventEmitters will print a warning if more than 10 listeners
	 * are added for a particular event. This is a useful default which helps
	 * finding memory leaks. Obviously not all Emitters should be limited to 10.
	 * This function allows that to be increased. Set to zero for unlimited.
	 * @param {number} max The maximum number of listeners.
	 * @return {!Object} Returns emitter, so calls can be chained.
	 */
	setMaxListeners(max) {
		this.maxListeners_ = max;
		return this;
	}

	/**
	 * Sets the configuration option which determines if an event facade should
	 * be sent as a param of listeners when emitting events. If set to true, the
	 * facade will be passed as the first argument of the listener.
	 * @param {boolean} shouldUseFacade
	 * @return {!Object} Returns emitter, so calls can be chained.
	 */
	setShouldUseFacade(shouldUseFacade) {
		this.shouldUseFacade_ = shouldUseFacade;
		return this;
	}

	/**
	 * Checks if the given listener is valid, throwing an exception when it's not.
	 * @param  {*} listener
	 * @protected
	 */
	validateListener_(listener) {
		if (!isFunction(listener)) {
			throw new TypeError('Listener must be a function');
		}
	}
}

export default EventEmitter;
