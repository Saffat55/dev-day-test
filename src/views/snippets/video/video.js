function videosInit () {
  const videos = document.querySelectorAll('[data-video]')
  const mql = window.matchMedia('(max-width: 1025px)')
  videos.forEach(video => {
    deferVideo(video)
    lowBatteryCheck(video)

    const toggleButton = video.closest('[data-video-toggle]')
    if (!toggleButton) { return }

    toggleButton.addEventListener('click', () => {
      playVideo(video, toggleButton)
    })
  })

  mql.addEventListener('change', () => {
    videos.forEach(video => {
      deferVideo(video)
    })
  })
}

function deferVideo (video) {
  const source = video.querySelector('[data-src]')
  if (!source) { return }

  const src = (!source.hasAttribute('data-mobile-src')) ? source.getAttribute('data-src') : (window.innerWidth >= 1025) ? source.getAttribute('data-src') : source.getAttribute('data-mobile-src')
  video.classList.remove('loaded')
  source.setAttribute('src', src)
  video.load()
  video.classList.add('loaded')
}

function lowBatteryCheck (video) {
  video.addEventListener('suspend', (event) => {
    event.preventDefault()
    console.log('video suspended')
    console.log(event)
    if (!video.hasAttribute('autoplay') || !video.classList.contains('loaded')) { return }
    console.log('kill: ' + video.getAttribute('id'))
    // alert(video.getAttribute('id'))
  })
}

function playVideo (video, wrapper) {
  if (window.innerWidth >= 1025) {
    if (video.paused) {
      video.play()
      wrapper.classList.add('playing')
    } else {
      video.pause()
      wrapper.classList.remove('playing')
    }
    return
  }
  if (video.enterFullscreen) { /* Chrome */
    video.enterFullscreen()
  } else if (video.webkitEnterFullscreen) { /* Safari */
    video.webkitEnterFullscreen()
  } else if (video.msEnterFullscreen) { /* IE11 */
    video.msEnterFullscreen()
  }
  video.play()
}

document.addEventListener('DOMContentLoaded', () => {
  videosInit()
})
