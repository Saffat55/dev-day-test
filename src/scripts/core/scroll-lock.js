const siteHtml = document.querySelector('[data-site-html]')
const siteBody = document.querySelector('[data-site-body]')
const siteContainer = document.querySelector('[data-site-container]')
let currentScroll = null

export function scrollLockOpen () {
  currentScroll = window.scrollY
  siteHtml.classList.add('scroll-lock')
  siteBody.classList.add('scroll-lock')
  siteContainer.style.top = `-${currentScroll}px`
}

export function scrollLockClose () {
  siteHtml.classList.remove('scroll-lock')
  siteBody.classList.remove('scroll-lock')
  siteContainer.style.top = ''
  if (currentScroll !== null) {
    window.scrollTo(0, currentScroll)
  }
}
