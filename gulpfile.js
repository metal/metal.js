'use strict';

let compileSoy = require('metal-tools-soy/lib/pipelines/compileSoy');
let gulp = require('gulp');
let replace = require('gulp-replace');

gulp.task('soy', function() {
	return gulp
		.src('packages/metal-soy/test/**/*.soy')
		.pipe(compileSoy())
		.pipe(replace('metal-soy', '../..'))
		.pipe(replace('metal-component/src/Component', 'metal-component'))
		.pipe(gulp.dest('packages/metal-soy/test'));
});

gulp.task('soy:isomorphic', function() {
	return gulp
		.src('packages/metal-isomorphic/test/**/*.soy')
		.pipe(compileSoy())
		.pipe(gulp.dest('packages/metal-isomorphic/test'));
});
