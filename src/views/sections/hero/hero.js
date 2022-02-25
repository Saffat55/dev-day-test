import './hero.scss'

import { isScriptLoaded, markScriptLoaded } from '@scripts/core/loaded'

const SECTION_NAME = 'hero'

const hero = () => {
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

const run = () => {
  hero()
}

// Ensure section JS only runs once
if (!isScriptLoaded(SECTION_NAME)) {
  document.addEventListener('DOMContentLoaded', run)
  document.addEventListener('shopify:section:load', run)

  markScriptLoaded(SECTION_NAME)
}
