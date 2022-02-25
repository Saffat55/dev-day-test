import {
  selectTheme,
  confirmUpdate
} from './inquirer'
import colors from 'colors'
import Shopify from './shopify'
import { getConfig } from './yaml'
import { writeFilesToSource } from './files';

/**
 * Main function
 * Prompt the user to select a theme file and download the required JSON
 * files to overwrite the existing files in the src directory.
 */
(async () => {
  try {
    // get parsed YAML config file
    const config = getConfig()
    // instantiate Shopify class
    const shopify = new Shopify(config)
    // get a list of installed shopify themes
    const themes = await shopify.getThemes()
    // select a Shopify theme from the list
    const { id } = await selectTheme(themes)
    // confirm user wants to overwrite all json files
    await confirmUpdate()
    // get all json template keys
    const keys = await shopify.getAssetKeys(id)
    // if there are no keys returned the file is not a 2.0 theme file: throw error
    if (!keys.length) { throw new Error('File is not a 2.0 theme.') }
    // get all Shopify json assets with payloads
    const assets = await shopify.getAssets({ keys, id })
    // write payloads to local files in src dir
    await writeFilesToSource(assets)
  } catch (error) {
    console.error(colors.red(error.message))
  }
  return process.exit()
})()
