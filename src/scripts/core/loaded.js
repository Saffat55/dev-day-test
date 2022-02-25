export const markScriptLoaded = (name) => {
  window.POINTER = window.POINTER || {}
  window.POINTER.loadedScripts = window.POINTER.loadedScripts || {}
  window.POINTER.loadedScripts[name] = true
}

export const isScriptLoaded = (name) => window.POINTER?.loadedScripts?.[name]
