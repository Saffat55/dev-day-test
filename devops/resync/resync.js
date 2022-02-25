const shell = require('shelljs')
const path = require('path')
const term = require('terminal-kit').terminal
const YAML = require('yaml')
const fs = require('fs')

const pathProject = path.resolve(__dirname, '../../')
const pathDist = path.resolve(pathProject, 'dist')
const pathGitignore = path.resolve(pathProject, '.gitignore')
const pathConfig = path.resolve(pathProject, 'config.yml')

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

(async () => {
  try {
    term.on('key', (name, matches, data) => {
      if (name === 'CTRL_C' || name === 'ESCAPE') terminate()
    })

    // Get available environments from config.yml
    const file = fs.readFileSync(pathConfig, 'utf8')
    const themekitConfig = YAML.parse(file)

    const environments = Object.entries(themekitConfig)
    if (!environments || environments.length <= 0) throw Error('Error parsing environments')

    const envOptions = environments.map((env) => {
      const [name, { theme_id: themeId }] = env
      return `${name} (${themeId})`
    })

    term.green('=============================\n')
    term.green('Resync theme...\n')
    term.green('=============================\n')

    term.cyan('\nSelect which resync script to run: \n')

    const resyncOptions = [
      'A. Start Resync (track /dist, download theme, etc)',
      'B. Finish/Cleanup Resync (untrack /dist, commit)'
    ]
    const { selectedIndex } = await term.singleColumnMenu(resyncOptions).promise

    // run shell commands from project root
    shell.cd(pathProject)

    if (selectedIndex === 0) {
      term.cyan('\n\nMake sure your git history is clean (no active changes) \nand you\'re on a new branch (e.g. resync/05-22-2021): \n')

      const warningOptions = [
        'Yep, start resync',
        'Exit'
      ]

      const warningResponse = await term.singleColumnMenu(warningOptions).promise
      if (warningResponse.selectedIndex === 1) terminate()

      term.cyan('\n\nSelect theme to download/sync from: \n')

      // get desired env to download from
      const { selectedIndex } = await term.singleColumnMenu(envOptions).promise
      const selectedEnv = {
        development: themekitConfig[environments[selectedIndex][0]]
      }

      // update env directory to self & update ignore files
      selectedEnv.development.directory = './'
      selectedEnv.development.ignore_files = ['config/settings_data.json']

      // remove dist from .gitignore
      term.green('\nRemoving /dist from .gitignore...\n')
      shell.sed('-i', /^.*\/dist.*$/, '/dist-backup', pathGitignore)

      // build
      term.green('\nBuilding theme...\n')
      runShellexec('yarn build', 'Are there linting errors?')

      // add/commit
      term.green('\nCommitting dist folder...\n')
      runShellexec('git add .')
      runShellexec('git commit -m "Track dist folder"', 'Are there linting errors?')

      // push
      term.green('\nPushing to repo...\n')
      runShellexec('git push origin HEAD')

      // create new config.yml with selected env
      fs.writeFileSync(path.resolve(pathDist, 'config.yml'), YAML.stringify(selectedEnv))

      // download theme
      shell.cd(pathDist)
      term.green('\nDownloading theme ...\n')
      runShellexec('theme download')

      term.green('\n=============================\n')
      term.green('Sync Part A Complete. \nYou can now use diff comparison and copy over any files/changes to the /src directory. Run the Part B script once done.\n(No need to add/commit any files as this is done by the script)\n')
      term.green('=============================\n')
    } else {
      // re add dist to .gitignore
      term.green('\nRe-adding /dist to .gitignore...\n')
      shell.sed('-i', /^.*\/dist-backup.*$/, '/dist', pathGitignore)

      // git cleanup
      term.green('\nGit cleanup ...\n')
      runShellexec('git rm --cached dist -r')
      runShellexec('git add .')
      runShellexec('git commit -m "Resync with shop"', 'Are there linting errors?')
      term.green('\nPushing to repo...\n')
      runShellexec('git push origin HEAD')

      term.green('\n=============================\n')
      term.green('Resync Complete!\n')
      term.green('=============================\n')
    }

    return terminate()
  } catch (error) {
    term.red(error)
    return terminate()
  }
})()
