var gulp = require('gulp');
var uglify = require('gulp-uglify');

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

// Default task
gulp.task(
  'default', [
    'copy-vendor'
  ]
);
