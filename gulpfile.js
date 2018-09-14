const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const reload = browserSync.reload
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
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
  .pipe(concat('refapp.js', { newLine: ';' }))
  .pipe(gulp.dest('./dist/'))
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
  gulp.watch([
    './sample/**.html',
    './dist/refapp.js',
    './css/*.css'
  ]).on('change', reload)
})

gulp.task('compress', function (cb) {
  // compress file
  pump([
    gulp.src('./dist/refapp.js'),
    uglify(),
    rename({ suffix: '.min' }),
    gulp.dest('./dist/')
  ], cb)
})
