"use client"

import { useDeferredValue, useEffect, useState } from "react"
import { ArrowLeft, CalendarClock, Check, Download, FileSpreadsheet, Link2, Mail, Pencil, RefreshCw, Search, Shuffle, Upload, Users } from "lucide-react"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import TrainingName from "@/components/trainings/training-name"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import Link from "@/components/ui/interactive-link"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import InterviewQuestionBank from "../../../competences/components/interviews/interview-question-bank"
import InterviewQuestionnaire from "../../../competences/components/interviews/interview-questionnaire"
import DispatchPlanner from "./dispatch-planner"
import RankingPanel from "./ranking-panel"
import ReassignDialog from "./reassign-dialog"
import { TeamsLinkDialog, ValidatorImport } from "./validator-tools"
import ReferentialCandidateGroups, { EMAIL_STATUS, formatSchedule, nameOf, STATUS } from "./referential-candidate-groups"

const number = new Intl.NumberFormat("fr-FR")
const format = (value) => number.format(value || 0)
const initials = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "?"

async function readLinks(file) {
  if (!/\.xlsx$/i.test(file.name) || file.size > 2 * 1024 * 1024) throw new Error("Choisissez un fichier .xlsx de 2 Mo maximum.")
  const { read, utils } = await import("xlsx")
  const workbook = read(await file.arrayBuffer(), { sheetRows: 202 })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = sheet ? utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false }) : []
  if (String(rows[0]?.[0]).trim().toLowerCase() !== "lien teams") throw new Error("La première colonne doit s’appeler « Lien Teams ».")
  if (sheet["!fullref"] && utils.decode_range(sheet["!fullref"]).e.r > 200) throw new Error("Importez au maximum 200 liens.")
  const links = rows.slice(1).map((row) => String(row[0] || "").trim()).filter(Boolean)
  if (!links.length) throw new Error("Le fichier ne contient aucun lien Teams.")
  return links
}

async function downloadLinksTemplate() {
  const { utils, writeFile } = await import("xlsx")
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([["Lien Teams"]]), "Liens Teams")
  writeFile(workbook, "modele-liens-teams.xlsx")
}

const STEP_STATES = {
  done: { label: "Terminé", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300" },
  todo: { label: "À faire", className: "bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300" },
  locked: { label: "En attente", className: "bg-muted text-muted-foreground" },
}

function Step({ index, title, description, state, last, children }) {
  const status = STEP_STATES[state]
  return (
    <li className="relative flex gap-4">
      {!last ? <span aria-hidden="true" className="absolute left-4 top-10 -bottom-4 w-px bg-border" /> : null}
      <span aria-hidden="true" className={cn(
        "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border text-sm font-semibold",
        state === "done" ? "border-emerald-500 bg-emerald-500 text-white" : state === "todo" ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300" : "bg-card text-muted-foreground",
      )}>
        {state === "done" ? <Check className="size-4" /> : index}
      </span>
      <section className={cn("min-w-0 flex-1 rounded-xl border bg-card shadow-sm", state === "locked" && "opacity-80")} aria-labelledby={`step-${index}`}>
        <header className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h3 id={`step-${index}`} className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", status.className)}>{status.label}</span>
        </header>
        <div className="space-y-4 p-4 sm:p-5">{children}</div>
      </section>
    </li>
  )
}

function Kpi({ label, value, tone }) {
  return (
    <div className="min-w-0 px-4 py-3">
      <dt className="truncate text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("text-xl font-semibold tabular-nums", tone)}>{value}</dd>
    </div>
  )
}

export default function ReferentialInterviewWorkspace({ formation, initialCampaignId = "" }) {
  const { interviews } = useAdminApi()
  const [data, setData] = useState(null)
  const [campaignId, setCampaignId] = useState(initialCampaignId)
  const [activeTab, setActiveTab] = useState("organization")
  const [selected, setSelected] = useState(null)
  const [links, setLinks] = useState([])
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search.trim())
  const [reload, setReload] = useState(0)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [candidate, setCandidate] = useState(null)
  const [moving, setMoving] = useState(null)
  const [editingLink, setEditingLink] = useState(null)
  const refresh = () => setReload((value) => value + 1)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    interviews.getReferential(formation, { campaign_id: campaignId, search: deferredSearch, groups_only: true }, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setData(data) })
      .catch((failure) => { if (!controller.signal.aborted) setError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [campaignId, deferredSearch, formation, interviews, reload])

  const currentCampaign = data?.candidature_campaign
  const campaigns = data?.candidature_campaigns || []
  useEffect(() => {
    setSelected(null)
    setLinks([])
    setCandidate(null)
    setNotice("")
  }, [currentCampaign?.id])
  const storedValidators = data?.validators || []
  const selectedIds = selected || storedValidators.map((item) => item.id)
  const availableIds = data?.available_validators.map((item) => item.id) || []
  const lockedIds = storedValidators.filter((item) => item.assigned > 0).map((item) => item.id)
  const allSelected = availableIds.length > 0 && availableIds.every((id) => selectedIds.includes(id))
  const availableLinks = data?.available_links || 0
  const hasImportedLinks = availableLinks > 0 || storedValidators.some((item) => item.teams_url)
  const missingLinks = storedValidators.filter((item) => !item.teams_url).length
  const assignableLinks = storedValidators.filter((item) => item.active && !item.teams_url).length
  const eligibleRemaining = Math.max(0, (data?.eligible || 0) - (data?.eligible_assigned || 0))
  const notices = data?.notifications || {}
  const unsent = data?.remaining_to_notify || 0
  const validatorsReady = storedValidators.length > 0 && !missingLinks && storedValidators.every((item) => item.active)
  const dispatched = (data?.assigned || 0) > 0

  const stepState = {
    links: hasImportedLinks ? "done" : "todo",
    validators: validatorsReady ? "done" : hasImportedLinks ? "todo" : "locked",
    dispatch: dispatched && !eligibleRemaining ? "done" : validatorsReady ? "todo" : "locked",
    notify: dispatched && !unsent && (notices.sent || notices.queued) ? "done" : dispatched ? "todo" : "locked",
  }

  async function action(type) {
    setBusy(true)
    setError("")
    setNotice("")
    setConfirmation("")
    const payloads = {
      settings: { validators: selectedIds }, links: { links },
      notify: { confirmed: true }, retry: { confirmed: true, retry: true }, notify_validators: { confirmed: true },
    }
    try {
      const { data: result } = await interviews.updateReferential(formation, {
        action: type === "retry" ? "notify" : type, revision: data.revision, campaign_id: currentCampaign?.id, ...payloads[type],
      })
      if (type === "settings") setSelected(null)
      if (type === "links") setLinks([])
      const message = {
        settings: "Validateurs enregistrés.", links: `${result?.imported || 0} nouveau(x) lien(s) Teams enregistré(s).`,
        prepare_questions: "Banque de questions prête.",
        assign_links: `${result?.assigned || 0} lien(s) Teams attribué(s).`,
        notify: "Convocations mises en file d’envoi.", retry: "Les convocations en échec ont été remises en file.",
        notify_validators: result?.queued_now
          ? `${result.queued_now} planning(s) mis en file d’envoi.${result.unchanged ? ` ${result.unchanged} validateur(s) ont déjà reçu ce planning.` : ""}`
          : "Tous les validateurs ont déjà reçu leur planning à jour.",
      }[type]
      setNotice(message)
      refresh()
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  async function runDispatch(payload) {
    setBusy(true)
    setError("")
    setNotice("")
    try {
      const { data: result } = await interviews.updateReferential(formation, {
        action: "dispatch", revision: data.revision, campaign_id: currentCampaign?.id, ...payload,
      })
      if (!result.preview) {
        setNotice(`${result.new_assignments} candidat(s) affecté(s) avec un horaire individuel. ${result.unassigned ? `${result.unassigned} candidat(s) restent sans validateur.` : ""}`)
        refresh()
      }
      return result
    } catch (failure) {
      setError(failure.message)
      return null
    } finally {
      setBusy(false)
    }
  }

  async function selectFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setError("")
    setLinks([])
    try { setLinks(await readLinks(file)) } catch (failure) { setError(failure.message) }
  }

  const tabClass = "relative h-auto rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-1 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"

  return (
    <div className="space-y-6" aria-busy={loading}>
      <header className="space-y-4">
        <Link href="/astrodmin/entretiens" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> Entretiens
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl"><TrainingName value={formation} /></h1>
            {currentCampaign ? (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className={cn("size-2 rounded-full", currentCampaign.is_open ? "bg-emerald-500" : "bg-muted-foreground/50")} aria-hidden="true" />
                {currentCampaign.is_open ? "Inscriptions ouvertes" : "Campagne"}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {campaigns.length > 0 ? (
              <>
                <Label htmlFor="interview-candidature-campaign" className="sr-only">Campagne de candidature</Label>
                <select id="interview-candidature-campaign" className="h-9 max-w-full rounded-md border bg-background px-3 text-sm"
                  value={campaignId || currentCampaign?.id || ""} disabled={busy || loading}
                  onChange={(event) => {
                    setCampaignId(event.target.value)
                    setSearch("")
                    setError("")
                  }}>
                  {campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>
                    {campaign.title}{campaign.promotion ? ` · ${campaign.promotion}` : ""}{campaign.is_open ? " (inscriptions ouvertes)" : ""}
                  </option>)}
                </select>
              </>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => { setError(""); refresh() }} disabled={loading || busy}>
              <RefreshCw className={loading ? "animate-spin" : ""} aria-hidden="true" />Actualiser
            </Button>
          </div>
        </div>

        {data ? (
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3 lg:grid-cols-5 [&>*]:bg-card">
            <Kpi label="Candidats éligibles" value={format(data.eligible)} />
            <Kpi label="Validateurs" value={format(storedValidators.length)} />
            <Kpi label="Candidats affectés" value={format(data.assigned)} />
            <Kpi label="À affecter" value={format(eligibleRemaining)} tone={eligibleRemaining ? "text-amber-600 dark:text-amber-400" : undefined} />
            <Kpi label="Convocations envoyées" value={format(notices.sent)} />
          </dl>
        ) : loading ? <Skeleton className="h-[74px] w-full rounded-xl" /> : null}
      </header>

      {data && !currentCampaign ? <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Aucune campagne de candidature n’a encore ouvert pour ce référentiel.</p> : null}
      {error ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
      {notice ? <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-800 dark:text-emerald-300">{notice}</p> : null}

      {data && (!campaignId || campaignId === currentCampaign?.id) ? <Tabs key={currentCampaign?.id} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="organization" className={tabClass}>Organisation</TabsTrigger>
          <TabsTrigger value="candidates" className={tabClass}>
            Candidats <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs tabular-nums">{format(data.eligible)}</span>
          </TabsTrigger>
          <TabsTrigger value="questions" className={tabClass}>Questions d’entretien</TabsTrigger>
          <TabsTrigger value="ranking" className={tabClass} disabled={!data.workspace_id}>Classement</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="mt-0">
          <ol className="space-y-4">
            <Step index={1} title="Liens Teams" state={stepState.links}
              description="Importez les liens de réunion qui seront attribués aux validateurs.">
              <div className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="teams-excel" className={cn(
                  "flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-dashed px-4 py-4 transition hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-400/5",
                  (busy || !currentCampaign) && "pointer-events-none opacity-60",
                )}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted"><Upload className="size-5 text-muted-foreground" aria-hidden="true" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">Importer un fichier Excel</span>
                    <span className="block text-xs text-muted-foreground">.xlsx · 2 Mo max · colonne « Lien Teams »</span>
                  </span>
                  <input id="teams-excel" type="file" accept=".xlsx" className="sr-only" onChange={selectFile} disabled={busy || !currentCampaign} />
                </label>
                <Button variant="outline" className="h-auto sm:self-stretch" onClick={() => downloadLinksTemplate().catch((failure) => setError(failure.message))}>
                  <Download aria-hidden="true" />Modèle Excel
                </Button>
              </div>
              {links.length ? (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3 text-sm dark:border-orange-900 dark:bg-orange-400/5">
                  <FileSpreadsheet className="size-4 text-orange-700 dark:text-orange-300" aria-hidden="true" />
                  <span className="mr-auto font-medium">{links.length} lien(s) prêts à être importés</span>
                  <Button variant="ghost" size="sm" onClick={() => setLinks([])} disabled={busy}>Annuler</Button>
                  <Button size="sm" onClick={() => action("links")} disabled={busy || loading}>Enregistrer les liens</Button>
                </div>
              ) : null}
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link2 className="size-4" aria-hidden="true" />
                <span><strong className="font-semibold text-foreground tabular-nums">{format(availableLinks)}</strong> lien(s) disponible(s) pour attribution</span>
              </p>
            </Step>

            <Step index={2} title="Validateurs" state={stepState.validators}
              description="Sélectionnez les validateurs du référentiel, puis attribuez-leur un lien Teams.">
              {!hasImportedLinks ? <p className="text-sm text-muted-foreground">Importez les liens Teams pour commencer la sélection.</p> : null}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">{selectedIds.length} sélectionné(s) sur {availableIds.length}</span>
                <ValidatorImport formation={formation} importValidators={interviews.importValidators} disabled={busy || loading}
                  label="Importer validateurs / coachs"
                  onImported={(message) => { setError(""); setNotice(`${message} Cochez les validateurs puis enregistrez la sélection.`); refresh() }} />
                <Button variant="ghost" size="sm" disabled={busy || !hasImportedLinks || !availableIds.length || allSelected}
                  onClick={() => setSelected([...new Set([...lockedIds, ...availableIds])])}>
                  Tout sélectionner
                </Button>
              </div>
              {availableIds.length ? (
                <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                  {data.available_validators.map((validator) => {
                    const checked = selectedIds.includes(validator.id)
                    return (
                      <Label key={validator.id} htmlFor={`validator-${validator.id}`} className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 font-normal transition",
                        checked ? "border-orange-400 bg-orange-50/60 dark:border-orange-700 dark:bg-orange-400/5" : "hover:bg-muted/50",
                      )}>
                        <Checkbox id={`validator-${validator.id}`} checked={checked} disabled={busy || !hasImportedLinks || lockedIds.includes(validator.id)}
                          onCheckedChange={(value) => setSelected(value ? [...selectedIds, validator.id] : selectedIds.filter((id) => id !== validator.id))} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{validator.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{validator.email}</span>
                        </span>
                      </Label>
                    )
                  })}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Aucun validateur actif rattaché. Importez-les depuis Excel ci-dessus, ou associez leurs référentiels dans <a href="/astrodmin/parametres/inscription-roles-jury" className="font-medium text-orange-700 underline dark:text-orange-300">Paramètres → Utilisateurs</a>.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => action("settings")} disabled={busy || loading || selected === null}>Enregistrer la sélection</Button>
                <Button onClick={() => setConfirmation("assign_links")} disabled={busy || loading || selected !== null || !availableLinks || !assignableLinks}>
                  <Shuffle aria-hidden="true" />Attribuer les liens aléatoirement
                </Button>
              </div>
              <p className="text-sm text-muted-foreground" role="status">
                {selected !== null
                  ? "Enregistrez la sélection avant d’attribuer les liens."
                  : storedValidators.length && !assignableLinks
                    ? "Tous les validateurs ont déjà un lien Teams. Passez à la répartition des candidats ci-dessous."
                    : assignableLinks && !availableLinks
                      ? `${assignableLinks} validateur(s) sans lien : importez de nouveaux liens Teams à l’étape 1.`
                      : null}
              </p>
              {storedValidators.length ? (
                <div className="overflow-hidden rounded-lg border">
                  <Table aria-label="Liens Teams des validateurs">
                    <TableHeader className="bg-muted/40">
                      <TableRow><TableHead>Validateur</TableHead><TableHead>Lien Teams</TableHead><TableHead className="text-right">Candidats</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>{storedValidators.map((validator) => <TableRow key={validator.id}>
                      <TableCell>
                        <span className="flex items-center gap-3">
                          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">{initials(validator.name)}</span>
                          <span className="min-w-0">
                            <span className="block font-medium">{validator.name}</span>
                            {!validator.active ? <span className="block text-xs text-destructive">Non rattaché ou inactif</span> : null}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>{validator.teams_url
                        ? <a className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 hover:underline dark:bg-emerald-400/15 dark:text-emerald-300" href={validator.teams_url} target="_blank" rel="noopener noreferrer"><Link2 className="size-3" aria-hidden="true" />Lien attribué</a>
                        : <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">À attribuer</span>}
                        <Button type="button" variant="ghost" size="icon" className="ml-1 size-7 align-middle" disabled={busy || loading}
                          aria-label={`Modifier le lien Teams de ${validator.name}`} onClick={() => setEditingLink(validator)}>
                          <Pencil className="size-3.5" aria-hidden="true" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{format(validator.assigned)}</TableCell>
                    </TableRow>)}</TableBody>
                  </Table>
                </div>
              ) : null}
            </Step>

            <Step index={3} title="Répartition des candidats" state={stepState.dispatch}
              description="Les candidats sont tirés au sort, répartis équitablement et reçoivent chacun un horaire, sans chevauchement pour un même validateur.">
              <DispatchPlanner data={data} eligibleRemaining={eligibleRemaining} onRun={runDispatch}
                disabled={busy || loading || !storedValidators.length || Boolean(missingLinks) || storedValidators.some((item) => !item.active)} />
              <p className="text-sm text-muted-foreground">
                <strong className="font-semibold text-foreground tabular-nums">{format(eligibleRemaining)}</strong> candidat(s) éligible(s) en attente d’affectation.
              </p>
            </Step>

            <Step index={4} title="Convocations" state={stepState.notify} last
              description="Chaque candidat reçoit l’heure du rendez-vous et le lien Teams de son validateur.">
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ["À envoyer", unsent, "text-foreground"],
                  ["En attente", notices.queued, "text-sky-700 dark:text-sky-300"],
                  ["Envoyées", notices.sent, "text-emerald-700 dark:text-emerald-300"],
                  ["En échec", notices.failed, notices.failed ? "text-destructive" : "text-foreground"],
                ].map(([label, value, tone]) => (
                  <div key={label} className="rounded-lg bg-muted/50 px-3 py-2.5">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className={cn("text-lg font-semibold tabular-nums", tone)}>{format(value)}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap justify-end gap-2">
                {notices.failed ? <Button variant="outline" disabled={busy || loading} onClick={() => setConfirmation("retry")}>Relancer les échecs</Button> : null}
                <Button disabled={busy || loading || !unsent} onClick={() => setConfirmation("notify")}><Mail aria-hidden="true" />Envoyer les convocations</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-3">
                <CalendarClock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <p className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">Planning des validateurs</span>
                  <span className="block text-muted-foreground">
                    Chaque validateur reçoit son lien Teams et la liste de ses candidats avec leurs horaires.
                    {data.validator_notifications?.total ? ` ${format(data.validator_notifications.sent)} envoyé(s), ${format(data.validator_notifications.queued)} en attente${data.validator_notifications.failed ? `, ${format(data.validator_notifications.failed)} en échec` : ""}.` : ""}
                  </span>
                </p>
                <Button variant="outline" disabled={busy || loading || !dispatched} onClick={() => setConfirmation("notify_validators")}>
                  <Mail aria-hidden="true" />Envoyer le planning aux validateurs
                </Button>
              </div>
            </Step>
          </ol>
        </TabsContent>

        <TabsContent value="candidates" className="mt-0 space-y-4">
          <div className="relative max-w-md">
            <Label htmlFor="referential-search" className="sr-only">Rechercher un candidat</Label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="referential-search" className="pl-9" value={search} maxLength={150} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher par nom, e-mail ou téléphone" />
          </div>
          <ReferentialCandidateGroups groups={data.candidate_groups || []} formation={formation} campaignId={currentCampaign?.id} search={deferredSearch} reload={reload} onSelect={setCandidate} onReassign={setMoving} loading={loading} />
        </TabsContent>

        <TabsContent value="ranking" className="mt-0">
          {activeTab === "ranking" && data.workspace_id ? <RankingPanel formation={formation} campaignId={currentCampaign?.id} /> : null}
        </TabsContent>

        <TabsContent value="questions" className="mt-0">
          {data.workspace_id ? <InterviewQuestionBank campaignId={data.workspace_id} scope="du référentiel" /> : (
            <div className="rounded-xl border border-dashed p-8 text-center">
              {currentCampaign ? <Button type="button" disabled={busy || loading} onClick={() => action("prepare_questions")}>
                Préparer la banque de questions
              </Button> : <p className="text-sm text-muted-foreground">Choisissez une campagne de candidature pour préparer ses questions.</p>}
            </div>
          )}
        </TabsContent>
      </Tabs> : null}

      {!data && loading ? (
        <div role="status" className="space-y-4">
          <span className="sr-only">Chargement des entretiens…</span>
          <Skeleton className="h-10 w-72" />
          {[0, 1, 2].map((key) => <Skeleton key={key} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : null}

      <TeamsLinkDialog validator={editingLink} onClose={() => setEditingLink(null)} onSave={async (teamsUrl) => {
        await interviews.updateReferential(formation, {
          action: "set_link", revision: data.revision, campaign_id: currentCampaign?.id, validator_id: editingLink.id, teams_url: teamsUrl,
        })
        setNotice(`Lien Teams de ${editingLink.name} mis à jour.`)
        setEditingLink(null)
        refresh()
      }} />
      <ReassignDialog candidate={moving} validators={storedValidators.filter((item) => item.active && item.teams_url)}
        hasSchedule={Boolean(data?.schedule)} onClose={() => setMoving(null)}
        onSubmit={async (values) => {
          const { data: result } = await interviews.updateReferential(formation, {
            action: "reassign", revision: data.revision, campaign_id: currentCampaign?.id, candidate_id: moving.id, ...values,
          })
          setNotice(result.validator_id
            ? `${nameOf(moving)} est affecté(e) à ${storedValidators.find((item) => item.id === result.validator_id)?.name || "son validateur"}, le ${formatSchedule(result.at)}.`
            : `${nameOf(moving)} n’a plus de validateur.`)
          setMoving(null)
          refresh()
        }} />
      <Dialog open={Boolean(candidate)} onOpenChange={(open) => { if (!open) setCandidate(null) }}>
        <DialogContent className="flex h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl" onScroll={(event) => { if (event.currentTarget.scrollTop) event.currentTarget.scrollTop = 0 }}>
          <DialogHeader className="shrink-0 border-b px-4 py-4 pr-12 sm:px-5 sm:pr-12">
            <DialogTitle>{candidate && nameOf(candidate)}</DialogTitle>
            <DialogDescription>Consultez le dossier et l’évaluation. En tant qu’administrateur, vous pouvez compléter ou corriger la fiche, même après l’archivage de la campagne.</DialogDescription>
          </DialogHeader>
          {candidate ? <InterviewQuestionnaire key={candidate.id} adminMode allowReopen onSaved={refresh} evaluation={{
            id: candidate.evaluation_id, candidate_snapshot: candidate.candidate_snapshot, final_status: candidate.final_status,
            interview_status: STATUS[candidate.status], validator: candidate.validator || "Aucun validateur",
            invitation_status: EMAIL_STATUS[candidate.email_status] || "Non envoyée",
            slot_start_at: candidate.scheduled_at || null,
          }} /> : null}
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(confirmation)} onOpenChange={(open) => { if (!open) setConfirmation("") }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{{ assign_links: "Attribuer les liens Teams ?", notify: "Envoyer les convocations ?", retry: "Relancer les échecs ?", notify_validators: "Envoyer le planning aux validateurs ?" }[confirmation]}</AlertDialogTitle>
            <AlertDialogDescription>{{
              assign_links: `${Math.min(availableLinks, assignableLinks)} lien(s) seront répartis aléatoirement entre les validateurs sans lien.`,
              notify: `${unsent} candidat(s) recevront le lien Teams de leur validateur et l’heure du rendez-vous.`,
              retry: `${notices.failed || 0} convocation(s) en échec seront relancées.`,
              notify_validators: `${storedValidators.filter((item) => item.assigned > 0).length} validateur(s) ayant des candidats recevront leur planning. Un planning inchangé n’est pas renvoyé.`,
            }[confirmation]}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => action(confirmation)}>Confirmer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
