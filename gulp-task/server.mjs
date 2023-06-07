import { PATH } from './config.mjs'
import browser from 'browser-sync'

const bs = browser.create('myserver')

const server = (done) => {
  bs.init({
    notify: false,
    server: {
      baseDir: PATH.dist
    },
    open: 'external',
    scrollProportionally: false,
    ghostMode: false,
    startPath: '/'
  })
  done()
}

export {
  bs,
  server
}
