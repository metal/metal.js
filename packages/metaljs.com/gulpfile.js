var gulp = require('gulp');
var compass = require('gulp-compass');
var connect = require('gulp-connect');
var soynode = require('gulp-soynode');

gulp.task('soy', function() {
	return gulp.src('src/**/*.soy')
		.pipe(soynode({
			renderSoyWeb: true
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('styles', function() {
	return gulp.src('src/public/styles/*.scss')
		.pipe(compass({
			css: 'dist/public/styles',
			sass: 'src/public/styles',
			image: 'dist/public/images'
		}))
		.pipe(gulp.dest('dist/public/styles'));
});

gulp.task('connect', function() {
	connect.server({
		root: 'dist/public'
	});
});

gulp.task('watch', function () {
	gulp.watch('src/**/*.soy', ['soy']);
	gulp.watch('src/public/styles/*.scss', ['styles']);
});

gulp.task('default', ['connect', 'watch']);
