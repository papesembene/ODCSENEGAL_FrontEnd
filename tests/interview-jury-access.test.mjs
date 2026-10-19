import assert from "node:assert/strict"
import test from "node:test"
import {
  formatCriterionValue, getEditableSectionKeys, isFilterWindowOpen, isSlotVisible, isSectionComplete,
} from "../app/astrodmin/mes-entretiens/interview-helpers.js"

const now = Date.parse("2026-10-19T12:00:00Z")
const slot = {
  status: "scheduled", assigned_filter_ids: ["jury"],
  start_at: "2026-10-19T11:00:00", end_at: "2026-10-19T13:00:00",
  access: {
    editable_roles: ["filter"],
    filter_opens_at: "2026-10-19T11:00:00Z", filter_closes_at: "2026-10-19T13:00:00Z",
  },
}

test("filter sees and edits only the current window, ending exactly at the deadline", () => {
  assert.equal(isSlotVisible(slot, "jury", now), true)
  assert.deepEqual(getEditableSectionKeys(slot, "jury", now), ["filter"])
  const end = Date.parse(slot.access.filter_closes_at)
  assert.equal(isSlotVisible(slot, "jury", end), false)
  assert.deepEqual(getEditableSectionKeys(slot, "jury", end), [])
  assert.equal(isSlotVisible(slot, "jury", Date.parse("2026-10-19T10:00:00Z")), false)
})

test("validator retains access without unlocking expired filter review", () => {
  const multi = { ...slot, assigned_validator_ids: ["jury"], access: { ...slot.access, editable_roles: ["filter", "validator"] } }
  const end = Date.parse(slot.access.filter_closes_at)
  assert.equal(isSlotVisible(multi, "jury", end), true)
  assert.deepEqual(getEditableSectionKeys(multi, "jury", end), ["validator"])
})

test("another jury's review remains read only", () => {
  assert.deepEqual(getEditableSectionKeys(slot, "jury", now, {
    filter_review: { _owner_admin_id: "other-jury" },
  }), [])
})

test("naive stored dates are interpreted as UTC and cancelled slots are closed", () => {
  assert.equal(isFilterWindowOpen({ ...slot, access: undefined }, now), true)
  assert.equal(isFilterWindowOpen({ ...slot, status: "cancelled" }, now), false)
})

test("a zero score is not shown as missing", () => {
  assert.equal(formatCriterionValue(0, { type: "number" }), 0)
})

test("an untouched optional section is not marked completed", () => {
  const config = { sections: { filter: { criteria: [{ key: "comment", type: "textarea" }] } } }
  assert.equal(isSectionComplete({}, "Filtreur", config), false)
  assert.equal(isSectionComplete({ comment: "Avis enregistré" }, "Filtreur", config), true)
})
