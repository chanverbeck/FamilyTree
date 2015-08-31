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

gulp.task('client-scripts', ['jsx'], function() {
    return browserify('./bin/Pages/index.js').bundle().
        pipe(source('index.js')).
        pipe(gulp.dest('bin/Pages'));
});

gulp.task('node', ['client-scripts', 'watch-jsx'], function() {
    gulpNodemon({
        script: 'bin/server.js',
        ignore: ['gulpfile.js'],
        ext: 'json js jsx'
    });
});

gulp.task('default', function() {
    gulp.start('node');
});
