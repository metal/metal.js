'use strict';

var assert = require('assert');
var gulp = require('gulp');
var karma = require('karma');
var mockery = require('mockery');
var sinon = require('sinon');

var openFile;
var registerTestTasks;

describe('Test Tasks', function() {
	before(function() {
		gulp.task('soy', function(done) {
			done();
		});

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});

		openFile = sinon.stub();
		mockery.registerMock('open', openFile);
		mockery.registerMock('gulp', gulp);
		mockery.registerMock('karma', karma);

		// We need to delay requiring `registerTasks` until mockery has already been
		// enabled and prepared.
		registerTestTasks = require('../../../tasks/lib/test');
	});

	beforeEach(function() {
		sinon.stub(karma.server, 'start').callsArg(1);
	});

	afterEach(function() {
		karma.server.start.restore();
	});

	after(function() {
		mockery.disable();
	});

	it('should run unit tests', function(done) {
		registerTestTasks();

		gulp.start('test', function() {
			assert.strictEqual(1, karma.server.start.callCount);

			var config = karma.server.start.args[0][0];
			assert.strictEqual(2, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.ok(config.singleRun);
			done();
		});
	});

	it('should open coverage file when test:coverage is run', function(done) {
		registerTestTasks();

		assert.strictEqual(0, openFile.callCount);
		gulp.start('test:coverage', function() {
			assert.strictEqual(1, karma.server.start.callCount);

			var config = karma.server.start.args[0][0];
			assert.strictEqual(2, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.ok(config.singleRun);

			assert.strictEqual(1, openFile.callCount);
			done();
		});
	});

	it('should override browsers config when test:browsers is run', function(done) {
		registerTestTasks();

		gulp.start('test:browsers', function() {
			assert.strictEqual(1, karma.server.start.callCount);

			var config = karma.server.start.args[0][0];
			assert.strictEqual(3, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.ok(config.singleRun);
			assert.ok(config.browsers);
			done();
		});
	});

	it('should pass saucelabs config to karma when test:saucelabs is run', function(done) {
		registerTestTasks();

		gulp.start('test:saucelabs', function() {
			assert.strictEqual(1, karma.server.start.callCount);

			var config = karma.server.start.args[0][0];
			assert.ok(config.configFile);
			assert.ok(config.singleRun);
			assert.ok(config.browsers);
			assert.ok(config.sauceLabs);
			done();
		});
	});

	it('should pass singleRun as false when test:watch is run', function(done) {
		registerTestTasks();

		gulp.start('test:watch', function() {
			assert.strictEqual(1, karma.server.start.callCount);

			var config = karma.server.start.args[0][0];
			assert.strictEqual(2, Object.keys(config).length);
			assert.ok(config.configFile);
			assert.ok(!config.singleRun);
			done();
		});
	});

	it('should watch for soy file changes on test:watch', function(done) {
		registerTestTasks();
		sinon.stub(gulp, 'watch');

		gulp.start('test:watch', function() {
			assert.strictEqual(1, gulp.watch.callCount);
			assert.strictEqual('src/**/*.soy', gulp.watch.args[0][0]);
			assert.deepEqual(['soy'], gulp.watch.args[0][1]);

			gulp.watch.restore();
			done();
		});
	});
});
