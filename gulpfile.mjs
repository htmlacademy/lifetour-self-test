import gulp from "gulp";
import browserSync from "browser-sync";
import backstop from "backstopjs";
import fs from 'fs/promises';
import path from 'path';
import del from 'del';
import rename from 'gulp-rename';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import svgstore from 'gulp-svgstore';
import pngQuant from 'imagemin-pngquant';
import mozJpeg from 'imagemin-mozjpeg';
import svgo from 'imagemin-svgo';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'gulp-csso';
import gcmq from 'gulp-group-css-media-queries';
import concat from 'gulp-concat';
import browserify from 'browserify';
import uglify from 'gulp-uglify';
import vinylBuffer from 'vinyl-buffer';
import vinylSourceStream from 'vinyl-source-stream';
import bemlinter from 'gulp-html-bemlinter';

const sass = gulpSass(dartSass);

const server = browserSync.create();
const stopServer = (done) => {
  server.exit();
  done();
};
const refresh = (done) => {
  server.reload();
  done();
};

const syncServer = (done) => {
  server.init({
    server: "build/",
    index: "index.html",
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  gulp.watch("build/**/*", gulp.series(refresh, backstopTest));
  done();
};

const startServer = (done) => {
  server.init({
    server: "build/",
    index: "index.html",
    notify: false,
    open: false,
    cors: true,
    ui: false,
  });
  done();
};

const backstopTest = (done) =>
  backstop("test", { config: "pp.config.js" })
    .then(() => {
      // test successful
    })
    .catch(() => {
      // test failed
    })
    .finally(done);

const test = gulp.series(syncServer, backstopTest);

const testOnce = gulp.series(startServer, backstopTest, stopServer);

async function lintBem() {
  return gulp.src("source/*.html").pipe(bemlinter());
}

function cleanBuild() {
  return del(['build/**']);
}

function copyProject(projectPath) {
  return gulp.src(`${projectPath}/**/*`)
    .pipe(gulp.dest('build'));
}

function collectBuild(project) {
  return gulp.src('backstop_data/html_report/**/*')
    .pipe(gulp.dest(`reports/${project}`));
}

const clean = () => del('build');
const copy = () =>
  gulp.src([
    'source/**.html',
    'source/fonts/**',
    'source/img/**',
    'source/favicon/**'
  ], {
    base: 'source',
  })
    .pipe(gulp.dest('build'));
const sprite = () =>
  gulp
    .src('source/img/sprite/*.svg')
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));

const optimizeSvg = () =>
  gulp
    .src('build/img/**/*.svg')
    .pipe(
      imagemin([
        svgo({
          plugins: [
            {
              name: 'removeViewBox',
              active: false,
            },
            {
              name: 'removeRasterImages',
              active: true,
            },
            {
              name: 'removeUselessStrokeAndFill',
              active: false,
            }],
        })]))
    .pipe(gulp.dest('build/img'));

const optimizeJpg = () =>
  gulp
    .src('build/img/**/*.{jpg,jpeg}')
    .pipe(imagemin([mozJpeg({quality: 90, progressive: true})]))
    .pipe(gulp.dest('build/img'));

const optimizePng = () =>
  gulp
    .src('build/img/**/*.png')
    .pipe(
      imagemin([
        pngQuant({
          speed: 1,
          strip: true,
          dithering: 1,
          quality: [0.8, 0.9],
        })]))
    .pipe(gulp.dest('build/img'));

const compileMinStyles = () =>
  gulp
    .src('source/sass/style.scss', {sourcemaps: true})
    .pipe(sass().on('error', sass.logError))
    .pipe(
      postcss([
        autoprefixer({
          grid: true,
        })]))
    .pipe(gcmq()) // выключите, если в проект импортятся шрифты через ссылку на внешний источник
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', {sourcemaps: '.'}));

const compileMainMinScripts = () =>
  browserify('source/js/main.js', {debug: true})
    .transform('babelify', {presets: ['@babel/preset-env']})
    .bundle()
    .pipe(vinylSourceStream('main.js'))
    .pipe(vinylBuffer())
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest('build/js'));

const compileVendorScripts = () =>
  browserify('source/js/vendor.js')
    .transform('babelify', {presets: ['@babel/preset-env']})
    .bundle()
    .pipe(vinylSourceStream('vendor.js'))
    .pipe(vinylBuffer())
    .pipe(uglify())
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest('build/js'));

const build = gulp.series(clean, copy, sprite, gulp.parallel(compileMinStyles, compileMainMinScripts, compileVendorScripts, optimizePng, optimizeJpg, optimizeSvg));

export { test, testOnce, lintBem, build };
