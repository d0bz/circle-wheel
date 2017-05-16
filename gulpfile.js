var gulp = require('gulp');
var concat = require('gulp-concat');
var order = require("gulp-order");
var uglify = require("gulp-uglify");
var minify = require("gulp-minify-css");
var streamqueue = require('streamqueue');

// == PATH STRINGS ========

var paths = {
    appScripts: ['circle-wheel/*.js'],
    styles: ['circle-wheel/*.css'],
	libsScripts: ['lib/*.js'],
    dist: 'dist'
};


// == PIPE SEGMENTS ========
var pipes = {};
var distFileName = "circle-wheel.js";

pipes.appScripts = function() {
    return gulp.src(paths.appScripts)
	    .pipe(order(['circle-wheel.js']));
};

pipes.libsScripts = function() {
    return gulp.src(paths.libsScripts);
};

pipes.buildStyles = function() {
      return  gulp.src(paths.styles)
        .pipe(concat('circle-wheel.css'));
};

pipes.buildApp = function() {
  var appScripts = pipes.appScripts();
  var libScripts = pipes.libsScripts();
  pipes.buildStyles();
  
  return streamqueue({ objectMode: true },libScripts, appScripts)
    .pipe(concat('circle-wheel.js'));
};

gulp.task('build-prod', function() {
	return pipes.buildApp()
	.pipe(uglify())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('build-prod-styles', function() {
	return pipes.buildStyles()
        .pipe(minify())
        .pipe(gulp.dest(paths.dist));
});

gulp.task('build-dev', function() {
   return pipes.buildApp()
    .pipe(gulp.dest(paths.dist));
});

gulp.task('build-dev-styles', function() {
	return pipes.buildStyles()
        .pipe(gulp.dest(paths.dist));
});

gulp.task('watch', ['build-dev'], function() {

    // watch app scripts
    gulp.watch(paths.appScripts, function() {
        return pipes.buildApp()
			.pipe(gulp.dest(paths.dist))
            .on('end', function(){ gutil.log('Done scripts!'); });
    });

    // watch styles
    gulp.watch(paths.styles, function() {
        return pipes.buildStyles()
			.pipe(gulp.dest(paths.dist))
            .on('end', function(){ gutil.log('Done styles!'); });
    });

})

gulp.task('default', ['build-prod', 'build-prod-styles']);
gulp.task('build', ['build-dev', 'build-dev-styles']);