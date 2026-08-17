"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, CalendarClock, ClipboardCheck, Download, Heart, ListChecks, Plus, RefreshCw, Search, Sparkles, Users } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { getAdminAuthHeaders } from "@/app/utils/admin-auth"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "")

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

const DECISION_FILTER_LABELS = {
  all: "Tous",
  pending: "À décider",
  arbitration: "À arbitrer",
  favorable: "Favorables",
}

const BULK_DECISION_OPTIONS = [
  { value: "retenu", label: "Marquer retenus" },
  { value: "liste_attente", label: "Mettre en liste d'attente" },
  { value: "rejete", label: "Rejeter" },
]

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

function ActiveCampaignBanner({ campaign, slotsCount, evaluationsCount, onGoToCampaigns, onGoToSlots }) {
  if (!campaign) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Aucune campagne sélectionnée</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Commencez par créer ou choisir une campagne d&apos;entretien pour un référentiel.
            </p>
          </div>
          <Button onClick={onGoToCampaigns}>Choisir une campagne</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{campaign.name}</p>
            <Badge variant="outline">{getFormationLabel(campaign.formation)}</Badge>
            <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
              {campaign.status === "active" ? "Active" : campaign.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Campagne active pour le travail en cours: critères, créneaux, fiches et décision finale.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-[260px]">
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-muted-foreground">Créneaux</p>
            <p className="text-xl font-semibold">{slotsCount}</p>
          </div>
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-muted-foreground">Fiches</p>
            <p className="text-xl font-semibold">{evaluationsCount}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onGoToCampaigns}>Critères</Button>
          <Button variant="outline" onClick={onGoToSlots}>Créneaux</Button>
        </div>
      </div>
    </div>
  )
}

function countSlotAssignments(slot) {
  const filterCount = (slot.assigned_filter_ids || slot.assigned_jury_ids || []).length
  const validatorCount = (slot.assigned_validator_ids || []).length
  const motivationCount = (slot.assigned_motivation_ids || []).length

  return {
    filter: filterCount,
    validator: validatorCount,
    motivation: motivationCount,
    total: filterCount + validatorCount + motivationCount,
  }
}

function getEvaluationSectionReview(evaluation, sectionKey) {
  const legacyReviewFields = {
    filter: "filter_review",
    validator: "validator_review",
    motivation: "motivation_review",
  }
  return evaluation.section_reviews?.[sectionKey] || evaluation[legacyReviewFields[sectionKey]] || {}
}

function formatCriterionValue(value, criterion) {
  if (criterion.type === "checkbox") {
    return value ? "Oui" : "Non"
  }
  if (criterion.type === "select") {
    return criterion.options?.find((option) => option.value === value)?.label || value || "-"
  }
  return value || "-"
}

function getDecisionActionLabel(evaluation) {
  if (!evaluation?.is_complete) {
    return "Voir l'avancement"
  }
  if (!evaluation.final_status || evaluation.final_status === "en_attente") {
    return "Finaliser la décision"
  }
  return "Voir la décision"
}

function getCandidateName(evaluation) {
  return [evaluation.candidate_snapshot?.first_name, evaluation.candidate_snapshot?.last_name]
    .filter(Boolean)
    .join(" ")
    || evaluation.candidate_snapshot?.email
    || "Candidat"
}

function normalizeDecisionText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

function getCoachBadges(evaluation) {
  const review = getEvaluationSectionReview(evaluation, "validator")
  return [
    review.coach_pick ? { key: "coach_pick", label: "Coup de coeur", tone: "bg-blue-50 text-blue-700 border-blue-200", icon: Heart } : null,
    review.strong_potential ? { key: "strong_potential", label: "Potentiel fort", tone: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Sparkles } : null,
    review.cohort_balance ? { key: "cohort_balance", label: "Équilibre cohorte", tone: "bg-sky-50 text-sky-700 border-sky-200", icon: Users } : null,
    review.social_context ? { key: "social_context", label: "Contexte social", tone: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle } : null,
  ].filter(Boolean)
}

function getReviewDecision(evaluation, sectionKey) {
  const review = getEvaluationSectionReview(evaluation, sectionKey)
  return review.decision || review.verdict || review.status || review.comment || review.notes || ""
}

function getDecisionAid(evaluation) {
  const testScore = Number(evaluation.test_score)
  const filterDecision = normalizeDecisionText(getReviewDecision(evaluation, "filter"))
  const validatorDecision = normalizeDecisionText(getReviewDecision(evaluation, "validator"))
  const motivationDecision = normalizeDecisionText(getReviewDecision(evaluation, "motivation"))
  const badges = getCoachBadges(evaluation)
  const hasWarning = evaluation.test_details?.violations?.totalViolations > 0
  const hasNegative = [filterDecision, validatorDecision, motivationDecision].some((value) =>
    ["echec", "rejete", "rejet", "defavorable", "non"].some((keyword) => value.includes(keyword)),
  )
  const hasStrongSignal = badges.some((badge) => ["coach_pick", "strong_potential"].includes(badge.key))

  if (hasWarning || hasNegative || (Number.isFinite(testScore) && testScore < 50 && hasStrongSignal)) {
    return { value: "arbitration", label: "À arbitrer", className: "border-amber-200 bg-amber-50 text-amber-800" }
  }
  if (hasStrongSignal && (!Number.isFinite(testScore) || testScore >= 70)) {
    return { value: "very_favorable", label: "Très favorable", className: "border-emerald-200 bg-emerald-50 text-emerald-800" }
  }
  if (Number.isFinite(testScore) && testScore >= 70 && evaluation.is_complete) {
    return { value: "favorable", label: "Favorable", className: "border-green-200 bg-green-50 text-green-800" }
  }
  if (!evaluation.is_complete) {
    return { value: "pending", label: "À compléter", className: "border-slate-200 bg-slate-50 text-slate-700" }
  }
  return { value: "discussion", label: "À discuter", className: "border-orange-200 bg-orange-50 text-orange-800" }
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
  const [decisionFilter, setDecisionFilter] = useState("all")
  const [bulkDecision, setBulkDecision] = useState("")
  const [selectedDecisionIds, setSelectedDecisionIds] = useState([])

  const slotOccupancy = interviews.slotOccupancy

  const selectedEvaluation = useMemo(
    () => interviews.evaluations.find((evaluation) => evaluation.id === selectedEvaluationId) || null,
    [interviews.evaluations, selectedEvaluationId],
  )

  const getCompletionState = (evaluation) => {
    return evaluation.is_complete ? "Complète" : "Incomplète"
  }

  const visibleEvaluations = interviews.evaluations
  const decisionEvaluations = useMemo(() => {
    return visibleEvaluations.filter((evaluation) => {
      const aid = getDecisionAid(evaluation)
      if (decisionFilter === "pending") {
        return !evaluation.final_status || evaluation.final_status === "en_attente"
      }
      if (decisionFilter === "arbitration") {
        return aid.value === "arbitration"
      }
      if (decisionFilter === "favorable") {
        return ["very_favorable", "favorable"].includes(aid.value)
      }
      return true
    })
  }, [decisionFilter, visibleEvaluations])
  const selectedDecisionIdSet = useMemo(() => new Set(selectedDecisionIds), [selectedDecisionIds])
  const selectedDecisionRows = useMemo(
    () => decisionEvaluations.filter((evaluation) => selectedDecisionIdSet.has(evaluation.id)),
    [decisionEvaluations, selectedDecisionIdSet],
  )
  const allDecisionRowsSelected = decisionEvaluations.length > 0
    && decisionEvaluations.every((evaluation) => selectedDecisionIdSet.has(evaluation.id))
  const decisionSummaryStats = useMemo(() => {
    return visibleEvaluations.reduce(
      (summary, evaluation) => {
        const aid = getDecisionAid(evaluation)
        if (!evaluation.final_status || evaluation.final_status === "en_attente") {
          summary.pending += 1
        }
        if (aid.value === "arbitration") {
          summary.arbitration += 1
        }
        if (["very_favorable", "favorable"].includes(aid.value)) {
          summary.favorable += 1
        }
        if (evaluation.final_status === "retenu") {
          summary.accepted += 1
        }
        return summary
      },
      { pending: 0, arbitration: 0, favorable: 0, accepted: 0 },
    )
  }, [visibleEvaluations])
  const adminScorecardSections = interviews.selectedCampaign?.scorecard_config?.sections || {}
  const adminScorecardSectionKeys = Object.keys(adminScorecardSections)
  const adminScorecardCriteriaCount = adminScorecardSectionKeys.reduce(
    (total, sectionKey) => total + (adminScorecardSections[sectionKey]?.criteria || []).length,
    0,
  )
  const adminTableColSpan = 7 + Math.max(adminScorecardCriteriaCount, 0)
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
      description: "Générer et suivre les fiches jury.",
      value: interviews.pagination.total,
    },
    {
      tab: "final-decision",
      icon: ClipboardCheck,
      title: "5. Décision",
      description: "Retenir, arbitrer ou rejeter sans traiter ligne par ligne.",
      value: decisionSummaryStats.pending,
    },
  ].filter(Boolean)

  const toggleDecisionSelection = (evaluationId, checked) => {
    setSelectedDecisionIds((previous) => {
      if (checked) {
        return Array.from(new Set([...previous, evaluationId]))
      }
      return previous.filter((id) => id !== evaluationId)
    })
  }

  const toggleAllDecisionRows = (checked) => {
    setSelectedDecisionIds((previous) => {
      const visibleIds = decisionEvaluations.map((evaluation) => evaluation.id)
      if (checked) {
        return Array.from(new Set([...previous, ...visibleIds]))
      }
      const visibleIdSet = new Set(visibleIds)
      return previous.filter((id) => !visibleIdSet.has(id))
    })
  }

  const applyBulkDecision = async () => {
    await interviews.handleBulkUpdateFinalStatus(selectedDecisionIds, bulkDecision)
    setSelectedDecisionIds([])
    setBulkDecision("")
  }

  const handleExportFinalDecisions = async () => {
    try {
      const params = new URLSearchParams()
      if (interviews.selectedCampaignId) {
        params.set("campaignId", interviews.selectedCampaignId)
      }
      if (interviews.statusFilter && interviews.statusFilter !== "all") {
        params.set("status", interviews.statusFilter)
      }
      if (interviews.formationFilter && interviews.formationFilter !== "all") {
        params.set("formation", interviews.formationFilter)
      }
      if (interviews.searchTerm.trim()) {
        params.set("search", interviews.searchTerm.trim())
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/interviews/evaluations/export?${params.toString()}`,
        { headers: getAdminAuthHeaders() },
      )

      if (!response.ok) {
        let message = "Export impossible"
        try {
          const errorData = await response.json()
          message = errorData?.error || errorData?.message || message
        } catch (error) {
          message = `Export impossible (${response.status})`
        }
        throw new Error(message)
      }

      const blob = await response.blob()
      const disposition = response.headers.get("Content-Disposition") || ""
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/)
      const filename = filenameMatch?.[1] || "entretiens.csv"
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success("Export CSV généré")
    } catch (error) {
      toast.error(error.message || "Impossible de générer l'export")
    }
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
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Module entretiens</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Organiser les entretiens simplement</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
              Une campagne par référentiel, des créneaux clairs, puis un tableau de suivi pour décider sans ouvrir chaque fiche inutilement.
            </p>
          </div>
          <Button variant="outline" onClick={interviews.fetchBootstrap}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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

      <ActiveCampaignBanner
        campaign={interviews.selectedCampaign}
        slotsCount={interviews.campaignSlots.length}
        evaluationsCount={interviews.pagination.total}
        onGoToCampaigns={() => setActiveTab("campaigns")}
        onGoToSlots={() => setActiveTab("slots")}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="hidden">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes et critères</TabsTrigger>
          <TabsTrigger value="slots">Créneaux et jurys</TabsTrigger>
          <TabsTrigger value="evaluations">Fiches et décisions</TabsTrigger>
          <TabsTrigger value="final-decision">Décision finale</TabsTrigger>
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

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
            <Card className="border-orange-200 bg-orange-50/60 xl:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle>Campagne de travail</CardTitle>
                <CardDescription>
                  Choisissez d&apos;abord le référentiel à traiter. Les critères, créneaux et décisions suivront cette campagne.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-end">
                  <div className="space-y-2">
                    <Label>Campagne</Label>
                    <Select value={interviews.selectedCampaignId} onValueChange={interviews.setSelectedCampaignId}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Choisir une campagne" />
                      </SelectTrigger>
                      <SelectContent>
                        {interviews.campaigns.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name} - {getFormationLabel(campaign.formation)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" onClick={() => setActiveTab("slots")} disabled={!interviews.selectedCampaign}>
                    Continuer vers les créneaux
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nouvelle campagne</CardTitle>
                <CardDescription>
                  À créer seulement quand un nouveau référentiel ou une nouvelle vague d&apos;entretiens démarre.
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
                  Créer et utiliser cette campagne
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Repères simples</CardTitle>
                <CardDescription>
                  Pour éviter les confusions pendant les entretiens.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="rounded-xl border bg-muted/20 p-3">
                  <p className="font-medium text-foreground">Campagne</p>
                  <p>Regroupe les entretiens d&apos;un référentiel pour une période donnée.</p>
                </div>
                <div className="rounded-xl border bg-muted/20 p-3">
                  <p className="font-medium text-foreground">Critères</p>
                  <p>Correspondent aux colonnes du tableau type Excel, différentes selon le référentiel.</p>
                </div>
                <div className="rounded-xl border bg-muted/20 p-3">
                  <p className="font-medium text-foreground">Créneaux</p>
                  <p>Servent à organiser les passages et à rattacher les jurys concernés.</p>
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
          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <Card>
              <CardHeader>
                <CardTitle>Créer un créneau</CardTitle>
                <CardDescription>
                  Un créneau = une plage horaire d&apos;entretien. Les jurys peuvent être affectés après création.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slot-label">Libellé</Label>
                  <Input
                    id="slot-label"
                    value={interviews.slotForm.label}
                    onChange={(event) => interviews.setSlotForm((prev) => ({ ...prev, label: event.target.value }))}
                    placeholder="Ex: Mardi matin - Dev Web"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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
                </div>

                <Button className="w-full" onClick={interviews.handleCreateSlot} disabled={interviews.submitting || !interviews.selectedCampaign}>
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Ajouter ce créneau
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comment utiliser les créneaux ?</CardTitle>
                <CardDescription>
                  Gardez le scénario simple, même avec beaucoup de candidats.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm md:grid-cols-3">
                <div className="rounded-xl border bg-muted/20 p-3">
                  <p className="font-medium">1. Créer</p>
                  <p className="mt-1 text-muted-foreground">Ajoutez toutes les plages horaires prévues pour ce référentiel.</p>
                </div>
                <div className="rounded-xl border bg-muted/20 p-3">
                  <p className="font-medium">2. Affecter</p>
                  <p className="mt-1 text-muted-foreground">Ajoutez filtreurs, coachs ou motivation selon le besoin du créneau.</p>
                </div>
                <div className="rounded-xl border bg-muted/20 p-3">
                  <p className="font-medium">3. Planifier</p>
                  <p className="mt-1 text-muted-foreground">Le système répartit ensuite les candidats sur les créneaux disponibles.</p>
                </div>
              </CardContent>
            </Card>
          </div>

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
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Créneau</TableHead>
                      <TableHead>Début</TableHead>
                      <TableHead>Candidats</TableHead>
                      <TableHead>Jurys affectés</TableHead>
                      <TableHead>État</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.campaignSlots.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          Aucun créneau pour cette campagne.
                        </TableCell>
                      </TableRow>
                    ) : (
                      interviews.campaignSlots.map((slot) => {
                        const assignedCount = slotOccupancy[slot.id] || 0
                        const juryCount = countSlotAssignments(slot)

                        return (
                          <TableRow key={slot.id}>
                            <TableCell className="font-medium">{slot.label}</TableCell>
                            <TableCell>{slot.start_at ? new Date(slot.start_at).toLocaleString("fr-FR") : "-"}</TableCell>
                            <TableCell>{assignedCount}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant={juryCount.filter ? "secondary" : "outline"}>Filtre: {juryCount.filter}</Badge>
                                <Badge variant={juryCount.validator ? "secondary" : "outline"}>Coach: {juryCount.validator}</Badge>
                                <Badge variant={juryCount.motivation ? "secondary" : "outline"}>Motivation: {juryCount.motivation}</Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={assignedCount > 0 ? "default" : "outline"}>
                                {assignedCount > 0 ? "Avec candidats" : "Disponible"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
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
                    Planifiez les candidats, puis suivez les avis dans un tableau proche du fichier Excel.
                  </CardDescription>
                </div>
                <div className="grid gap-3 sm:w-[520px] sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <div className="space-y-2">
                    <Label>Mode</Label>
                    <Select value={interviews.planningMode} onValueChange={interviews.setPlanningMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automatique recommandé</SelectItem>
                        <SelectItem value="manual">Limiter par créneau</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {interviews.planningMode === "manual" ? (
                    <div className="space-y-2">
                      <Label htmlFor="manual-candidates-per-slot">Max par créneau</Label>
                      <Input
                        id="manual-candidates-per-slot"
                        type="number"
                        min="1"
                        value={interviews.candidatesPerSlot}
                        onChange={(event) =>
                          interviews.setCandidatesPerSlot(Math.max(Number(event.target.value) || 1, 1))
                        }
                      />
                    </div>
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                  <Button onClick={interviews.handleSeedEvaluations} disabled={interviews.submitting || !interviews.selectedCampaign}>
                    <Users className="mr-2 h-4 w-4" />
                    Planifier les candidats
                  </Button>
                </div>
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

              <div className="rounded-2xl border bg-muted/20 p-4">
                <div className="mb-3 flex flex-col gap-1">
                  <p className="text-sm font-semibold">Rechercher et filtrer</p>
                  <p className="text-xs text-muted-foreground">
                    La liste reste paginée pour rester rapide, même avec beaucoup de candidats.
                  </p>
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
              </div>

              <div className="max-h-[70vh] overflow-auto rounded-lg border">
                <Table>
                  <TableHeader className="sticky top-0 z-30 bg-background shadow-sm">
                    <TableRow>
                      <TableHead rowSpan={2} className="sticky left-0 z-40 min-w-[200px] bg-background">
                        Candidat
                      </TableHead>
                      <TableHead rowSpan={2} className="min-w-[150px]">Référentiel</TableHead>
                      <TableHead rowSpan={2} className="min-w-[110px]">Score test</TableHead>
                      {adminScorecardSectionKeys.map((sectionKey) => (
                        <TableHead
                          key={sectionKey}
                          colSpan={(adminScorecardSections[sectionKey]?.criteria || []).length}
                          className="border-l bg-orange-50 text-center font-semibold text-orange-900"
                        >
                          {adminScorecardSections[sectionKey]?.title || sectionKey}
                        </TableHead>
                      ))}
                      <TableHead rowSpan={2}>Fiche</TableHead>
                      <TableHead rowSpan={2}>Avancement</TableHead>
                      <TableHead rowSpan={2}>Statut</TableHead>
                      <TableHead rowSpan={2} className="sticky right-0 z-40 bg-background text-right">Action</TableHead>
                    </TableRow>
                    <TableRow>
                      {adminScorecardSectionKeys.flatMap((sectionKey) =>
                        (adminScorecardSections[sectionKey]?.criteria || []).map((criterion) => (
                          <TableHead key={`${sectionKey}-${criterion.key}`} className="border-l bg-background text-center">
                            {criterion.label}
                          </TableHead>
                        )),
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.evaluationsLoading ? (
                      <TableRow>
                        <TableCell colSpan={adminTableColSpan} className="py-10 text-center text-muted-foreground">
                          Chargement des fiches...
                        </TableCell>
                      </TableRow>
                    ) : visibleEvaluations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={adminTableColSpan} className="py-10 text-center text-muted-foreground">
                          Aucune fiche d&apos;entretien pour les filtres actuels.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleEvaluations.map((evaluation) => (
                        <TableRow key={evaluation.id}>
                          <TableCell className="sticky left-0 z-10 bg-background font-medium">
                            {[evaluation.candidate_snapshot?.first_name, evaluation.candidate_snapshot?.last_name].filter(Boolean).join(" ") || evaluation.candidate_snapshot?.email || "Candidat"}
                            <p className="text-xs font-normal text-muted-foreground">
                              {evaluation.candidate_snapshot?.email || "-"}
                            </p>
                          </TableCell>
                          <TableCell>{getFormationLabel(evaluation.candidate_snapshot?.desired_training)}</TableCell>
                          <TableCell>
                            <span className="font-medium">{formatTestScore(evaluation.test_score)}</span>
                          </TableCell>
                          {adminScorecardSectionKeys.flatMap((sectionKey) =>
                            (adminScorecardSections[sectionKey]?.criteria || []).map((criterion) => {
                              const review = getEvaluationSectionReview(evaluation, sectionKey)
                              const value = review?.[criterion.key]
                              return (
                                <TableCell key={`${evaluation.id}-${sectionKey}-${criterion.key}`} className="border-l">
                                  <span className="text-sm text-muted-foreground">
                                    {formatCriterionValue(value, criterion)}
                                  </span>
                                </TableCell>
                              )
                            }),
                          )}
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
                          <TableCell className="sticky right-0 z-10 bg-background text-right">
                            <Button
                              variant={evaluation.is_complete && evaluation.final_status === "en_attente" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedEvaluationId(evaluation.id)}
                            >
                              {getDecisionActionLabel(evaluation)}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
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

        <TabsContent value="final-decision" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle>Décision finale</CardTitle>
                  <CardDescription>
                    Vue de synthèse pour retenir, mettre en attente ou rejeter sans retraiter toute la fiche.
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {selectedDecisionRows.length} sélectionné(s)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryStatCard
                  label="À décider"
                  value={decisionSummaryStats.pending}
                  description="Sans décision finale."
                />
                <SummaryStatCard
                  label="À arbitrer"
                  value={decisionSummaryStats.arbitration}
                  description="Cas sensibles ou contradictoires."
                />
                <SummaryStatCard
                  label="Favorables"
                  value={decisionSummaryStats.favorable}
                  description="Signaux positifs forts."
                />
                <SummaryStatCard
                  label="Retenus"
                  value={decisionSummaryStats.accepted}
                  description="Liste officielle actuelle."
                />
              </div>

              <div className="rounded-2xl border bg-muted/20 p-4">
                <div className="mb-3 flex flex-col gap-1">
                  <p className="text-sm font-semibold">Filtrer puis décider</p>
                  <p className="text-xs text-muted-foreground">
                    Sélectionnez uniquement les lignes concernées, puis appliquez une décision groupée si besoin.
                  </p>
                </div>
                <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_220px_220px_220px_auto_auto]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={interviews.searchTerm}
                      onChange={(event) => interviews.setSearchTerm(event.target.value)}
                      className="pl-9"
                      placeholder="Nom, email ou téléphone"
                    />
                  </div>
                  <Select value={decisionFilter} onValueChange={setDecisionFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DECISION_FILTER_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select value={bulkDecision || "none"} onValueChange={(value) => setBulkDecision(value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Décision groupée</SelectItem>
                      {BULK_DECISION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={applyBulkDecision}
                    disabled={interviews.submitting || selectedDecisionIds.length === 0 || !bulkDecision}
                  >
                    Appliquer
                  </Button>
                  <Button variant="outline" onClick={handleExportFinalDecisions}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter
                  </Button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-auto rounded-lg border">
                <Table>
                  <TableHeader className="sticky top-0 z-30 bg-background shadow-sm">
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={allDecisionRowsSelected}
                          onCheckedChange={(value) => toggleAllDecisionRows(Boolean(value))}
                          aria-label="Sélectionner les candidats visibles"
                        />
                      </TableHead>
                      <TableHead>Candidat</TableHead>
                      <TableHead>Score test</TableHead>
                      <TableHead>Filtreur</TableHead>
                      <TableHead>Coach</TableHead>
                      <TableHead>Motivation</TableHead>
                      <TableHead>Badges</TableHead>
                      <TableHead>Aide décision</TableHead>
                      <TableHead>Décision finale</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.evaluationsLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                          Chargement des décisions...
                        </TableCell>
                      </TableRow>
                    ) : decisionEvaluations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                          Aucun candidat pour les filtres actuels.
                        </TableCell>
                      </TableRow>
                    ) : (
                      decisionEvaluations.map((evaluation) => {
                        const aid = getDecisionAid(evaluation)
                        const badges = getCoachBadges(evaluation)
                        const checked = selectedDecisionIdSet.has(evaluation.id)

                        return (
                          <TableRow key={evaluation.id} className={aid.value === "arbitration" ? "bg-amber-50/40" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => toggleDecisionSelection(evaluation.id, Boolean(value))}
                                aria-label={`Sélectionner ${getCandidateName(evaluation)}`}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{getCandidateName(evaluation)}</div>
                              <div className="text-xs text-muted-foreground">{evaluation.candidate_snapshot?.email || "-"}</div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">{formatTestScore(evaluation.test_score)}</span>
                              {evaluation.test_details?.violations?.totalViolations > 0 ? (
                                <div className="mt-1 text-xs text-amber-700">
                                  {evaluation.test_details.violations.totalViolations} infraction(s)
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell className="max-w-[180px] truncate">
                              {getReviewDecision(evaluation, "filter") || "-"}
                            </TableCell>
                            <TableCell className="max-w-[180px] truncate">
                              {getReviewDecision(evaluation, "validator") || "-"}
                            </TableCell>
                            <TableCell className="max-w-[180px] truncate">
                              {getReviewDecision(evaluation, "motivation") || "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex max-w-[260px] flex-wrap gap-1">
                                {badges.length === 0 ? (
                                  <span className="text-xs text-muted-foreground">-</span>
                                ) : (
                                  badges.map((badge) => {
                                    const Icon = badge.icon
                                    return (
                                      <Badge key={badge.key} variant="outline" className={badge.tone}>
                                        <Icon className="mr-1 h-3 w-3" />
                                        {badge.label}
                                      </Badge>
                                    )
                                  })
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={aid.className}>
                                {aid.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {FINAL_STATUS_LABELS[evaluation.final_status] || evaluation.final_status || "À décider"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => setSelectedEvaluationId(evaluation.id)}>
                                Modifier
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

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
