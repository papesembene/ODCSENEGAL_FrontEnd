import { BookOpen } from "lucide-react"
import CandidatureSection from "../candidature-section"
import CandidatureField from "../candidature-field"
import CandidatureBooleanField from "../candidature-boolean-field"
import { educationOptions, structureOptions } from "../../education-options"

export default function OdcAvailabilitySection({ manager }) {
  const months = manager.selectedTraining?.durationMonths
  return <CandidatureSection id="parcours-disponibilites" title="Votre parcours et vos disponibilités" icon={BookOpen}
    description="Indiquez votre niveau d'études et votre situation actuelle.">
    <div className="grid gap-5 sm:grid-cols-2">
      <CandidatureField manager={manager} name="education" label="Niveau d'études"
        options={educationOptions(manager.values.formation)} />
      <CandidatureField manager={manager} name="currentStructure" label="Structure actuelle" required={false}
        options={structureOptions(manager.values.formation)} />
      <div className="sm:col-span-2"><CandidatureField manager={manager} name="speciality" label="Spécialité" required={false}
        placeholder="Série, filière, faculté…" maxLength={200} /></div>
    </div>
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      <CandidatureBooleanField manager={manager} name="computer_skills">Avez-vous des notions en informatique ?</CandidatureBooleanField>
      <CandidatureBooleanField manager={manager} name="isWorking">Travaillez-vous actuellement ?</CandidatureBooleanField>
      {manager.values.isWorking && <div className="sm:col-span-2"><CandidatureField manager={manager} name="contractType"
        label="Type de contrat" required={false} options={[
          { value: "stage", label: "Stage" }, { value: "cdd", label: "CDD" }, { value: "cdi", label: "CDI" },
          { value: "prestataire", label: "Prestataire" }, { value: "interim", label: "Intérim" },
        ]} /></div>}
      <div className="sm:col-span-2"><CandidatureBooleanField manager={manager} name="isAvailable">
        Êtes-vous disponible pour vous consacrer exclusivement à la formation {months ? `pendant ${months} mois` : "sur toute sa durée"} ?
      </CandidatureBooleanField></div>
    </div>
  </CandidatureSection>
}
