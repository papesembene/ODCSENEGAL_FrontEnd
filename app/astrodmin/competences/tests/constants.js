export const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
export const OUTLOOK_DEEPLINK_URL = "https://outlook.office.com/mail/deeplink/compose"
export const OUTLOOK_BCC_CHUNK_SIZE = 80
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export const FORMATION_OPTIONS = [
  {
    value: "Dev Web",
    label: "Dev Web",
    aliases: ["dev-web-mobile", "developpement-web-mobile", "développement web", "developpement web", "dev web mobile"],
  },
  {
    value: "Data",
    label: "Data",
    aliases: ["dev-data", "data science", "dev data"],
  },
  {
    value: "Hackeuse",
    label: "Hackeuse",
    aliases: ["hackeuses", "hackeuse"],
  },
  {
    value: "AWS",
    label: "AWS",
    aliases: ["aws-cloud", "aws cloud", "cloud"],
  },
  {
    value: "Référent Digital",
    label: "Référent Digital",
    aliases: ["referent-digital", "référent-digital", "referent digital", "référent digital"],
  },
  {
    value: "Cyber security",
    label: "Cyber security",
    aliases: ["cyber-security", "cybersecurity", "cyber sécurité", "cyber securite"],
  },
  {
    value: "Intelligence Artificielle",
    label: "Intelligence Artificielle",
    aliases: ["intelligence-artificielle", "ia", "ai"],
  },
]

export const FORMATIONS = FORMATION_OPTIONS.map((formation) => formation.value)
