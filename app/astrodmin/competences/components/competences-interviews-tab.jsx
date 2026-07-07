"use client"

import { useMemo, useState } from "react"
import { CalendarClock, ClipboardCheck, ListChecks, Plus, RefreshCw, Search, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { PageSizeSelector, PaginationControls } from "@/components/ui/data-pagination"

import CompetencesInterviewEvaluationDialog from "./competences-interview-evaluation-dialog"
import CompetencesInterviewScorecardEditor from "./competences-interview-scorecard-editor"
import CompetencesInterviewSlotAssignmentCard from "./competences-interview-slot-assignment-card"
import useCompetencesInterviews from "../hooks/use-competences-interviews"

const FORMATION_OPTIONS = [
  { value: "dev-web-mobile", label: "Développement Web Mobile" },
  { value: "dev-data", label: "Développement Data" },
  { value: "hackeuses", label: "Hackeuses" },
  { value: "aws-cloud", label: "AWS Cloud" },
  { value: "referent-digital", label: "Référent Digital" },
  { value: "cyber-security", label: "Cybersécurité" },
  { value: "intelligence-artificielle", label: "Intelligence Artificielle" },
]

function getFormationLabel(value) {
  return FORMATION_OPTIONS.find((formation) => formation.value === value)?.label || value || "-"
}

const FINAL_STATUS_LABELS = {
  en_attente: "En attente",
  retenu: "Retenu",
  liste_attente: "Liste d'attente",
  rejete: "Rejeté",
}

const INTERVIEW_PROGRESS_LABELS = {
  a_planifier: "À planifier",
  planifie: "Planifié",
  passe: "Passé",
  absent: "Absent",
}

function formatTestScore(score) {
  return Number.isFinite(Number(score)) ? `${Number(score)} pts` : "Non disponible"
}

function SummaryStatCard({ label, value, description, className = "" }) {
  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
    </div>
  )
}

function WorkflowStep({ icon: Icon, title, description, value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? "border-orange-300 bg-orange-50 shadow-sm" : "bg-white hover:border-orange-200"
      } dark:bg-white/5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
          <Icon className="h-5 w-5" />
        </div>
        <Badge variant={active ? "default" : "outline"}>{value}</Badge>
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </button>
  )
}

export default function CompetencesInterviewsTab() {
  const interviews = useCompetencesInterviews()
  const [selectedEvaluationId, setSelectedEvaluationId] = useState("")
  const [activeTab, setActiveTab] = useState("campaigns")

  const slotOccupancy = interviews.slotOccupancy

  const selectedEvaluation = useMemo(
    () => interviews.evaluations.find((evaluation) => evaluation.id === selectedEvaluationId) || null,
    [interviews.evaluations, selectedEvaluationId],
  )

  const getCompletionState = (evaluation) => {
    return evaluation.is_complete ? "Complète" : "Incomplète"
  }

  const visibleEvaluations = interviews.evaluations
  const evaluationSummary = {
    complete: interviews.evaluationSummary.complete || 0,
    incomplete: interviews.evaluationSummary.incomplete || 0,
    readyForDecision: interviews.evaluationSummary.ready_for_decision || 0,
  }
  const statusSummary = {
    en_attente: interviews.evaluationSummary.status?.en_attente || 0,
    retenu: interviews.evaluationSummary.status?.retenu || 0,
    liste_attente: interviews.evaluationSummary.status?.liste_attente || 0,
    rejete: interviews.evaluationSummary.status?.rejete || 0,
  }
  const decisionStats = [
    {
      label: "À finaliser",
      value: statusSummary.en_attente,
      description: "Fiches sans décision finale.",
    },
    {
      label: "Retenus",
      value: statusSummary.retenu,
      description: "Candidats validés pour la liste officielle.",
    },
    {
      label: "Liste d'attente",
      value: statusSummary.liste_attente,
      description: "Candidats gardés en réserve.",
    },
    {
      label: "Rejetés",
      value: statusSummary.rejete,
      description: "Candidats non retenus après décision.",
    },
  ]
  const progressStats = [
    {
      label: "Complètes",
      value: evaluationSummary.complete,
      description: "Filtre, validation et motivation renseignés.",
    },
    {
      label: "Incomplètes",
      value: evaluationSummary.incomplete,
      description: "Une étape jury reste à compléter.",
    },
    {
      label: "Prêtes à décision",
      value: evaluationSummary.readyForDecision,
      description: "Fiches complètes avec entretien passé.",
    },
  ]
  const workflowSteps = [
    {
      tab: "campaigns",
      icon: ClipboardCheck,
      title: "1. Campagne",
      description: "Créer ou choisir le référentiel à traiter.",
      value: interviews.campaigns.length,
    },
    {
      tab: "campaigns",
      icon: ListChecks,
      title: "2. Critères",
      description: "Définir les champs filtre, validation et motivation.",
      value: `${interviews.selectedCampaign?.evaluation_count || 0} fiche(s)`,
    },
    {
      tab: "slots",
      icon: CalendarClock,
      title: "3. Créneaux",
      description: "Planifier les vagues et affecter les jurys.",
      value: interviews.campaignSlots.length,
    },
    {
      tab: "evaluations",
      icon: Users,
      title: "4. Fiches",
      description: "Générer, suivre et finaliser les décisions.",
      value: interviews.pagination.total,
    },
  ]

  if (interviews.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Module entretiens</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Piloter les entretiens sans surcharge</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
              Suivez le parcours dans l&apos;ordre: campagne, critères, créneaux, puis fiches. Chaque écran garde une action principale.
            </p>
          </div>
          <Button variant="outline" onClick={interviews.fetchBootstrap}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step) => (
            <WorkflowStep
              key={`${step.tab}-${step.title}`}
              icon={step.icon}
              title={step.title}
              description={step.description}
              value={step.value}
              active={activeTab === step.tab}
              onClick={() => setActiveTab(step.tab)}
            />
          ))}
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="hidden">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes et critères</TabsTrigger>
          <TabsTrigger value="slots">Créneaux et jurys</TabsTrigger>
          <TabsTrigger value="evaluations">Fiches et décisions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Campagnes</CardDescription>
                <CardTitle className="text-2xl">{interviews.campaigns.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Critères définis par référentiel
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Créneaux</CardDescription>
                <CardTitle className="text-2xl">{interviews.campaignSlots.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Entretiens par vagues et listes d&apos;attente
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Fiches d&apos;entretien</CardDescription>
                <CardTitle className="text-2xl">{interviews.pagination.total}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  Vivier prêt pour jury, validation et liste officielle
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reprendre rapidement</CardTitle>
              <CardDescription>
                Sélectionnez la campagne puis passez directement à l&apos;étape utile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Campagne active</Label>
                <Select value={interviews.selectedCampaignId} onValueChange={interviews.setSelectedCampaignId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une campagne" />
                  </SelectTrigger>
                  <SelectContent>
                    {interviews.campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border p-4 text-sm">
                {interviews.selectedCampaign ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{interviews.selectedCampaign.name}</span>
                      <Badge variant="outline">{interviews.selectedCampaign.status}</Badge>
                    </div>
                    <p className="text-muted-foreground">Référentiel: {getFormationLabel(interviews.selectedCampaign.formation)}</p>
                    <p className="text-muted-foreground">
                      Les jurys sont affectés directement dans chaque créneau.
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucune campagne sélectionnée.</p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Button variant="outline" onClick={() => setActiveTab("campaigns")}>
                  Définir les critères
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("slots")}>
                  Gérer les créneaux
                </Button>
                <Button onClick={() => setActiveTab("evaluations")}>
                  Voir les fiches
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Créer une campagne</CardTitle>
                <CardDescription>
                  Une campagne correspond à un référentiel et à une vague d&apos;entretiens.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-name">Nom</Label>
                    <Input
                      id="campaign-name"
                      value={interviews.campaignForm.name}
                      onChange={(event) => interviews.setCampaignForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Ex: P8 Référentiel 2026"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Référentiel</Label>
                    <Select
                      value={interviews.campaignForm.formation}
                      onValueChange={(value) => interviews.setCampaignForm((prev) => ({ ...prev, formation: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un référentiel" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMATION_OPTIONS.map((formation) => (
                          <SelectItem key={formation.value} value={formation.value}>
                            {formation.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-description">Description</Label>
                  <Textarea
                    id="campaign-description"
                    value={interviews.campaignForm.description}
                    onChange={(event) => interviews.setCampaignForm((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Objectif de la campagne, critères, remarques..."
                  />
                </div>

                <Button onClick={interviews.handleCreateCampaign} disabled={interviews.submitting}>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer la campagne
                </Button>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/60">
              <CardHeader>
                <CardTitle>Campagne de travail</CardTitle>
                <CardDescription>
                  Tout ce que vous faites ensuite concerne cette campagne.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Campagne</Label>
                  <Select value={interviews.selectedCampaignId} onValueChange={interviews.setSelectedCampaignId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une campagne" />
                    </SelectTrigger>
                    <SelectContent>
                      {interviews.campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <CompetencesInterviewScorecardEditor
            selectedCampaign={interviews.selectedCampaign}
            submitting={interviews.submitting}
            locked={(interviews.selectedCampaign?.evaluation_count || 0) > 0}
            onSave={interviews.handleUpdateCampaignScorecard}
          />
        </TabsContent>

        <TabsContent value="slots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Créer un créneau d&apos;entretien</CardTitle>
              <CardDescription>
                Organisez les passages par campagne, référentiel et plage horaire.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="slot-label">Libellé</Label>
                  <Input
                    id="slot-label"
                    value={interviews.slotForm.label}
                    onChange={(event) => interviews.setSlotForm((prev) => ({ ...prev, label: event.target.value }))}
                    placeholder="Ex: Vague 1 - 9h"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slot-start">Début</Label>
                  <Input
                    id="slot-start"
                    type="datetime-local"
                    value={interviews.slotForm.start_at}
                    onChange={(event) => interviews.setSlotForm((prev) => ({ ...prev, start_at: event.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slot-end">Fin</Label>
                  <Input
                    id="slot-end"
                    type="datetime-local"
                    value={interviews.slotForm.end_at}
                    onChange={(event) => interviews.setSlotForm((prev) => ({ ...prev, end_at: event.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slot-capacity">Capacité</Label>
                  <Input
                    id="slot-capacity"
                    type="number"
                    min="1"
                    value={interviews.slotForm.capacity}
                    onChange={(event) => interviews.setSlotForm((prev) => ({ ...prev, capacity: Number(event.target.value) || 0 }))}
                  />
                </div>

              </div>

              <Button onClick={interviews.handleCreateSlot} disabled={interviews.submitting || !interviews.selectedCampaign}>
                <CalendarClock className="mr-2 h-4 w-4" />
                Ajouter le créneau
              </Button>
            </CardContent>
          </Card>

          <CompetencesInterviewSlotAssignmentCard
            slots={interviews.campaignSlots}
            adminOptions={interviews.adminOptions}
            submitting={interviews.submitting}
            onSave={interviews.handleUpdateSlotAssignments}
          />

          <Card>
            <CardHeader>
              <CardTitle>Créneaux définis</CardTitle>
              <CardDescription>Vue rapide des entretiens programmés pour la campagne sélectionnée.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Créneau</TableHead>
                    <TableHead>Début</TableHead>
                    <TableHead>Occupation</TableHead>
                    <TableHead>Places restantes</TableHead>
                    <TableHead>État</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.campaignSlots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Aucun créneau pour cette campagne.
                      </TableCell>
                    </TableRow>
                  ) : (
                    interviews.campaignSlots.map((slot) => {
                      const assignedCount = slotOccupancy[slot.id] || 0
                      const remainingSeats = Math.max((slot.capacity || 0) - assignedCount, 0)
                      const isComplete = remainingSeats === 0

                      return (
                        <TableRow key={slot.id}>
                          <TableCell className="font-medium">{slot.label}</TableCell>
                          <TableCell>{slot.start_at ? new Date(slot.start_at).toLocaleString("fr-FR") : "-"}</TableCell>
                          <TableCell>{assignedCount} / {slot.capacity}</TableCell>
                          <TableCell>{remainingSeats}</TableCell>
                          <TableCell>
                            <Badge variant={isComplete ? "destructive" : "outline"}>
                              {isComplete ? "Complet" : "Disponible"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Fiches et décisions</CardTitle>
                  <CardDescription>
                    Générez les fiches puis suivez uniquement ce qui reste à décider.
                  </CardDescription>
                </div>
                <Button onClick={interviews.handleSeedEvaluations} disabled={interviews.submitting || !interviews.selectedCampaign}>
                  <Users className="mr-2 h-4 w-4" />
                  Planifier automatiquement
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {decisionStats.map((stat) => (
                  <SummaryStatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    description={stat.description}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-2 rounded-xl border bg-muted/30 p-3 text-sm text-muted-foreground">
                {progressStats.map((stat) => (
                  <span key={stat.label} className="rounded-full bg-white px-3 py-1">
                    {stat.label}: <strong className="text-foreground">{stat.value}</strong>
                  </span>
                ))}
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_220px_220px_220px_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={interviews.searchTerm}
                    onChange={(event) => interviews.setSearchTerm(event.target.value)}
                    className="pl-9"
                    placeholder="Nom, email ou téléphone"
                  />
                </div>
                <Select value={interviews.statusFilter} onValueChange={interviews.setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Object.entries(FINAL_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={interviews.completionFilter} onValueChange={interviews.setCompletionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les fiches</SelectItem>
                    <SelectItem value="complete">Complètes</SelectItem>
                    <SelectItem value="incomplete">Incomplètes</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={interviews.progressFilter} onValueChange={interviews.setProgressFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les avancements</SelectItem>
                    {Object.entries(INTERVIEW_PROGRESS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <PageSizeSelector
                  value={interviews.pageSize}
                  onChange={(nextPageSize) => {
                    interviews.setPage(1)
                    interviews.setPageSize(nextPageSize)
                  }}
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidat</TableHead>
                    <TableHead>Référentiel</TableHead>
                    <TableHead>Score test</TableHead>
                    <TableHead>Fiche</TableHead>
                    <TableHead>Avancement</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.evaluationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Chargement des fiches...
                      </TableCell>
                    </TableRow>
                  ) : visibleEvaluations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Aucune fiche d&apos;entretien pour les filtres actuels.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleEvaluations.map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell className="font-medium">
                          {[evaluation.candidate_snapshot?.first_name, evaluation.candidate_snapshot?.last_name].filter(Boolean).join(" ") || evaluation.candidate_snapshot?.email || "Candidat"}
                        </TableCell>
                        <TableCell>{getFormationLabel(evaluation.candidate_snapshot?.desired_training)}</TableCell>
                        <TableCell>
                          <span className="font-medium">{formatTestScore(evaluation.test_score)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getCompletionState(evaluation) === "Complète" ? "default" : "secondary"}>
                            {getCompletionState(evaluation)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {INTERVIEW_PROGRESS_LABELS[evaluation.interview_progress_status] || evaluation.interview_progress_status || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{FINAL_STATUS_LABELS[evaluation.final_status] || evaluation.final_status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => setSelectedEvaluationId(evaluation.id)}>
                            Ouvrir la fiche
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <PaginationControls
                page={interviews.pagination.page}
                pageSize={interviews.pagination.page_size}
                totalItems={interviews.pagination.total}
                itemLabel="fiche(s)"
                onPageChange={interviews.setPage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CompetencesInterviewEvaluationDialog
        open={Boolean(selectedEvaluation)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEvaluationId("")
          }
        }}
        evaluation={selectedEvaluation}
        slots={interviews.campaignSlots}
        campaignScorecard={interviews.selectedCampaign?.scorecard_config || selectedEvaluation?.campaign_scorecard_config}
        viewerRole="super_admin"
        submitting={interviews.submitting}
        onSave={interviews.handleUpdateEvaluation}
      />
    </div>
  )
}
