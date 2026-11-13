import assert from "node:assert/strict"
import test from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { fetchJsonWithTimeout, fetchWithTimeout } from "../app/utils/fetchWithTimeout.js"
import { useAdminApi } from "../app/hooks/useAdminApi.js"
import { getCandidatureStatus, submitOdcCandidature } from "../lib/public-api.js"

const unavailable = "Le service est temporairement indisponible. Veuillez réessayer."
const privateUrl = "https://backend-private.invalid/api/candidature"
const validationMessage = "Une candidature existe déjà pour cette personne."

function replaceGlobal(t, name, value) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name)
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor)
    else delete globalThis[name]
  })
}

function adminClient(t) {
  const values = new Map([["admin_token", "test-token"]])
  replaceGlobal(t, "localStorage", {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
  })
  replaceGlobal(t, "window", { location: { pathname: "/astrodmin/competences", href: "" } })
  let api
  function Client() {
    api = useAdminApi()
    return null
  }
  renderToStaticMarkup(createElement(Client))
  return { api, values }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } })
}

test("public requests hide transport details and do not retry candidature submission", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError(`Failed to fetch ${privateUrl}`)
  })
  await assert.rejects(submitOdcCandidature({ email: "test@example.invalid" }), { message: unavailable })
  assert.equal(fetch.mock.calls.length, 1)
  assert.equal(fetch.mock.calls[0].arguments[1].method, "POST")
})

for (const [label, response] of [
  ["server JSON", () => jsonResponse({ error: `Traceback: cannot connect to ${privateUrl}` }, 500)],
  ["proxy HTML", () => new Response(`<html>502 ${privateUrl}</html>`, { status: 502 })],
  ["invalid server JSON", () => new Response("{private traceback", { status: 500, headers: { "Content-Type": "application/json" } })],
  ["invalid success JSON", () => new Response("{private traceback", { headers: { "Content-Type": "application/json" } })],
  ["unexpected success HTML", () => new Response(`<html>${privateUrl}</html>`)],
]) {
  test(`public requests show a generic message for ${label}`, async (t) => {
    t.mock.method(globalThis, "fetch", async () => response())
    await assert.rejects(getCandidatureStatus(), { message: unavailable })
  })
}

test("public requests preserve validation messages and successful responses", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => jsonResponse({ error: validationMessage }, 409))
  await assert.rejects(submitOdcCandidature({}), { message: validationMessage })
  fetch.mock.mockImplementation(async () => jsonResponse({ data: { isOpen: true } }))
  assert.deepEqual(await getCandidatureStatus(), { isOpen: true })
})

test("public requests preserve intentional cancellation", async (t) => {
  const aborted = new DOMException("Cancelled", "AbortError")
  t.mock.method(globalThis, "fetch", async () => { throw aborted })
  await assert.rejects(getCandidatureStatus({}, { signal: AbortSignal.abort() }), (error) => error === aborted)
})

test("timeout helper hides network details while keeping its retry count", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError(`Failed to fetch ${privateUrl}`)
  })
  await assert.rejects(fetchWithTimeout(privateUrl, { retries: 1, retryDelay: 0 }), { message: unavailable })
  assert.equal(fetch.mock.calls.length, 2)
})

test("timeout helper shows a readable message when its request times out", async (t) => {
  t.mock.method(globalThis, "fetch", async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("Timeout", "AbortError")), { once: true })
  }))
  await assert.rejects(fetchWithTimeout(privateUrl, { timeout: 1, retries: 0 }), { message: unavailable })
})

for (const [label, response] of [
  ["server errors", () => jsonResponse({ error: `Traceback ${privateUrl}` }, 500)],
  ["proxy HTML", () => new Response(`<html>502 ${privateUrl}</html>`, { status: 502 })],
  ["malformed success JSON", () => new Response("{private traceback")],
  ["non-JSON client errors", () => new Response(`<html>403 ${privateUrl}</html>`, { status: 403 })],
]) {
  test(`timeout JSON helper hides ${label}`, async (t) => {
    t.mock.method(globalThis, "fetch", async () => response())
    await assert.rejects(fetchJsonWithTimeout(privateUrl, { retries: 0 }), { message: unavailable })
  })
}

test("timeout JSON helper preserves business validation", async (t) => {
  t.mock.method(globalThis, "fetch", async () => jsonResponse({ message: validationMessage }, 409))
  await assert.rejects(fetchJsonWithTimeout(privateUrl, { retries: 0 }), { message: validationMessage })
})

for (const [label, response] of [
  ["server errors", () => jsonResponse({ error: `Traceback ${privateUrl}` }, 500)],
  ["proxy HTML", () => new Response(`<html>502 ${privateUrl}</html>`, { status: 502 })],
  ["malformed success JSON", () => new Response("{private traceback")],
  ["non-JSON client errors", () => new Response(`<html>403 ${privateUrl}</html>`, { status: 403 })],
]) {
  test(`admin requests hide ${label}`, async (t) => {
    const { api } = adminClient(t)
    t.mock.method(globalThis, "fetch", async () => response())
    await assert.rejects(api.makeRequest("/api/admin/candidatures"), { message: unavailable })
  })
}

test("admin requests preserve validation and cancellation", async (t) => {
  const { api } = adminClient(t)
  const fetch = t.mock.method(globalThis, "fetch", async () => jsonResponse({ error: validationMessage }, 409))
  await assert.rejects(api.makeRequest("/api/admin/candidatures"), { message: validationMessage })
  const aborted = new DOMException("Cancelled", "AbortError")
  fetch.mock.mockImplementation(async () => { throw aborted })
  await assert.rejects(api.makeRequest("/api/admin/candidatures"), (error) => error === aborted)
})

test("admin network errors hide the backend address", async (t) => {
  const { api } = adminClient(t)
  t.mock.method(globalThis, "fetch", async () => { throw new TypeError(`Failed to fetch ${privateUrl}`) })
  await assert.rejects(api.makeRequest("/api/admin/candidatures"), {
    message: "Impossible de charger les données. Veuillez réessayer dans quelques instants.",
  })
})

test("admin successful JSON and document downloads remain available", async (t) => {
  const { api } = adminClient(t)
  const fetch = t.mock.method(globalThis, "fetch", async () => jsonResponse({ success: true, data: [] }))
  assert.deepEqual(await api.makeRequest("/api/admin/candidatures"), { success: true, data: [] })
  fetch.mock.mockImplementation(async () => new Response("csv-content", { headers: { "Content-Type": "text/csv" } }))
  const document = await api.makeRequest("/api/admin/candidatures/export", {}, "blob")
  assert.equal(await document.text(), "csv-content")
})

test("admin session expiry still clears the token and redirects with a readable message", async (t) => {
  const { api, values } = adminClient(t)
  t.mock.method(globalThis, "fetch", async () => new Response("", { status: 401 }))
  await assert.rejects(api.makeRequest("/api/admin/candidatures"), {
    message: "Votre session a expiré. Veuillez vous reconnecter.",
  })
  assert.equal(values.has("admin_token"), false)
  assert.equal(window.location.href, "/astrodmin")
})
