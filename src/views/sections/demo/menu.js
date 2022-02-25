import uiStore from '@scripts/stores/uiStore'

const initMenu = () => {
  const menu = document.querySelector('[data-menu]')
  const openMenuBtn = document.querySelector('[data-open-menu]')
  const closeMenuBtn = document.querySelector('[data-close-menu]')

  // Get store methods
  const { toggle } = uiStore.getState().menu

  // Store subscribe callbacks
  const onToggleChange = (isOpen) => { menu.classList.toggle('active', isOpen) }

  // Click listeners
  openMenuBtn.addEventListener('click', () => toggle(true))
  closeMenuBtn.addEventListener('click', () => toggle(false))

  // Subscribe to store changes
  uiStore.subscribe(onToggleChange, state => state.menu.isOpen)
}

document.addEventListener('DOMContentLoaded', () => {
  initMenu()
})
