const gulp = require('gulp');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const mode = require('gulp-mode')();
const concat = require('gulp-concat');
const liveServer = require('gulp-live-server');

gulp.task('process-data', () => {
    return gulp.src(['data/projects.json'])
    .pipe(gulp.dest('dist/data'));
});

gulp.task('process-static-img', () => {
    return gulp.src(['src/assets/favicon.png'])
    .pipe(gulp.dest('dist/img'));
});

gulp.task('process-vendor-js', () => {
    return gulp.src([
        'node_modules/jquery/dist/jquery.min.js', 
        'node_modules/animejs/lib/anime.min.js',
        'node_modules/typed.js/lib/typed.min.js'
    ])
    // .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('process-sass', () => {
    return gulp.src('src/scss/style.scss')
        .pipe(mode.development(sourcemaps.init()))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 1%']
        }))
        .pipe(cssnano())
        .pipe(mode.development(sourcemaps.write()))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('process-js', () => {
    return gulp.src('src/js/app.js')
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(mode.development(sourcemaps.init()))
        .pipe(uglify().on('error', (uglify) => {
            console.error(uglify.message);
            this.emit('end');
        }))
        .pipe(mode.development(sourcemaps.write()))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('process-html', () => {

    return gulp
        .src('src/index.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {

    gulp.watch(
        ['src/scss/*.scss','src/scss/*/*.scss'],
        { ignoreInitial: false },
        gulp.series('process-sass')
    );

    gulp.watch(
        ['src/js/*.js','src/js/*/*.js'],
        { ignoreInitial: false },
        gulp.series('process-js')
    );

    gulp.watch(
        ['src/*.html'],
        { ignoreInitial: false },
        gulp.series('process-html')
    );

    gulp.watch(
        ['data/*'],
        gulp.series('process-data')
    );
});

gulp.task('serve', () => {
    let server = liveServer.static('dist', 8888);
    server.start();

    gulp.series('process-data', 'process-vendor-js', 'process-static-img');

    gulp.watch(['dist/**/*'])
        .on('change', (path) => server.notify.call(server, { path }));
});

exports.watch = gulp.series('watch');
exports.serve = gulp.parallel('watch', 'serve');
exports.build = gulp.series(
    'process-data', 
    'process-vendor-js', 
    'process-static-img', 
    'process-sass', 
    'process-js', 
    'process-html'
);

exports.default = exports.watch;