import assert from "node:assert/strict"
import test from "node:test"
import defaults from "../data/training-defaults.js"
import { candidatureAgeError, candidatureErrors, changeCandidature, initialCandidature } from "../app/odc/candidatures/form-model.js"
import { CANDIDATURE_STEPS, candidatureStepErrors, firstInvalidStep } from "../app/odc/candidatures/form-steps.js"
import { validateBirthDate } from "../app/odc/candidatures/validation.js"
import { DEFAULT_TRAINING_SITES, RESIDENCE_LOCATIONS } from "../lib/training-eligibility.js"

const today = new Date("2026-11-18T12:00:00Z")
const dev = { ...defaults.find((row) => row.code === "dev-web-mobile"), level: "Agé(e) de 18 à 30 ans" }
const startup = { ...dev, code: "startup-school", title: "Startup School", level: "Agé(e) de 25 à 40 ans" }
const valid = { ...initialCandidature(), firstName: "Moussa", lastName: "Ba", email: "moussa@example.org",
  phone: "771234567", birthDate: "2000-01-01", birthPlace: "Dakar", gender: "male", idType: "cni",
  idNumber: "1234567890123", nationality: "Sénégalaise", region: "Diourbel", trainingSite: "dakar", formation: dev.code,
  education: "terminale_sans_bac", computer_skills: true, isWorking: false, isAvailable: true, acceptTerms: true }
const errors = (values, rows = [dev, startup]) => candidatureErrors(values, rows, {}, RESIDENCE_LOCATIONS, DEFAULT_TRAINING_SITES, today)

test("signup permits inclusive age boundaries and attaches a named formation error to birthDate outside them", () => {
  for (const birthDate of ["2008-11-18", "1996-11-18", "1995-11-19"]) {
    assert.equal(errors({ ...valid, birthDate }).birthDate, undefined, birthDate)
  }
  for (const birthDate of ["2008-11-19", "1995-11-18"]) {
    const result = errors({ ...valid, birthDate })
    assert.ok(result.birthDate.includes(dev.title))
    assert.match(result.birthDate, /entre 18 et 30 ans inclus/)
    assert.equal(firstInvalidStep(result), CANDIDATURE_STEPS.findIndex((step) => step.id === "identite-personnelle"))
    assert.ok(candidatureStepErrors(result, 2, true).birthDate, "Identity cannot advance past an age error")
  }
})

test("signup honors formation-specific ranges and never invents a rule for an unspecified level", () => {
  assert.equal(errors({ ...valid, formation: startup.code, birthDate: "1986-11-18" }).birthDate, undefined)
  assert.match(errors({ ...valid, formation: startup.code, birthDate: "1985-11-18" }).birthDate, /entre 25 et 40 ans inclus/)
  assert.equal(errors({ ...valid, birthDate: "1991-11-18" }, [{ ...dev, level: "Bac+2, BTS" }]).birthDate, undefined)
})

test("a catalogue refresh revalidates age without changing the candidate's entries", () => {
  const values = { ...valid, birthDate: "1991-11-18" }
  const before = structuredClone(values)
  assert.equal(errors(values, [{ ...dev, level: "Agé de 18 à 40 ans" }]).birthDate, undefined)
  assert.match(errors(values, [dev]).birthDate, /entre 18 et 30 ans inclus/)
  assert.deepEqual(values, before)
})

test("formation/site/gender changes can clear an obsolete age criterion while preserving birth date and other entries", () => {
  const values = { ...valid, birthDate: "1991-11-18" }
  assert.ok(candidatureAgeError(values, [dev, startup], today))
  const changedFormation = changeCandidature(values, "formation", startup.code, [dev, startup])
  assert.equal(candidatureAgeError(changedFormation, [dev, startup], today), null)
  const changedSite = changeCandidature(values, "trainingSite", "thies", [dev])
  assert.equal(changedSite.formation, "")
  assert.equal(candidatureAgeError(changedSite, [dev], today), null)
  const femaleTraining = { ...dev, femaleOnly: true }
  const changedGender = changeCandidature({ ...values, gender: "female" }, "gender", "male", [femaleTraining])
  assert.equal(changedGender.formation, "")
  assert.equal(candidatureAgeError(changedGender, [femaleTraining], today), null)
  for (const changed of [changedFormation, changedSite, changedGender]) {
    assert.equal(changed.birthDate, values.birthDate)
    assert.equal(changed.firstName, values.firstName)
    assert.equal(changed.email, values.email)
  }
})

test("basic future-date validation uses the same UTC calendar day as age eligibility", () => {
  const utcNextDay = new Date("2026-11-17T23:30:00-02:00")
  assert.equal(validateBirthDate("2026-11-18", utcNextDay), null)
  assert.match(validateBirthDate("2026-11-19", utcNextDay), /futur/)
})
