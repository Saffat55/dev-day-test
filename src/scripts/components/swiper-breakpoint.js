/*
  windowUnderBreakpoint === true, swiper will only work if window.width < breakpoint value
  windowUnderBreakpoint === false, swiper will only work if window.width >= breakpoint value

  Example Usage
  -----------------------------
  import { swiperBreakpoint } from '@scripts/components/swiper-breakpoint'
  .
  .
  .
  const swiperTarget = document.querySelector('[data-swiper-container]')
  const swiperParams = {
    slidesPerView: 'auto',
    freeMode: true,
    loop: false,
    observer: true,
    observeParents: true
  }
  let swiper = new Swiper(swiperTarget, swiperParams)

  const breakpoint = 1025
  swiper = swiperBreakpoint(swiper, swiperTarget, swiperParams, breakpoint)
  window.addEventListener('resize', () => {
    swiper = swiperBreakpoint(swiper, swiperTarget, swiperParams, breakpoint)
  })
*/

export function swiperBreakpoint (swiper, swiperTarget, swiperParams, breakpoint, windowUnderBreakpoint = true) {
  const breakpointCheck = (windowUnderBreakpoint === true) ? (window.innerWidth < breakpoint) : (window.innerWidth >= breakpoint)
  if (breakpointCheck) {
    if (swiper !== null) { return swiper }
    const initSwiper = new Swiper(swiperTarget, swiperParams)
    return initSwiper
  } else {
    if (swiper === null) { return swiper }
    swiper.destroy(true, true)
    return null
  }
}
