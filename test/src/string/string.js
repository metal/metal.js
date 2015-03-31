'use strict';

import string from '../../../src/string/string';

describe('string', function() {
  it('should compute string hashcode', function() {
    assert.strictEqual(101574, string.hashCode('foo'));
  });

  it('should collapse breaking spaces', function() {
    assert.strictEqual('foo bar', string.collapseBreakingSpaces('   foo   bar   '));
  });

  it('should replace interval', function() {
    assert.strictEqual('ae', string.replaceInterval('abcde', 1, 4, ''));
  });
});
