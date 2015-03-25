'use strict';

import core from '../core';
import math from '../math/math';

/**
 * Class with static methods responsible for doing browser position checks.
 */
class position {
  /**
   * Gets the client height of the specified node. Scroll height is not
   * included.
   * @param {Element|Document|Window=} node
   * @return {Number}
   */
  static getClientHeight(node) {
    return this.getClientSize_(node, 'Height');
  }

  /**
   * Gets the client height or width of the specified node. Scroll height is
   * not included.
   * @param {Element|Document|Window=} node
   * @param {string} `Width` or `Height` property.
   * @return {Number}
   * @protected
   */
  static getClientSize_(node, prop) {
    var el = node;
    if (core.isWindow(node)) {
      el = node.document.documentElement;
    }
    if (core.isDocument(node)) {
      el = node.documentElement;
    }
    return el['client' + prop];
  }

  /**
   * Gets the client width of the specified node. Scroll width is not
   * included.
   * @param {Element|Document|Window=} node
   * @return {Number}
   */
  static getClientWidth(node) {
    return this.getClientSize_(node, 'Width');
  }

  /**
   * Gets the region of the element, document or window.
   * @param {Element|Document|Window=} opt_element Optional element to test.
   * @return {!DOMRect} The returned value is a simulated DOMRect object which
   *     is the union of the rectangles returned by getClientRects() for the
   *     element, i.e., the CSS border-boxes associated with the element.
   * @protected
   */
  static getDocumentRegion_(opt_element) {
    var height = this.getHeight(opt_element);
    var width = this.getWidth(opt_element);
    return this.makeRegion(height, height, 0, width, 0, width);
  }

  /**
   * Gets the height of the specified node. Scroll height is included.
   * @param {Element|Document|Window=} node
   * @return {Number}
   */
  static getHeight(node) {
    return this.getSize_(node, 'Height');
  }

  /**
   * Gets the size of an element and its position relative to the viewport.
   * @param {!Document|Element|Window} node
   * @return {!DOMRect} The returned value is a DOMRect object which is the
   *     union of the rectangles returned by getClientRects() for the element,
   *     i.e., the CSS border-boxes associated with the element.
   */
  static getRegion(node) {
    if (core.isDocument(node) || core.isWindow(node)) {
      return this.getDocumentRegion_(node);
    }
    return this.makeRegionFromBoundingRect_(node.getBoundingClientRect());
  }

  /**
   * Gets the scroll left position of the specified node.
   * @param {Element|Document|Window=} node
   * @return {Number}
   */
  static getScrollLeft(node) {
    if (core.isWindow(node)) {
      return node.pageXOffset;
    }
    if (core.isDocument(node)) {
      return node.defaultView.pageXOffset;
    }
    return node.scrollLeft;
  }

  /**
   * Gets the scroll top position of the specified node.
   * @param {Element|Document|Window=} node
   * @return {Number}
   */
  static getScrollTop(node) {
    if (core.isWindow(node)) {
      return node.pageYOffset;
    }
    if (core.isDocument(node)) {
      return node.defaultView.pageYOffset;
    }
    return node.scrollTop;
  }

  /**
   * Gets the height or width of the specified node. Scroll height is
   * included.
   * @param {Element|Document|Window=} node
   * @param {string} `Width` or `Height` property.
   * @return {Number}
   * @protected
   */
  static getSize_(node, prop) {
    if (core.isWindow(node)) {
      return this.getClientSize_(node, prop);
    }
    if (core.isDocument(node)) {
      var docEl = node.documentElement;
      return Math.max(
        node.body['scroll' + prop], docEl['scroll' + prop],
        node.body['offset' + prop], docEl['offset' + prop], docEl['client' + prop]);
    }
    return Math.max(node['client' + prop], node['scroll' + prop], node['offset' + prop]);
  }

  /**
   * Gets the width of the specified node. Scroll width is included.
   * @param {Element|Document|Window=} node
   * @return {Number}
   */
  static getWidth(node) {
    return this.getSize_(node, 'Width');
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
  static insideViewport(region) {
    return this.insideRegion(this.getRegion(window), region);
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
    return this.makeRegion(bottom, bottom - top, left, right, top, right - left);
  }

  /**
   * Makes a region object. It's a writable version of DOMRect.
   * @param {Number} bottom
   * @param {Number} height
   * @param {Number} left
   * @param {Number} right
   * @param {Number} top
   * @param {Number} width
   * @return {!DOMRect} The returned value is a DOMRect object which is the
   *     union of the rectangles returned by getClientRects() for the element,
   *     i.e., the CSS border-boxes associated with the element.
   */
  static makeRegion(bottom, height, left, right, top, width) {
    return {
      bottom: bottom,
      height: height,
      left: left,
      right: right,
      top: top,
      width: width
    };
  }

  /**
   * Makes a region from a DOMRect result from `getBoundingClientRect`.
   * @param  {!DOMRect} The returned value is a DOMRect object which is the
   *     union of the rectangles returned by getClientRects() for the element,
   *     i.e., the CSS border-boxes associated with the element.
   * @return {DOMRect} Writable version of DOMRect.
   * @protected
   */
  static makeRegionFromBoundingRect_(rect) {
    return this.makeRegion(rect.bottom, rect.height, rect.left, rect.right, rect.top, rect.width);
  }
}

export default position;
