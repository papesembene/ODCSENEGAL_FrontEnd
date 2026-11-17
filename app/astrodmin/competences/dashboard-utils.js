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

export function calculateAge(dateOfBirth, today = new Date()) {
  if (typeof dateOfBirth !== "string" || !(today instanceof Date) || !Number.isFinite(today.getTime())) return null
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth)
  if (!parts) return null

  const [year, month, day] = parts.slice(1).map(Number)
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) return null

  const currentYear = today.getUTCFullYear()
  const currentMonth = today.getUTCMonth() + 1
  const currentDay = today.getUTCDate()
  if (year > currentYear || (year === currentYear && month > currentMonth)
    || (year === currentYear && month === currentMonth && day > currentDay)) return null

  const birthdayPending = month > currentMonth || (month === currentMonth && day > currentDay)
  return currentYear - year - (birthdayPending ? 1 : 0)
}
