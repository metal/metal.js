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

	afterEach(function() {
		registerBuildTask.callCount = 0;
		registerSoyTask.callCount = 0;
		registerTestTasks.callCount = 0;
	});

	after(function() {
		mockery.disable();
	});

	it('should register all tasks', function() {
		registerTasks();
		assert.strictEqual(1, registerBuildTask.callCount);
		assert.strictEqual(1, registerSoyTask.callCount);
		assert.strictEqual(1, registerTestTasks.callCount);
	});

	it('should not register build tasks if registerBuildTasks option is set to false', function() {
		registerTasks({
			registerBuildTasks: false
		});

		assert.strictEqual(0, registerBuildTask.callCount);
		assert.strictEqual(1, registerSoyTask.callCount);
		assert.strictEqual(1, registerTestTasks.callCount);
	});

	it('should not register build tasks if registerSoyTasks option is set to false', function() {
		registerTasks({
			registerSoyTasks: false
		});
		assert.strictEqual(1, registerBuildTask.callCount);
		assert.strictEqual(0, registerSoyTask.callCount);
		assert.strictEqual(1, registerTestTasks.callCount);
	});

	it('should not register build tasks if registerTestTasks option is set to false', function() {
		registerTasks({
			registerTestTasks: false
		});
		assert.strictEqual(1, registerBuildTask.callCount);
		assert.strictEqual(1, registerSoyTask.callCount);
		assert.strictEqual(0, registerTestTasks.callCount);
	});
});
