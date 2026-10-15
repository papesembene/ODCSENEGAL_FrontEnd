"use client"

import CompetencesInterviewsTab from "../competences/components/competences-interviews-tab"

export default function AdminInterviewsPage() {
  return (
    <div className="min-w-0 space-y-5 p-4 sm:p-6 md:p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Entretiens</h1>
        <p className="text-sm text-muted-foreground">
          Organisez les passages et suivez les évaluations par référentiel.
        </p>
      </div>

      <CompetencesInterviewsTab />
    </div>
  )
}
