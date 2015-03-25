'use strict';

import dom from '../../src/dom/dom';
import position from '../../src/dom/position';

describe('position', function() {
  var paddingElement = dom.buildFragment('<div id="paddingElement" style="height:10000px;width:10000px;position:relative;overflow:auto;"><div style="position:absolute;top:20000px;left:20000px;height:10px;width:10px;"></div></div>').firstChild;

  before(function() {
    document.body.style.margin = '0px';
    dom.enterDocument(paddingElement);
  });

  after(function() {
    dom.exitDocument(paddingElement);
  });

  describe('viewport', function() {
    it('should check window viewport size', function() {
      assert.ok(window.document.documentElement.scrollHeight > position.getClientHeight(window));
      assert.ok(window.document.documentElement.scrollWidth > position.getClientWidth(window));
    });

    it('should client size of window be the same of window size', function() {
      assert.strictEqual(position.getClientHeight(window), position.getHeight(window));
      assert.strictEqual(position.getClientWidth(window), position.getWidth(window));
    });

    it('should check viewport region', function() {
      var height = position.getClientHeight(window);
      var width = position.getClientWidth(window);
      var region = position.getRegion(window);
      assert.strictEqual(height, region.height);
      assert.strictEqual(height, region.bottom);
      assert.strictEqual(width, region.width);
      assert.strictEqual(width, region.right);
      assert.strictEqual(0, region.left);
      assert.strictEqual(0, region.top);
    });
  });

  describe('Size', function() {
    it('should check document size', function() {
      assert.strictEqual(10000, position.getHeight(document));
      assert.strictEqual(10000, position.getWidth(document));
    });

    it('should check document client size', function() {
      assert.strictEqual(position.getClientHeight(document), position.getHeight(window));
      assert.strictEqual(position.getClientWidth(document), position.getWidth(window));
    });

    it('should check element size', function() {
      assert.strictEqual(20010, position.getHeight(paddingElement));
      assert.strictEqual(20010, position.getWidth(paddingElement));
    });

    it('should check element client size', function() {
      var scrollbarWidth = position.getRegion(paddingElement).width - position.getClientWidth(paddingElement);
      assert.strictEqual(10000 - scrollbarWidth, position.getClientHeight(paddingElement));
      assert.strictEqual(10000 - scrollbarWidth, position.getClientWidth(paddingElement));
    });
  });

  describe('Scroll', function() {
    it('should check element scroll size', function(done) {
      paddingElement.scrollTop = 100;
      paddingElement.scrollLeft = 100;
      nextScrollTick(function() {
        assert.strictEqual(100, position.getScrollTop(paddingElement));
        assert.strictEqual(100, position.getScrollLeft(paddingElement));
        done();
      }, paddingElement);
    });
  });

  describe('Region', function() {
    it('should check document region', function() {
      var height = position.getHeight(document);
      var width = position.getWidth(document);
      var region = position.getRegion(document);
      assert.strictEqual(height, region.height);
      assert.strictEqual(height, region.bottom);
      assert.strictEqual(width, region.width);
      assert.strictEqual(width, region.right);
      assert.strictEqual(0, region.left);
      assert.strictEqual(0, region.top);
    });

    it('should get node region', function() {
      var region = position.getRegion(paddingElement);
      assert.strictEqual(10000, region.height);
      assert.strictEqual(10000, region.width);
      assert.strictEqual(10000, region.right);
      assert.strictEqual(10000, region.bottom);
      assert.strictEqual(0, region.left);
      assert.strictEqual(0, region.top);
    });

    it('should check if same region intersects', function() {
      var r1 = { top: 0, left: 0, bottom: 100, right: 100 };
      var r2 = { top: 0, left: 0, bottom: 100, right: 100 };
      assert.ok(position.intersectRegion(r1, r2));
    });

    it('should check if inner region intersects', function() {
      var r1 = { top: 0, left: 0, bottom: 100, right: 100 };
      var r2 = { top: 50, left: 50, bottom: 75, right: 75 };
      assert.ok(position.intersectRegion(r1, r2));
      assert.ok(position.intersectRegion(r2, r1));
    });

    it('should check if negative region intersects', function() {
      var r1 = { top: 0, left: 0, bottom: 100, right: 100 };
      var r2 = { top: -1, left: -1, bottom: 101, right: 101 };
      assert.ok(position.intersectRegion(r1, r2));
      assert.ok(position.intersectRegion(r2, r1));
    });

    it('should check if external region do not intersect', function() {
      var r1 = { top: 0, left: 0, bottom: 100, right: 100 };
      var r2 = { top: 101, left: 101, bottom: 200, right: 200 };
      assert.ok(!position.intersectRegion(r1, r2));
      assert.ok(!position.intersectRegion(r2, r1));
    });

    it('should check if same region is considered inside region', function() {
      var r1 = { top: 0, left: 0, bottom: 100, right: 100 };
      var r2 = { top: 0, left: 0, bottom: 100, right: 100 };
      assert.ok(position.insideRegion(r1, r2));
    });

    it('should check if inner region is considered inside region', function() {
      var r1 = { top: 0, left: 0, bottom: 100, right: 100 };
      var r2 = { top: 50, left: 50, bottom: 75, right: 75 };
      assert.ok(position.insideRegion(r1, r2));
      assert.ok(!position.insideRegion(r2, r1));
    });

    it('should check if partially intersected region is not considered inside region', function() {
      var r1 = { top: 0, left: 0, bottom: 100, right: 100 };
      var r2 = { top: 100, left: 100, bottom: 101, right: 101 };
      assert.ok(!position.insideRegion(r1, r2));
      assert.ok(!position.insideRegion(r2, r1));
    });

    it('should check if external region is not considered inside region', function() {
      var r1 = { top: 0, left: 0, bottom: 100, right: 100 };
      var r2 = { top: 101, left: 101, bottom: 200, right: 200 };
      assert.ok(!position.insideRegion(r1, r2));
      assert.ok(!position.insideRegion(r2, r1));
    });

    it('should check if region inside viewport is not considered inside viewport region', function() {
      var region = { top: 0, left: 0, bottom: 100, right: 100 };
      assert.ok(position.insideViewport(region));
    });

    it('should check if region outside viewport is not considered inside viewport region', function() {
      var region = { top: -1, left: -1, bottom: 100, right: 100 };
      assert.ok(!position.insideViewport(region));
    });

    it('should intersection between two equivalent regions be the same region', function() {
      var r1 = {bottom: 100, height: 100, left: 0, right: 100, top: 0, width: 100};
      var r2 = {bottom: 100, height: 100, left: 0, right: 100, top: 0, width: 100};
      assert.deepEqual(r1, position.intersection(r1, r2));
    });

    it('should computes the intersection between two regions', function() {
      var r1 = {bottom: 100, height: 100, left: 0, right: 100, top: 0, width: 100};
      var r2 = {bottom: 50, height: 50, left: 0, right: 50, top: 0, width: 50};
      assert.deepEqual(r2, position.intersection(r1, r2));
    });

    it('should the intersection between two external regions empty', function() {
      var r1 = { top: 0, left: 0, bottom: 100, right: 100 };
      var r2 = { top: 101, left: 101, bottom: 200, right: 200 };
      assert.isNull(position.intersection(r1, r2));
    });
  });
});

var nextScrollTick = function(fn, opt_el) {
  var handler = dom.on(opt_el || document, 'scroll', function() {
    fn();
    handler.removeListener();
  });
};
