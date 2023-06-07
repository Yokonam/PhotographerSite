import pkg from 'gulp'
import { PATH, ENV } from './gulp-task/config.mjs'
import ts from './gulp-task/typescript.mjs'
import copy from './gulp-task/copy.mjs'
import img from './gulp-task/imagemin.mjs'
import pug from './gulp-task/pug.mjs'
import sass from './gulp-task/sass.mjs'
import clean from './gulp-task/clean.mjs'
import sprites from './gulp-task/svg-sprites.mjs'
import { server, bs } from './gulp-task/server.mjs'

const { series, parallel, watch, task } = pkg

const reload = (done) => {
  setTimeout(() => {
    bs.reload()
    done()
  }, 200)
}

const watchFiles = (done) => {
  watch([`${PATH.dev}/**/*.pug`], series(pug, reload))
  watch([`${PATH.dev}/**/*.scss`], sass)
  watch([`${PATH.dev}/**/*.ts`], series(ts, reload))
  watch([`${PATH.dev}/**/*.{png,jpg,svg,gif,ico}`], series(img, reload))
  watch([`${PATH.dev}/**/*.{txt,php,html,js,css,tsv,csv,xml,webmanifest,woff,woff2,pdf,json,jsonp,mp4}`], series(copy, reload))
  done()
}

export {
  copy,
  ts,
  img,
  pug,
  sass,
  clean,
  sprites
}

export default parallel(watchFiles, server)
export const build = series(clean, parallel(pug, sass, ts, img, sprites), copy)
