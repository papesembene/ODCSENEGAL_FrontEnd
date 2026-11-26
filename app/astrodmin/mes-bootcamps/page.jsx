"use client"

import { useCallback, useEffect, useState } from "react"
import { CalendarDays, CheckCircle2, MapPin, RefreshCw, Search, Send, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { educationLabel } from "@/app/odc/candidatures/education-options"
import { BOOTCAMP_STATUS, DECISIONS } from "../bootcamps/[formation]/bootcamp-workspace"

const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 })
const day = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
const formatDay = (value) => (value ? day.format(new Date(`${value}T00:00:00Z`)) : "")
const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
const SORTS = {
  name: ["Nom (A → Z)", (a, b) => fullName(a).localeCompare(fullName(b), "fr")],
  score_desc: ["Score d’entretien décroissant", (a, b) => (b.interview_score ?? -1) - (a.interview_score ?? -1)],
  score_asc: ["Score d’entretien croissant", (a, b) => (a.interview_score ?? 999) - (b.interview_score ?? 999)],
  pending_first: ["À évaluer d’abord", (a, b) => Number(b.decision === "pending") - Number(a.decision === "pending") || fullName(a).localeCompare(fullName(b), "fr")],
}
const fullName = (row) => [row?.first_name, row?.last_name].filter(Boolean).join(" ") || row?.email || "Candidat"

function DecisionDialog({ participant, editable, onClose, onSave }) {
  const [decision, setDecision] = useState("pending")
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!participant) return
    setDecision(participant.decision)
    setComment(participant.coach_comment || "")
    setError("")
  }, [participant])

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError("")
    try { await onSave({ decision, comment }) } catch (failure) { setError(failure.message) } finally { setSaving(false) }
  }

  const facts = participant ? [
    ["E-mail", participant.email], ["Téléphone", participant.phone], ["Niveau d’études", educationLabel(participant.education_level)],
    ["Parcours / spécialité", participant.speciality], ["Structure", participant.current_structure],
    ["Région", participant.region_of_residence], ["Site de formation", participant.training_site_name],
  ].filter(([, value]) => value) : []

  return (
    <Dialog open={Boolean(participant)} onOpenChange={(open) => { if (!open && !saving) onClose() }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="capitalize">{fullName(participant)}</DialogTitle>
            <DialogDescription>Fiche de l’apprenant, résultat de l’entretien et décision du Bootcamp.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <dl className="space-y-2 rounded-lg border p-3 text-sm">
              {facts.map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div>)}
            </dl>
            <div className="space-y-3 rounded-lg border p-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Score de l’entretien</p>
                <p className="text-2xl font-semibold tabular-nums text-orange-600 dark:text-orange-400">{participant?.interview_score == null ? "—" : `${number.format(participant.interview_score)}/100`}</p>
                {participant?.interview_scores ? <p className="text-xs text-muted-foreground">Technique {number.format(participant.interview_scores.technique ?? 0)} · Motivation {number.format(participant.interview_scores.motivation ?? 0)} · Social {number.format(participant.interview_scores.social ?? 0)}</p> : null}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Appréciation du validateur</p>
                <p className="whitespace-pre-wrap">{participant?.validator_comment || "—"}</p>
              </div>
            </div>
          </div>
          <fieldset disabled={!editable || saving} className="space-y-3">
            <legend className="text-sm font-medium">Décision finale</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(DECISIONS).map(([value, [label]]) => (
                <label key={value} className={cn("relative flex cursor-pointer items-center justify-center rounded-lg border px-2 py-2 text-center text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-500",
                  decision === value ? "border-orange-500 bg-orange-50 font-medium dark:bg-orange-400/10" : "hover:bg-muted/50")}>
                  <input type="radio" className="sr-only" name="bootcamp-decision" value={value} checked={decision === value} onChange={() => setDecision(value)} />{label}
                </label>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coach-comment">Appréciation du coach</Label>
              <Textarea id="coach-comment" rows={4} maxLength={3000} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Assiduité, progression, travail en équipe…" />
            </div>
          </fieldset>
          {!editable ? <p className="text-sm text-muted-foreground">Les résultats de ce Bootcamp sont soumis : la fiche est en lecture seule.</p> : null}
          {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Fermer</Button>
            {editable ? <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button> : null}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function CoachBootcampsPage() {
  const { bootcamps: api } = useAdminApi()
  const [dashboard, setDashboard] = useState(null)
  const [selectedId, setSelectedId] = useState("")
  const [bootcamp, setBootcamp] = useState(null)
  const [participant, setParticipant] = useState(null)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("pending_first")
  const [withComment, setWithComment] = useState("all")
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const loadDashboard = useCallback(() => {
    setLoading(true)
    return api.coachList().then(({ data }) => {
      setDashboard(data)
      setSelectedId((current) => (data.bootcamps.some((item) => item.id === current) ? current : data.bootcamps[0]?.id || ""))
    }).catch((failure) => setError(failure.message)).finally(() => setLoading(false))
  }, [api])

  const loadBootcamp = useCallback(() => {
    if (!selectedId) { setBootcamp(null); return Promise.resolve() }
    return api.coachGet(selectedId).then(({ data }) => setBootcamp(data)).catch((failure) => setError(failure.message))
  }, [api, selectedId])

  useEffect(() => { loadDashboard() }, [loadDashboard])
  useEffect(() => { loadBootcamp() }, [loadBootcamp])

  const refresh = () => { setError(""); loadDashboard(); loadBootcamp() }
  const editable = bootcamp?.status === "launched"
  const terms = normalize(search).split(/\s+/).filter(Boolean)
  const rows = (bootcamp?.participants || [])
    .filter((row) => filter === "all" || row.decision === filter)
    .filter((row) => withComment === "all" || (withComment === "with" ? Boolean(row.coach_comment) : !row.coach_comment))
    .filter((row) => {
      const haystack = normalize([row.first_name, row.last_name, row.email, row.phone, row.candidate_id].join(" "))
      return terms.every((term) => haystack.includes(term))
    })
    .sort(SORTS[sort][1])
  const filtersActive = Boolean(search) || filter !== "all" || withComment !== "all"
  const totals = dashboard?.totals || {}

  if (loading && !dashboard) return <div role="status" className="space-y-4 p-4 sm:p-6 md:p-8"><span className="sr-only">Chargement…</span><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mes bootcamps</h1>
          <p className="text-sm text-muted-foreground">{dashboard?.referentials?.length ? dashboard.referentials.join(" · ") : "Évaluez les apprenants de vos Bootcamps et rendez votre décision."}</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} aria-hidden="true" />Actualiser</Button>
      </header>

      {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
      {notice ? <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-800 dark:text-emerald-300">{notice}</p> : null}

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-5 [&>*]:bg-card">
        {[["Bootcamps", dashboard?.bootcamps.length || 0, ""], ["À évaluer", totals.to_evaluate || 0, "text-sky-700 dark:text-sky-300"], ["Évalués", totals.evaluated || 0, ""],
          ["Retenus", totals.retained || 0, "text-emerald-700 dark:text-emerald-300"], ["Liste d’attente", totals.waiting_list || 0, "text-amber-700 dark:text-amber-300"]].map(([label, value, tone]) => (
          <div key={label} className="px-4 py-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className={cn("text-xl font-semibold tabular-nums", tone)}>{value}</dd></div>
        ))}
      </dl>

      {!dashboard?.bootcamps.length ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Aucun Bootcamp lancé ne vous est attribué pour le moment.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Mes Bootcamps">
            {dashboard.bootcamps.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={item.id === selectedId} onClick={() => { setSelectedId(item.id); setFilter("all"); setSearch(""); setWithComment("all") }}
                className={cn("rounded-lg border px-3 py-2 text-left text-sm transition", item.id === selectedId ? "border-orange-500 bg-orange-50 dark:bg-orange-400/10" : "bg-card hover:bg-muted/50")}>
                <span className="block font-medium">{item.title}</span>
                <span className="block text-xs text-muted-foreground">{item.formation_title} · {item.decisions.pending} à évaluer</span>
              </button>
            ))}
          </div>

          {bootcamp ? (
            <section className="space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{bootcamp.title}</h2>
                  <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden="true" />{formatDay(bootcamp.start_date)} → {formatDay(bootcamp.end_date)}</span>
                    {bootcamp.location ? <span className="flex items-center gap-1"><MapPin className="size-3.5" aria-hidden="true" />{bootcamp.location}</span> : null}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", BOOTCAMP_STATUS[bootcamp.status][1])}>{BOOTCAMP_STATUS[bootcamp.status][0]}</span>
                  {editable ? <Button size="sm" disabled={bootcamp.decisions.pending > 0} onClick={() => setConfirm(true)}
                    title={bootcamp.decisions.pending ? "Donnez une décision à chaque apprenant avant de soumettre." : undefined}>
                    <Send aria-hidden="true" />Soumettre les résultats
                  </Button> : null}
                </div>
              </div>
              {bootcamp.status === "submitted" ? <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="size-4" aria-hidden="true" />Résultats soumis. L’administration se charge de la notification des candidats.</p>
                : bootcamp.decisions.pending ? <p className="text-sm text-muted-foreground">{bootcamp.decisions.pending} apprenant(s) sans décision. Les décisions restent modifiables jusqu’à la soumission.</p> : null}

              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer par décision">
                {[["all", "Tous", bootcamp.participants.length], ...Object.entries(DECISIONS).map(([value, [label]]) => [value, label, bootcamp.decisions[value]])].map(([value, label, count]) => (
                  <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value}
                    className={cn("rounded-full border px-3 py-1 text-sm transition", filter === value ? "border-orange-500 bg-orange-50 font-medium text-orange-800 dark:bg-orange-400/10 dark:text-orange-200" : "hover:bg-muted")}>
                    {label} <span className="tabular-nums text-muted-foreground">{count}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input aria-label="Rechercher un apprenant" className="pl-9" value={search} maxLength={120}
                    onChange={(event) => setSearch(event.target.value)} placeholder="Nom, e-mail, téléphone ou identifiant" />
                </div>
                <select aria-label="Appréciation du coach" className="h-10 rounded-md border bg-background px-3 text-sm" value={withComment} onChange={(event) => setWithComment(event.target.value)}>
                  <option value="all">Toutes les appréciations</option>
                  <option value="with">Avec appréciation</option>
                  <option value="without">Sans appréciation</option>
                </select>
                <select aria-label="Trier" className="h-10 rounded-md border bg-background px-3 text-sm" value={sort} onChange={(event) => setSort(event.target.value)}>
                  {Object.entries(SORTS).map(([value, [label]]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground" role="status">
                <span>{rows.length} apprenant(s) affiché(s) sur {bootcamp.participants.length}</span>
                {filtersActive ? <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(""); setFilter("all"); setWithComment("all") }}><X aria-hidden="true" />Effacer les filtres</Button> : null}
              </div>

              <ul className="space-y-2">
                {rows.map((row) => {
                  const [label, tone] = DECISIONS[row.decision]
                  return (
                    <li key={row.candidate_id} className="flex flex-wrap items-center gap-3 rounded-xl border p-3 sm:flex-nowrap">
                      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-orange-100 text-sm font-semibold text-orange-800 dark:bg-orange-400/15 dark:text-orange-300">
                        {fullName(row).split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0] || "").join("").toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium capitalize">{fullName(row)}</p>
                        <p className="truncate text-sm text-muted-foreground">{[row.email, row.phone].filter(Boolean).join(" · ")}</p>
                        {row.coach_comment ? <p className="truncate text-xs text-muted-foreground" title={row.coach_comment}>« {row.coach_comment} »</p> : null}
                      </div>
                      <span className="hidden text-right sm:block"><span className="block text-xs text-muted-foreground">Entretien</span><span className="font-semibold tabular-nums">{row.interview_score == null ? "—" : `${number.format(row.interview_score)}/100`}</span></span>
                      <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", tone)}>{label}</span>
                      <Button size="sm" variant={editable && row.decision === "pending" ? "default" : "outline"} onClick={() => setParticipant(row)}>
                        {editable ? (row.decision === "pending" ? "Évaluer" : "Modifier") : "Consulter"}
                      </Button>
                    </li>
                  )
                })}
                {!rows.length ? <li className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Aucun apprenant ne correspond à ces critères.</li> : null}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <DecisionDialog participant={participant} editable={editable} onClose={() => setParticipant(null)} onSave={async (values) => {
        await api.coachDecide(bootcamp.id, participant.candidate_id, values)
        setNotice(`Décision enregistrée pour ${fullName(participant)}.`)
        setParticipant(null)
        refresh()
      }} />

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Soumettre les résultats de {bootcamp?.title} ?</AlertDialogTitle>
            <AlertDialogDescription>
              {bootcamp ? `${bootcamp.decisions.retained} retenu(s), ${bootcamp.decisions.waiting_list} en liste d’attente, ${bootcamp.decisions.rejected} non retenu(s). ` : ""}
              Après soumission, vos décisions ne seront plus modifiables. Aucun e-mail n’est envoyé aux candidats : l’administration décide de la notification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              try {
                await api.coachSubmit(bootcamp.id, { confirmed: true })
                setNotice("Résultats soumis.")
                refresh()
              } catch (failure) { setError(failure.message) }
            }}>Soumettre</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
