import { PATH, ENV } from './config.mjs'
import del from 'del'

export default () => {
  return del([
    `${PATH.dist}/**`
  ])
}
