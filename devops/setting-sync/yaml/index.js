import YAML from 'yaml'
import fs from 'fs'
import path from 'path'

/**
 * Get YAML file containing Shopify private app credentials
 * @returns Object
 */
export function getConfig () {
  const filePath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'sync.yml'
  )
  const file = fs.readFileSync(filePath, 'utf8')
  return YAML.parse(file)
};
