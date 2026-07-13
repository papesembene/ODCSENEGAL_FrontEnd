"use client"

import { COWORKING_SPACES, PROGRAMMES, TEAM_MEMBERS, VALUE_PROPOSITIONS } from "./startups-page-data"
import {
  StartupsCoworkingSection,
  StartupsHeroSection,
  StartupsPageAnimations,
  StartupsProgrammesSection,
  StartupsTeamSection,
  StartupsVisionSection,
} from "./startups-page-sections"

export default function StartupsPage() {
  return (
    <div className="relative flex flex-col overflow-hidden">
      <StartupsHeroSection />
      <StartupsVisionSection valuePropositions={VALUE_PROPOSITIONS} />
      <StartupsProgrammesSection programmes={PROGRAMMES} />
      <StartupsTeamSection teamMembers={TEAM_MEMBERS} />
      <StartupsPageAnimations teamCount={TEAM_MEMBERS.length} />
      <StartupsCoworkingSection coworkingSpaces={COWORKING_SPACES} />
    </div>
  )
}
