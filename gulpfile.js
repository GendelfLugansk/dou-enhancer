/* eslint-env node */

"use strict";

const
  gulp = require('gulp'),
  gulpSequence = require('gulp-sequence'),
  babel = require('gulp-babel'),
  del = require('del'),
  eslint = require('gulp-eslint'),
  sass = require('gulp-sass'),
  zip = require('gulp-zip');

/**
 * Check js with eslint
 */
const eslintSrc = ['**/*.js', '!node_modules/**/*.js', '!dist/**/*.js'];
gulp.task('eslint', () =>
  gulp.src(eslintSrc)
    .pipe(eslint())
    .pipe(eslint.formatEach('compact', process.stderr))
);
gulp.task('watch-eslint', () => gulp.watch(eslintSrc, ['eslint']));

/**
 * Clean 'dist' directory
 */
gulp.task('cleanup', () => del('dist'));

/**
 * Copy vendor files
 */
const vendorSrc = ['node_modules/**/tinymce/**/*'];
gulp.task('vendor', () =>
  gulp.src(vendorSrc)
    .pipe(gulp.dest('dist/vendor'))
);
gulp.task('watch-vendor', () => gulp.watch(vendorSrc, ['vendor']));

/**
 * Copy static files like manifest, icons, htmls
 */
const staticSrc = ['src/static/**/*'];
gulp.task('static', () =>
  gulp.src(staticSrc)
    .pipe(gulp.dest('dist'))
);
gulp.task('watch-static', () => gulp.watch(staticSrc, ['static']));

/**
 * Build scss files
 */
const scssSrc = ['src/style/content.scss', 'src/style/popup.scss', 'src/style/tinymce-content.scss'];
gulp.task('scss', () =>
  gulp.src(scssSrc)
    .pipe(sass())
    .pipe(gulp.dest('dist/css'))
);
gulp.task('watch-scss', () => gulp.watch(scssSrc, ['scss']));

/**
 * Build js files using babel
 */
const jsSrc = ['src/content.js', 'src/background.js', 'src/popup.js'];
gulp.task('js', () =>
  gulp.src(jsSrc)
    .pipe(babel({
      presets: [
        ["@babel/preset-env", {
          "targets": {
            "browsers": ["last 2 chrome versions"]
          }
        }]
      ]
    }))
    .pipe(gulp.dest('dist/js'))
);
gulp.task('watch-js', () => gulp.watch(jsSrc, ['js']));

gulp.task('zip', () =>
  del('dou-enhancer.zip')
    .then(() => gulp.src('dist/**/*')
      .pipe(zip('dou-enhancer.zip'))
      .pipe(gulp.dest('./')
      )
    )
);

/**
 * Public tasks to use in command line
 */

gulp.task('build', gulpSequence('eslint', 'cleanup', 'vendor', 'static', 'scss', 'js'));
gulp.task('package', gulpSequence('build', 'zip'));
gulp.task('watch', gulpSequence(['watch-eslint', 'watch-vendor', 'watch-static', 'watch-scss', 'watch-js']));
gulp.task('default', gulpSequence('build', 'watch'));

