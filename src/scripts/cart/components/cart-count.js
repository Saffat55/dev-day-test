(() => {
  if (typeof window.customElements.get('cart-count') !== 'undefined') { return }
  window.customElements.define('cart-count', class CollectionItemElement extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        this.innerHTML = cartData.item_count
      })
    }
  })
})()
