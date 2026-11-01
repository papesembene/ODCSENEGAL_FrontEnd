import assert from "node:assert/strict"
import test from "node:test"
import { zodResolver } from "@hookform/resolvers/zod"
import { jobOfferSchema, jobApplicationSchema } from "../lib/job-offer-validation.js"

const offer = {
  titre: "Developpeur web", entreprise: "ODC", categorie: "Developpement",
  type: "Stage", lieu: "Dakar", description: "Une description suffisamment longue pour cette offre.",
  competences: ["JavaScript"], responsabilites: ["Developper"], profil: ["Etudiant"],
  avantages: [], dateLimite: new Date("2027-01-01"), processRecrutement: ["Entretien"], conditions: true,
}
const options = { fields: {}, shouldUseNativeValidation: false }

test("Zod 4 resolver accepts the complete job offer", async () => {
  const result = await zodResolver(jobOfferSchema)(offer, {}, options)
  assert.deepEqual(result.errors, {})
  assert.equal(result.values.titre, offer.titre)
})

test("Zod 4 resolver returns field errors for missing date, skills and consent", async () => {
  const result = await zodResolver(jobOfferSchema)(
    { ...offer, dateLimite: undefined, competences: [], conditions: false }, {}, options)
  assert.equal(result.errors.dateLimite.message, "La date limite est requise")
  assert.ok(result.errors.competences.message)
  assert.ok(result.errors.conditions.message)
  assert.deepEqual(result.values, {})
})

test("job application resolver rejects invalid email and missing CV without throwing", async () => {
  const result = await zodResolver(jobApplicationSchema)({
    nom: "Test", prenom: "Candidat", email: "invalid", telephone: "770000000",
    message: "Candidature fictive", cv: "",
  }, {}, options)
  assert.ok(result.errors.email.message)
  assert.ok(result.errors.cv.message)
})
