"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, ArrowLeft, CalendarDays, MapPin, Pencil, Plus, RefreshCw, Rocket, RotateCcw, Save, Search, Trash2, Users, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import Link from "@/components/ui/interactive-link"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import BootcampFormDialog from "./bootcamp-form-dialog"
import { ValidatorImport } from "../../entretiens/referentiels/[formation]/validator-tools"
import ResultsPanel from "./results-panel"

const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 })
const day = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
const formatDay = (value) => (value ? day.format(new Date(`${value}T00:00:00Z`)) : "")
const fullName = (row) => [row?.first_name, row?.last_name].filter(Boolean).join(" ") || row?.email || "Candidat"

export const BOOTCAMP_STATUS = {
  draft: ["Brouillon", "bg-muted text-muted-foreground"],
  launched: ["Lancé", "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300"],
  submitted: ["Résultats soumis", "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300"],
}
export const DECISIONS = {
  pending: ["En attente de décision", "bg-muted text-muted-foreground"],
  retained: ["Retenu", "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300"],
  waiting_list: ["Liste d’attente", "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300"],
  rejected: ["Non retenu", "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-300"],
}

function BootcampCard({ bootcamp, busy, onEdit, onLaunch, onDelete, onRetry, onReopen }) {
  const [label, tone] = BOOTCAMP_STATUS[bootcamp.status]
  const invitations = bootcamp.invitations || {}
  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug">{bootcamp.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><CalendarDays className="size-3.5" aria-hidden="true" />{formatDay(bootcamp.start_date)} → {formatDay(bootcamp.end_date)}</p>
          {bootcamp.location ? <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-3.5" aria-hidden="true" />{bootcamp.location}</p> : null}
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", tone)}>{label}</span>
      </div>
      <p className="text-sm"><span className="text-muted-foreground">Coach : </span>{bootcamp.coaches.length ? bootcamp.coaches.map((coach) => coach.name).join(", ") : <span className="text-amber-700 dark:text-amber-300">à désigner</span>}</p>
      <dl className="grid grid-cols-4 divide-x rounded-lg border text-center">
        {[["Participants", `${bootcamp.participants_count}${bootcamp.capacity ? `/${bootcamp.capacity}` : ""}`], ["Retenus", bootcamp.decisions.retained], ["Attente", bootcamp.decisions.waiting_list], ["À évaluer", bootcamp.decisions.pending]].map(([key, value]) => (
          <div key={key} className="px-1 py-2"><dd className="font-semibold tabular-nums">{value}</dd><dt className="truncate text-[11px] text-muted-foreground">{key}</dt></div>
        ))}
      </dl>
      {bootcamp.status !== "draft" && invitations.total ? (
        <p className="text-xs text-muted-foreground">Convocations : {invitations.sent} envoyée(s), {invitations.queued} en attente{invitations.failed ? `, ${invitations.failed} en échec` : ""}.</p>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onEdit} disabled={busy}><Pencil aria-hidden="true" />Modifier</Button>
        {bootcamp.status === "draft" ? <>
          <Button size="sm" onClick={onLaunch} disabled={busy}><Rocket aria-hidden="true" />Lancer le Bootcamp</Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete} disabled={busy}><Trash2 aria-hidden="true" />Supprimer</Button>
        </> : null}
        {invitations.failed ? <Button size="sm" variant="outline" onClick={onRetry} disabled={busy}>Relancer les envois</Button> : null}
        {bootcamp.status === "submitted" ? <Button size="sm" variant="outline" onClick={onReopen} disabled={busy}><RotateCcw aria-hidden="true" />Rouvrir les résultats</Button> : null}
      </div>
    </article>
  )
}

export default function BootcampWorkspace({ formation, campaignId }) {
  const { bootcamps: api, interviews } = useAdminApi()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [editing, setEditing] = useState(null)
  const [placement, setPlacement] = useState({})
  const [search, setSearch] = useState("")
  const [bootcampFilter, setBootcampFilter] = useState("all")
  const [decisionFilter, setDecisionFilter] = useState("all")
  const [confirm, setConfirm] = useState(null)
  const [reload, setReload] = useState(0)
  const [view, setView] = useState("bootcamps")
  const refresh = () => setReload((value) => value + 1)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    api.detail(formation, campaignId, { signal: controller.signal })
      .then(({ data: result }) => {
        if (controller.signal.aborted) return
        setData(result)
        setPlacement(Object.fromEntries(result.candidates.map((row) => [row.candidate_id, row.bootcamp_id || ""])))
      })
      .catch((failure) => { if (!controller.signal.aborted) setError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [api, campaignId, formation, reload])

  const bootcampsById = useMemo(() => Object.fromEntries((data?.bootcamps || []).map((item) => [item.id, item])), [data])
  const drafts = (data?.bootcamps || []).filter((item) => item.status === "draft")
  const changed = (data?.candidates || []).filter((row) => (row.bootcamp_id || "") !== (placement[row.candidate_id] || ""))
  const unplaced = (data?.candidates || []).filter((row) => !placement[row.candidate_id]).length
  const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  const terms = normalize(search).split(/\s+/).filter(Boolean)
  const visibleCandidates = (data?.candidates || []).filter((row) => {
    const place = placement[row.candidate_id] || ""
    if (bootcampFilter === "none" ? place : bootcampFilter !== "all" && place !== bootcampFilter) return false
    if (decisionFilter !== "all" && (row.decision || "") !== decisionFilter) return false
    const haystack = normalize([row.first_name, row.last_name, row.email, row.phone].join(" "))
    return terms.every((term) => haystack.includes(term))
  })
  const filtersActive = Boolean(search) || bootcampFilter !== "all" || decisionFilter !== "all"

  async function act(task, message) {
    setBusy(true)
    setError("")
    setNotice("")
    setConfirm(null)
    try {
      const result = await task()
      setNotice(typeof message === "function" ? message(result) : message)
      refresh()
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  function savePlacement() {
    const touched = new Set(changed.flatMap((row) => [row.bootcamp_id, placement[row.candidate_id]]).filter(Boolean))
    return act(async () => {
      // Two passes: withdraw the leaving candidates everywhere, then add the newcomers, so that a candidate
      // moved between two Bootcamps is never counted in both.
      const members = (id, field) => data.candidates.filter((row) => (field === "before" ? row.bootcamp_id : placement[row.candidate_id]) === id).map((row) => row.candidate_id)
      const revisions = Object.fromEntries([...touched].map((id) => [id, bootcampsById[id].revision]))
      for (const id of touched) {
        const before = members(id, "before")
        const kept = before.filter((candidate) => placement[candidate] === id)
        if (kept.length !== before.length) {
          await api.setParticipants(id, { candidate_ids: kept, revision: revisions[id] })
          revisions[id] += 1
        }
      }
      for (const id of touched) {
        const after = members(id, "after")
        if (after.some((candidate) => !data.candidates.find((row) => row.candidate_id === candidate && row.bootcamp_id === id))) {
          await api.setParticipants(id, { candidate_ids: after, revision: revisions[id] })
        }
      }
    }, `${changed.length} affectation(s) enregistrée(s).`)
  }

  if (loading && !data) return <div role="status" className="space-y-4"><span className="sr-only">Chargement…</span><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>
  if (!data) {
    return (
      <div className="space-y-4">
        <Link href="/astrodmin/bootcamps" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" />Bootcamps</Link>
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error || "Référentiel indisponible."}</p>
      </div>
    )
  }

  const ready = data.preselection_status === "validated"
  return (
    <div className="space-y-6" aria-busy={loading}>
      <header className="space-y-3">
        <Link href="/astrodmin/bootcamps" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" />Bootcamps</Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{data.title}</h1>
            <p className="text-sm text-muted-foreground">{data.candidature_campaign.title}{data.candidature_campaign.promotion ? ` · ${data.candidature_campaign.promotion}` : ""}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading || busy}><RefreshCw className={loading ? "animate-spin" : ""} aria-hidden="true" />Actualiser</Button>
            <ValidatorImport formation={formation} importValidators={interviews.importValidators} disabled={busy || loading}
              defaultRole="coach" label="Importer des coachs"
              onImported={(message) => { setError(""); setNotice(`${message} Ils sont disponibles comme coachs dans « Nouveau Bootcamp ».`); refresh() }} />
            <Button size="sm" onClick={() => setEditing({})} disabled={!ready || busy}><Plus aria-hidden="true" />Nouveau Bootcamp</Button>
          </div>
        </div>
      </header>

      <div className="flex gap-6 border-b" role="tablist" aria-label="Sections">
        {[["bootcamps", "Bootcamps et participants"], ["results", "Résultats finaux"]].map(([value, label]) => (
          <button key={value} type="button" role="tab" aria-selected={view === value} onClick={() => setView(value)}
            className={cn("-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition", view === value ? "border-orange-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {label}
          </button>
        ))}
      </div>

      {view === "results" ? <ResultsPanel formation={formation} campaignId={campaignId} /> : <>
      {!ready ? (
        <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>La présélection des entretiens n’est pas encore validée. Validez-la dans <Link className="font-medium underline" href={`/astrodmin/entretiens/referentiels/${encodeURIComponent(formation)}${campaignId ? `?campaign_id=${encodeURIComponent(campaignId)}` : ""}`}>Entretiens → Classement</Link> pour créer les Bootcamps.</span>
        </p>
      ) : null}
      {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
      {notice ? <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-800 dark:text-emerald-300">{notice}</p> : null}

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Bootcamps · {data.bootcamps.length}</h2>
        {data.bootcamps.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.bootcamps.map((bootcamp) => (
              <BootcampCard key={bootcamp.id} bootcamp={bootcamp} busy={busy}
                onEdit={() => setEditing({ bootcamp })}
                onLaunch={() => setConfirm({ type: "launch", bootcamp })}
                onDelete={() => setConfirm({ type: "delete", bootcamp })}
                onRetry={() => act(() => api.retryInvitations(bootcamp.id), "Les convocations en échec ont été remises en file.")}
                onReopen={() => setConfirm({ type: "reopen", bootcamp })} />
            ))}
          </div>
        ) : ready ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucun Bootcamp. Créez-en un, puis répartissez les présélectionnés.</p> : null}
      </section>

      {ready ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 font-semibold"><Users className="size-4" aria-hidden="true" />Candidats présélectionnés · {data.candidates.length}</h2>
              <p className="text-sm text-muted-foreground">Chaque candidat ne peut participer qu’à un seul Bootcamp de la campagne. Les Bootcamps lancés ne peuvent plus changer de participants.{unplaced ? ` ${unplaced} candidat(s) sans Bootcamp.` : ""}</p>
            </div>
            <div className="flex gap-2">
              {changed.length ? <Button variant="ghost" size="sm" onClick={() => setPlacement(Object.fromEntries(data.candidates.map((row) => [row.candidate_id, row.bootcamp_id || ""])))} disabled={busy}>Annuler</Button> : null}
              <Button size="sm" onClick={savePlacement} disabled={busy || !changed.length}><Save aria-hidden="true" />Enregistrer l’affectation{changed.length ? ` (${changed.length})` : ""}</Button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input aria-label="Rechercher un candidat" className="pl-9" value={search} maxLength={120} onChange={(event) => setSearch(event.target.value)} placeholder="Nom, e-mail ou téléphone" />
            </div>
            <select aria-label="Filtrer par Bootcamp" className="h-10 rounded-md border bg-background px-3 text-sm" value={bootcampFilter} onChange={(event) => setBootcampFilter(event.target.value)}>
              <option value="all">Tous les Bootcamps</option>
              <option value="none">Sans Bootcamp</option>
              {data.bootcamps.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
            <select aria-label="Filtrer par décision" className="h-10 rounded-md border bg-background px-3 text-sm" value={decisionFilter} onChange={(event) => setDecisionFilter(event.target.value)}>
              <option value="all">Toutes les décisions</option>
              {Object.entries(DECISIONS).map(([value, [label]]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground" role="status">
            <span>{visibleCandidates.length} candidat(s) affiché(s) sur {data.candidates.length}</span>
            {filtersActive ? <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(""); setBootcampFilter("all"); setDecisionFilter("all") }}><X aria-hidden="true" />Effacer les filtres</Button> : null}
          </div>
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table aria-label="Affectation des candidats présélectionnés" className="min-w-[820px]">
              <TableHeader className="bg-muted/40">
                <TableRow><TableHead>Candidat</TableHead><TableHead className="text-right">Score entretien</TableHead><TableHead>Appréciation du validateur</TableHead><TableHead>Bootcamp</TableHead><TableHead>Décision du coach</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {!visibleCandidates.length ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">Aucun candidat ne correspond à ces critères.</TableCell></TableRow>
                ) : null}
                {visibleCandidates.map((row) => {
                  const current = bootcampsById[row.bootcamp_id]
                  const locked = current && current.status !== "draft"
                  const decision = row.decision ? DECISIONS[row.decision] : null
                  return (
                    <TableRow key={row.candidate_id}>
                      <TableCell><span className="font-medium capitalize">{fullName(row)}</span><span className="block text-xs text-muted-foreground">{row.email} · {row.phone}</span></TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{row.interview_score == null ? "—" : number.format(row.interview_score)}</TableCell>
                      <TableCell className="max-w-64"><span className="line-clamp-2 text-sm text-muted-foreground" title={row.validator_comment}>{row.validator_comment || "—"}</span></TableCell>
                      <TableCell>
                        {locked ? <span className="text-sm">{current.title}</span> : (
                          <select aria-label={`Bootcamp de ${fullName(row)}`} className="h-9 w-full min-w-44 rounded-md border bg-background px-2 text-sm"
                            value={placement[row.candidate_id] || ""} disabled={busy || !drafts.length}
                            onChange={(event) => setPlacement((value) => ({ ...value, [row.candidate_id]: event.target.value }))}>
                            <option value="">Aucun Bootcamp</option>
                            {drafts.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                          </select>
                        )}
                      </TableCell>
                      <TableCell>
                        {decision ? <span className={cn("whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", decision[1])}>{decision[0]}</span> : <span className="text-xs text-muted-foreground">—</span>}
                        {row.coach_comment ? <span className="mt-1 block max-w-56 truncate text-xs text-muted-foreground" title={row.coach_comment}>{row.coach_comment}</span> : null}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      ) : null}
      </>}

      <BootcampFormDialog open={Boolean(editing)} bootcamp={editing?.bootcamp} coaches={data.available_coaches}
        campaignTitle={data.candidature_campaign.title} formationTitle={data.title} onClose={() => setEditing(null)}
        onSave={async (values) => {
          if (editing.bootcamp) await api.update(editing.bootcamp.id, { ...values, revision: editing.bootcamp.revision })
          else await api.create(formation, campaignId, values)
          setNotice(editing.bootcamp ? "Bootcamp modifié." : "Bootcamp créé. Affectez-lui des participants ci-dessous.")
          setEditing(null)
          refresh()
        }} />

      <AlertDialog open={Boolean(confirm)} onOpenChange={(open) => { if (!open) setConfirm(null) }}>
        <AlertDialogContent>
          {confirm ? <>
            <AlertDialogHeader>
              <AlertDialogTitle>{{ launch: "Lancer le Bootcamp ?", delete: "Supprimer le Bootcamp ?", reopen: "Rouvrir les résultats ?" }[confirm.type]} {confirm.bootcamp.title}</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {confirm.type === "launch" ? <>
                    <p>Récapitulatif avant lancement :</p>
                    <ul className="list-disc space-y-0.5 pl-5">
                      <li>Dates : {formatDay(confirm.bootcamp.start_date)} → {formatDay(confirm.bootcamp.end_date)}</li>
                      <li>Coach : {confirm.bootcamp.coaches.map((coach) => coach.name).join(", ") || "aucun — le lancement sera refusé"}</li>
                      <li>Participants : {confirm.bootcamp.participants_count}{confirm.bootcamp.capacity ? ` / ${confirm.bootcamp.capacity}` : ""}</li>
                      <li>Lieu : {confirm.bootcamp.location || "non précisé"}</li>
                    </ul>
                    <p>Chaque participant recevra sa convocation par e-mail. Les participants et les dates ne pourront plus être modifiés.</p>
                  </> : confirm.type === "delete" ? <p>Le Bootcamp et ses affectations seront supprimés. Les candidats redeviennent disponibles.</p>
                    : <p>Le coach pourra de nouveau modifier ses décisions et devra soumettre les résultats une nouvelle fois.</p>}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                const { bootcamp } = confirm
                if (confirm.type === "launch") act(() => api.launch(bootcamp.id, { confirmed: true, revision: bootcamp.revision }), "Bootcamp lancé : les convocations sont en cours d’envoi.")
                else if (confirm.type === "delete") act(() => api.remove(bootcamp.id), "Bootcamp supprimé.")
                else act(() => api.reopen(bootcamp.id, { revision: bootcamp.revision }), "Résultats rouverts : le coach peut de nouveau les modifier.")
              }}>Confirmer</AlertDialogAction>
            </AlertDialogFooter>
          </> : null}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
