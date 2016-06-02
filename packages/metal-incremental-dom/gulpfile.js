'use strict';

var gulp = require('gulp');
var metal = require('gulp-metal');
var replace = require('gulp-replace');
var wrapper = require('gulp-wrapper');

metal.registerTasks({
	bundleCssFileName: 'incrementalDom.css',
	bundleFileName: 'incrementalDom.js',
	moduleName: 'metal-incrementalDom',
	noSoy: true
});

gulp.task('build:incdom', function() {
	return gulp.src('node_modules/incremental-dom/dist/incremental-dom.js')
    .pipe(replace('\n  typeof exports === \'object\' && typeof module !== \'undefined\' ? factory(exports) :', ''))
		.pipe(replace('\n  typeof define === \'function\' && define.amd ? define([\'exports\'], factory) :', ''))
		.pipe(replace('}(this, function (exports) {', '}(window, function (exports) {'))
		.pipe(replace('\n//# sourceMappingURL=incremental-dom.js.map', ''))
		.pipe(wrapper({
			header: '/* jshint ignore:start */\n',
			footer: '/* jshint ignore:end */\n'
		}))
    .pipe(gulp.dest('src'));
});
