import create from 'zustand/vanilla'
import produce from 'immer'

// Immer middleware for easy nested state immutability
const immer = config => (set, get, api) => config(fn => set(produce(fn)), get, api)

// Ui Zustand Store
const uiStore = create(immer((set, get) => ({
  stepper: {
    isOpen: false,
    currentStep: 1,
    maxSteps: 5,
    toggle: (isOpen) => {
      // close mobile menu if open
      if (isOpen) get().menu.toggle(false)

      set(state => {
        state.stepper.isOpen = isOpen
      })
    },
    prevStep: () => {
      const { goToStep, currentStep } = get().stepper
      goToStep(currentStep - 1)
    },
    nextStep: () => {
      const { goToStep, currentStep } = get().stepper
      goToStep(currentStep + 1)
    },
    goToStep: (step) => {
      if (step < 1 || step > get().stepper.maxSteps) return

      set((state) => {
        state.stepper.currentStep = step
      })
    }
  },
  menu: {
    isOpen: false,
    toggle: (isOpen) => {
      // close stepper if open
      if (isOpen) get().stepper.toggle(false)

      set(state => {
        state.menu.isOpen = isOpen
      })
    }
  }
})))

export default uiStore
