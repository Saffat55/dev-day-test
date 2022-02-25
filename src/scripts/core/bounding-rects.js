/*
  Using getBoundingClientRect() can cause reflows and poor performance when
  used often. This is a cached wrapper which is useful for animations or any
  frequent use of getBoundingClientRect()
*/

let elemsWithBoundingRects = []

export const ptrGetBoundingClientRect = (element) => {
  // Check if we already got the client rect before.
  if (!element._boundingClientRect) {
    // If not, get it then store it for future use.
    element._boundingClientRect = element.getBoundingClientRect()
    elemsWithBoundingRects.push(element)
  }
  return element._boundingClientRect
}

export const clearClientRects = () => {
  elemsWithBoundingRects.forEach(el => {
    el._boundingClientRect = null
  })
  elemsWithBoundingRects = []
}
