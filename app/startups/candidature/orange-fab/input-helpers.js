export function clearFieldError(prevErrors, fieldName) {
  const nextErrors = { ...prevErrors }
  delete nextErrors[fieldName]
  return nextErrors
}

export function handlePhoneInput(event) {
  const allowedKeys = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight"]
  if (allowedKeys.includes(event.key) || (event.key >= "0" && event.key <= "9")) {
    return true
  }

  event.preventDefault()
  return false
}

export function cleanPhoneValue(value) {
  return value.replace(/[^0-9]/g, "")
}

export function sanitizeOrangeFabFieldValue(name, value) {
  if (name === "phone") {
    return cleanPhoneValue(value)
  }

  if (name === "capital" || name === "revenue" || name === "raisedAmount") {
    return value.replace(/\D/g, "")
  }

  return value
}

export function buildInputFormData(prevFormData, { name, type, checked, value }) {
  return {
    ...prevFormData,
    [name]: type === "checkbox" ? checked : value,
  }
}

export function buildSelectFormData(prevFormData, name, value) {
  if (name === "region") {
    return {
      ...prevFormData,
      region: value,
      department: "",
    }
  }

  return {
    ...prevFormData,
    [name]: value,
  }
}
