'use strict';

var assert = require('assert');
var mockery = require('mockery');
var sinon = require('sinon');

var registerBuildTask = sinon.stub();
var registerSoyTask = sinon.stub();
var registerTasks;
var registerTestTasks = sinon.stub();

describe('Tasks', function() {
  before(function() {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    mockery.registerMock('./lib/build', registerBuildTask);
    mockery.registerMock('./lib/soy', registerSoyTask);
    mockery.registerMock('./lib/test', registerTestTasks);

    // We need to delay requiring `registerTasks` until mockery has already been
    // enabled and prepared.
    registerTasks = require('../../tasks/index');
  });

  after(function() {
    mockery.disable();
  });

  it('should register soy and test task', function() {
    registerTasks();
    assert.strictEqual(1, registerBuildTask.callCount);
    assert.strictEqual(1, registerSoyTask.callCount);
    assert.strictEqual(1, registerTestTasks.callCount);
  });
});
