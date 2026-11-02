// Synthetic API only. No real users, candidates, database or email are touched.
import assert from "node:assert/strict"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"
import defaults from "../../data/training-defaults.js"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
let browser
let server
let items = structuredClone(defaults)
let stale = false
let unavailable = false
const writes = []
const errors = []
const user = { id: "admin", email: "admin@example.org", admin_type: "super_admin", profile_data: {} }
const code = "robotique-nationale"
let catalogReads = 0

async function fixture(profile = user, width = 1440) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" })
  await context.addInitScript((admin) => {
    localStorage.setItem("admin_token", "mock-training-token")
    localStorage.setItem("admin_type", admin.admin_type)
    localStorage.setItem("admin_user", JSON.stringify(admin))
  }, profile)
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route("**/api/**", async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const method = request.method()
    const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin, "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "content-type, authorization", "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS" }
    const respond = (data, status = 200) => route.fulfill({ headers, status, json: data })
    if (method === "OPTIONS") return route.fulfill({ headers, status: 204 })
    if (path.endsWith("/trainings") && method === "GET") {
      catalogReads++
      if (unavailable) return respond({ error: "Catalogue indisponible" }, 503)
      return respond({ success: true, data: path.includes("/admin/") ? items : items.filter((item) => item.status === "published") })
    }
    if (path.startsWith("/api/admin/trainings") && ["POST", "PATCH", "DELETE"].includes(method)) {
      writes.push({ path, method })
      if (path.endsWith("/media")) return respond({ success: true, data: { imageUrl: "/static/uploads/trainings/test.png" } }, 201)
      const body = request.postDataJSON()
      if (method === "POST") {
        const row = { ...body, code, id: code, value: code, legacyId: null, aliases: [code, body.title], duration: `${body.durationMonths} mois`, version: 1 }
        items = [row, ...items]
        return respond({ success: true, data: row }, 201)
      }
      const item = items.find((row) => row.code === path.split("/").at(-1))
      if (stale || item.version !== body.version) return respond({ success: false, error: "Ce référentiel a changé. Actualisez avant de réessayer." }, 409)
      Object.assign(item, body, { version: item.version + 1, status: method === "DELETE" ? "archived" : body.status || item.status })
      return respond({ success: true, data: item })
    }
    let data = []
    if (path.endsWith("/candidature/status")) data = { isOpen: true, lifecycleStatus: "open", campaign: { title: "Recette", endAt: "2030-01-01T00:00:00Z" } }
    if (path.endsWith("/bootstrap")) data = { campaigns: [], slots: [], admins: [], slot_occupancy: {} }
    if (path.endsWith("/statistics")) data = {}
    if (path.endsWith("/tests")) data = [{ id: "historical-test", title: "Test historique", referentiel: "dev-web-mobile",
      duration: 60, scheduledDate: "2030-01-01", scheduledTime: "09:00", passingScore: 70,
      questions: [{ question: "Question historique", type: "texte_libre", score: 5 }], status: "active" }]
    if (path.endsWith("/dashboard")) data = { stats: {}, formations: {}, daily: [], nationalities: [] }
    return respond({ success: true, data, total: 0, pagination: { page: 1, per_page: 20, total: 0, total_pages: 1 } })
  })
  return { context, page }
}

try {
  server = await startBrowserServer(baseUrl)
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })
  const { context, page } = await fixture()
  await page.goto(`${baseUrl}/astrodmin/competences/referentiels`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { name: "Référentiels", exact: true }).waitFor()
  assert.equal(await page.getByRole("row").count(), 8)
  await page.getByRole("button", { name: "Ajouter un référentiel", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("Nom du référentiel").fill("Robotique nationale")
  await dialog.getByLabel("Durée (mois)").fill("6")
  await dialog.getByLabel("Description", { exact: true }).fill("Concevez et programmez des robots.")
  await dialog.getByLabel(/Objectifs et compétences/).fill("Programmer un robot\nAssembler des capteurs")
  await dialog.getByLabel("Niveau requis").fill("Baccalauréat")
  await dialog.getByLabel(/Illustration/).setInputFiles({ name: "robot.png", mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aC1sAAAAASUVORK5CYII=", "base64") })
  await dialog.getByAltText("Aperçu du référentiel").waitFor()
  await dialog.getByRole("button", { name: "Enregistrer le référentiel" }).click()
  await page.getByRole("row").filter({ hasText: "Robotique nationale" }).waitFor()
  assert.equal(items[0].code, code)
  assert.equal(writes.filter((request) => request.method === "POST" && request.path === "/api/admin/trainings").length, 1)
  assert.equal(items[0].imageUrl, "/static/uploads/trainings/test.png")
  console.log("PASS catalogue: creation and refresh from the shared API")

  await page.getByRole("button", { name: "Modifier Robotique nationale", exact: true }).click()
  await dialog.getByLabel("Nom du référentiel").fill("Robotique et systèmes")
  await dialog.getByLabel("Description", { exact: true }).fill("Nouvelle description publiée par l’administration.")
  stale = true
  await dialog.getByRole("button", { name: "Enregistrer le référentiel" }).click()
  await dialog.getByRole("alert").getByText(/a changé/).waitFor()
  assert.equal(await dialog.getByLabel("Nom du référentiel").inputValue(), "Robotique et systèmes")
  assert.equal(items[0].title, "Robotique nationale")
  stale = false
  await dialog.getByRole("button", { name: "Enregistrer le référentiel" }).click()
  await page.getByRole("button", { name: "Modifier Robotique et systèmes", exact: true }).waitFor()

  for (const path of ["/competences"]) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" })
    const catalog = page.getByRole("region", { name: "Nos Formations", exact: true })
    const pagination = catalog.getByRole("navigation", { name: "Pagination des formations" })
    const search = catalog.getByRole("searchbox", { name: "Rechercher une formation", exact: true })
    assert.equal(await catalog.getByRole("button", { name: "En savoir plus", exact: true }).count(), 6)
    await pagination.getByRole("button", { name: "Suivant", exact: true }).click()
    await catalog.getByText("7 à 8 sur 8 formation(s)", { exact: true }).waitFor()
    assert.equal(await catalog.getByRole("button", { name: "En savoir plus", exact: true }).count(), 2)
    assert.equal(await pagination.getByRole("button", { name: "Suivant", exact: true }).isDisabled(), true)
    await catalog.getByRole("heading", { name: defaults[6].title, exact: true }).waitFor()
    await search.fill("  SYSTEMES  ROBOTIQUE  ")
    await catalog.getByText("1 à 1 sur 1 formation(s)", { exact: true }).waitFor()
    assert.equal(await catalog.getByRole("button", { name: "En savoir plus", exact: true }).count(), 1)
    assert.equal(await pagination.getByRole("button", { name: "Précédent", exact: true }).isDisabled(), true)
    await search.fill("formation introuvable")
    await catalog.getByText("Aucune formation ne correspond à votre recherche.", { exact: true }).waitFor()
    assert.equal(await catalog.getByRole("button", { name: "En savoir plus", exact: true }).count(), 0)
    assert.equal(await catalog.getByRole("navigation", { name: "Pagination des formations" }).count(), 0)
    await search.fill("")
    await catalog.getByText("1 à 6 sur 8 formation(s)", { exact: true }).waitFor()
    await pagination.getByRole("button", { name: "Suivant", exact: true }).click()
    await catalog.getByText("7 à 8 sur 8 formation(s)", { exact: true }).waitFor()
    await pagination.getByRole("button", { name: "Précédent", exact: true }).click()
    await catalog.getByText("1 à 6 sur 8 formation(s)", { exact: true }).waitFor()
    console.log("PASS catalogue: six public cards per page, last page, name search, reset and empty state")
    const card = page.locator("[data-ui-card]").filter({ has: page.getByRole("heading", { name: "Robotique et systèmes", exact: true }) })
    await card.getByRole("button", { name: "En savoir plus", exact: true }).click()
    await page.getByRole("heading", { name: "Objectifs de la formation", exact: true }).waitFor()
    assert.ok(await page.getByText("Programmer un robot", { exact: true }).isVisible())
    assert.equal(await page.getByText("Concevez et programmez des robots.", { exact: true }).count(), 0)
  }
  await page.goto(`${baseUrl}/odc/candidatures`, { waitUntil: "networkidle" })
  await page.locator('select[name="formation"]').selectOption(code)
  await page.getByText(/exclusivement à la formation pendant 6 mois/).waitFor()
  assert.equal(await page.locator('select[name="formation"] option:checked').textContent(), "Robotique et systèmes")
  console.log("PASS catalogue: public cards, edited descriptions, objectives and candidature duration")

  await page.goto(`${baseUrl}/astrodmin/competences/tests`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Nouveau test", exact: true }).click()
  await dialog.locator("#referentiel").click()
  await page.getByRole("option", { name: "Robotique et systèmes", exact: true }).click()
  assert.equal(await dialog.locator("#referentiel").textContent(), "Robotique et systèmes")
  await page.keyboard.press("Escape")
  await page.getByRole("tab", { name: /Groupes/ }).click()
  await page.getByRole("button", { name: "Créer un groupe", exact: true }).first().click()
  await dialog.locator("#groupFormation").click()
  await page.getByRole("option", { name: "Robotique et systèmes", exact: true }).click()
  await page.keyboard.press("Escape")
  console.log("PASS catalogue: new referential available for online tests and groups")

  const web = items.find((item) => item.code === "dev-web-mobile")
  web.status = "archived"
  await page.reload({ waitUntil: "networkidle" })
  await page.getByRole("tab", { name: "Mes Tests", exact: true }).click()
  await page.getByRole("row").filter({ hasText: "Test historique" }).getByTitle("Modifier", { exact: true }).click()
  assert.equal(await dialog.locator("#referentiel").textContent(), web.title,
    "A historical test keeps its referential even after archival, including legacy code aliases")
  await page.keyboard.press("Escape")
  web.status = "published"

  await page.goto(`${baseUrl}/astrodmin/entretiens`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: /Créer une campagne|Nouvelle campagne/ }).first().click()
  await dialog.locator("#campaign-formation").click()
  await page.getByRole("option", { name: "Robotique et systèmes", exact: true }).click()
  await page.keyboard.press("Escape")

  await page.goto(`${baseUrl}/astrodmin/competences/referentiels`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Archiver Robotique et systèmes", exact: true }).click()
  await page.getByRole("button", { name: "Confirmer l'archivage", exact: true }).click()
  await page.getByRole("row").filter({ hasText: "Robotique et systèmes" }).getByText("Archivé", { exact: true }).waitFor()
  await page.goto(`${baseUrl}/competences`, { waitUntil: "networkidle" })
  assert.equal(await page.getByRole("heading", { name: "Robotique et systèmes", exact: true }).count(), 0)
  await page.goto(`${baseUrl}/odc/candidatures`, { waitUntil: "networkidle" })
  assert.equal(await page.locator(`select[name="formation"] option[value="${code}"]`).count(), 0)
  assert.equal(items.filter((item) => item.code === code).length, 1, "Archiving preserves the record")
  console.log("PASS catalogue: archive removed from public/new applications, history retained")
  await context.close()

  {
    const { context: mobile, page: small } = await fixture(user, 390)
    await small.goto(`${baseUrl}/astrodmin/competences/referentiels`, { waitUntil: "networkidle" })
    await small.getByRole("textbox", { name: "Rechercher", exact: true }).fill("ROBOTIQUE")
    await small.waitForFunction(() => document.querySelectorAll("tbody tr").length === 1)
    assert.equal(await small.getByRole("row").count(), 2)
    const sizes = await small.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth }))
    assert.ok(sizes.body <= sizes.viewport + 1, "No horizontal page overflow on mobile")
    await small.goto(`${baseUrl}/competences`, { waitUntil: "networkidle" })
    const catalog = small.getByRole("region", { name: "Nos Formations", exact: true })
    assert.equal(await catalog.getByRole("button", { name: "En savoir plus", exact: true }).count(), 6)
    await catalog.getByRole("button", { name: "Suivant", exact: true }).click()
    await catalog.getByText("7 à 7 sur 7 formation(s)", { exact: true }).waitFor()
    const mobileSizes = await small.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth }))
    assert.ok(mobileSizes.body <= mobileSizes.viewport + 1, "Public pagination fits on mobile")
    await catalog.getByRole("searchbox", { name: "Rechercher une formation", exact: true }).fill("  DIGITAL REFERENT ")
    await catalog.getByText("1 à 1 sur 1 formation(s)", { exact: true }).waitFor()
    await catalog.getByRole("heading", { name: defaults.find((item) => item.code === "referent-digital").title, exact: true }).waitFor()
    await mobile.close()
  }
  {
    unavailable = true
    const { context: failure, page: recovery } = await fixture()
    await recovery.goto(`${baseUrl}/competences`, { waitUntil: "networkidle" })
    await recovery.getByRole("alert").getByText(/Catalogue indisponible/).waitFor()
    assert.equal(await recovery.getByRole("heading", { name: defaults[0].title, exact: true }).count(), 0,
      "Do not show outdated defaults if the real catalogue cannot be read")
    unavailable = false
    await recovery.getByRole("button", { name: "Réessayer", exact: true }).click()
    await recovery.getByRole("heading", { name: defaults[0].title, exact: true }).waitFor()
    await failure.close()
  }
  {
    const { context: jury, page: restricted } = await fixture({ ...user, admin_type: "competences", profile_data: { admin_scope: "interview_member" } })
    await restricted.goto(`${baseUrl}/astrodmin/competences/referentiels`, { waitUntil: "networkidle" })
    assert.equal(await restricted.getByRole("button", { name: "Ajouter un référentiel", exact: true }).count(), 0)
    await jury.close()
  }
  assert.deepEqual(errors, [])
  assert.ok(catalogReads > 0)
  console.log("PASS catalogue: admin and public mobile search, restricted jury UI, no runtime errors")
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
