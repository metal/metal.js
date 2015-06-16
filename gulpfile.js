'use strict';

var gulp = require('gulp');
var path = require('path');
var metal = require('gulp-metal');
var runSequence = require('run-sequence');

var codeFileGlobs = [
	'src/**/*.js',
	'test/**/*.js',
	'gulpfile.js',
	'!test/**/assets/**/*.js'
];

metal.registerTasks({
	corePathFromSoy: function(file) {
		return path.relative(path.dirname(file.path), path.resolve('src'));
	},
	formatGlobs: codeFileGlobs,
	lintGlobs: codeFileGlobs,
	soyDest: function(file) {
		if (file.base === path.resolve('temp')) {
			return 'test';
		} else {
			return file.base;
		}
	},
	soyGeneratedDest: false,
	soySrc: ['src/**/*.soy', 'test/**/*.soy']
});
