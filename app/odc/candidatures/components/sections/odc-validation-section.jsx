import { CheckCircle } from "lucide-react"
import { FormSubmissionError } from "@/components/ui/form-feedback"
import CandidatureSection from "../candidature-section"

export default function OdcValidationSection({ manager }) {
  return <CandidatureSection id="validation-candidature" title="Vérifiez et envoyez" icon={CheckCircle}
    description="Relisez vos coordonnées et votre choix de formation avant de valider.">
    <dl className="mb-5 grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm sm:grid-cols-2">
      <div><dt className="text-xs text-gray-500">Région / localité de résidence</dt><dd className="mt-1 font-medium text-gray-900">{manager.values.region || "À renseigner"}</dd></div>
      <div><dt className="text-xs text-gray-500">Formation</dt><dd className="mt-1 font-medium text-gray-900">{manager.selectedTraining?.title || "À choisir"}</dd></div>
      <div className="min-w-0 sm:col-span-2"><dt className="text-xs text-gray-500">Email de contact</dt><dd className="mt-1 break-all font-medium text-gray-900">{manager.values.email || "À renseigner"}</dd></div>
    </dl>
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-gray-700">
      <input id="acceptTerms" name="acceptTerms" type="checkbox" checked={manager.values.acceptTerms}
        onChange={manager.handleChange} required className="mt-1 h-4 w-4 shrink-0 accent-[#ff7900]"
        ref={(element) => { manager.fieldRefs.current.acceptTerms = element }}
        aria-invalid={Boolean(manager.errors.acceptTerms)} aria-describedby={manager.errors.acceptTerms ? "acceptTerms-error" : undefined} />
      <span>J'accepte que mes données personnelles soient traitées conformément à la politique de confidentialité.</span>
    </label>
    {manager.errors.acceptTerms && <p id="acceptTerms-error" className="mt-2 text-sm text-red-600">{manager.errors.acceptTerms}</p>}
    <div className="mt-5"><FormSubmissionError message={manager.submitError} /></div>
    <p className="mt-5 text-xs leading-5 text-gray-500">Une seule candidature par personne.</p>
  </CandidatureSection>
}
