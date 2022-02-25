const path = require('path')
const themeKit = require('@shopify/themekit')
const term = require('terminal-kit').terminal
const shell = require('shelljs')
const YAML = require('yaml')
const fs = require('fs')

const pathDist = path.resolve(__dirname, '../../dist')
const pathConfig = path.resolve(__dirname, '../../config.yml')

// config & helpers
const tkOptions = {
  logLevel: 'silent',
  cwd: path.resolve(__dirname, '../../')
}

const terminate = () => {
  setTimeout(() => {
    term.grabInput(false)
    process.exit()
  }, 100)
}

const runShellexec = (command, additionalError = '') => {
  const { code } = shell.exec(command)
  if (code !== 0) throw Error(`Failed running '${command}. ${additionalError}`)
}

const input = async (message) => {
  term.cyan(`${message}: `)
  return await term.inputField({ minLength: 1 }).promise
}

// init new theme and config
(async () => {
  try {
    term.on('key', (name, matches, data) => {
      if (name === 'CTRL_C' || name === 'ESCAPE') terminate()
    })

    term.cyan('\n\nThis will create a new Shopify theme & generate a new config.yml. \n')

    const warningOptions = [
      'Start theme setup',
      'Exit'
    ]

    const warningResponse = await term.singleColumnMenu(warningOptions).promise
    if (warningResponse.selectedIndex === 1) terminate()

    term.green('=============================\n')
    term.green('Building...\n')
    term.green('=============================\n')

    runShellexec('yarn build', 'Are there linting errors?')

    term.green('=============================\n')
    term.green('Generating new theme and config.yml...\n')
    term.green('=============================\n')

    const store = await input('Enter Store URL (test.myshopify.com)')
    const password = await input('\nEnter Store API Password (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)')
    const name = await input('\nEnter Your First Name (John)')

    const themeName = `[DEV - ${name}] - Pointer`

    term.green('\n=============================\n')
    term.green('Deploying new theme...\n')
    term.green('=============================\n')

    // remove existing config.yml if it exists
    if (fs.existsSync(pathConfig)) {
      fs.unlinkSync(pathConfig)
    }

    // create dist folder if doesn't exist
    if (!fs.existsSync(pathDist)) {
      fs.mkdirSync(pathDist)
    }

    await themeKit.command('new', {
      password,
      store,
      name: themeName,
      dir: pathDist
    }, tkOptions)

    const configFile = fs.readFileSync(pathConfig, 'utf8')
    const themekitConfig = YAML.parse(configFile)

    term.green('\n=============================\n')
    term.cyan(`'${themeName}' `)
    term.green('deployed')

    if (themekitConfig.development) {
      themekitConfig.development.ignore_files = ['config/settings_data.json', '*.js']

      themekitConfig.staging = { ...themekitConfig.development }
      themekitConfig.staging.ignore_files = ['config/settings_data.json']

      fs.writeFile(pathConfig, YAML.stringify(themekitConfig), (err) => {
        if (err) throw TypeError('Error updating config.yml')

        term.green(' & config.yml updated!\n')
      })
    }

    return terminate()
  } catch (error) {
    term.red(error)
    return terminate()
  }
})()
