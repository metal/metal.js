'use strict';

var assert = require('assert');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var registerTasks = require('../../tasks/index');
require('./fixture/soyutils-mock');

global.Templates = {};

describe('Tasks', function() {
  before(function() {
    this.initialCwd_ = process.cwd();
    process.chdir(path.join(__dirname, 'assets'));
  });

  after(function() {
    process.chdir(this.initialCwd_);
  });

  describe('Soy', function() {
    it('should generate extra templates', function(done) {
      registerTasks({soySrc: ['src/simple.soy']});

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
      registerTasks({soySrc: ['src/definedElement.soy']});

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

    it('should set the "params" variable for each template, with a list of its param names', function() {
      registerTasks({soySrc: ['src/simple.soy']});

      gulp.start('soy', function() {
        loadSoyFile('src/simple.soy.js');

        assert.ok(Templates.Simple.hello.content.params);
        assert.deepEqual(['firstName', 'lastName'], Templates.Simple.hello.content.params);

        done();
      });
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
