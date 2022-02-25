import { trapFocus, removeTrapFocus } from '@scripts/core/a11y'
import { scrollLockOpen, scrollLockClose } from '@scripts/core/scroll-lock'

function drawersInit () {
  const siteOverlay = document.querySelector('[data-site-overlay]')
  const drawers = document.querySelectorAll('[data-drawer]')
  const drawerToggles = document.querySelectorAll('[data-drawer-toggle]')
  const drawerCloseButtons = document.querySelectorAll('[data-drawer-close]')

  if (!drawerToggles.length) return

  drawerToggles.forEach((drawerToggle) => {
    drawerToggle.addEventListener('click', () => {
      const toggleId = drawerToggle.getAttribute('data-drawer-toggle')

      scrollLockOpen()
      siteOverlay.classList.add('active')

      drawers.forEach((drawer) => {
        const drawerId = drawer.getAttribute('data-drawer')

        if (drawerId !== toggleId) { return }

        drawer.classList.add('active')

        trapFocus(drawer)
      })
    })
  })

  drawerCloseButtons.forEach((drawerCloseButton) => {
    drawerCloseButton.addEventListener('click', () => closeDrawer())
  })

  siteOverlay.addEventListener('click', () => closeDrawer())

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') { return }
    closeDrawer()
  })

  function closeDrawer () {
    let activeDrawer = false

    drawers.forEach((drawer) => {
      if (!drawer.classList.contains('active')) { return }

      drawer.classList.remove('active')

      activeDrawer = true
    })

    if (activeDrawer !== true) { return }

    siteOverlay.classList.remove('active')
    scrollLockClose()
    removeTrapFocus()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  drawersInit()
})
