// Public pages and jury workspace use an entirely simulated API and identity.
import assert from "node:assert/strict"
import { mkdir } from "node:fs/promises"
import { chromium } from "playwright"
import { startBrowserServer } from "./server.mjs"

const baseUrl = process.env.ODC_BROWSER_BASE_URL || "http://127.0.0.1:3101"
const output = process.env.ODC_SCREENSHOT_DIR
const admin = { id: "jury", email: "jury@example.org", admin_type: "competences",
  first_name: "Jury", last_name: "Test", profile_data: { admin_scope: "interview_member" } }
const campaign = { id: "campaign", name: "Campagne de test", formation: "Dev Web", filter_questions: [],
  scorecard_config: { sections: {
    filter: { title: "Filtre", criteria: [{ key: "decision", label: "Verdict", type: "text" }] },
    validator: { title: "Validation", criteria: [{ key: "interviewer", label: "Validateur", type: "text" }] },
  } } }
const now = new Date()
const slot = { id: "slot", campaign_id: campaign.id, label: "Creneau de test",
  start_at: new Date(now.getTime() - 3600000).toISOString(),
  end_at: new Date(now.getTime() + 3600000).toISOString(),
  assigned_validator_ids: [admin.id], access: { roles: ["validator"], editable_roles: ["validator"] } }
const candidate = { id: "evaluation", slot_id: slot.id, campaign_id: campaign.id, test_score: 80,
  candidate_snapshot: { first_name: "Moussa", last_name: "Test", email: "candidate@example.org" },
  filter_review: { decision: "echec" }, validator_review: {} }
const routes = [
  ["home", "/", "h1"],
  ["login", "/astrodmin", "#email"],
  ["odc", "/odc/candidatures", "form"],
  ["startup", "/startups/candidature", "form"],
  ["orangefab", "/startups/candidature/orange-fab", "form"],
  ["jury", "/astrodmin/mes-entretiens", "table"],
]

let browser
let server
try {
  server = await startBrowserServer(baseUrl)
  if (output) await mkdir(output, { recursive: true })
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) })
  for (const width of [390, 1440]) {
    for (const [name, path, selector] of routes) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" })
      if (name === "jury") await context.addInitScript((user) => {
        localStorage.setItem("admin_token", "mock-browser-token")
        localStorage.setItem("admin_type", user.admin_type)
        localStorage.setItem("admin_email", user.email)
        localStorage.setItem("admin_user", JSON.stringify(user))
      }, admin)
      const page = await context.newPage()
      const errors = []
      page.on("pageerror", (error) => errors.push(error.message))
      await page.route("**/api/**", async (route) => {
        const pathname = new URL(route.request().url()).pathname
        const headers = { "Access-Control-Allow-Origin": new URL(baseUrl).origin,
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "content-type, authorization" }
        if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers })
        let data = { success: true, data: [], events: [] }
        if (pathname.endsWith("/capabilities")) data.data = { can_manage_questions: true }
        if (pathname.endsWith("/bootstrap")) data.data = {
          campaigns: [campaign], slots: [slot], admins: [admin], server_now: now.toISOString(), slot_occupancy: {},
        }
        if (pathname.endsWith("/evaluations")) data = { success: true, data: [candidate],
          pagination: { page: 1, page_size: 25, total: 1, total_pages: 1 } }
        if (pathname.endsWith("/candidature/status")) data.data = {
          isOpen: true, lifecycleStatus: "open", title: "Campagne de test", formations: [],
        }
        return route.fulfill({ headers, contentType: "application/json", body: JSON.stringify(data) })
      })
      await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle", timeout: 90000 })
      await page.locator(selector).first().waitFor()
      assert.deepEqual(errors, [], `${name} must render without runtime errors`)
      const state = await page.evaluate(() => ({
        width: innerWidth, body: document.body.scrollWidth,
        buttons: [...document.querySelectorAll("button")].filter((button) => button.getBoundingClientRect().height > 0).length,
      }))
      assert.ok(state.buttons > 0, `${name}: controls must be visible`)
      assert.ok(state.body <= state.width + 1, `${name}: no page-wide horizontal overflow at ${width}px`)
      if (name === "jury") {
        await page.getByRole("button", { name: "Avis coach", exact: true }).click()
        await page.getByRole("dialog").waitFor()
      }
      if (output) await page.screenshot({ path: `${output}/${name}-${width}.png`, animations: "disabled" })
      console.log(`PASS: ${name}, ${width}px${name === "jury" ? ", table et dialogue coach" : ""}`)
      await context.close()
    }
  }
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}
