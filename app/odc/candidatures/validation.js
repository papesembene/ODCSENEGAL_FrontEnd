import { findTraining } from "../../../lib/training-catalog.js"

export function getMonthsForFormation(formation) {
  return findTraining(formation)?.durationMonths || 10
}

export function validateName(value) {
  if (!value.trim()) return "Ce champ est requis"
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) return "Veuillez entrer un nom valide"
  return null
}

export function validateFirstName(value) {
  if (!value.trim()) return "Ce champ est requis"
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) return "Veuillez entrer un prénom valide"
  return null
}

export function validateEmail(value) {
  if (!value.trim()) return "L'email est requis"
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return "Format d'email invalide"
  return null
}

export function validatePhone(value, selectedCountry) {
  if (!value.trim()) return "Le numéro de téléphone est requis"

  if (value.length !== selectedCountry.digits) {
    return `Le numéro doit contenir exactement ${selectedCountry.digits} chiffres pour ${selectedCountry.country}`
  }

  if (!selectedCountry.pattern.test(value)) {
    return `Format invalide pour un numéro ${selectedCountry.country}`
  }

  return null
}

export function validateBirthPlace(value) {
  if (!value.trim()) return "Le lieu de naissance est requis"
  if (/^\d/.test(value)) return "Le lieu ne doit pas commencer par un chiffre"
  return null
}

export function validateBirthDate(value, now = new Date()) {
  if (!value) return "La date de naissance est requise"
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return "Saisissez une date de naissance valide"

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    return "Saisissez une date de naissance valide"
  }

  const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
  if (year > today[0] || (year === today[0] && month > today[1])
    || (year === today[0] && month === today[1] && day > today[2])) {
    return "La date de naissance ne peut pas être dans le futur"
  }
  return null
}

export function validateIdNumber(value, idType) {
  if (!value.trim()) return "Le numéro est requis"

  if (idType === "cni") {
    if (!/^[A-Za-z0-9]{13,14}$/.test(value)) {
      return "La CNI doit contenir entre 13 et 14 caractères alphanumériques"
    }
  } else if (idType === "passport") {
    if (value.length < 8 || value.length > 9) return "Le passeport doit contenir 8 ou 9 caractères"
  }

  return null
}

export function validateField(name, value, { idType, selectedCountry }) {
  switch (name) {
    case "firstName":
      return validateFirstName(value)
    case "lastName":
      return validateName(value)
    case "email":
      return validateEmail(value)
    case "phone":
      return validatePhone(value, selectedCountry)
    case "birthPlace":
      return validateBirthPlace(value)
    case "birthDate":
      return validateBirthDate(value)
    case "gender":
      return !value ? "Le genre est requis" : null
    case "idNumber":
      return validateIdNumber(value, idType)
    case "nationality":
      return !value ? "La nationalité est requise" : null
    case "region":
      return !value ? "La région / localité de résidence est requise" : null
    case "currentStructure":
      return null
    case "education":
      return !value ? "Le niveau d'études est requis" : null
    case "formation":
      return !value ? "Veuillez sélectionner une formation" : null
    case "isWorking":
      return value === undefined ? "Veuillez répondre par oui ou non" : null
    default:
      return null
  }
}
