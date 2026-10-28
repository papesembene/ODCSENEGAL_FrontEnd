"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import CandidatureAvailabilityCard from "./candidature-availability-card"
import { useCandidatureStatus } from "./candidature-status-provider"

export default function CandidatureAccessGate({ children }) {
  const availability = useCandidatureStatus()
  const [wasOpen, setWasOpen] = useState(false)

  useEffect(() => { if (availability.canApply) setWasOpen(true) }, [availability.canApply])

  if (!wasOpen) return <CandidatureAvailabilityCard />

  return (
    <>
      {!availability.canApply && (
        <div role="alert" className="mx-auto mt-6 max-w-5xl border border-orange-200 bg-orange-50 p-5 text-orange-950">
          <p className="font-semibold">{availability.title}</p>
          <p className="mt-2 text-sm">L'envoi est désactivé. Vos informations restent affichées sur cette page.</p>
          <Button type="button" variant="outline" className="mt-3" onClick={() => availability.refresh()}>Vérifier à nouveau</Button>
        </div>
      )}
      <fieldset disabled={!availability.canApply} className="min-w-0 border-0 p-0 disabled:opacity-70">
        <legend className="sr-only">Formulaire de candidature formation</legend>
        {children}
      </fieldset>
    </>
  )
}
