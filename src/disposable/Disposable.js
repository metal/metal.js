(function() {
  'use strict';

  /**
   * Disposable utility. When inherited provides the `dispose` function to its
   * subclass, which is responsible for disposing of any object references
   * when an instance won't be used anymore. Subclasses should override
   * `disposeInternal` to implement any specific disposing logic.
   * @constructor
   */
  lfr.Disposable = function() {};

  /**
   * Flag indicating if this instance has already been disposed.
   * @type {boolean}
   * @protected
   */
  lfr.Disposable.prototype.disposed_ = false;

  /**
   * Disposes of this instance's object references. Calls `disposeInternal`.
   */
  lfr.Disposable.prototype.dispose = function() {
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
  lfr.Disposable.prototype.disposeInternal = function() {};

  /**
   * Checks if this instance has already been disposed.
   * @return {boolean}
   */
  lfr.Disposable.prototype.isDisposed = function() {
    return this.disposed_;
  };

}());
