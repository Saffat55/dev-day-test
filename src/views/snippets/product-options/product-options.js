function productOptionsInit () {
  const productParentEl = document.querySelector('[data-product]')
  const optionGroups = productParentEl.querySelectorAll('[data-product-option-group]')
  const optionRadios = productParentEl.querySelectorAll('[data-product-option][data-type="radio"]')
  const productJsonEl = productParentEl.querySelector('[data-product-json]')
  const variantStockMessage = productParentEl.querySelector('[data-variant-stock-message]')
  const quantitySelectInput = productParentEl.querySelector('[data-quantity-input]')
  const productSelect = productParentEl.querySelector('[data-product-select]')
  const submitButton = productParentEl.querySelector('[data-product-submit]')

  if (!optionGroups || !productJsonEl) { return }

  const productJson = JSON.parse(productJsonEl.innerHTML)

  optionGroups.forEach(optionGroup => {
    optionGroup.addEventListener('change', (event) => {
      handleOptionChange(optionGroup)
    })
  })

  function handleOptionChange (group) {
    const selectedOptions = getSelectedOptions()
    const selectedVariant = getVariantByOptions(selectedOptions)

    updateOptionRadios(selectedOptions)
    updateSelectedText()
    updateProductGallery(selectedVariant)
    updateVariantStockMessage(selectedVariant)
    updateQuanitySelect(selectedVariant)

    // Set hidden product select value
    if (selectedVariant) {
      productSelect.value = selectedVariant.id
    }

    // Disable / Enable update button
    submitButton.disabled = !selectedVariant || !selectedVariant.available
  }
  handleOptionChange()

  function getSelectedOptions () {
    const selectedOptions = [...optionGroups].reduce((object, group) => {
      let value = null
      if (group.dataset.type === 'select') {
        const select = group.querySelector('[data-product-option]')
        value = select.value
      } else {
        value = group.querySelector('[data-product-option]:checked').value
      }

      object[`option${group.dataset.optionIndex}`] = value
      return object
    }, {})

    return selectedOptions
  }

  function updateSelectedText (group, input) {
    optionGroups.forEach(optionGroup => {
      const selectedInput = optionGroup.querySelector('[data-product-option]:checked')
      const selectedTextEl = optionGroup.querySelector('[data-product-option-group-selected-text]')
      if (!selectedTextEl || !selectedInput) return

      const selectedText = selectedInput.dataset.selectedText

      selectedTextEl.textContent = selectedText
    })
  }

  function updateVariantStockMessage (selectedVariant) {
    if (!variantStockMessage) return
    variantStockMessage.classList.add('hide')

    if (!selectedVariant) {
      variantStockMessage.classList.remove('hide')
      variantStockMessage.textContent = variantStockMessage.dataset.notAvailableText
    } else if (selectedVariant.available === false) {
      variantStockMessage.classList.remove('hide')
      variantStockMessage.textContent = variantStockMessage.dataset.noStockText
    } else if (selectedVariant.inventory_policy === 'deny' && selectedVariant.inventory_quantity < parseInt(variantStockMessage.dataset.lowStockBreakpoint, 10)) {
      variantStockMessage.classList.remove('hide')
      variantStockMessage.textContent = variantStockMessage.dataset.lowStockText
    }
  }

  function updateProductGallery (selectedVariant) {
    if (!selectedVariant) return
    console.log('Update gallery')
  }

  function updateQuanitySelect (selectedVariant) {
    if (!quantitySelectInput || !selectedVariant) return

    if (quantitySelectInput.value > selectedVariant.inventory_quantity && selectedVariant.inventory_quantity > 0) {
      quantitySelectInput.value = selectedVariant.inventory_quantity
    }

    console.log(selectedVariant.inventory_quantity)

    // eslint-disable-next-line no-nested-ternary
    const maxValue = (selectedVariant.inventory_policy === 'continue'
      ? 99
      : selectedVariant.inventory_quantity)

    quantitySelectInput.max = maxValue
  }

  function updateOptionRadios (selectedOptions) {
    optionRadios.forEach(optionRadio => {
      const inputOptions = { ...selectedOptions }
      const parentItemEl = optionRadio.closest('[data-product-option-item]')

      inputOptions[`option${optionRadio.dataset.optionIndex}`] = optionRadio.value

      const matchingVariant = getVariantByOptions(inputOptions)

      if (matchingVariant) {
        parentItemEl.classList.toggle('soldout', !matchingVariant.available)
        parentItemEl.classList.remove('unavailable')
      } else {
        parentItemEl.classList.add('unavailable')
      }
    })
  }

  function getVariantByOptions (options) {
    const matchingVariant = productJson.variants.find(variant => {
      let isMatch = true

      for (const [key, value] of Object.entries(options)) {
        if (variant[key] !== value) {
          isMatch = false
          break
        }
      }

      return isMatch
    })

    return matchingVariant || null
  }
}

document.addEventListener('DOMContentLoaded', () => {
  productOptionsInit()
})
