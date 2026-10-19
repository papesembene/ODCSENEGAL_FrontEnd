"use client"

import { CalendarClock, RefreshCw, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InterviewPagination, InterviewSelect } from "../competences/components/interviews/interview-workspace-ui"
import useMyInterviews from "./hooks/use-my-interviews"
import InterviewEvaluationTable from "./components/interview-evaluation-table"
import InterviewQuestionsSidebar from "./components/interview-questions-sidebar"
import CoachOpinionDialog from "./components/coach-opinion-dialog"

export default function MyInterviewsPage() {
  const workspace = useMyInterviews()
  const {
    interviews, selectedSlot, campaignSlots, evaluations, roles,
    activeEvaluation, coachEvaluation, currentAdminId, currentAdminName, now,
  } = workspace
  const showQuestions = roles.includes("Filtreur") || roles.includes("Validateur")

  if (interviews.initialLoading) {
    return <div className="flex justify-center p-16" role="status">
      <CalendarClock className="h-6 w-6 animate-spin text-orange-600" />
      <span className="sr-only">Chargement des entretiens</span>
    </div>
  }

  return (
    <div className="min-w-0 space-y-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mes entretiens</h1>
          <p className="mt-1 text-sm text-muted-foreground">Votre tableau de travail par référentiel et créneau.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={workspace.refresh} disabled={interviews.loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${interviews.loading ? "animate-spin" : ""}`} />Actualiser
        </Button>
      </header>

      {interviews.bootstrapError ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {interviews.bootstrapError}. Utilisez Actualiser pour réessayer.
        </div>
      ) : null}

      <section className="min-w-0 overflow-hidden rounded-xl border bg-card">
        <div className="grid gap-3 border-b p-4 md:grid-cols-[1fr_1fr_minmax(200px,1fr)]">
          <InterviewSelect id="jury-campaign" label="Référentiel / campagne"
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
            ).map((campaign) => ({ value: campaign.id, label: `${campaign.formation} - ${campaign.name}` }))} />
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
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{selectedSlot.label}</span>
                {roles.map((role) => <Badge key={role} variant="outline">{role}</Badge>)}
                <span className="text-muted-foreground">
                  {selectedSlot.access?.filter_opens_at && selectedSlot.access?.filter_closes_at
                    ? `${new Date(selectedSlot.access.filter_opens_at).toLocaleString("fr-FR", { timeZone: "Africa/Dakar", dateStyle: "short", timeStyle: "short" })} – ${new Date(selectedSlot.access.filter_closes_at).toLocaleTimeString("fr-FR", { timeZone: "Africa/Dakar", hour: "2-digit", minute: "2-digit" })}`
                    : ""}
                </span>
              </div>
              <span className="text-xs text-muted-foreground" role="status">
                {interviews.evaluationsLoading ? "Chargement…" : `${interviews.pagination.total} candidat(s)`}
              </span>
            </div>

            {interviews.evaluationsError ? (
              <p role="alert" className="text-sm text-red-700">{interviews.evaluationsError}</p>
            ) : null}

            <div className={showQuestions ? "grid min-w-0 gap-4 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]" : "min-w-0"}>
              {showQuestions ? (
                <aside className="order-last min-w-0 lg:order-first">
                  <InterviewQuestionsSidebar questions={interviews.selectedCampaign?.filter_questions || []}
                    selectedEvaluation={activeEvaluation} />
                </aside>
              ) : null}
              <div className="min-w-0 space-y-3" aria-busy={interviews.evaluationsLoading}>
                <InterviewEvaluationTable
                  activeEvaluationId={activeEvaluation?.id || ""} assignedSlots={workspace.assignedSlots}
                  currentAdminId={currentAdminId} currentAdminName={currentAdminName}
                  evaluations={evaluations} inlineDrafts={workspace.inlineDrafts}
                  onOpenCoachOpinion={(evaluation) => workspace.setCoachCandidateId(evaluation.id)}
                  onSelectEvaluation={workspace.setActiveCandidateId} onSave={workspace.saveInline}
                  savingEvaluationId={workspace.savingEvaluationId} scorecardConfig={workspace.scorecard}
                  setDrafts={workspace.setInlineDrafts} submitting={interviews.submitting} now={now} />
                <InterviewPagination interviews={interviews} />
              </div>
            </div>
          </div>
        )}
      </section>

      <CoachOpinionDialog evaluation={coachEvaluation} open={Boolean(coachEvaluation)}
        onOpenChange={(open) => { if (!open) workspace.setCoachCandidateId("") }}
        onSave={workspace.saveCoachOpinion} submitting={interviews.submitting} />
    </div>
  )
}
