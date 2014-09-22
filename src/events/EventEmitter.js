(function() {
  'use strict';

  /**
   * EventEmitter utility.
   * @constructor
   */
  lfr.EventEmitter = function() {
    this.listenersTree_ = new lfr.WildcardTrie();
  };
  lfr.inherits(lfr.EventEmitter, lfr.Disposable);

  /**
   * The delimiter being used for namespaces.
   * @type {string}
   * @protected
   */
  lfr.EventEmitter.prototype.delimiter_ = '.';

  /**
   * Holds event listeners scoped by event type.
   * @type {Trie}
   * @protected
   */
  lfr.EventEmitter.prototype.listenersTree_ = null;

  /**
   * The maximum number of listeners allowed for each event type. If the number
   * becomes higher than the max, a warning will be issued.
   * @type {number}
   * @protected
   */
  lfr.EventEmitter.prototype.maxListeners_ = 10;

  /**
   * The id that will be assigned to the next listener added to this event
   * emitter.
   * @type {number}
   * @protected
   */
  lfr.EventEmitter.prototype.nextId_ = 1;

  /**
   * Configuration option which determines if an event facade should be sent
   * as a param of listeners when emitting events. If set to true, the facade
   * will be passed as the first argument of the listener.
   * @type {boolean}
   * @protected
   */
  lfr.EventEmitter.prototype.shouldUseFacade_ = false;

  /**
   * Adds a listener to the end of the listeners array for the specified events.
   * @param {!(Array|string)} events
   * @param {!Function} listener
   * @return {!lfr.EventHandle} Can be used to remove the listener.
   */
  lfr.EventEmitter.prototype.addListener = function(events, listener) {
    if (!lfr.isFunction(listener)) {
      throw new TypeError('Listener must be a function');
    }

    events = lfr.isString(events) ? [events] : events;
    for (var i = 0; i < events.length; i++) {
      this.addSingleListener_(events[i], listener);
    }

    return new lfr.EventHandle(this, events, listener);
  };

  /**
   * Adds a listener to the end of the listeners array for a single event.
   * @param {string} event
   * @param {!Function} listener
   * @param {Function=} opt_origin The original function that was added as a
   * listener, if there is any.
   * @return {!lfr.EventHandle} Can be used to remove the listener.
   * @protected
   */
  lfr.EventEmitter.prototype.addSingleListener_ = function(event, listener, opt_origin) {
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
  };

  /**
   * Disposes of this instance's object references.
   * @override
   */
  lfr.EventEmitter.prototype.disposeInternal = function() {
    this.listenersTree_.dispose();
    this.listenersTree_ = null;
  };

  /**
   * Execute each of the listeners in order with the supplied arguments.
   * @param {string} event
   * @param {*} opt_args [arg1], [arg2], [...]
   * @return {boolean} Returns true if event had listeners, false otherwise.
   */
  lfr.EventEmitter.prototype.emit = function(event) {
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
  };

  /**
   * Gets the delimiter to be used by namespaces.
   * @return {string}
   */
  lfr.EventEmitter.prototype.getDelimiter = function() {
    return this.delimiter_;
  };

  /**
   * Gets the configuration option which determines if an event facade should
   * be sent as a param of listeners when emitting events. If set to true, the
   * facade will be passed as the first argument of the listener.
   * @return {boolean}
   */
  lfr.EventEmitter.prototype.getShouldUseFacade = function() {
    return this.shouldUseFacade_;
  };

  /**
   * Returns an array of listeners for the specified event.
   * @param {string} event
   * @return {Array} Array of listeners.
   */
  lfr.EventEmitter.prototype.listeners = function(event) {
    var concatCount = 0;
    var listenerArrays = this.searchListenerTree_(event);
    var listeners = [];

    for (var i = 0; i < listenerArrays.length; i++) {
      if (listenerArrays[i].length) {
        concatCount++;
        listeners = listeners.concat(listenerArrays[i]);
      }
    }

    if (concatCount > 1) {
      // If there was more than one result, we should reorder the listeners,
      // since we joined them without taking the order into account.
      listeners.sort(function(obj1, obj2) {
        return obj1.id - obj2.id;
      });
    }

    return listeners.map(function(listener) {
      return listener.fn;
    });
  };

  /**
   * Adds a listener that will be invoked a fixed number of times for the
   * events. After each event is triggered the specified amount of times, the
   * listener is removed for it.
   * @param {!(Array|string)} events
   * @param {number} amount The amount of times this event should be listened
   * to.
   * @param {!Function} listener
   * @return {!lfr.EventHandle} Can be used to remove the listener.
   */
  lfr.EventEmitter.prototype.many = function(events, amount, listener) {
    if (amount <= 0) {
      return;
    }

    events = lfr.isString(events) ? [events] : events;
    for (var i = 0; i < events.length; i++) {
      this.many_(events[i], amount, listener);
    }

    return new lfr.EventHandle(this, events, listener);
  };

  /**
   * Adds a listener that will be invoked a fixed number of times for a single
   * event. After the event is triggered the specified amount of times, the
   * listener is removed.
   * @param {string} event
   * @param {number} amount The amount of times this event should be listened
   * to.
   * @param {!Function} listener
   * @return {!lfr.EventHandle} Can be used to remove the listener.
   */
  lfr.EventEmitter.prototype.many_ = function(event, amount, listener) {
    var self = this;

    function handlerInternal() {
      if (--amount === 0) {
        self.removeListener(event, handlerInternal);
      }
      listener.apply(self, arguments);
    }

    self.addSingleListener_(event, handlerInternal, listener);
  };

  /**
   * Merges two objects that contain event listeners.
   * @param  {!Object} arr1
   * @param  {!Object} arr2
   * @return {!Object}
   */
  lfr.EventEmitter.prototype.mergeListenerArrays_ = function(arr1, arr2) {
    for (var i = 0; i < arr2.length; i++) {
      arr1.push(arr2[i]);
    }
    return arr1;
  };

  /**
   * Removes a listener for the specified events.
   * Caution: changes array indices in the listener array behind the listener.
   * @param {!(Array|string)} events
   * @param {!Function} listener
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  lfr.EventEmitter.prototype.off = function(events, listener) {
    if (!lfr.isFunction(listener)) {
      throw new TypeError('Listener must be a function');
    }

    var listenerArrays = this.searchListenerTree_(events);
    for (var i = 0; i < listenerArrays.length; i++) {
      for (var j = listenerArrays[i].length - 1; j >= 0; j--) {
        if (listenerArrays[i][j].fn === listener ||
          (listenerArrays[i][j].origin && listenerArrays[i][j].origin === listener)) {
          listenerArrays[i].splice(j, 1);
        }
      }
    }

    return this;
  };

  /**
   * Adds a listener to the end of the listeners array for the specified events.
   * @param {!(Array|string)} events
   * @param {!Function} listener
   * @return {!lfr.EventHandle} Can be used to remove the listener.
   */
  lfr.EventEmitter.prototype.on = lfr.EventEmitter.prototype.addListener;

  /**
   * Adds a one time listener for the events. This listener is invoked only the
   * next time each event is fired, after which it is removed.
   * @param {!(Array|string)} events
   * @param {!Function} listener
   * @return {!lfr.EventHandle} Can be used to remove the listener.
   */
  lfr.EventEmitter.prototype.once = function(events, listener) {
    return this.many(events, 1, listener);
  };

  /**
   * Removes all listeners, or those of the specified events. It's not a good
   * idea to remove listeners that were added elsewhere in the code,
   * especially when it's on an emitter that you didn't create.
   * @param {(Array|string)=} opt_events
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  lfr.EventEmitter.prototype.removeAllListeners = function(opt_events) {
    if (!opt_events) {
      this.listenersTree_.clear();
      return this;
    }

    opt_events = lfr.isString(opt_events) ? [opt_events] : opt_events;
    for (var i = 0; i < opt_events.length; i++) {
      this.listenersTree_.setKeyValue(this.splitNamespaces_(opt_events[i]), []);
    }

    return this;
  };

  /**
   * Removes a listener for the specified events.
   * Caution: changes array indices in the listener array behind the listener.
   * @param {!(Array|string)} events
   * @param {!Function} listener
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  lfr.EventEmitter.prototype.removeListener = lfr.EventEmitter.prototype.off;

  /**
   * Searches the listener tree for the given events.
   * @param {!(Array|string)} events
   * @return {!Array.<Array>} An array of listener arrays returned by the tree.
   * @protected
   */
  lfr.EventEmitter.prototype.searchListenerTree_ = function(events) {
    var values = [];

    events = lfr.isString(events) ? [events] : events;
    for (var i = 0; i < events.length; i++) {
      values = values.concat(
        this.listenersTree_.getKeyValue(this.splitNamespaces_(events[i]))
      );
    }

    return values;
  };

  /**
   * Sets the delimiter to be used by namespaces.
   * @param {string} delimiter
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  lfr.EventEmitter.prototype.setDelimiter = function(delimiter) {
    this.delimiter_ = delimiter;
    return this;
  };

  /**
   * By default EventEmitters will print a warning if more than 10 listeners
   * are added for a particular event. This is a useful default which helps
   * finding memory leaks. Obviously not all Emitters should be limited to 10.
   * This function allows that to be increased. Set to zero for unlimited.
   * @param {number} max The maximum number of listeners.
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  lfr.EventEmitter.prototype.setMaxListeners = function(max) {
    this.maxListeners_ = max;
    return this;
  };

  /**
   * Sets the configuration option which determines if an event facade should
   * be sent as a param of listeners when emitting events. If set to true, the
   * facade will be passed as the first argument of the listener.
   * @param {boolean} shouldUseFacade
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  lfr.EventEmitter.prototype.setShouldUseFacade = function(shouldUseFacade) {
    this.shouldUseFacade_ = shouldUseFacade;
    return this;
  };

  /**
   * Splits the event, using the current delimiter.
   * @param {string} event
   * @return {!Array}
   * @protected
   */
  lfr.EventEmitter.prototype.splitNamespaces_ = function(event) {
    return event.split(this.getDelimiter());
  };

}());
