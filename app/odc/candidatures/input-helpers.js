export function clearFieldError(prevErrors, fieldName) {
  const nextErrors = { ...prevErrors }
  delete nextErrors[fieldName]
  return nextErrors
}

export function resetPhoneForCountryChange(prevFormData) {
  return {
    ...prevFormData,
    phone: "",
  }
}

export function sanitizeFieldValue({ name, value, selectedCountry, idType }) {
  let nextValue = value

  if (name === "firstName" || name === "lastName") {
    nextValue = value.replace(/[0-9]/g, "")
  }

  if (name === "birthPlace") {
    if (/^\d/.test(value) && value.length === 1) {
      nextValue = ""
    }
  }

  if (name === "phone") {
    nextValue = value.replace(/[^0-9]/g, "")

    if (nextValue.length > selectedCountry.digits) {
      nextValue = nextValue.slice(0, selectedCountry.digits)
    }
  }

  if (name === "idNumber" && idType === "cni") {
    nextValue = value.replace(/[^A-Za-z0-9]/g, "")

    if (nextValue.length > 14) {
      nextValue = nextValue.slice(0, 14)
    }
  }

  return nextValue
}

export function buildNextFormData(prevFormData, name, value) {
  if (name === "formation") {
    return {
      ...prevFormData,
      [name]: value,
      education: "",
      currentStructure: "",
    }
  }

  return {
    ...prevFormData,
    [name]: value,
  }
}
