const term = require('terminal-kit').terminal
const fs = require('fs-extra')
const replace = require('replace-in-file')

const cancelKeys = () => {
  term.on('key', (name, matches, data) => {
    if (name !== 'CTRL_C') { return }
    term.red('\nCanceled')
    terminate()
  })
}

const terminate = (code = 0) => {
  setTimeout(() => {
    term.grabInput(true)
    term.green('\n')
    process.exit(code)
  }, 100)
}

const input = async (message) => {
  term.cyan(`${message}: `)
  return await term.inputField({ minLength: 1 }).promise
}

const updateFile = async (name, oldName, newName, newPath) => {
  const newFilePath = `${newPath}/${name.replace(oldName, newName)}`
  await fs.rename(`${newPath}/${name}`, newFilePath)
  return await replace({
    files: newFilePath,
    from: new RegExp(oldName, 'g'),
    to: newName
  })
}

(async () => {
  try {
    cancelKeys()

    const sectionFiles = await fs.readdir('src/views/sections')
    term.cyan('Section folder to clone:')
    const selectedOption = await term.gridMenu(sectionFiles).promise
    const existingFolder = selectedOption.selectedText
    const newSectionName = await input('\nNew Section Filename')

    const oldPath = `src/views/sections/${existingFolder}`
    const newPath = `src/views/sections/${newSectionName}`

    const exists = await fs.pathExists(newPath)
    if (exists) { throw Error(`${newSectionName} already exists`) }

    const verifyInput = await input(`\nCreate ${newSectionName} section from ${existingFolder}? (y/n)`)
    const cloneGo = verifyInput.toLowerCase()
    if (cloneGo !== 'yes' && cloneGo !== 'y') {
      term.red('\nCanceled')
      return terminate()
    }

    await fs.copy(oldPath, newPath)
    const files = await fs.readdir(newPath)
    await Promise.all(files.map(file => updateFile(file, existingFolder, newSectionName, newPath)))

    term.green(`\nSuccess! ${existingFolder} has been cloned to ${newSectionName}.`)
    return terminate()
  } catch (error) {
    term.red(`\n${error}`)
    return terminate(1)
  }
})()
