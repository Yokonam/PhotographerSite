import { PATH, ENV } from './config.mjs'
import pkg from 'gulp'
import fs from 'fs'
import gulpSvgSprite from 'gulp-svg-sprite'

const { src, dest } = pkg

const FileType = {
  File: 'file',
  Directory: 'directory',
  Unknown: 'unknown'
}

const spriteFolder = (dirPath, mode) => {
  const ret = []
  const paths = fs.readdirSync(dirPath)
  let folderName = /sprites_/

  if (mode === 'view') {
    folderName = /sprites-view_/
  }

  paths.forEach(a => {
    const path = `${dirPath}/${a}`
    switch (getFileType(path)) {
      case FileType.Directory:
        if (folderName.test(path)) {
          ret.push(path)
        }
        ret.push(...spriteFolder(path, mode))
        break
      default:
        break
    }
  })
  return ret
}

const getFileType = path => {
  try {
    const stat = fs.statSync(path)
    switch (true) {
      case stat.isFile():
        return FileType.File

      case stat.isDirectory():
        return FileType.Directory

      default:
        return FileType.Unknown
    }
  } catch (e) {
    return FileType.Unknown
  }
}

const getWord = (c, word, e) => {
  const start = c.indexOf(word)
  const l = word.length
  const after = start >= 0 ? c.substr(start + l) : ''
  const end = e ? after.indexOf(e) : after.length
  return after.substr(0, end)
}

export default (done) => {
  const symbolmodeFolders = spriteFolder(PATH.dev)
  const viewmodeFolders = spriteFolder(PATH.dev, 'view')
  let prefix = ''
  let plugins = []

  symbolmodeFolders.map(function (folder) {
    if (/has_fill_/.test(folder)) {
      prefix = 'sprites_has_fill_'
      plugins = [
        { removeTitle: true },
        { removeStyleElement: true },
        { removeXMLNS: true },
        { removeDimensions: true }
      ]
    } else {
      prefix = 'sprites_'
      plugins = [
        { removeTitle: true },
        { removeStyleElement: true },
        { removeAttrs: { attrs: 'fill' } },
        { removeXMLNS: true },
        { removeDimensions: true }
      ]
    }

    const filename = getWord(folder, prefix, '')
    const distFolder = folder.replace(PATH.dev, PATH.dist).replace('/' + prefix + filename, '')
    const modeSymbol = {
      mode: {
        symbol: {
          dest: distFolder,
          sprite: `${filename}.svg`
        }
      },
      shape: {
        transform: [
          {
            svgo: {
              plugins: plugins
            }
          }
        ]
      },
      svg: {
        xmlDeclaration: false
      }
    }

    console.log(folder)
    return src(folder + '/*.svg')
      .pipe(gulpSvgSprite(modeSymbol))
      .pipe(dest('.'))
  })

  viewmodeFolders.map(function (folder) {
    const filename = getWord(folder, 'sprites-view_', '')
    const distFolder = folder.replace(PATH.dev, PATH.dist).replace('/sprites-view_' + filename, '')
    const modeView = {
      mode: {
        view: {
          dest: distFolder,
          sprite: `${filename}.svg`
        }
      },
      shape: {
        transform: [
          {
            svgo: {
              plugins: [
                { removeTitle: true },
                { removeStyleElement: true },
                { removeAttrs: { attrs: 'fill' } },
                { removeXMLNS: true },
                { removeDimensions: true }
              ]
            }
          }
        ]
      },
      svg: {
        xmlDeclaration: false
      }
    }

    console.log(folder)
    return src(folder + '/*.svg')
      .pipe(gulpSvgSprite(modeView))
      .pipe(dest('.'))
  })

  done()
}
