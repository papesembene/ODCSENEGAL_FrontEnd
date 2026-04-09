export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const ALLOWED_FILE_TYPES = {
  "image/png": ".png",
  "image/jpeg": ".jpg, .jpeg",
  "image/jpg": ".jpg",
  "image/gif": ".gif",
  "image/bmp": ".bmp",
  "image/webp": ".webp",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "application/pdf": ".pdf",
}

export const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".doc", ".docx", ".ppt", ".pptx", ".pdf"]

export const MAX_FILE_SIZE = 128 * 1024 * 1024

export const FILE_INPUT_ACCEPT = ".png,.jpg,.jpeg,.gif,.bmp,.webp,.doc,.docx,.ppt,.pptx,.pdf"

export const FILE_FORMATS_HELP_TEXT = "Images, Word, PowerPoint, PDF (MAX. 128MB)"

export const FILE_TYPE_ERROR_MESSAGE =
  "Type de fichier non autorisé. Formats acceptés : Images (PNG, JPG, JPEG, GIF, BMP, WEBP), Documents Word (DOC, DOCX), PowerPoint (PPT, PPTX), PDF"

export const FILE_SIZE_ERROR_MESSAGE = "Le fichier est trop volumineux. Taille maximale : 128MB"

export const REGIONS_DATA = {
  Dakar: ["Dakar", "Guédiawaye", "Pikine", "Rufisque"],
  Thiès: ["Thiès", "Mbour", "Tivaouane"],
  "Saint-Louis": ["Saint-Louis", "Dagana", "Podor"],
  Diourbel: ["Diourbel", "Bambey", "Mbacké"],
  Louga: ["Louga", "Kébémer", "Linguère"],
  Tambacounda: ["Tambacounda", "Bakel", "Goudiry", "Koumpentoum"],
  Kaolack: ["Kaolack", "Guinguinéo", "Nioro du Rip"],
  Ziguinchor: ["Ziguinchor", "Bignona", "Oussouye"],
  Fatick: ["Fatick", "Foundiougne", "Gossas"],
  Kolda: ["Kolda", "Médina Yoro Foulah", "Vélingara"],
  Matam: ["Matam", "Kanel", "Ranérou"],
  Kaffrine: ["Kaffrine", "Birkelane", "Koungheul", "Malem-Hodar"],
  Kédougou: ["Kédougou", "Salémata", "Saraya"],
  Sédhiou: ["Sédhiou", "Bounkiling", "Goudomp"],
}

export const COUNTRY_CODES = [
  { code: "+221", country: "Sénégal", flag: "🇸🇳" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+1", country: "États-Unis", flag: "🇺🇸" },
  { code: "+44", country: "Royaume-Uni", flag: "🇬🇧" },
  { code: "+212", country: "Maroc", flag: "🇲🇦" },
  { code: "+213", country: "Algérie", flag: "🇩🇿" },
  { code: "+225", country: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "+226", country: "Burkina Faso", flag: "🇧🇫" },
  { code: "+227", country: "Niger", flag: "🇳🇪" },
  { code: "+228", country: "Togo", flag: "🇹🇬" },
  { code: "+229", country: "Bénin", flag: "🇧🇯" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+234", country: "Nigéria", flag: "🇳🇬" },
  { code: "+237", country: "Cameroun", flag: "🇨🇲" },
].sort((a, b) => a.country.localeCompare(b.country))

export const SECTORS = [
  { value: "agriculture", label: "Agriculture" },
  { value: "education", label: "Éducation" },
  { value: "energy", label: "Énergie" },
  { value: "environment", label: "Environnement" },
  { value: "finance", label: "Finance" },
  { value: "health", label: "Santé" },
  { value: "logistics", label: "Logistique" },
  { value: "retail", label: "Commerce" },
  { value: "technology", label: "Informatique" },
  { value: "other", label: "Autre" },
]

export const ROLES = [
  { value: "CEO", label: "CEO" },
  { value: "CTO", label: "CTO" },
  { value: "CMO", label: "CMO" },
  { value: "CFO", label: "CFO" },
  { value: "Co-fondateur", label: "Co-fondateur" },
  { value: "Directeur Technique", label: "Directeur Technique" },
  { value: "Directeur Commercial", label: "Directeur Commercial" },
  { value: "Autre", label: "Autre" },
]

export const DIPLOMAS = [
  { value: "baccalaureat", label: "Baccalauréat" },
  { value: "bts", label: "BTS" },
  { value: "dut", label: "DUT" },
  { value: "licence", label: "Licence" },
  { value: "master", label: "Master" },
  { value: "doctorat", label: "Doctorat" },
  { value: "autre", label: "Autre" },
]

export const LEGAL_FORMS = [
  { value: "SAS", label: "SAS" },
  { value: "SA", label: "SA" },
  { value: "SARL", label: "SARL" },
  { value: "SUARL", label: "SUARL" },
  { value: "EI", label: "Entreprise Individuelle" },
  { value: "GIE", label: "GIE" },
  { value: "Autre", label: "Autre" },
]
