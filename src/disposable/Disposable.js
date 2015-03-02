'use strict';

import core from '../core';

/**
 * Disposable utility. When inherited provides the `dispose` function to its
 * subclass, which is responsible for disposing of any object references
 * when an instance won't be used anymore. Subclasses should override
 * `disposeInternal` to implement any specific disposing logic.
 * @constructor
 */
class Disposable {
  /**
   * Disposes of this instance's object references. Calls `disposeInternal`.
   */
  dispose() {
    if (!this.disposed_) {
      this.disposeInternal();
      this.disposed_ = true;
    }
  }

  /**
   * Checks if this instance has already been disposed.
   * @return {boolean}
   */
  isDisposed() {
    return this.disposed_;
  }
}

/**
 * Flag indicating if this instance has already been disposed.
 * @type {boolean}
 * @protected
 */
Disposable.prototype.disposed_ = false;

/**
 * Subclasses should override this method to implement any specific
 * disposing logic (like clearing references and calling `dispose` on other
 * disposables).
 */
Disposable.prototype.disposeInternal = core.nullFunction;

export default Disposable;
