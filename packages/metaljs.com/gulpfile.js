var gulp = require('gulp');
var compass = require('gulp-compass');
var connect = require('gulp-connect');
var ghpages = require('gulp-gh-pages');
var soynode = require('gulp-soynode');

gulp.task('connect', function() {
	connect.server({
		root: 'dist/public'
	});
});

gulp.task('cname', function() {
	return gulp.src('src/public/CNAME')
		.pipe(gulp.dest('dist/public'));
});

gulp.task('deploy', ['cname', 'build'], function() {
	return gulp.src('dist/public/**/*')
		.pipe(ghpages());
});

gulp.task('images', function() {
	return gulp.src('src/public/images/**')
		.pipe(gulp.dest('dist/public/images'));
});

gulp.task('scripts', function() {
	return gulp.src('src/public/scripts/**')
		.pipe(gulp.dest('dist/public/scripts'));
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

gulp.task('soy', function() {
	return gulp.src('src/**/*.soy')
		.pipe(soynode({
			renderSoyWeb: true
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('vendor', function() {
	return gulp.src('src/public/vendor/**')
		.pipe(gulp.dest('dist/public/vendor'));
});

gulp.task('watch', function () {
	gulp.watch('src/public/images/**', ['images']);
	gulp.watch('src/public/scripts/**', ['scripts']);
	gulp.watch('src/public/vendor/**', ['vendor']);
	gulp.watch('src/public/styles/*.scss', ['styles']);
	gulp.watch('src/**/*.soy', ['soy']);
});

gulp.task('build', ['images', 'scripts', 'vendor', 'soy', 'styles']);
gulp.task('default', ['build', 'connect', 'watch']);
