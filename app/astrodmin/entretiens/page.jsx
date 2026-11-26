"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ArrowRight, BrainCircuit, CalendarCheck2, Code2, GraduationCap, Monitor, RefreshCw, ShieldCheck, UserCheck, Users } from "lucide-react"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Button } from "@/components/ui/button"
import Link from "@/components/ui/interactive-link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const FORMATION_ICONS = { "dev-web-mobile": Code2, "dev-data": BrainCircuit, "referent-digital": Monitor, "cyber-security": ShieldCheck }
const number = new Intl.NumberFormat("fr-FR")
const format = (value) => (value == null ? "—" : number.format(value))

const CAMPAIGN_STORAGE_KEY = "odc.interviews.campaign"
const readStoredCampaign = () => {
  try { return localStorage.getItem(CAMPAIGN_STORAGE_KEY) || "" } catch { return "" }
}
const storeCampaign = (value) => {
  try { value ? localStorage.setItem(CAMPAIGN_STORAGE_KEY, value) : localStorage.removeItem(CAMPAIGN_STORAGE_KEY) } catch { /* stockage indisponible */ }
}

const STATES = {
  empty: { label: "Aucun candidat", className: "bg-muted text-muted-foreground" },
  setup: { label: "À configurer", className: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300" },
  planned: { label: "Planifié", className: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300" },
  running: { label: "En cours", className: "bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300" },
  done: { label: "Terminé", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300" },
}

function stateOf(row) {
  if (!row.eligible) return "empty"
  if (row.completed >= row.eligible) return "done"
  if (row.completed > 0) return "running"
  if (row.validators && row.assigned) return "planned"
  return "setup"
}

function percent(done, total) {
  return total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
}

function SummaryBar({ rows }) {
  const totals = rows.reduce((sum, row) => ({
    eligible: sum.eligible + (row.eligible || 0),
    assigned: sum.assigned + (row.assigned || 0),
    validators: sum.validators + (row.validators || 0),
    completed: sum.completed + (row.completed || 0),
  }), { eligible: 0, assigned: 0, validators: 0, completed: 0 })
  const items = [
    { label: "Candidats éligibles", value: format(totals.eligible), icon: Users },
    { label: "Candidats affectés", value: format(totals.assigned), icon: UserCheck },
    { label: "Validateurs mobilisés", value: format(totals.validators), icon: GraduationCap },
    { label: "Entretiens réalisés", value: `${format(totals.completed)}`, hint: `${percent(totals.completed, totals.eligible)} %`, icon: CalendarCheck2 },
  ]
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-xl border bg-card lg:grid-cols-4">
      {items.map(({ label, value, hint, icon: Icon }, index) => (
        <div key={label} className={cn("flex items-center gap-3 p-4 sm:p-5", index % 2 === 1 && "border-l", index >= 2 && "border-t lg:border-t-0", index === 2 && "lg:border-l")}>
          <span className="hidden size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground sm:grid">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <dt className="truncate text-xs text-muted-foreground">{label}</dt>
            <dd className="flex items-baseline gap-2">
              <span className="text-xl font-semibold tabular-nums sm:text-2xl">{value}</span>
              {hint ? <span className="text-xs font-medium text-orange-700 dark:text-orange-300">{hint}</span> : null}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

function FormationCard({ row, campaignId }) {
  const Icon = FORMATION_ICONS[row.formation] || GraduationCap
  const total = row.eligible ?? row.assigned ?? 0
  const progress = percent(row.completed, total)
  const state = STATES[stateOf(row)]
  const campaign = row.candidature_campaign
  const warning = row.eligible > 0 && !row.validators
    ? "Aucun validateur configuré"
    : row.eligible > row.assigned ? `${format(row.eligible - row.assigned)} candidat(s) à affecter` : null

  return (
    <Link
      href={`/astrodmin/entretiens/referentiels/${encodeURIComponent(row.formation)}${campaignId ? `?campaign_id=${encodeURIComponent(campaignId)}` : ""}`}
      aria-label={`Consulter le référentiel ${row.title}`}
      className="group relative flex flex-col rounded-xl border bg-card p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:hover:border-orange-700"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold leading-snug">{row.title}</h2>
          {campaign ? (
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <span className={cn("size-1.5 shrink-0 rounded-full", campaign.is_open ? "bg-emerald-500" : "bg-muted-foreground/50")} aria-hidden="true" />
              <span className="truncate">{campaign.title}{campaign.promotion ? ` · ${campaign.promotion}` : ""}</span>
            </p>
          ) : <p className="mt-0.5 text-xs text-muted-foreground">Aucune campagne</p>}
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", state.className)}>{state.label}</span>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-end justify-between gap-2">
          <span className="text-3xl font-semibold tabular-nums tracking-tight">{progress}<span className="text-lg text-muted-foreground"> %</span></span>
          <span className="pb-1 text-xs text-muted-foreground tabular-nums">{format(row.completed)} / {format(total)} entretiens</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={`Entretiens réalisés pour ${row.title}`}>
          <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-4 divide-x rounded-lg border text-center">
        {[["Éligibles", row.eligible], ["Affectés", row.assigned], ["Validateurs", row.validators], ["Restants", row.remaining]].map(([label, value]) => (
          <div key={label} className="px-1 py-2.5">
            <dd className="text-base font-semibold tabular-nums">{format(value)}</dd>
            <dt className="truncate text-[11px] text-muted-foreground">{label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4 text-sm">
        {warning ? (
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{warning}</span>
          </span>
        ) : <span className="text-xs text-muted-foreground">{row.eligible ? "Tous les candidats sont affectés" : "En attente de candidats éligibles"}</span>}
        <span className="flex shrink-0 items-center gap-1 font-medium text-orange-700 dark:text-orange-300">
          Consulter <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}

function CardSkeleton() {
  return (
    <div className="space-y-5 rounded-xl border bg-card p-5">
      <div className="flex gap-3"><Skeleton className="size-11 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div></div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  )
}

export default function AdminInterviewsPage() {
  const { interviews } = useAdminApi()
  const [rows, setRows] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [revision, setRevision] = useState(0)
  const [campaigns, setCampaigns] = useState([])
  const [campaignId, setCampaignId] = useState(null)

  useEffect(() => { setCampaignId(readStoredCampaign()) }, [])

  useEffect(() => {
    if (campaignId === null) return undefined
    let active = true
    setLoading(true)
    setError("")
    interviews.overview(campaignId).then((result) => {
      if (!active) return
      setRows(Array.isArray(result.data) ? result.data : [])
      setCampaigns(Array.isArray(result.campaigns) ? result.campaigns : [])
    }).catch((failure) => {
      if (!active) return
      if (campaignId) {
        storeCampaign("")
        setCampaignId("")
        return
      }
      setError(failure.message || "Impossible de charger les référentiels.")
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [campaignId, interviews, revision])

  function chooseCampaign(value) {
    storeCampaign(value)
    setRows([])
    setCampaignId(value)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 md:p-8" aria-busy={loading}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Entretiens</h1>
          <p className="text-sm text-muted-foreground">Suivez l’avancement des entretiens et ouvrez un référentiel pour l’organiser.</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <label htmlFor="interviews-campaign" className="sr-only">Campagne de candidature</label>
          <select id="interviews-campaign" className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm sm:max-w-sm"
            value={campaignId || ""} disabled={campaignId === null} onChange={(event) => chooseCampaign(event.target.value)}>
            <option value="">Campagne en cours de chaque référentiel</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}{campaign.promotion ? ` · ${campaign.promotion}` : ""} — {campaign.scope}{campaign.is_open ? " (ouverte)" : ""}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => setRevision((current) => current + 1)} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} aria-hidden="true" />Actualiser
          </Button>
        </div>
      </header>

      {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p> : null}

      {rows.length ? <SummaryBar rows={rows} /> : null}

      {loading && !rows.length ? (
        <div role="status" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <span className="sr-only">Chargement des référentiels…</span>
          {[0, 1, 2].map((key) => <CardSkeleton key={key} />)}
        </div>
      ) : null}

      {!loading && !error && !rows.length ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <GraduationCap className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium">Aucun référentiel disponible</p>
          <p className="text-sm text-muted-foreground">{campaignId ? "Aucun référentiel publié n’est concerné par cette campagne." : "Publiez un référentiel pour organiser ses entretiens."}</p>
        </div>
      ) : null}

      {rows.length ? (
        <section aria-label="Référentiels" className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Référentiels · {rows.length}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => <FormationCard key={row.formation} row={row} campaignId={campaignId} />)}
          </div>
        </section>
      ) : null}
    </div>
  )
}
