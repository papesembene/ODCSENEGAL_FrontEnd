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

export const CANDIDATES_LIST = [
  {
    id: 1,
    name: "Amadou Diallo",
    email: "amadou.diallo@gmail.com",
    phone: "+221771234567",
    referentiel: "Développement Web",
  },
  {
    id: 2,
    name: "Fatou Sall",
    email: "fatou.sall@gmail.com",
    phone: "+221772234567",
    referentiel: "Développement Web",
  },
  {
    id: 3,
    name: "Moussa Kane",
    email: "moussa.kane@gmail.com",
    phone: "+221773234567",
    referentiel: "Développement Web",
  },
  { id: 4, name: "Aïssatou Ba", email: "aissatou.ba@gmail.com", phone: "+221774234567", referentiel: "Data Science" },
  { id: 5, name: "Omar Ndiaye", email: "omar.ndiaye@gmail.com", phone: "+221775234567", referentiel: "Data Science" },
  { id: 6, name: "Mariama Diop", email: "mariama.diop@gmail.com", phone: "+221776234567", referentiel: "Hackeuse" },
  { id: 7, name: "Ibrahima Sy", email: "ibrahima.sy@gmail.com", phone: "+221777234567", referentiel: "AWS Cloud" },
  {
    id: 8,
    name: "Khady Faye",
    email: "khady.faye@gmail.com",
    phone: "+221778234567",
    referentiel: "Développement Web",
  },
  {
    id: 9,
    name: "Abdoulaye Sarr",
    email: "abdoulaye.sarr@gmail.com",
    phone: "+221779234567",
    referentiel: "Data Science",
  },
  { id: 10, name: "Ndeye Fall", email: "ndeye.fall@gmail.com", phone: "+221770234567", referentiel: "Référent Digital" },
]
