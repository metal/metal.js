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

  it('should handle adding data to the database', function(done) {
    var FakeMechanism = createFakeMechanism();

    var db = new lfr.Db(new FakeMechanism('cloud.liferay.com/myApp/user'));

    // Add coverage for optional callback
    db.add({
      name: 'Johan',
      age: 25
    });

    db.add(null, function(err) {
      assert.strictEqual(true, err instanceof Error);
    });

    db.add({
      name: 'Johan',
      age: 25
    }, function(err, data) {
        assert.strictEqual(err, null, 'Should not return error');
        assert.ok(data, null, 'Should return some data');

        done();
      });
  });

  it('should handle querying data from the database', function(done) {
    var FakeMechanism = createFakeMechanism();

    var db = new lfr.Db(new FakeMechanism('cloud.liferay.com/myApp/user'));

    // Add coverage for optional callback
    db.find({
      name: 'Johan',
      age: 25
    });

    db.find(null, function(err) {
      assert.strictEqual(true, err instanceof Error);
    });

    db.find({
      name: 'Johan',
      age: 25
    }, function(err, data) {
        assert.strictEqual(err, null, 'Should not return error');
        assert.ok(data, null, 'Should return some data');

        done();
      });
  });

  it('should handle removing data from the database', function(done) {
    var FakeMechanism = createFakeMechanism();

    var db = new lfr.Db(new FakeMechanism('cloud.liferay.com/myApp/user'));

    // Add coverage for optional callback
    db.remove({
      name: 'Johan',
      age: 25
    });

    db.remove(null, function(err) {
      assert.strictEqual(true, err instanceof Error);
    });

    db.remove({
      name: 'Johan',
      age: 25
    }, function(err, data) {
        assert.strictEqual(err, null, 'Should not return error');
        assert.ok(data, null, 'Should return some data');

        done();
      });
  });

  it('should handle updating data into the database', function(done) {
    var FakeMechanism = createFakeMechanism();

    var db = new lfr.Db(new FakeMechanism('cloud.liferay.com/myApp/user'));

    // Add coverage for optional callback
    db.update({
      name: 'Johan',
      age: 25
    });

    db.update(null, function(err) {
      assert.strictEqual(true, err instanceof Error);
    });

    db.update({
      name: 'Johan',
      age: 25
    }, function(err, data) {
        assert.strictEqual(err, null, 'Should not return error');
        assert.ok(data, null, 'Should return some data');

        done();
      });
  });

  function createFakeMechanism() {
    var FakeMechanism = function(uri) {
      this.uri_ = uri;
    };

    var mechanismImpl = function(data, callback) {
      setTimeout(function() {
        if (data) {
          callback(null, 'Success');
        } else {
          callback(new Error('There is no data provided'), 'Failure');
        }
      }, 10);
    };

    FakeMechanism.prototype.add = mechanismImpl;
    FakeMechanism.prototype.find = mechanismImpl;
    FakeMechanism.prototype.remove = mechanismImpl;
    FakeMechanism.prototype.update = mechanismImpl;
    return FakeMechanism;
  }

});
