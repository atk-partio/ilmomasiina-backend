/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   If the watch task is running, this uses watchify instead
   of browserify for faster bundling using caching.
*/

var browserify   = require('browserify');
var es6ify       = require('es6ify');
var watchify     = require('watchify');
var bundleLogger = require('../util/bundle-logger');
var gulp         = require('gulp');
var handleErrors = require('../util/handle-errors');
var source       = require('vinyl-source-stream');
var exorcist     = require('exorcist');

gulp.task('browserify', function() {
  var bundler = browserify({
    // Required watchify args
    cache: {}, packageCache: {}, fullPaths: true,
    // Specify the entry point of your app
    entries: ['./app/modules/app.js'],
    // Add file extentions to make optional in your requires
    extensions: ['.js'],
    // Enable source maps!
    debug: true
  });

  var bundle = function() {
    // Log when bundling starts
    bundleLogger.start();

    return bundler
      .transform(es6ify)
      .bundle()
      // Move sourcemap to separate file
      .pipe(exorcist('../public/bundle.js.map'))
      // Report compile errors
      .on('error', handleErrors)
      // Use vinyl-source-stream to make the
      // stream gulp compatible. Specifiy the
      // desired output filename here.
      .pipe(source('bundle.js'))
      // Specify the output destination
      .pipe(gulp.dest('../public'))
      // Log when bundling completes!
      .on('end', bundleLogger.end);
  };

  if(global.isWatching) {
    bundler = watchify(bundler);
    // Rebundle with watchify on changes.
    bundler.on('update', bundle);
  }

  return bundle();
});
