'use strict';

import core from '../core';
import Disposable from '../disposable/Disposable';
import EventHandle from '../events/EventHandle';
import WildcardTrie from '../structs/WildcardTrie';

/**
 * EventEmitter utility.
 * @constructor
 * @extends {Disposable}
 */
class EventEmitter extends Disposable {
  constructor() {
    this.listenersTree_ = new WildcardTrie();
  }

  /**
   * Adds a listener to the end of the listeners array for the specified events.
   * @param {!(Array|string)} events
   * @param {!Function} listener
   * @return {!EventHandle} Can be used to remove the listener.
   */
  addListener(events, listener) {
    this.validateListener_(listener);

    events = this.normalizeEvents_(events);
    for (var i = 0; i < events.length; i++) {
      this.addSingleListener_(events[i], listener);
    }

    return new EventHandle(this, events, listener);
  }

  /**
   * Adds a listener to the end of the listeners array for a single event.
   * @param {string} event
   * @param {!Function} listener
   * @param {Function=} opt_origin The original function that was added as a
   *   listener, if there is any.
   * @protected
   */
  addSingleListener_(event, listener, opt_origin) {
    this.emit('newListener', event, listener);

    var listeners = this.listenersTree_.setKeyValue(
      this.splitNamespaces_(event),
      [{
        fn: listener,
        id: this.nextId_++,
        origin: opt_origin
      }],
      this.mergeListenerArrays_
    );

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
   * Comparison function between listener objects.
   * @param {!Object} listener1
   * @param {!Object} listener2
   * @return {Number} The difference between the ids of the objects.
   * @protected
   */
  compareListenerObjs_(obj1, obj2) {
    return obj1.id - obj2.id;
  }

  /**
   * Disposes of this instance's object references.
   * @override
   */
  disposeInternal() {
    this.listenersTree_.dispose();
    this.listenersTree_ = null;
  }

  /**
   * Execute each of the listeners in order with the supplied arguments.
   * @param {string} event
   * @param {*} opt_args [arg1], [arg2], [...]
   * @return {boolean} Returns true if event had listeners, false otherwise.
   */
  emit(event) {
    var args = Array.prototype.slice.call(arguments, 1);
    var listened = false;
    var listeners = this.listeners(event);

    if (this.getShouldUseFacade()) {
      var facade = {
        type: event
      };
      args = [facade].concat(args);
    }

    for (var i = 0; i < listeners.length; i++) {
      listeners[i].apply(this, args);
      listened = true;
    }

    return listened;
  }

  /**
   * Gets the delimiter to be used by namespaces.
   * @return {string}
   */
  getDelimiter() {
    return this.delimiter_;
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
    var listenerArrays = this.searchListenerTree_(event);
    var listeners = [];

    for (var i = 0; i < listenerArrays.length; i++) {
      listeners = listeners.concat(listenerArrays[i]);
    }

    if (listenerArrays.length > 1) {
      // If there was more than one result, we should reorder the listeners,
      // since we joined them without taking the order into account.
      listeners.sort(this.compareListenerObjs_);
    }

    return listeners.map(function(listener) {
      return listener.fn;
    });
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

    self.addSingleListener_(event, handlerInternal, listener);
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
   * Merges two objects that contain event listeners.
   * @param  {!Object} arr1
   * @param  {!Object} arr2
   * @return {!Object}
   * @protected
   */
  mergeListenerArrays_(arr1, arr2) {
    for (var i = 0; i < arr2.length; i++) {
      arr1.push(arr2[i]);
    }
    return arr1;
  }

  /**
   * Converts the parameter to an array if only one event is given.
   * @param  {!(Array|string)} events
   * @return {!Array}
   * @protected
   */
  normalizeEvents_(events) {
    return core.isString(events) ? [events] : events;
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

    var listenerArrays = this.searchListenerTree_(events);
    for (var i = 0; i < listenerArrays.length; i++) {
      this.removeMatchingListenerObjs_(listenerArrays[i], listener);
    }

    return this;
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
    if (!opt_events) {
      this.listenersTree_.clear();
      return this;
    }

    return this.removeAllListenersForEvents_(opt_events);
  }

  /**
   * Removes all listeners for the specified events.
   * @param  {!(Array|string)} events
   * @return {!Object} Returns emitter, so calls can be chained.
   * @protected
   */
  removeAllListenersForEvents_(events) {
    events = this.normalizeEvents_(events);
    for (var i = 0; i < events.length; i++) {
      this.listenersTree_.setKeyValue(this.splitNamespaces_(events[i]), []);
    }

    return this;
  }

  /**
   * Removes all listener objects from the given array that match the given
   * listener function.
   * @param {!Array.<Object>} listenerObjects
   * @param {!Function} listener
   * @protected
   */
  removeMatchingListenerObjs_(listenerObjects, listener) {
    for (var i = listenerObjects.length - 1; i >= 0; i--) {
      if (this.matchesListener_(listenerObjects[i], listener)) {
        listenerObjects.splice(i, 1);
      }
    }
  }

  /**
   * Searches the listener tree for the given events.
   * @param {!(Array|string)} events
   * @return {!Array.<Array>} An array of listener arrays returned by the tree.
   * @protected
   */
  searchListenerTree_(events) {
    var values = [];

    events = this.normalizeEvents_(events);
    for (var i = 0; i < events.length; i++) {
      values = values.concat(
        this.listenersTree_.getKeyValue(this.splitNamespaces_(events[i]))
      );
    }

    return values;
  }

  /**
   * Sets the delimiter to be used by namespaces.
   * @param {string} delimiter
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  setDelimiter(delimiter) {
    this.delimiter_ = delimiter;
    return this;
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
   * Splits the event, using the current delimiter.
   * @param {string} event
   * @return {!Array}
   * @protected
   */
  splitNamespaces_(event) {
    return event.split(this.getDelimiter());
  }

  /**
   * Checks if the given listener is valid, throwing an exception when it's not.
   * @param  {*} listener
   * @protected
   */
  validateListener_(listener) {
    if (!core.isFunction(listener)) {
      throw new TypeError('Listener must be a function');
    }
  }
}

/**
 * The delimiter being used for namespaces.
 * @type {string}
 * @protected
 */
EventEmitter.prototype.delimiter_ = '.';

/**
 * Holds event listeners scoped by event type.
 * @type {Trie}
 * @protected
 */
EventEmitter.prototype.listenersTree_ = null;

/**
 * The maximum number of listeners allowed for each event type. If the number
 * becomes higher than the max, a warning will be issued.
 * @type {number}
 * @protected
 */
EventEmitter.prototype.maxListeners_ = 10;

/**
 * The id that will be assigned to the next listener added to this event
 * emitter.
 * @type {number}
 * @protected
 */
EventEmitter.prototype.nextId_ = 1;

/**
 * Adds a listener to the end of the listeners array for the specified events.
 * @param {!(Array|string)} events
 * @param {!Function} listener
 * @return {!EventHandle} Can be used to remove the listener.
 */
EventEmitter.prototype.on = EventEmitter.prototype.addListener;

/**
 * Removes a listener for the specified events.
 * Caution: changes array indices in the listener array behind the listener.
 * @param {!(Array|string)} events
 * @param {!Function} listener
 * @return {!Object} Returns emitter, so calls can be chained.
 */
EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

/**
 * Configuration option which determines if an event facade should be sent
 * as a param of listeners when emitting events. If set to true, the facade
 * will be passed as the first argument of the listener.
 * @type {boolean}
 * @protected
 */
EventEmitter.prototype.shouldUseFacade_ = false;

export default EventEmitter;
