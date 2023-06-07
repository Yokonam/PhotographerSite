import { PATH, ENV } from './config.mjs'
import pkg from 'gulp'
import gulpPug from 'gulp-pug'
import htmlbeautify from 'gulp-html-beautify'
import plumber from 'gulp-plumber'
import browser from 'browser-sync'
import cached from 'gulp-cached'
import changed from 'gulp-changed'
import gulpif from 'gulp-if'
import rename from 'gulp-rename'
import replace from 'gulp-replace'
import path from 'path'
import { fileURLToPath } from 'url'
import gulpData from 'gulp-data'
import imageSize from 'image-size'

const { src, dest } = pkg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sourcePath = path.resolve(__dirname, '../' + PATH.dev)

export default () => {
  return src([`${PATH.dev}/**/[^_]*.pug`])
    .pipe(plumber())
    .pipe(gulpif(!ENV.production, changed(PATH.dist, { extension: '.html' })))
    .pipe(gulpif(!ENV.production, cached('pug')))
    .pipe(
      gulpData((file) => {
        return {
          imageSize: (src) => {
            // imgタグのsrc属性のパスを基にファイルパスを生成する
            const filePath = src.startsWith('/')
              ? path.resolve(sourcePath, src.slice(1)) // /から始まるルート相対パスの場合
              : path.resolve(file.dirname, src) // 相対パスの場合
            // ファイルパスに該当する画像のサイズをimage-sizeで取得する
            return imageSize(filePath)
          }
        }
      })
    )
    .pipe(gulpPug({
      doctype: 'html',
      pretty: true,
      basedir: PATH.dev
    }))
    .pipe(htmlbeautify({
      indent_size: 2,
      unformatted: ['script']
    }))
    .pipe(replace(/[\u200B-\u200D\uFEFF]/g, ''))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(dest(PATH.dist))
    .pipe(browser.reload({ stream: true }))
}
