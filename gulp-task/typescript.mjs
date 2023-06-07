import { PATH } from './config.mjs'
import pkg from 'gulp'
import plumber from 'gulp-plumber'
import webpackStream from 'webpack-stream'
import webpack from 'webpack'
import webpackConfig from '../webpack.config.js'

const { dest } = pkg

export default () => {
  return webpackStream(webpackConfig, webpack)
    .pipe(plumber())
    .on('error', function (e) {
      this.emit('end')
    })
    .pipe(dest(`${PATH.dist}`))
}
