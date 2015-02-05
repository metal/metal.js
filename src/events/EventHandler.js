'use strict';

import core from '../core';
import Disposable from '../disposable/Disposable';

/**
 * EventHandler utility. It's useful for easily removing a group of
 * listeners from different EventEmitter instances.
 * @constructor
 */
var EventHandler = function() {
  this.eventHandles_ = [];
};
core.inherits(EventHandler, Disposable);

/**
 * An array that holds the added event handles, so the listeners can be
 * removed later.
 * @type {Array.<EventHandle>}
 * @protected
 */
EventHandler.prototype.eventHandles_ = null;

/**
 * Adds event handles to be removed later through the `removeAllListeners`
 * method.
 * @param {...(!EventHandle)} var_args
 */
EventHandler.prototype.add = function() {
  for (var i = 0; i < arguments.length; i++) {
    this.eventHandles_.push(arguments[i]);
  }
};

/**
 * Disposes of this instance's object references.
 * @override
 */
EventHandler.prototype.disposeInternal = function() {
  this.eventHandles_ = null;
};

/**
 * Removes all listeners that have been added through the `add` method.
 */
EventHandler.prototype.removeAllListeners = function() {
  for (var i = 0; i < this.eventHandles_.length; i++) {
    this.eventHandles_[i].removeListener();
  }

  this.eventHandles_ = [];
};

export default EventHandler;
