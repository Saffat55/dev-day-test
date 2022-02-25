/*
*
*   To add form validation:
*   - Give form [data-validation-required]
*   - Wrap required field with [data-required-field-wrapper]
*   - Give required field [data-required-field="value"] with value set to the desired error message
*   - Add a span inside the wrapper with the desired error icon/text to display on input (example: <span>&times;</span>)
*
*   Optional:
*   - to add further validation (by default validation checks if field is empty)
*     set [data-required-field="some-regex-here"] on required field with desired regex validation
*
*/

function requiredValidation () {
  const forms = document.querySelectorAll('[data-validation-required]')

  if (!forms.length) { return }

  forms.forEach((form) => {
    const requiredFields = form.querySelectorAll('[data-required-field]')
    const submitButton = form.querySelector('button[type="submit"]')
    if (!submitButton) { return }

    submitButton.addEventListener('click', (event) => {
      checkSubmitForm(form, requiredFields, event)
    })

    form.setAttribute('novalidate', 'novalidate')
    form.addEventListener('submit', (event) => {
      checkSubmitForm(form, requiredFields, event)
    })
  })
}

function checkSubmitForm (form, requiredFields, event) {
  requiredFields.forEach((field) => {
    validate(field)

    field.addEventListener('input', () => {
      validate(field)
    })
  })

  if (checkForErrors(requiredFields)) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function validate (field) {
  const pattern = field.getAttribute('data-required-field-pattern')
  const errorMessage = field.getAttribute('data-required-field')

  if (pattern) {
    const regex = new RegExp(pattern)

    if (field.value.length === 0) {
      addErrorMessage(field, 'required field')
    } else if (regex.test(field.value)) {
      field.classList.remove('input-error')
    } else {
      addErrorMessage(field, errorMessage)
    }
  } else if (field.value.length > 0) {
    field.classList.remove('input-error')
  } else {
    addErrorMessage(field, errorMessage)
  }
}

function checkForErrors (fields) {
  let errors = false

  fields.forEach((field) => {
    if (field.classList.contains('input-error')) {
      errors = true
    }
  })

  return errors
}

function addErrorMessage (field, errorMessage) {
  field.classList.add('input-error')
  field.nextElementSibling.setAttribute('data-after', errorMessage === '' ? 'required field' : errorMessage)
}

document.addEventListener('DOMContentLoaded', () => {
  requiredValidation()
})

document.addEventListener('shopify:section:load', () => {
  requiredValidation()
})
