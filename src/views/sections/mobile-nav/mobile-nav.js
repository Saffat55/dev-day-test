function mobileNav () {
  const submenus = document.querySelectorAll('[data-mobile-nav-submenu]')
  const submenuOpenButtons = document.querySelectorAll('[data-mobile-nav-submenu-open]')
  const submenuCloseButtons = document.querySelectorAll('[data-mobile-nav-submenu-close]')

  if (!submenus.length) { return }

  submenuOpenButtons.forEach((submenuOpenButton, i) => {
    submenuOpenButton.addEventListener('click', () => {
      submenus.forEach((submenu, j) => {
        submenus[j].classList.add('hide')
        submenuOpenButtons[j].classList.remove('hide')
        submenuCloseButtons[j].classList.add('hide')
      })

      submenus[i].classList.remove('hide')
      submenuOpenButtons[i].classList.add('hide')
      submenuCloseButtons[i].classList.remove('hide')
      submenuCloseButtons[i].focus()
    })
  })

  submenuCloseButtons.forEach((submenuCloseButton, i) => {
    submenuCloseButton.addEventListener('click', () => {
      submenus[i].classList.add('hide')
      submenuOpenButtons[i].classList.remove('hide')
      submenuOpenButtons[i].focus()
      submenuCloseButtons[i].classList.add('hide')
    })
  })
}

document.addEventListener('DOMContentLoaded', () => {
  mobileNav()
})
