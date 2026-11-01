import assert from "node:assert/strict"
import test from "node:test"
import { privateDocumentUrl, downloadPrivateDocument } from "../lib/private-documents.js"

test("document URL normalizes Windows paths and encodes individual segments", () => {
  assert.equal(privateDocumentUrl("https://api.example.test/", "students\\cv\\mon cv.pdf"), "https://api.example.test/api/auth/documents/students/cv/mon%20cv.pdf")
})

test("document paths reject traversal and absolute paths", () => {
  for (const path of ["../private.pdf", "/private.pdf", "students/./cv.pdf", "students//cv.pdf", ""]) {
    assert.throws(() => privateDocumentUrl("https://api.example.test", path))
  }
})

test("missing session prevents every network call", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch")
  await assert.rejects(downloadPrivateDocument({ apiUrl: "https://api.example.test", path: "students/cv/a.pdf" }))
  assert.equal(fetch.mock.callCount(), 0)
})

test("download uses bearer authentication, refuses redirects and exposes no token in URL", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => ({ ok: false }))
  await assert.rejects(downloadPrivateDocument({ apiUrl: "https://api.example.test", path: "students/cv/a.pdf", token: "synthetic-token" }))
  const [url, options] = fetch.mock.calls[0].arguments
  assert.equal(url.includes("synthetic-token"), false)
  assert.equal(options.headers.Authorization, "Bearer synthetic-token")
  assert.equal(options.cache, "no-store")
  assert.equal(options.redirect, "error")
})
