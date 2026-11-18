import assert from "node:assert/strict"
import test from "node:test"
import { classifyCandidateAge, formatTrainingAgeRule, parseTrainingAgeRule } from "../app/astrodmin/competences/training-age-eligibility.js"

const today = new Date("2026-11-18T12:00:00Z")
const level18to30 = "Niveau requis / Agé(e) de 18 à 30 ans"
const startupLevel = "Agé(e) de 25 à 40 ans / Entrepreneur"
const techLevel = "Troisième (avec ou sans BFEM) / Agé(e) de 18 à 40 ans"
const hackeusesLevel = "Pas de niveau requis / Agée de + de 18 ans"
const cyberLevel = "Bac+2, BTS"
const result = (dob, level, day = today) => classifyCandidateAge(dob, level, day)

test("age rules come from explicit catalogue age text, preserving range exceptions", () => {
  assert.deepEqual(parseTrainingAgeRule(level18to30), { kind: "range", minAge: 18, maxAge: 30 })
  assert.deepEqual(parseTrainingAgeRule(startupLevel), { kind: "range", minAge: 25, maxAge: 40 })
  assert.deepEqual(parseTrainingAgeRule(techLevel), { kind: "range", minAge: 18, maxAge: 40 })
  assert.deepEqual(parseTrainingAgeRule(hackeusesLevel), { kind: "over", minAge: 18, maxAge: null })
  for (const level of ["plus de 18 ans", "+ de 18 ans", "Âgée de plus de 18 ans"]) {
    assert.deepEqual(parseTrainingAgeRule(level), { kind: "over", minAge: 18, maxAge: null })
  }
  assert.equal(formatTrainingAgeRule(parseTrainingAgeRule(startupLevel)), "De 25 à 40 ans inclus")
  assert.equal(formatTrainingAgeRule(parseTrainingAgeRule(hackeusesLevel)), "Plus de 18 ans")
})

test("education numbers, absent or ambiguous age rules never become an invented age limit", () => {
  for (const level of [null, "", cyberLevel, "Bac+2 / BTS", "À partir du baccalauréat", "18 à 30 ans",
    "Agé de 18 à 30 ans ou âgé de 25 à 40 ans", "Agé de 40 à 25 ans", "Agé de 18 à 121 ans",
    "Pas plus de 18 ans", "Au plus de 18 ans", "Non âgé de plus de 18 ans",
    "Âge : 18 à 30 ans", "Âgé 18 à 30 ans", "Âgé de 18 et 30 ans", "Âgé de 18-30 ans",
    "Âgé de 18 à 30 ans / âge de 40 ans", "Âgé de 18 à 30 ans / âge à confirmer"]) {
    assert.equal(parseTrainingAgeRule(level), null, `No reliable age rule in ${level}`)
  }
  const candidate = result("1990-11-18", cyberLevel)
  assert.equal(candidate.eligibility, "unknown")
  assert.equal(candidate.reason, "missing_age_rule")
  assert.equal(candidate.age, 36, "A known age must remain visible even when the formation age rule is missing")
})

test("18 through 30 includes both exact birthdays and excludes ages below 18 or at least 31", () => {
  for (const [dob, expected] of [
    ["2008-11-18", "eligible"], ["2008-11-19", "ineligible"],
    ["1996-11-18", "eligible"], ["1995-11-19", "eligible"], ["1995-11-18", "ineligible"],
  ]) assert.equal(result(dob, level18to30).eligibility, expected, dob)
})

test("Startup School admits completed ages 25 through 40, Tech Broadband ages 18 through 40", () => {
  for (const [dob, expected] of [
    ["2001-11-18", "eligible"], ["2001-11-19", "ineligible"],
    ["1986-11-18", "eligible"], ["1985-11-19", "eligible"], ["1985-11-18", "ineligible"],
  ]) assert.equal(result(dob, startupLevel).eligibility, expected, dob)
  assert.equal(result("2008-11-18", techLevel).eligibility, "eligible")
  assert.equal(result("2008-11-19", techLevel).eligibility, "ineligible")
  assert.equal(result("1986-11-18", techLevel).eligibility, "eligible")
  assert.equal(result("1985-11-18", techLevel).eligibility, "ineligible")
  const same35YearOld = "1991-11-18"
  assert.equal(result(same35YearOld, startupLevel).eligibility, "eligible")
  assert.equal(result(same35YearOld, techLevel).eligibility, "eligible")
  assert.equal(result(same35YearOld, level18to30).eligibility, "ineligible")
})

test("strictly over 18 excludes the birthday itself, admits the following day and sets no upper limit", () => {
  assert.equal(result("2008-11-18", hackeusesLevel).eligibility, "ineligible")
  const followingDay = result("2008-11-17", hackeusesLevel)
  assert.equal(followingDay.age, 18)
  assert.equal(followingDay.eligibility, "eligible", "Do not make candidates wait until their nineteenth birthday")
  assert.equal(result("1950-01-01", hackeusesLevel).eligibility, "eligible")
})

test("strict birthdays handle leap days consistently with calendar age", () => {
  assert.equal(result("2010-02-28", hackeusesLevel, new Date("2028-02-29T12:00:00Z")).eligibility, "eligible")
  assert.equal(result("2008-02-29", hackeusesLevel, new Date("2026-03-01T12:00:00Z")).eligibility, "ineligible")
  assert.equal(result("2008-02-29", hackeusesLevel, new Date("2026-03-02T00:00:00Z")).eligibility, "eligible")
})

test("bad or future dates are reviewable regardless of the formation rule", () => {
  for (const dob of [null, "", "2001-02-29", "2027-01-01"]) {
    const candidate = result(dob, startupLevel)
    assert.equal(candidate.eligibility, "unknown")
    assert.equal(candidate.reason, "invalid_birth_date")
    assert.equal(candidate.age, null)
  }
})
