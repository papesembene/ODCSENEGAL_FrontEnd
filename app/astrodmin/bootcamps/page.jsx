"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ArrowRight, GraduationCap, ListChecks, RefreshCw, Rocket } from "lucide-react"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Button } from "@/components/ui/button"
import Link from "@/components/ui/interactive-link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const CAMPAIGN_STORAGE_KEY = "odc.interviews.campaign"
const readStoredCampaign = () => { try { return localStorage.getItem(CAMPAIGN_STORAGE_KEY) || "" } catch { return "" } }
const storeCampaign = (value) => {
  try { value ? localStorage.setItem(CAMPAIGN_STORAGE_KEY, value) : localStorage.removeItem(CAMPAIGN_STORAGE_KEY) } catch { /* stockage indisponible */ }
}

function ReferentialCard({ row, campaignId }) {
  const ready = row.preselection_status === "validated"
  const unplaced = Math.max(0, row.preselected - row.assigned)
  return (
    <Link href={`/astrodmin/bootcamps/${encodeURIComponent(row.formation)}${campaignId ? `?campaign_id=${encodeURIComponent(campaignId)}` : ""}`}
      className="group flex flex-col rounded-xl border bg-card p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:hover:border-orange-700">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300"><Rocket className="size-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold leading-snug">{row.title}</h2>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{row.candidature_campaign?.title || "Aucune campagne"}</p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
          ready ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300" : "bg-muted text-muted-foreground")}>
          {ready ? "Présélection validée" : "En attente de présélection"}
        </span>
      </div>
      <dl className="mt-5 grid grid-cols-3 divide-x rounded-lg border text-center">
        {[["Présélectionnés", row.preselected], ["Bootcamps", row.bootcamps], ["Coachs", row.coaches]].map(([label, value]) => (
          <div key={label} className="px-1 py-2.5"><dd className="text-base font-semibold tabular-nums">{value}</dd><dt className="truncate text-[11px] text-muted-foreground">{label}</dt></div>
        ))}
      </dl>
      <dl className="mt-2 grid grid-cols-3 divide-x rounded-lg border text-center">
        {[["Retenus", row.retained, "text-emerald-700 dark:text-emerald-300"], ["Liste d’attente", row.waiting_list, "text-amber-700 dark:text-amber-300"], ["À évaluer", row.to_evaluate, ""]].map(([label, value, tone]) => (
          <div key={label} className="px-1 py-2.5"><dd className={cn("text-base font-semibold tabular-nums", tone)}>{value}</dd><dt className="truncate text-[11px] text-muted-foreground">{label}</dt></div>
        ))}
      </dl>
      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4 text-sm">
        {ready && unplaced ? <span className="flex min-w-0 items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300"><AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />{unplaced} candidat(s) sans Bootcamp</span>
          : <span className="text-xs text-muted-foreground">{ready ? "Tous les présélectionnés sont placés" : "Validez le classement dans Entretiens"}</span>}
        <span className="flex shrink-0 items-center gap-1 font-medium text-orange-700 dark:text-orange-300">Consulter <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
      </div>
    </Link>
  )
}

export default function AdminBootcampsPage() {
  const { bootcamps } = useAdminApi()
  const [rows, setRows] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [campaignId, setCampaignId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [revision, setRevision] = useState(0)

  useEffect(() => { setCampaignId(readStoredCampaign()) }, [])
  useEffect(() => {
    if (campaignId === null) return undefined
    let active = true
    setLoading(true)
    setError("")
    bootcamps.overview(campaignId).then(({ data }) => {
      if (!active) return
      setRows(data.rows || [])
      setCampaigns(data.campaigns || [])
    }).catch((failure) => {
      if (!active) return
      if (campaignId) { storeCampaign(""); setCampaignId(""); return }
      setError(failure.message)
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [bootcamps, campaignId, revision])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 md:p-8" aria-busy={loading}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Bootcamps</h1>
          <p className="text-sm text-muted-foreground">Organisez les Bootcamps des candidats présélectionnés à l’issue des entretiens.</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <label htmlFor="bootcamps-campaign" className="sr-only">Campagne de candidature</label>
          <select id="bootcamps-campaign" className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm sm:max-w-sm"
            value={campaignId || ""} disabled={campaignId === null}
            onChange={(event) => { storeCampaign(event.target.value); setRows([]); setCampaignId(event.target.value) }}>
            <option value="">Campagne en cours de chaque référentiel</option>
            {campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}{campaign.promotion ? ` · ${campaign.promotion}` : ""} — {campaign.scope}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={() => setRevision((value) => value + 1)} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} aria-hidden="true" />Actualiser
          </Button>
          <Button asChild size="sm">
            <Link href="/astrodmin/bootcamps/resultats"><ListChecks aria-hidden="true" />Liste des retenus</Link>
          </Button>
        </div>
      </header>
      {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p> : null}
      {loading && !rows.length ? (
        <div role="status" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><span className="sr-only">Chargement…</span>{[0, 1, 2].map((key) => <Skeleton key={key} className="h-64 rounded-xl" />)}</div>
      ) : null}
      {!loading && !error && !rows.length ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <GraduationCap className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium">Aucun référentiel pour cette campagne</p>
        </div>
      ) : null}
      {rows.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((row) => <ReferentialCard key={row.formation} row={row} campaignId={campaignId} />)}</div> : null}
    </div>
  )
}
