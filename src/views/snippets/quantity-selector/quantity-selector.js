import { srSpeak } from '@scripts/components/sr-speak'

class quantitySelector extends HTMLElement {
  constructor () {
    super()
    this.initSelector()
  }

  initSelector () {
    const quantityButtons = this.querySelectorAll('[data-quantity-button]')
    const quantityInput = this.querySelector('[data-quantity-input]')
    const quantityLimitNotice = this.querySelector('[data-quantity-limit-notice]')

    quantityButtons.forEach(quantityButton => {
      quantityButton.addEventListener('click', (event) => {
        const prevValue = quantityInput.value

        if (quantityButton.dataset.action === 'plus') {
          quantityInput.stepUp()
        } else if (quantityButton.dataset.action === 'minus') {
          quantityInput.stepDown()
        }

        if (prevValue !== quantityInput.value) {
          quantityInput.dispatchEvent(new Event('change'))
          srSpeak(quantityInput.value, 'assertive')
        }

        const isAtMax = quantityInput.value === quantityInput.max
        quantityLimitNotice.classList.toggle('hide', !isAtMax)
        quantityLimitNotice.textContent = quantityLimitNotice.dataset.text.replace('{{ limit }}', quantityInput.max)
        if (isAtMax) {
          srSpeak(quantityLimitNotice.textContent, 'polite')
        }
      })
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.customElements.define('quantity-selector', quantitySelector)
})
