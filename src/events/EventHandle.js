'use strict';

import core from '../core';
import Disposable from '../disposable/Disposable';

/**
 * EventHandle utility. Holds information about an event subscription, and
 * allows removing them easily.
 * EventHandle is a Disposable, but it's important to note that the
 * EventEmitter that created it is not the one responsible for disposing it.
 * That responsibility is for the code that holds a reference to it.
 * @param {!EventEmitter} emitter Emitter the event was subscribed to.
 * @param {string} event The name of the event that was subscribed to.
 * @param {!Function} listener The listener subscribed to the event.
 * @constructor
 */
var EventHandle = function(emitter, event, listener) {
  this.emitter_ = emitter;
  this.event_ = event;
  this.listener_ = listener;
};
core.inherits(EventHandle, Disposable);

/**
 * The EventEmitter instance that the event was subscribed to.
 * @type {EventEmitter}
 * @protected
 */
EventHandle.prototype.emitter_ = null;

/**
 * The name of the event that was subscribed to.
 * @type {string}
 * @protected
 */
EventHandle.prototype.event_ = null;

/**
 * The listener subscribed to the event.
 * @type {Function}
 * @protected
 */
EventHandle.prototype.listener_ = null;

/**
 * Disposes of this instance's object references.
 * @override
 */
EventHandle.prototype.disposeInternal = function() {
  this.emitter_ = null;
  this.listener_ = null;
};

/**
 * Removes the listener subscription from the emitter.
 */
EventHandle.prototype.removeListener = function() {
  if (!this.emitter_.isDisposed()) {
    this.emitter_.removeListener(this.event_, this.listener_);
  }
};

export default EventHandle;
