export const INITIAL_EVENT_FORM = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  category: "",
  image: null,
  imagePreview: "",
  details: "",
  agenda: "",
  speakers: "",
}

export const INITIAL_REGISTRATION_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
}

export const EVENT_FILTER_OPTIONS = [
  { value: "all", label: "Tous les événements" },
  { value: "Hackathon", label: "Hackathon" },
  { value: "Masterclass", label: "Masterclass" },
  { value: "Workshop", label: "Workshop" },
]

export const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

export const WEEK_DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

export function formatEventDate(dateObj) {
  if (typeof dateObj === "string") return dateObj

  if (dateObj && dateObj.$date) {
    const date = new Date(dateObj.$date)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  try {
    const date = new Date(dateObj)
    return Number.isNaN(date.getTime())
      ? "Date inconnue"
      : date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
  } catch {
    return "Date inconnue"
  }
}

export function normalizeEvent(event) {
  return {
    ...event,
    date: formatEventDate(event.date),
    rawDate: event.date,
  }
}

export function getCategoryColor(category = "") {
  switch (category.toLowerCase()) {
    case "pitch":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "formation":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "workshop":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "hackathon":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    case "conférence":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "networking":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }
}

export function buildEventPayload(eventForm) {
  const payload = new FormData()
  payload.append("title", eventForm.title)
  payload.append("date", new Date(eventForm.date).toISOString())
  payload.append("time", eventForm.time)
  payload.append("location", eventForm.location)

  if (eventForm.description) payload.append("description", eventForm.description)
  if (eventForm.category) payload.append("category", eventForm.category)
  if (eventForm.details) payload.append("details", eventForm.details)

  if (eventForm.agenda) {
    payload.append(
      "agenda",
      JSON.stringify(eventForm.agenda.split("\n").filter((item) => item.trim() !== "")),
    )
  }

  if (eventForm.speakers) {
    payload.append(
      "speakers",
      JSON.stringify(
        eventForm.speakers.split("\n").map((speaker) => {
          const [name, role] = speaker.split("|").map((item) => item.trim())
          return { name, role }
        }),
      ),
    )
  }

  if (eventForm.image) {
    payload.append("image", eventForm.image)
  }

  return payload
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}
