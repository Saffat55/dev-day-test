function objectFitFallback () {
  // Detect objectFit support
  if ('objectFit' in document.documentElement.style !== false) { return }

  const coverImages = document.querySelectorAll('.img-cover')
  const containImages = document.querySelectorAll('.img-contain')

  handleObjectFit(coverImages, 'cover')
  handleObjectFit(containImages, 'contain')

  function handleObjectFit (items, type) {
    if (items === null) { return }

    items.forEach(item => {
      const itemImage = item.querySelector('img')
      itemImage.style.display = 'none'
      item.classList.add('no-object-fit', `no-object-fit--${type}`)
      item.style.backgroundSize = type
      item.style.backgroundImage = `url(${itemImage.src})`
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  objectFitFallback()
})
