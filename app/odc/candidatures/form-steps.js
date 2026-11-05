export const CANDIDATURE_STEPS = [
  { id: "choix-site", label: "Site", fields: ["trainingSite"] },
  { id: "choix-formation", label: "Formation", fields: ["formation"] },
  { id: "identite-personnelle", label: "Identité", fields: ["firstName", "lastName", "birthDate", "birthPlace", "gender", "nationality", "idType", "idNumber"] },
  { id: "coordonnees", label: "Contact", fields: ["email", "phone", "region"] },
  { id: "parcours-disponibilites", label: "Parcours", fields: ["education", "currentStructure", "speciality",
    "computer_skills", "isWorking", "contractType", "isAvailable"] },
  { id: "validation-candidature", label: "Envoi", fields: ["acceptTerms"] },
]

export function candidatureStepErrors(errors, step, includePrevious = false) {
  const fields = CANDIDATURE_STEPS.slice(includePrevious ? 0 : step, step + 1).flatMap((item) => item.fields)
  return Object.fromEntries(Object.entries(errors).filter(([field]) => fields.includes(field)))
}

export function firstInvalidStep(errors) {
  return CANDIDATURE_STEPS.findIndex((step) => step.fields.some((field) => errors[field]))
}
