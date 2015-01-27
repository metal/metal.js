'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('string', function() {
  it('should compute string hashcode', function() {
    assert.strictEqual(101574, lfr.string.hashCode('foo'));
  });

  it('should collapse breaking spaces', function() {
    assert.strictEqual('foo bar', lfr.string.collapseBreakingSpaces('   foo   bar   '));
  });

  it('should replace interval', function() {
    assert.strictEqual('ae', lfr.string.replaceInterval('abcde', 1, 4, ''));
  });
});
