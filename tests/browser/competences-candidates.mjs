// Synthetic data and intercepted API calls only: no real candidates or emails.
import assert from "node:assert/strict"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"
import trainingDefaults from "../../data/training-defaults.js"
import { DEFAULT_TRAINING_SITES } from "../../lib/training-eligibility.js"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
const admin = { id: "admin", email: "admin@example.org", admin_type: "super_admin" }
const candidates = Array.from({ length: 45 }, (_, index) => ({
  id: String(index + 1).padStart(24, "0"), first_name: index === 0 ? "\u00c9milie" : `Candidat ${index + 1}`, last_name: "Diop",
  email: `candidate${index + 1}@example.org`, phone: `+22177${String(index).padStart(7, "0")}`,
  gender: "female", desired_training: "dev-web-mobile", status: "pending", application_date: "2026-10-22T10:00:00Z",
  date_of_birth: "2000-10-22",
  training_site: index === 0 ? "dakar" : "thies", training_site_name: index === 0 ? "Dakar" : "Thiès",
}))
const frozenToday = new Date("2026-11-17T12:00:00Z")
candidates.push(...[
  { first_name: "Anniversaire", last_name: "TrenteAns", date_of_birth: "1996-11-17" },
  { first_name: "Date", last_name: "Manquante", date_of_birth: null },
  { first_name: "Date", last_name: "Invalide", date_of_birth: "2001-02-29" },
  { first_name: "Date", last_name: "Future", date_of_birth: "2027-01-01" },
].map((values, index) => ({ ...candidates[1], id: String(46 + index).padStart(24, "0"),
  email: `eligibility${index}@example.org`, ...values })))
const eligibilityOf = (candidate) => {
  if (!candidate.date_of_birth || candidate.date_of_birth === "2001-02-29" || candidate.date_of_birth > "2026-11-17") return "unknown"
  return candidate.date_of_birth <= "1996-11-17" ? "ineligible" : "eligible"
}
const normalize = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
const requests = []
const details = []
const exports = []
let fail = false
let holdSummary = true
let releaseSummary
let browser
let server
try {
  server = await startBrowserServer(baseUrl)
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  await context.route("**/*", (route) => new URL(route.request().url()).origin === new URL(baseUrl).origin
    ? route.continue() : route.abort())
  await context.addInitScript((user) => {
    localStorage.setItem("admin_token", "mock-browser-token")
    localStorage.setItem("admin_type", user.admin_type)
    localStorage.setItem("admin_user", JSON.stringify(user))
  }, admin)
  const page = await context.newPage()
  await page.clock.setFixedTime(frozenToday)
  page.setDefaultTimeout(15000)
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route("**/api/**", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin, "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "content-type, authorization", "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS" }
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers })
    if (url.pathname.endsWith("/trainings")) return route.fulfill({ headers, json: { success: true, data: trainingDefaults, trainingSites: DEFAULT_TRAINING_SITES } })
    let data = { success: true, data: [] }
    const search = normalize(url.searchParams.get("search") || "").trim()
    const site = url.searchParams.get("training_site")
    const eligibility = url.searchParams.get("eligibility") || "all"
    const filtered = candidates.filter((candidate) => (!site || site === "all" || candidate.training_site === site)
      && (eligibility === "all" || eligibilityOf(candidate) === eligibility)
      && search.split(/\s+/).every((term) => normalize(`${candidate.first_name} ${candidate.last_name} ${candidate.email} ${candidate.phone}`).includes(term)))
    if (url.pathname === "/api/admin/candidatures") {
      const number = Number(url.searchParams.get("page"))
      const size = Number(url.searchParams.get("per_page"))
      assert.ok(number >= 1 && size >= 1 && size <= 100, "No unbounded candidate request on the directory")
      requests.push({ page: number, per_page: size, search, status: url.searchParams.get("status"), site, eligibility })
      if (fail) return route.fulfill({ status: 503, headers, json: { success: false, error: "Chargement indisponible" } })
      data = { success: true, data: filtered.slice((number - 1) * size, number * size), total: filtered.length,
        pagination: { page: number, per_page: size, total: filtered.length, total_pages: Math.ceil(filtered.length / size) } }
    } else if (url.pathname.endsWith("/candidatures/dashboard")) {
      if (holdSummary) await new Promise((resolve) => { releaseSummary = resolve })
      data.data = { stats: { total: candidates.length, femmes: candidates.length, hommes: 0, acceptes: 0, enAttente: candidates.length, refuses: 0 },
        formations: { "dev-web-mobile": { total: candidates.length, femmes: candidates.length, hommes: 0, acceptes: 0, enAttente: candidates.length, refuses: 0 } },
        daily: [{ date: "22/10", applications: candidates.length }], nationalities: [{ name: "Senegalaise", value: candidates.length }] }
    } else if (url.pathname.endsWith("/candidatures/export")) {
      exports.push(Object.fromEntries(url.searchParams))
      assert.equal(url.searchParams.has("page"), false)
      return route.fulfill({ headers, contentType: "text/csv; charset=utf-8",
        body: "\ufeffPrenom,Nom,Email\n" + filtered.map((candidate) => `${candidate.first_name},${candidate.last_name},${candidate.email}`).join("\n") })
    } else if (/\/candidatures\/[a-f0-9]{24}$/.test(url.pathname)) {
      details.push(url.pathname.split("/").at(-1))
      data.data = { ...candidates.find((candidate) => candidate.id === details.at(-1)), nationality: "Senegalaise" }
    }
    return route.fulfill({ headers, contentType: "application/json", body: JSON.stringify(data) })
  })
  const firstSummaryRequest = page.waitForRequest((request) => new URL(request.url()).pathname.endsWith("/candidatures/dashboard"), { timeout: 30000 })
  await page.goto(`${baseUrl}/astrodmin/competences`, { waitUntil: "domcontentloaded", timeout: 90000 })
  await page.getByRole("heading", { name: "Dashboard Comp\u00e9tences", exact: true }).waitFor()
  await firstSummaryRequest
  assert.equal(requests.length, 0, "Do not download candidates while the overview is open")
  console.log("Candidates dashboard loaded")
  await page.getByRole("tab", { name: "Candidats", exact: true }).click()
  const panel = page.getByRole("tabpanel", { name: "Candidats", exact: true })
  const row = (name) => panel.getByRole("row").filter({ has: page.getByText(name, { exact: true }) })
  await row("\u00c9milie Diop").waitFor().catch(async (error) => {
    console.error("Directory requests:", requests)
    console.error("Page content:", await page.locator("body").innerText())
    console.error("Browser errors:", errors)
    throw error
  })
  assert.equal(await panel.getByRole("row").count(), 21)
  assert.equal(requests.at(-1).eligibility, "eligible", "The directory initially requests only candidates under 30")
  assert.equal(await panel.getByRole("combobox", { name: "Éligibilité par âge", exact: true }).innerText(), "Éligibles (< 30 ans)")
  assert.equal(details.length, 0)
  holdSummary = false
  releaseSummary?.()
  console.log("Bounded first page verified")
  await panel.getByRole("button", { name: "Suivant", exact: true }).click()
  await row("Candidat 21 Diop").waitFor()
  assert.equal(requests.at(-1).page, 2)
  const eligibilitySelect = panel.getByRole("combobox", { name: "Éligibilité par âge", exact: true })
  await eligibilitySelect.click()
  await page.getByRole("option", { name: "Non éligibles (30 ans et plus)", exact: true }).click()
  await row("Anniversaire TrenteAns").waitFor()
  assert.equal(requests.at(-1).eligibility, "ineligible")
  assert.equal(requests.at(-1).page, 1, "Changing age eligibility resets pagination")
  await panel.getByText("1 candidat(s) au total", { exact: true }).waitFor()
  await eligibilitySelect.click()
  await page.getByRole("option", { name: "À vérifier", exact: true }).click()
  await row("Date Manquante").waitFor()
  await row("Date Invalide").waitFor()
  await row("Date Future").waitFor()
  assert.equal(requests.at(-1).eligibility, "unknown")
  await panel.getByText("3 candidat(s) au total", { exact: true }).waitFor()
  await eligibilitySelect.click()
  await page.getByRole("option", { name: "Tous les candidats", exact: true }).click()
  await row("\u00c9milie Diop").waitFor()
  assert.equal(requests.at(-1).eligibility, "all")
  await panel.getByText("49 candidat(s) au total", { exact: true }).waitFor()
  await eligibilitySelect.click()
  await page.getByRole("option", { name: "Éligibles (< 30 ans)", exact: true }).click()
  await panel.getByText("45 candidat(s) au total", { exact: true }).waitFor()
  await panel.getByRole("searchbox", { name: "Rechercher un candidat" }).fill("  EMILIE   DIOP  ")
  await row("\u00c9milie Diop").waitFor()
  assert.equal(requests.at(-1).page, 1)
  await panel.getByText("1 candidat(s) au total", { exact: true }).waitFor()
  await panel.getByRole("combobox", { name: "Site de formation", exact: true }).click()
  await page.getByRole("option", { name: "Thiès", exact: true }).click()
  await panel.getByText("0 candidat(s) au total", { exact: true }).waitFor()
  assert.equal(requests.at(-1).site, "thies")
  assert.equal(requests.at(-1).page, 1)
  await panel.getByRole("combobox", { name: "Site de formation", exact: true }).click()
  await page.getByRole("option", { name: "Dakar", exact: true }).click()
  await row("\u00c9milie Diop").waitFor()
  await row("\u00c9milie Diop").getByRole("button", { name: "Menu", exact: true }).click()
  await page.getByRole("menuitem", { name: "Voir les d\u00e9tails", exact: true }).click()
  await page.getByRole("heading", { name: /milie/ }).waitFor()
  assert.deepEqual(details, [candidates[0].id])
  console.log("Search and lazy details verified")
  // Reload with no saved filter to validate complete CSV and XLSX downloads.
  await page.reload({ waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Exporter", exact: true }).click()
  await page.getByText("Export : moins de 30 ans", { exact: true }).waitFor()
  await page.keyboard.press("Escape")
  await page.getByRole("tab", { name: "Candidats", exact: true }).click()
  await row("\u00c9milie Diop").waitFor()
  await page.getByRole("button", { name: "Exporter", exact: true }).click()
  const csvDownload = page.waitForEvent("download")
  await page.getByRole("menuitem", { name: "Exporter en CSV", exact: true }).click()
  let csv = ""
  for await (const chunk of await (await csvDownload).createReadStream()) csv += chunk.toString()
  assert.equal(csv.trim().split("\n").length, 46)
  assert.ok(csv.includes("candidate45@example.org"))
  await page.getByRole("button", { name: "Exporter", exact: true }).click()
  const xlsxDownload = page.waitForEvent("download")
  await page.getByRole("menuitem", { name: "Exporter en Excel", exact: true }).click()
  const xlsx = await xlsxDownload
  assert.equal(xlsx.suggestedFilename(), "candidats-competences.xlsx")
  const XLSX = await import("xlsx")
  const chunks = []
  for await (const chunk of await xlsx.createReadStream()) chunks.push(chunk)
  const book = XLSX.read(Buffer.concat(chunks), { type: "buffer" })
  assert.equal(XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]]).length, 45)
  assert.equal(exports.length, 2)
  assert.ok(exports.every((filters) => filters.eligibility === "eligible"), "CSV and XLSX exports keep the directory age filter")
  await panel.getByRole("combobox", { name: "Éligibilité par âge", exact: true }).click()
  await page.getByRole("option", { name: "À vérifier", exact: true }).click()
  await row("Date Manquante").waitFor()
  await page.getByRole("button", { name: "Exporter", exact: true }).click()
  await page.getByText("Export : âge à vérifier", { exact: true }).waitFor()
  const unknownDownload = page.waitForEvent("download")
  await page.getByRole("menuitem", { name: "Exporter en CSV", exact: true }).click()
  let unknownCsv = ""
  for await (const chunk of await (await unknownDownload).createReadStream()) unknownCsv += chunk.toString()
  assert.equal(unknownCsv.trim().split("\n").length, 4)
  assert.equal(exports.at(-1).eligibility, "unknown")
  fail = true
  await page.getByRole("button", { name: "Actualiser", exact: true }).click()
  await page.getByRole("alert").getByText(/Impossible de charger les données pour le moment/).waitFor()
  fail = false
  await page.getByRole("button", { name: "Actualiser", exact: true }).click()
  await row("Date Manquante").waitFor()
  assert.deepEqual(errors, [])
  console.log("PASS: candidats pagines, recherche serveur, remise a zero de page, details a la demande, exports CSV/XLSX complets et reprise apres erreur")
  await context.close()
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
