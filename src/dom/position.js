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
   * Tests if a region is inside viewport region.
   * @param {DOMRect} region
   * @return {boolean}
   */
  static insideViewportRegion(region) {
    return this.insideRegion(this.getViewportRegion(), region);
  }

  /**
   * Computes the intersection region between two regions.
   * @param {DOMRect} r1
   * @param {DOMRect} r2
   * @return {?DOMRect} Intersection region or null if regions doesn't
   *     intersects.
   */
  static intersection(r1, r2) {
    if (!this.intersectRegion(r1, r2)) {
      return null;
    }
    var bottom = Math.min(r1.bottom, r2.bottom);
    var right = Math.min(r1.right, r2.right);
    var left = Math.max(r1.left, r2.left);
    var top = Math.max(r1.top, r2.top);
    return {
      bottom: bottom,
      height: bottom - top,
      left: left,
      right: right,
      top: top,
      width: right - left
    };
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
   * Gets the region of the document including scrollbar.
   * @param {Document=} opt_doc Optional document element to test.
   * @return {!DOMRect} The returned value is a simulated DOMRect object which
   *     is the union of the rectangles returned by getClientRects() for the
   *     element, i.e., the CSS border-boxes associated with the element.
   */
  static getDocumentRegion(opt_doc) {
    var region = this.getDocumentSize(opt_doc);
    region.bottom = region.height;
    region.left = 0;
    region.right = region.width;
    region.top = 0;
    return region;
  }

  /**
   * Gets the dimensions of the document including scrollbar.
   * @param {Document=} opt_doc Optional window element to test.
   * @return {!Object} Object with values 'width' and 'height'.
   */
  static getDocumentSize(opt_doc) {
    var doc = (opt_doc || document);
    var docEl = doc.documentElement;
    return {
      height: Math.max(doc.body.scrollHeight, docEl.scrollHeight, doc.body.offsetHeight, docEl.offsetHeight, docEl.clientHeight),
      width: Math.max(doc.body.scrollWidth, docEl.scrollWidth, doc.body.offsetWidth, docEl.offsetWidth, docEl.clientWidth)
    };
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
