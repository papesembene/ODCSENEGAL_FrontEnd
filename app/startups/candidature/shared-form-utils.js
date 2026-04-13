const ALLOWED_PHONE_KEYS = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight"]
const NUMERIC_FIELDS = new Set(["capital", "revenue", "raisedAmount"])

export function clearFieldError(prevErrors, fieldName) {
  if (!prevErrors[fieldName]) {
    return prevErrors
  }

  const nextErrors = { ...prevErrors }
  delete nextErrors[fieldName]
  return nextErrors
}

export function mergeErrors(realtimeErrors, validationErrors) {
  return { ...realtimeErrors, ...validationErrors }
}

export function handlePhoneInput(event) {
  if (ALLOWED_PHONE_KEYS.includes(event.key) || (event.key >= "0" && event.key <= "9")) {
    return true
  }

  event.preventDefault()
  return false
}

export function normalizeSharedFieldValue(name, value) {
  if (name === "phone") {
    return value.replace(/[^0-9]/g, "")
  }

  if (NUMERIC_FIELDS.has(name)) {
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

export function buildMultipartApplicationFormData(formData, options = {}) {
  const { program } = options
  const form = new FormData()

  Object.entries(formData).forEach(([key, value]) => {
    if (key !== "cv" && key !== "pitchDeck") {
      form.append(key, value ?? "")
    }
  })

  form.append("fullPhone", `${formData.phoneCountry}${formData.phone}`)

  if (program) {
    form.append("program", program)
  }

  if (formData.cv) {
    form.append("cv", formData.cv)
  }

  if (formData.pitchDeck) {
    form.append("pitch_deck", formData.pitchDeck)
  }

  return form
}
