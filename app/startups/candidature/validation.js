import {
  ALLOWED_EXTENSIONS,
  ALLOWED_FILE_TYPES,
  FILE_SIZE_ERROR_MESSAGE,
  FILE_TYPE_ERROR_MESSAGE,
  MAX_FILE_SIZE,
} from "./constants"

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateFileType = (file) => {
  const fileExtension = `.${file.name.split(".").pop().toLowerCase()}`
  return Object.keys(ALLOWED_FILE_TYPES).includes(file.type) || ALLOWED_EXTENSIONS.includes(fileExtension)
}

export const validateFile = (file) => {
  if (!validateFileType(file)) {
    return FILE_TYPE_ERROR_MESSAGE
  }

  if (file.size > MAX_FILE_SIZE) {
    return FILE_SIZE_ERROR_MESSAGE
  }

  return null
}

export const validateFieldRealtime = (name, value, formData) => {
  const errors = {}

  switch (name) {
    case "firstName":
      if (!value.trim()) errors[name] = "Le prénom est obligatoire"
      break
    case "lastName":
      if (!value.trim()) errors[name] = "Le nom est obligatoire"
      break
    case "email":
      if (!value.trim()) {
        errors[name] = "L'email est obligatoire"
      } else if (!validateEmail(value)) {
        errors[name] = "Veuillez saisir une adresse email valide (ex: nom@domaine.com)"
      }
      break
    case "emailAlternate":
      if (value.trim()) {
        if (!validateEmail(value)) {
          errors[name] = "Veuillez saisir une adresse email valide"
        } else if (value === formData.email) {
          errors[name] = "L'email alternatif doit être différent de l'email principal"
        }
      }
      break
    case "phone":
      if (!value.trim()) {
        errors[name] = "Le téléphone est obligatoire"
      } else if (value.length < 8) {
        errors[name] = "Le téléphone doit contenir au moins 8 chiffres"
      }
      break
    case "otherRole":
      if (formData.role === "Autre" && !value.trim()) {
        errors[name] = "Veuillez préciser votre rôle"
      }
      break
    case "otherDiploma":
      if (formData.diploma === "autre" && !value.trim()) {
        errors[name] = "Veuillez préciser votre diplôme"
      }
      break
    case "companyName":
      if (!value.trim()) errors[name] = "Le nom de l'entreprise est obligatoire"
      break
    case "ninea":
      if (!value.trim()) errors[name] = "Le NINEA ou régie de commerce est obligatoire"
      break
    case "employees":
      if (!value.trim()) errors[name] = "Le nombre d'employés est obligatoire"
      break
    case "creationDate":
      if (!value.trim()) {
        errors[name] = "La date de création est obligatoire"
      } else {
        const creationDate = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (creationDate > today) {
          errors[name] = "La date de création ne peut pas dépasser la date du jour."
        }
      }
      break
    case "raisedAmount":
      if (formData.raisedFunds === "Oui" && !value.trim()) {
        errors[name] = "Le montant levé est obligatoire"
      }
      break
    case "otherSector":
      if (formData.sector === "other" && !value.trim()) {
        errors[name] = "Veuillez préciser votre secteur d'activité"
      }
      break
    case "otherLegalForm":
      if (formData.legalForm === "Autre" && !value.trim()) {
        errors[name] = "Veuillez préciser la forme juridique"
      }
      break
    case "productName":
      if (!value.trim()) errors[name] = "Le nom du produit/service est obligatoire"
      break
    case "productDescription":
      if (!value.trim()) errors[name] = "La description du produit/service est obligatoire"
      break
    case "activityDescription":
      if (!value.trim()) errors[name] = "La description de l'activité est obligatoire"
      break
    default:
      break
  }

  return errors
}

export const getRequiredBlurFields = (formData) => {
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

export const validateStep1 = ({ formData, emailExists, phoneExists, emailCheckLoading, phoneCheckLoading }) => {
  const errors = {}

  if (!formData.firstName.trim()) errors.firstName = "Le prénom est obligatoire"
  if (!formData.lastName.trim()) errors.lastName = "Le nom est obligatoire"
  if (!formData.role.trim()) errors.role = "Le rôle est obligatoire"
  if (!formData.email.trim()) errors.email = "L'email est obligatoire"
  if (!formData.phone.trim()) errors.phone = "Le téléphone est obligatoire"
  if (!formData.region.trim()) errors.region = "La région est obligatoire"
  if (!formData.department.trim()) errors.department = "Le département est obligatoire"
  if (!formData.diploma.trim()) errors.diploma = "Le diplôme est obligatoire"
  if (!formData.cv) errors.cv = "Le CV est obligatoire"

  if (formData.email.trim() && !validateEmail(formData.email)) {
    errors.email = "Veuillez saisir une adresse email valide (ex: nom@domaine.com)"
  }

  if (formData.emailAlternate.trim()) {
    if (!validateEmail(formData.emailAlternate)) {
      errors.emailAlternate = "Veuillez saisir une adresse email valide"
    } else if (formData.emailAlternate === formData.email) {
      errors.emailAlternate = "L'email alternatif doit être différent de l'email principal"
    }
  }

  if (formData.phone.trim() && formData.phone.length < 8) {
    errors.phone = "Le téléphone doit contenir au moins 8 chiffres"
  }

  if (formData.role === "Autre" && !formData.otherRole.trim()) {
    errors.otherRole = "Veuillez préciser votre rôle"
  }

  if (formData.diploma === "autre" && !formData.otherDiploma.trim()) {
    errors.otherDiploma = "Veuillez préciser votre diplôme"
  }

  if (emailExists) {
    errors.email = "Cet email a déjà été utilisé pour une candidature"
  }

  if (phoneExists) {
    errors.phone = "Ce numéro de téléphone a déjà été utilisé pour une candidature"
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0 && !emailCheckLoading && !phoneCheckLoading,
  }
}

export const validateStep2 = (formData) => {
  const errors = {}

  if (!formData.companyName.trim()) errors.companyName = "Le nom de l'entreprise est obligatoire"
  if (!formData.ninea.trim()) errors.ninea = "Le NINEA ou régie de commerce est obligatoire"
  if (!formData.sector.trim()) errors.sector = "Le secteur d'activité est obligatoire"
  if (!formData.businessModel.trim()) errors.businessModel = "Le modèle d'affaire est obligatoire"
  if (!formData.creationDate.trim()) errors.creationDate = "La date de création est obligatoire"
  if (!formData.legalForm.trim()) errors.legalForm = "La forme juridique est obligatoire"
  if (!formData.employees.trim()) errors.employees = "Le nombre d'employés est obligatoire"
  if (!formData.raisedFunds.trim()) errors.raisedFunds = "Veuillez indiquer si vous avez levé des fonds"
  if (!formData.pitchDeck) errors.pitchDeck = "Le document de présentation est obligatoire"

  if (formData.raisedFunds === "Oui" && !formData.raisedAmount.trim()) {
    errors.raisedAmount = "Le montant levé est obligatoire"
  }

  if (formData.creationDate) {
    const creationDate = new Date(formData.creationDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (creationDate > today) {
      errors.creationDate = "La date de création ne peut pas dépasser la date du jour."
    }
  }

  if (formData.sector === "other" && !formData.otherSector.trim()) {
    errors.otherSector = "Veuillez préciser votre secteur d'activité"
  }

  if (formData.legalForm === "Autre" && !formData.otherLegalForm.trim()) {
    errors.otherLegalForm = "Veuillez préciser la forme juridique"
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

export const validateStep3 = (formData) => {
  const errors = {}

  if (!formData.productName.trim()) {
    errors.productName = "Le nom du produit/service est obligatoire"
  }

  if (!formData.productDescription.trim()) {
    errors.productDescription = "La description du produit/service est obligatoire"
  }

  if (!formData.activityDescription.trim()) {
    errors.activityDescription = "La description de l'activité est obligatoire"
  }

  if (!formData.hasWorkingProduct.trim()) {
    errors.hasWorkingProduct = "Veuillez indiquer si vous avez un produit fonctionnel"
  }

  if (!formData.acceptTerms) {
    errors.acceptTerms = "Vous devez accepter les conditions d'utilisation"
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}
