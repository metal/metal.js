'use strict';

/**
 * Class with static methods responsible for doing browser position checks.
 */
class position {
  /**
   * Gets the size of an element and its position relative to the viewport.
   * @param {!Element} node
   * @return {!DOMRect} The returned value is a DOMRect object which is the
   *     union of the rectangles returned by getClientRects() for the element,
   *     i.e., the CSS border-boxes associated with the element.
   */
  static getRegion(node) {
    return node.getBoundingClientRect();
  }

  /**
   * Gets the region of the viewport excluding scrollbar.
   * @param {Window=} opt_window Optional window element to test.
   * @return {!Object} Object with values 'width' and 'height'.
   */
  static getViewportRegion(opt_window) {
    var region = this.getViewportSize(opt_window);
    region.bottom = region.height;
    region.left = 0;
    region.right = region.width;
    region.top = 0;
    return region;
  }

  /**
   * Gets the dimensions of the viewport excluding scrollbar.
   * @param {Window=} opt_window Optional window element to test.
   * @return {!Object} Object with values 'width' and 'height'.
   */
  static getViewportSize(opt_window) {
    var el = (opt_window || window).document.documentElement;
    return {
      height: el.clientHeight,
      width: el.clientWidth
    };
  }
}

export default position;
