import Choices from 'choices.js'

function customDropdownInit () {
  const dropdownElems = document.querySelectorAll('[data-custom-dropdown]')
  if (!dropdownElems.length) { return }

  dropdownElems.forEach((dropdown) => {
    const choicesDropdown = new Choices(dropdown, {
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
