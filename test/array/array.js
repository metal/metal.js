'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('array', function() {
  it('should remove an item from an array', function() {
    var arr = [1, 2, 3, 4, 5];

    lfr.array.remove(arr, 3);
    assert.deepEqual([1, 2, 4, 5], arr);
  });

  it('should ignore call to remove item that doesn\'t exist', function() {
    var arr = [1, 2, 3, 4, 5];

    lfr.array.remove(arr, 6);
    assert.deepEqual([1, 2, 3, 4, 5], arr);
  });

  it('should remove an item at the specified index', function() {
    var arr = [1, 2, 3, 4, 5];

    lfr.array.removeAt(arr, 3);
    assert.deepEqual([1, 2, 3, 5], arr);
  });

  it('should remove an item at the specified negative index', function() {
    var arr = [1, 2, 3, 4, 5];

    lfr.array.removeAt(arr, -2);
    assert.deepEqual([1, 2, 3, 5], arr);
  });

  it('should ignore call to remove item on invalid position', function() {
    var arr = [1, 2, 3, 4, 5];

    lfr.array.removeAt(arr, 6);
    assert.deepEqual([1, 2, 3, 4, 5], arr);
  });
});
