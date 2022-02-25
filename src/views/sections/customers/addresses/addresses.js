import { CountryProvinceSelector } from '@shopify/theme-addresses'

// Import CSS
import './addresses.scss'

/* Snippets */
import '@snippets/custom-dropdown/custom-dropdown'
import '@snippets/modal/modal'

function initializeAddressForm (countryProvinceSelector, container) {
  const countrySelector = container.querySelector('[data-address-country]')
  const provinceSelector = container.querySelector('[data-address-province]')
  const provinceWrapper = container.querySelector('[data-address-province-wrapper]')
  const deleteForm = container.querySelector('[data-address-delete-form]')

  if (!countrySelector || !provinceSelector || !provinceWrapper) { return }
  countryProvinceSelector.build(countrySelector, provinceSelector, {
    onCountryChange: (provinces) => {
      provinceWrapper.classList.toggle('hide', !provinces.length)
      provinceSelector.dispatchEvent(new Event('change'))
    }
  })

  if (typeof countrySelector.options[countrySelector.selectedIndex] !== 'undefined') {
    countrySelector.dispatchEvent(new Event('change'))
  }

  if (deleteForm) {
    deleteForm.addEventListener('submit', (event) => {
      const confirmMessage = deleteForm.getAttribute('data-confirm-message')
      if (!window.confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
        event.preventDefault()
      }
    })
  }
}

function addressToggles () {
  const addressContainer = document.querySelector('[data-account-dashboard-addresses]')
  if (addressContainer === null) { return }

  const addresses = addressContainer.querySelectorAll('[data-address-container]')

  addresses.forEach((address) => {
    const toggle = address.querySelector('[data-address-container-toggle]')
    toggle.addEventListener('click', () => {
      address.classList.toggle('active')
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
  addressToggles()
  accountPageSelectorInit()

  const addresses = document.querySelectorAll('[data-address]')
  if (!addresses.length) { return }
  const countryProvinceSelector = new CountryProvinceSelector(window.theme.allCountryOptionTags)
  addresses.forEach((address) => {
    initializeAddressForm(countryProvinceSelector, address)
  })
})
