'use strict';

import dom from '../../src/dom/dom';
import position from '../../src/dom/position';

describe('position', function() {
  var iframeAbsolute = dom.buildFragment('<iframe id="iframeAbsolute" style="height:10000px;width:10000px;padding:0;margin:0;border-width:0;position:absolute;top:0;left:0;"></iframe>').firstChild;
  var iframeStatic = dom.buildFragment('<iframe id="iframeStatic" style="height:10000px;width:10000px;padding:0;margin:0;border-width:0;position:relative;"></iframe>').firstChild;

  before(function() {
    dom.enterDocument(iframeAbsolute);
    dom.enterDocument(iframeStatic);
  });

  after(function() {
    dom.exitDocument(iframeAbsolute);
    dom.exitDocument(iframeStatic);
  });

  describe('viewport', function() {
    it('should check iframe viewport size', function() {
      assert.strictEqual(10000, position.getViewportSize(iframeStatic.contentWindow).height);
      assert.strictEqual(10000, position.getViewportSize(iframeStatic.contentWindow).width);
    });

    it('should check window viewport size', function() {
      assert.ok(window.document.documentElement.scrollHeight > position.getViewportSize().height);
      assert.ok(window.document.documentElement.scrollWidth > position.getViewportSize().width);
    });
  });

  describe('region', function() {
    it('should get node region', function() {
      var region = position.getRegion(iframeAbsolute);
      assert.strictEqual(10000, region.height);
      assert.strictEqual(10000, region.width);
      assert.strictEqual(10000, region.right);
      assert.strictEqual(10000, region.bottom);
      assert.strictEqual(0, region.left);
      assert.strictEqual(0, region.top);
    });
  });
});
