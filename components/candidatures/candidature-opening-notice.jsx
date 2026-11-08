"use client"

import { useEffect, useState } from "react"
import { CalendarClock } from "lucide-react"
import { formatCampaignOpeningDate, getCampaignCountdown, parseCampaignDate } from "@/lib/candidature-availability"
import { useCandidatureStatus } from "./candidature-status-provider"
import styles from "./candidature-opening-notice.module.css"

const UNITS = [["days", "Jours"], ["hours", "Heures"], ["minutes", "Minutes"], ["seconds", "Secondes"]]

export default function CandidatureOpeningNotice({ variant = "card" }) {
  const { key, status } = useCandidatureStatus()
  const startAt = key === "upcoming" ? status?.campaign?.startAt : null
  const boundary = parseCampaignDate(startAt)
  const [clock, setClock] = useState(null)

  useEffect(() => {
    if (boundary === null) return
    let timer
    function tick() {
      const now = Date.now()
      setClock({ boundary, now })
      if (now >= boundary) clearInterval(timer)
    }
    function resume() {
      clearInterval(timer)
      if (document.visibilityState !== "visible") return
      tick()
      if (Date.now() < boundary) timer = setInterval(tick, 1000)
    }
    resume()
    document.addEventListener("visibilitychange", resume)
    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", resume)
    }
  }, [boundary])

  if (key !== "upcoming" || boundary === null) return null
  const now = clock?.boundary === boundary ? clock.now : null
  const remaining = getCampaignCountdown(startAt, now)

  return (
    <div className={styles.notice} data-variant={variant} aria-live="off">
      <p className={styles.date}>
        <CalendarClock size={18} aria-hidden="true" />
        <time dateTime={new Date(boundary).toISOString()}>Ouverture le {formatCampaignOpeningDate(startAt)} (heure de Dakar)</time>
      </p>
      {remaining ? (
        <dl className={styles.countdown} role="timer" aria-label="Temps avant l'ouverture des candidatures">
          {UNITS.map(([unit, label]) => (
            <div key={unit} className={styles.unit}>
              <dt>{label}</dt>
              <dd>{String(remaining[unit]).padStart(2, "0")}</dd>
            </div>
          ))}
        </dl>
      ) : now !== null && (
        <p className={styles.pending}>Vérification de l'ouverture en cours…</p>
      )}
    </div>
  )
}
