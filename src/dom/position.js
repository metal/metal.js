'use strict';

import math from '../math/math';

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
   * Tests if a region is inside another.
   * @param {DOMRect} r1
   * @param {DOMRect} r2
   * @return {boolean}
   */
  static insideRegion(r1, r2) {
    return (r2.top >= r1.top) && (r2.bottom <= r1.bottom) &&
              (r2.right <= r1.right) && (r2.left >= r1.left);
  }

  /**
   * Tests if a region intersects with another.
   * @param {DOMRect} r1
   * @param {DOMRect} r2
   * @return {boolean}
   */
  static intersectRegion(r1, r2) {
    return math.intersectRect(
      r1.top, r1.left, r1.bottom, r1.right,
      r2.top, r2.left, r2.bottom, r2.right);
  }

  /**
   * Gets the region of the viewport excluding scrollbar.
   * @param {Window=} opt_window Optional window element to test.
   * @return {!DOMRect} The returned value is a simulated DOMRect object which
   *     is the union of the rectangles returned by getClientRects() for the
   *     element, i.e., the CSS border-boxes associated with the element.
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
