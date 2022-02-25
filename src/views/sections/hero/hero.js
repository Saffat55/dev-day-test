import Swiper from 'swiper'

function hero () {
  const heroSlider = document.querySelector('[data-hero-slider]')

  const slider = new Swiper(heroSlider, {
    loop: true,
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    }
  })

  return slider
}

document.addEventListener('DOMContentLoaded', () => {
  hero()
})

document.addEventListener('shopify:section:load', () => {
  hero()
})
