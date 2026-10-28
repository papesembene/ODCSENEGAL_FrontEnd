import assert from "node:assert/strict"
import { mkdir } from "node:fs/promises"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
const output = process.env.ODC_SCREENSHOT_DIR
const campaignTitle = "Appel à candidature pour les métiers du numérique"
let browser
let server

async function createPage(viewport, { bannersFail = false, statusFail = false, managedBanner = false, managedContent = false, closed = false } = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" })
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url())
    const headers = {
      "Access-Control-Allow-Origin": new URL(baseUrl).origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
    }
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers })
    const statusRequest = url.pathname.endsWith("/candidature/status")
    const bannerRequest = url.pathname.endsWith("/portal-content/public") && url.searchParams.get("type") === "banner"
    if ((bannersFail && bannerRequest) || (statusFail && statusRequest)) {
      return route.fulfill({ status: 503, headers, contentType: "application/json", body: JSON.stringify({ error: "Indisponible" }) })
    }
    let data = statusRequest ? {
      isOpen: !closed,
      lifecycleStatus: closed ? "closed" : "open",
      campaign: { title: campaignTitle, promotion: "Promotion de test", startAt: "2026-10-01T00:00:00Z", endAt: "2026-12-01T23:59:59Z" },
    } : managedBanner && bannerRequest ? [{
      id: "managed-training", slotKey: "competences", title: "Une formation publiée par le CM",
      summary: "Présentation de la formation.", imageUrl: "/p7graduation.jpeg",
      linkLabel: "Découvrir la formation", linkUrl: "/competences",
    }] : []
    if (managedContent && url.searchParams.get("type") === "info") {
      data = [{ id: "notice", title: "Information publiée par le CM", summary: "Les informations pratiques du centre.", linkLabel: "Nous contacter", linkUrl: "/contact" }]
    }
    if (managedContent && url.searchParams.get("type") === "news") {
      data = Array.from({ length: 4 }, (_, index) => ({
        id: `news-${index}`, title: `Actualité publiée ${index + 1}`, summary: "Présentation de l'actualité du centre.",
        ...(index === 0 ? { imageUrl: "/p7graduation.jpeg", linkUrl: "/competences" } : {}),
      }))
    }
    return route.fulfill({ headers, contentType: "application/json", body: JSON.stringify({ success: true, data }) })
  })
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 90000 })
  await page.getByRole("heading", { level: 1 }).waitFor()
  return { context, page, errors }
}

function assertInside(inner, outer, message) {
  assert.ok(inner.x >= outer.x - 1 && inner.y >= outer.y - 1 &&
    inner.x + inner.width <= outer.x + outer.width + 1 &&
    inner.y + inner.height <= outer.y + outer.height + 1, message)
}

try {
  server = await startBrowserServer(baseUrl)
  if (output) await mkdir(output, { recursive: true })
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })

  for (const viewport of [
    { width: 320, height: 700 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
    { width: 1440, height: 900 },
  ]) {
    const { context, page, errors } = await createPage(viewport)
    const hero = page.locator('section[aria-roledescription="carrousel"]')
    await hero.getByRole("heading", { level: 1, name: new RegExp(campaignTitle) }).waitFor()
    assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1, "Exactly one active h1")
    assert.equal(await hero.getByRole("button", { name: "Postuler", exact: true }).isEnabled(), true)

    const state = await page.evaluate(() => ({ width: innerWidth, pageWidth: document.documentElement.scrollWidth }))
    assert.ok(state.pageWidth <= state.width + 1, `No horizontal overflow at ${viewport.width}px`)
    const heroBox = await hero.boundingBox()
    assert.ok(heroBox.height >= viewport.height - 65, "Hero fills available first screen, without clipping tall content")
    assertInside(await hero.getByRole("button", { name: "Postuler", exact: true }).boundingBox(), heroBox, "Primary action stays inside the hero")
    assertInside(await hero.getByRole("button", { name: "Slide suivant", exact: true }).boundingBox(), heroBox, "Controls stay inside the hero")

    const next = hero.getByRole("button", { name: "Slide suivant", exact: true })
    await next.click()
    await page.getByRole("heading", { level: 1, name: "Développez vos compétences numériques" }).waitFor()
    await next.focus()
    await page.keyboard.press("ArrowRight")
    await page.getByRole("heading", { level: 1, name: "Faites décoller votre startup" }).waitFor()
    await page.keyboard.press("ArrowRight")
    await page.getByRole("heading", { level: 1, name: new RegExp(campaignTitle) }).waitFor()

    const partners = page.getByRole("list", { name: "Nos partenaires" })
    assert.equal(await partners.getByRole("listitem").count(), 16, "All original partner logos are retained")
    await page.getByRole("button", { name: "Témoignage suivant" }).click()
    await page.getByText("Assietou SY", { exact: true }).waitFor()
    await hero.getByRole("link", { name: "La suite commence ici" }).click()
    await page.waitForFunction(() => {
      const top = document.getElementById("programmes").getBoundingClientRect().top
      return top >= 63 && top < 150
    })

    if (viewport.width < 1024) {
      const menu = page.getByRole("button", { name: "Menu", exact: true })
      await menu.scrollIntoViewIfNeeded()
      assert.equal(await menu.getAttribute("aria-expanded"), "false")
      assert.equal(await page.locator("#portal-navigation").isVisible(), false)
      await menu.click()
      await page.getByRole("navigation", { name: "Navigation du portail" }).waitFor()
      await page.keyboard.press("Escape")
      assert.equal(await menu.getAttribute("aria-expanded"), "false")
      assert.equal(await menu.evaluate((button) => button === document.activeElement), true)
    }

    await page.evaluate(() => {
      document.activeElement?.blur()
      scrollTo({ top: 0, behavior: "instant" })
    })
    await page.mouse.move(viewport.width / 2, 1)
    if (output) {
      await page.screenshot({ path: `${output}/home-redesign-${viewport.width}.png`, fullPage: true, animations: "disabled" })
      await page.screenshot({ path: `${output}/home-hero-${viewport.width}.png`, animations: "disabled" })
    }
    assert.deepEqual(errors, [], "No runtime errors")
    console.log(`PASS home: ${viewport.width}x${viewport.height}, layout, campaign, carousel, menu, testimonials`)
    await context.close()
  }

  for (const failure of [{ bannersFail: true }, { statusFail: true }]) {
    const { context, page, errors } = await createPage({ width: 390, height: 844 }, failure)
    if (failure.bannersFail) {
      await page.getByRole("heading", { level: 1, name: new RegExp(campaignTitle) }).waitFor()
      await page.getByRole("button", { name: "Postuler", exact: true }).waitFor()
    } else {
      await page.getByRole("heading", { level: 1, name: "Appel à candidature", exact: true }).waitFor()
      assert.equal(await page.getByRole("button", { name: "Postuler", exact: true }).count(), 0, "An unavailable API must not claim applications are open")
    }
    assert.deepEqual(errors, [])
    console.log(`PASS home: API fallback ${Object.keys(failure)[0]}`)
    await context.close()
  }

  {
    const { context, page, errors } = await createPage({ width: 390, height: 844 }, { managedBanner: true })
    await page.getByRole("heading", { level: 1, name: new RegExp(campaignTitle) }).waitFor()
    await page.getByRole("button", { name: "Slide suivant", exact: true }).click()
    await page.getByRole("heading", { level: 1, name: "Une formation publiée par le CM" }).waitFor()
    assert.ok(await page.locator('section[aria-roledescription="carrousel"] img').evaluateAll((images) =>
      images.some((image) => image.src.includes("p7graduation.jpeg"))), "Managed images remain editable from the portal")
    assert.deepEqual(errors, [])
    console.log("PASS home: managed banner text and image")
    await context.close()
  }

  {
    const { context, page, errors } = await createPage({ width: 390, height: 844 }, { closed: true })
    await page.getByRole("heading", { level: 1, name: new RegExp(campaignTitle) }).waitFor()
    const action = page.getByRole("link", { name: "Candidatures fermées", exact: true })
    assert.equal(await action.getAttribute("href"), "/candidatures/fermees")
    assert.equal(await page.getByRole("button", { name: "Postuler", exact: true }).count(), 0)
    assert.deepEqual(errors, [])
    console.log("PASS home: closed campaign does not offer an active application link")
    await context.close()
  }

  {
    const { context, page, errors } = await createPage({ width: 390, height: 844 }, { managedContent: true })
    await page.getByRole("heading", { level: 1, name: new RegExp(campaignTitle) }).waitFor()
    await page.addStyleTag({ content: "html { font-size: 200%; }" })
    const dimensions = await page.evaluate(() => ({
      width: innerWidth,
      pageWidth: document.documentElement.scrollWidth,
      overflowing: [...document.querySelectorAll("main *, header *, footer *")]
        .filter((element) => element.getBoundingClientRect().right > innerWidth + 1)
        .map((element) => ({ tag: element.tagName, className: element.className, text: element.textContent.slice(0, 70) }))
        .slice(0, 10),
    }))
    assert.ok(dimensions.pageWidth <= dimensions.width + 1, `Text enlargement must reflow: ${JSON.stringify(dimensions)}`)
    assert.deepEqual(errors, [])
    console.log("PASS home: text enlarged to 200%")
    await context.close()
  }

  {
    const { context, page, errors } = await createPage({ width: 390, height: 844 }, { managedContent: true })
    await page.getByRole("region", { name: "Information du centre" }).waitFor()
    await page.getByRole("heading", { name: "Actualité publiée 3" }).waitFor()
    assert.equal(await page.getByRole("heading", { name: "Actualité publiée 4" }).count(), 0)
    await page.getByRole("button", { name: "Voir toutes les actualités" }).click()
    await page.getByRole("heading", { name: "Actualité publiée 4" }).waitFor()
    await page.getByRole("button", { name: "Réduire les actualités" }).click()
    assert.equal(await page.getByRole("heading", { name: "Actualité publiée 4" }).count(), 0)
    assert.equal(await page.getByText("LIVE", { exact: true }).count(), 0)
    assert.deepEqual(errors, [])
    console.log("PASS home: managed notices and news remain readable and expandable")
    await context.close()
  }

  {
    const { context, page } = await createPage({ width: 390, height: 844 })
    await page.evaluate(() => document.documentElement.classList.add("dark"))
    const colors = await page.locator("main > div").first().evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      foreground: getComputedStyle(element).color,
    }))
    assert.equal(colors.background, "rgb(19, 19, 19)")
    assert.equal(colors.foreground, "rgb(245, 245, 243)")
    console.log("PASS home: dark theme retains contrasting text and backgrounds")
    await context.close()
  }

  const { context, page } = await createPage({ width: 390, height: 844 })
  await page.getByRole("heading", { level: 1, name: new RegExp(campaignTitle) }).waitFor()
  const title = await page.getByRole("heading", { level: 1 }).textContent()
  await page.waitForTimeout(10500)
  assert.equal(await page.getByRole("heading", { level: 1 }).textContent(), title, "Slides never advance while a visitor is reading")
  console.log("PASS home: manual carousel does not advance automatically")
  await context.close()
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
