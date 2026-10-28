import assert from "node:assert/strict"
import { mkdir } from "node:fs/promises"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
const output = process.env.ODC_SCREENSHOT_DIR
const routes = ["/competences", "/startups", "/about", "/odc/programmes", "/odc/ressources",
  "/startups/programmes/orange-fab", "/startups/programmes/startup-lab", "/startups/programmes/coworking"]
let browser
let server

async function fixture(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options })
  await context.addInitScript(() => {
    window.__reveals = []
    const animate = Element.prototype.animate
    Element.prototype.animate = function (frames, timing) {
      if (timing?.duration === 560) window.__reveals.push(this.textContent.trim().slice(0, 80))
      return animate.call(this, frames, timing)
    }
  })
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route("**/api/**", (route) => {
    const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin,
      "Access-Control-Allow-Headers": "content-type, authorization", "Access-Control-Allow-Methods": "GET, OPTIONS" }
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers })
    const path = new URL(route.request().url()).pathname
    const data = path.endsWith("/candidature/status")
      ? { isOpen: true, campaign: { title: "Campagne de test", endAt: "2030-01-01T00:00:00Z" } } : []
    return route.fulfill({ headers, contentType: "application/json", body: JSON.stringify({ success: true, data }) })
  })
  return { context, page, errors }
}

async function checkWidth(page) {
  const overflow = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth }))
  assert.ok(overflow.body <= overflow.viewport + 1, `Horizontal overflow: ${JSON.stringify(overflow)}`)
}

try {
  server = await startBrowserServer(baseUrl)
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })
  if (output) await mkdir(output, { recursive: true })

  for (const width of [320, 390, 1440]) {
    const { context, page, errors } = await fixture({ viewport: { width, height: 900 } })
    for (const path of routes) {
      await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" })
      assert.equal(await page.locator("h1").count(), 1, `${path}: one page title`)
      const hero = page.locator("[data-public-hero]")
      assert.equal(await hero.count(), 1, `${path}: shared Orange hero`)
      await checkWidth(page)
      const bounds = await hero.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return [...element.querySelectorAll("h1, p, a, button")].every((child) => {
          const box = child.getBoundingClientRect()
          return box.top >= rect.top && box.bottom <= rect.bottom + 1
        })
      })
      assert.equal(bounds, true, `${path}: hero content must not be clipped`)
      if (output && width !== 320) await page.screenshot({ path: `${output}/hero-${path.slice(1).replaceAll("/", "-")}-${width}.png`, animations: "disabled" })
      await page.locator("main h2").first().scrollIntoViewIfNeeded()
      await page.waitForTimeout(800)
      await checkWidth(page)
      assert.deepEqual(errors, [], `${path}: no runtime errors`)
      if (output) await page.screenshot({ path: `${output}/${path.slice(1).replaceAll("/", "-")}-${width}.png`, animations: "disabled" })
      console.log(`PASS site: shared hero, responsive layout, scroll, ${path}, ${width}px`)
    }
    await context.close()
  }

  for (const reducedMotion of ["no-preference", "reduce"]) {
    const { context, page, errors } = await fixture({ reducedMotion })
    await page.goto(`${baseUrl}/competences`, { waitUntil: "networkidle" })
    const card = page.locator("[data-ui-card]").filter({ has: page.getByRole("button", { name: "En savoir plus" }) }).first()
    await card.scrollIntoViewIfNeeded()
    await page.waitForTimeout(900)
    const cardText = (await card.textContent()).trim().slice(0, 80)
    const count = await page.evaluate((text) => window.__reveals.filter((value) => value === text).length, cardText)
    if (reducedMotion === "reduce") assert.equal(count, 0, "Reduced motion: no scroll reveal")
    else assert.ok(count > 0, "Scroll should reveal content")
    await card.hover()
    await page.waitForTimeout(350)
    const lift = await card.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42)
    assert.equal(lift, reducedMotion === "reduce" ? 0 : -4)
    await page.mouse.move(0, 0)
    await page.locator("h1").scrollIntoViewIfNeeded()
    await card.scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    assert.equal(await page.evaluate((text) => window.__reveals.filter((value) => value === text).length, cardText), count,
      "Already revealed content must not animate again")
    await card.getByRole("button", { name: "En savoir plus" }).click()
    await page.getByRole("heading", { name: "Objectifs de la formation", exact: true }).waitFor()
    assert.deepEqual(errors, [])
    console.log(`PASS site: one-shot reveal, hover, working formation details, preference=${reducedMotion}`)
    await context.close()
  }

  {
    const { context, page, errors } = await fixture()
    await page.goto(`${baseUrl}/startups/candidature`, { waitUntil: "networkidle" })
    assert.equal(await page.locator('[data-motion-scope="form"]').count(), 1)
    assert.equal(await page.evaluate(() => window.__reveals.length), 0, "Forms have no decorative reveals")
    const input = page.locator('form input:not([type="file"]):not([type="hidden"])').first()
    await input.fill("Projet de test")
    await page.emulateMedia({ reducedMotion: "reduce" })
    assert.equal(await input.inputValue(), "Projet de test", "Motion preferences must not remount a form")
    assert.deepEqual(errors, [])
    console.log("PASS site: form values preserved, no scroll decoration")
    await context.close()
  }

  {
    const { context, page } = await fixture({ javaScriptEnabled: false })
    await page.goto(`${baseUrl}/about`, { waitUntil: "load" })
    assert.equal(await page.locator("h1").isVisible(), true)
    const section = page.locator("[data-reveal]").last()
    assert.equal(await section.evaluate((element) => getComputedStyle(element).opacity), "1")
    console.log("PASS site: content visible without JavaScript")
    await context.close()
  }
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
