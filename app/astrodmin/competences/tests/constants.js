import { DEFAULT_TRAININGS, trainingOptions } from "../../../../lib/training-catalog.js"

export const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
export const OUTLOOK_DEEPLINK_URL = "https://outlook.office.com/mail/deeplink/compose"
export const OUTLOOK_BCC_CHUNK_SIZE = 80
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export const FORMATION_OPTIONS = trainingOptions(DEFAULT_TRAININGS, "value")
export const FORMATIONS = FORMATION_OPTIONS.map((formation) => formation.value)
