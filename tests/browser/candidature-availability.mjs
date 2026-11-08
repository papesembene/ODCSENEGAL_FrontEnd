import assert from "node:assert/strict"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"
import trainingDefaults from "../../data/training-defaults.js"
import { DEFAULT_TRAINING_SITES } from "../../lib/training-eligibility.js"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
let browser
let server

function status(key) {
  return {
    isOpen: key === "open",
    lifecycleStatus: key,
    campaign: { title: "Campagne de recette", startAt: key === "upcoming" ? "2099-01-01T00:00:00Z" : "2026-01-01T00:00:00Z", endAt: "2100-01-01T00:00:00Z" },
  }
}

async function fixture(key, { managed = false, delayed = false } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" })
  const page = await context.newPage()
  const scenario = { key, lookups: 0, submissions: 0 }
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|hydrated|didn't match/i.test(message.text())) errors.push(message.text())
  })
  let release
  const pending = delayed ? new Promise((resolve) => { release = resolve }) : Promise.resolve()
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url())
    const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "content-type" }
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers })
    if (new URL(route.request().url()).pathname.endsWith("/trainings")) return route.fulfill({ headers, json: { success: true, data: trainingDefaults, trainingSites: DEFAULT_TRAINING_SITES } })
    let data = []
    if (url.pathname.endsWith("/candidature/status")) {
      scenario.lookups += 1
      await pending
      if (scenario.key === "error") return route.fulfill({ status: 503, headers,
        contentType: "application/json", body: JSON.stringify({ error: "Indisponible" }) })
      data = status(scenario.key)
      if (scenario.startAt !== undefined) data.campaign.startAt = scenario.startAt
      if (scenario.endAt) data.campaign.endAt = scenario.endAt
      if (scenario.noCampaign) data.campaign = null
    }
    if (url.pathname.endsWith("/candidature/apply")) scenario.submissions += 1
    if (managed && url.pathname.endsWith("/portal-content/public")) {
      const type = url.searchParams.get("type")
      if (type === "banner") data = [{ id: "custom-banner", title: "Formation du centre", category: "Formation",
        linkLabel: "Postuler au centre", linkUrl: "/odc/candidatures?formation=dev-web", imageUrl: "/p7graduation.jpeg" }]
      if (type === "info") data = [{ id: "info", title: "Nouvelle formation", linkLabel: "Postuler à la formation", linkUrl: "/odc/candidatures" }]
      if (type === "news") data = [{ id: "news", title: "La formation à découvrir", linkLabel: "Déposer ma candidature", linkUrl: "/odc/candidatures" }]
    }
    return route.fulfill({ headers, contentType: "application/json", body: JSON.stringify({ success: true, data, exists: false }) })
  })
  return { context, page, scenario, errors, release: () => release?.() }
}

async function assertBlockedButtons(page, name, count) {
  const buttons = page.getByRole("button", { name: new RegExp(name) })
  await buttons.first().waitFor()
  assert.equal(await buttons.count(), count)
  for (const button of await buttons.all()) assert.equal(await button.isDisabled(), true)
  assert.equal(await page.locator('a[href^="/odc/candidatures"]').count(), 0)
}

try {
  server = await startBrowserServer(baseUrl)
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })

  for (const [key, label] of [["closed", "Candidatures fermées"], ["upcoming", "Ouverture bientôt"], ["error", "Statut indisponible"]]) {
    const { context, page, scenario, errors } = await fixture(key)
    await page.goto(`${baseUrl}/competences`, { waitUntil: "networkidle" })
    await assertBlockedButtons(page, label, 2)
    assert.equal(scenario.lookups, 1, "Two buttons share a single status request")
    await page.goto(`${baseUrl}/odc/candidatures`, { waitUntil: "networkidle" })
    await page.getByRole("heading", { name: key === "error" ? "Vérification momentanément indisponible" : key === "upcoming" ? "Les candidatures ouvrent bientôt" : "Les candidatures sont fermées", exact: true }).waitFor()
    assert.equal(await page.locator("form").count(), 0, "Direct URL must not reveal a closed form")
    assert.equal(scenario.submissions, 0)
    assert.deepEqual(errors, [])
    console.log(`PASS candidature: ${key}, both buttons disabled and direct form blocked`)
    await context.close()
  }

  for (const width of [320, 390, 1440]) {
    const { context, page, scenario, errors } = await fixture("upcoming")
    await page.setViewportSize({ width, height: 900 })
    await page.clock.install({ time: new Date("2026-11-08T12:00:00Z") })
    await page.clock.pauseAt(new Date("2026-11-08T12:00:00Z"))
    scenario.startAt = "2026-11-09T13:02:03"
    await page.goto(baseUrl, { waitUntil: "networkidle" })
    const hero = page.locator('section[aria-roledescription="carrousel"]')
    await hero.getByText("Les candidatures ouvrent bientôt.", { exact: true }).waitFor()
    const timer = hero.getByRole("timer")
    await timer.waitFor()
    assert.deepEqual(await timer.locator("dd").allTextContents(), ["01", "01", "02", "03"])
    assert.match(await hero.locator("time").textContent(), /9 novembre 2026.*13:02.*Dakar/)
    assert.equal(await hero.getByRole("button", { name: "Ouverture bientôt", exact: true }).isDisabled(), true)
    await page.clock.fastForward(5000)
    assert.deepEqual(await timer.locator("dd").allTextContents(), ["01", "01", "01", "58"])
    assert.equal(scenario.lookups, 1, "The countdown must not poll the API every second")
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    assert.deepEqual(errors, [])
    console.log(`PASS candidature: upcoming home and local countdown at ${width}px without API polling`)
    await context.close()
  }

  for (const setup of [{ noCampaign: true }, { startAt: null }, { startAt: "invalid" }]) {
    const { context, page, scenario, errors } = await fixture("upcoming")
    Object.assign(scenario, setup)
    await page.goto(`${baseUrl}/candidatures/fermees`, { waitUntil: "networkidle" })
    await page.getByRole("heading", { name: "Les candidatures ouvrent bientôt", exact: true }).waitFor()
    assert.equal(await page.getByRole("timer").count(), 0)
    assert.equal(await page.locator("time").count(), 0)
    await page.getByText("La date d'ouverture sera annoncée prochainement.", { exact: true }).waitFor()
    assert.equal(await page.locator("form").count(), 0)
    assert.deepEqual(errors, [])
    console.log("PASS candidature: announcement without a valid official date has no invented countdown")
    await context.close()
  }

  {
    const { context, page, scenario, errors } = await fixture("upcoming")
    await page.clock.install({ time: new Date("2026-11-08T12:00:00Z") })
    await page.clock.pauseAt(new Date("2026-11-08T12:00:00Z"))
    scenario.startAt = "2026-11-08T12:00:02"
    await page.goto(`${baseUrl}/odc/candidatures`, { waitUntil: "networkidle" })
    await page.getByRole("timer").waitFor()
    assert.equal(await page.locator("form").count(), 0)
    await page.clock.fastForward(2000)
    await page.getByText("Vérification de l'ouverture en cours…", { exact: true }).waitFor()
    assert.equal(await page.locator("form").count(), 0, "Reaching zero cannot authorize the form without the API")
    scenario.key = "open"
    await page.clock.fastForward(200)
    await page.locator("form").waitFor()
    assert.equal(scenario.lookups, 2, "Only the shared campaign boundary check calls the API")
    assert.equal(await page.getByRole("timer").count(), 0)
    assert.equal(scenario.submissions, 0)
    assert.deepEqual(errors, [])
    console.log("PASS candidature: opening is revalidated with the backend before enabling an application")
    await context.close()
  }

  {
    const { context, page, scenario, errors } = await fixture("open")
    await page.goto(`${baseUrl}/competences`, { waitUntil: "networkidle" })
    const apply = page.getByRole("button", { name: "Déposer ma candidature", exact: true })
    assert.equal(await apply.isEnabled(), true)
    await apply.click()
    await page.waitForURL(`${baseUrl}/odc/candidatures`)
    await page.locator("form").waitFor()
    assert.ok(scenario.lookups >= 2, "Click and form navigation revalidate the campaign")
    assert.equal(scenario.submissions, 0)
    assert.deepEqual(errors, [])
    console.log("PASS candidature: an open campaign allows navigation and form access")
    await context.close()
  }

  {
    const { context, page, scenario, errors } = await fixture("open")
    await page.goto(`${baseUrl}/competences`, { waitUntil: "networkidle" })
    const apply = page.getByRole("button", { name: "Postuler maintenant", exact: true })
    assert.equal(await apply.isEnabled(), true)
    scenario.key = "closed"
    await apply.click()
    await assertBlockedButtons(page, "Candidatures fermées", 2)
    assert.equal(new URL(page.url()).pathname, "/competences", "A stale open button must not navigate to a closed form")
    assert.equal(scenario.submissions, 0)
    assert.deepEqual(errors, [])
    console.log("PASS candidature: a campaign closed since page load is rechecked before navigation")
    await context.close()
  }

  {
    const { context, page, scenario, errors } = await fixture("open")
    await page.goto(`${baseUrl}/odc/candidatures`, { waitUntil: "networkidle" })
    await page.locator("form").waitFor()
    await page.locator('input[name="trainingSite"][value="dakar"]').check()
    await page.getByRole("button", { name: "Suivant", exact: true }).click()
    await page.locator('input[name="formation"][value="dev-web-mobile"]').check()
    await page.getByRole("button", { name: "Suivant", exact: true }).click()
    const name = page.locator('input[name="firstName"]')
    await name.fill("Moussa")
    scenario.key = "closed"
    await page.evaluate(() => window.dispatchEvent(new Event("online")))
    await page.getByRole("alert").filter({ hasText: "Les candidatures sont fermées" }).waitFor()
    assert.equal(await name.inputValue(), "Moussa", "Closing a campaign must preserve in-page values")
    assert.equal(await name.isDisabled(), true)
    assert.equal(await page.getByRole("button", { name: "Suivant", exact: true }).isDisabled(), true)
    assert.equal(scenario.submissions, 0)
    scenario.key = "open"
    await page.getByRole("button", { name: "Vérifier à nouveau", exact: true }).click()
    await page.waitForFunction(() => !document.querySelector('input[name="firstName"]').disabled &&
      !document.querySelector('input[name="firstName"]').closest("fieldset").disabled)
    assert.equal(await name.inputValue(), "Moussa")
    assert.deepEqual(errors, [])
    console.log("PASS candidature: a live closure disables submission without clearing entered values")
    await context.close()
  }

  {
    const { context, page, scenario, errors } = await fixture("open")
    await page.clock.install({ time: new Date("2026-10-27T12:00:00Z") })
    await page.clock.pauseAt(new Date("2026-10-27T12:00:00Z"))
    scenario.endAt = "2026-10-27T12:00:02"
    await page.goto(`${baseUrl}/competences`, { waitUntil: "networkidle" })
    assert.equal(await page.getByRole("button", { name: "Postuler maintenant", exact: true }).isEnabled(), true)
    scenario.key = "closed"
    await page.clock.fastForward(2200)
    await assertBlockedButtons(page, "Candidatures fermées", 2)
    assert.equal(scenario.lookups, 2, "The campaign deadline triggers one shared revalidation")
    assert.deepEqual(errors, [])
    console.log("PASS candidature: deadline automatically disables all application buttons")
    await context.close()
  }

  {
    const { context, page, scenario, errors, release } = await fixture("open", { delayed: true })
    await page.goto(`${baseUrl}/competences`, { waitUntil: "domcontentloaded" })
    await assertBlockedButtons(page, "Vérification en cours", 2)
    scenario.key = "closed"
    const routeCount = scenario.lookups
    assert.ok(routeCount <= 1)
    release()
    await assertBlockedButtons(page, "Candidatures fermées", 2)
    await context.close()
    assert.deepEqual(errors, [])
    console.log("PASS candidature: no application action is enabled before the status response")
  }

  {
    const { context, page, scenario, errors } = await fixture("closed", { managed: true })
    await page.goto(baseUrl, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: /Formations numériques.*Candidatures fermées/ }).waitFor()
    for (const button of await page.getByRole("button", { name: /Candidatures fermées/ }).all()) {
      assert.equal(await button.isDisabled(), true)
    }
    await page.getByRole("button", { name: "Slide précédent", exact: true }).click()
    await page.getByRole("heading", { name: "Formation du centre", exact: true }).waitFor()
    assert.equal(await page.locator('a[href^="/odc/candidatures"]').count(), 0)
    assert.equal(scenario.lookups, 1)
    assert.equal(scenario.submissions, 0)
    assert.deepEqual(errors, [])
    console.log("PASS candidature: home footer and managed CMS actions cannot bypass campaign closure")
    await context.close()
  }
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
