/*
  data-animate-in : addtribute added to elements
  data-animate-delay : delay time in milliseconds (optional)

  Animation Variations
  data-animate-in="opacity-only" : Only fades in, no translation
  data-animate-in="top-in" : Fades in from top
  data-animate-in="right-in" : Fades in from right
  data-animate-in="left-in" : Fades in from left
*/

function initAnimateIn () {
  checkPositions()
  window.addEventListener('scroll', () => {
    checkPositions()
  })
}

export function checkPositions () {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  document.querySelectorAll('[data-animate-in]').forEach((target) => {
    const delay = (target.getAttribute('data-animate-delay') === null) ? 0 : parseInt(target.getAttribute('data-animate-delay'), 10)
    const targetTop = (target.getBoundingClientRect().top + scrollTop) - (window.innerHeight * 0.8)

    if (targetTop >= scrollTop) {
      target.classList.remove('visible')
      return
    }

    setTimeout(() => {
      target.classList.add('visible')
    }, delay)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  initAnimateIn()
})
