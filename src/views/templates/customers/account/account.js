// Import CSS
import './account.scss'

// Snippets
import '@snippets/custom-dropdown/custom-dropdown'

function orderDetails () {
  const ordersContainer = document.querySelector('[data-account-dashboard-orders]')
  if (ordersContainer === null) { return }

  const orders = ordersContainer.querySelectorAll('[data-account-dashboard-order]')

  orders.forEach((order) => {
    const toggle = order.querySelector('[data-account-dashboard-order-toggle]')
    toggle.addEventListener('click', () => {
      order.classList.toggle('active')
    })
  })
}

function accountPageSelectorInit () {
  const pageSelector = document.querySelector('[data-account-page-selector]')
  if (pageSelector === null) { return }

  pageSelector.addEventListener('change', () => {
    window.location.href = pageSelector.value
  })
}

document.addEventListener('DOMContentLoaded', () => {
  orderDetails()
  accountPageSelectorInit()
})
