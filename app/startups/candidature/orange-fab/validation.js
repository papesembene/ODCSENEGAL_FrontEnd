import {
  ALLOWED_EXTENSIONS,
  ALLOWED_FILE_TYPES,
  FILE_SIZE_ERROR_MESSAGE,
  FILE_TYPE_ERROR_MESSAGE,
  MAX_FILE_SIZE,
} from "./constants"
import {
  getStartupRequiredBlurFields,
  validateAlternateEmail,
  validateApplicationFile,
  validateApplicationFileType,
  validateCreationDate,
  validateEmail,
} from "../shared-validation"
import { FORM_FEEDBACK_MESSAGES } from "@/lib/form-feedback"

export function validateFileType(file) {
  return validateApplicationFileType(file, ALLOWED_FILE_TYPES, ALLOWED_EXTENSIONS)
}

export function validateFile(file) {
  return validateApplicationFile(file, {
    allowedFileTypes: ALLOWED_FILE_TYPES,
    allowedExtensions: ALLOWED_EXTENSIONS,
    maxFileSize: MAX_FILE_SIZE,
    fileTypeErrorMessage: FILE_TYPE_ERROR_MESSAGE,
    fileSizeErrorMessage: FILE_SIZE_ERROR_MESSAGE,
  })
}

export function validateFieldRealtime(name, value, formData) {
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
      {
        const alternateEmailError = validateAlternateEmail(value, formData.email)
        if (alternateEmailError) {
          errors[name] = alternateEmailError
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

    case "region":
      if (!value.trim()) errors[name] = "La région est obligatoire"
      break

    case "department":
      if (!value.trim()) errors[name] = "Le département est obligatoire"
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
      {
        const creationDateError = validateCreationDate(value)
        if (creationDateError) {
          errors[name] = creationDateError
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

export function validateRequiredFieldOnBlur(name, value, formData) {
  const requiredFields = getStartupRequiredBlurFields(formData)

  if (requiredFields.includes(name) && !value.trim()) {
    return validateFieldRealtime(name, value, formData)
  }

  return {}
}

export function validateStep1(formData, { emailExists, phoneExists }) {
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
    const alternateEmailError = validateAlternateEmail(formData.emailAlternate, formData.email)
    if (alternateEmailError) {
      errors.emailAlternate = alternateEmailError
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
    errors.email = FORM_FEEDBACK_MESSAGES.duplicateEmail
  }

  if (phoneExists) {
    errors.phone = FORM_FEEDBACK_MESSAGES.duplicatePhone
  }

  return errors
}

export function validateStep2(formData) {
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
    const creationDateError = validateCreationDate(formData.creationDate)
    if (creationDateError) {
      errors.creationDate = creationDateError
    }
  }

  if (formData.sector === "other" && !formData.otherSector.trim()) {
    errors.otherSector = "Veuillez préciser votre secteur d'activité"
  }

  if (formData.legalForm === "Autre" && !formData.otherLegalForm.trim()) {
    errors.otherLegalForm = "Veuillez préciser la forme juridique"
  }

  return errors
}

export function validateStep3(formData, { hasReadRegulation }) {
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

  if (!hasReadRegulation) {
    errors.regulation = "Vous devez lire le règlement de participation"
  }

  if (!formData.acceptTerms) {
    errors.acceptTerms = "Vous devez accepter les conditions d'utilisation"
  }

  return errors
}
