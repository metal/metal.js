'use strict';

import dom from '../../src/dom/dom';
import position from '../../src/dom/position';

describe('position', function() {
  before(function() {
    dom.enterDocument('<iframe id="iframe1" style="height:10000px;width:10000px;"></iframe>');
  });

  describe('viewport', function() {
    it('should check iframe viewport size', function() {
      var iframe = document.getElementById('iframe1');
      assert.strictEqual(10000, position.getViewportSize(iframe.contentWindow).height);
      assert.strictEqual(10000, position.getViewportSize(iframe.contentWindow).width);
    });

    it('should check window viewport size', function() {
      assert.ok(window.document.documentElement.scrollHeight > position.getViewportSize().height);
      assert.ok(window.document.documentElement.scrollWidth > position.getViewportSize().width);
    });
  });
});
