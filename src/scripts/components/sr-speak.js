export function srSpeak (text, priority = 'polite') {
  const el = document.createElement('div')
  el.setAttribute('aria-live', priority)
  el.classList.add('sr-only')
  document.body.appendChild(el)

  el.innerHTML = text

  setTimeout(() => {
    el.remove()
  }, 1000)
}
