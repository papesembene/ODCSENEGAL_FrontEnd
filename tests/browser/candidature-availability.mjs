import assert from "node:assert/strict"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
let browser
let server

function status(key) {
  return {
    isOpen: key === "open",
    lifecycleStatus: key,
    campaign: { title: "Campagne de recette", startAt: "2026-01-01T00:00:00Z", endAt: "2030-01-01T00:00:00Z" },
  }
}

async function fixture(key, { managed = false, delayed = false } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" })
  const page = await context.newPage()
  const scenario = { key, lookups: 0, submissions: 0 }
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  let release
  const pending = delayed ? new Promise((resolve) => { release = resolve }) : Promise.resolve()
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url())
    const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "content-type" }
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers })
    let data = []
    if (url.pathname.endsWith("/candidature/status")) {
      scenario.lookups += 1
      await pending
      if (scenario.key === "error") return route.fulfill({ status: 503, headers,
        contentType: "application/json", body: JSON.stringify({ error: "Indisponible" }) })
      data = status(scenario.key)
      if (scenario.endAt) data.campaign.endAt = scenario.endAt
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

  for (const [key, label] of [["closed", "Candidatures fermées"], ["upcoming", "Ouverture prochainement"], ["error", "Statut indisponible"]]) {
    const { context, page, scenario, errors } = await fixture(key)
    await page.goto(`${baseUrl}/competences`, { waitUntil: "networkidle" })
    await assertBlockedButtons(page, label, 2)
    assert.equal(scenario.lookups, 1, "Two buttons share a single status request")
    await page.goto(`${baseUrl}/odc/candidatures`, { waitUntil: "networkidle" })
    await page.getByRole("heading", { name: key === "error" ? "Vérification momentanément indisponible" : key === "upcoming" ? "Les candidatures ouvriront prochainement" : "Les candidatures sont fermées", exact: true }).waitFor()
    assert.equal(await page.locator("form").count(), 0, "Direct URL must not reveal a closed form")
    assert.equal(scenario.submissions, 0)
    assert.deepEqual(errors, [])
    console.log(`PASS candidature: ${key}, both buttons disabled and direct form blocked`)
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
    const name = page.locator('input[name="firstName"]')
    await name.fill("Moussa")
    scenario.key = "closed"
    await page.evaluate(() => window.dispatchEvent(new Event("online")))
    await page.getByRole("alert").filter({ hasText: "Les candidatures sont fermées" }).waitFor()
    assert.equal(await name.inputValue(), "Moussa", "Closing a campaign must preserve in-page values")
    assert.equal(await name.isDisabled(), true)
    assert.equal(await page.getByRole("button", { name: "Envoyer ma candidature", exact: true }).isDisabled(), true)
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
