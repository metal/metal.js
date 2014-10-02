'use strict';

var assert = require('assert');
var sinon = require('sinon');
var createFakeSocketIO = require('../fixture/FakeSocketIO');
require('../fixture/sandbox.js');

describe('HttpDbMechanism', function() {
  before(function() {
    global.FakeSocketIO = createFakeSocketIO();
  });

  beforeEach(function() {
    global.io = function() {
      return new global.FakeSocketIO();
    };
  });

  it('should throw error when uri is not specified', function() {
    assert.throws(function() {
      new lfr.HttpDbMechanism();
    }, Error);

    assert.doesNotThrow(function() {
      new lfr.HttpDbMechanism('');
    });
  });

  it('should set transport', function() {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    var xhrTransport = new lfr.XhrTransport('');
    mechanism.setTransport(xhrTransport);
    assert.strictEqual(xhrTransport, mechanism.getTransport());
  });

  it('should post message', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    var db = new lfr.Db(mechanism);
    var config = {};
    db.post(Math.PI, config).then(function(data) {
      assert.strictEqual(data.config, config);
      assert.strictEqual(data.data, Math.PI);
      assert.strictEqual(data._method, lfr.HttpDbMechanism.HttpMethods.POST);
      done();
    });
  });

  it('should put message', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    var db = new lfr.Db(mechanism);
    var config = {};
    db.put(Math.PI, config).then(function(data) {
      assert.strictEqual(data.config, config);
      assert.strictEqual(data.data, Math.PI);
      assert.strictEqual(data._method, lfr.HttpDbMechanism.HttpMethods.PUT);
      done();
    });
  });

  it('should get message', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    var db = new lfr.Db(mechanism);
    var config = {};
    db.get(Math.PI, config).then(function(data) {
      assert.strictEqual(data.config, config);
      assert.strictEqual(data.data, Math.PI);
      assert.strictEqual(data._method, lfr.HttpDbMechanism.HttpMethods.GET);
      done();
    });
  });

  it('should delete message', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    var db = new lfr.Db(mechanism);
    var config = {};
    db.delete(Math.PI, config).then(function(data) {
      assert.strictEqual(data.config, config);
      assert.strictEqual(data.data, Math.PI);
      assert.strictEqual(data._method, lfr.HttpDbMechanism.HttpMethods.DELETE);
      done();
    });
  });

  it('should send pending messages when transport reopens', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    var db = new lfr.Db(mechanism);
    db.post(Math.PI).then(function(data) {
      assert.strictEqual(data.data, Math.PI);
      assert.strictEqual(data._method, lfr.HttpDbMechanism.HttpMethods.POST);
      done();
    });
    assert.strictEqual(mechanism.pendingRequests_[0].status, lfr.DbMechanism.MessageStatus.SENT);
    mechanism.getTransport().close();
    setTimeout(function() {
      assert.strictEqual(mechanism.pendingRequests_[0].status, lfr.DbMechanism.MessageStatus.PENDING);
      mechanism.getTransport().open();
    }, 0);
  });

  it('should cancel pending messages when transport emits error', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    var db = new lfr.Db(mechanism);
    db.post(Math.PI).thenCatch(function() {
      done();
    });
    mechanism.getTransport().emit('error', new Error('Number not known in this galaxy'));
  });

  it('should warn when malformed data arrives', function(done) {
    var originalWarningFn = console.warn;
    console.warn = sinon.stub();

    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    mechanism.getTransport().on('data', function() {
      assert.strictEqual(1, console.warn.callCount);

      console.warn = originalWarningFn;
      done();
    });

    mechanism.getTransport().emit('data', null);
  });

  it('should not remove message from queue when mismatch message id arrives', function(done) {
    var mechanism = new lfr.HttpDbMechanism('liferay.com');
    var db = new lfr.Db(mechanism);
    db.get().then(function() {
      done();
    });
    mechanism.getTransport().on('data', function() {
      assert.strictEqual(1, mechanism.pendingRequests_.length);
    });
    mechanism.getTransport().emit('data', {
      id: -1
    });
  });

});
