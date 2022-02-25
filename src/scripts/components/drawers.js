import { trapFocus, removeTrapFocus } from '@shopify/theme-a11y'

function drawers () {
  const drawerLeft = document.querySelector('[data-drawer-left]')
  const drawerRight = document.querySelector('[data-drawer-right]')
  const drawerToggles = document.querySelectorAll('[data-drawer-toggle]')
  const drawerCloseButtons = document.querySelectorAll('[data-drawer-close]')
  const siteHtml = document.querySelector('[data-site-html]')
  const siteBody = document.querySelector('[data-site-body]')
  const siteOverlay = document.querySelector('[data-site-overlay]')

  if (!drawerLeft && !drawerRight) return

  drawerToggles.forEach((drawerToggle) => {
    drawerToggle.addEventListener('click', () => {
      if (drawerToggle.hasAttribute('data-drawer-left-toggle')) {
        drawerLeft.classList.add('active')
        trapFocus(drawerLeft)
      } else if (drawerToggle.hasAttribute('data-drawer-right-toggle')) {
        drawerRight.classList.add('active')
        trapFocus(drawerRight)
      }

      siteHtml.classList.add('drawer-active')
      siteBody.classList.add('drawer-active')
      siteOverlay.classList.add('active')
    })
  })

  drawerCloseButtons.forEach((drawerCloseButton) => {
    drawerCloseButton.addEventListener('click', () => {
      closeDrawer()
    })
  })

  document.addEventListener('keydown', (event) => {
    if (event.keyCode !== 27) return
    closeDrawer()
  })

  siteOverlay.addEventListener('click', () => {
    closeDrawer()
  })

  function closeDrawer () {
    drawerLeft.classList.remove('active')
    drawerRight.classList.remove('active')
    siteHtml.classList.remove('drawer-active')
    siteBody.classList.remove('drawer-active')
    siteOverlay.classList.remove('active')
    removeTrapFocus()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  drawers()
})
