var gulp = require('gulp');
var soynode = require('gulp-soynode');

gulp.task('soy', function() {
	return gulp.src('src/**/*.soy')
		.pipe(soynode({
			renderSoyWeb: true
		}))
		.pipe(gulp.dest('dist'));
});
