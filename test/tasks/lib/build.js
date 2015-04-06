'use strict';

var assert = require('assert');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var registerTasks = require('../../../tasks/index');
var sinon = require('sinon');

describe('Build Tasks', function() {
	before(function() {
		this.initialCwd_ = process.cwd();
		process.chdir(path.join(__dirname, 'assets'));

		gulp.task('soy', function(done) {
			done();
		});
	});

	after(function() {
		process.chdir(this.initialCwd_);
	});

	it('should build js files into a single bundle with globals', function(done) {
		registerTasks({
			bundleFileName: 'foo.js',
			globalName: 'foo'
		});

		gulp.start('build:globals', function() {
			var contents = fs.readFileSync('build/foo.js', 'utf8');
			eval.call(global, contents);

			assert.ok(global.foo);
			assert.ok(global.foo.Bar);
			assert.ok(global.foo.Foo);

			var foo = new global.foo.Foo();
			assert.ok(foo instanceof global.foo.Bar);

			done();
		});
	});

	it('should trigger "end" event even when build:globals throws error for invalid js', function(done) {
		registerTasks({
			buildSrc: 'invalidSrc/Invalid.js',
			bundleFileName: 'invalid.js',
			globalName: 'invalid'
		});
		sinon.stub(console, 'error');

		gulp.start('build:globals', function() {
			assert.strictEqual(1, console.error.callCount);
			done();
		});
	});

	it('should watch for file changes on watch:globals', function(done) {
		registerTasks();
		sinon.stub(gulp, 'watch');

		gulp.start('watch:globals', function() {
			assert.strictEqual(2, gulp.watch.callCount);
			assert.strictEqual('src/**/*.js', gulp.watch.args[0][0]);
			assert.deepEqual(['globals'], gulp.watch.args[0][1]);
			assert.strictEqual('src/**/*.soy', gulp.watch.args[1][0]);
			assert.deepEqual(['soy'], gulp.watch.args[1][1]);

			gulp.watch.restore();
			done();
		});
		gulp.stop();
	});
});
