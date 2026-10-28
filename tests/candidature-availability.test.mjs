import assert from "node:assert/strict"
import test from "node:test"
import { getCampaignRefreshDelay, getCandidatureAvailability, isFormationApplicationLink } from "../lib/candidature-availability.js"
import { applyCandidatureStatusToSlides } from "../lib/home-content-defaults.js"

test("only an explicitly open verified campaign enables an application", () => {
  assert.equal(getCandidatureAvailability({ isOpen: true }).canApply, true)
  for (const status of [null, {}, { isOpen: false }, { isOpen: "true" }, { isOpen: "false" }]) {
    assert.equal(getCandidatureAvailability(status).canApply, false)
  }
})

test("loading and API failure never reuse an open application state", () => {
  for (const phase of ["loading", "error"]) {
    const state = getCandidatureAvailability({ isOpen: true }, phase)
    assert.equal(state.canApply, false)
    assert.equal(state.key, phase)
  }
})

test("an upcoming campaign is distinguished from a closed campaign", () => {
  assert.equal(getCandidatureAvailability({ isOpen: false, lifecycleStatus: "upcoming" }).key, "upcoming")
  assert.equal(getCandidatureAvailability({ isOpen: false, lifecycleStatus: "closed" }).label, "Candidatures fermées")
})

test("campaign boundaries from the backend are interpreted as UTC", () => {
  const now = Date.parse("2026-10-27T12:00:00Z")
  assert.equal(getCampaignRefreshDelay({ isOpen: true, campaign: { endAt: "2026-10-27T12:00:10" } }, now), 10100)
  assert.equal(getCampaignRefreshDelay({ isOpen: false, campaign: { startAt: "2026-10-27T14:00:10+02:00" } }, now), 10100)
  assert.equal(getCampaignRefreshDelay({ isOpen: true, campaign: { endAt: "2026-10-27T11:00:00Z" } }, now), 60000)
  assert.equal(getCampaignRefreshDelay({ isOpen: true, campaign: { endAt: "2027-01-01T00:00:00Z" } }, now), 86400000)
  assert.equal(getCampaignRefreshDelay({ isOpen: true, campaign: { endAt: "invalid" } }, now), null)
})

test("application links are recognized with query strings and trailing slashes", () => {
  for (const href of ["/odc/candidatures", "/odc/candidatures/", "/odc/candidatures?formation=dev-web", "/odc/candidatures#form"]) {
    assert.equal(isFormationApplicationLink(href), true)
  }
  for (const href of [null, "/competences", "/startups/candidature", "/odc/candidatures-extra"]) {
    assert.equal(isFormationApplicationLink(href), false)
  }
})

test("a custom CM banner cannot keep an application link when the campaign is closed", () => {
  const slide = { title: "Une formation", category: "Formation", linkUrl: "/odc/candidatures?formation=dev-web", linkLabel: "Postuler" }
  const [closed] = applyCandidatureStatusToSlides([slide], { isOpen: false })
  assert.equal(closed.linkUrl, "/candidatures/fermees")
  assert.equal(closed.linkLabel, "Candidatures fermées")
  assert.equal(closed.title, slide.title)
  const [open] = applyCandidatureStatusToSlides([slide], { isOpen: true })
  assert.equal(open.linkUrl, slide.linkUrl)
})
