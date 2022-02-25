import YAML from 'yaml'

const term = require('terminal-kit').terminal
const fs = require('fs-extra')
const replace = require('replace-in-file')
const { Octokit } = require('octokit')

let octokit = null
const repoPath = '/repos/pointercreative/pointer-section-templates'

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

const configOctoKit = async () => {
  const ymlFile = fs.readFileSync('dev-tokens.yml', 'utf8')
  const { GITHUB_TOKEN } = YAML.parse(ymlFile)
  return await new Octokit({ auth: GITHUB_TOKEN })
}

const input = async (message) => {
  term.cyan(`${message}: `)
  return await term.inputField({ minLength: 1 }).promise
}

const generateFile = async (fileData, newPath, sectionFilename, sectionTitle, oldFilename) => {
  if (fileData.name === '_.json') { return }
  const rawData = await octokit.request(`GET ${repoPath}/contents/${fileData.path}`, {
    mediaType: {
      format: 'raw'
    }
  })

  const newFilePath = `${newPath}/${fileData.name.replace(oldFilename, sectionFilename)}`
  await fs.writeFileSync(newFilePath, rawData.data)

  return await replace({
    files: newFilePath,
    from: [new RegExp(oldFilename, 'g'), /SECTION_TITLE/g],
    to: [sectionFilename, sectionTitle]
  })
}

const generateDependencyFile = async (depFilename, key) => {
  const localPath =
    (key === 'fragments' && `src/views/fragments/${depFilename}`) ||
    (key === 'snippets' && `src/views/snippets/${depFilename.split('.')[0]}/${depFilename}`) ||
    (key === 'svgs' && `src/assets/svgs/${depFilename}`)

  const depRepoPath =
    (key === 'fragments' && `.section-dependencies/fragments/${depFilename}`) ||
    (key === 'snippets' && `.section-dependencies/snippets/${depFilename.split('.')[0]}/${depFilename}`) ||
    (key === 'svgs' && `.section-dependencies/svgs/${depFilename}`)

  if (!localPath || !repoPath) {
    term.yellow(`\nSkipping <${key}>. Not a valid dependency key`)
    return
  }

  const checkExists = await fs.pathExists(localPath)
  if (checkExists) {
    term.blue(`\n<${depFilename}> already exits in project: ${localPath}`)
    return
  }

  const depRawData = await octokit.request(`GET ${repoPath}/contents/${depRepoPath}`, {
    mediaType: {
      format: 'raw'
    }
  }).catch(() => {
    term.red(`\n<${depFilename}> could not be found in project or in repo .section-dependencies/${key}`)
  })

  if (typeof depRawData === 'undefined' || !depRawData) { return }

  await fs.writeFileSync(localPath, depRawData.data)
  term.blue(`\n<${depFilename}> created in project: ${localPath}`)

  return true
}

const findDependencies = async (dependenciesFile) => {
  if (typeof dependenciesFile === 'undefined') { return }
  term.green('\n\nSearching for section dependencis...')
  const rawData = await octokit.request(`GET ${repoPath}/contents/${dependenciesFile.path}`, {
    mediaType: {
      format: 'raw'
    }
  })

  const jsonData = JSON.parse(rawData.data)
  if (Object.keys(jsonData).length === 0) {
    term.green('\nNo section dependencis found')
    return
  }

  for (const key of Object.keys(jsonData)) {
    if (key === '_note') { continue }
    await Promise.all(jsonData[key].map((depFilename) => generateDependencyFile(depFilename, key)))
  }

  if (typeof jsonData._note !== 'undefined') {
    term.bgDefaultColor('\n\n')
    term.brightMagenta.bold('Section Template Note:')
    term.defaultColor(`\n${jsonData._note}\n`)
  }

  return true
}

(async () => {
  try {
    cancelKeys()
    octokit = await configOctoKit()

    const repoResponse = await octokit.request(`GET ${repoPath}/contents`)
    const repoDirectories = repoResponse.data.filter((repo) => repo.type === 'dir')
    if (repoDirectories.length === 0) { throw Error('No Section Templates Exist') }
    const dirList = repoDirectories
      .map((dir) => dir.path)
      .filter((dir) => dir !== '.section-dependencies')

    term.cyan('Select a section template:')
    const templateSelectedOption = await term.gridMenu(dirList).promise
    const dirResponse = await octokit.request(`GET ${repoPath}/contents/${templateSelectedOption.selectedText}`)

    term.green(`\nBuilding section from <${templateSelectedOption.selectedText}> template.`)
    const sectionFilename = await input('\nInput new section filename')
    const newPath = `src/views/sections/${sectionFilename}`
    const exists = await fs.pathExists(newPath)
    if (exists) { throw Error(`${sectionFilename} already exists`) }
    const sectionTitle = await input('\nInput new section title')

    await fs.mkdirSync(newPath, { recursive: true })
    await Promise.all(dirResponse.data.map((fileData) => generateFile(fileData, newPath, sectionFilename, sectionTitle, templateSelectedOption.selectedText)))
    await findDependencies(dirResponse.data.find((fileData) => fileData.name === '_.json'))

    term.green(`\nSuccess! <${sectionFilename}> has been created from the <${templateSelectedOption.selectedText}> template.`)
    return terminate()
  } catch (error) {
    term.red(`\n${error}`)
    return terminate(1)
  }
})()
