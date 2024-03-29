/* eslint-env node */

"use strict";

const
  gulp = require('gulp'),
  gulpSequence = require('gulp-sequence'),
  babel = require('gulp-babel'),
  del = require('del'),
  eslint = require('gulp-eslint'),
  sass = require('gulp-sass'),
  zip = require('gulp-zip'),
  webpack = require('webpack-stream'),
  named = require('vinyl-named');

process.env.NODE_ENV = 'development';

gulp.task('mode-prod', () => {
  process.env.NODE_ENV = 'production';
})

gulp.task('mode-dev', () => {
  process.env.NODE_ENV = 'development';
})

/**
 * Check js with eslint
 */
const eslintSrc = ['**/*.js', '!src/static/vendor/**/*.js', '!node_modules/**/*.js', '!dist/**/*.js'];
gulp.task('eslint', () =>
  gulp.src(eslintSrc)
    .pipe(eslint())
    .pipe(eslint.formatEach('compact', process.stderr))
    .pipe(eslint.failAfterError())
);

/**
 * Clean 'dist' directory
 */
gulp.task('cleanup', () => del('dist'));

/**
 * Copy vendor files
 */
const vendorSrc = ['node_modules/**/tinymce/**/*', 'node_modules/tinymce-emoji/dist/**/tinymce-emoji/**/*',
  'node_modules/**/font-awesome/css/**/*', 'node_modules/**/font-awesome/fonts/**/*'];
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
const scssSrc = ['src/style/content.scss', 'src/style/popup.scss', 'src/style/options.scss', 'src/style/tinymce-content.scss'];
gulp.task('scss', () =>
  gulp.src(scssSrc)
    .pipe(sass())
    .pipe(gulp.dest('dist/css'))
);
gulp.task('watch-scss', () => gulp.watch(scssSrc, ['scss']));

/**
 * Build js files using babel. Webpack is used together with vinyl-named to enable imports but keep result each entry point
 * in separated files (content script, background script)
 */
const jsSrc = ['src/content.js', 'src/background.js', 'src/popup.js', 'src/options.js', 'src/profiling.js'];
const depsSrc = ['src/utils/**/*.js', 'src/config/**/*.js', 'node_modules/**/*.js'];
gulp.task('js', () =>
  gulp.src(jsSrc)
    .pipe(named())
    .pipe(webpack({mode: process.env.NODE_ENV}))
    .pipe(babel({
      "presets": [
        ["@babel/preset-env", {
          "targets": {
            "browsers": ["last 2 chrome versions"]
          }
        }]
      ]
    }))
    .pipe(gulp.dest('dist/js'))
);
gulp.task('watch-js', () => gulp.watch(jsSrc.concat(depsSrc), ['js']));

/**
 * ZIP dist to upload to chrome store
 */
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

gulp.task('build', gulpSequence('cleanup', 'vendor', 'static', 'scss', 'js'));
gulp.task('watch', gulpSequence(['watch-vendor', 'watch-static', 'watch-scss', 'watch-js']));

gulp.task('package', gulpSequence('mode-prod', 'eslint', 'build', 'zip'));
gulp.task('default', gulpSequence('mode-dev', 'build', 'watch'));

