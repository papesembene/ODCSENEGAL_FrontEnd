export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateApplicationFileType(file, allowedFileTypes, allowedExtensions) {
  const fileExtension = `.${file.name.split(".").pop().toLowerCase()}`
  return Object.keys(allowedFileTypes).includes(file.type) || allowedExtensions.includes(fileExtension)
}

export function validateApplicationFile(file, config) {
  const {
    allowedFileTypes,
    allowedExtensions,
    maxFileSize,
    fileTypeErrorMessage,
    fileSizeErrorMessage,
  } = config

  if (!validateApplicationFileType(file, allowedFileTypes, allowedExtensions)) {
    return fileTypeErrorMessage
  }

  if (file.size > maxFileSize) {
    return fileSizeErrorMessage
  }

  return null
}

export function validateAlternateEmail(value, primaryEmail) {
  if (!value.trim()) {
    return null
  }

  if (!validateEmail(value)) {
    return "Veuillez saisir une adresse email valide"
  }

  if (value === primaryEmail) {
    return "L'email alternatif doit être différent de l'email principal"
  }

  return null
}

export function validateCreationDate(value) {
  if (!value.trim()) {
    return "La date de création est obligatoire"
  }

  const creationDate = new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (creationDate > today) {
    return "La date de création ne peut pas dépasser la date du jour."
  }

  return null
}

export function getStartupRequiredBlurFields(formData) {
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "companyName",
    "ninea",
    "employees",
    "creationDate",
    "productName",
    "productDescription",
    "activityDescription",
  ]

  if (formData.raisedFunds === "Oui") {
    requiredFields.push("raisedAmount")
  }

  return requiredFields
}
