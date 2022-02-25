const themeKit = require('@shopify/themekit')
const argv = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const path = require('path')
const replace = require('replace-in-file')
const colors = require('colors')

const env = argv.env || 'development'

// colored terminal logging theme
colors.setTheme({
  log: ['yellow', 'bgBlack'],
  error: ['red', 'bgBlack']
})

// themekit config
const tkFlags = {
  noIgnore: true,
  env
}

const tkOptions = {
  logLevel: 'silent',
  cwd: path.resolve(__dirname, './')
}

// regex replace LSEPS in file
const replaceLSEPS = () => {
  return replace({
    files: path.resolve(__dirname, 'dist/config/settings_data.json'),
    from: /\u2028/g,
    to: '',
    countMatches: true
  })
    .catch(() => {
      throw TypeError('Error replacing strings')
    })
}

// download or deploy settings_data.json
const themekitConfig = (mode) => {
  if (mode !== 'download' && mode !== 'deploy') throw TypeError('Invalid mode specified for themekitConfig()')

  return themeKit.command(mode,
    {
      ...tkFlags,
      files: ['config/settings_data.json']
    },
    tkOptions
  )
    .catch(() => {
      throw TypeError(`Error ${mode}ing settings_data.json`)
    })
}

// custom colored logging messages
const logCustom = (msg, mode = 'log') => {
  const msgString = ` LSEP DESTROYER: ${msg} `

  if (mode === 'error') {
    console.error(colors.error(msgString))
  } else {
    console.log(colors.log(msgString))
  }
}

(async () => {
  fs.copyFile(path.resolve(__dirname, '../../config.yml'), path.resolve(__dirname, 'config.yml'), async (err) => {
    if (err) {
      return logCustom('Error copying config.yml', 'error')
    }

    try {
      logCustom('Searching for targets...')

      // download, replace, & deploy
      await themekitConfig('download')
      const results = await replaceLSEPS()

      if (results.length > 0) {
        const { numReplacements } = results[0]

        await themekitConfig('deploy')

        logCustom(numReplacements > 0
          ? `${numReplacements} LSEPS have been destroyed`
          : 'No LSEPS found'
        )
      }

      // cleanup, remove downloaded/copied files
      fs.unlinkSync(path.resolve(__dirname, 'config.yml'))
      fs.rmdirSync(path.resolve(__dirname, './dist/config'), { recursive: true })
    } catch (error) {
      logCustom(error.message, 'error')
    }
  })
})()
