var gulp = require('gulp');
var gulpReact = require('gulp-react');
var gulpNodemon = require('gulp-nodemon');
var gulpWatch = require('gulp-watch');
var source = require('vinyl-source-stream');
var browserify = require('browserify');

gulp.task('watch-jsx', ['jsx'], function() {
    gulpWatch('server/**/*.jsx', {ignored: 'bin/' }, function() {
        gulp.start('build');
    });
});

gulp.task('jsx', function() {
    return gulp.src('server/**/*.jsx').
        pipe(gulpReact()).
        pipe(gulp.dest('bin'));
});

gulp.task('build', ['client-scripts']);

gulp.task('client-scripts', ['jsx', 'copy-css'], function() {
    return browserify('./bin/Pages/index.js').bundle().
        pipe(source('index.js')).
        pipe(gulp.dest('bin/Pages'));
});

gulp.task('watch-css', [], function() {
    gulpWatch('server/**/*.css', {ignored: 'bin/' }, function() {
        gulp.start('copy-css');
    });
});
gulp.task('copy-css', [], function() {
    return gulp.src('server/**/*.css')
        .pipe(gulp.dest('bin'));
});

gulp.task('node', ['client-scripts', 'watch-css', 'watch-jsx'], function() {
    gulpNodemon({
        script: 'bin/server.js',
        ignore: ['gulpfile.js'],
        ext: 'json js jsx'
    });
});

gulp.task('default', function() {
    gulp.start('node');
});
