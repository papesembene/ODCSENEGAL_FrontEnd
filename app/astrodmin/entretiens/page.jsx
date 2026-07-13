"use client"

import CompetencesInterviewsTab from "../competences/components/competences-interviews-tab"

export default function AdminInterviewsPage() {
  return (
    <div className="space-y-6 p-4 pt-4 sm:p-6 sm:pt-6 md:p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Entretiens</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les campagnes, les créneaux et les viviers d&apos;évaluation sans passer par Excel.
        </p>
      </div>

      <CompetencesInterviewsTab />
    </div>
  )
}
