import { countryCodes } from "./constants.js"
import { sanitizeFieldValue, buildNextFormData } from "./input-helpers.js"
import { validateField } from "./validation.js"
import { eligibleTrainings, RESIDENCE_LOCATIONS } from "../../../lib/training-eligibility.js"
import { FORM_FEEDBACK_MESSAGES } from "../../../lib/form-feedback.js"

export function initialCandidature() {
  return {
    firstName: "", lastName: "", email: "", phone: "", phoneCountry: "SN", birthDate: "", birthPlace: "",
    gender: "", idType: "", idNumber: "", nationality: "", region: "", currentStructure: "", education: "",
    speciality: "", computer_skills: undefined, isWorking: undefined, contractType: "", isAvailable: undefined,
    trainingSite: "", formation: "", acceptTerms: false,
  }
}

export function phoneCountry(values) {
  return countryCodes.find((country) => country.abbr === values.phoneCountry) || countryCodes[0]
}

export function changeCandidature(values, name, value, trainings, residenceLocations = RESIDENCE_LOCATIONS) {
  const cleaned = typeof value === "string" ? sanitizeFieldValue({ name, value,
    selectedCountry: phoneCountry(values), idType: values.idType }) : value
  const next = buildNextFormData(values, name, cleaned)
  if (name === "idType" && value !== values.idType) next.idNumber = ""
  if (name === "phoneCountry" && value !== values.phoneCountry) next.phone = ""
  if (name === "isWorking" && !value) next.contractType = ""
  if (["trainingSite", "gender"].includes(name) && next.formation
    && !eligibleTrainings(trainings, next.trainingSite, next.gender).some((item) => item.code === next.formation)) {
    next.formation = ""
    next.education = ""
    next.currentStructure = ""
  }
  return next
}

export function candidatureErrors(values, trainings, duplicates = {}, residenceLocations = RESIDENCE_LOCATIONS, sites = []) {
  const errors = {}
  for (const name of ["firstName", "lastName", "email", "phone", "birthDate", "birthPlace", "gender",
    "idNumber", "nationality", "region", "education", "formation", "isWorking"]) {
    const error = validateField(name, values[name], { idType: values.idType, selectedCountry: phoneCountry(values) })
    if (error) errors[name] = error
  }
  if (!["cni", "passport"].includes(values.idType)) errors.idType = "Choisissez votre type de pièce d'identité."
  if (!sites.some((site) => site.code === values.trainingSite && site.status === "active")
    || !eligibleTrainings(trainings, values.trainingSite, values.gender).length) {
    errors.trainingSite = "Choisissez un site de formation disponible."
  }
  if (values.formation && !eligibleTrainings(trainings, values.trainingSite, values.gender)
    .some((item) => item.code === values.formation)) {
    errors.formation = "Choisissez une formation proposée sur ce site et adaptée à votre profil."
  }
  for (const name of ["computer_skills", "isWorking", "isAvailable"]) {
    if (typeof values[name] !== "boolean") errors[name] = "Choisissez Oui ou Non."
  }
  if (!values.acceptTerms) errors.acceptTerms = "Veuillez accepter le traitement de vos données pour envoyer votre candidature."
  if (duplicates.email) errors.email = FORM_FEEDBACK_MESSAGES.duplicateEmail
  if (duplicates.idNumber) errors.idNumber = FORM_FEEDBACK_MESSAGES.duplicateIdNumber
  return errors
}

export function candidaturePayload(values) {
  return {
    first_name: values.firstName.trim(), last_name: values.lastName.trim(), email: values.email.trim(),
    phone: `${phoneCountry(values).code} ${values.phone}`, date_of_birth: values.birthDate,
    place_of_birth: values.birthPlace.trim(), gender: values.gender, id_type: values.idType,
    cni_or_passport_number: values.idNumber.trim(), nationality: values.nationality,
    region_of_residence: values.region, current_structure: values.currentStructure, education_level: values.education,
    computer_skills: values.computer_skills, available_for_10_months: values.isAvailable,
    training_site: values.trainingSite, desired_training: values.formation, accept_conditions: values.acceptTerms, speciality: values.speciality,
    is_working: values.isWorking, contract_type: values.isWorking ? values.contractType : "",
  }
}
