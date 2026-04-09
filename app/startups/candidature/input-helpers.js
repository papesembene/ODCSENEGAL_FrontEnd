export const allowedPhoneKeys = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight"]

export const isNumericField = (name) => {
  return name === "capital" || name === "revenue" || name === "raisedAmount"
}

export const handlePhoneInput = (event) => {
  if (allowedPhoneKeys.includes(event.key) || (event.key >= "0" && event.key <= "9")) {
    return true
  }

  event.preventDefault()
  return false
}

export const cleanPhoneValue = (value) => {
  return value.replace(/[^0-9]/g, "")
}

export const processInputValue = ({ name, value, type, checked }) => {
  if (type === "checkbox") {
    return checked
  }

  if (name === "phone") {
    return cleanPhoneValue(value)
  }

  if (isNumericField(name)) {
    return value.replace(/\D/g, "")
  }

  return value
}

export const updateFormDataValue = (prev, name, value) => {
  const nextFormData = {
    ...prev,
    [name]: value,
  }

  if (name === "region") {
    nextFormData.department = ""
  }

  return nextFormData
}

export const omitError = (errors, name) => {
  if (!errors[name]) {
    return errors
  }

  const nextErrors = { ...errors }
  delete nextErrors[name]
  return nextErrors
}

export const mergeErrors = (realtimeErrors, validationErrors) => {
  return { ...realtimeErrors, ...validationErrors }
}
