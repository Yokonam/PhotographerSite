import glob from 'glob'
import path from 'path'
import { fileURLToPath } from 'url'
import minimist from 'minimist'
import TerserPlugin from 'terser-webpack-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envOption = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'development' }
}

const mode = minimist(process.argv.slice(2), envOption)
const isProduction = (mode.env === 'production') !== false

const entries = glob
  .sync('./**/[^_]*.ts', {
    cwd: './src'
  })
  .map(function (file) {
    const key = file.replace(/\.ts$/, '')
    return [key, path.resolve('./src', key)]
  })

const entryObj = Object.fromEntries(entries)

export default {
  mode: mode.env,
  target: ['web', 'es5'],
  entry: entryObj,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      extractComments: false,
      terserOptions: {
        output: {
          comments: false,
        },
        compress: { drop_console: true }
      }
    })]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  }
}
