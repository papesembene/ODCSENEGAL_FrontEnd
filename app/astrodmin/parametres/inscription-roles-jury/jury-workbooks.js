const IMPORT_HEADERS = ["Prénom", "Nom", "Email", "Rôle", "Référentiels"]
const MAX_ROWS = 200

const normalize = (value) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim()
const ROLES = { validateur: "validator", validator: "validator", coach: "coach" }

export async function readJuryImport(file, catalog) {
  if (!/\.xlsx$/i.test(file.name) || file.size > 2 * 1024 * 1024) {
    throw new Error("Choisissez un fichier Excel .xlsx de 2 Mo maximum.")
  }
  const { read, utils } = await import("xlsx")
  const workbook = read(await file.arrayBuffer(), { sheetRows: MAX_ROWS + 2, sheets: 0 })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet?.["!ref"]) throw new Error("Le fichier ne contient aucun utilisateur.")
  const range = utils.decode_range(sheet["!fullref"] || sheet["!ref"])
  if (range.e.r > MAX_ROWS || range.e.c > 49) {
    throw new Error("Le fichier doit contenir au maximum 200 lignes de données et 50 colonnes.")
  }
  const [headers = [], ...rows] = utils.sheet_to_json(sheet, {
    header: 1, defval: "", blankrows: true, range: { s: { r: 0, c: 0 }, e: range.e }, raw: false,
  })
  const columns = IMPORT_HEADERS.map((header) => headers.findIndex((value) => normalize(String(value)) === normalize(header)))
  if (columns.some((column, index) => column === -1 && index !== 3)) {
    throw new Error("Les colonnes Prénom, Nom, Email et Référentiels sont requises.")
  }
  const formationsByName = new Map(catalog.flatMap(({ value, label }) => [
    [normalize(value), value], [normalize(label), value],
  ]))
  const seenEmails = new Set()
  const users = []
  const issues = []
  rows.forEach((row, index) => {
    const [first_name, last_name, emailText, roleText, formationText] = columns.map((column) => String(row[column] ?? "").trim())
    if (![first_name, last_name, emailText, roleText, formationText].some(Boolean)) return
    const line = index + 2
    const email = emailText.toLowerCase()
    const role = roleText ? ROLES[normalize(roleText)] : "validator"
    const requested = formationText.split(/[;,\n]/).map(normalize).filter(Boolean)
    const formations = [...new Set(requested.map((item) => formationsByName.get(item)))]

    let error
    if (!first_name || !last_name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error = "Prénom, nom ou adresse e-mail invalide."
    } else if (!Object.values(ROLES).includes(role)) {
      error = "Choisissez le rôle Validateur ou Coach."
    } else if (!formations.length || formations.includes(undefined)) {
      error = "Indiquez un ou plusieurs référentiels disponibles."
    } else if (seenEmails.has(email)) {
      error = "Adresse e-mail déjà présente dans le fichier."
    }
    if (error) {
      issues.push({ line, email, error })
      return
    }
    seenEmails.add(email)
    users.push({ line, payload: { first_name, last_name, email, role, formations } })
  })
  if (!users.length && !issues.length) throw new Error("Le fichier ne contient aucun utilisateur.")
  return { users, issues }
}

async function downloadWorkbook(name, sheetName, rows, widths, filter = false) {
  const { utils, writeFile } = await import("xlsx")
  const workbook = utils.book_new()
  const sheet = utils.aoa_to_sheet(rows)
  sheet["!cols"] = widths.map((wch) => ({ wch }))
  if (filter) sheet["!autofilter"] = { ref: sheet["!ref"] }
  utils.book_append_sheet(workbook, sheet, sheetName)
  writeFile(workbook, name)
}

export function downloadJuryTemplate() {
  return downloadWorkbook("modele-utilisateurs.xlsx", "Utilisateurs", [IMPORT_HEADERS], [22, 22, 40, 18, 44])
}

export function downloadJuryCredentials(credentials, name) {
  const rows = credentials.map(({ firstName, lastName, email, roleLabel, password, emailSent }) => [
    firstName, lastName, email, password, roleLabel, emailSent ? "Oui" : "Non",
  ])
  return downloadWorkbook(name, "Identifiants", [
    ["Prénom", "Nom", "Identifiant (email)", "Mot de passe temporaire", "Rôle", "Email envoyé"], ...rows,
  ], [22, 22, 42, 29, 18, 15], true)
}

export function readJuryCredentials(response, fallback) {
  const user = response.data || response.user || {}
  return {
    firstName: user.first_name || fallback.first_name || "",
    lastName: user.last_name || fallback.last_name || "",
    email: user.email || fallback.email,
    password: response.temporary_password || "",
    roleLabel: user.role_label || response.role_label || fallback.roleLabel,
    emailSent: Boolean(response.credentials_email_sent),
    emailMessage: response.credentials_email_message || "",
  }
}
