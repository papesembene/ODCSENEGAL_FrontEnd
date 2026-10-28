import CandidatureAccessGate from "@/components/candidatures/candidature-access-gate"
import OdcCandidatureForm from "./components/odc-candidature-form"

export default function CandidaturePage() {
  return (
    <CandidatureAccessGate>
      <OdcCandidatureForm />
    </CandidatureAccessGate>
  )
}
