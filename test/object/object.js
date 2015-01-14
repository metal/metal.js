'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('object', function() {
  it('should mixin object arguments', function() {
    var original = {};

    var mixin = lfr.object.mixin(original, {
      a: 1
    }, {
        b: 1
      }, {
        b: 2
      }, null);

    assert.strictEqual(original, mixin);
    assert.strictEqual(1, mixin.a);
    assert.strictEqual(2, mixin.b);
    assert.strictEqual(2, Object.keys(mixin).length);
  });

  it('should mixin array arguments', function() {
    var original = [];

    var mixin = lfr.object.mixin(original, [null, 2, 3], [1]);

    assert.strictEqual(original, mixin);
    assert.deepEqual([1, 2, 3], mixin);
  });
});
