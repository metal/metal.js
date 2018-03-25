'use strict';

var concat = require('gulp-concat');
var footer = require('gulp-footer');
var gulp = require('gulp');
var header = require('gulp-header');
var replace = require('gulp-replace');

var dependencies = [
	'src/closure-library/closure/goog/base.js',
	'src/closure-library/closure/goog/string/string.js',
	'src/closure-library/closure/goog/debug/debug.js',
	'src/closure-library/closure/goog/debug/error.js',
	'src/closure-library/closure/goog/dom/nodetype.js',
	'src/closure-library/closure/goog/i18n/bidi.js',
	'src/closure-library/closure/goog/asserts/asserts.js',
	'src/closure-library/closure/goog/string/stringbuffer.js',
	'src/closure-library/closure/goog/soy/data.js',
	'src/closure-templates/javascript/soyutils_usegoog.js'
];

gulp.task('build', function() {
  return gulp.src(dependencies)
    .pipe(concat('bundle.js'))
    .pipe(replace('var goog = goog || {};', 'var goog = this.goog || {};'))
    .pipe(header('import \'metal-incremental-dom\';\n\n(function() {\nif(!this.goog){\nthis.CLOSURE_NO_DEPS = true;\nthis.goog = this.goog || {};\n\n'))
    .pipe(footer('\n\ngoog.loadModule(function() {\n' +
      '  goog.module(\'incrementaldom\');\n' +
      '  return IncrementalDOM;\n' +
      '});\n' +
      '}' +
      '}).call((typeof exports !== \'undefined\' && typeof global !== \'undefined\') ? global : window);\n'
    ))
    .pipe(gulp.dest('build'));
});

gulp.task('default', ['build']);
