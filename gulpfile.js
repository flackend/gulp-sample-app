var argv          = require('yargs').argv;
var autoprefixer  = require('autoprefixer');
var jshintStylish = require('jshint-stylish');
var browserify    = require('browserify');
var browserSync   = require('browser-sync').create();
var buffer        = require('vinyl-buffer');
var clean         = require('gulp-clean');
var cleanCSS      = require('gulp-clean-css');
var concat        = require('gulp-concat-css');
var cssreporter   = require('postcss-reporter');
var doiuse        = require('doiuse');
var gulp          = require('gulp');
var gulpif        = require('gulp-if');
var gutil         = require('gulp-util');
var htmlhint      = require('gulp-htmlhint');
var htmlmin       = require('gulp-htmlmin');
var livereload    = require('gulp-livereload');
var merge         = require('utils-merge');
var notify        = require('gulp-notify');
var path          = require('path');
var plumber       = require('gulp-plumber');
var postcss       = require('gulp-postcss');
var rename        = require('gulp-rename');
var jshint        = require('gulp-jshint');
var sass          = require('gulp-sass');
var scsslint      = require('gulp-scss-lint');
var source        = require('vinyl-source-stream');
var sourcemaps    = require('gulp-sourcemaps');
var uglify        = require('gulp-uglify');
var watchify      = require('watchify');

/**
 * TODO:
 * - Remove unused CSS
 *   - https://github.com/ben-eb/gulp-uncss
 *   - https://github.com/purifycss/gulp-purifycss
 * - Modular setup
 *   - https://www.npmjs.com/package/gulp-task-loader
 */

// Environment can be set to production or development using arguments.
// E.g. gulp build --production
// Set to dev by default.
var env = {
    prod: !!argv.production,
    dev: !!argv.development || !argv.production
};

var paths = {
    html: {
        all: './src/html/**/*.html'
    },
    sass: {
        all: './src/sass/**/*.scss'
    },
    js: {
        main: './src/js/main.js',
        all: './src/js/**/*.js'
    },
    public: './public'
};

/**
 * Deletes the public folder's contents
 */
gulp.task('clean', function () {
    return gulp.src(paths.public + '/*', {read: false})
        .pipe(clean());
});

/**
 * Process SASS
 */
gulp.task('sass', function () {
    return gulp.src(paths.sass.all)
        // Lint
        .pipe(scsslint())
        .pipe(gulpif(env.dev, sourcemaps.init()))
        // Convert to CSS
        .pipe(sass({
            /**
             * TWBS issue. Button not tall enough.
             * @link https://github.com/twbs/bootstrap-sass/issues/409
             */
            precision: 10
        }).on('error', sass.logError))
        .pipe(postcss([
            doiuse({
                browsers: ['> 5%', 'IE 8', 'Firefox 3.6']
            }),
            autoprefixer({browsers: ['> 5%', 'IE 8', 'Firefox 3.6']}),
            cssreporter({clearMessages: true})
        ]))

        .pipe(gulpif(env.dev, sourcemaps.write()))
        // Minify CSS
        .pipe(gulpif(env.prod, cleanCSS({
            relativeTo: paths.public,
            target: paths.public
        })))
        .pipe(gulp.dest(paths.public))
        .pipe(browserSync.stream());
});

/**
 * Watch SASS
 */
gulp.task('sass-watch', function () {
    return gulp.watch(paths.sass.all, ['sass']);
});

/**
 * Processes JS
 */
gulp.task('js', ['js-lint'], function () {
    return processJs(browserify(paths.js.main, {debug: true}));
});

/**
 * Watch JS
 */
gulp.task('js-watch', ['js-lint-watch'], function () {
    // Watchify wraps around browserify and caches the JS so we only need to
    // process new JS when it comes though.

    // Watchify provides a cheat sheet of args we need to pass to browserify.
    // We'll use those and add our own. We're setting debug to true which
    // turns on sourcemaps
    var args = merge(watchify.args, { debug: false });
    var bundler = watchify(browserify(paths.js.main, args));
    // On change, rebundle
    bundler.on('update', function() {
        console.log('Change in JS detected');
        processJs(bundler);
    });
    // Initial run
    return processJs(bundler);
});

/**
 * Lint JS
 */
gulp.task('js-lint', function () {
    return gulp.src(paths.js.all)
        .pipe(jshint())
        .pipe(jshint.reporter(jshintStylish));
});

/**
 * Lint and watch JS
 */
gulp.task('js-lint-watch', function () {
    return gulp.watch(paths.js.all, ['js-lint']);
});

/**
 * Start BrowserSync and serve app
 */
gulp.task('serve', function () {
    browserSync.init({
        server: paths.public
    });
});

/**
 * Process HTML
 */
gulp.task('html', function() {
  return gulp.src(paths.html.all)
    // Lint
    .pipe(htmlhint())
    .pipe(htmlhint.reporter())
    // Minify
    .pipe(gulpif(env.prod, htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest(paths.public));
});

/**
 * Watch HTML
 */
gulp.task('html-watch', function () {
    return gulp.watch(paths.html.all, ['html'], browserSync.reload);
});

/**
 * This runs all the tasks and ends without watching for changes.
 */
gulp.task('build', ['clean'], function () {
    gulp.start('sass', 'js', 'html');
});

/**
 * This runs the build task, then starts watching for changes.
 */
gulp.task('watch', ['build', 'sass-watch', 'js-watch', 'html-watch', 'serve']);

/**
 * This is our default task and is set to run the watch task.
 */
gulp.task('default', ['watch']);

/**
 * This is encapsulated in a function since we use it for two different tasks.
 */
function processJs (bundler) {
    return bundler
        // Convert ES6 to ES2015
        .transform('babelify', {presets: ['es2015']})
        // Bundle up all our JS (makes require() work in the browser)
        .bundle()
        // Catch any errors thrown by bundle()
        .on('error', gutil.log)
        // Catch any errors thrown down the line
        .pipe(plumber({handleError: gutil.log}))
        // Convert the stream browserify created into a virtual file/buffer
        .pipe(source('app.min.js'))
        .pipe(buffer())
        // We want to set loadMaps to true because browserify has already
        // generated sourcemaps. gulp-sourcemaps can generate them too, but
        // since we've already bundled all of our JS using browserify, gulp-
        // sourcemaps would map all the JS to a single file.
        .pipe(gulpif(env.dev, sourcemaps.init({loadMaps: true})))

            // JS transforms go here

            // minify
            .pipe(gulpif(env.prod, uglify()))

        // Write sourcemaps
        .pipe(gulpif(env.dev, sourcemaps.write('./')))
        .pipe(gulp.dest(paths.public))
        // Reload browser
        .on('end', function () {
            if (env.dev) {
                browserSync.reload();
            }
        });
}