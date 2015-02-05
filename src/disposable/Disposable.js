'use strict';

import core from '../core';

/**
 * Disposable utility. When inherited provides the `dispose` function to its
 * subclass, which is responsible for disposing of any object references
 * when an instance won't be used anymore. Subclasses should override
 * `disposeInternal` to implement any specific disposing logic.
 * @constructor
 */
var Disposable = function() {};

/**
 * Flag indicating if this instance has already been disposed.
 * @type {boolean}
 * @protected
 */
Disposable.prototype.disposed_ = false;

/**
 * Disposes of this instance's object references. Calls `disposeInternal`.
 */
Disposable.prototype.dispose = function() {
  if (!this.disposed_) {
    this.disposeInternal();
    this.disposed_ = true;
  }
};

/**
 * Subclasses should override this method to implement any specific
 * disposing logic (like clearing references and calling `dispose` on other
 * disposables).
 */
Disposable.prototype.disposeInternal = core.nullFunction;

/**
 * Checks if this instance has already been disposed.
 * @return {boolean}
 */
Disposable.prototype.isDisposed = function() {
  return this.disposed_;
};

export default Disposable;
