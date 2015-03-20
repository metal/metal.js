'use strict';

class math {
  /**
     * Tests if a rectangle intersects with another.
     *
     * <pre>
     *  x0y0 --------       x2y2 --------
     *      |       |           |       |
     *      -------- x1y1       -------- x3y3
     * </pre>
     *
     * Note that coordinates starts from top to down (y), left ro right (x):
     *
     * <pre>
     *      ------> (x)
     *      |
     *      |
     *     (y)
     * </pre>
     *
     * @param {number} x0 Horizontal coordinate of P0.
     * @param {number} y0 Vertical coordinate of P0.
     * @param {number} x1 Horizontal coordinate of P1.
     * @param {number} y1 Vertical coordinate of P1.
     * @param {number} x2 Horizontal coordinate of P2.
     * @param {number} y2 Vertical coordinate of P2.
     * @param {number} x3 Horizontal coordinate of P3.
     * @param {number} y3 Vertical coordinate of P3.
     * @return {boolean}
     */
    static intersectRect(x0, y0, x1, y1, x2, y2, x3, y3) {
      return !(x2 > x1 || x3 < x0 || y2 > y1 || y3 < y0);
    }
}

export default math;
