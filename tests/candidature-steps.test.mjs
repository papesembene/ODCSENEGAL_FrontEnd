import assert from "node:assert/strict"
import test from "node:test"
import { CANDIDATURE_STEPS, candidatureStepErrors, firstInvalidStep } from "../app/odc/candidatures/form-steps.js"
import { candidatureErrors, initialCandidature } from "../app/odc/candidatures/form-model.js"
import defaults from "../data/training-defaults.js"
import { DEFAULT_TRAINING_SITES as sites, RESIDENCE_LOCATIONS } from "../lib/training-eligibility.js"

test("The first step validates the choice, not personal data or final consent", () => {
  const errors = candidatureErrors(initialCandidature(), defaults)
  assert.deepEqual(Object.keys(candidatureStepErrors(errors, 0, true)), ["trainingSite"])
  const chosen = { ...initialCandidature(), trainingSite: "thies" }
  assert.deepEqual(candidatureStepErrors(candidatureErrors(chosen, defaults, {}, RESIDENCE_LOCATIONS, sites), 0, true), {})
})

test("Forward navigation rechecks prior steps if a previous choice becomes invalid", () => {
  const errors = { formation: "Incompatible", email: "Invalide", education: "Requis", acceptTerms: "Requis" }
  assert.deepEqual(candidatureStepErrors(errors, 3, true), { formation: "Incompatible", email: "Invalide" })
  assert.equal(firstInvalidStep(errors), 1)
  assert.equal(firstInvalidStep({ firstName: "Requis" }), 2)
  assert.equal(firstInvalidStep({ idNumber: "Doublon" }), 2)
  assert.equal(firstInvalidStep({ email: "Doublon", education: "Requis" }), 3)
  assert.equal(firstInvalidStep({ computer_skills: "Requis" }), 4)
  assert.equal(firstInvalidStep({ acceptTerms: "Requis" }), 5)
  assert.equal(firstInvalidStep({}), -1)
})

test("Only errors from the visible step appear in its validation message", () => {
  const errors = { email: "Doublon", isAvailable: "Requis", acceptTerms: "Requis" }
  assert.deepEqual(candidatureStepErrors(errors, 0), {})
  assert.deepEqual(candidatureStepErrors(errors, 1), {})
  assert.deepEqual(candidatureStepErrors(errors, 3), { email: "Doublon" })
  assert.deepEqual(candidatureStepErrors(errors, 5), { acceptTerms: "Requis" })
})

test("Every validated field belongs to one step so final errors always reveal the right screen", () => {
  const fields = CANDIDATURE_STEPS.flatMap((step) => step.fields)
  assert.equal(new Set(fields).size, fields.length)
  const errors = candidatureErrors(initialCandidature(), defaults)
  assert.ok(Object.keys(errors).every((field) => fields.includes(field)))
})

test("Identity owns documents; contact owns residence independently of campus", () => {
  const identity = CANDIDATURE_STEPS.find((step) => step.label === "Identité")
  const contact = CANDIDATURE_STEPS.find((step) => step.label === "Contact")
  assert.ok(identity.fields.includes("idType"))
  assert.ok(identity.fields.includes("idNumber"))
  assert.deepEqual(contact.fields, ["email", "phone", "region"])
})
