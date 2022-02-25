import YAML from 'yaml'
import { csvTemplateJSON } from './csv-templates-json'

const term = require('terminal-kit').terminal
const fs = require('fs-extra')
const path = require('path')
const csv = require('csv-parser')
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

const input = async (message) => {
  term.cyan(`${message}: `)
  return await term.inputField({ minLength: 1 }).promise
}

const configOctoKit = async () => {
  const ymlFile = fs.readFileSync('dev-tokens.yml', 'utf8')
  const { GITHUB_TOKEN } = YAML.parse(ymlFile)
  return await new Octokit({ auth: GITHUB_TOKEN })
}

const getAvailiableSections = async () => {
  const repoResponse = await octokit.request(`GET ${repoPath}/contents`)
  const repoDirectories = repoResponse.data.filter((repo) => repo.type === 'dir')
  if (repoDirectories.length === 0) { throw Error('No Section Templates Exist') }
  return repoDirectories
    .map((dir) => dir.path)
    .filter((dir) => dir !== '.section-dependencies')
}

const generateCVS = async (csvFile) => {
  return await new Promise((resolve) => {
    const csvArray = []
    fs.createReadStream(csvFile)
      .pipe(csv({
        mapHeaders: ({ header, index }) => header.toLowerCase().replace(/ /g, '_')
      }))
      .on('data', (data) => csvArray.push(data))
      .on('end', () => {
        resolve(csvArray)
      })
  })
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
  if (checkExists) { return }

  const depRawData = await octokit.request(`GET ${repoPath}/contents/${depRepoPath}`, {
    mediaType: {
      format: 'raw'
    }
  }).catch(() => {
    term.red(`\n<${depFilename}> could not be found in project or in repo .section-dependencies/${key}`)
  })

  if (typeof depRawData === 'undefined' || !depRawData) { return }
  await fs.writeFileSync(localPath, depRawData.data)

  return true
}

const findDependencies = async (dependenciesFile, sectionFilename) => {
  if (typeof dependenciesFile === 'undefined') { return }
  const rawData = await octokit.request(`GET ${repoPath}/contents/${dependenciesFile.path}`, {
    mediaType: {
      format: 'raw'
    }
  })

  const jsonData = JSON.parse(rawData.data)
  if (Object.keys(jsonData).length === 0) { return }

  for (const key of Object.keys(jsonData)) {
    if (key === '_note') { continue }
    await Promise.all(jsonData[key].map((depFilename) => generateDependencyFile(depFilename, key)))
  }

  return true
}

const generateSection = async (section, availiableSections) => {
  const newPath = `src/views/sections/${section.section_filename}`
  const exists = await fs.pathExists(newPath)
  if (exists) {
    term.blue(`\nSkipping Section <${section.section_filename}>, section already exists.`)
    return null
  }

  if (!availiableSections.includes(section.section_template) && !exists) {
    throw Error(`<${section.section_template}> template could not be found in project or in repo.`)
  }

  await fs.mkdirSync(newPath, { recursive: true })
  const dirResponse = await octokit.request(`GET ${repoPath}/contents/${section.section_template}`)
  if (typeof dirResponse.data === 'undefined' || !dirResponse.data) {
    throw Error(`Error getting <${section.section_template}> template data.`)
  }

  term.blue(`\nCreating Section <${section.section_filename}>.`)
  await Promise.all(dirResponse.data.map(
    (fileData) => generateFile(
      fileData,
      newPath,
      section.section_filename,
      section.section_title,
      section.section_template
    )
  ))

  await findDependencies(dirResponse.data.find((fileData) => fileData.name === '_.json'), section.section_filename)

  return section
}

(async () => {
  try {
    cancelKeys()
    octokit = await configOctoKit()
    const availiableSections = await getAvailiableSections()

    const csvTemplates = await fs.readdir('devops/csv-templates/csv')
    if (csvTemplates.length === 0) { throw Error('No CSV found in "devops -> csv-templates -> csv"') }

    term.cyan('Select CSV to generate sections from:')
    const selectedCsvTemplate = await term.singleColumnMenu(csvTemplates).promise
    const cvsPath = `devops/csv-templates/csv/${selectedCsvTemplate.selectedText}`
    if (path.basename(cvsPath).split('.')[1].toLocaleLowerCase() !== 'csv') {
      throw Error('Invalid file type, must be a CSV')
    }

    const csvResult = await generateCVS(cvsPath)
    const sectionsToGenerate = [...new Set(csvResult.map(data => data.section_filename))]
    const templatesToGenerate = [...new Set(csvResult.map(data => data.template))]

    const overrwriteList = templatesToGenerate.filter(data => data !== '')
    if (overrwriteList.length > 0) {
      term.yellow('\n\nWarning, the following JSON templates will be overwritten if they already exist.')
      term.magenta(`\n${overrwriteList.join(', ')}`)
      term.cyan('\n\nDo you want to continue? [y|n]: ')
      const approval = await term.yesOrNo({ yes: ['y'], no: ['n'] }).promise
      if (!approval) {
        term.red('\nCanceled')
        terminate()
      }
    }

    await Promise.all(sectionsToGenerate.map(async (sectionFilename) => {
      const section = csvResult.find(data => data.section_filename === sectionFilename)
      if (typeof section === 'undefined') { return }
      await generateSection(section, availiableSections)
      return section
    }))

    await Promise.all(templatesToGenerate.map(async (templateFilename) => {
      const sections = csvResult.filter(data => data.template === templateFilename)
      if (sections.length === 0 || templateFilename.length === 0) { return }
      await fs.writeFileSync(`src/views/templates/${templateFilename}.json`, csvTemplateJSON(sections))
    }))

    term.green('\nSuccess!')
    return terminate()
  } catch (error) {
    term.red(`\n${error}`)
    return terminate(1)
  }
})()
