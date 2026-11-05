import { Contact } from "lucide-react"
import CandidatureSection from "../candidature-section"
import CandidatureField from "../candidature-field"
import CandidaturePhoneField from "../candidature-phone-field"

export default function OdcContactSection({ manager }) {
  return <CandidatureSection id="coordonnees" title="Vos coordonnées" icon={Contact}
    description="Vérifiez votre email et votre numéro de téléphone avant de continuer.">
    <div className="grid gap-4 sm:grid-cols-2">
      <CandidatureField manager={manager} name="email" label="Email" type="email" autoComplete="email" maxLength={254}
        placeholder="nom@exemple.com" hint="Une adresse email que vous consultez régulièrement." />
      <CandidaturePhoneField manager={manager} />
      <CandidatureField manager={manager} name="region" label="Région / localité de résidence"
        placeholder="Votre lieu de résidence" autoComplete="address-level1"
        options={manager.catalog.residenceLocations.map((value) => ({ value, label: value }))} />
    </div>
  </CandidatureSection>
}
