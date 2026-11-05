import { Clock, MapPin } from "lucide-react"
import { regions } from "../../constants"
import CandidatureSection from "../candidature-section"
import CandidatureField from "../candidature-field"

export default function OdcTrainingChoiceSection({ manager }) {
  const { values, formations, selectedTraining, catalog } = manager
  const residenceRegions = catalog.regionalRules?.residenceRegions || regions
  return <CandidatureSection id="choix-formation" title="Votre résidence et votre formation" icon={MapPin}
    description="Sélectionnez votre région / localité de résidence, puis une formation.">
    <div className="grid gap-5 sm:grid-cols-2">
      <CandidatureField manager={manager} name="region" label="Région / localité de résidence"
        placeholder="Choisissez votre lieu de résidence" options={residenceRegions.map((region) => ({ value: region,
          label: region === "Tambacounda" ? "Tambacounda (Tamba)" : region }))} autoComplete="address-level1" />
      <CandidatureField manager={manager} name="formation" label="Formation souhaitée"
        options={formations.map((item) => ({ value: item.code, label: item.title }))}
        placeholder={!values.region ? "Choisissez d'abord votre lieu de résidence" : "Choisissez votre formation"}
        disabled={!values.region || !formations.length}
        hint={values.region ? "Seules les formations autorisées pour ce lieu de résidence et votre profil sont proposées." : undefined} />
    </div>
    {values.region && !formations.length && catalog.phase === "ready" && <p role="status" className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-gray-700">
      Aucune formation n'est actuellement ouverte pour ce lieu de résidence et ce profil.
    </p>}
    {selectedTraining && <div className="mt-5 flex flex-wrap items-start justify-between gap-3 rounded-lg border-l-4 border-[#ff7900] bg-gray-50 px-4 py-3">
      <div className="min-w-0"><p className="font-semibold text-gray-900">{selectedTraining.title}</p>
        {selectedTraining.level && <p className="mt-1 text-sm text-gray-600">{selectedTraining.level}</p>}
      </div>
      <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-gray-700"><Clock aria-hidden="true" className="h-4 w-4 text-[#e66f00]" />{selectedTraining.duration}</span>
    </div>}
  </CandidatureSection>
}
