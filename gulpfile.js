var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

dest = './kotti_tinymce/static';

gulp.task('copy-vendor', function () {
  gulp.src(['./bower_components/tinymce/tinymce.js',
            './bower_components/tinymce/plugins/**/*.*',
            './bower_components/tinymce/skins/**/*.*',
            './bower_components/tinymce/themes/**/*.*'],
           {base: './bower_components/tinymce/'})
    .pipe(gulp.dest(dest));
  gulp.src('./bower_components/codemirror/**/*.*',
           {base: './bower_components/codemirror/'})
    .pipe(gulp.dest(dest + '/codemirror/CodeMirror'));
});

gulp.task('uglify', function() {
  gulp.src([dest + '/*.js',
            dest + '/codemirror/*js',
            '!' + dest + '**/*.min.js'],
           {base: dest})
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(dest));
});

gulp.task('copy-plugins', function () {
  gulp.src(dest + '/kottiimage_plugin.js',
           {base: dest})
    .pipe(rename('plugin.js'))
    .pipe(gulp.dest(dest + '/plugins/kottiimage'));
  gulp.src(dest + '/kottiimage_plugin.min.js',
           {base: dest})
    .pipe(rename('plugin.min.js'))
    .pipe(gulp.dest(dest + '/plugins/kottiimage'));
  gulp.src(dest + '/codemirror/**/*.*',
           {base: dest})
    .pipe(gulp.dest(dest + '/plugins'));
});
// Default task
gulp.task(
  'default', [
    'copy-vendor',
    'uglify',
    'copy-plugins'
  ]
);
