import assert from "node:assert/strict"
import test from "node:test"
import { DEFAULT_TRAININGS, PUBLIC_TRAININGS_PAGE_SIZE, findTraining, publicTrainingPage, setKnownTrainings, trainingOptions, trainingToken, validateCatalogResponse } from "../lib/training-catalog.js"
import { trainingForm, trainingPayload } from "../app/astrodmin/competences/referentiels/training-form.js"
import { normalizeFormationName } from "../app/astrodmin/competences/tests/helpers.js"
import { getMonthsForFormation } from "../app/odc/candidatures/validation.js"

test("Catalogue defaults retain seven stable identities and legacy aliases", () => {
  assert.equal(DEFAULT_TRAININGS.length, 7)
  assert.equal(new Set(DEFAULT_TRAININGS.map((item) => item.code)).size, 7)
  assert.equal(findTraining("DEV WEB").code, "dev-web-mobile")
  assert.equal(findTraining("referent digital").value, "Référent Digital")
  assert.equal(trainingToken("  ÉCOLE_du-NUMÉRIQUE "), "ecole du numerique")
})

test("Custom referentials, new names and configured duration propagate to shared helpers", () => {
  const item = { ...DEFAULT_TRAININGS[0], code: "cloud-souverain", value: "cloud-souverain", title: "Cloud public souverain", aliases: ["Cloud souverain"], durationMonths: 7 }
  setKnownTrainings([...DEFAULT_TRAININGS, item])
  try {
    assert.equal(findTraining("CLOUD SOUVERAIN").code, item.code)
    assert.equal(normalizeFormationName("Cloud souverain"), item.value)
    assert.equal(normalizeFormationName("Cloud totalement différent"), "Cloud totalement différent")
    assert.equal(getMonthsForFormation(item.code), 7)
  } finally { setKnownTrainings(DEFAULT_TRAININGS) }
})

test("Archived referentials remain selectable for history, not new workflows", () => {
  const items = DEFAULT_TRAININGS.map((item, index) => ({ ...item, status: index ? "published" : "archived" }))
  assert.equal(trainingOptions(items).length, 6)
  assert.equal(trainingOptions(items, "value", true).length, 7)
  assert.equal(trainingOptions(items, "value", true)[0].value, "Dev Web")
})

test("Malformed catalogue responses fail instead of presenting stale defaults", () => {
  for (const payload of [{ success: true }, { data: [] }, { success: true, data: [{}] }, { success: false, data: DEFAULT_TRAININGS }]) {
    assert.throws(() => validateCatalogResponse(payload), /indisponible/)
  }
  assert.deepEqual(validateCatalogResponse({ success: true, data: [] }), [])
})

test("Editor converts safe integers and skill lines without renaming stable identifiers", () => {
  const form = trainingForm(DEFAULT_TRAININGS[0])
  form.skills = "HTML\n  CSS  \n\n"
  const payload = trainingPayload(form, 0)
  assert.equal(payload.version, 0)
  assert.equal(payload.durationMonths, 10)
  assert.deepEqual(payload.skills, ["HTML", "CSS"])
  assert.equal("code" in payload, false)
  assert.equal("value" in payload, false)
})

test("Clearing or corrupting numeric inputs never submits NaN", () => {
  for (const value of ["", "NaN", "-1", "1.2", "37", "Infinity"]) {
    assert.throws(() => trainingPayload({ ...trainingForm(DEFAULT_TRAININGS[0]), durationMonths: value }), /durée/)
  }
})

test("Public catalogue displays six existing and new referentials per page without duplicates", () => {
  const custom = { ...DEFAULT_TRAININGS[0], code: "robotique", title: "Robotique" }
  const items = [...DEFAULT_TRAININGS, custom]
  const first = publicTrainingPage(items)
  const second = publicTrainingPage(items, { page: 2 })
  assert.equal(PUBLIC_TRAININGS_PAGE_SIZE, 6)
  assert.equal(first.items.length, 6)
  assert.equal(second.items.length, 2)
  assert.equal(first.total, 8)
  assert.equal(first.pages, 2)
  assert.deepEqual([...first.items, ...second.items].map((item) => item.code), items.map((item) => item.code))
})

test("Public search ignores accents and case, accepts unordered words, and excludes unpublished courses", () => {
  const rows = [...DEFAULT_TRAININGS,
    { ...DEFAULT_TRAININGS[0], code: "draft", title: "Référent Digital caché", status: "draft" },
    { ...DEFAULT_TRAININGS[0], code: "archive", title: "Référent Digital archivé", status: "archived" }]
  const page = publicTrainingPage(rows, { search: "  DIGITAL   REFERENT  " })
  assert.deepEqual(page.items.map((item) => item.code), ["referent-digital"])
  assert.equal(page.total, 1)
  assert.equal(publicTrainingPage(rows).total, 7)
  assert.equal(publicTrainingPage(rows, { search: "[inexistant]" }).total, 0)
})

test("Pagination remains in bounds after a catalogue update or an empty search", () => {
  for (const page of [0, -2, 1.5, NaN]) assert.equal(publicTrainingPage(DEFAULT_TRAININGS, { page }).page, 1)
  const last = publicTrainingPage(DEFAULT_TRAININGS, { page: 100 })
  assert.equal(last.page, 2)
  assert.equal(last.items.length, 1)
  const smaller = publicTrainingPage(DEFAULT_TRAININGS.slice(0, 2), { page: last.page })
  assert.equal(smaller.page, 1)
  assert.equal(smaller.items.length, 2)
  assert.deepEqual(publicTrainingPage([], { page: 4 }), { items: [], total: 0, pages: 1, page: 1 })
})
