import assert from "node:assert/strict"
import test from "node:test"
import { formatCampaignOpeningDate, getCampaignCountdown, getCampaignRefreshDelay, getCandidatureAvailability, isFormationApplicationLink, parseCampaignDate } from "../lib/candidature-availability.js"
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
  const upcoming = getCandidatureAvailability({ isOpen: false, lifecycleStatus: "upcoming" })
  assert.equal(upcoming.key, "upcoming")
  assert.equal(upcoming.label, "Ouverture bientôt")
  assert.equal(upcoming.title, "Les candidatures ouvrent bientôt")
  assert.equal(upcoming.canApply, false)
  assert.equal(getCandidatureAvailability({ isOpen: false, lifecycleStatus: "closed" }).label, "Candidatures fermées")
})

test("an announcement without a published date does not invent one", () => {
  const status = { isOpen: false, lifecycleStatus: "upcoming", campaign: null }
  assert.match(getCandidatureAvailability(status).message, /date d'ouverture sera annoncée/)
  const [slide] = applyCandidatureStatusToSlides([{ slotKey: "candidature", title: "Appel à candidature" }], status)
  assert.equal(slide.summary, "Les candidatures ouvrent bientôt.")
  assert.equal(slide.linkLabel, "Ouverture bientôt")
  assert.equal(slide.linkUrl, "/candidatures/fermees")
  assert.equal(getCampaignRefreshDelay(status), null)
})

test("the opening countdown uses UTC, rounds up and never becomes negative", () => {
  const now = Date.parse("2026-11-08T12:00:00Z")
  assert.deepEqual(getCampaignCountdown("2026-11-09T13:02:03", now), { days: 1, hours: 1, minutes: 2, seconds: 3 })
  assert.deepEqual(getCampaignCountdown("2026-11-08T14:00:00.001+02:00", now), { days: 0, hours: 0, minutes: 0, seconds: 1 })
  for (const value of [null, "", "invalid", "2026-11-08T12:00:00Z", "2026-11-07T12:00:00Z"]) {
    assert.equal(getCampaignCountdown(value, now), null)
  }
  assert.equal(getCampaignCountdown("2026-11-09T12:00:00Z", null), null)
  assert.equal(getCampaignCountdown("2026-11-09T12:00:00Z", NaN), null)
})

test("the official opening date is formatted consistently in Dakar time", () => {
  const expected = Date.parse("2026-11-09T12:30:00Z")
  assert.equal(parseCampaignDate("2026-11-09T12:30:00"), expected)
  assert.equal(parseCampaignDate("2026-11-09T14:30:00+02:00"), expected)
  assert.match(formatCampaignOpeningDate("2026-11-09T14:30:00+02:00"), /9 novembre 2026.*12:30/)
  assert.equal(formatCampaignOpeningDate("invalid"), "")
  assert.equal(parseCampaignDate({}), null)
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

test("all candidature banners use the upcoming status and keep application disabled", () => {
  const slides = [
    { slotKey: "candidature", title: "Appel à candidature" },
    { category: "Candidature", title: "Annonce de campagne" },
    { category: "Formation", title: "Formation", linkUrl: "/odc/candidatures" },
  ]
  const status = { isOpen: false, lifecycleStatus: "upcoming", campaign: { title: "Promotion 2027", startAt: "2027-01-01T10:00:00", endAt: "2027-02-01T18:00:00" } }
  for (const slide of applyCandidatureStatusToSlides(slides, status)) {
    assert.equal(slide.linkLabel, "Ouverture bientôt")
    assert.equal(slide.linkUrl, "/candidatures/fermees")
    assert.doesNotMatch(slide.summary || "", /fermées/)
  }
  const [open] = applyCandidatureStatusToSlides(slides, { ...status, isOpen: "true" })
  assert.notEqual(open.linkUrl, "/odc/candidatures", "Only a boolean true enables an application")
})
