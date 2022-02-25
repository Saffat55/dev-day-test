const fs = require('fs')
const path = require('path')
const pluralize = require('pluralize')
const term = require('terminal-kit').terminal
const texturePacker = require('free-tex-packer-core')

const pathSprites = path.resolve(__dirname, '../../src/assets/sprites')
const pathDist = path.resolve(__dirname, '../../dist')
const pathDistSnippets = path.resolve(pathDist, './snippets')
const pathDistAssets = path.resolve(pathDist, './assets')

const exporter = {
  fileExt: 'json',
  template: path.resolve(__dirname, './exporter-template.mst')
}

const options = {
  width: 1920,
  height: 1920,
  fixedSize: false,
  allowRotation: false,
  detectIdentical: false,
  allowTrim: false,
  packer: 'MaxRectsBin',
  packerMethod: 'BottomLeftRule',
  exporter,
  removeFileExtension: true
}

const generateSpriteFiles = async (name, directory) => {
  const files = await fs.promises.readdir(directory)
  if (files.length <= 0) return

  let images = []

  const filenameToIndex = (filename) => {
    const splitFileName = filename.split('-')
    return parseInt(splitFileName[splitFileName.length - 1]?.split('.')?.[0], 10)
  }

  const filenameToExtension = (filename) => {
    const splitFileName = filename.split('.')
    return splitFileName.length > 1 ? splitFileName[1] : 'jpg'
  }

  options.textureName = name
  options.textureFormat = filenameToExtension(files[0])

  // create image array
  for (const file of files) {
    const filePath = path.join(directory, file)
    images.push({ path: file, contents: fs.readFileSync(filePath) })
  }

  // ensure proper sort order
  images = images.sort((a, b) => {
    const indexA = filenameToIndex(a.path) || 0
    const indexB = filenameToIndex(b.path) || 0

    return (indexA - indexB)
  })

  // generate sprite assets
  texturePacker(images, options, (files, error) => {
    if (error) {
      throw Error(`Generating Sprite '${name}' failed`, error)
    } else {
      let sheets = []

      for (const item of files) {
        const ext = item.name.split('.')[1]

        // add json data to array
        if (ext === 'json') {
          sheets.push(JSON.parse(item.buffer))
        } else {
          // ensure single sheets still have number suffix
          const fileName = /-+\d/gm.test(item.name)
            ? item.name
            : item.name.replace('.', '-0.')

          // save image file to dist
          const writePath = path.resolve(pathDistAssets, `sprite-${fileName}`)
          fs.writeFileSync(writePath, item.buffer, (err) => {
            if (err) throw err
          })
        }
      }

      // fix sheet sorting
      sheets = sheets.sort((a, b) => {
        const indexA = filenameToIndex(a.meta.image) || 0
        const indexB = filenameToIndex(b.meta.image) || 0

        return (indexA - indexB)
      })

      // create frames data array from texturePacker output
      const framesArray = []

      sheets.forEach(({ frames, meta: { size } }, index) => {
        frames.forEach(({ frame: { x, y, w, h } }) => {
          framesArray.push({
            x,
            y,
            w,
            h,
            sheet: {
              index,
              h: size.h,
              w: size.w
            }
          })
        })
      })

      let aspectString = '100%'

      // get first frame sourceSize
      const { w: tileWidth, h: tileHeight } = sheets[0]?.frames?.[0]?.sourceSize

      // compute aspect ratio %
      if (tileWidth && tileHeight) {
        aspectString = ((tileHeight / tileWidth) * 100).toFixed(2) + '%'
      }

      const writePath = path.resolve(pathDistSnippets, `sprite-${name}.liquid`)
      const spriteData = {
        sheetCount: `%%${sheets.length}%%`,
        imageExtension: `&&${options.textureFormat}&&`,
        aspectRatio: `**${aspectString}**`,
        frames: framesArray
      }

      fs.writeFileSync(writePath, JSON.stringify(spriteData), (err) => {
        if (err) throw err
      })
    }
  })
}

(async () => {
  try {
    if (!fs.existsSync(pathSprites)) return

    const files = await fs.promises.readdir(pathSprites)
    let spriteCount = 0

    if (files.length > 0) term.green('Generating sprite assets... \n')

    // generate sprite files for each sprite directory
    for (const file of files) {
      const filePath = path.join(pathSprites, file)
      const stat = await fs.promises.stat(filePath)

      if (stat.isDirectory()) {
        spriteCount++
        await generateSpriteFiles(file, filePath)
      }
    }

    term.green(`${pluralize('sprite', spriteCount, true)} created. \n\n`)
  } catch (e) {
    // Catch anything bad that happens
    console.error('Error generating sprites', e)
  }
})()
