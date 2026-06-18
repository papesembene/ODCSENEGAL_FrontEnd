import { INITIAL_REGISTER_FORM, PROFILE_LABELS } from "./register-constants"

export function createInitialErrors() {
  return {
    email: null,
    password: null,
    confirmPassword: null,
    profileType: null,
    acceptTerms: null,
    form: {},
  }
}

export function validateAccountStep(formData) {
  const errors = createInitialErrors()
  let isValid = true

  if (!formData.email) {
    errors.email = "L'email est requis"
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Format d'email invalide"
    isValid = false
  }

  if (!formData.password) {
    errors.password = "Le mot de passe est requis"
    isValid = false
  } else if (formData.password.length < 8) {
    errors.password = "Le mot de passe doit contenir au moins 8 caractères"
    isValid = false
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = "Veuillez confirmer votre mot de passe"
    isValid = false
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas"
    isValid = false
  }

  if (!formData.profileType) {
    errors.profileType = "Veuillez sélectionner un type de profil"
    isValid = false
  }

  if (!formData.acceptTerms) {
    errors.acceptTerms = "Vous devez accepter les conditions générales et la politique de confidentialité"
    isValid = false
  }

  return { isValid, errors }
}

export function validateProfileStep(formData) {
  const errors = {}
  let isValid = true

  if (formData.profileType === "student") {
    if (!formData.institution) {
      errors.institution = "L'établissement est requis"
      isValid = false
    }
    if (!formData.educationLevel) {
      errors.educationLevel = "Le niveau d'études est requis"
      isValid = false
    }
    if (!formData.sector) {
      errors.sector = "Le secteur est requis"
      isValid = false
    }
  }

  if (formData.profileType === "startup") {
    if (!formData.companyName) {
      errors.companyName = "Le nom de l'entreprise est requis"
      isValid = false
    }
    if (!formData.companySector) {
      errors.companySector = "Le secteur est requis"
      isValid = false
    }
    if (!formData.location) {
      errors.location = "La localisation est requise"
      isValid = false
    }
    if (!formData.valueProposition) {
      errors.valueProposition = "La proposition de valeur est requise"
      isValid = false
    }
    if (!formData.maturityStage) {
      errors.maturityStage = "Le stade de maturité est requis"
      isValid = false
    }
  }

  if (formData.profileType === "corporate" || formData.profileType === "investor") {
    if (!formData.organizationName) {
      errors.organizationName = "Le nom de l'organisation est requis"
      isValid = false
    }
    if (!formData.activities) {
      errors.activities = "Les activités sont requises"
      isValid = false
    }
    if (!formData.interestSectors) {
      errors.interestSectors = "Les secteurs d'intérêt sont requis"
      isValid = false
    }
  }

  return { isValid, errors }
}

export function buildRegisterPayload(formData) {
  const payload = new FormData()

  payload.append("email", formData.email)
  payload.append("password", formData.password)
  payload.append("profileType", formData.profileType)

  if (formData.profileType === "student") {
    payload.append("institution", formData.institution)
    payload.append("educationLevel", formData.educationLevel)
    payload.append("sector", formData.sector)
    payload.append("motivations", formData.motivations)
    payload.append("interests", formData.interests)
    if (formData.cvFile) payload.append("cv_file", formData.cvFile)
    if (formData.coverLetterFile) payload.append("cover_letter_file", formData.coverLetterFile)
  }

  if (formData.profileType === "startup") {
    payload.append("companyName", formData.companyName)
    payload.append("companySector", formData.companySector)
    payload.append("location", formData.location)
    payload.append("valueProposition", formData.valueProposition)
    payload.append("maturityStage", formData.maturityStage)
    payload.append("foundingTeam", formData.foundingTeam)
    payload.append("needs", formData.needs)
    if (formData.logo) payload.append("logo_file", formData.logo)
    if (formData.pitchDeckFile) payload.append("pitch_deck_file", formData.pitchDeckFile)
    if (formData.businessPlanFile) payload.append("business_plan_file", formData.businessPlanFile)
  }

  if (formData.profileType === "corporate" || formData.profileType === "investor") {
    payload.append("organizationName", formData.organizationName)
    payload.append("activities", formData.activities)
    payload.append("interestSectors", formData.interestSectors)
    payload.append("cooperationObjectives", formData.cooperationObjectives)
    if (formData.brochureFile) payload.append("brochure_file", formData.brochureFile)
  }

  return payload
}

export function buildRegisterSummary(formData) {
  return {
    basic: [
      { label: "Email", value: formData.email },
      { label: "Type de profil", value: PROFILE_LABELS[formData.profileType] || formData.profileType },
    ],
    student: [
      { label: "Établissement", value: formData.institution },
      { label: "Niveau d'études", value: formData.educationLevel },
      { label: "Secteur", value: formData.sector },
      { label: "Motivations", value: formData.motivations, fullWidth: true },
      { label: "CV", value: formData.cvFile?.name, accent: true },
    ],
    startup: [
      { label: "Nom de l'entreprise", value: formData.companyName },
      { label: "Secteur", value: formData.companySector },
      { label: "Localisation", value: formData.location },
      { label: "Stade de maturité", value: formData.maturityStage },
      { label: "Proposition de valeur", value: formData.valueProposition, fullWidth: true },
    ],
    partner: [
      { label: "Nom de l'organisation", value: formData.organizationName },
      { label: "Activités", value: formData.activities, fullWidth: true },
      { label: "Secteurs d'intérêt", value: formData.interestSectors, fullWidth: true },
    ],
  }
}

export function createInitialRegisterForm() {
  return { ...INITIAL_REGISTER_FORM }
}
