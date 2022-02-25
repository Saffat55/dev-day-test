export const imageSize = (url = null, width = null, height = null) => {
  if (!url || !width) { return url }
  const imageType =
    (url.includes('.png') && '.png') ||
    (url.includes('.jpg') && '.jpg') ||
    (url.includes('.jpeg') && '.jpeg') ||
    (url.includes('.gif') && '.gif')

  const urlArray = url.split(imageType)
  urlArray[0] += `_${width}x${height !== null ? height : ''}`
  return urlArray.join(imageType)
}
