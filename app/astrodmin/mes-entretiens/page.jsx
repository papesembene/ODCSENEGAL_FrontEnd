"use client"

import { CalendarClock, Clock, Play, RefreshCw, Search, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InterviewPagination, InterviewSelect } from "../competences/components/interviews/interview-workspace-ui"
import useMyInterviews from "./hooks/use-my-interviews"
import InterviewEvaluationTable from "./components/interview-evaluation-table"
import InterviewQuestionsSidebar from "./components/interview-questions-sidebar"
import CoachOpinionDialog from "./components/coach-opinion-dialog"
import InterviewQuestionnaire from "../competences/components/interviews/interview-questionnaire"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { getCandidateName } from "../competences/components/interviews/interview-presentation"

const CANDIDATE_STATUS = {
  planned: { label: "Planifié", tone: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300" },
  convened: { label: "Convoqué", tone: "bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300" },
  draft: { label: "En cours", tone: "bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300" },
  validated: { label: "Évalué", tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300" },
  absent: { label: "Absent", tone: "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-300" },
}
const STATUS_FILTERS = [["all", "Tous"], ["planned", "Planifiés"], ["convened", "Convoqués"], ["draft", "En cours"], ["validated", "Évalués"], ["absent", "Absents"]]
const statusKey = (evaluation) => {
  if (CANDIDATE_STATUS[evaluation.questionnaire_status]) return evaluation.questionnaire_status
  return evaluation.invitation_sent ? "convened" : "planned"
}
const timeFormat = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
const formatTime = (value) => (value ? timeFormat.format(new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`)) : null)

export default function MyInterviewsPage() {
  const workspace = useMyInterviews()
  const [questionnaireCandidateId, setQuestionnaireCandidateId] = useState("")
  const {
    interviews, selectedSlot, campaignSlots, evaluations, roles,
    activeEvaluation, coachEvaluation, currentAdminId, currentAdminName, now,
  } = workspace
  const showQuestions = roles.includes("Filtreur") || roles.includes("Validateur")
  const directCampaign = Boolean(interviews.selectedCampaign?.uses_questionnaire || interviews.selectedCampaign?.candidature_campaign_id)
  const archived = Boolean(interviews.selectedCampaign?.candidature_archived)
  const canEvaluate = roles.includes("Validateur")
  const questionnaireCandidate = canEvaluate ? evaluations.find((item) => item.id === questionnaireCandidateId) : null

  const statusFilter = interviews.directStatusFilter
  const counts = interviews.evaluationSummary?.direct || {}
  const totalAssigned = Object.values(counts).reduce((sum, value) => sum + value, 0)
  const slotRange = (() => {
    const opens = selectedSlot?.access?.filter_opens_at
    const closes = selectedSlot?.access?.filter_closes_at
    if (!opens || !closes) return null
    const options = { timeZone: "Africa/Dakar" }
    const day = (value) => new Date(value).toLocaleDateString("fr-FR", { ...options, weekday: "long", day: "numeric", month: "long" })
    const hour = (value) => new Date(value).toLocaleTimeString("fr-FR", { ...options, hour: "2-digit", minute: "2-digit" })
    return day(opens) === day(closes)
      ? `${day(opens)} · ${hour(opens)} – ${hour(closes)}`
      : `Du ${day(opens)} ${hour(opens)} au ${day(closes)} ${hour(closes)}`
  })()

  if (interviews.initialLoading) {
    return <div className="flex justify-center p-16" role="status">
      <CalendarClock className="h-6 w-6 animate-spin text-orange-600" />
      <span className="sr-only">Chargement des entretiens</span>
    </div>
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-5 p-4 sm:p-6 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mes entretiens</h1>
          <p className="mt-1 text-sm text-muted-foreground">Retrouvez vos candidats, rejoignez votre réunion Teams et menez les évaluations.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={workspace.refresh} disabled={interviews.loading}>
          <RefreshCw className={interviews.loading ? "animate-spin" : ""} aria-hidden="true" />Actualiser
        </Button>
      </header>

      {interviews.bootstrapError ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {interviews.bootstrapError}. Utilisez Actualiser pour réessayer.
        </div>
      ) : null}

      <section className="min-w-0 overflow-hidden rounded-xl border bg-card">
        <div className="grid gap-3 border-b p-4 md:grid-cols-[1fr_1fr_minmax(200px,1fr)]">
          <InterviewSelect id="jury-campaign" label="Référentiel"
            value={interviews.selectedCampaignId}
            onChange={(value) => {
              interviews.setSelectedCampaignId(value)
              interviews.setSlotFilter("__none__")
              interviews.setPage(1)
              workspace.setCoachCandidateId("")
            }}
            placeholder="Aucune campagne accessible"
            options={interviews.campaigns.filter((campaign) =>
              workspace.assignedSlots.some((slot) => slot.campaign_id === campaign.id)
            ).map((campaign) => ({ value: campaign.id, label: `${campaign.name}${campaign.candidature_archived ? " · archivée" : ""}` }))} />
          <InterviewSelect id="jury-slot" label="Créneau" value={selectedSlot?.id || ""}
            onChange={(value) => {
              interviews.setSlotFilter(value)
              interviews.setPage(1)
              workspace.setCoachCandidateId("")
            }}
            placeholder="Aucun créneau accessible"
            options={campaignSlots.map((slot) => ({ value: slot.id, label: slot.label }))} />
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="jury-search" className="text-xs text-muted-foreground">Rechercher un candidat</Label>
            <div className="relative">
              <Search aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="jury-search" className="pl-9" value={interviews.searchTerm}
                onChange={(event) => interviews.setSearchTerm(event.target.value)}
                placeholder="Nom, email ou téléphone" disabled={!selectedSlot} />
            </div>
          </div>
        </div>

        {!selectedSlot ? (
          <div className="p-8 text-center text-sm text-muted-foreground" role="status">
            Aucun créneau accessible actuellement. Pour le rôle filtreur, l'accès s'ouvre à l'heure de début et se ferme à l'heure de fin.
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-orange-200 bg-orange-50/60 p-4 dark:border-orange-900 dark:bg-orange-400/5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-500 text-white"><Video className="size-5" aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{selectedSlot.label}</span>
                  {roles.map((role) => <Badge key={role} variant="outline" className="bg-background">{role}</Badge>)}
                </div>
                {slotRange ? <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-3.5" aria-hidden="true" /><span className="first-letter:uppercase">{slotRange}</span>
                </p> : null}
              </div>
              <span className="text-sm text-muted-foreground" role="status">
                {interviews.evaluationsLoading ? "Chargement…" : `${totalAssigned} candidat(s)`}
              </span>
              {selectedSlot.teams_url ? <Button asChild>
                <a href={selectedSlot.teams_url} target="_blank" rel="noopener noreferrer"><Video aria-hidden="true" />Rejoindre ma réunion Teams</a>
              </Button> : null}
            </div>

            {interviews.evaluationsError ? (
              <p role="alert" className="text-sm text-red-700">{interviews.evaluationsError}</p>
            ) : null}

            {directCampaign ? <>
              {archived ? (
                <p role="status" className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
                  Cette campagne est archivée : vous pouvez consulter vos candidats et vos évaluations, mais plus les modifier.
                </p>
              ) : null}
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4 [&>*]:bg-card">
                {[
                  ["Candidats affectés", totalAssigned, ""],
                  ["À évaluer", (counts.planned || 0) + (counts.convened || 0) + (counts.draft || 0), "text-sky-700 dark:text-sky-300"],
                  ["Évalués", counts.validated || 0, "text-emerald-700 dark:text-emerald-300"],
                  ["Absents", counts.absent || 0, "text-red-700 dark:text-red-300"],
                ].map(([label, value, tone]) => <div key={label} className="px-4 py-3">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className={cn("text-xl font-semibold tabular-nums", tone)}>{value}</dd>
                </div>)}
              </dl>

              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer par statut">
                {STATUS_FILTERS.map(([key, label]) => {
                  const count = key === "all" ? totalAssigned : counts[key] || 0
                  return <button key={key} type="button" onClick={() => interviews.setDirectStatusFilter(key)} aria-pressed={statusFilter === key}
                    className={cn("rounded-full border px-3 py-1 text-sm transition",
                      statusFilter === key ? "border-orange-500 bg-orange-50 font-medium text-orange-800 dark:bg-orange-400/10 dark:text-orange-200" : "hover:bg-muted")}>
                    {label} <span className="tabular-nums text-muted-foreground">{count}</span>
                  </button>
                })}
              </div>

              <ul className="space-y-2" aria-label="Candidats affectés" aria-busy={interviews.evaluationsLoading}>
                {evaluations.map((evaluation) => {
                  const key = statusKey(evaluation)
                  const status = CANDIDATE_STATUS[key]
                  const name = getCandidateName(evaluation)
                  const score = evaluation.questionnaire_scores?.global
                  return <li key={evaluation.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 shadow-sm transition hover:border-orange-200 sm:flex-nowrap sm:p-4 dark:hover:border-orange-900">
                    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-orange-100 text-sm font-semibold text-orange-800 dark:bg-orange-400/15 dark:text-orange-300">
                      {name.split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0] || "").join("").toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium capitalize">{name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {[evaluation.candidate_snapshot?.email, evaluation.candidate_snapshot?.phone].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {formatTime(evaluation.scheduled_at) ? <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-sm font-medium tabular-nums">
                      <Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />{formatTime(evaluation.scheduled_at)}
                    </span> : null}
                    {score != null ? <span className="hidden text-right sm:block">
                      <span className="block text-xs text-muted-foreground">Score</span>
                      <span className="font-semibold tabular-nums">{score}/100</span>
                    </span> : null}
                    <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", status.tone)}>{status.label}</span>
                    {canEvaluate ? <Button size="sm" variant={archived || key === "validated" || key === "absent" ? "outline" : "default"} className="shrink-0" onClick={() => setQuestionnaireCandidateId(evaluation.id)}>
                      {archived ? "Consulter" : key === "planned" || key === "convened" ? <><Play aria-hidden="true" />Démarrer</> : key === "draft" ? <><Play aria-hidden="true" />Reprendre</> : "Consulter"}
                    </Button> : null}
                  </li>
                })}
                {!interviews.evaluationsLoading && !evaluations.length ? <li className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  {statusFilter !== "all" ? "Aucun candidat avec ce statut." : "Aucun candidat trouvé pour ce créneau."}
                </li> : null}
              </ul>
              <InterviewPagination interviews={interviews} />
            </> : <div className={showQuestions ? "grid min-w-0 gap-4 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]" : "min-w-0"}>
              {showQuestions ? (
                <aside className="order-last min-w-0 lg:order-first">
                  <InterviewQuestionsSidebar questions={interviews.selectedCampaign?.filter_questions || []}
                    selectedEvaluation={activeEvaluation} showTestResults={!interviews.selectedCampaign?.candidature_campaign_id} />
                </aside>
              ) : null}
              <div className="min-w-0 space-y-3" aria-busy={interviews.evaluationsLoading}>
                <InterviewEvaluationTable
                  activeEvaluationId={activeEvaluation?.id || ""} assignedSlots={workspace.assignedSlots}
                  currentAdminId={currentAdminId} currentAdminName={currentAdminName}
                  evaluations={evaluations} inlineDrafts={workspace.inlineDrafts}
                  showTestScore={!interviews.selectedCampaign?.candidature_campaign_id}
                  onOpenCoachOpinion={(evaluation) => workspace.setCoachCandidateId(evaluation.id)}
                  onSelectEvaluation={workspace.setActiveCandidateId} onSave={workspace.saveInline}
                  savingEvaluationId={workspace.savingEvaluationId} scorecardConfig={workspace.scorecard}
                  setDrafts={workspace.setInlineDrafts} submitting={interviews.submitting} now={now} />
                <InterviewPagination interviews={interviews} />
              </div>
            </div>}
          </div>
        )}
      </section>

      <CoachOpinionDialog evaluation={coachEvaluation} open={Boolean(coachEvaluation)}
        onOpenChange={(open) => { if (!open) workspace.setCoachCandidateId("") }}
        onSave={workspace.saveCoachOpinion} submitting={interviews.submitting} />
      <Dialog open={directCampaign && Boolean(questionnaireCandidate)} onOpenChange={(open) => { if (!open) setQuestionnaireCandidateId("") }}>
        {/* The dialog itself never scrolls (its columns do); undo any scroll forced by the browser on focus. */}
        <DialogContent className="flex h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl" onScroll={(event) => { if (event.currentTarget.scrollTop) event.currentTarget.scrollTop = 0 }}>
          <DialogHeader className="shrink-0 border-b px-4 py-4 pr-12 sm:px-5 sm:pr-12">
            <DialogTitle>Évaluation · {questionnaireCandidate ? getCandidateName(questionnaireCandidate) : ""}</DialogTitle>
            <DialogDescription>Posez les questions oralement sur Teams, puis sélectionnez la réponse donnée par le candidat.</DialogDescription>
          </DialogHeader>
          {questionnaireCandidate ? <InterviewQuestionnaire key={questionnaireCandidate.id} evaluation={questionnaireCandidate} onSaved={interviews.fetchEvaluations} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
