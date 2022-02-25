function hero () {
  const clickSprite = document.querySelector('[data-click-sprite]')

  clickSprite.addEventListener('mouseenter', () => {
    clickSprite.sprite?.playOnce({
      frameStart: 1,
      frameEnd: 6
    })
  })

  clickSprite.addEventListener('click', () => {
    clickSprite.sprite?.playOnce({
      frameStart: 7
    })
  })
}

document.addEventListener('DOMContentLoaded', () => {
  hero()
})

document.addEventListener('shopify:section:load', () => {
  hero()
})
