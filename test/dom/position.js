'use strict';

import dom from '../../src/dom/dom';
import position from '../../src/dom/position';

describe('position', function() {
  var paddingElement = dom.buildFragment('<div id="paddingElement" style="height:10000px;width:10000px;position:relative;"></div>').firstChild;

  before(function() {
    document.body.style.margin = '0px';
    dom.enterDocument(paddingElement);
  });

  after(function() {
    dom.exitDocument(paddingElement);
  });

  it('should check window viewport size', function() {
    assert.ok(window.document.documentElement.scrollHeight > position.getViewportSize().height);
    assert.ok(window.document.documentElement.scrollWidth > position.getViewportSize().width);
  });

  it('should check viewport region', function() {
    var size = position.getViewportSize();
    var region = position.getViewportRegion();
    assert.strictEqual(size.height, region.height);
    assert.strictEqual(size.height, region.bottom);
    assert.strictEqual(size.width, region.width);
    assert.strictEqual(size.width, region.right);
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
});
