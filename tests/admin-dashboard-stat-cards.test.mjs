import assert from "node:assert/strict"
import test from "node:test"
import { buildGlobalStatCards } from "../app/astrodmin/dashboard/admin-dashboard-utils.js"

const statistics = {
  totalCandidatures: 100,
  candidaturesCompetences: 82,
  candidaturesStartups: 18,
  croissance: 12,
  testsProgrammes: 3,
  evenementsAVenir: 2,
  tauxAcceptation: 25,
}
const modules = { tests: { actifs: 2 } }

test("training and startup applications keep their distinct server totals", () => {
  const cards = buildGlobalStatCards(statistics, modules)
  assert.equal(cards[0].value, 82)
  assert.equal(cards[1].title, "Startups")
  assert.equal(cards[1].value, 18)
})

test("unscoped totals are never labelled with the browser's current year", () => {
  const [card] = buildGlobalStatCards(statistics, modules)
  assert.equal(card.title, "Candidatures aux formations")
})

test("a campaign year is displayed only when supplied by the server", () => {
  const [card] = buildGlobalStatCards({ ...statistics, campaignYear: 2024 }, modules)
  assert.equal(card.title, "Candidatures 2024")
})

test("empty totals stay zero instead of borrowing the other category", () => {
  const cards = buildGlobalStatCards({ ...statistics, candidaturesCompetences: 0, candidaturesStartups: 0 }, modules)
  assert.equal(cards[0].value, 0)
  assert.equal(cards[1].value, 0)
})
