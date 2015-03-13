'use strict';

import dom from '../../src/dom/dom';
import features from '../../src/dom/features';

describe('features', function() {
  before(function() {
    sinon.spy(dom, 'append');
  });

  after(function() {
    dom.append.restore();
  });

  describe('Method checkAttrOrderChange', function() {
    it('should check if current browser changes attribute order', function() {
      var result = features.checkAttrOrderChange();
      assert.strictEqual(1, dom.append.callCount);

      var element = dom.append.args[0][0];
      var original = dom.append.args[0][1];
      assert.strictEqual(result, original !== element.innerHTML);
    });

    it('should not recalculate result when called multiple times', function() {
      features.checkAttrOrderChange();
      features.checkAttrOrderChange();
      assert.strictEqual(1, dom.append.callCount);
    });
  });
});
