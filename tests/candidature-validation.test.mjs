import assert from "node:assert/strict"
import test from "node:test"
import { validateBirthDate } from "../app/odc/candidatures/validation.js"

const today = new Date(2026, 5, 25)

test("birth date validation rejects missing, impossible, and future dates", () => {
  assert.match(validateBirthDate("", today), /requise/)
  assert.match(validateBirthDate("2001-02-29", today), /valide/)
  assert.match(validateBirthDate("2026-06-26", today), /futur/)
})

test("birth date validation accepts real dates on or before today", () => {
  assert.equal(validateBirthDate("2000-02-29", today), null)
  assert.equal(validateBirthDate("2026-06-25", today), null)
})
