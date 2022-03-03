const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const del = require("del");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const pipeline = require("readable-stream").pipeline;

// Styles
const styles = () => {
  return gulp.src("source/scss/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream())
}
exports.styles = styles;

// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}
exports.server = server;

// Watcher
const watcher = () => {
  gulp.watch("source/scss/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", gulp.series(cleanHtml, copyHtml, sync.reload));
  gulp.watch("source/js/**/*.{js,json}").on("change", gulp.series(js, sync.reload));
}

exports.dev = gulp.series(
  styles, server, watcher
);

// Clean
const clean = () => {
  return del("build");
};
exports.clean = clean;

const cleanHtml = () => {
  return del("build/*.html");
};

// Copy
const copy = () => {
  return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/*.html",
      "source/js/*.js"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
};
exports.copy = copy;

const copyHtml = () => {
  return gulp.src([
    "source/*.html",
  ])
  .pipe(gulp.dest("build"));
};

// Images
const convertWebp = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp())
    .pipe(gulp.dest("build/img"));
};
exports.convertWebp = convertWebp;

const imagesMini = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(imagemin())
    .pipe(gulp.dest("build/img"));
};
exports.imagesMini = imagesMini;

// Sprite
const svgo = () => {
  return gulp.src('source/img/**/*.{svg}')
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [
          {removeViewBox: false},
          {removeRasterImages: true},
          {removeUselessStrokeAndFill: false},
        ]
      }),
    ]))
  .pipe(gulp.dest('source/img'));
};

const sprite = () => {
  return gulp.src('source/img/sprite/*.svg')
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('sprite_auto.svg'))
    .pipe(gulp.dest('build/img'));
};

// Html
const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
};
exports.html = html;

// JS
const js = () => {
  return gulp.src("source/js/*.js")
    // .pipe(uglify())
    .pipe(gulp.dest("build/js"));
};
exports.js = js;

// Build
const build = gulp.series(
  clean,
  copy,
  convertWebp,
  imagesMini,
  styles,
  js,
  svgo,
  sprite
);
exports.build = build;
