import assert from "node:assert/strict"
import test from "node:test"
import {
  formatCriterionValue,
  formatTestScore,
  getEvaluationSectionReview,
  getFormationLabel,
} from "../app/astrodmin/competences/components/interviews/interview-presentation.js"

test("a zero mark remains visible in an interview criterion", () => {
  assert.equal(formatCriterionValue(0, { type: "number" }), "0")
})

test("unchecked and unanswered checkboxes are distinguishable", () => {
  const criterion = { type: "checkbox" }
  assert.equal(formatCriterionValue(false, criterion), "Non")
  assert.equal(formatCriterionValue(true, criterion), "Oui")
  assert.equal(formatCriterionValue(undefined, criterion), "-")
})

test("an absent test score is not displayed as a zero mark", () => {
  for (const score of [null, undefined, "", "invalid"]) {
    assert.equal(formatTestScore(score), "Non renseigné")
  }
  assert.equal(formatTestScore(0), "0 pts")
  assert.equal(formatTestScore("75"), "75 pts")
})

test("criterion options use their readable labels", () => {
  const criterion = { type: "select", options: [{ value: "echec", label: "Échec" }] }
  assert.equal(formatCriterionValue("echec", criterion), "Échec")
})

test("current and legacy evaluation records remain readable", () => {
  const legacy = { filter_review: { decision: "echec" } }
  const current = { ...legacy, section_reviews: { filter: { decision: "validateur" } } }
  assert.equal(getEvaluationSectionReview(legacy, "filter").decision, "echec")
  assert.equal(getEvaluationSectionReview(current, "filter").decision, "validateur")
})

test("legacy referential names resolve to the same display labels", () => {
  assert.equal(getFormationLabel("data"), getFormationLabel("dev-data"))
  assert.equal(getFormationLabel("Dev Web"), getFormationLabel("dev-web-mobile"))
})
