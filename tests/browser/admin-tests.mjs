// Isolated browser checks: no real email, candidate or backend is contacted.
import assert from "node:assert/strict"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
const admin = { id: "admin", email: "admin@example.org", admin_type: "super_admin", first_name: "Local", last_name: "Admin" }
const batchId = "b".repeat(64)
const results = Array.from({ length: 45 }, (_, index) => index + 1).map((id) => ({
  id: String(id).padStart(24, "0"), testId: "test", testTitle: "Test local", referentiel: id % 2 ? "Dev Web" : "Data",
  candidate: { name: `Candidat ${id}`, email: `candidate${id}@example.org` }, score: 100, status: "admis",
  completedAt: "2026-10-21T10:00:00Z", points: { obtained: 5, total: 5 },
  violationSummary: { totalViolations: id === 2 ? 8 : 0 },
}))
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
  const errors = []
  const emails = []
  const resultRequests = []
  const detailRequests = []
  let violationReads = 0
  let failEmail = true
  let failResults = false
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route("**/api/**", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin,
      "Access-Control-Allow-Credentials": "true", "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, authorization" }
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers })
    let status = 200
    let data = { success: true, data: [] }
    const filtered = results.filter((result) => (!url.searchParams.get("referentiel") || url.searchParams.get("referentiel") === "all" || result.referentiel === url.searchParams.get("referentiel")) &&
      (!url.searchParams.get("status") || url.searchParams.get("status") === "all" || result.status === url.searchParams.get("status")))
    if (path.endsWith("/tests/results")) {
      const number = Number(url.searchParams.get("page"))
      const size = Number(url.searchParams.get("per_page"))
      assert.ok(number >= 1 && size >= 1 && size <= 100, "Browser must request a bounded server page")
      resultRequests.push({ page: number, per_page: size, referentiel: url.searchParams.get("referentiel") })
      if (failResults) { status = 503; data = { success: false, error: "Temporary" } }
      else data = { success: true, data: filtered.slice((number - 1) * size, number * size), total: filtered.length,
        pagination: { page: number, per_page: size, total: filtered.length, total_pages: Math.ceil(filtered.length / size) } }
    }
    if (path.endsWith("/tests")) data.data = [{ id: "test", title: "Test local", referentiel: "Dev Web", questions: [
      { question: "Question locale", type: "qcm_simple", options: ["A", "B"], correctAnswer: 1, correctAnswers: [], score: 5 },
    ] }]
    if (/\/tests\/results\/[a-f0-9]{24}$/.test(path)) {
      const id = path.split("/").at(-1)
      detailRequests.push(id)
      data.data = { ...results.find((result) => result.id === id), answers: { "0": 1 }, manualGrades: {} }
    }
    if (path.endsWith("/tests/statistics")) data.data = { total: 45, admis: 45, rejetes: 0, pending: 0, average_score: 100, pass_rate: 100,
      score_distribution: [{ range: "80-100", count: 45 }] }
    if (path.includes("/violations/")) {
      violationReads++
      assert.ok(path.endsWith("candidate2%40example.org"), "Fetch only the selected candidate's history")
      data.data = { totalViolations: 8, stats: { copy: 8 }, violations: [] }
    }
    if (path.endsWith("/tests/results/export")) return route.fulfill({ status: 200, headers: {
      ...headers, "Content-Disposition": "attachment; filename=resultats-tests.csv",
    }, contentType: "text/csv", body: "Nom,Email\n" + filtered.map((result) => `${result.candidate.name},${result.candidate.email}`).join("\n") })
    if (path.endsWith("/send-emails")) {
      emails.push(request.postDataJSON())
      status = failEmail ? 503 : 202
      data = failEmail ? { success: false, error: "Service email indisponible" } : { success: true, queued: true, data: { batchId } }
    }
    if (path.endsWith(`/notifications/${batchId}/status`)) data.data = { total: 1, queued: 1, sent: 0, failed: 0 }
    return route.fulfill({ status, headers, contentType: "application/json", body: JSON.stringify(data) })
  })
  await page.goto(`${baseUrl}/astrodmin/competences/tests`, { waitUntil: "networkidle", timeout: 90000 })
  await page.getByRole("button", { name: "Consulter les résultats", exact: true }).click()
  const row = (name) => page.getByRole("row").filter({ has: page.getByRole("cell", { name, exact: true }) })
  const panel = page.getByRole("tabpanel", { name: "Résultats", exact: true })
  const first = row("Candidat 1")
  const second = row("Candidat 2")
  await first.waitFor()
  assert.equal(await first.getByText("Élevée (8)", { exact: true }).count(), 0)
  await second.getByText("Élevée (8)", { exact: true }).waitFor()
  assert.equal(violationReads, 0, "The page must not download full violation histories")
  assert.equal(detailRequests.length, 0, "Answers must be loaded on demand")
  await first.getByTitle("Voir les réponses détaillées").click()
  await page.getByRole("dialog").getByText("Réponses aux questions", { exact: true }).waitFor()
  assert.deepEqual(detailRequests, [results[0].id])
  await page.getByRole("dialog").getByRole("button", { name: "Fermer", exact: true }).click()
  await second.getByTitle("Voir les infractions").click()
  await page.getByRole("dialog").getByText("Résumé des infractions", { exact: true }).waitFor()
  assert.equal(violationReads, 1)
  await page.getByRole("dialog").getByRole("button", { name: "Fermer", exact: true }).click()
  await first.getByRole("checkbox").click()
  await page.getByRole("button", { name: "Notifier la sélection (1)", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByRole("combobox").click()
  await page.getByRole("option", { name: "Notification des résultats", exact: true }).click()
  await dialog.getByRole("button", { name: "Envoyer", exact: true }).click()
  await page.getByText("Service email indisponible", { exact: true }).waitFor()
  assert.equal(await dialog.getByRole("button", { name: "Envoyer", exact: true }).isEnabled(), true)
  failEmail = false
  await dialog.getByRole("button", { name: "Envoyer", exact: true }).click()
  await dialog.getByText("Suivi des envois", { exact: true }).waitFor()
  await dialog.getByRole("status").getByText(/1 en attente/).waitFor()
  assert.equal(await dialog.getByRole("button", { name: "Envoyer", exact: true }).isDisabled(), true)
  assert.equal(emails.length, 2)
  assert.deepEqual(emails[1], { resultIds: [results[0].id], emailType: "results_notification", customMessage: "" })
  await dialog.getByRole("button", { name: "Fermer", exact: true }).click()
  await panel.getByRole("button", { name: "Suivant", exact: true }).click()
  await row("Candidat 21").waitFor()
  assert.equal(await row("Candidat 1").count(), 0)
  assert.equal(resultRequests.at(-1).page, 2)
  await panel.getByRole("button", { name: "Notifier la sélection (0)", exact: true }).waitFor()
  await panel.getByRole("button", { name: "Par Formation/Groupe", exact: true }).click()
  await panel.getByRole("button", { name: "Suivant", exact: true }).click()
  await row("Candidat 41").waitFor()
  assert.equal(resultRequests.at(-1).page, 3)
  await panel.getByRole("button", { name: "Liste", exact: true }).click()
  await panel.getByRole("combobox").first().click()
  await page.getByRole("option", { name: "Data", exact: true }).click()
  await row("Candidat 2").waitFor()
  assert.deepEqual(resultRequests.at(-1), { page: 1, per_page: 20, referentiel: "Data" })
  await panel.getByRole("combobox").last().click()
  await page.getByRole("option", { name: "10", exact: true }).click()
  await panel.getByText("Affichage de 1 à 10 sur 22 résultats", { exact: true }).waitFor()
  assert.equal(resultRequests.at(-1).per_page, 10)
  await panel.getByRole("checkbox", { name: "Sélectionner cette page", exact: true }).click()
  await panel.getByRole("button", { name: "Notifier la sélection (10)", exact: true }).waitFor()
  await panel.getByRole("button", { name: "Suivant", exact: true }).click()
  await row("Candidat 22").waitFor()
  await panel.getByRole("button", { name: "Notifier la sélection (0)", exact: true }).waitFor()
  const downloadPromise = page.waitForEvent("download")
  await panel.getByRole("button", { name: "Exporter", exact: true }).click()
  const download = await downloadPromise
  let csv = ""
  for await (const chunk of await download.createReadStream()) csv += chunk.toString()
  assert.equal(csv.split("\n").length, 23, "Export includes all 22 filtered candidates, not only 10 visible rows")
  assert.ok(csv.includes("candidate44@example.org"))
  failResults = true
  await panel.getByRole("button", { name: "Actualiser", exact: true }).click()
  await panel.getByRole("alert").waitFor()
  failResults = false
  await panel.getByRole("button", { name: "Réessayer", exact: true }).click()
  await row("Candidat 22").waitFor()
  await page.getByRole("tab", { name: "Tableau de bord", exact: true }).click()
  await page.getByText(/45 résultats disponibles/).waitFor()
  assert.deepEqual(errors, [])
  console.log("PASS: pagination serveur, filtres, selection par page, export complet, details a la demande, notifications et reprise apres echec")
  await context.close()
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
