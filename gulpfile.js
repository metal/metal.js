'use strict';

var compileSoy = require('metal-tools-soy/lib/pipelines/compileSoy');
var gulp = require('gulp');
var metal = require('gulp-metal');
var replace = require('gulp-replace');

metal.registerTasks({
	bundleFileName: 'metal.js',
	karma: require('karma')
});

gulp.task('soy', function() {
	return gulp.src('packages/metal-soy/test/**/*.soy')
		.pipe(compileSoy())
		.pipe(replace('metal-soy', '../..'))
		.pipe(replace('metal-component/src/Component', 'metal-component'))
		.pipe(gulp.dest('packages/metal-soy/test'));
});
