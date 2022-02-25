import Choices from 'choices.js'

function customDropdownInit () {
  const customDropdowns = document.querySelectorAll('[data-custom-dropdown]')

  if (!customDropdowns.length) { return }

  customDropdowns.forEach((customDropdown) => {
    const choicesDropdown = new Choices(customDropdown, {
      searchEnabled: false,
      itemSelectText: '',
      placeholder: true,
      shouldSort: false,
      position: 'bottom'
    })

    return choicesDropdown
  })
}

document.addEventListener('DOMContentLoaded', () => {
  customDropdownInit()
})
