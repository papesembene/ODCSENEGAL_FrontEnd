import assert from "node:assert/strict"
import test from "node:test"
import defaults from "../data/training-defaults.js"
import { eligibleTrainings, trainingAllowedInRegion, validateRegionalRules, withResidenceEligibility, RESIDENCE_LOCATIONS } from "../lib/training-eligibility.js"
import { trainingForm, trainingPayload } from "../app/astrodmin/competences/referentiels/training-form.js"
import { candidatureErrors, candidaturePayload, changeCandidature, initialCandidature } from "../app/odc/candidatures/form-model.js"

const valid = { ...initialCandidature(), firstName: "Moussa", lastName: "Ba", email: "moussa@example.org",
  phone: "771234567", birthDate: "2000-01-01", birthPlace: "Dakar", gender: "male", idType: "cni",
  idNumber: "1234567890123", nationality: "Sénégalaise", region: "Dakar", formation: "dev-web-mobile",
  education: "terminale", computer_skills: true, isWorking: false, isAvailable: true, acceptTerms: true }

test("Restricted residence filters use configured codes, not vague name matching", () => {
  for (const region of ["Thiès", " THIES ", "Diamniadio"]) {
    assert.deepEqual(eligibleTrainings(defaults, region, "male").map((item) => item.code), ["dev-data"])
  }
  assert.deepEqual(eligibleTrainings(defaults, "Tamba", "female").map((item) => item.code), ["referent-digital"])
  assert.equal(eligibleTrainings(defaults, "Dakar", "female").length, 7)
  assert.equal(eligibleTrainings(defaults, "", "female").length, 0)
})

test("A custom fibre referential appears for Tamba only if assigned and published", () => {
  const fibre = { ...defaults[0], code: "fibre", title: "Fibre", applicationRegionMode: "selected", applicationRegions: ["Tambacounda"] }
  assert.ok(trainingAllowedInRegion(fibre, "TAMBA"))
  assert.equal(eligibleTrainings([fibre], "Diamniadio", "female").length, 0)
  assert.equal(eligibleTrainings([{ ...fibre, status: "archived" }], "Tamba", "female").length, 0)
})

test("Changing region drops incompatible choices without losing identity or contacts", () => {
  const changed = changeCandidature(valid, "region", "Thiès", defaults)
  assert.equal(changed.formation, "")
  assert.equal(changed.education, "")
  assert.equal(changed.firstName, "Moussa")
  assert.equal(changed.email, valid.email)
  const data = { ...valid, formation: "dev-data", region: "Thiès" }
  const compatible = changeCandidature(data, "region", "Diamniadio", defaults)
  assert.equal(compatible.formation, "dev-data")
  assert.equal(compatible.education, "terminale")
})

test("Changing gender, identity type or work situation clears only dependent values", () => {
  const womenOnly = { ...defaults[3], applicationRegionMode: "all", applicationRegions: [] }
  const changed = changeCandidature({ ...valid, formation: womenOnly.code, gender: "female" }, "gender", "male", defaults)
  assert.equal(changed.formation, "")
  assert.equal(changed.phone, valid.phone)
  assert.equal(changeCandidature(valid, "idType", "passport", defaults).idNumber, "")
  assert.equal(changeCandidature({ ...valid, isWorking: true, contractType: "cdi" }, "isWorking", false, defaults).contractType, "")
})

test("Full validation includes region eligibility, duplicate fields and explicit yes/no", () => {
  assert.deepEqual(candidatureErrors(valid, defaults), {})
  assert.ok(candidatureErrors({ ...valid, region: "Diamniadio" }, defaults).formation)
  const errors = candidatureErrors({ ...valid, isAvailable: undefined, acceptTerms: false }, defaults, { email: true })
  assert.ok(errors.isAvailable)
  assert.ok(errors.acceptTerms)
  assert.ok(errors.email)
})

test("Payload preserves false values and does not add a training-location field", () => {
  const payload = candidaturePayload({ ...valid, computer_skills: false, isAvailable: false, contractType: "cdi" })
  assert.equal(payload.available_for_10_months, false)
  assert.equal(payload.computer_skills, false)
  assert.equal(payload.contract_type, "")
  assert.equal(payload.region_of_residence, "Dakar")
  assert.equal(payload.phone, "+221 771234567")
  assert.equal("training_center" in payload, false)
})

test("Malformed regional rules are rejected; older catalogues remain compatible", () => {
  assert.equal(validateRegionalRules(undefined).residenceRegions.length, 15)
  for (const payload of [null, {}, { regions: "Thiès", defaults: {} }, { regions: [], defaults: { data: "Thiès" } }]) {
    assert.throws(() => validateRegionalRules(payload), /indisponibles/)
  }
})

test("Web can be limited to Dakar alone, without special cases for other residences", () => {
  const web = { ...defaults[0], applicationRegionMode: "selected", applicationRegions: ["Dakar"] }
  assert.deepEqual(RESIDENCE_LOCATIONS.filter((location) => trainingAllowedInRegion(web, location)), ["Dakar"])
  assert.equal(eligibleTrainings([web], "Diourbel", "female").length, 0)
  assert.ok(candidatureErrors({ ...valid, region: "Diourbel" }, [web]).formation)
  const all = { ...web, applicationRegionMode: "all", applicationRegions: [] }
  assert.ok(RESIDENCE_LOCATIONS.every((location) => trainingAllowedInRegion(all, location)))
  assert.equal(trainingAllowedInRegion(all, "Lieu inventé"), false)
  assert.equal(trainingAllowedInRegion({ ...web, applicationRegionMode: "invalid" }, "Dakar"), false)
})

test("A selected policy with zero places cannot silently reopen the course to everyone", () => {
  const form = { ...trainingForm(defaults[0]), applicationRegionMode: "selected", applicationRegions: [] }
  assert.throws(() => trainingPayload(form), /au moins une/)
  const all = trainingPayload({ ...form, applicationRegionMode: "all", applicationRegions: ["Dakar"] })
  assert.equal(all.applicationRegionMode, "all")
  assert.deepEqual(all.applicationRegions, [])
})

test("Old partial eligibility is expanded without changing which residents can apply", () => {
  const legacy = { ...defaults[0], applicationRegions: ["Thiès"] }
  delete legacy.applicationRegionMode
  const migrated = withResidenceEligibility(legacy)
  assert.equal(migrated.applicationRegionMode, "selected")
  assert.deepEqual(migrated.applicationRegions, RESIDENCE_LOCATIONS.filter((location) => !["Diamniadio", "Tambacounda"].includes(location)))
  assert.deepEqual(legacy.applicationRegions, ["Thiès"])
})
