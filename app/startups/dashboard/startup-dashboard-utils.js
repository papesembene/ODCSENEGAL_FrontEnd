import {
  AlertCircle,
  BarChart,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Users,
} from "lucide-react"

export const DASHBOARD_ICONS = {
  alertCircle: AlertCircle,
  barChart: BarChart,
  calendar: Calendar,
  checkCircle: CheckCircle,
  clock: Clock,
  fileText: FileText,
  users: Users,
}

export function getStatusColor(status) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "completed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "in-progress":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    case "pending":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    case "upcoming":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }
}

export function getStatusIcon(status) {
  switch (status) {
    case "completed":
      return { icon: DASHBOARD_ICONS.checkCircle, className: "text-green-500" }
    case "in-progress":
      return { icon: DASHBOARD_ICONS.clock, className: "text-orange-500" }
    case "pending":
      return { icon: DASHBOARD_ICONS.alertCircle, className: "text-gray-500" }
    default:
      return { icon: DASHBOARD_ICONS.alertCircle, className: "text-gray-500" }
  }
}

export function getFileIcon(type) {
  switch (type) {
    case "pdf":
      return { icon: DASHBOARD_ICONS.fileText, className: "text-red-500" }
    case "pptx":
      return { icon: DASHBOARD_ICONS.fileText, className: "text-orange-500" }
    case "xlsx":
      return { icon: DASHBOARD_ICONS.fileText, className: "text-green-500" }
    default:
      return { icon: DASHBOARD_ICONS.fileText, className: "text-gray-500" }
  }
}
