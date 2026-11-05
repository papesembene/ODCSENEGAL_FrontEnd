"use client"

import { PublicFormSuccessState } from "@/components/ui/form-feedback"
import CatalogFeedback from "@/components/trainings/catalog-feedback"
import useOdcCandidature from "../hooks/use-odc-candidature"
import OdcCandidatureFormShell from "./odc-candidature-form-shell"
import OdcTrainingChoiceSection from "./sections/odc-training-choice-section"
import OdcSiteChoiceSection from "./sections/odc-site-choice-section"
import OdcIdentitySection from "./sections/odc-identity-section"
import OdcContactSection from "./sections/odc-contact-section"
import OdcAvailabilitySection from "./sections/odc-availability-section"
import OdcValidationSection from "./sections/odc-validation-section"
import CandidatureNavigation from "./candidature-navigation"

const STEP_COMPONENTS = [OdcSiteChoiceSection, OdcTrainingChoiceSection, OdcIdentitySection, OdcContactSection, OdcAvailabilitySection, OdcValidationSection]

export default function OdcCandidatureForm() {
  const manager = useOdcCandidature()
  const ActiveStep = STEP_COMPONENTS[manager.step]
  if (manager.receipt) return <div className="container mx-auto max-w-3xl px-4 py-12">
    <PublicFormSuccessState title="Candidature enregistrée !" descriptions={[
      `Site : ${manager.receipt.site}`, `Formation : ${manager.receipt.formation}`, "Aucun email de confirmation ne sera envoyé.",
    ]} actionHref="/competences" actionLabel="Retour à la page des compétences" />
  </div>

  return <OdcCandidatureFormShell manager={manager}>
    <CatalogFeedback />
    {Object.keys(manager.stepErrors).length > 0 && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      Vérifiez les champs indiqués en rouge pour continuer.
    </p>}
    <fieldset disabled={manager.catalog.phase !== "ready" || manager.submitting} className="min-w-0 space-y-5 border-0 p-0">
      <legend className="sr-only">Informations de candidature</legend>
      <ActiveStep manager={manager} />
    </fieldset>
    <CandidatureNavigation manager={manager} />
  </OdcCandidatureFormShell>
}
