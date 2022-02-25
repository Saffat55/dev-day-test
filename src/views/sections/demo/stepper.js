import uiStore from '@scripts/stores/uiStore'

const initStepper = () => {
  const stepper = document.querySelector('[data-stepper]')
  const title = document.querySelector('[data-stepper-title]')
  const nextStepBtn = document.querySelector('[data-next-step]')
  const prevStepBtn = document.querySelector('[data-prev-step]')
  const openStepperBtn = document.querySelectorAll('[data-open-stepper]')
  const closeStepperBtn = document.querySelector('[data-close-stepper]')

  // Get store methods
  const { nextStep, prevStep, toggle } = uiStore.getState().stepper

  // Store subscribe callbacks
  const onStepChange = (step) => { title.innerHTML = `Step: ${step}` }
  const onToggleChange = (isOpen) => { stepper.classList.toggle('active', isOpen) }

  // Click listeners
  nextStepBtn.addEventListener('click', () => nextStep())
  prevStepBtn.addEventListener('click', () => prevStep())
  closeStepperBtn.addEventListener('click', () => toggle(false))
  openStepperBtn.forEach(openBtn =>
    openBtn.addEventListener('click', () => toggle(true)))

  // Subscribe to store changes
  uiStore.subscribe(onStepChange, state => state.stepper.currentStep)
  uiStore.subscribe(onToggleChange, state => state.stepper.isOpen)
}

document.addEventListener('DOMContentLoaded', () => {
  initStepper()
})
