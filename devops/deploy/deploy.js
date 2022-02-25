const argv = require('minimist')(process.argv.slice(2))
const shell = require('shelljs')
const term = require('terminal-kit').terminal
const path = require('path')

const env = argv.env || 'development'
const pathProject = path.resolve(__dirname, '../../')

const terminate = () => {
  term.grabInput(false)
  process.exit()
}

const runShellexec = (command, additionalError = '') => {
  const { code } = shell.exec(command)
  if (code !== 0) throw Error(`Failed running '${command}. ${additionalError}`)
}

(async () => {
  try {
    term.green('=============================\n')
    term.green(`Deploying theme to ${env}...\n`)
    term.green('=============================\n')

    // run shell commands from project root
    shell.cd(pathProject)

    term.cyan('\nBuilding...\n')
    runShellexec('yarn build', 'Are there linting errors?')

    term.cyan('\nUploading...\n')
    runShellexec(`npx shopify-themekit deploy --env=${env}`)

    term.cyan('\nValidating...\n')
    runShellexec(`yarn lsep --env=${env}`)

    term.green('\n=============================\n')
    term.green('Theme Deployed! \n')
    term.green('=============================\n')

    terminate()
  } catch (error) {
    term.red(error)
    terminate()
  }
})()
