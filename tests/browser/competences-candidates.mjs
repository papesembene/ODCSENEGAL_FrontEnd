// Synthetic data and intercepted API calls only: no real candidates or emails.
import assert from "node:assert/strict"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
const admin = { id: "admin", email: "admin@example.org", admin_type: "super_admin" }
const candidates = Array.from({ length: 45 }, (_, index) => ({
  id: String(index + 1).padStart(24, "0"), first_name: index === 0 ? "\u00c9milie" : `Candidat ${index + 1}`, last_name: "Diop",
  email: `candidate${index + 1}@example.org`, phone: `+22177${String(index).padStart(7, "0")}`,
  gender: "female", desired_training: "dev-web-mobile", status: "pending", application_date: "2026-10-22T10:00:00Z",
}))
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
  await context.addInitScript((user) => {
    localStorage.setItem("admin_token", "mock-browser-token")
    localStorage.setItem("admin_type", user.admin_type)
    localStorage.setItem("admin_user", JSON.stringify(user))
  }, admin)
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route("**/api/**", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin, "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "content-type, authorization", "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS" }
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers })
    let data = { success: true, data: [] }
    const search = normalize(url.searchParams.get("search") || "").trim()
    const filtered = candidates.filter((candidate) => search.split(/\s+/).every((term) =>
      normalize(`${candidate.first_name} ${candidate.last_name} ${candidate.email} ${candidate.phone}`).includes(term)))
    if (url.pathname === "/api/admin/candidatures") {
      const number = Number(url.searchParams.get("page"))
      const size = Number(url.searchParams.get("per_page"))
      assert.ok(number >= 1 && size >= 1 && size <= 100, "No unbounded candidate request on the directory")
      requests.push({ page: number, per_page: size, search, status: url.searchParams.get("status") })
      if (fail) return route.fulfill({ status: 503, headers, json: { success: false, error: "Chargement indisponible" } })
      data = { success: true, data: filtered.slice((number - 1) * size, number * size), total: filtered.length,
        pagination: { page: number, per_page: size, total: filtered.length, total_pages: Math.ceil(filtered.length / size) } }
    } else if (url.pathname.endsWith("/candidatures/dashboard")) {
      if (holdSummary) await new Promise((resolve) => { releaseSummary = resolve })
      data.data = { stats: { total: 45, femmes: 45, hommes: 0, acceptes: 0, enAttente: 45, refuses: 0 },
        formations: { "dev-web-mobile": { total: 45, femmes: 45, hommes: 0, acceptes: 0, enAttente: 45, refuses: 0 } },
        daily: [{ date: "22/10", applications: 45 }], nationalities: [{ name: "Senegalaise", value: 45 }] }
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
  await page.goto(`${baseUrl}/astrodmin/competences`, { waitUntil: "domcontentloaded", timeout: 90000 })
  await page.getByRole("heading", { name: "Dashboard Comp\u00e9tences", exact: true }).waitFor()
  assert.equal(requests.length, 0, "Do not download candidates while the overview is open")
  console.log("Candidates dashboard loaded")
  await page.getByRole("tab", { name: "Candidats", exact: true }).click()
  const panel = page.getByRole("tabpanel", { name: "Candidats", exact: true })
  const row = (name) => panel.getByRole("row").filter({ has: page.getByText(name, { exact: true }) })
  await row("\u00c9milie Diop").waitFor()
  assert.equal(await panel.getByRole("row").count(), 21)
  assert.equal(details.length, 0)
  holdSummary = false
  releaseSummary?.()
  console.log("Bounded first page verified")
  await panel.getByRole("button", { name: "Suivant", exact: true }).click()
  await row("Candidat 21 Diop").waitFor()
  assert.equal(requests.at(-1).page, 2)
  await panel.getByRole("searchbox", { name: "Rechercher un candidat" }).fill("  EMILIE   DIOP  ")
  await row("\u00c9milie Diop").waitFor()
  assert.equal(requests.at(-1).page, 1)
  await panel.getByText("1 candidat(s) au total", { exact: true }).waitFor()
  await row("\u00c9milie Diop").getByRole("button", { name: "Menu", exact: true }).click()
  await page.getByRole("menuitem", { name: "Voir les d\u00e9tails", exact: true }).click()
  await page.getByRole("heading", { name: /milie/ }).waitFor()
  assert.deepEqual(details, [candidates[0].id])
  console.log("Search and lazy details verified")
  // Reload with no saved filter to validate complete CSV and XLSX downloads.
  await page.reload({ waitUntil: "networkidle" })
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
  fail = true
  await page.getByRole("button", { name: "Actualiser", exact: true }).click()
  await page.getByRole("alert").getByText(/Chargement indisponible/).waitFor()
  fail = false
  await page.getByRole("button", { name: "Actualiser", exact: true }).click()
  await row("\u00c9milie Diop").waitFor()
  assert.deepEqual(errors, [])
  console.log("PASS: candidats pagines, recherche serveur, remise a zero de page, details a la demande, exports CSV/XLSX complets et reprise apres erreur")
  await context.close()
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
