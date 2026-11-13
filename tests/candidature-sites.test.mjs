import assert from "node:assert/strict"
import test from "node:test"
import defaults from "../data/training-defaults.js"
import { eligibleTrainings, eligibleTrainingSites, validateTrainingSites, withSiteAssignments, formatSiteDeadline, DEFAULT_TRAINING_SITES as sites, RESIDENCE_LOCATIONS } from "../lib/training-eligibility.js"
import { trainingForm, trainingPayload } from "../app/astrodmin/competences/referentiels/training-form.js"
import { candidatureErrors, candidaturePayload, changeCandidature, initialCandidature } from "../app/odc/candidatures/form-model.js"

const valid = { ...initialCandidature(), firstName: "Moussa", lastName: "Ba", email: "moussa@example.org",
  phone: "771234567", birthDate: "2000-01-01", birthPlace: "Dakar", gender: "male", idType: "cni",
  idNumber: "1234567890123", nationality: "Sénégalaise", region: "Diourbel", trainingSite: "dakar", formation: "dev-web-mobile",
  education: "terminale_sans_bac", computer_skills: true, isWorking: false, isAvailable: true, acceptTerms: true }
const errors = (values, rows = defaults, locations = sites) => candidatureErrors(values, rows, {}, RESIDENCE_LOCATIONS, locations)

test("Site offerings are explicit and do not depend on residence", () => {
  for (const site of ["thies", "diamniadio-uam"]) assert.deepEqual(eligibleTrainings(defaults, site, "male").map((row) => row.code), ["dev-data"])
  assert.deepEqual(eligibleTrainings(defaults, "tambacounda", "female").map((row) => row.code), ["referent-digital"])
  assert.equal(eligibleTrainings(defaults, "dakar", "female").length, 7)
  assert.equal(eligibleTrainings(defaults, "", "female").length, 0)
  assert.deepEqual(errors(valid), {})
  assert.equal(errors({ ...valid, region: "Thiès" }).formation, undefined)
})

test("Registration shows only active sites with a published eligible formation and correct counts", () => {
  const campus = (code, status = "active") => ({ code, name: code, status })
  const places = [campus("empty"), campus("draft-only"), campus("archive-only"), campus("closed", "archived"), campus("open")]
  const courses = [
    { ...defaults[0], siteIds: ["draft-only"], status: "draft" },
    { ...defaults[0], siteIds: ["archive-only"], status: "archived" },
    { ...defaults[0], siteIds: ["open", "closed"] },
    { ...defaults[1], siteIds: ["open"] },
  ]
  const before = structuredClone(places)
  const result = eligibleTrainingSites(places, courses)
  assert.deepEqual(result.map(({ code, trainingCount }) => ({ code, trainingCount })), [{ code: "open", trainingCount: 2 }])
  assert.deepEqual(places, before)
  assert.deepEqual(eligibleTrainingSites(places, []), [])
})

test("A site-specific deadline is shown and a closed site cannot be selected", () => {
  const tamba = { ...sites.find((site) => site.code === "tambacounda"), applicationDeadline: "2026-11-09T12:00", applicationOpen: false }
  const closed = eligibleTrainingSites([tamba], defaults, "female")
  assert.equal(closed[0].applicationOpen, false)
  assert.equal(formatSiteDeadline(tamba.applicationDeadline), "09/11/2026 à 12:00")
  const errorsForClosedSite = candidatureErrors({ ...valid, trainingSite: "tambacounda", formation: "referent-digital" },
    defaults, {}, RESIDENCE_LOCATIONS, [tamba])
  assert.match(errorsForClosedSite.trainingSite, /inscriptions.*clôturées/i)
  assert.equal(formatSiteDeadline("not-a-date"), "")
})

test("A site with only women-only courses disappears for a male profile, not other profiles", () => {
  const courses = [{ ...defaults[3], siteIds: ["dakar"] }]
  assert.equal(eligibleTrainingSites(sites, courses, "male").length, 0)
  assert.equal(eligibleTrainingSites(sites, courses, "female")[0].code, "dakar")
  assert.equal(eligibleTrainingSites(sites, courses)[0].trainingCount, 1)
  assert.ok(errors(valid, []).trainingSite, "A selected site that has lost its last offer is no longer valid")
})

test("Changing residence never changes formation; changing campus clears only incompatible choices", () => {
  assert.equal(changeCandidature(valid, "region", "Tambacounda", defaults).formation, valid.formation)
  const changed = changeCandidature(valid, "trainingSite", "thies", defaults)
  assert.equal(changed.formation, "")
  assert.equal(changed.education, "")
  assert.equal(changed.email, valid.email)
  assert.equal(changed.region, "Diourbel")
  assert.equal(changeCandidature({ ...valid, formation: "dev-data" }, "trainingSite", "thies", defaults).formation, "dev-data")
})

test("Gender and document/work changes preserve unrelated values", () => {
  assert.equal(changeCandidature({ ...valid, formation: "hackeuses", gender: "female" }, "gender", "male", defaults).formation, "")
  assert.equal(changeCandidature(valid, "idType", "passport", defaults).idNumber, "")
  assert.equal(changeCandidature({ ...valid, isWorking: true, contractType: "cdi" }, "isWorking", false, defaults).contractType, "")
})

test("Validation requires active site, compatible published formation, consent and explicit booleans", () => {
  assert.ok(errors({ ...valid, trainingSite: "thies" }).formation)
  assert.ok(errors({ ...valid, trainingSite: "unknown" }).trainingSite)
  assert.ok(errors(valid, defaults, [{ ...sites[0], status: "archived" }]).trainingSite)
  assert.ok(errors(valid, [{ ...defaults[0], status: "archived" }]).formation)
  assert.ok(errors({ ...valid, isAvailable: undefined }).isAvailable)
  assert.ok(errors({ ...valid, acceptTerms: false }).acceptTerms)
  assert.ok(candidatureErrors(valid, defaults, { email: true }, RESIDENCE_LOCATIONS, sites).email)
})

test("Payload separately persists site and residence and preserves false answers", () => {
  const payload = candidaturePayload({ ...valid, computer_skills: false, isAvailable: false, contractType: "cdi" })
  assert.equal(payload.training_site, "dakar")
  assert.equal(payload.region_of_residence, "Diourbel")
  assert.equal(payload.computer_skills, false)
  assert.equal(payload.available_for_10_months, false)
  assert.equal(payload.contract_type, "")
  assert.equal(payload.phone, "+221 771234567")
})

test("Site metadata fails closed when malformed, without inventing sites", () => {
  assert.deepEqual(validateTrainingSites(sites), sites)
  for (const value of [undefined, null, {}, [{}], [sites[0], sites[0]]]) assert.throws(() => validateTrainingSites(value), /indisponibles/)
})

test("Admin must choose a site to publish but may prepare an unassigned draft", () => {
  const form = { ...trainingForm(defaults[0]), siteIds: [] }
  assert.throws(() => trainingPayload(form), /au moins un site/)
  assert.deepEqual(trainingPayload({ ...form, status: "draft" }).siteIds, [])
  const payload = trainingPayload({ ...form, siteIds: ["thies"] })
  assert.deepEqual(payload.siteIds, ["thies"])
  assert.equal("applicationRegions" in payload, false)
})

test("Legacy residence policies are ignored, never converted to campus assignments", () => {
  const { siteIds, ...legacy } = defaults[0]
  const migrated = withSiteAssignments({ ...legacy, applicationRegionMode: "selected", applicationRegions: ["Thiès"] })
  assert.deepEqual(migrated.siteIds, ["dakar"])
  assert.equal("applicationRegions" in migrated, false)
})
