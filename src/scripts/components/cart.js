function addToCart () {
  const productSubmitButtons = document.querySelectorAll('[data-product-submit]')

  if (!productSubmitButtons) { return }

  productSubmitButtons.forEach((productSubmitButton) => {
    productSubmitButton.addEventListener('click', () => {
      const lineItemVariantId = parseInt(productSubmitButton.closest('[data-product-form]').querySelector('[data-product-select]').value, 10)
      const lineItemQuantity = 1
      const lineItemProperties = {}
      const formInputs = productSubmitButton.closest('[data-product-form]').querySelectorAll('input, select, textarea')

      if (formInputs.length) {
        formInputs.forEach((formInput) => {
          const nameAttr = formInput.getAttribute('name')
          const typeAttr = formInput.getAttribute('type')

          if (nameAttr && nameAttr.indexOf('properties') >= 0) {
            const propertyName = nameAttr.split('[')[1].replace(']', '')
            let propertyValue = ''

            if (typeAttr && (typeAttr === 'radio' || typeAttr === 'checkbox')) {
              if (formInput.checked === true) {
                propertyValue = formInput.value
              }
            } else {
              propertyValue = formInput.value
            }

            if (propertyValue !== '') {
              lineItemProperties[propertyName] = propertyValue
            }
          }
        })
      }

      const lineItem = {
        id: lineItemVariantId,
        quantity: lineItemQuantity,
        properties: lineItemProperties
      }

      fetch('/cart/add.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'xmlhttprequest'
        },
        body: JSON.stringify(lineItem)
      }).then((response) => {
        return response.json()
      }).then((result) => {
        if (result.status) {
          throw new Error(result.description)
        }

        const ajaxCartContent = document.querySelector('[data-ajaxcart-content]')

        if (ajaxCartContent) {
          const openDrawer = true
          reloadCart(openDrawer)
        } else {
          window.location.href = '/cart'
        }

        return null
      }).catch((error) => {
        alert(error)
      })
    })
  })
}

function updateLineItem (lineItemKey, lineItemQuantity) {
  const lineItem = {
    id: lineItemKey,
    quantity: lineItemQuantity
  }

  fetch('/cart/change.js', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'xmlhttprequest'
    },
    body: JSON.stringify(lineItem)
  }).then((response) => {
    return response.json()
  }).then((cart) => {
    const currentLineItemCount = document.querySelector('[data-ajaxcart-content]') ? parseFloat(document.querySelector('[data-ajaxcart-content]').getAttribute('data-line-item-count')) : parseFloat(document.querySelector('[data-cart-content]').getAttribute('data-line-item-count'))
    const lineItems = cart.items
    let matchingKey = false

    lineItems.forEach((item) => {
      if (item.key === lineItemKey) {
        matchingKey = true
      }
    })

    if (currentLineItemCount === cart.items.length && matchingKey === true) {
      updateCart(lineItemKey, cart)
    } else {
      reloadCart()
    }

    return null
  }).catch((error) => {
    console.log(error)
  })
}

function removeLineItem () {
  document.addEventListener('click', (event) => {
    if (!event.target.hasAttribute('data-line-item-remove')) { return }
    event.preventDefault()

    const lineItemKey = event.target.getAttribute('data-line-item-key')
    updateLineItem(lineItemKey, 0)
  })
}

function updateCart (lineItemKey, cart) {
  const lineItems = cart.items
  const subTotals = document.querySelectorAll('[data-cart-subtotal]')

  lineItems.forEach((lineItem) => {
    if (lineItem.key !== lineItemKey) { return }

    const lineItemOriginalPrices = document.querySelectorAll(`[data-line-item-key="${lineItem.key}"] [data-line-item-original-price]`)
    const lineItemPrices = document.querySelectorAll(`[data-line-item-key="${lineItem.key}"] [data-line-item-price]`)
    const lineItemQuantityInputs = document.querySelectorAll(`[data-line-item-key="${lineItem.key}"] [data-quantity-input]`)

    lineItemOriginalPrices.forEach((lineItemOriginalPrice) => {
      lineItemOriginalPrice.innerHTML = Shopify.formatMoney(lineItem.original_line_price, theme.moneyFormat)
    })

    lineItemPrices.forEach((lineItemPrice) => {
      lineItemPrice.innerHTML = Shopify.formatMoney(lineItem.final_line_price, theme.moneyFormat)
    })

    lineItemQuantityInputs.forEach((lineItemQuantityInput) => {
      lineItemQuantityInput.value = lineItem.quantity
    })
  })

  subTotals.forEach((subTotal) => {
    subTotal.innerHTML = Shopify.formatMoney(cart.total_price, theme.moneyFormat)
  })
}

function reloadCart (openDrawer) {
  const cartContent = document.querySelector('[data-cart-content]')
  const ajaxCartContent = document.querySelector('[data-ajaxcart-content]')
  const cartToggle = document.querySelector('[data-drawer-toggle="cart"]')
  const cartEndpoint = ajaxCartContent ? '/cart?view=ajaxcart-content' : '/cart'

  fetch(cartEndpoint, {
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'xmlhttprequest',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0
    }
  }).then((response) => {
    return response.text()
  }).then((html) => {
    const responseDOMParser = new window.DOMParser()
    const responseDocument = responseDOMParser.parseFromString(html, 'text/html')
    const responseDocumentCart = responseDocument.querySelector('[data-cart-content]')
    const responseDocumentAjaxcart = responseDocument.querySelector('[data-ajaxcart-content]')

    if (ajaxCartContent) {
      ajaxCartContent.innerHTML = responseDocumentAjaxcart.innerHTML
      ajaxCartContent.setAttribute('data-line-item-count', responseDocumentAjaxcart.getAttribute('data-line-item-count'))
    }

    if (cartContent) {
      cartContent.innerHTML = responseDocumentCart.innerHTML
      cartContent.setAttribute('data-line-item-count', responseDocumentCart.getAttribute('data-line-item-count'))
    }

    if (openDrawer && cartToggle) {
      cartToggle.click()
    }

    return null
  }).catch((error) => {
    console.log(error)
  })
}

function quantitySelector () {
  document.addEventListener('click', (event) => {
    if (!event.target.hasAttribute('data-quantity-adjust')) { return }

    const quantityInput = event.target.closest('[data-quantity-selector]').querySelector('[data-quantity-input]')
    const lineItemKey = quantityInput.getAttribute('data-line-item-key')
    const lineItemMaxQuantity = parseFloat(quantityInput.max)
    let lineItemQuantity = parseFloat(quantityInput.value)

    if (event.target.hasAttribute('data-quantity-minus')) {
      if (quantityInput.value > 1) {
        lineItemQuantity -= 1
      } else {
        lineItemQuantity = 0
      }
    } else if (event.target.hasAttribute('data-quantity-plus')) {
      if (quantityInput.value < lineItemMaxQuantity) {
        lineItemQuantity += 1
      }
    }

    updateLineItem(lineItemKey, lineItemQuantity)
  })

  document.addEventListener('change', (event) => {
    if (!event.target.hasAttribute('data-quantity-input')) { return }

    const lineItemKey = event.target.getAttribute('data-line-item-key')
    const lineItemMaxQuantity = parseFloat(event.target.max)
    let lineItemQuantity = parseFloat(event.target.value)

    if (lineItemQuantity > lineItemMaxQuantity) {
      lineItemQuantity = lineItemMaxQuantity
    } else if (lineItemQuantity < 1) {
      lineItemQuantity = 0
    }

    updateLineItem(lineItemKey, lineItemQuantity)
  })
}

function cartRedirect () {
  const cartToggle = document.querySelector('[data-drawer-toggle="cart"]')

  if (window.location.href.indexOf('?cart_redirect') === -1 || !cartToggle) { return }

  cartToggle.click()
}

document.addEventListener('DOMContentLoaded', () => {
  addToCart()
  removeLineItem()
  quantitySelector()
  cartRedirect()
})
