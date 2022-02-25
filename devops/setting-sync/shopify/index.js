import ShopifyApi from 'shopify-api-node'
import colors from 'colors'

/**
 * Class wrapper fo the Shopify node library
 */
class Shopify {
  constructor ({ password, store, apiKey }) {
    this.count = 0
    this.resource = null
    this.shopify = new ShopifyApi({
      apiKey,
      password,
      shopName: store,
      autoLimit: {
        calls: 2,
        interval: 1000,
        bucketSize: 35
      }
    })
    this.shopify.on('callLimits', () => {
      return console.log(
        colors.green(`Shopify ${this.resource} request: ${++this.count}`)
      )
    })
  }

  /**
 * Get all Shopify themes for the storefront
 * @returns Array
 */
  getThemes () {
    this.resource = 'themes'
    return this.shopify.theme.list({
      limit: 250,
      fields: 'id,name,role,updated_at'
    })
  }

  /**
 * Get all Shopify assets from key values
 * @param { keys: Array, id: integer }
 * @returns Array
 */
  getAssets ({ keys, id }) {
    this.resource = 'assets'
    return Promise.all(
      keys.map(({ key }) => this.shopify.asset.get(id, {
        asset: { key },
        fields: 'key,value'
      }))
    )
  }

  /**
 * Get a list of all asset keys from the Shopify asset API
 * @param themeId: integer
 * @returns Array
 */
  async getAssetKeys (themeId) {
    this.resource = 'assets keys'
    const results = []
    let params = {
      limit: 250,
      fields: 'key'
    }

    do {
      const assets = await this.shopify.asset.list(themeId, params)
      assets.forEach(key => results.push(key))
      params = assets.nextPageParameters
    } while (params !== undefined)

    return results
      .filter(({ key }) => {
        return (key.includes('templates') || key.includes('settings_data')) && key.includes('.json')
      })
  }
}

export default Shopify
