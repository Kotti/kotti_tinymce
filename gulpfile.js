let gulp = require('gulp');
let del = require('del');
let uglify = require('gulp-uglify');
let rename = require('gulp-rename');
let mergeStream = require('merge-stream');

let dest = './kotti_tinymce/static';

gulp.task('delete-vendor', function () {
  return del([
    `${dest}/tinymce*`,
    `${dest}/langs`,
    `${dest}/codemirror`,
    `${dest}/plugins`,
    `${dest}/skins`,
    `${dest}/themes`
  ])
});

gulp.task('copy-vendor', ['delete-vendor'], function () {

  let s1 = gulp.src(['./node_modules/tinymce/tinymce.js',
            './node_modules/tinymce/plugins/**/*.*',
            './node_modules/tinymce/skins/**/*.*',
            './node_modules/tinymce/themes/**/*.*'],
           {base: './node_modules/tinymce/'})
    .pipe(gulp.dest(dest));

  let s2 = gulp.src('./node_modules/tinymce-i18n/langs/**/*.*',
           {base: './node_modules/tinymce-i18n/'})
    .pipe(gulp.dest(dest));

  let s3 = gulp.src('./node_modules/codemirror/**/*.*',
           {base: './node_modules/codemirror/'})
    .pipe(gulp.dest(`${dest}/codemirror/CodeMirror`));

  return mergeStream(s1, s2, s3);
});

gulp.task('uglify', ['copy-vendor'], function() {
  return gulp.src([`${dest}/*.js`, `${dest}/codemirror/*js`, `!${dest}/**/*.min.js`], {base: dest})
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(dest));
});

// gulp.task('copy-plugins', function () {
gulp.task('copy-plugins', ['uglify'], function () {
  let s1 = gulp.src(`${dest}/kottiimage_plugin.js`, {base: dest})
    .pipe(rename('plugin.js'))
    .pipe(gulp.dest(`${dest}/plugins/kottiimage`));

  let s2 = gulp.src(`${dest}/kottiimage_plugin.min.js`, {base: dest})
    .pipe(rename('plugin.min.js'))
    .pipe(gulp.dest(`${dest}/plugins/kottiimage`));

  let s3 = gulp.src(`${dest}/codemirror/**/*.*`, {base: dest})
    .pipe(gulp.dest(`${dest}/plugins`));

  let srcCodeMirror = 'node_modules/tinymce-codemirror/plugins/codemirror';
  let s4 = gulp.src([`${srcCodeMirror}/*.js`, `${srcCodeMirror}/*.html`])
    .pipe(gulp.dest(`${dest}/plugins/codemirror`));

  let s5 = gulp.src(`${srcCodeMirror}/langs/*.js`)
    .pipe(gulp.dest(`${dest}/plugins/codemirror/langs`));

  return mergeStream(s1, s2, s3, s4, s5)
});

gulp.task('cleanup', ['copy-plugins'], function () {
  del(`${dest}/codemirror`)
});

// Default task
gulp.task(
  'default', [
    'delete-vendor',
    'copy-vendor',
    'uglify',
    'copy-plugins',
    'cleanup'
  ]
);
