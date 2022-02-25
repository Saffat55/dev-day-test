import YAML from 'yaml'
import { figmaStylesSCSS } from './figma-styles-scss'

const axios = require('axios')
const term = require('terminal-kit').terminal
const fs = require('fs-extra')

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

const getNodes = async (figmaFileKey) => {
  const ymlFile = fs.readFileSync('dev-tokens.yml', 'utf8')
  const { FIGMA_TOKEN } = YAML.parse(ymlFile)
  if (typeof FIGMA_TOKEN === 'undefined' || !FIGMA_TOKEN) { throw Error('FIGMA_TOKEN does not exist in dev-tokens.yml') }

  const figmaRes = await axios.get(`https://api.figma.com/v1/files/${figmaFileKey}/styles`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN }
  })
    .then((response) => { return response.data.meta.styles })
    .catch((error) => { throw Error(error) })

  const nodesID = figmaRes.map(node => node.node_id).join(',')

  return await axios.get(`https://api.figma.com/v1/files/${figmaFileKey}/nodes?ids=${nodesID}`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN }
  })
    .then((response) => { return response.data.nodes })
    .catch((error) => { throw Error(error) })
}

(async () => {
  try {
    cancelKeys()

    const figmaFileKey = await input('\nInput Figma File Key')
    const figmaNodes = await getNodes(figmaFileKey)

    const styles = Object.keys(figmaNodes).map(nodeKey => figmaNodes[nodeKey].document)
    await fs.writeFileSync('src/styles/helpers/_figma-styles.scss', figmaStylesSCSS(styles))

    const fontFamilies = styles.map((style) => {
      if (style.type !== 'TEXT') { return null }
      return style.style.fontFamily
    })

    term.blue('\n\nThe following font families were detected. \nPlease ensure related font files are included.')
    term.magenta(`\n${[...new Set(fontFamilies)].filter(value => value).join(', ')}`)

    term.green('\n\nSuccess! Figma styles generated in src/styles/helpers/_figma-styles.scss')
    return terminate()
  } catch (error) {
    term.red(`\n${error}`)
    return terminate(1)
  }
})()
