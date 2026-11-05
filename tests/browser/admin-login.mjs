// Fake credentials and intercepted API calls only; no real login is performed.
import assert from "node:assert/strict"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
let browser
let server

try {
  server = await startBrowserServer(baseUrl)
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" })
    const page = await context.newPage()
    const errors = []
    const logins = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.route("**/api/**", async (route) => {
      const request = route.request()
      const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "content-type, authorization" }
      if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers })
      if (new URL(request.url()).pathname.endsWith("/admin/login")) {
        logins.push(request.postDataJSON())
        return route.fulfill({ status: 401, headers, json: { success: false, error: "Email ou mot de passe incorrect" } })
      }
      return route.fulfill({ headers, json: { success: true, data: [] } })
    })
    await page.goto(`${baseUrl}/astrodmin`, { waitUntil: "networkidle" })
    const password = page.getByLabel("Mot de passe", { exact: true })
    const value = "Fixture-password-2026!"
    await page.getByLabel("Email", { exact: true }).fill("fixture@example.org")
    await password.fill(value)
    assert.equal(await password.getAttribute("type"), "password")
    const reveal = page.getByRole("button", { name: "Afficher le mot de passe", exact: true })
    assert.equal(await reveal.getAttribute("aria-pressed"), "false")
    await reveal.click()
    assert.equal(await password.getAttribute("type"), "text")
    assert.equal(await password.inputValue(), value)
    const hide = page.getByRole("button", { name: "Masquer le mot de passe", exact: true })
    assert.equal(await hide.getAttribute("aria-pressed"), "true")
    await hide.press("Enter")
    assert.equal(await password.getAttribute("type"), "password")
    assert.equal(await password.inputValue(), value)
    assert.equal(logins.length, 0, "Visibility controls must never submit the login form")
    const sizes = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth }))
    assert.ok(sizes.body <= sizes.viewport + 1, `No horizontal overflow at ${width}px`)
    await page.getByRole("button", { name: "Se connecter", exact: true }).click()
    await page.getByText("Email ou mot de passe incorrect", { exact: true }).waitFor()
    assert.deepEqual(logins, [{ email: "fixture@example.org", password: value }])
    assert.deepEqual(errors, [])
    console.log(`PASS admin login: responsive ${width}px, masked by default, click/keyboard toggle, unchanged credentials`)
    await context.close()
  }
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
