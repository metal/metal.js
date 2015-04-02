'use strict';

var assert = require('assert');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var registerSoyTasks = require('../../../tasks/lib/soy');
require('../fixture/soyutils-mock');

global.Templates = {};

describe('Soy Task', function() {
  before(function() {
    this.initialCwd_ = process.cwd();
    process.chdir(path.join(__dirname, 'assets'));
  });

  after(function() {
    process.chdir(this.initialCwd_);
  });

  it('should generate extra templates', function(done) {
    registerSoyTasks({soySrc: ['src/simple.soy']});

    gulp.start('soy', function() {
      loadSoyFile('src/simple.soy.js');

      assert.ok(Templates.Simple);
      assert.ok(Templates.Simple.content);
      assert.ok(Templates.Simple.hello);

      assert.ok(soy.$$getDelegateFn('Simple', ''));
      assert.ok(soy.$$getDelegateFn('Simple', 'element'));
      assert.ok(soy.$$getDelegateFn('ComponentTemplate', 'Simple'));
      assert.ok(soy.$$getDelegateFn('ComponentElement', 'Simple'));
      assert.ok(soy.$$getDelegateFn('Simple.hello', ''));
      assert.ok(soy.$$getDelegateFn('Simple.hello', 'element'));

      done();
    });
  });

  it('should not generate deltemplate for the main and surface elements if one already exists', function(done) {
    registerSoyTasks({soySrc: ['src/definedElement.soy']});

    gulp.start('soy', function() {
      loadSoyFile('src/definedElement.soy.js');

      var templateFn = soy.$$getDelegateFn('DefinedElement.hello', 'element');
      assert.ok(templateFn);
      assert.notStrictEqual(-1, templateFn({id: 'id'}).indexOf('<button'));

      templateFn = soy.$$getDelegateFn('DefinedElement', 'element');
      assert.ok(templateFn);
      assert.notStrictEqual(-1, templateFn({id: 'id'}).indexOf('<button'));

      done();
    });
  });

  it('should set the "params" variable for each template, with a list of its param names', function(done) {
    registerSoyTasks({soySrc: ['src/simple.soy']});

    gulp.start('soy', function() {
      loadSoyFile('src/simple.soy.js');

      assert.ok(Templates.Simple.hello.params);
      assert.deepEqual(['firstName', 'lastName'], Templates.Simple.hello.params);

      done();
    });
  });

  it('should not add optional params to the "params" variable', function(done) {
    registerSoyTasks({soySrc: ['src/optionalParam.soy']});

    gulp.start('soy', function() {
      loadSoyFile('src/optionalParam.soy.js');

      assert.ok(Templates.Simple.hello.params);
      assert.deepEqual(['firstName'], Templates.OptionalParam.hello.params);

      done();
    });
  });

  it('should add lines to generated soy js file that import ComponentRegistry', function(done) {
    registerSoyTasks({soySrc: ['src/simple.soy']});

    gulp.start('soy', function() {
      var contents = fs.readFileSync('src/simple.soy.js', 'utf8');
      assert.notStrictEqual(-1, contents.indexOf('import ComponentRegistry from \'../bower_components/metal/src/component/ComponentRegistry\';'));
      done();
    });
  });

  it('should import ComponentRegistry according to core path indicated by the corePathFromSoy option', function(done) {
    registerSoyTasks({
      corePathFromSoy: 'some/path',
      soySrc: ['src/simple.soy']
    });

    gulp.start('soy', function() {
      var contents = fs.readFileSync('src/simple.soy.js', 'utf8');
      assert.strictEqual(-1, contents.indexOf('import ComponentRegistry from \'../bower_components/metal/src/component/ComponentRegistry\';'));
      assert.notStrictEqual(-1, contents.indexOf('import ComponentRegistry from \'some/path/component/ComponentRegistry\';'));
      done();
    });
  });

  it('should import ComponentRegistry according to core path indicated by the result of the corePathFromSoy option fn', function(done) {
    registerSoyTasks({
      corePathFromSoy: function() {
        return 'fn/path';
      },
      soySrc: ['src/simple.soy']
    });

    gulp.start('soy', function() {
      var contents = fs.readFileSync('src/simple.soy.js', 'utf8');
      assert.strictEqual(-1, contents.indexOf('import ComponentRegistry from \'../bower_components/metal/src/component/ComponentRegistry\';'));
      assert.notStrictEqual(-1, contents.indexOf('import ComponentRegistry from \'fn/path/component/ComponentRegistry\';'));
      done();
    });
  });
});

function loadSoyFile(filePath) {
  var contents = fs.readFileSync(filePath, 'utf8');
  contents = contents.split('\n');
  contents.splice(0, 3);
  contents = contents.join('\n');
  eval(contents);
}
