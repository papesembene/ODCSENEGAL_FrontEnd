import assert from "node:assert/strict"
import test from "node:test"
import {
  buildAdminStats,
  buildScoreDistributionData,
  buildStatusDistributionData,
  calculateResultPoints,
} from "../app/astrodmin/competences/tests/helpers.js"

test("global totals never fall back to the current result page", () => {
  const page = Array.from({ length: 20 }, () => ({ status: "admis", score: 100 }))
  assert.equal(buildAdminStats([], page, { total: 225, admis: 75 }).totalCandidates, 225)
  assert.equal(buildAdminStats([], page, { total: 0, admis: 0 }).selectedCandidates, 0)
})

test("charts use server aggregates, including genuine zero values", () => {
  const statistics = { admis: 75, rejetes: 75, pending: 75,
    score_distribution: [{ range: "0-20", count: 0 }, { range: "80-100", count: 225 }] }
  assert.equal(buildScoreDistributionData(statistics)[0].count, 0)
  assert.equal(buildScoreDistributionData(statistics).reduce((sum, bin) => sum + bin.count, 0), 225)
  assert.equal(buildStatusDistributionData(statistics).reduce((sum, item) => sum + item.value, 0), 225)
})

test("result summaries preserve exact point totals without downloading answers", () => {
  assert.deepEqual(calculateResultPoints({ score: 0, points: { obtained: 0, total: 250 } }, []), { obtained: 0, total: 250 })
  assert.deepEqual(calculateResultPoints({ score: 1, points: { obtained: 3, total: 250 } }, []), { obtained: 3, total: 250 })
})
