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

    gulp.task('soy', sinon.stub().yields());
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
});
