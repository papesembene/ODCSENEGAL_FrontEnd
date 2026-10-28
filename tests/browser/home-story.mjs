import assert from "node:assert/strict"
import { mkdir } from "node:fs/promises"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
const output = process.env.ODC_SCREENSHOT_DIR
let browser
let server

async function fixture(width, reducedMotion = "no-preference") {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion })
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route("**/api/**", (route) => {
    const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin,
      "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "GET, OPTIONS" }
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers })
    const data = new URL(route.request().url()).pathname.endsWith("/candidature/status")
      ? { isOpen: true, campaign: { title: "Campagne de test", endAt: "2030-01-01T00:00:00Z" } } : []
    return route.fulfill({ headers, contentType: "application/json", body: JSON.stringify({ success: true, data }) })
  })
  await page.goto(baseUrl, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Campagne de test" }).waitFor()
  return { context, page, errors }
}

async function scroll(page, top) {
  await page.evaluate((position) => scrollTo({ top: position, behavior: "instant" }), top)
  await page.waitForTimeout(1600)
}

try {
  server = await startBrowserServer(baseUrl)
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })
  if (output) await mkdir(output, { recursive: true })

  {
    const { context, page, errors } = await fixture(1440)
    const signature = page.locator("[data-hero-signature]")
    assert.equal(await signature.isVisible(), true)
    const animations = await signature.evaluate((element) => element.getAnimations({ subtree: true })
      .map((animation) => animation.effect.getTiming()))
    assert.ok(animations.some((timing) => timing.duration === 4800 && timing.iterations === 1))
    assert.ok(animations.every((timing) => timing.iterations !== Infinity), "Intro finishes without a pause button or endless motion")
    if (output) await page.screenshot({ path: `${output}/story-hero-1440.png`, animations: "disabled" })

    const stack = page.locator("[data-program-stack]")
    await page.waitForFunction(() => document.querySelector("[data-program-stack]").dataset.stackEnabled === "true")
    const top = await stack.evaluate((element) => element.getBoundingClientRect().top + scrollY)
    const cards = stack.locator('[data-motion-profile="program"]')
    assert.equal(await cards.count(), 2)
    await scroll(page, top - 128)
    assert.ok((await cards.first().boundingBox()).height >= 500, "Programs are large photo panels, not the previous small cards")
    if (output) await page.screenshot({ path: `${output}/story-program-first-1440.png`, animations: "disabled" })
    await scroll(page, top + 180)
    const first = await cards.first().boundingBox()
    const second = await cards.nth(1).boundingBox()
    assert.ok(Math.abs(first.y - 96) <= 1, "First panel stays readable while the second approaches")
    assert.ok(second.y > 112 && second.y < first.y + first.height, "Second panel visibly overlaps the first on scroll")
    const foreground = await cards.nth(1).evaluate((element) => {
      const box = element.getBoundingClientRect()
      return document.elementFromPoint(box.x + box.width / 2, box.y + 30)?.closest('[data-motion-profile="program"]') === element
    })
    assert.equal(foreground, true, "Incoming panel paints above the previous one")
    if (output) await page.screenshot({ path: `${output}/story-program-stack-1440.png`, animations: "disabled" })
    await scroll(page, top + 340)
    assert.ok((await cards.nth(1).boundingBox()).y < second.y - 100, "Motion follows scrolling rather than a one-shot hover")
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.waitForFunction(() => document.querySelector("[data-program-stack]").dataset.stackEnabled === "false")
    assert.equal(await cards.first().evaluate((element) => getComputedStyle(element).position), "relative")
    assert.deepEqual(errors, [])
    console.log("PASS story: finite hero sequence, full-size panels, actual scroll overlap, accessible fallback")
    await context.close()
  }

  for (const width of [320, 390, 1440]) {
    const { context, page, errors } = await fixture(width, "reduce")
    await page.waitForFunction(() => document.querySelector("[data-program-stack]").dataset.stackEnabled === "false")
    assert.equal(await page.locator('[data-motion-profile="program"]').first().evaluate((element) => getComputedStyle(element).position), "relative")
    const impact = page.locator("[data-impact-section]")
    assert.equal(await impact.evaluate((element) => getComputedStyle(element).backgroundColor), "rgb(23, 23, 23)")
    await impact.scrollIntoViewIfNeeded()
    assert.deepEqual(await impact.locator("dd").allTextContents(), ["1 000+", "50+", "200+", "30+"])
    assert.equal(await impact.locator("dd").evaluateAll((elements) => elements.every((element) => element.scrollWidth <= element.clientWidth + 1)), true)
    if (output) await page.screenshot({ path: `${output}/story-impact-${width}.png`, animations: "disabled" })
    await page.addStyleTag({ content: "html { font-size: 200%; }" })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, "Large typography must reflow at 200%")
    assert.equal(await impact.locator("dd").evaluateAll((elements) => elements.every((element) => element.scrollWidth <= element.clientWidth + 1)), true, "Values remain complete, not clipped")
    assert.deepEqual(errors, [])
    console.log(`PASS story: static panels, readable impact values, 200% text, ${width}px`)
    await context.close()
  }

  for (const reducedMotion of ["no-preference", "reduce"]) {
    const { context, page, errors } = await fixture(1440, reducedMotion)
    const testimonials = page.locator("[data-testimonials-section]")
    await testimonials.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1600)
    const stage = page.locator("[data-testimonial-stage]")
    const before = await stage.boundingBox()
    assert.equal(await stage.locator('figure[aria-hidden="false"]').count(), 1)
    await testimonials.getByRole("button", { name: "Témoignage suivant" }).click()
    await stage.locator('figure[aria-hidden="false"]').getByText("Assietou SY", { exact: true }).waitFor()
    await page.waitForTimeout(1000)
    const after = await stage.boundingBox()
    assert.equal(after.height, before.height, "Reading area must not jump between long and short quotes")
    assert.equal(after.width, before.width)
    assert.equal(await stage.getAttribute("aria-busy"), "false")
    if (output) await page.screenshot({ path: `${output}/story-testimonials-${reducedMotion}.png`, animations: "disabled" })
    await testimonials.getByRole("button", { name: "Témoignage précédent" }).click()
    await stage.locator('figure[aria-hidden="false"]').getByText("Khady DIAGNE", { exact: true }).waitFor()
    assert.equal((await stage.boundingBox()).height, before.height)

    const partners = page.getByRole("list", { name: "Nos partenaires" })
    await partners.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1400)
    assert.equal(await partners.getByRole("listitem").count(), 16)
    assert.equal(await partners.getByRole("img").count(), 16)
    assert.equal(await partners.getByRole("img").evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), true,
      "All original partner logos still load")
    if (output) await page.screenshot({ path: `${output}/story-partners-${reducedMotion}.png`, animations: "disabled" })
    assert.deepEqual(errors, [])
    console.log(`PASS story: stable editorial testimonials, manual controls, complete partner wall, ${reducedMotion}`)
    await context.close()
  }
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
