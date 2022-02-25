function productThumbnails () {
  const productThumbnailImages = document.querySelectorAll('[data-product-thumbnail]')

  if (!productThumbnailImages.length) { return }

  productThumbnailImages.forEach((productThumbnailImage) => {
    productThumbnailImage.addEventListener('click', (event) => updateImage(productThumbnailImage, event))
    productThumbnailImage.addEventListener('keydown', (event) => updateImage(productThumbnailImage, event))
  })

  function updateImage (productThumbnailImage, event) {
    if (event.type === 'keydown' && event.keyCode !== 13) { return }

    const productImageWrappers = productThumbnailImage.closest('[data-product]').querySelectorAll('[data-product-image-wrapper]')
    const thumbnailImageId = productThumbnailImage.getAttribute('data-image-id')

    productImageWrappers.forEach((productImageWrapper) => {
      const wrapperImageId = productImageWrapper.getAttribute('data-image-id')

      if (wrapperImageId === thumbnailImageId) {
        productImageWrapper.classList.remove('hide')
      } else {
        productImageWrapper.classList.add('hide')
      }
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  productThumbnails()
})
