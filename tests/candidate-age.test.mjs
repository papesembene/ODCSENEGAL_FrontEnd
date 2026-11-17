import assert from "node:assert/strict"
import test from "node:test"
import { calculateAge } from "../app/astrodmin/competences/dashboard-utils.js"

const today = new Date("2026-11-17T12:00:00Z")

test("age eligibility changes on the thirtieth birthday, not at the start of the year", () => {
  assert.equal(calculateAge("1996-11-18", today), 29)
  assert.equal(calculateAge("1996-11-17", today), 30)
  assert.equal(calculateAge("1996-11-16", today), 30)
  assert.equal(calculateAge("1996-12-31", today), 29)
})

test("missing, malformed, impossible and future birth dates remain unknown", () => {
  for (const value of [null, undefined, "", 1996, "not-a-date", "17/11/1996", "1996-2-03", "0000-01-01",
    "2001-02-29", "2000-04-31", "1996-13-01", "1996-01-00", "2026-11-18", "2027-01-01"]) {
    assert.equal(calculateAge(value, today), null, `Birth date ${value} must require verification`)
  }
  assert.equal(calculateAge("2000-01-01", new Date("invalid")), null)
})

test("the age calculation uses UTC calendar days and accepts valid leap days", () => {
  const utcNextDay = new Date("2026-11-17T23:30:00-02:00")
  assert.equal(calculateAge("1996-11-18", utcNextDay), 30)
  assert.equal(calculateAge("2000-02-29", today), 26)
  assert.equal(calculateAge("1996-02-29", new Date("2026-02-28T23:59:59Z")), 29)
  assert.equal(calculateAge("1996-02-29", new Date("2026-03-01T00:00:00Z")), 30)
})

test("the age criterion adds no minimum age requirement", () => {
  assert.equal(calculateAge("2026-11-17", today), 0)
  assert.equal(calculateAge("2025-11-17", today), 1)
})
