'use strict';

var assert = require('assert');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var registerTasks = require('../../tasks/index');
var soyparser = require('soyparser');

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
        var parsed = soyparser(fs.readFileSync('build/simple.soy'));
        assert.strictEqual(8, parsed.templates.length);
        assert.strictEqual('content', parsed.templates[0].name);
        assert.ok(!parsed.templates[0].deltemplate);

        assert.strictEqual('hello', parsed.templates[1].name);
        assert.ok(!parsed.templates[1].deltemplate);

        assert.strictEqual('Simple', parsed.templates[2].name);
        assert.ok(parsed.templates[2].deltemplate);
        assert.strictEqual(undefined, parsed.templates[2].variant);

        assert.strictEqual('ComponentTemplate', parsed.templates[3].name);
        assert.ok(parsed.templates[3].deltemplate);
        assert.strictEqual('Simple', parsed.templates[3].variant);

        assert.strictEqual('ComponentElement', parsed.templates[4].name);
        assert.ok(parsed.templates[4].deltemplate);
        assert.strictEqual('Simple', parsed.templates[4].variant);

        assert.strictEqual('Simple', parsed.templates[5].name);
        assert.ok(parsed.templates[5].deltemplate);
        assert.strictEqual('element', parsed.templates[5].variant);

        assert.strictEqual('Simple.hello', parsed.templates[6].name);
        assert.ok(parsed.templates[6].deltemplate);
        assert.strictEqual('element', parsed.templates[6].variant);

        assert.strictEqual('Simple.hello', parsed.templates[7].name);
        assert.ok(parsed.templates[7].deltemplate);
        assert.strictEqual(undefined, parsed.templates[7].variant);
        done();
      });
    });

    it('should not generate duplicate deltemplate for a surface element', function(done) {
      registerTasks({soySrc: ['src/definedElement.soy']});

      gulp.start('soy', function() {
        var parsed = soyparser(fs.readFileSync('build/definedElement.soy'));
        assert.strictEqual(8, parsed.templates.length);

        var surfaceElementTemplates = [];
        parsed.templates.forEach(function(template) {
          if (template.name === 'DefinedElement.hello' && template.variant === 'element') {
            surfaceElementTemplates.push(template);
          }
        });

        assert.strictEqual(1, surfaceElementTemplates.length);
        assert.notStrictEqual(-1, surfaceElementTemplates[0].contents.indexOf('button'));
        done();
      });
    });

    it('should not generate duplicate deltemplate for the main element', function(done) {
      registerTasks({soySrc: ['src/definedElement.soy']});

      gulp.start('soy', function() {
        var parsed = soyparser(fs.readFileSync('build/definedElement.soy'));
        assert.strictEqual(8, parsed.templates.length);

        var surfaceElementTemplates = [];
        parsed.templates.forEach(function(template) {
          if (template.name === 'DefinedElement' && template.variant === 'element') {
            surfaceElementTemplates.push(template);
          }
        });

        assert.strictEqual(1, surfaceElementTemplates.length);
        assert.notStrictEqual(-1, surfaceElementTemplates[0].contents.indexOf('button'));
        done();
      });
    });
  });
});
