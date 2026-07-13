"use client"

import { useState } from "react"
import odcFormations from "@/data/odcFormations"
import FormationDetails from "@/components/odc/FormationDetails"
import {
  CODE_SCHOOL_BENEFITS,
  IMPACT_STATS,
  MISSION_CARDS,
  VALUE_CHAIN_PROGRAMS,
} from "./competences-page-data"
import {
  CodeSchoolSection,
  CompetencesCtaSection,
  CompetencesFormationsSection,
  CompetencesHeroSection,
  CompetencesImpactSection,
  CompetencesMissionSection,
  CompetencesValueChainSection,
} from "./competences-page-sections"

export default function CompetencesPage() {
  const [selectedFormation, setSelectedFormation] = useState(null)

  return (
    <div className="flex flex-col">
      <CompetencesHeroSection />
      <CompetencesMissionSection missionCards={MISSION_CARDS} />
      <CompetencesImpactSection impactStats={IMPACT_STATS} />
      <CodeSchoolSection benefits={CODE_SCHOOL_BENEFITS} />
      <CompetencesFormationsSection formations={odcFormations} onFormationClick={setSelectedFormation} />
      <CompetencesValueChainSection programs={VALUE_CHAIN_PROGRAMS} />
      <CompetencesCtaSection />

      {selectedFormation ? (
        <FormationDetails formation={selectedFormation} onClose={() => setSelectedFormation(null)} />
      ) : null}
    </div>
  )
}
