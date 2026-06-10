export const FORM_FEEDBACK_MESSAGES = {
  checking: "Verification en cours...",
  duplicateEmail: "Cet email a deja ete utilise pour une candidature.",
  duplicatePhone: "Ce numero de telephone a deja ete utilise pour une candidature.",
  duplicateIdNumber: "Ce numero CNI/passeport est deja utilise.",
  genericSubmissionError: "Une erreur est survenue lors de la soumission.",
  successTitle: "Candidature envoyee avec succes !",
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
