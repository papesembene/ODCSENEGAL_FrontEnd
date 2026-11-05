// Fully intercepted APIs and invented identities only. No real candidates or email.
import assert from "node:assert/strict"
import { mkdir } from "node:fs/promises"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"
import defaults from "../../data/training-defaults.js"
import { RESIDENCE_LOCATIONS } from "../../lib/training-eligibility.js"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
const output = process.env.ODC_SCREENSHOT_DIR
const dataTitle = defaults.find((row) => row.code === "dev-data").title
const rows = [...defaults, { ...defaults[0], code: "fibre", value: "fibre", id: "fibre", title: "Fibre",
  applicationRegions: ["Tambacounda"], durationMonths: 3, duration: "3 mois", aliases: ["fibre"] }]
const rules = { regions: RESIDENCE_LOCATIONS, residenceRegions: RESIDENCE_LOCATIONS, defaults: {} }
let browser
let server

async function fixture(width = 1440, height = 1000) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" })
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  const scenario = { posts: [], checks: [], offline: false, catalogFailure: false, removeData: false,
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
      return respond({ success: true, data: rows.filter((row) => !scenario.removeData || row.code !== "dev-data"), regionalRules: rules })
    }
    if (url.pathname.endsWith("/candidature/status")) return respond({ success: true,
      data: { isOpen: true, lifecycleStatus: "open", campaign: { title: "Recette formulaire", endAt: "2030-01-01T00:00:00Z" } } })
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
      return respond({ candidature_id: "synthetic-candidate", message: "Candidature enregistrée avec succès" }, 201)
    }
    return respond({ success: true, data: [], events: [] })
  })
  await page.goto(`${baseUrl}/odc/candidatures`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { name: "Déposer ma candidature", exact: true }).waitFor()
  return { context, page, scenario }
}

async function optionCodes(page) {
  return page.locator("#formation option").evaluateAll((options) => options.map((option) => option.value).filter(Boolean))
}

async function navigate(page, label = "Suivant") {
  const current = await page.locator("form section").getAttribute("id")
  await page.getByRole("button", { name: label, exact: true }).click()
  await page.waitForFunction((id) => document.querySelector("form section")?.id !== id, current)
}

async function fillIdentity(page) {
  for (const [name, value] of Object.entries({ firstName: "Moussa", lastName: "Ba",
    birthDate: "2000-01-01", birthPlace: "Dakar" })) await page.locator(`#${name}`).fill(value)
  await page.locator("#gender").selectOption("male")
  await page.locator("#nationality").selectOption("Sénégalaise")
  await page.locator("#idType").selectOption("cni")
  await page.locator("#idNumber").fill("1234567890123")
}

async function fillContact(page) {
  await page.locator("#email").fill("moussa.recette@example.org")
  await page.locator("#phone").fill("771234567")
}

async function fillAvailability(page) {
  await page.locator("#education").selectOption("terminale")
  await page.locator('input[name="computer_skills"][value="no"]').check()
  await page.locator('input[name="isWorking"][value="no"]').check()
  await page.locator('input[name="isAvailable"][value="yes"]').check()
}

async function fillValidForm(page) {
  await page.locator("#region").selectOption("Thiès")
  await page.locator("#formation").selectOption("dev-data")
  await navigate(page)
  await fillIdentity(page)
  await navigate(page)
  await fillContact(page)
  await navigate(page)
  await fillAvailability(page)
  await navigate(page)
  await page.locator("#acceptTerms").check()
}

try {
  server = await startBrowserServer(baseUrl)
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })
  if (output) await mkdir(output, { recursive: true })
  for (const [width, height] of [[320, 740], [390, 844], [1366, 768], [1440, 900]]) {
    const { context, page, scenario } = await fixture(width, height)
    assert.equal(await page.locator("#region:focus").count(), 1, "The first field is focused when the form becomes ready")
    assert.equal(await page.locator("#firstName").count(), 0, "Only the active step is mounted")
    assert.equal(await page.getByText("Votre choix", { exact: true }).count(), 0)
    assert.equal(await page.locator("aside").count(), 0)
    assert.equal(await page.getByRole("button", { name: "Précédent", exact: true }).isDisabled(), true)
    assert.equal(await page.getByRole("button", { name: "Envoyer ma candidature", exact: true }).count(), 0)
    assert.equal(await page.locator("#formation").isDisabled(), true)
    await page.locator("#region").selectOption("Thiès")
    assert.deepEqual(await optionCodes(page), ["dev-data"])
    await page.locator("#formation").selectOption("dev-data")
    await navigate(page)
    assert.equal(await page.locator("#firstName:focus").count(), 1, "Step transitions focus the first field")
    assert.equal(await page.locator("#email").count(), 0, "Contact has a separate short screen")
    assert.equal(await page.locator("#idType").count(), 1)
    assert.equal(await page.locator("#idNumber").isDisabled(), true)
    const identitySize = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth }))
    assert.ok(identitySize.body <= identitySize.viewport + 1, `Identity has no horizontal overflow at ${width}px`)
    if (width >= 1024) {
      const next = await page.getByRole("button", { name: "Suivant", exact: true }).boundingBox()
      assert.ok(next.y + next.height <= height, "The personal identity screen fits the laptop viewport without scrolling down")
    }
    if (output) await page.screenshot({ path: `${output}/identity-${width}.png`, fullPage: true, animations: "disabled" })
    await fillIdentity(page)
    await page.locator("#firstName").fill("Awa")
    await page.locator("#gender").selectOption("female")
    await navigate(page)
    assert.equal(await page.locator("#email:focus").count(), 1)
    assert.equal(await page.locator("#idType").count(), 0, "The document does not belong on the contact screen")
    assert.equal(await page.locator("#idNumber").count(), 0)
    const contactSize = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth }))
    assert.ok(contactSize.body <= contactSize.viewport + 1, `Contact has no horizontal overflow at ${width}px`)
    if (output) await page.screenshot({ path: `${output}/contact-${width}.png`, fullPage: true, animations: "disabled" })
    await navigate(page, "Précédent")
    await navigate(page, "Précédent")
    await page.locator("#region").selectOption("Tambacounda")
    assert.deepEqual(await optionCodes(page), ["referent-digital", "fibre"])
    assert.equal(await page.locator("#formation").inputValue(), "")
    await page.locator("#formation").selectOption("referent-digital")
    await navigate(page)
    assert.equal(await page.locator("#firstName").inputValue(), "Awa")
    await page.getByRole("button", { name: "Revenir à l'étape 1 : Formation", exact: true }).click()
    await page.locator("#region").waitFor()
    await page.locator("#region").selectOption("Diamniadio")
    assert.deepEqual(await optionCodes(page), ["dev-data"])
    await page.locator("#region").selectOption("Dakar")
    assert.equal((await optionCodes(page)).length, 7, "Fibre is explicitly restricted to Tambacounda")
    await page.locator("#region").selectOption("Thiès")
    await page.locator("#formation").selectOption("dev-data")
    const size = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth }))
    assert.ok(size.body <= size.viewport + 1, `No horizontal overflow at ${width}px`)
    assert.equal(await page.locator("h1").count(), 1)
    assert.equal(await page.locator("form section h2").count(), 1)
    assert.equal(await page.locator('nav[aria-label="Étapes de la candidature"] [aria-current="step"]').count(), 1)
    assert.equal(scenario.posts.length, 0, "Moving between steps never submits a candidature")
    assert.deepEqual(scenario.errors, [])
    if (output) {
      await page.evaluate(() => scrollTo(0, 0))
      await page.screenshot({ path: `${output}/candidature-${width}.png`, fullPage: true, animations: "disabled" })
    }
    console.log(`PASS candidature: one step at a time, region filtering, preserved identity on return and responsive layout ${width}px`)
    await context.close()
  }

  {
    const { context, page, scenario } = await fixture()
    await page.getByRole("button", { name: "Suivant", exact: true }).click()
    await page.locator("#region-error").waitFor()
    await page.waitForFunction(() => document.activeElement?.name === "region")
    assert.equal(await page.locator(":focus").getAttribute("name"), "region")
    assert.ok(await page.locator("#region-error").isVisible())
    assert.equal(scenario.posts.length, 0)
    assert.equal(await page.locator("#email-error").count(), 0, "Step one does not validate future fields")
    await fillValidForm(page)
    assert.equal(scenario.posts.length, 0)
    scenario.offline = true
    await page.getByRole("button", { name: "Envoyer ma candidature", exact: true }).click()
    await page.getByRole("alert").filter({ hasText: /soumission|serveur|connexion|envoi|fetch/i }).waitFor()
    await page.getByText("moussa.recette@example.org", { exact: true }).waitFor()
    await navigate(page, "Précédent")
    assert.equal(await page.locator('input[name="computer_skills"][value="no"]').isChecked(), true)
    await navigate(page, "Précédent")
    assert.equal(await page.locator("#email").inputValue(), "moussa.recette@example.org")
    await navigate(page, "Précédent")
    assert.equal(await page.locator("#firstName").inputValue(), "Moussa")
    await navigate(page, "Précédent")
    assert.equal(await page.locator("#formation").inputValue(), "dev-data")
    await navigate(page)
    await navigate(page)
    await navigate(page)
    await navigate(page)
    assert.equal(await page.locator("#acceptTerms").isChecked(), true)
    scenario.offline = false
    await page.getByRole("button", { name: "Envoyer ma candidature", exact: true }).click()
    await page.getByRole("heading", { name: "Candidature enregistrée !", exact: true }).waitFor()
    await page.getByText(`Formation : ${dataTitle}`, { exact: true }).waitFor()
    assert.equal(scenario.posts.length, 2)
    assert.deepEqual(scenario.posts[0], scenario.posts[1])
    assert.equal(scenario.posts[1].region_of_residence, "Thiès")
    assert.equal(scenario.posts[1].computer_skills, false)
    assert.equal(scenario.posts[1].is_working, false)
    assert.ok(!("training_center" in scenario.posts[1]))
    assert.deepEqual(scenario.errors, [])
    console.log("PASS candidature: accessible validation, preserved values after network failure and successful retry")
    await context.close()
  }

  {
    const { context, page, scenario } = await fixture()
    await fillValidForm(page)
    scenario.removeData = true
    await page.getByRole("button", { name: "Envoyer ma candidature", exact: true }).click()
    await page.locator("#formation-error").waitFor()
    assert.equal(scenario.posts.length, 0, "Revalidate catalogue before submission, never submit a removed offer")
    assert.equal(await page.locator(":focus").getAttribute("name"), "region", "Focus a usable field when no formation is left")
    await page.locator("#region").selectOption("Dakar")
    await page.locator("#formation").selectOption("dev-web-mobile")
    await navigate(page)
    assert.equal(await page.locator("#firstName").inputValue(), "Moussa")
    assert.deepEqual(scenario.errors, [])
    console.log("PASS candidature: disappearing offer stops submission without clearing personal data")
    await context.close()
  }

  {
    const { context, page, scenario } = await fixture()
    scenario.catalogFailure = true
    await page.reload({ waitUntil: "networkidle" })
    const retry = page.getByRole("button", { name: "Réessayer", exact: true })
    await retry.waitFor()
    assert.equal(await retry.isEnabled(), true, "Catalogue retry must remain outside the disabled form fields")
    scenario.catalogFailure = false
    await retry.click()
    await page.locator("#region").selectOption("Thiès")
    assert.deepEqual(await optionCodes(page), ["dev-data"])
    assert.deepEqual(scenario.errors, [])
    console.log("PASS candidature: recover catalogue access without a page refresh")
    await context.close()
  }

  {
    const { context, page, scenario } = await fixture()
    await page.locator("#region").selectOption("Thiès")
    await page.locator("#formation").selectOption("dev-data")
    await navigate(page)
    await fillIdentity(page)
    await navigate(page)
    assert.equal(await page.locator("#email:focus").count(), 1)
    scenario.holdEmail = "old.recette@example.org"
    const checksBeforeTyping = scenario.checks.filter((check) => check.field === "email").length
    await page.locator("#email").pressSequentially(scenario.holdEmail)
    assert.equal(scenario.checks.filter((check) => check.field === "email").length, checksBeforeTyping, "Typing does not send a request on every keystroke")
    await page.locator("#phone").focus()
    const deadline = Date.now() + 5000
    while (!scenario.releaseEmail && Date.now() < deadline) await page.waitForTimeout(50)
    assert.ok(scenario.releaseEmail, "The email check must start on blur")
    await page.locator("#email").fill("new.recette@example.org")
    await page.locator("#phone").focus()
    scenario.releaseEmail()
    await page.waitForTimeout(400)
    assert.equal(await page.locator("#email-error").count(), 0, "An obsolete uniqueness result must not mark the new email as a duplicate")
    assert.equal(await page.locator("#email").inputValue(), "new.recette@example.org")
    assert.deepEqual(scenario.errors, [])
    console.log("PASS candidature: uniqueness on blur only and obsolete requests ignored")
    await context.close()
  }

  {
    const { context, page, scenario } = await fixture(390)
    await page.locator("#region").selectOption("Dakar")
    await page.locator("#formation").selectOption("hackeuses")
    await navigate(page)
    await page.getByRole("button", { name: "Suivant", exact: true }).click()
    await page.locator("#firstName-error").waitFor()
    assert.equal(await page.locator(":focus").getAttribute("name"), "firstName")
    await fillIdentity(page)
    await page.locator("#firstName").press("Enter")
    await page.locator("#formation-error").waitFor()
    assert.equal(await page.locator(":focus").getAttribute("name"), "formation")
    await page.locator("#formation").selectOption("dev-data")
    await navigate(page)
    assert.equal(await page.locator("#firstName").inputValue(), "Moussa")
    await page.locator("#firstName").press("Enter")
    await page.locator("#email").waitFor()
    await fillContact(page)
    await page.locator("#phone").press("Enter")
    await page.locator("#education").waitFor()
    await fillAvailability(page)
    await navigate(page)
    await page.getByRole("button", { name: "Envoyer ma candidature", exact: true }).click()
    await page.locator("#acceptTerms-error").waitFor()
    assert.equal(scenario.posts.length, 0, "No write without consent on the final step")
    const size = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth }))
    assert.ok(size.body <= size.viewport + 1)
    assert.deepEqual(scenario.errors, [])
    if (output) await page.screenshot({ path: `${output}/candidature-final-390.png`, fullPage: true, animations: "disabled" })
    console.log("PASS candidature: per-step validation, keyboard progression, invalidated earlier choice and final consent")
    await context.close()
  }

  {
    const { context, page, scenario } = await fixture()
    await page.locator("#region").selectOption("Thiès")
    await page.locator("#formation").selectOption("dev-data")
    await navigate(page)
    await fillIdentity(page)
    scenario.duplicateIdentity = true
    await page.locator("#nationality").focus()
    await page.locator("#idNumber-error").waitFor()
    await page.getByRole("button", { name: "Suivant", exact: true }).click()
    await page.waitForFunction(() => document.activeElement?.name === "idNumber")
    assert.equal(await page.locator("#email").count(), 0)
    assert.equal(scenario.posts.length, 0)
    assert.deepEqual(scenario.errors, [])
    console.log("PASS candidature: duplicate identity stays on the identity screen and focuses the document number")
    await context.close()
  }
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
