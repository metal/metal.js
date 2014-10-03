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

  it('should set timeout', function() {
    var FakeMechanism = createFakeMechanism();
    var db = new lfr.Db(new FakeMechanism('cloud.liferay.com/myApp/user'));
    db.setTimeoutMs(0);
    assert.strictEqual(0, db.getTimeoutMs());
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

  it('should timeout action', function(done) {
    var FakeMechanism = createFakeMechanism();
    var db = new lfr.Db(new FakeMechanism('cloud.liferay.com/myApp/user'));
    db.setTimeoutMs(0);
    db.get(Math.PI)
      .thenCatch(function(reason) {
        assert.ok(reason instanceof Error);
        done();
      })
      .then(function() {
        assert.fail('Deferred should be cancelled with timeout error');
      });
  });

  function createFakeMechanism() {
    var FakeMechanism = function(uri) {
      this.uri_ = uri;
    };
    var defer = function(data) {
      return new lfr.Promise(function(resolve) {
          setTimeout(function() {
            resolve(data);
          }, 10);
        });
    };
    FakeMechanism.prototype.delete = defer;
    FakeMechanism.prototype.get = defer;
    FakeMechanism.prototype.post = defer;
    FakeMechanism.prototype.put = defer;
    return FakeMechanism;
  }

});
