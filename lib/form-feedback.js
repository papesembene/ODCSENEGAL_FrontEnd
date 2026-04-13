export const FORM_FEEDBACK_MESSAGES = {
  checking: "Vérification en cours...",
  duplicateEmail: "Cet email a déjà été utilisé pour une candidature.",
  duplicatePhone: "Ce numéro de téléphone a déjà été utilisé pour une candidature.",
  duplicateIdNumber: "Ce numéro CNI/passeport est déjà utilisé.",
  genericSubmissionError: "Une erreur est survenue lors de la soumission.",
  successTitle: "Candidature envoyée avec succès !",
}

export function formatSubmissionErrorMessage(error) {
  const detail = error?.message?.trim()

  if (!detail) {
    return FORM_FEEDBACK_MESSAGES.genericSubmissionError
  }

  if (detail.startsWith("Erreur lors de la soumission")) {
    return detail
  }

  return `Erreur lors de la soumission : ${detail}`
}
