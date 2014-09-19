(function() {
  'use strict';

  /**
   * EventEmitter utility.
   * @constructor
   */
  lfr.EventEmitter = function() {
    this.listenersTree_ = new lfr.WildcardTrie();
  };

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
   * Adds a listener to the end of the listeners array for the specified event.
   * @param {string} event
   * @param {!Function} listener
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  lfr.EventEmitter.prototype.addListener = function(event, listener) {
    if (!lfr.isFunction(listener)) {
      throw new TypeError('Listener must be a function');
    }

    this.emit('newListener', event, listener);

    var listeners = this.listenersTree_.setKeyValue(
      this.splitNamespaces_(event),
      [listener],
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

    return this;
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

    for (var i = 0; i < listeners.length; i++) {
      if (listeners[i]) {
        listeners[i].apply(this, args);
        listened = true;
      }
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
   * Returns an array of listeners for the specified event.
   * @param {string} event
   * @return {Array} Array of listeners.
   */
  lfr.EventEmitter.prototype.listeners = function(event) {
    var listenerArrays = this.searchListenerTree_(event);
    var listeners = [];

    for (var i = 0; i < listenerArrays.length; i++) {
      listeners = listeners.concat(listenerArrays[i]);
    }

    return listeners;
  };

  /**
   * Adds a listener that will be invoked a fixed number of times for the
   * event. After the event is triggered the specified amount of times, the
   * listener is removed.
   * @param {string} event
   * @param {number} amount The amount of times this event should be listened
   * to.
   * @param {!Function} listener
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  lfr.EventEmitter.prototype.many = function(event, amount, listener) {
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
    handlerInternal.origin = listener;

    self.on(event, handlerInternal);

    return this;
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
   * Remove a listener from the listener array for the specified event.
   * Caution: changes array indices in the listener array behind the listener.
   * @param {string} event
   * @param {!Function} listener
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  lfr.EventEmitter.prototype.off = function(event, listener) {
    if (!lfr.isFunction(listener)) {
      throw new TypeError('Listener must be a function');
    }

    var listenerArrays = this.searchListenerTree_(event);
    for (var i = 0; i < listenerArrays.length; i++) {
      for (var j = 0; j < listenerArrays[i].length; j++) {
        if (listenerArrays[i][j] === listener ||
          (listenerArrays[i][j].origin && listenerArrays[i][j].origin === listener)) {
          listenerArrays[i].splice(j, 1);
          break;
        }
      }
    }

    return this;
  };

  /**
   * Adds a listener to the end of the listeners array for the specified event.
   * @param {string} event
   * @param {!Function} listener
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  lfr.EventEmitter.prototype.on = lfr.EventEmitter.prototype.addListener;

  /**
   * Adds a one time listener for the event. This listener is invoked only the
   * next time the event is fired, after which it is removed.
   * @param {string} event
   * @param {!Function} listener
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  lfr.EventEmitter.prototype.once = function(event, listener) {
    return this.many(event, 1, listener);
  };

  /**
   * Removes all listeners, or those of the specified event. It's not a good
   * idea to remove listeners that were added elsewhere in the code,
   * especially when it's on an emitter that you didn't create.
   * @param {string} event
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  lfr.EventEmitter.prototype.removeAllListeners = function(opt_event) {
    if (opt_event) {
      this.listenersTree_.setKeyValue(this.splitNamespaces_(opt_event), []);
    } else {
      this.listenersTree_.clear();
    }
    return this;
  };

  /**
   * Remove a listener from the listener array for the specified event.
   * Caution: changes array indices in the listener array behind the listener.
   * @param {string} event
   * @param {!Function} listener
   * @return {!Object} Returns emitter, so calls can be chained.
   */
  lfr.EventEmitter.prototype.removeListener = lfr.EventEmitter.prototype.off;

  /**
   * Searches the listener tree for the given event.
   * @param {string} event
   * @return {!Array.<Array>} An array of listener arrays returned by the tree.
   * @protected
   */
  lfr.EventEmitter.prototype.searchListenerTree_ = function(event) {
    return this.listenersTree_.getKeyValue(this.splitNamespaces_(event));
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
   * Splits the event, using the current delimiter.
   * @param {string} event
   * @return {!Array}
   * @protected
   */
  lfr.EventEmitter.prototype.splitNamespaces_ = function(event) {
    return lfr.isString(event) ? event.split(this.getDelimiter()) : event;
  };

}());
