import assert from "node:assert/strict"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
let browser
let server

async function fixture(reducedMotion, { holdNavigation = false, navigationPath = "/competences",
  viewport = { width: 1440, height: 900 }, hasTouch = false } = {}) {
  const context = await browser.newContext({ viewport, hasTouch, reducedMotion })
  const page = await context.newPage()
  await context.addInitScript(() => {
    window.__homeReveals = []
    window.__slideExits = []
    new MutationObserver((changes) => {
      for (const { target } of changes) {
        if (target.dataset.slidePhase === "leaving") {
          window.__slideExits.push({ title: target.querySelector("h1").textContent,
            duration: parseFloat(getComputedStyle(target).animationDuration) })
        }
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ["data-slide-phase"] })
    const animate = Element.prototype.animate
    Element.prototype.animate = function (frames, options) {
      if (options?.duration === 1000 && this.closest("[data-home-motion]")) {
        window.__homeReveals.push({ type: this.closest("[data-reveal]")?.dataset.reveal,
          section: this.closest("section")?.id,
          word: this.hasAttribute("data-reveal-word"),
          text: this.textContent.trim().slice(0, 80), delay: options.delay, duration: options.duration })
      }
      return animate.call(this, frames, options)
    }
  })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  let release
  const gate = new Promise((resolve) => { release = resolve })
  if (holdNavigation) await page.route(`**${navigationPath}?*`, async (route) => {
    await gate
    await route.continue().catch(() => {})
  })
  await page.route("**/api/**", (route) => {
    const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin,
      "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "GET, OPTIONS" }
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers })
    const data = new URL(route.request().url()).pathname.endsWith("/candidature/status")
      ? { isOpen: true, campaign: { title: "Campagne de test", endAt: "2030-01-01T00:00:00Z" } } : []
    return route.fulfill({ headers, contentType: "application/json", body: JSON.stringify({ success: true, data }) })
  })
  await page.goto(baseUrl, { waitUntil: holdNavigation ? "domcontentloaded" : "networkidle", timeout: 90000 })
  await page.getByRole("heading", { level: 1, name: "Campagne de test" }).waitFor()
  return { context, page, errors, release }
}

async function showFirstProgram(page) {
  await page.evaluate(() => {
    const stack = document.querySelector("[data-program-stack]")
    scrollTo({ top: stack.getBoundingClientRect().top + scrollY - 160, behavior: "instant" })
  })
  await page.waitForTimeout(1500)
}

try {
  server = await startBrowserServer(baseUrl)
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })

  for (const reducedMotion of ["no-preference", "reduce"]) {
    const { context, page, errors } = await fixture(reducedMotion)
    const hero = page.locator('section[aria-roledescription="carrousel"]')
    const visuals = await hero.evaluate((element) => ({
      overlay: getComputedStyle(element.querySelector('[aria-hidden="true"]'), "::after").backgroundImage,
      imageTransition: getComputedStyle(element.querySelector("img")).transitionDuration,
      entryAnimation: getComputedStyle(element.querySelector("h1").parentElement).animationName,
    }))
    assert.match(visuals.overlay, /255,\s*121,\s*0/, "Banner retains the Orange brand gradient")
    if (reducedMotion === "reduce") {
      assert.equal(visuals.imageTransition, "0s")
      assert.equal(visuals.entryAnimation, "none")
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto")
    } else {
      assert.notEqual(visuals.imageTransition, "0s")
      assert.notEqual(visuals.entryAnimation, "none")
    }
    const choreography = await hero.evaluate((element) => {
      const copy = element.querySelector("h1").parentElement
      const words = [...copy.querySelectorAll("h1 span[style]")]
      return {
        crossfade: parseFloat(getComputedStyle(element.querySelector('[aria-hidden="true"] > div')).transitionDuration),
        delays: [copy.querySelector("p"), words[0], words.at(-1), copy.querySelectorAll("p")[1], copy.querySelector("p + div")]
          .filter(Boolean).map((node) => parseFloat(getComputedStyle(node).animationDelay)),
        wordAnimation: getComputedStyle(words[0]).animationName,
      }
    })
    if (reducedMotion === "reduce") assert.equal(choreography.wordAnimation, "none")
    else {
      assert.ok(choreography.crossfade >= 1.3, "Photos need a gentle crossfade")
      assert.notEqual(choreography.wordAnimation, "none", "Headline words should enter progressively")
      assert.ok(choreography.delays[1] > choreography.delays[0], "Heading follows the category")
      assert.ok(choreography.delays[2] > choreography.delays[1], "Words are staggered")
    }
    const apply = hero.getByRole("button", { name: "Postuler", exact: true })
    await apply.hover()
    await page.mouse.down()
    await page.waitForTimeout(180)
    const scale = await apply.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)
    if (reducedMotion === "reduce") assert.equal(scale, 1)
    else assert.ok(scale < 1, "Press feedback must respond before releasing the button")
    await page.mouse.move(1, 1)
    await page.mouse.up()
    await hero.getByRole("button", { name: "Slide suivant", exact: true }).click()
    await page.getByRole("heading", { level: 1, name: "Développez vos compétences numériques" }).waitFor()
    assert.equal(await hero.evaluate((element) => element.getAnimations({ subtree: true })
      .filter((animation) => animation.effect?.getTiming().iterations === Infinity).length), 0,
    "The hero must not run endless decorative animations")
    assert.deepEqual(errors, [])
    console.log(`PASS motion: Orange gradient, manual transition, preference=${reducedMotion}`)
    await context.close()
  }

  for (const reducedMotion of ["no-preference", "reduce"]) {
    const { context, page, errors } = await fixture(reducedMotion)
    const hero = page.locator('section[aria-roledescription="carrousel"]')
    const next = hero.getByRole("button", { name: "Slide suivant", exact: true })
    await next.click()
    if (reducedMotion === "no-preference") {
      const exits = await page.evaluate(() => window.__slideExits)
      assert.ok(exits.some((exit) => exit.title === "Campagne de test" && exit.duration >= .25),
        "Previous text should fade out before replacement, even if automation returns after the transition")
    }
    await next.click()
    await page.getByRole("heading", { level: 1, name: "Faites décoller votre startup" }).waitFor()
    assert.equal(await hero.locator("h1").count(), 1)
    assert.equal(await hero.getAttribute("data-active-slide"), "2", "Rapid input keeps the latest requested slide")
    await page.waitForTimeout(1700)
    const before = await hero.locator("h1").evaluate((element) => ({
      x: element.getBoundingClientRect().x, y: element.getBoundingClientRect().y + scrollY,
    }))
    await page.evaluate(() => window.scrollTo({ top: 240, behavior: "instant" }))
    await page.waitForTimeout(150)
    const frame = await hero.evaluate((element) => {
      const visual = element.querySelector('[aria-hidden="true"]')
      const title = element.querySelector("h1").getBoundingClientRect()
      return { scale: getComputedStyle(visual).scale, radius: parseFloat(getComputedStyle(visual).borderTopLeftRadius),
        title: { x: title.x, y: title.y + scrollY } }
    })
    assert.deepEqual(frame.title, before, "Only the background is framed; text and click targets must stay in place")
    if (reducedMotion === "reduce") {
      assert.equal(frame.scale, "none")
      assert.equal(frame.radius, 0)
    } else {
      assert.ok(parseFloat(frame.scale) < 1 && parseFloat(frame.scale) >= .84)
      assert.ok(frame.radius > 0, "The photo develops a rounded frame on scroll")
    }
    const programs = page.locator("#programmes")
    await programs.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1500)
    const reveals = await page.evaluate(() => window.__homeReveals)
    if (reducedMotion === "reduce") assert.deepEqual(reveals, [])
    else {
      assert.ok(reveals.some((entry) => entry.type === "heading"), "Home headings reveal in stages")
      assert.ok(reveals.some((entry) => entry.type === "card"), "Program cards enter on scroll")
      assert.ok(reveals.some((entry) => entry.type === "heading" && entry.word), "Section headings reveal word by word")
      const heading = reveals.filter((entry) => entry.type === "heading")
      assert.ok(heading[1].delay > heading[0].delay, "Section title follows its eyebrow")
      const count = reveals.filter((entry) => entry.section === "programmes").length
      await hero.scrollIntoViewIfNeeded()
      await programs.scrollIntoViewIfNeeded()
      await page.waitForTimeout(1500)
      assert.equal(await page.evaluate(() => window.__homeReveals.filter((entry) => entry.section === "programmes").length), count,
        "Scroll entrances run once")
    }
    const photo = page.locator("[data-home-photo]").first()
    await showFirstProgram(page)
    const link = photo.locator("..")
    const targetBefore = await link.boundingBox()
    const box = await photo.boundingBox()
    await page.mouse.move(box.x + box.width * .8, box.y + box.height * .2)
    await page.waitForTimeout(750)
    const relief = await photo.evaluate((element) => ({
      active: element.dataset.photoActive === "true",
      transform: getComputedStyle(element.querySelector("img")).transform,
    }))
    assert.deepEqual(await link.boundingBox(), targetBefore, "Relief must not move the clickable card")
    if (reducedMotion === "reduce") {
      assert.equal(relief.active, false)
      assert.equal(relief.transform, "none")
    } else {
      assert.equal(relief.active, true)
      assert.match(relief.transform, /^matrix3d/, "Photo follows the pointer with bounded perspective")
      await page.emulateMedia({ reducedMotion: "reduce" })
      await page.waitForTimeout(100)
      assert.equal(await photo.getAttribute("data-photo-active"), null, "Changing motion preference cancels the active relief")
      assert.equal(await photo.locator("img").evaluate((element) => getComputedStyle(element).transform), "none")
    }
    assert.deepEqual(errors, [])
    console.log(`PASS motion: soft slides, background frame, masked titles, stable photo relief, preference=${reducedMotion}`)
    await context.close()
  }

  {
    const { context, page, errors } = await fixture("no-preference", { viewport: { width: 390, height: 844 }, hasTouch: true })
    const photo = page.locator("[data-home-photo]").first()
    await showFirstProgram(page)
    await photo.dispatchEvent("pointermove", { pointerType: "touch", clientX: 100, clientY: 200 })
    assert.equal(await photo.getAttribute("data-photo-active"), null, "Touch does not activate pointer-driven motion")
    assert.equal(await page.evaluate(() => document.body.scrollWidth <= innerWidth), true)
    await photo.locator("..").tap()
    await page.waitForURL(`${baseUrl}/competences`)
    assert.deepEqual(errors, [])
    console.log("PASS motion: touch scrolling stays native and program cards still navigate")
    await context.close()
  }

  for (const reducedMotion of ["no-preference", "reduce"]) {
    const { context, page, errors, release } = await fixture(reducedMotion, { holdNavigation: true })
    try {
      await showFirstProgram(page)
      const link = page.getByRole("link", { name: "Développez vos compétences numériques.", exact: true })
      await link.click({ noWaitAfter: true })
      const feedback = link.locator("[data-navigation-pending]")
      await feedback.waitFor()
      assert.equal(await feedback.getAttribute("role"), "status")
      const animation = await feedback.evaluate((element) => getComputedStyle(element).animationName)
      if (reducedMotion === "reduce") assert.equal(animation, "none")
      else assert.notEqual(animation, "none")
      release()
      await page.waitForURL(`${baseUrl}/competences`, { timeout: 30000 })
      await page.getByRole("heading", { level: 1, name: "Développement des Compétences Numériques" }).waitFor()
      assert.equal(await page.locator("[data-navigation-pending]").count(), 0)
      assert.deepEqual(errors, [])
      console.log(`PASS motion: real navigation feedback then destination, preference=${reducedMotion}`)
    } finally {
      release()
      await context.close()
    }
  }

  {
    const { context, page, errors, release } = await fixture("reduce", { holdNavigation: true, navigationPath: "/odc/candidatures" })
    try {
      await page.locator('section[aria-roledescription="carrousel"]').getByRole("button", { name: "Postuler", exact: true }).click({ noWaitAfter: true })
      await page.waitForFunction(() => {
        const button = document.querySelector('section[aria-roledescription="carrousel"] button[aria-busy="true"]')
        return button?.disabled
      })
      await page.waitForTimeout(100)
      assert.equal(await page.locator('section[aria-roledescription="carrousel"] button[aria-busy="true"]').isDisabled(), true)
      release()
      await page.waitForURL(`${baseUrl}/odc/candidatures`)
      await page.locator("form").waitFor()
      assert.deepEqual(errors, [])
      console.log("PASS motion: application button stays busy until actual form navigation completes")
    } finally {
      release()
      await context.close()
    }
  }
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
