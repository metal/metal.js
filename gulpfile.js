'use strict';

var gulp = require('gulp');
var rimraf = require('gulp-rimraf');
var umd = require('gulp-umd');

gulp.task('build', ['clean'], function() {
  return gulp.src('src/*.js')
    .pipe(umd())
    .pipe(gulp.dest('build'));
});

gulp.task('clean', function() {
  return gulp.src('build').pipe(rimraf());
});

gulp.task('watch', function() {
  gulp.watch(['src/*.js'], ['build']);
});
