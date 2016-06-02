'use strict';

var gulp = require('gulp');
var karma = require('karma');
var metal = require('gulp-metal');
var runSequence = require('run-sequence');

metal.registerTasks({
	karma: karma,
	testNodeSrc: [
		'env/test/node.js',
		'test/**/*.js'
	]
});

gulp.task('build:all:js', function(done) {
	runSequence(['build:globals', 'build:amd'], done);
});
