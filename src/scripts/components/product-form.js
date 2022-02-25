window.product = window.product || {}

const product = window.product

product.form = (options) => {
  const moneyFormat = theme.moneyFormat
  const variant = options.variant
  const currentProduct = document.getElementById(options.selector.domIdPrefix).closest('[data-product]')
  const productImageWrappers = currentProduct.querySelectorAll('[data-product-image-wrapper]')
  const productSubmit = currentProduct.querySelector('[data-product-submit]')
  const productSubmitText = currentProduct.querySelector('[data-product-submit-text]')
  const productPriceElements = currentProduct.querySelectorAll('[data-product-price]')
  const comparePrice = currentProduct.querySelector('[data-product-compare-price]')

  if (variant) {
    if (productImageWrappers.length && variant.featured_image) {
      productImageWrappers.forEach((productImageWrapper) => {
        const wrapperImageId = parseFloat(productImageWrapper.getAttribute('data-image-id'))

        if (wrapperImageId === variant.featured_image.id) {
          productImageWrapper.classList.remove('hide')
        } else {
          productImageWrapper.classList.add('hide')
        }
      })
    }

    if (variant.available) {
      productSubmit.classList.remove('disabled')
      productSubmit.removeAttribute('disabled')
      productSubmitText.innerHTML = theme.strings.addToCart
    } else {
      productSubmit.classList.add('disabled')
      productSubmit.setAttribute('disabled', true)
      productSubmitText.innerHTML = theme.strings.soldOut
    }

    productPriceElements.forEach((productPriceElement) => {
      productPriceElement.innerHTML = Shopify.formatMoney(variant.price, moneyFormat)
    })

    if (comparePrice) {
      if (variant.compare_at_price > variant.price) {
        comparePrice.innerHTML = Shopify.formatMoney(variant.compare_at_price, moneyFormat)
        comparePrice.classList.remove('hide')
      } else {
        comparePrice.classList.add('hide')
      }
    }
  } else {
    productSubmit.classList.add('disabled')
    productSubmit.setAttribute('disabled', true)
    productSubmitText.innerHTML = theme.strings.unavailable
  }
}
