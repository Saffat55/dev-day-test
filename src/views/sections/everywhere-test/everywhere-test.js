import { isScriptLoaded, markScriptLoaded } from '@scripts/core/loaded'
import './everywhere-test.scss'

const SECTION_NAME = 'everywhere-test'

const initEverywhereTest = () => {
  console.log('Everywhere test')
}

const run = () => {
  initEverywhereTest()
}

// Ensure section JS only runs once
if (!isScriptLoaded(SECTION_NAME)) {
  document.addEventListener('DOMContentLoaded', run)
  document.addEventListener('shopify:section:load', run)

  markScriptLoaded(SECTION_NAME)
}
