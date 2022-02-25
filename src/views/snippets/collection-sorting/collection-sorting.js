function collectionSorting () {
  const collectionSortingSelect = document.querySelector('[data-collection-sorting]')
  const currentSorting = collectionSortingSelect.getAttribute('data-current-sorting')

  if (!collectionSortingSelect) { return }

  collectionSortingSelect.querySelector(`option[value=${currentSorting}]`).setAttribute('selected', true)

  Shopify.queryParams = {}

  if (location.search.length) {
    for (let aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
      aKeyValue = aCouples[i].split('=')
      if (aKeyValue.length > 1) {
        Shopify.queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1])
      }
    }
  }

  collectionSortingSelect.addEventListener('change', (event) => {
    Shopify.queryParams.sort_by = event.target.value; // eslint-disable-line
    location.search = new URLSearchParams(Shopify.queryParams)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  collectionSorting()
})
