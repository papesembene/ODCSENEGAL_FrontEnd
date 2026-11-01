import assert from "node:assert/strict"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
let server
let browser
try {
  server = await startBrowserServer(baseUrl)
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })
  const context = await browser.newContext()
  const page = await context.newPage()
  const errors = []
  const logins = []
  let popups = 0
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("popup", () => popups++)
  await page.route("**/*", (route) => {
    if (new URL(route.request().url()).origin === new URL(baseUrl).origin) return route.continue()
    return route.abort()
  })
  await page.route("**/api/**", async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "content-type,authorization" }
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers })
    const user = { id: "synthetic-user", email: "fixture@example.com", profile_type: "student", is_admin: false }
    let body = { success: true, data: [] }
    if (path === "/api/auth/login") {
      logins.push(request.postDataJSON())
      body = { token: "synthetic-browser-token", user }
    } else if (path === "/api/auth/get-profile") body = { success: true, user }
    else if (path === "/api/auth/verify-token") body = { valid: true, user }
    return route.fulfill({ headers, contentType: "application/json", body: JSON.stringify(body) })
  })
  for (const path of ["/login", "/register"]) {
    await page.goto(baseUrl + path, { waitUntil: "domcontentloaded" })
    await page.locator("#email").waitFor()
    assert.equal(await page.getByRole("button", { name: /Google|LinkedIn/i }).count(), 0)
    assert.equal(await page.locator("#email").isVisible(), true)
    assert.equal(await page.locator("#password").isVisible(), true)
  }
  await page.goto(baseUrl + "/login", { waitUntil: "domcontentloaded" })
  await page.locator("#email").fill("fixture@example.com")
  await page.locator("#password").fill("Fixture-password-123")
  await page.locator("#terms").check()
  await page.getByRole("button", { name: "Se connecter", exact: true }).click()
  await page.waitForFunction(() => localStorage.getItem("auth_token") === "synthetic-browser-token")
  assert.deepEqual(logins, [{ email: "fixture@example.com", password: "Fixture-password-123" }])
  await page.waitForURL((url) => url.pathname !== "/login")
  await page.evaluate(() => localStorage.clear())
  for (const path of ["/oauth-callback?token=unused-query-token#token=unused-fragment-token", "/oauth-email-request"]) {
    await page.goto(baseUrl + path, { waitUntil: "domcontentloaded" })
    await page.locator("#email").waitFor()
    assert.equal(new URL(page.url()).pathname, "/login")
    assert.equal(await page.evaluate(() => localStorage.getItem("auth_token")), null)
  }
  assert.equal(popups, 0)
  assert.deepEqual(errors, [])
  console.log("PASS: email login preserved; external login buttons removed; old callbacks cannot install a token")
  await context.close()
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
