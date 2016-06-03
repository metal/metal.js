'use strict';

var compileSoy = require('metal-tools-soy/lib/pipelines/compileSoy');
var gulp = require('gulp');
var metal = require('gulp-metal');
var replace = require('gulp-replace');

var codeGlobs = [
	'packages/metal*/src/**/*.js',
	'packages/metal*/test/**/*.js',
	'!packages/metal-incremental-dom/**/incremental-dom.js',
	'gulpfile.js',
	'karma.conf.js',
	'karma-coverage.conf.js'
];

metal.registerTasks({
	bundleFileName: 'metal.js',
	formatGlobs: codeGlobs,
	karma: require('karma'),
	// TODO: Find a way to lint jsx files (maybe use eslint instead of jshint).
	lintGlobs: codeGlobs.concat('!packages/metal-jsx/test/**/*.js')
});

gulp.task('soy', function() {
	return gulp.src('packages/metal-soy/test/**/*.soy')
		.pipe(compileSoy())
		.pipe(replace('metal-soy', '../..'))
		.pipe(replace('metal-component/src/Component', 'metal-component'))
		.pipe(gulp.dest('packages/metal-soy/test'));
});
