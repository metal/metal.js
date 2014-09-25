'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('DbMechanism', function() {
  it('should throw error when mechanism is not specified', function() {
    assert.throws(function() {
      new lfr.DbMecahnism();
    }, Error);

    assert.doesNotThrow(function() {
      new lfr.DbMechanism('');
    });
  });

  it('should retrieve the specified uri', function() {
    var dbMechanism = new lfr.DbMechanism('localhost/test');

    assert.strictEqual('localhost/test', dbMechanism.getUri());
  });

  it('should retrieve the same uri if changed via uri setter', function() {
    var dbMechanism = new lfr.DbMechanism('localhost/test');

    dbMechanism.setUri('localhost/test123');

    assert.strictEqual('localhost/test123', dbMechanism.getUri());
  });
});
