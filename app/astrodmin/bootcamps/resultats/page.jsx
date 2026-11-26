"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Download, RefreshCw, Search, X } from "lucide-react"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { educationLabel } from "@/app/odc/candidatures/education-options"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "@/components/ui/interactive-link"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { DECISIONS } from "../[formation]/bootcamp-workspace"

const CAMPAIGN_STORAGE_KEY = "odc.interviews.campaign"
const readStoredCampaign = () => { try { return localStorage.getItem(CAMPAIGN_STORAGE_KEY) || "" } catch { return "" } }
const storeCampaign = (value) => {
  try { value ? localStorage.setItem(CAMPAIGN_STORAGE_KEY, value) : localStorage.removeItem(CAMPAIGN_STORAGE_KEY) } catch { /* stockage indisponible */ }
}
const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 })
const fullName = (row) => [row.first_name, row.last_name].filter(Boolean).join(" ") || row.email || "Candidat"
const normalize = (value) => String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const GENDERS = { M: "Homme", F: "Femme", male: "Homme", female: "Femme", homme: "Homme", femme: "Femme" }

async function exportRows(rows, label) {
  const { utils, writeFile } = await import("xlsx")
  const sheet = utils.json_to_sheet(rows.map((row) => ({
    Référentiel: row.formation_title, Bootcamp: row.bootcamp, Décision: DECISIONS[row.decision][0],
    "Résultats soumis": row.final ? "Oui" : "Non", Prénom: row.first_name, Nom: row.last_name, "E-mail": row.email, Téléphone: row.phone,
    Genre: GENDERS[row.gender] || row.gender || "", Région: row.region, "Niveau d’études": educationLabel(row.education_level),
    "Site de formation": row.training_site, "Score entretien": row.interview_score, "Appréciation validateur": row.validator_comment,
    "Appréciation coach": row.coach_comment, "E-mail de résultat": row.notified ? "Envoyé" : row.notification_status ? "En cours" : "Non envoyé",
  })))
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, sheet, "Résultats")
  writeFile(workbook, `resultats-bootcamps-${label}.xlsx`)
}

export default function AllResultsPage() {
  const { bootcamps: api } = useAdminApi()
  const [data, setData] = useState(null)
  const [campaignId, setCampaignId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reload, setReload] = useState(0)
  const [decision, setDecision] = useState("retained")
  const [formation, setFormation] = useState("all")
  const [bootcamp, setBootcamp] = useState("all")
  const [onlyFinal, setOnlyFinal] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => { setCampaignId(readStoredCampaign()) }, [])
  useEffect(() => {
    if (campaignId === null) return undefined
    const controller = new AbortController()
    setLoading(true)
    setError("")
    api.allResults(campaignId, { signal: controller.signal })
      .then(({ data: result }) => { if (!controller.signal.aborted) setData(result) })
      .catch((failure) => {
        if (controller.signal.aborted) return
        if (campaignId) { storeCampaign(""); setCampaignId(""); return }
        setError(failure.message)
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [api, campaignId, reload])

  const rows = data?.rows || []
  const formations = useMemo(() => [...new Map(rows.map((row) => [row.formation, row.formation_title])).entries()], [rows])
  const bootcamps = useMemo(() => [...new Map(rows.filter((row) => formation === "all" || row.formation === formation).map((row) => [row.bootcamp_id, `${row.bootcamp} · ${row.formation_title}`])).entries()], [formation, rows])
  const terms = normalize(search).split(/\s+/).filter(Boolean)
  const base = rows.filter((row) => (!onlyFinal || row.final) && (formation === "all" || row.formation === formation) && (bootcamp === "all" || row.bootcamp_id === bootcamp))
  const counts = Object.fromEntries(Object.keys(DECISIONS).map((key) => [key, base.filter((row) => row.decision === key).length]))
  const visible = base.filter((row) => (decision === "all" || row.decision === decision)
    && terms.every((term) => normalize([row.first_name, row.last_name, row.email, row.phone, row.bootcamp].join(" ")).includes(term)))
  const filtersActive = decision !== "retained" || formation !== "all" || bootcamp !== "all" || !onlyFinal || Boolean(search)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6 md:p-8" aria-busy={loading}>
      <header className="space-y-3">
        <Link href="/astrodmin/bootcamps" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" />Bootcamps</Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Résultats des Bootcamps</h1>
            <p className="text-sm text-muted-foreground">Tous les référentiels d’une campagne : retenus, liste d’attente et non retenus.</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <label htmlFor="results-campaign" className="sr-only">Campagne de candidature</label>
            <select id="results-campaign" className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm sm:max-w-sm" value={campaignId || ""} disabled={campaignId === null}
              onChange={(event) => { storeCampaign(event.target.value); setFormation("all"); setBootcamp("all"); setCampaignId(event.target.value) }}>
              <option value="">Campagne en cours de chaque référentiel</option>
              {(data?.campaigns || []).map((item) => <option key={item.id} value={item.id}>{item.title}{item.promotion ? ` · ${item.promotion}` : ""} — {item.scope}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={() => setReload((value) => value + 1)} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} aria-hidden="true" />Actualiser</Button>
            <Button size="sm" onClick={() => exportRows(visible, decision === "all" ? "tous" : decision).catch((failure) => setError(failure.message))} disabled={!visible.length}>
              <Download aria-hidden="true" />Exporter ({visible.length})
            </Button>
          </div>
        </div>
      </header>

      {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer par décision">
        {[["all", "Toutes les décisions", base.length], ...Object.entries(DECISIONS).map(([key, [label]]) => [key, label, counts[key]])].map(([key, label, count]) => (
          <button key={key} type="button" onClick={() => setDecision(key)} aria-pressed={decision === key}
            className={cn("rounded-full border px-3 py-1 text-sm transition", decision === key ? "border-orange-500 bg-orange-50 font-medium text-orange-800 dark:bg-orange-400/10 dark:text-orange-200" : "hover:bg-muted")}>
            {label} <span className="tabular-nums text-muted-foreground">{count}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input aria-label="Rechercher" className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom, e-mail, téléphone ou Bootcamp" />
        </div>
        <select aria-label="Référentiel" className="h-10 rounded-md border bg-background px-3 text-sm" value={formation} onChange={(event) => { setFormation(event.target.value); setBootcamp("all") }}>
          <option value="all">Tous les référentiels</option>
          {formations.map(([code, title]) => <option key={code} value={code}>{title}</option>)}
        </select>
        <select aria-label="Bootcamp" className="h-10 rounded-md border bg-background px-3 text-sm" value={bootcamp} onChange={(event) => setBootcamp(event.target.value)}>
          <option value="all">Tous les Bootcamps</option>
          {bootcamps.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-orange-600" checked={onlyFinal} onChange={(event) => setOnlyFinal(event.target.checked)} />
          Résultats soumis uniquement
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground" role="status">
        <span>{visible.length} candidat(s) affiché(s)</span>
        {filtersActive ? <Button variant="ghost" size="sm" onClick={() => { setDecision("retained"); setFormation("all"); setBootcamp("all"); setOnlyFinal(true); setSearch("") }}><X aria-hidden="true" />Réinitialiser les filtres</Button> : null}
      </div>

      {loading && !data ? <Skeleton className="h-64 rounded-xl" /> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table aria-label="Résultats des Bootcamps" className="min-w-[960px]">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Candidat</TableHead><TableHead>Référentiel</TableHead><TableHead>Bootcamp</TableHead><TableHead>Décision</TableHead>
                <TableHead className="text-right">Entretien</TableHead><TableHead>Appréciation du coach</TableHead><TableHead>E-mail de résultat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => {
                const [label, tone] = DECISIONS[row.decision]
                return (
                  <TableRow key={`${row.formation}-${row.candidate_id}`}>
                    <TableCell><span className="font-medium capitalize">{fullName(row)}</span><span className="block text-xs text-muted-foreground">{[row.email, row.phone].filter(Boolean).join(" · ")}</span></TableCell>
                    <TableCell>{row.formation_title}</TableCell>
                    <TableCell>{row.bootcamp}{!row.final ? <span className="block text-xs text-amber-700 dark:text-amber-300">Non soumis</span> : null}</TableCell>
                    <TableCell><span className={cn("whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", tone)}>{label}</span></TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{row.interview_score == null ? "—" : number.format(row.interview_score)}</TableCell>
                    <TableCell className="max-w-56"><span className="line-clamp-2 text-sm text-muted-foreground" title={row.coach_comment}>{row.coach_comment || "—"}</span></TableCell>
                    <TableCell className="text-sm">
                      {row.notified ? <span className="font-medium text-emerald-700 dark:text-emerald-300">Envoyé</span>
                        : row.notification_status === "failed" ? <span className="font-medium text-destructive">Échec</span>
                          : row.notification_status ? <span className="text-sky-700 dark:text-sky-300">En cours</span> : <span className="text-muted-foreground">Non envoyé</span>}
                    </TableCell>
                  </TableRow>
                )
              })}
              {!visible.length ? <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">Aucun candidat ne correspond à ces critères.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
