'use strict';

/**
 * Class with static methods responsible for doing browser position checks.
 */
class position {
  /**
   * Gets the dimensions of the viewport excluding scrollbar.
   * @param {Window=} opt_window Optional window element to test.
   * @return {!Object} Object with values 'width' and 'height'.
   */
  static getViewportSize(opt_window) {
    var win = opt_window || window;
    var el = win.document.documentElement;
    return {
      height: el.clientHeight,
      width: el.clientWidth
    };
  };
}

export default position;
