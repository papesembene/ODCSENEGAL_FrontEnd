import { exportToCSV, exportToExcel, exportToPDF } from "@/app/utils/export-utils"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export const INITIAL_STATS = {
  totalStartups: 0,
  orangeFabStartups: 0,
  startupLabStartups: 0,
  acceptedStartups: 0,
}

export const YEAR_OPTIONS = ["2025", "2024", "2023", "2022", "2021"]
export const PROGRAM_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"]

export const PROGRAM_CALENDAR_ITEMS = [
  {
    colorClassName: "bg-orange-100 text-orange-800",
    title: "Orange Fab - Appel à candidatures",
    date: "1er Juillet - 31 Août 2025",
  },
  {
    colorClassName: "bg-indigo-100 text-indigo-800",
    title: "Startup Lab - Bootcamp",
    date: "15-20 Septembre 2025",
  },
  {
    colorClassName: "bg-orange-100 text-orange-800",
    title: "Orange Fab - Demo Day",
    date: "15 Décembre 2025",
  },
  {
    colorClassName: "bg-indigo-100 text-indigo-800",
    title: "Startup Lab - Pitch Session",
    date: "30 Octobre 2025",
  },
]

export const UPCOMING_EVENTS = [
  { title: "Demo Day", date: "15 Juin 2025, 14:00" },
  { title: "Masterclass: Levée de fonds", date: "22 Juin 2025, 10:00" },
  { title: "Workshop: Growth Hacking", date: "29 Juin 2025, 14:00" },
]

export const SUCCESS_RATE_DATA = [
  { annee: "2021", orangeFab: 65, startupLab: 55 },
  { annee: "2022", orangeFab: 70, startupLab: 60 },
  { annee: "2023", orangeFab: 75, startupLab: 68 },
  { annee: "2024", orangeFab: 80, startupLab: 72 },
]

export function buildStartupStats(startups) {
  return {
    totalStartups: startups.length,
    orangeFabStartups: startups.filter((startup) => startup.program === "orange_fab").length,
    startupLabStartups: startups.filter((startup) => startup.program === "startup_lab").length,
    acceptedStartups: startups.filter((startup) => startup.status === "active").length,
  }
}

export function getStatusColor(status) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "inactive":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "graduated":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }
}

export function getStatusLabel(status) {
  switch (status) {
    case "active":
      return "Actif"
    case "inactive":
      return "Inactif"
    case "graduated":
      return "Diplômé"
    default:
      return status || "Non défini"
  }
}

export function getProgramLabel(program) {
  switch (program) {
    case "orange_fab":
      return "Orange Fab"
    case "startup_lab":
      return "Startup Lab"
    default:
      return program || "Non défini"
  }
}

export function buildDailyApplicationsData(startups) {
  const days = []
  const now = new Date()

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(now)
    date.setDate(date.getDate() - index)

    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const dateStr = `${day}/${month}`

    const applications = startups.filter((startup) => {
      const applicationDate = startup.applicationDate || startup.createdAt
      if (!applicationDate) return false

      try {
        const startupDate = new Date(applicationDate)
        return (
          startupDate.getDate() === date.getDate() &&
          startupDate.getMonth() === date.getMonth() &&
          startupDate.getFullYear() === date.getFullYear()
        )
      } catch {
        return (
          applicationDate.toString().includes(`${date.getFullYear()}-${month}-${day}`) ||
          applicationDate.toString().includes(`${day}/${month}`)
        )
      }
    }).length

    days.push({ date: dateStr, applications })
  }

  return days
}

export function buildProgramDistributionData(stats) {
  return [
    { name: "Orange Fab", value: stats.orangeFabStartups, color: "#FF7900" },
    { name: "Startup Lab", value: stats.startupLabStartups, color: "#4F46E5" },
  ]
}

export function filterStartups(startups, filters) {
  const normalizedSearchTerm = filters.searchTerm.toLowerCase()

  return startups.filter((startup) => {
    const matchesSearch =
      startup.startup_name?.toLowerCase().includes(normalizedSearchTerm) ||
      startup.sector?.toLowerCase().includes(normalizedSearchTerm) ||
      startup.founder_first_name?.toLowerCase().includes(normalizedSearchTerm) ||
      startup.founder_last_name?.toLowerCase().includes(normalizedSearchTerm)

    const matchesProgram = filters.programFilter === "all" || startup.program === filters.programFilter
    const matchesStatus = filters.statusFilter === "all" || startup.status === filters.statusFilter
    const matchesYear = filters.yearFilter === "all" || startup.founding_date?.includes(filters.yearFilter)

    return matchesSearch && matchesProgram && matchesStatus && matchesYear
  })
}

export function exportStartups(startups, type) {
  if (type === "csv") {
    exportToCSV(startups, "startups")
    return
  }

  if (type === "excel") {
    exportToExcel(startups, "startups")
    return
  }

  if (type === "pdf") {
    exportToPDF(startups, "startups")
  }
}

export function buildSectorDistributionData(startups) {
  return startups.reduce((accumulator, startup) => {
    const sector = startup.sector || "Non spécifié"
    const existingSector = accumulator.find((item) => item.name === sector)

    if (existingSector) {
      existingSector.value += 1
    } else {
      accumulator.push({ name: sector, value: 1 })
    }

    return accumulator
  }, [])
}

export function buildMonthlyApplicationsData(startups) {
  const months = [
    { label: "Jan", month: "01", orangeFabFallback: 5, startupLabFallback: 8 },
    { label: "Fév", month: "02", orangeFabFallback: 7, startupLabFallback: 10 },
    { label: "Mar", month: "03", orangeFabFallback: 4, startupLabFallback: 6 },
    { label: "Avr", month: "04", orangeFabFallback: 8, startupLabFallback: 12 },
    { label: "Mai", month: "05", orangeFabFallback: 10, startupLabFallback: 15 },
    { label: "Juin", month: "06", orangeFabFallback: 6, startupLabFallback: 9 },
  ]

  return months.map(({ label, month, orangeFabFallback, startupLabFallback }) => ({
    mois: label,
    orangeFab:
      startups.filter((startup) => startup.program === "orange_fab" && startup.founding_date?.includes(month)).length ||
      orangeFabFallback,
    startupLab:
      startups.filter((startup) => startup.program === "startup_lab" && startup.founding_date?.includes(month)).length ||
      startupLabFallback,
  }))
}

export function getPendingCount(startups, program) {
  return startups.filter((startup) => startup.program === program && startup.status === "pending").length
}

export function getAcceptanceRate(startups, activeCount, program) {
  const rejectedCount = startups.filter((startup) => startup.program === program && startup.status === "rejected").length

  if (activeCount <= 0) {
    return 0
  }

  return Math.round((activeCount / (activeCount + rejectedCount)) * 100)
}
