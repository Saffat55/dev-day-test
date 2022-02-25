import fs from 'fs'
import path from 'path'
import colors from 'colors'

/**
 * fs.writeFile wrapped in a promise
 * @param { filePath: String, data: Object }
 * @returns String
 */
function writeToFile ({ filePath, value }) {
  return new Promise((resolve, reject) => {
    return fs.writeFile(filePath, value, (err) => {
      if (err) { return reject(err) }
      const message = `Saved to: ${filePath}`
      console.log(colors.green(message))
      return resolve(message)
    })
  })
}

/**
 * Process array of Shopify assets into local files
 * @param assets (Array)
 * @returns Array
 */
export function writeFilesToSource (assets) {
  return Promise.all(assets.map(({ key, value }) => {
    return writeToFile({
      filePath: path.join(
        __dirname,
        '..',
        '..',
        '..',
        'src',
        key.includes('templates') ? `views/${key}` : key
      ),
      value
    })
  }))
}
