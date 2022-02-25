// Import CSS
import './order.scss'

/* Snippets */
import '@snippets/custom-dropdown/custom-dropdown'

function accountPageSelectorInit () {
  const pageSelector = document.querySelector('[data-account-page-selector]')
  if (pageSelector === null) { return }

  pageSelector.addEventListener('change', () => {
    window.location.href = pageSelector.value
  })
}

document.addEventListener('DOMContentLoaded', () => {
  accountPageSelectorInit()
})
