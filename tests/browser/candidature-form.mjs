// All API calls are intercepted. No real candidate, database or email is used.
import assert from "node:assert/strict"
import { mkdir } from "node:fs/promises"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"
import defaults from "../../data/training-defaults.js"
import { DEFAULT_TRAINING_SITES, RESIDENCE_LOCATIONS } from "../../lib/training-eligibility.js"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
const output = process.env.ODC_SCREENSHOT_DIR
const unavailableSites = [
  { code: "empty", name: "Site sans formation", status: "active" },
  { code: "draft-only", name: "Site avec brouillon", status: "active" },
  { code: "archive-only", name: "Site avec formation archivée", status: "active" },
]
const unpublishedTrainings = [
  { ...defaults[0], code: "draft-course", siteIds: ["draft-only"], status: "draft" },
  { ...defaults[0], code: "archived-course", siteIds: ["archive-only"], status: "archived" },
]
let browser
let server
const radio = (page, name, value) => page.locator(`input[name="${name}"][value="${value}"]`)
const next = (page) => page.getByRole("button", { name: "Suivant", exact: true }).click()
const back = (page) => page.getByRole("button", { name: "Précédent", exact: true }).click()

async function fixture(width = 1440, height = 1000) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" })
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  const scenario = { posts: [], checks: [], offline: false, catalogFailure: false, removeData: false, archiveSite: false, noTrainings: false,
    holdEmail: "", releaseEmail: null, duplicateIdentity: false, errors: [] }
  page.on("pageerror", (error) => scenario.errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrated|NaN|Cannot update a component/.test(message.text())) scenario.errors.push(message.text())
  })
  await page.route("**/api/**", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "content-type, authorization" }
    const respond = (json, status = 200) => route.fulfill({ headers, status, json })
    if (request.method() === "OPTIONS") return route.fulfill({ headers, status: 204 })
    if (url.pathname.endsWith("/trainings")) {
      if (scenario.catalogFailure) return respond({ error: "Catalogue momentanément indisponible" }, 503)
      return respond({ success: true, data: scenario.noTrainings ? [] : [...defaults.filter((row) => !scenario.removeData || row.code !== "dev-data"), ...unpublishedTrainings],
        trainingSites: [...DEFAULT_TRAINING_SITES.filter((site) => !scenario.archiveSite || site.code !== "thies"), ...unavailableSites], residenceLocations: RESIDENCE_LOCATIONS })
    }
    if (url.pathname.endsWith("/candidature/status")) return respond({ success: true,
      data: { isOpen: true, lifecycleStatus: "open", campaign: { title: "Recette", endAt: "2030-01-01T00:00:00Z" } } })
    if (url.pathname.endsWith("/check-unique")) {
      const value = url.searchParams.get("value")
      scenario.checks.push({ field: url.searchParams.get("field"), value })
      if (value === scenario.holdEmail) {
        await new Promise((resolve) => { scenario.releaseEmail = resolve })
        return respond({ exists: true }).catch(() => {})
      }
      return respond({ exists: scenario.duplicateIdentity && url.searchParams.get("field") === "cni_or_passport_number" })
    }
    if (url.pathname.endsWith("/candidature/apply")) {
      scenario.posts.push(request.postDataJSON())
      if (scenario.offline) return route.abort("failed")
      return respond({ candidature_id: "synthetic", message: "Candidature enregistrée avec succès" }, 201)
    }
    return respond({ success: true, data: [], events: [] })
  })
  await page.goto(`${baseUrl}/odc/candidatures`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { name: "Déposer ma candidature", exact: true }).waitFor()
  return { context, page, scenario }
}

async function choose(page, site = "thies", formation = "dev-data") {
  await radio(page, "trainingSite", site).check()
  await next(page)
  await radio(page, "formation", formation).check()
  await next(page)
}
async function identity(page) {
  for (const [name, value] of Object.entries({ firstName: "Moussa", lastName: "Ba", birthDate: "2000-01-01", birthPlace: "Dakar" })) await page.locator(`#${name}`).fill(value)
  await page.locator("#gender").selectOption("male")
  await page.locator("#nationality").selectOption("Sénégalaise")
  await page.locator("#idType").selectOption("cni")
  await page.locator("#idNumber").fill("1234567890123")
}
async function validForm(page) {
  await choose(page)
  await identity(page)
  await next(page)
  await page.locator("#email").fill("moussa.recette@example.org")
  await page.locator("#phone").fill("771234567")
  await page.locator("#region").selectOption("Diourbel")
  await next(page)
  await page.locator("#education").selectOption("terminale")
  await radio(page, "computer_skills", "no").check()
  await radio(page, "isWorking", "no").check()
  await radio(page, "isAvailable", "yes").check()
  await next(page)
  await page.locator("#acceptTerms").check()
}

try {
  server = await startBrowserServer(baseUrl)
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })
  if (output) await mkdir(output, { recursive: true })
  for (const [width, height] of [[320, 740], [390, 844], [1366, 768], [1440, 900]]) {
    const { context, page, scenario } = await fixture(width, height)
    assert.equal(await page.locator('input[name="trainingSite"]:focus').count(), 1)
    assert.equal(await page.locator('input[name="trainingSite"]').count(), 4, "Only sites with at least one eligible published course are shown")
    for (const site of unavailableSites) assert.equal(await radio(page, "trainingSite", site.code).count(), 0)
    assert.equal(await page.locator("#region").count(), 0, "Residence is not a training site")
    assert.equal(await page.locator('input[name="formation"]').count(), 0)
    if (output) await page.screenshot({ path: `${output}/sites-${width}.png`, fullPage: true, animations: "disabled" })
    await radio(page, "trainingSite", "thies").check()
    await next(page)
    assert.deepEqual(await page.locator('input[name="formation"]').evaluateAll((nodes) => nodes.map((node) => node.value)), ["dev-data"])
    if (output) await page.screenshot({ path: `${output}/formations-${width}.png`, fullPage: true, animations: "disabled" })
    await radio(page, "formation", "dev-data").check()
    await next(page)
    await page.locator("#firstName").waitFor()
    assert.equal(await page.locator("#firstName:focus").count(), 1)
    assert.equal(await page.locator("#email").count(), 0)
    assert.equal(await page.locator("#idNumber").isDisabled(), true)
    if (width >= 1024) {
      const button = await page.getByRole("button", { name: "Suivant", exact: true }).boundingBox()
      assert.ok(button.y + button.height <= height, "Identity fits a laptop viewport")
    }
    await identity(page)
    await next(page)
    await page.locator("#region").selectOption("Diourbel")
    await page.locator("#email").fill("moussa.recette@example.org")
    if (output) await page.screenshot({ path: `${output}/contact-${width}.png`, fullPage: true, animations: "disabled" })
    await page.getByRole("button", { name: "Revenir à l'étape 1 : Site", exact: true }).click()
    await radio(page, "trainingSite", "tambacounda").check()
    await next(page)
    assert.equal(await radio(page, "formation", "dev-data").count(), 0)
    await radio(page, "formation", "referent-digital").check()
    await next(page)
    assert.equal(await page.locator("#firstName").inputValue(), "Moussa")
    await next(page)
    assert.equal(await page.locator("#region").inputValue(), "Diourbel")
    assert.equal(await page.locator("#email").inputValue(), "moussa.recette@example.org")
    const sizes = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth }))
    assert.ok(sizes.body <= sizes.viewport + 1)
    assert.equal(scenario.posts.length, 0)
    assert.deepEqual(scenario.errors, [])
    console.log(`PASS candidature: site first, correct courses, independent residence, preserved entries, ${width}px`)
    await context.close()
  }
  {
    const { context, page, scenario } = await fixture()
    await next(page)
    await page.locator("#trainingSite-error").waitFor()
    assert.equal(await page.locator(":focus").getAttribute("name"), "trainingSite")
    await validForm(page)
    scenario.offline = true
    await page.getByRole("button", { name: "Envoyer ma candidature", exact: true }).click()
    await page.getByRole("alert").filter({ hasText: /soumission|serveur|connexion|envoi|fetch/i }).waitFor()
    await back(page)
    assert.equal(await radio(page, "computer_skills", "no").isChecked(), true)
    await back(page)
    assert.equal(await page.locator("#region").inputValue(), "Diourbel")
    await next(page)
    await next(page)
    scenario.offline = false
    await page.getByRole("button", { name: "Envoyer ma candidature", exact: true }).click()
    await page.getByRole("heading", { name: "Candidature enregistrée !", exact: true }).waitFor()
    assert.equal(scenario.posts.length, 2)
    assert.deepEqual(scenario.posts[0], scenario.posts[1])
    assert.equal(scenario.posts[1].training_site, "thies")
    assert.equal(scenario.posts[1].region_of_residence, "Diourbel")
    assert.equal(scenario.posts[1].computer_skills, false)
    assert.deepEqual(scenario.errors, [])
    console.log("PASS candidature: validation, complete submission and retry preserve site and residence separately")
    await context.close()
  }
  {
    const { context, page, scenario } = await fixture(320, 740)
    await page.locator('input[name="trainingSite"]:focus').press("ArrowRight")
    assert.equal(await radio(page, "trainingSite", "thies").isChecked(), true)
    await radio(page, "trainingSite", "dakar").check()
    await next(page)
    assert.equal(await page.locator('input[name="formation"]').count(), 4)
    await page.getByRole("button", { name: "Formations suivantes", exact: true }).click()
    assert.equal(await page.locator('input[name="formation"]').count(), 3)
    const sizes = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth }))
    assert.ok(sizes.body <= sizes.viewport + 1, "Course pagination fits a 320px viewport")
    await page.getByRole("button", { name: "Formations précédentes", exact: true }).click()
    await radio(page, "formation", "hackeuses").check()
    await next(page)
    await identity(page)
    await next(page)
    await page.locator("#formation-error").waitFor()
    assert.equal(await radio(page, "formation", "hackeuses").count(), 0)
    assert.equal(scenario.posts.length, 0)
    assert.deepEqual(scenario.errors, [])
    console.log("PASS candidature: native keyboard navigation, bounded course pages and women-only validation")
    await context.close()
  }
  for (const change of ["removeData", "archiveSite"]) {
    const { context, page, scenario } = await fixture()
    await validForm(page)
    scenario[change] = true
    await page.getByRole("button", { name: "Envoyer ma candidature", exact: true }).click()
    await page.locator("#trainingSite-error").waitFor()
    assert.equal(scenario.posts.length, 0)
    assert.equal(await radio(page, "trainingSite", "thies").count(), 0, "A site losing its last offer is removed, not disabled")
    await radio(page, "trainingSite", "dakar").check()
    await next(page)
    await radio(page, "formation", "dev-web-mobile").check()
    await next(page)
    assert.equal(await page.locator("#firstName").inputValue(), "Moussa")
    assert.deepEqual(scenario.errors, [])
    console.log(`PASS candidature: final revalidation catches ${change} without losing identity`)
    await context.close()
  }
  {
    const { context, page, scenario } = await fixture()
    scenario.noTrainings = true
    await page.reload({ waitUntil: "networkidle" })
    await page.getByRole("status").filter({ hasText: "Aucun site ne propose actuellement de formation ouverte à la candidature." }).waitFor()
    assert.equal(await page.locator('input[name="trainingSite"]').count(), 0)
    assert.equal(await page.getByRole("button", { name: "Suivant", exact: true }).isDisabled(), true)
    assert.deepEqual(scenario.errors, [])
    assert.equal(scenario.posts.length, 0)
    console.log("PASS candidature: empty sites, unpublished-only sites and all-empty catalogues are not selectable")
    await context.close()
  }
  {
    const { context, page, scenario } = await fixture()
    scenario.catalogFailure = true
    await page.reload({ waitUntil: "networkidle" })
    const retry = page.getByRole("button", { name: "Réessayer", exact: true })
    await retry.waitFor()
    scenario.catalogFailure = false
    await retry.click()
    await choose(page)
    await identity(page)
    await next(page)
    scenario.holdEmail = "old.recette@example.org"
    await page.locator("#email").pressSequentially(scenario.holdEmail)
    assert.equal(scenario.checks.filter((check) => check.field === "email").length, 0)
    await page.locator("#phone").focus()
    const deadline = Date.now() + 5000
    while (!scenario.releaseEmail && Date.now() < deadline) await page.waitForTimeout(50)
    assert.ok(scenario.releaseEmail)
    await page.locator("#email").fill("new.recette@example.org")
    await page.locator("#phone").focus()
    scenario.releaseEmail()
    await page.waitForTimeout(400)
    assert.equal(await page.locator("#email-error").count(), 0)
    assert.deepEqual(scenario.errors, [])
    console.log("PASS candidature: catalogue recovery, uniqueness on blur, stale responses ignored")
    await context.close()
  }
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
