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
    </div>
  </CandidatureSection>
}
