import minimist from 'minimist'

const envOption = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'development' }
}

const options = minimist(process.argv.slice(2), envOption)
const isProduction = (options.env === 'production') !== false

const ENV = {
  production: isProduction,
  str: options.env
}

const PATH = {
  dev: 'src',
  dist: 'dist'
}

export {
  PATH,
  ENV
}
// exports.PATH = PATH
// exports.ENV = ENV
