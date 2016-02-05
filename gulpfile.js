'use strict';

var gulp = require('gulp');
var metal = require('gulp-metal');
var runSequence = require('run-sequence');

metal.registerTasks();

gulp.task('build:all:js', function(done) {
	runSequence(['build:globals', 'build:amd'], done);
});
