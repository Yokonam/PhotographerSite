import { PATH } from './config.mjs'
import pkg from 'gulp'
const { src, dest } = pkg

export default () => {
  return src([`${PATH.dev}/**/*.{txt,php,html,js,css,tsv,csv,docx,xml,xls,webmanifest,woff,woff2,pdf,json,jsonp,mp4}`], { base: PATH.dev, dot: true })
    .pipe(dest(PATH.dist))
}
