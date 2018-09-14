const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const reload = browserSync.reload
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const cleanCss = require('gulp-clean-css')
const sass = require('gulp-sass')
const pump = require('pump')
const rename = require('gulp-rename')

let jsFragments = [
  './partials/*.js',
  './main.js'
]

let doConcat = function () {
  // concat main and partials
  return gulp.src(jsFragments)
    .pipe(concat('restform.js', { newLine: ';\n\n' }))
    .pipe(gulp.dest('./dist/'))
}

let compileSass = function () {
  // parse SASS to CSS
  return gulp.src('./scss/styles.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'))
}

// watch JS and html files
gulp.task('serve', function () {
  // Serve files from the root of this project
  browserSync.init({
    server: {
      baseDir: './'
    },
    middleware: function (req, res, next) {
      // redirect home to sample folder
      if (req.url === '/') {
        res.writeHead(301, { Location: '/sample/' })
        res.end()
      } else {
        return next()
      }
    }
  })
  gulp.watch(jsFragments).on('change', doConcat)
  gulp.watch('./scss/*.scss').on('change', compileSass)
  gulp.watch([
    './sample/**.html',
    './dist/restform.js',
    './css/*.css'
  ]).on('change', reload)
})

gulp.task('compress', function (cb) {
  pump([
    // compress JS file
    gulp.src('./dist/restform.js'),
    uglify(),
    rename({ suffix: '.min' }),
    gulp.dest('./dist/'),
    // compress CSS
    gulp.src('./dist/css/*.css'),
    cleanCss({compatibility: 'ie8'}),
    rename({ suffix: '.min' }),
    gulp.dest('./dist/css/')
  ], cb)
})

gulp.task('concat', doConcat)

gulp.task('sass', compileSass)
