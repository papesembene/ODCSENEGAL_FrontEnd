"use client"

import { useState } from "react"
import { CalendarClock, ClipboardCheck, ClipboardList, Loader2, Plus, RefreshCw, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useCompetencesInterviews from "../hooks/use-competences-interviews"
import CompetencesInterviewEvaluationDialog from "./competences-interview-evaluation-dialog"
import InterviewCampaignPanel, { InterviewCampaignDialog } from "./interviews/interview-campaign-panel"
import InterviewSlotsPanel from "./interviews/interview-slots-panel"
import InterviewEvaluationsPanel from "./interviews/interview-evaluations-panel"
import InterviewDecisionsPanel from "./interviews/interview-decisions-panel"
import InterviewPlanningDialog from "./interviews/interview-planning-dialog"
import { InterviewSelect } from "./interviews/interview-workspace-ui"
import { getFormationLabel } from "./interviews/interview-presentation"

const WORKSPACE_TABS = [
  { value: "campaigns", label: "Critères", icon: ClipboardList },
  { value: "slots", label: "Créneaux et jurys", icon: CalendarClock },
  { value: "evaluations", label: "Évaluations", icon: Users },
  { value: "final-decision", label: "Décisions", icon: ClipboardCheck },
]
const CAMPAIGN_STATUS = { active: "Active", draft: "Brouillon", closed: "Clôturée", archived: "Archivée" }

export default function CompetencesInterviewsTab() {
  const interviews = useCompetencesInterviews()
  const [activeTab, setActiveTab] = useState("evaluations")
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false)
  const [planningOpen, setPlanningOpen] = useState(false)
  const [selectedEvaluationId, setSelectedEvaluationId] = useState("")
  const selectedEvaluation = interviews.evaluations.find((item) => item.id === selectedEvaluationId) || null

  const changeCampaign = (id) => {
    setSelectedEvaluationId("")
    interviews.setSelectedCampaignId(id)
    interviews.setSearchTerm("")
    interviews.setStatusFilter("all")
    interviews.setProgressFilter("all")
    interviews.setCompletionFilter("all")
    interviews.setSlotForm({ label: "", start_at: "", end_at: "" })
    interviews.setPage(1)
  }
  const changeTab = (value) => {
    setActiveTab(value)
    if (value === "final-decision") {
      interviews.setProgressFilter("all")
      interviews.setCompletionFilter("all")
    }
  }

  if (interviews.initialLoading) {
    return <div className="flex items-center justify-center gap-3 rounded-lg border py-16 text-sm text-muted-foreground" role="status">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />Chargement des entretiens…
    </div>
  }

  return (
    <Tabs value={interviews.selectedCampaign ? activeTab : "campaigns"} onValueChange={changeTab} className="min-w-0 space-y-4">
      <div className="space-y-3 bg-background pb-1 lg:sticky lg:top-0 lg:z-30">
        <section aria-label="Campagne de travail" className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1 lg:max-w-xl">
              <InterviewSelect id="active-interview-campaign" label="Campagne d'entretien" value={interviews.selectedCampaignId}
                onChange={changeCampaign} placeholder="Choisir une campagne" disabled={interviews.submitting || !interviews.campaigns.length}
                options={interviews.campaigns.map((campaign) => ({
                  value: campaign.id, label: `${campaign.name} - ${getFormationLabel(campaign.formation)}`,
                }))} />
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              <Button variant="outline" onClick={() => setCampaignDialogOpen(true)} disabled={interviews.submitting}>
                <Plus className="mr-2 h-4 w-4" />Nouvelle campagne
              </Button>
              <Button variant="ghost" size="icon" aria-label="Actualiser les entretiens" title="Actualiser"
                disabled={interviews.loading || interviews.submitting} onClick={interviews.fetchBootstrap}>
                <RefreshCw className={`h-4 w-4 ${interviews.loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          {interviews.selectedCampaign ? <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{getFormationLabel(interviews.selectedCampaign.formation)}</Badge>
            <span>{CAMPAIGN_STATUS[interviews.selectedCampaign.status] || interviews.selectedCampaign.status}</span>
            <span aria-hidden="true">·</span><span>{interviews.campaignSlots.length} créneau(x)</span>
            <span aria-hidden="true">·</span><span>{interviews.selectedCampaign.evaluation_count || 0} candidat(s) planifié(s)</span>
          </div> : null}
        </section>
        <TabsList aria-label="Étapes des entretiens" className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg border bg-muted/40 p-1 sm:grid-cols-4">
          {WORKSPACE_TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} disabled={!interviews.selectedCampaign && value !== "campaigns"}
              className="gap-2 rounded-md px-2 py-2.5 text-xs data-[state=active]:text-orange-700 sm:text-sm">
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />{label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <TabsContent value="campaigns">
        <InterviewCampaignPanel interviews={interviews} onCreate={() => setCampaignDialogOpen(true)} />
      </TabsContent>
      <TabsContent value="slots">
        <InterviewSlotsPanel key={interviews.selectedCampaignId} interviews={interviews} onPlan={() => setPlanningOpen(true)} />
      </TabsContent>
      <TabsContent value="evaluations">
        <InterviewEvaluationsPanel interviews={interviews} onPlan={() => setPlanningOpen(true)} onOpenEvaluation={setSelectedEvaluationId} />
      </TabsContent>
      <TabsContent value="final-decision">
        <InterviewDecisionsPanel key={interviews.selectedCampaignId} interviews={interviews} onOpenEvaluation={setSelectedEvaluationId} />
      </TabsContent>
      <InterviewCampaignDialog interviews={interviews} open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}
        onCreated={() => setActiveTab("campaigns")} />
      <InterviewPlanningDialog interviews={interviews} open={planningOpen} onOpenChange={setPlanningOpen} />
      <CompetencesInterviewEvaluationDialog open={Boolean(selectedEvaluation)}
        onOpenChange={(open) => { if (!open) setSelectedEvaluationId("") }} evaluation={selectedEvaluation}
        slots={interviews.campaignSlots} campaignScorecard={interviews.selectedCampaign?.scorecard_config || selectedEvaluation?.campaign_scorecard_config}
        viewerRole="super_admin" submitting={interviews.submitting} onSave={interviews.handleUpdateEvaluation} />
    </Tabs>
  )
}
