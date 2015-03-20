'use strict';

import math from '../../src/math/math';

describe('math', function() {
  it('should overlapped rectangles intersects', function() {
    var P01 = [0, 0];
    var P02 = [10, 10];
    var P11 = [0, 0];
    var P12 = [10, 10];
    assert.ok(math.intersectRect(P01[0], P01[1], P02[0], P02[1], P11[0], P11[1], P12[0], P12[1]));
  });

  it('should internal rectangles intersects', function() {
    var P01 = [0, 0];
    var P02 = [10, 10];
    var P11 = [1, 1];
    var P12 = [9, 9];
    assert.ok(math.intersectRect(P01[0], P01[1], P02[0], P02[1], P11[0], P11[1], P12[0], P12[1]));
  });

  it('should partially overlapped rectangles intersects', function() {
    var P01 = [0, 0];
    var P02 = [10, 10];
    var P11 = [9, 9];
    var P12 = [1, 1];
    assert.ok(math.intersectRect(P01[0], P01[1], P02[0], P02[1], P11[0], P11[1], P12[0], P12[1]));
  });

  it('should externalrectangles not intersect', function() {
    var P01 = [0, 0];
    var P02 = [10, 10];
    var P11 = [11, 11];
    var P12 = [12, 12];
    assert.ok(!math.intersectRect(P01[0], P01[1], P02[0], P02[1], P11[0], P11[1], P12[0], P12[1]));
  });
});
