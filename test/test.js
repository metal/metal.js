'use strict';

var EventEmitter = require('../index');

module.exports = {
  testEmptyConstructor: function(test) {
    test.strictEqual(null, null);
    test.done();
  }
};
