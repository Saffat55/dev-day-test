import { imageSize } from '@scripts/components/imageSize'

(() => {
  if (typeof window.customElements.get('cart-items') !== 'undefined') { return }
  window.customElements.define('cart-items' , class CollectionItemElement extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        this.buildList(cartData)
      })
    }

    buildList (cartData) {
      this.innerHTML = ''
      cartData.items.forEach((item) => {
        this.append(this.newCartItemElement(item))
      })
    }

    newCartItemElement (item) {
      const cartItemElm = document.createElement('cart-item')
      cartItemElm.setAttribute('data-cart-item', '')
      cartItemElm.setAttribute('data-key', item.key)
      cartItemElm.setAttribute('data-id', item.id)
      cartItemElm.setAttribute('data-product-id', item.product_id)
      cartItemElm.innerHTML = cartItemTemplate(item)
      return cartItemElm
    }
  })

  if (typeof window.customElements.get('cart-item') !== 'undefined') { return }
  window.customElements.define('cart-item' , class CollectionItemElement extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        this.innerHTML = cartData.cartItemsTemplate
      })
    }
  })
})()

const cartItemTemplate = (item) => {
  console.log(item)

  return `
    <div class="cart-item">
      <img src="${imageSize(item.image || item.featured_image.url, 800)}" width="800" height="800" loading="lazy" alt="Image of ${item.title}">
      ${item.title}
    </div>
  `
}
