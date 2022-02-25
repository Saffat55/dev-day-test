/**
 * Creates a dynamic CSS variable (--viewport-height) that has the true viewport
 * height. Mobile browsers tend not to include the lower browser bar in regular
 * 100vh which can cause undesired sizing of elements which are meant to fill
 * the real viewport. You can use this in your css as `var(--viewport-height)`
 * instead of `100vh`
 */

const initViewport = () => {
  const updateViewportHeight = (setInitial) => () => {
    // get the real visible viewport height
    const vh = window.innerHeight
    // set --viewport-height css custom property to the root of the document
    document.documentElement.style.setProperty('--viewport-height', `${vh}px`)

    // store initial true viewport for proper hero sizing
    if (setInitial) document.documentElement.style.setProperty('--initial-viewport-height', `${vh}px`)
  }

  window.addEventListener('resize', updateViewportHeight(false))
  updateViewportHeight(true)()
}

// preload class disables all css transitions untl page is loaded
const initTransitions = () => {
  document.body.classList.remove('preload')
}

document.addEventListener('DOMContentLoaded', () => {
  initViewport()
  initTransitions()
})
