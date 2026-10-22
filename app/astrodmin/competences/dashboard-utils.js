export function getStatusColor(status) {
  switch (status) {
    case "accepted":
      return "bg-green-500"
    case "rejected":
      return "bg-red-500"
    case "pending":
      return "bg-yellow-500"
    case "interview":
    case "interviewed":
      return "bg-blue-500"
    default:
      return "bg-gray-500"
  }
}

export function getStatusLabel(status) {
  switch (status) {
    case "accepted":
      return "Accepté"
    case "rejected":
      return "Refusé"
    case "pending":
      return "En attente"
    case "interview":
    case "interviewed":
      return "Entretien"
    default:
      return status
  }
}

export function getGenderLabel(gender) {
  switch (gender) {
    case "female":
      return "Femme"
    case "male":
      return "Homme"
    default:
      return gender || "Non spécifié"
  }
}

export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null

  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}
