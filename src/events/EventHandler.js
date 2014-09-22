(function() {
  'use strict';

  /**
   * EventHandler utility. It's useful for easily removing a group of
   * listeners from different lfr.EventEmitter instances.
   * @constructor
   */
  lfr.EventHandler = function() {
    this.eventHandles_ = [];
  };
  lfr.inherits(lfr.EventHandler, lfr.Disposable);

  /**
   * An array that holds the added event handles, so the listeners can be
   * removed later.
   * @type {Array.<lfr.EventHandle>}
   * @protected
   */
  lfr.EventHandler.prototype.eventHandles_ = null;

  /**
   * Adds event handles to be removed later through the `removeAllListeners`
   * method.
   * @param {...(!lfr.EventHandle)} var_args
   */
  lfr.EventHandler.prototype.add = function() {
    for (var i = 0; i < arguments.length; i++) {
      this.eventHandles_.push(arguments[i]);
    }
  };

  /**
   * Disposes of this instance's object references.
   * @override
   */
  lfr.EventHandler.prototype.disposeInternal = function() {
    delete this.eventHandles_;
  };

  /**
   * Removes all listeners that have been added through the `add` method.
   */
  lfr.EventHandler.prototype.removeAllListeners = function() {
    for (var i = 0; i < this.eventHandles_.length; i++) {
      this.eventHandles_[i].removeListener();
    }

    this.eventHandles_ = [];
  };

}());
