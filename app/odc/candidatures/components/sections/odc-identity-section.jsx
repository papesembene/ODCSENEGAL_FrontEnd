import { User } from "lucide-react"
import { getNationalitiesByLetter } from "../../constants"
import CandidatureSection from "../candidature-section"
import CandidatureField from "../candidature-field"

export default function OdcIdentitySection({ manager }) {
  const nationalities = getNationalitiesByLetter()
  return <CandidatureSection id="identite-personnelle" title="Vos informations personnelles" icon={User}
    description="Renseignez vos informations telles qu'elles figurent sur votre pièce d'identité.">
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <CandidatureField manager={manager} name="firstName" label="Prénom" autoComplete="given-name" maxLength={100} />
      <CandidatureField manager={manager} name="lastName" label="Nom" autoComplete="family-name" maxLength={100} />
      <CandidatureField manager={manager} name="birthDate" label="Date de naissance" type="date" autoComplete="bday" />
      <CandidatureField manager={manager} name="birthPlace" label="Lieu de naissance" maxLength={150} />
      <CandidatureField manager={manager} name="gender" label="Genre" autoComplete="sex" options={[
        { value: "male", label: "Masculin" }, { value: "female", label: "Féminin" },
      ]} />
      <CandidatureField manager={manager} name="nationality" label="Nationalité" options={Object.keys(nationalities).sort()
        .map((letter) => ({ label: letter, options: nationalities[letter] }))} />
      <CandidatureField manager={manager} name="idType" label="Pièce d'identité" options={[
        { value: "cni", label: "CNI sénégalaise" }, { value: "passport", label: "Passeport" },
      ]} />
      <CandidatureField manager={manager} name="idNumber"
        label={manager.values.idType === "passport" ? "N° Passeport" : manager.values.idType === "cni" ? "N° CNI" : "Numéro de pièce"}
        maxLength={manager.values.idType === "passport" ? 9 : 14} disabled={!manager.values.idType}
        hint={!manager.values.idType ? "Choisissez le type de pièce." : manager.values.idType === "cni"
          ? "13 à 14 caractères, sans espaces." : "8 à 9 caractères."} />
    </div>
  </CandidatureSection>
}
