import assert from "node:assert/strict"
import { mkdir } from "node:fs/promises"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
const output = process.env.ODC_SCREENSHOT_DIR
let browser
let server

async function scroll(page, top) {
  await page.evaluate((position) => window.scrollTo({ top: position, behavior: "instant" }), top)
}

async function finishNavbarTransition(header) {
  await header.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {})))
  })
}

async function geometry(page) {
  return page.evaluate(() => {
    const header = document.querySelector("header")
    const logo = header.querySelector("img")
    return {
      height: header.getBoundingClientRect().height,
      width: header.getBoundingClientRect().width,
      x: header.getBoundingClientRect().x,
      y: header.getBoundingClientRect().y,
      logoWidth: logo.getBoundingClientRect().width,
      mainTop: document.querySelector("main").getBoundingClientRect().top + scrollY,
      shellHeight: document.querySelector("[data-navigation-shell]").getBoundingClientRect().height,
      scrollY,
    }
  })
}

try {
  server = await startBrowserServer(baseUrl)
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })
  if (output) await mkdir(output, { recursive: true })

  for (const width of [320, 390, 1440]) {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion })
      const page = await context.newPage()
      const errors = []
      page.on("pageerror", (error) => errors.push(error.message))
      await page.route("**/api/**", (route) => {
        const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin,
          "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "GET, OPTIONS" }
        if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers })
        const data = new URL(route.request().url()).pathname.endsWith("/candidature/status") ? { isOpen: false } : []
        return route.fulfill({ headers, contentType: "application/json", body: JSON.stringify({ success: true, data }) })
      })
      await page.goto(baseUrl, { waitUntil: "networkidle" })
      const header = page.locator("header")
      const initial = await geometry(page)
      assert.equal(initial.height, 64)
      assert.equal(initial.width, width)
      assert.equal(initial.logoWidth, 120)
      assert.equal(await header.locator("[data-navigation-name]").isVisible(), false)

      await scroll(page, 180)
      await page.waitForFunction(() => document.querySelector("header").dataset.compact === "true")
      await page.waitForTimeout(90)
      const intermediate = await geometry(page)
      const compactWidth = Math.min(440, width - 24)
      if (reducedMotion === "no-preference") assert.ok(intermediate.width >= compactWidth && intermediate.width < width,
        "The navbar must contract horizontally, not merely reduce its height")
      else assert.equal(intermediate.width, compactWidth)
      if (reducedMotion === "no-preference") {
        assert.ok(await header.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration) >= 1.1),
          "Contraction lasts over one second")
        await page.waitForTimeout(300)
        assert.ok((await geometry(page)).width > compactWidth + (width - compactWidth) * .2,
          "The easing must not collapse most of the width in the first moments")
      }
      await finishNavbarTransition(header)
      const compact = await geometry(page)
      assert.equal(compact.height, initial.height)
      assert.equal(compact.width, compactWidth)
      assert.equal(compact.x, (width - compactWidth) / 2, "The capsule remains centered")
      assert.equal(compact.y, 12, "The capsule floats below the top edge")
      assert.equal(compact.logoWidth, width < 480 ? 72 : 96)
      assert.equal(await header.locator("[data-navigation-name]").isVisible(), true)
      assert.match(await header.locator("[data-navigation-name]").textContent(), /Orange Digital Center.*Sénégal/)
      assert.equal(compact.mainTop, initial.mainTop, "Shrinking must not move the page content")
      assert.equal(compact.shellHeight, initial.shellHeight, "Reserved header space remains stable")
      assert.equal(compact.scrollY, 180, "The header must not change the scroll position")
      assert.equal(await page.evaluate(() => {
        const element = document.elementFromPoint(4, 40)
        return Boolean(element?.closest("header, [data-navigation-shell]"))
      }), false, "Space outside the capsule must not intercept page clicks")
      const contentFits = await header.evaluate((element) => {
        const box = element.getBoundingClientRect()
        return [...element.querySelectorAll('img, [data-navigation-name], button')].every((child) => {
          const rect = child.getBoundingClientRect()
          return !rect.width || (rect.left >= box.left && rect.right <= box.right)
        })
      })
      assert.equal(contentFits, true, "Logo, name and menu must fit even at 320px")

      await scroll(page, 60)
      await page.waitForTimeout(100)
      assert.equal(await header.getAttribute("data-compact"), "true", "Small scroll reversals must not flicker")
      const menu = header.getByRole("button", { name: "Menu", exact: true })
      assert.ok((await menu.boundingBox()).height >= 44)
      await menu.click()
      const panel = page.getByRole("navigation", { name: "Navigation du portail" })
      await panel.waitFor()
      const bar = await header.boundingBox()
      const box = await panel.boundingBox()
      assert.ok(box.y >= bar.y + bar.height + 6 && box.y <= bar.y + bar.height + 9,
        "The dropdown follows the floating capsule")
      assert.ok(box.y + box.height <= 901)
      assert.equal(await panel.getByRole("link").count(), 4)
      await page.keyboard.press("Tab")
      assert.equal(await panel.getByRole("link").first().evaluate((element) => element === document.activeElement), true)
      await page.keyboard.press("Escape")
      assert.equal(await panel.isVisible(), false)
      assert.equal(await menu.evaluate((element) => element === document.activeElement), true)
      await menu.click()
      await page.mouse.click(4, 180)
      assert.equal(await panel.isVisible(), false, "Clicking outside closes the menu")
      if (output) await page.screenshot({ path: `${output}/header-compact-${width}-${reducedMotion}.png`, animations: "disabled" })

      await scroll(page, 0)
      await page.waitForFunction(() => document.querySelector("header").dataset.compact === "false")
      await finishNavbarTransition(header)
      assert.equal((await geometry(page)).height, 64)
      assert.equal((await geometry(page)).width, initial.width)
      assert.equal((await geometry(page)).logoWidth, 120)
      assert.equal(await header.locator("[data-navigation-name]").isVisible(), false)
      assert.equal(await page.evaluate(() => document.body.scrollWidth <= innerWidth), true)
      if (reducedMotion === "no-preference") {
        await scroll(page, 180)
        await page.waitForTimeout(220)
        await scroll(page, 0)
        await page.waitForFunction(() => document.querySelector("header").dataset.compact === "false")
        await finishNavbarTransition(header)
        assert.equal((await geometry(page)).width, initial.width, "Rapid scroll reversal leaves no queued collapse")
      }
      await scroll(page, 180)
      await page.waitForFunction(() => document.querySelector("header").dataset.compact === "true")
      await finishNavbarTransition(header)
      await menu.click()
      await panel.getByRole("link", { name: "Développement des Compétences", exact: true }).click()
      await page.waitForURL(`${baseUrl}/competences`)
      await page.waitForFunction(() => document.querySelector("header").dataset.compact === "false")
      assert.equal(await panel.isVisible(), false, "Navigation closes the menu and restores the wide bar")
      assert.deepEqual(errors, [])
      console.log(`PASS header: width contraction, centered named capsule, menu, keyboard, stable layout, restore, ${width}px, ${reducedMotion}`)
      await context.close()
    }
  }
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
