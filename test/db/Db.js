'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('Db', function() {
  it('should throw error when mechanism is not specified', function() {
    assert.throws(function() {
      new lfr.Db();
    }, Error);

    assert.doesNotThrow(function() {
      var FakeMechanism = createFakeMechanism();

      new lfr.Db(new FakeMechanism(''));
    });
  });

  it('should post message', function(done) {
    var FakeMechanism = createFakeMechanism();
    var db = new lfr.Db(new FakeMechanism('cloud.liferay.com/myApp/user'));
    db.post(Math.PI).then(function(data) {
      assert.strictEqual(data, Math.PI);
      done();
    });
  });

  it('should put message', function(done) {
    var FakeMechanism = createFakeMechanism();
    var db = new lfr.Db(new FakeMechanism('cloud.liferay.com/myApp/user'));
    db.put(Math.PI).then(function(data) {
      assert.strictEqual(data, Math.PI);
      done();
    });
  });

  it('should get message', function(done) {
    var FakeMechanism = createFakeMechanism();
    var db = new lfr.Db(new FakeMechanism('cloud.liferay.com/myApp/user'));
    db.get(Math.PI).then(function(data) {
      assert.strictEqual(data, Math.PI);
      done();
    });
  });

  it('should delete message', function(done) {
    var FakeMechanism = createFakeMechanism();
    var db = new lfr.Db(new FakeMechanism('cloud.liferay.com/myApp/user'));
    db.delete(Math.PI).then(function(data) {
      assert.strictEqual(data, Math.PI);
      done();
    });
  });

  function createFakeMechanism() {
    var FakeMechanism = function(uri) {
      this.uri_ = uri;
    };
    var defer = function(data) {
      return lfr.Promise.resolve(data);
    };
    FakeMechanism.prototype.delete = defer;
    FakeMechanism.prototype.get = defer;
    FakeMechanism.prototype.post = defer;
    FakeMechanism.prototype.put = defer;
    return FakeMechanism;
  }

});
