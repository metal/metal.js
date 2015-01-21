'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('string', function() {
  it('should compute string hashcode', function() {
    assert.strictEqual(101574, lfr.string.hashCode('foo'));
  });
});
