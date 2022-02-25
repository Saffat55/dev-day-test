// Import CSS
import './login.scss'

function onShowHidePasswordForm (event) {
  event.preventDefault()
  toggleRecoverPasswordForm()
}

function checkUrlHash () {
  const hash = window.location.hash

  if (hash === '#recover') {
    toggleRecoverPasswordForm()
  }
}

function toggleRecoverPasswordForm () {
  document.querySelector('[data-recover-password-form]').classList.toggle('hide')
  document.querySelector('[data-customer-login-form]').classList.toggle('hide')
}

function recoverPasswordSuccess () {
  const formState = document.querySelector('[data-recover-password-success]')

  if (!formState) { return }

  document.querySelector('[data-recover-password-success-message]').classList.remove('hide')
}

document.addEventListener('DOMContentLoaded', () => {
  const recoverPassword = document.querySelector('[data-show-recover-password]')
  const hideRecoverPasswordLink = document.querySelector('[data-hide-recover-password]')

  if (!recoverPassword) { return }

  checkUrlHash()
  recoverPasswordSuccess()

  recoverPassword.addEventListener('click', (event) => {
    onShowHidePasswordForm(event)
  })

  hideRecoverPasswordLink.addEventListener('click', (event) => {
    onShowHidePasswordForm(event)
  })
})
