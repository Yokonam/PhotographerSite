import { PATH, ENV } from './config.mjs'
import pkg from 'gulp'
import sass from 'gulp-dart-sass'
import cleanCSS from 'gulp-clean-css'
import postcss from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import plumber from 'gulp-plumber'
import { bs } from './server.mjs'

const { src, dest } = pkg

export default () => {
  return src(
    [`${PATH.dev}/**/*.scss`],
    { base: PATH.dev, sourcemaps: !ENV.production }
  )
    .pipe(plumber())
    .pipe(sass({
      sourceMap: !ENV.production
    }).on('error', sass.logError))
    .pipe(postcss([
      autoprefixer({
        flexbox: true,
        grid: true
      })
    ]))
    .pipe(cleanCSS())
    .pipe(dest(PATH.dist, { sourcemaps: './.map' }))
    .pipe(bs.stream())
}
