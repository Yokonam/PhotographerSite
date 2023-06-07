import { PATH } from './config.mjs'
import pkg from 'gulp'
import imagemin, { mozjpeg, optipng, svgo } from 'gulp-imagemin'
import changed from 'gulp-changed'

const { src, dest } = pkg

const imageminOption = [
  mozjpeg({
    quality: 75, progressive: true
  }),
  optipng({
    optimizationLevel: 5
  }),
  svgo({
    plugins: [
      {
        name: 'removeViewBox',
        active: false
      },
      {
        name: 'cleanupIDs',
        active: true
      }
    ]
  })
]

export default () => {
  return src([
    `${PATH.dev}/**/*.{png,jpg,svg,gif,ico}`,
    `!${PATH.dev}/**/sprites_*/*`
  ], { base: PATH.dev })
    .pipe(changed(PATH.dist))
    .pipe(imagemin(imageminOption))
    .pipe(dest(PATH.dist))
}
