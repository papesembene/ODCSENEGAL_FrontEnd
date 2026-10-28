"use client"

import Link from "@/components/ui/interactive-link"
import { CalendarClock, Loader2, Lock, RefreshCw } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CandidatureButton from "./candidature-button"
import { useCandidatureStatus } from "./candidature-status-provider"

export default function CandidatureAvailabilityCard() {
  const availability = useCandidatureStatus()
  const Icon = availability.key === "loading" ? Loader2 : availability.key === "upcoming" ? CalendarClock : Lock

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12" role="status" aria-live="polite">
      <Card>
        <CardContent className="space-y-5 p-7 text-center sm:p-10">
          <Icon className={`mx-auto h-8 w-8 text-orange-600 ${availability.key === "loading" ? "animate-spin" : ""}`} aria-hidden="true" />
          <h1 className="text-2xl font-bold">{availability.title}</h1>
          <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">{availability.message}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {availability.canApply ? (
              <CandidatureButton label="Déposer ma candidature" className={buttonVariants()} />
            ) : availability.key !== "loading" && (
              <Button type="button" variant="outline" onClick={() => availability.refresh()}>
                <RefreshCw size={16} aria-hidden="true" />Vérifier à nouveau
              </Button>
            )}
            <Button asChild variant="outline"><Link href="/competences">Découvrir les formations</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
