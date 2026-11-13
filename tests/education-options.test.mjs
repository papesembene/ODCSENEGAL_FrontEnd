import assert from "node:assert/strict"
import test from "node:test"
import { educationOptions } from "../app/odc/candidatures/education-options.js"

test("registration distinguishes Terminale without BAC from BAC obtained", () => {
  const options = educationOptions({ level: "À partir du baccalauréat" })

  assert.ok(options.some((option) => option.value === "terminale_sans_bac" && /Terminale/.test(option.label)))
  assert.ok(options.some((option) => option.value === "bac" && option.label === "Baccalauréat"))
})
