"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCandidatureStatus } from "./candidature-status-provider"

export default function CandidatureButton({ label = "Postuler", eyebrow, className }) {
  const availability = useCandidatureStatus()
  const [checking, setChecking] = useState(false)
  const [isNavigating, startNavigation] = useTransition()
  const router = useRouter()
  const busy = checking || isNavigating || availability.phase === "loading"
  const Icon = busy ? Loader2 : availability.canApply ? ArrowRight : Lock

  async function apply() {
    if (!availability.canApply || checking || isNavigating) return
    setChecking(true)
    try {
      const current = await availability.refresh()
      if (current?.isOpen === true) startNavigation(() => router.push("/odc/candidatures"))
    } finally {
      setChecking(false)
    }
  }

  return (
    <button
      type="button"
      className={cn("disabled:cursor-not-allowed disabled:opacity-60", className)}
      disabled={!availability.canApply || checking || isNavigating}
      aria-busy={busy}
      onClick={apply}
    >
      <span>{eyebrow && <small>{eyebrow}</small>}{busy ? "Vérification en cours…" : availability.canApply ? label : availability.label}</span>
      <Icon size={20} className={busy ? "animate-spin motion-reduce:animate-none" : undefined} aria-hidden="true" />
    </button>
  )
}
