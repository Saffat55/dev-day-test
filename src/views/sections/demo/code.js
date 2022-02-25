import uiStore from '@scripts/stores/uiStore'

const initCode = () => {
  const stepperOpen = document.querySelector('[data-code-stepper-isopen]')
  const stepperStep = document.querySelector('[data-code-stepper-step]')
  const stepperMax = document.querySelector('[data-code-stepper-max]')
  const menuOpen = document.querySelector('[data-code-menu-isopen]')

  // Store subscribe callbacks
  const onChange = (state) => {
    stepperOpen.innerHTML = state.stepper.isOpen.toString()
    stepperStep.innerHTML = state.stepper.currentStep
    stepperMax.innerHTML = state.stepper.maxSteps
    menuOpen.innerHTML = state.menu.isOpen.toString()

    // window.hljs.highlightAll()
  }

  // Subscribe to store changes
  uiStore.subscribe(onChange)
}

document.addEventListener('DOMContentLoaded', () => {
  initCode()
})
