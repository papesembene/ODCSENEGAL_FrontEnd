// Browser regression tests with mocked API: no real candidate or database is used.
import assert from "node:assert/strict"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
let browser
let server

async function candidatePage({ offlineSubmission = false } = {}) {
  const context = await browser.newContext({ timezoneId: "Africa/Dakar" })
  const page = await context.newPage()
  const errors = []
  const drafts = []
  const submissions = []
  const contentRequests = []
  const violations = []
  let apiOrigin
  let offline = offlineSubmission
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error" && /Cannot update a component|hydrated|NaN/.test(message.text())) errors.push(message.text())
  })
  await page.clock.install()
  const start = new Date(Date.now() - 1000)
  const testData = {
    id: "000000000000000000000123", title: "Browser regression", referentiel: "Dev Web",
    scheduledDate: start.toISOString().slice(0, 10), scheduledTime: start.toISOString().slice(11, 19),
    duration: 1, totalQuestions: 1, passingScore: 70, status: "active",
    questions: [{ question: "Expliquez votre reponse", type: "texte_libre", score: 5 }],
  }
  await page.route("**/api/**", async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin,
      "Access-Control-Allow-Headers": "content-type, authorization", "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS" }
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers })
    let status = 200
    let data = { success: true, data: [] }
    if (path.endsWith("/public")) {
      apiOrigin = new URL(request.url()).origin
      const { questions, ...metadata } = testData
      data = { success: true, data: metadata }
    }
    if (path.endsWith("/content")) {
      assert.equal(request.method(), "POST")
      contentRequests.push(request.postDataJSON())
      data = { success: true, data: testData }
    }
    if (path.endsWith("/verify-access")) data = { success: true, authorized: true,
      candidate: { id: "candidate", name: "Browser Test", email: "browser@example.org", phone: "771234567" } }
    if (path.endsWith("/log-violation")) {
      assert.equal(new URL(request.url()).origin, apiOrigin, "Anti-cheat must use the configured API, not a forced port")
      const payload = request.postDataJSON()
      assert.equal(payload.candidateEmail, "browser@example.org")
      assert.equal(payload.candidatePhone, "771234567")
      violations.push(payload)
    }
    if (path.endsWith("/session-draft")) {
      if (request.method() === "PUT") drafts.push(request.postDataJSON())
      data = { success: true, data: null }
    }
    if (path.endsWith("/results") && request.method() === "POST") {
      if (offline) return route.abort("failed")
      submissions.push(request.postDataJSON())
      data = { success: true, data: { id: "result" } }
      status = 201
    }
    // Losing a secondary status update must not invalidate a confirmed result.
    if (path.endsWith("/update-status")) { status = 503; data = { success: false, error: "Temporary" } }
    return route.fulfill({ status, headers, contentType: "application/json", body: JSON.stringify(data) })
  })
  await page.goto(`${baseUrl}/test/${testData.id}`, { waitUntil: "domcontentloaded", timeout: 120000 })
  await page.locator("#name").fill("Browser Test")
  await page.locator("#email").fill("browser@example.org")
  await page.locator("#phone").fill("771234567")
  await page.getByRole("button", { name: "Continuer", exact: true }).click()
  await page.getByRole("button", { name: "Commencer le test", exact: true }).click()
  await page.getByPlaceholder("Saisissez votre réponse ici...").waitFor()
  assert.ok(contentRequests.some((payload) => payload.email === "browser@example.org" && payload.phone.endsWith("771234567")))
  return { page, context, drafts, submissions, violations, errors, testId: testData.id, reconnect: () => { offline = false } }
}

async function waitFor(check, message, timeout = 15000) {
  const end = Date.now() + timeout
  while (!check() && Date.now() < end) await new Promise((resolve) => setTimeout(resolve, 100))
  assert.ok(check(), message)
}

try {
  server = await startBrowserServer(baseUrl)
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}),
  })
  const first = await candidatePage()
  await first.page.evaluate(() => document.dispatchEvent(new Event("copy", { bubbles: true, cancelable: true })))
  await waitFor(() => first.violations.some((event) => event.type === "copy"), "Authenticated anti-cheat event must reach the configured API")
  await first.page.getByPlaceholder("Saisissez votre réponse ici...").pressSequentially("Reponse sauvegardee", { delay: 100 })
  await waitFor(() => first.drafts.some((draft) => draft.answers["0"] === "Reponse sauvegardee"), "Autosave must run while timer ticks")
  await first.page.clock.fastForward(61000)
  await first.page.getByText("Test soumis avec succès !", { exact: true }).waitFor()
  assert.equal(first.submissions.length, 1, "Expiry submits exactly once")
  assert.equal(first.submissions[0].answers["0"], "Reponse sauvegardee")
  assert.deepEqual(first.errors, [])
  await first.context.close()
  console.log("PASS: autosave, expiration unique, resultat confirme malgre statut secondaire indisponible")

  const second = await candidatePage({ offlineSubmission: true })
  await second.page.getByPlaceholder("Saisissez votre réponse ici...").fill("Reponse conservee hors ligne")
  await second.page.getByRole("button", { name: "Soumettre le test", exact: true }).click()
  await second.page.getByRole("button", { name: "Confirmer la soumission", exact: true }).click()
  await second.page.getByText("La soumission n'a pas pu être confirmée. Vos réponses restent sur cette page, veuillez réessayer.", { exact: true }).waitFor()
  const stored = await second.page.evaluate((id) => JSON.parse(localStorage.getItem(`test::${id}::answers`)), second.testId)
  assert.equal(stored["0"], "Reponse conservee hors ligne")
  second.reconnect()
  await second.page.getByRole("button", { name: "Confirmer la soumission", exact: true }).click()
  await second.page.getByText("Test soumis avec succès !", { exact: true }).waitFor()
  assert.equal(second.submissions.length, 1)
  assert.equal(second.submissions[0].answers["0"], "Reponse conservee hors ligne")
  assert.deepEqual(second.errors, [])
  await second.context.close()
  console.log("PASS: coupure a la soumission, conservation locale et nouvelle tentative")
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
