import { trapFocus, removeTrapFocus } from '@scripts/core/a11y'

function drawersInit () {
  const siteHtml = document.querySelector('[data-site-html]')
  const siteBody = document.querySelector('[data-site-body]')
  const siteContainer = document.querySelector('[data-site-container]')
  const siteOverlay = document.querySelector('[data-site-overlay]')
  const drawers = document.querySelectorAll('[data-drawer]')
  const drawerToggles = document.querySelectorAll('[data-drawer-toggle]')
  const drawerCloseButtons = document.querySelectorAll('[data-drawer-close]')
  let scrollPosition = 0

  if (!drawerToggles.length) return

  drawerToggles.forEach((drawerToggle) => {
    drawerToggle.addEventListener('click', () => {
      const toggleId = drawerToggle.getAttribute('data-drawer-toggle')

      scrollPosition = window.scrollY
      siteContainer.style.marginTop = `-${scrollPosition}px`
      siteHtml.classList.add('disable-scrolling')
      siteBody.classList.add('disable-scrolling')
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

    siteHtml.classList.remove('disable-scrolling', 'hide-header')
    siteBody.classList.remove('disable-scrolling')
    siteOverlay.classList.remove('active')
    siteContainer.style.marginTop = ''
    window.scrollTo(0, scrollPosition)
    removeTrapFocus()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  drawersInit()
})
