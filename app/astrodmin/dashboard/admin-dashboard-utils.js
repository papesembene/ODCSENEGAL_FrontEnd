import {
  Activity,
  AlertCircle,
  Briefcase,
  Calendar,
  FileText,
  Users,
} from "lucide-react"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export const RANGE_OPTIONS = [7, 14, 30]

export function getAdminLabel(adminType) {
  if (adminType === "competences") {
    return "Gestion des Compétences"
  }

  if (adminType === "startups") {
    return "Gestion des Startups"
  }

  return "Vue d'ensemble"
}

export function getActivityStyles(type) {
  switch (type) {
    case "candidature":
      return {
        className: "bg-orange-100 text-orange-600",
        icon: Users,
      }
    case "test":
      return {
        className: "bg-indigo-100 text-indigo-600",
        icon: FileText,
      }
    case "startup":
      return {
        className: "bg-blue-100 text-blue-600",
        icon: Briefcase,
      }
    case "event":
      return {
        className: "bg-green-100 text-green-600",
        icon: Calendar,
      }
    default:
      return {
        className: "bg-gray-100 text-gray-600",
        icon: Activity,
      }
  }
}

export function buildGlobalStatCards(globalStats, moduleStats) {
  return [
    {
      title: "Total Candidatures",
      value: globalStats.totalCandidatures,
      icon: Users,
      iconClassName: "text-muted-foreground",
      footer: {
        text: "vs mois dernier",
        value: `${globalStats.croissance >= 0 ? "+" : ""}${globalStats.croissance}%`,
        valueClassName: globalStats.croissance >= 0 ? "text-green-600" : "text-red-600",
      },
    },
    {
      title: "Compétences",
      value: globalStats.candidaturesCompetences,
      icon: Users,
      iconClassName: "text-orange-500",
      progress: 64,
    },
    {
      title: "Tests programmés",
      value: globalStats.testsProgrammes,
      icon: FileText,
      iconClassName: "text-muted-foreground",
      footer: {
        text: `${moduleStats.tests.actifs} actif${moduleStats.tests.actifs > 1 ? "s" : ""}`,
      },
    },
    {
      title: "Événements",
      value: globalStats.evenementsAVenir,
      icon: Calendar,
      iconClassName: "text-muted-foreground",
      footer: {
        text: "À venir ce mois",
      },
    },
    {
      title: "Taux d'acceptation",
      value: `${globalStats.tauxAcceptation}%`,
      icon: Activity,
      iconClassName: "text-green-500",
      progress: globalStats.tauxAcceptation,
    },
  ]
}

export function getEmptyChartCopy(kind) {
  switch (kind) {
    case "applications":
      return {
        title: "Aucune donnée disponible",
        description: "Les données apparaîtront ici dès qu'il y aura des candidatures",
      }
    case "gender":
      return {
        title: "Aucune donnée de genre disponible",
        description: "Les candidatures n'ont pas encore renseigné le genre",
      }
    case "status":
      return {
        title: "Aucune donnée de statut disponible",
        description: "Les statuts apparaîtront ici une fois les candidatures traitées",
      }
    case "nationality":
      return {
        title: "Aucune donnée de nationalité disponible",
        description: "Les nationalités apparaîtront ici une fois les candidatures enregistrées",
      }
    default:
      return {
        title: "Aucune donnée disponible",
        description: "Les données apparaîtront ici prochainement",
      }
  }
}
