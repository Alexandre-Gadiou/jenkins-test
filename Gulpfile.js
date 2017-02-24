var shell = require('gulp-shell');
var gulp = require('gulp');
var backstopjs = require('backstopjs');
var gutil = require('gulp-util');
var color = require('gulp-color');

var backstopConfig = {
  config: './src/test/backstop/backstop-config.js'
}


gulp.task('backstop_reference', () => backstopjs('reference',backstopConfig));

gulp.task('backstop_test', function () {
  return backstopjs('test',backstopConfig).then(() => {
    gutil.log(color("SUCCESS no regressions", 'GREEN'));
  }).catch(function (error) {
    gutil.log(color("WARNING visual regressions found", 'ORANGE'));
  });
});

gulp.task('backstop_openReport', () => backstopjs('openReport',backstopConfig));
