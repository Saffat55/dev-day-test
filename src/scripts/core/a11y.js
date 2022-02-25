import { focusHash, bindInPageLinks, trapFocus as trap, removeTrapFocus as removeTrap } from '@shopify/theme-a11y'

let lastFocusedElement = null

function tabOutline () {
  const siteBody = document.querySelector('[data-site-body]')

  document.addEventListener('keydown', (event) => {
    if (event.keyCode !== 9) { return }
    siteBody.classList.add('tab-outline')
  })
}

export function trapFocus (target) {
  lastFocusedElement = document.activeElement
  trap(target)
}

export function removeTrapFocus (target) {
  const siteBody = document.querySelector('[data-site-body]')
  removeTrap(target)
  if (!siteBody.classList.contains('tab-outline') || lastFocusedElement === null) { return }

  lastFocusedElement.focus()
}

document.addEventListener('DOMContentLoaded', () => {
  focusHash()
  bindInPageLinks()
  tabOutline()
})
