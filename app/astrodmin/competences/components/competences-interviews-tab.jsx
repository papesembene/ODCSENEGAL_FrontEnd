"use client"

import { useMemo, useState } from "react"
import { CalendarClock, ClipboardCheck, Plus, RefreshCw, Search, Users } from "lucide-react"

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

export default function CompetencesInterviewsTab() {
  const interviews = useCompetencesInterviews()
  const [selectedEvaluationId, setSelectedEvaluationId] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

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
  const selectionSummary = {
    official: statusSummary.retenu,
    waiting: statusSummary.liste_attente,
    rejected: statusSummary.rejete,
    pending: statusSummary.en_attente,
  }

  if (interviews.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start gap-2 rounded-lg bg-transparent p-0">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="slots">Créneaux</TabsTrigger>
          <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
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
              <CardTitle>Piloter la campagne</CardTitle>
              <CardDescription>
                Choisissez une campagne active pour accéder à ses critères, créneaux et fiches d&apos;entretien.
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

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={interviews.fetchBootstrap}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualiser
                </Button>
                <Button onClick={interviews.handleSeedEvaluations} disabled={interviews.submitting || !interviews.selectedCampaign}>
                  <Users className="mr-2 h-4 w-4" />
                  Planifier les candidats
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Créer une campagne d&apos;entretiens</CardTitle>
                <CardDescription>
                  Une campagne définit un référentiel, ses critères et ses créneaux de sélection.
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

            <Card>
              <CardHeader>
                <CardTitle>Campagne active</CardTitle>
                <CardDescription>
                  Sélectionnez la campagne sur laquelle vous voulez travailler.
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
              <CardTitle>Viviers d&apos;entretien</CardTitle>
              <CardDescription>
                Les fiches générées servent de base à la liste officielle, à la liste d&apos;attente et aux validations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Fiches complètes</p>
                  <p className="mt-1 text-2xl font-semibold">{evaluationSummary.complete}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fiches entièrement renseignées par les 3 étapes.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Fiches incomplètes</p>
                  <p className="mt-1 text-2xl font-semibold">{evaluationSummary.incomplete}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fiches encore en cours côté filtre, validation ou motivation.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Prêtes à décision</p>
                  <p className="mt-1 text-2xl font-semibold">{evaluationSummary.readyForDecision}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fiches complètes avec entretien marqué comme passé.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="mt-1 text-2xl font-semibold">{statusSummary.en_attente}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Retenus</p>
                  <p className="mt-1 text-2xl font-semibold">{statusSummary.retenu}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Liste d&apos;attente</p>
                  <p className="mt-1 text-2xl font-semibold">{statusSummary.liste_attente}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Rejetés</p>
                  <p className="mt-1 text-2xl font-semibold">{statusSummary.rejete}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Liste officielle</p>
                  <p className="mt-1 text-2xl font-semibold">{selectionSummary.official}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fiches finalisées et retenues.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Liste d&apos;attente</p>
                  <p className="mt-1 text-2xl font-semibold">{selectionSummary.waiting}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fiches finalisées avec décision d&apos;attente.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Rejetés</p>
                  <p className="mt-1 text-2xl font-semibold">{selectionSummary.rejected}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fiches finalisées et non retenues.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Décision à finaliser</p>
                  <p className="mt-1 text-2xl font-semibold">{selectionSummary.pending}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fiches encore incomplètes ou sans décision finale.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Label>Statut</Label>
                <Select value={interviews.statusFilter} onValueChange={interviews.setStatusFilter}>
                  <SelectTrigger className="w-[220px]">
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
                  <SelectTrigger className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les fiches</SelectItem>
                    <SelectItem value="complete">Fiches complètes</SelectItem>
                    <SelectItem value="incomplete">Fiches incomplètes</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={interviews.progressFilter} onValueChange={interviews.setProgressFilter}>
                  <SelectTrigger className="w-[220px]">
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
                <Button onClick={interviews.handleSeedEvaluations} disabled={interviews.submitting || !interviews.selectedCampaign}>
                  <Users className="mr-2 h-4 w-4" />
                  Planifier automatiquement
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_240px_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={interviews.searchTerm}
                    onChange={(event) => interviews.setSearchTerm(event.target.value)}
                    className="pl-9"
                    placeholder="Rechercher par nom, email ou téléphone"
                  />
                </div>
                <Select value={interviews.formationFilter} onValueChange={interviews.setFormationFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les référentiels</SelectItem>
                    {FORMATION_OPTIONS.map((formation) => (
                      <SelectItem key={formation.value} value={formation.value}>
                        {formation.label}
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
        campaignScorecard={interviews.selectedCampaign?.scorecard_config}
        viewerRole="super_admin"
        submitting={interviews.submitting}
        onSave={interviews.handleUpdateEvaluation}
      />
    </div>
  )
}
