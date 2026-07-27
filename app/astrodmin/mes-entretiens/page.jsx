"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { CalendarClock, CheckCircle2, ClipboardList, Heart, Scale, Sparkles, UsersRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageSizeSelector, PaginationControls } from "@/components/ui/data-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import useCompetencesInterviews from "../competences/hooks/use-competences-interviews"
import CompetencesInterviewEvaluationDialog from "../competences/components/competences-interview-evaluation-dialog"

function isFilledValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== ""
}

function normalizeSearchValue(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function getRoleSectionKey(role) {
  if (role === "Filtreur") return "filter"
  if (role === "Validateur") return "validator"
  if (role === "Motivation") return "motivation"
  return ""
}

const SECTION_VISIBILITY_BY_ROLE = {
  filter: ["filter"],
  validator: ["filter", "validator"],
  motivation: ["filter", "validator", "motivation"],
}

const REVIEW_FIELD_BY_SECTION = {
  filter: "filter_review",
  validator: "validator_review",
  motivation: "motivation_review",
}

const COACH_RECOMMENDATION_OPTIONS = [
  { key: "coach_pick", label: "Coup de cœur", description: "Profil qui mérite une attention spéciale.", icon: Heart },
  { key: "strong_potential", label: "Potentiel fort", description: "Bonne marge de progression ou très bon signal.", icon: Sparkles },
  { key: "cohort_balance", label: "Équilibre cohorte", description: "Profil utile pour équilibrer la promotion.", icon: Scale },
  { key: "social_context", label: "Cas social à soutenir", description: "Situation personnelle à considérer avec bienveillance.", icon: UsersRound },
]

const COACH_RECOMMENDATION_KEYS = new Set(COACH_RECOMMENDATION_OPTIONS.map((option) => option.key))

function isCoachRecommendationCriterion(criterion) {
  return COACH_RECOMMENDATION_KEYS.has(criterion?.key)
}

function getVisibleCriteria(section) {
  return (section?.criteria || []).filter(
    (criterion) => !isCoachRecommendationCriterion(criterion),
  )
}

function getCoachRecommendationLabels(evaluation) {
  const validatorReview = getEvaluationSectionReview(evaluation, "validator")
  return COACH_RECOMMENDATION_OPTIONS
    .filter((option) => Boolean(validatorReview?.[option.key]))
    .map((option) => option.label)
}

function isFilterFailure(evaluation) {
  const filterReview = getEvaluationSectionReview(evaluation, "filter")
  const decision = normalizeSearchValue(filterReview?.decision || filterReview?.verdict)
  return ["echec", "echec filtre", "rejet", "rejete", "rejected", "failed"].includes(decision)
}

function getRoleKeys(roles) {
  return roles.map(getRoleSectionKey).filter(Boolean)
}

function getVisibleSectionKeys(sectionKeys, roleKeys) {
  const visibleKeys = new Set()
  roleKeys.forEach((roleKey) => {
    ;(SECTION_VISIBILITY_BY_ROLE[roleKey] || [roleKey]).forEach((sectionKey) => {
      if (sectionKeys.includes(sectionKey)) {
        visibleKeys.add(sectionKey)
      }
    })
  })
  return sectionKeys.filter((sectionKey) => visibleKeys.has(sectionKey))
}

function getEvaluationSectionReview(evaluation, sectionKey) {
  const legacyReviewFields = {
    filter: "filter_review",
    validator: "validator_review",
    motivation: "motivation_review",
  }
  return evaluation.section_reviews?.[sectionKey] || evaluation[legacyReviewFields[sectionKey]] || {}
}

function getCriterionValue(drafts, evaluation, sectionKey, criterion) {
  const draftValue = drafts[evaluation.id]?.[`${sectionKey}_${criterion.key}`]
  if (draftValue !== undefined) {
    return draftValue
  }
  const review = getEvaluationSectionReview(evaluation, sectionKey)
  if (criterion.type === "checkbox") {
    return Boolean(review?.[criterion.key])
  }
  return review?.[criterion.key] ?? ""
}

function setCriterionValue(setDrafts, evaluationId, sectionKey, criterionKey, value) {
  setDrafts((previous) => ({
    ...previous,
    [evaluationId]: {
      ...(previous[evaluationId] || {}),
      [`${sectionKey}_${criterionKey}`]: value,
    },
  }))
}

function buildInlineReview(evaluation, drafts, sectionKey, section, currentAdminName) {
  const currentReview = getEvaluationSectionReview(evaluation, sectionKey)
  const review = { ...currentReview }

  if ((section?.criteria || []).some((criterion) => criterion.key === "interviewer")) {
    review.interviewer = currentAdminName || currentReview.interviewer || currentReview._owner_name || ""
  }

  getVisibleCriteria(section).forEach((criterion) => {
    if (criterion.type === "computed") {
      const dependencies = criterion.depends_on || []
      review[criterion.key] = dependencies.reduce((total, dependency) => {
        const dependencyValue = drafts[evaluation.id]?.[`${sectionKey}_${dependency}`]
          ?? currentReview?.[dependency]
        return total + Number(Boolean(dependencyValue))
      }, 0)
      return
    }

    const value = getCriterionValue(drafts, evaluation, sectionKey, criterion)
    if (criterion.type === "checkbox") {
      review[criterion.key] = Boolean(value)
    } else if (criterion.type === "number") {
      review[criterion.key] = value === "" ? null : Number(value)
    } else {
      review[criterion.key] = typeof value === "string" ? value.trim() : value
    }
  })

  return review
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

function getInterviewerDisplayName(evaluation, sectionKey, canEdit, currentAdminName) {
  const review = getEvaluationSectionReview(evaluation, sectionKey)
  return review?._owner_name || review?.interviewer || (canEdit ? currentAdminName : "") || "-"
}

function renderCriterionCell({
  canEdit,
  criterion,
  currentAdminName,
  drafts,
  evaluation,
  sectionKey,
  setDrafts,
}) {
  if (criterion.key === "interviewer") {
    return (
      <span className="block min-w-[150px] rounded-md border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
        {getInterviewerDisplayName(evaluation, sectionKey, canEdit, currentAdminName)}
      </span>
    )
  }

  const value = getCriterionValue(drafts, evaluation, sectionKey, criterion)

  if (!canEdit) {
    return <span className="text-sm text-muted-foreground">{formatCriterionValue(value, criterion)}</span>
  }

  if (criterion.type === "checkbox") {
    return (
      <div className="flex justify-center">
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(checked) =>
            setCriterionValue(setDrafts, evaluation.id, sectionKey, criterion.key, Boolean(checked))
          }
        />
      </div>
    )
  }

  if (criterion.type === "select") {
    return (
      <Select
        value={value || "none"}
        onValueChange={(nextValue) =>
          setCriterionValue(setDrafts, evaluation.id, sectionKey, criterion.key, nextValue === "none" ? "" : nextValue)
        }
      >
        <SelectTrigger className="min-w-[160px]">
          <SelectValue placeholder="Choisir" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Non renseigné</SelectItem>
          {(criterion.options || []).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (criterion.type === "textarea") {
    return (
      <Textarea
        value={value}
        onChange={(event) => setCriterionValue(setDrafts, evaluation.id, sectionKey, criterion.key, event.target.value)}
        className="min-h-20 min-w-[220px]"
      />
    )
  }

  if (criterion.type === "computed") {
    return <span className="font-medium">{formatCriterionValue(value, criterion)}</span>
  }

  return (
    <Input
      type={criterion.type === "number" ? "number" : "text"}
      value={value}
      min={criterion.min}
      max={criterion.max}
      onChange={(event) => setCriterionValue(setDrafts, evaluation.id, sectionKey, criterion.key, event.target.value)}
      className="min-w-[140px]"
    />
  )
}

function CandidateFoundQuestionsPanel({ testDetails }) {
  const [visibleQuestionsCount, setVisibleQuestionsCount] = useState(5)
  const questions = (testDetails?.questions || []).filter((question) => question.isCorrect)
  const visibleQuestions = questions.slice(0, visibleQuestionsCount)
  const hasMoreQuestions = questions.length > visibleQuestionsCount
  const canReduceQuestions = visibleQuestionsCount > 5

  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucune question trouvée par ce candidat.</p>
  }

  return (
    <div className="space-y-3">
      <div className="max-h-[min(360px,40vh)] space-y-3 overflow-auto rounded-lg border bg-background p-3">
        {visibleQuestions.map((question) => (
          <div key={question.index} className="space-y-3 rounded-lg border bg-white p-3">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0">{question.index}</Badge>
              <p className="text-sm font-medium leading-relaxed">{question.question}</p>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="rounded-md bg-blue-50 p-2 text-blue-950">
                <span className="font-medium">Réponse candidat: </span>
                {question.answerLabel || "Non renseignée"}
              </div>
              <div className="rounded-md bg-emerald-50 p-2 text-emerald-950">
                <span className="font-medium">Réponse attendue: </span>
                {question.correctAnswerLabel || question.answerLabel || "Non renseignée"}
              </div>
            </div>
          </div>
        ))}
      </div>
      {questions.length > 5 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {visibleQuestions.length} question(s) affichée(s) sur {questions.length} trouvée(s).
          </p>
          <div className="flex gap-2">
            {canReduceQuestions ? (
              <Button type="button" variant="outline" size="sm" onClick={() => setVisibleQuestionsCount(5)}>
                Réduire
              </Button>
            ) : null}
            {hasMoreQuestions ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVisibleQuestionsCount((count) => Math.min(count + 5, questions.length))}
              >
                Afficher 5 de plus
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function InterviewQuestionsSidebar({ questions, selectedEvaluation }) {
  const candidateName = [
    selectedEvaluation?.candidate_snapshot?.first_name,
    selectedEvaluation?.candidate_snapshot?.last_name,
  ].filter(Boolean).join(" ")

  if (!questions?.length) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-orange-200 bg-orange-50/60 p-4 text-sm text-orange-900">
          Aucune question d'entretien préparée pour ce référentiel.
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4">
          <p className="text-sm font-semibold text-blue-950">Questions trouvées par le candidat</p>
          <div className="mt-3">
            <CandidateFoundQuestionsPanel testDetails={selectedEvaluation?.test_details} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto lg:pr-1">
      <div className="rounded-lg border border-orange-200 bg-orange-50/60">
        <div className="border-b border-orange-200 px-4 py-3">
          <p className="text-sm font-semibold text-orange-950">Questions d'entretien</p>
          <p className="text-xs text-orange-800/80">
            Questions à poser et réponses attendues.
          </p>
        </div>
        <div className="max-h-[min(320px,36vh)] overflow-y-auto">
          <div className="divide-y">
            {questions.map((item, index) => (
              <div key={item.id || index} className="space-y-2 p-4">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0 border-orange-300 bg-white text-orange-900">{index + 1}</Badge>
                  <p className="text-sm font-medium leading-relaxed text-orange-950">{item.question}</p>
                </div>
                <div className="rounded-md border border-orange-200 bg-white/80 p-3 text-sm leading-relaxed text-orange-900">
                  <span className="font-medium text-orange-950">Réponse attendue: </span>
                  {item.expected_answer || "À compléter"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50/60">
        <div className="border-b border-blue-200 px-4 py-3">
          <p className="text-sm font-semibold text-blue-950">Questions trouvées par le candidat</p>
          <p className="text-xs text-blue-800/80">
            {candidateName || selectedEvaluation?.candidate_snapshot?.email || "Sélectionnez un candidat dans le tableau."}
          </p>
        </div>
        <div className="p-4">
          <CandidateFoundQuestionsPanel testDetails={selectedEvaluation?.test_details} />
        </div>
      </div>
    </div>
  )
}

function isSectionComplete(section, role, scorecardConfig) {
  const sectionKey = getRoleSectionKey(role)
  const criteria = scorecardConfig?.sections?.[sectionKey]?.criteria || []
  const requiredCriteria = criteria.filter((criterion) => criterion.required)
  return criteria.length > 0 && requiredCriteria.every((criterion) =>
    isFilledValue(section?.[criterion.key]),
  )
}

function getSlotRoles(slot, adminId) {
  const roles = []
  const assignmentRoles = slot.assignments?.[adminId]
  if (Array.isArray(assignmentRoles) && assignmentRoles.length > 0) {
    return assignmentRoles
      .map((role) => {
        if (role === "filter") return "Filtreur"
        if (role === "validator") return "Validateur"
        if (role === "motivation") return "Motivation"
        return role
      })
      .filter(Boolean)
  }

  if ((slot.assigned_filter_ids || slot.assigned_jury_ids || []).includes(adminId)) {
    roles.push("Filtreur")
  }
  if ((slot.assigned_validator_ids || []).includes(adminId)) {
    roles.push("Validateur")
  }
  if ((slot.assigned_motivation_ids || []).includes(adminId)) {
    roles.push("Motivation")
  }
  return roles
}

function getEvaluationRoleLabels(slot, adminId) {
  const roles = getSlotRoles(slot, adminId)
  return roles.length > 0 ? roles : ["-"]
}

function getRolesSectionStatus(evaluation, roles, scorecardConfig) {
  const actionableRoles = roles.filter((role) => role !== "-")
  if (actionableRoles.length === 0) {
    return "-"
  }

  const allComplete = actionableRoles.every((role) => {
    const sectionKey = getRoleSectionKey(role)
    return sectionKey ? isSectionComplete(getEvaluationSectionReview(evaluation, sectionKey), role, scorecardConfig) : false
  })

  return allComplete ? "Complétée" : "À renseigner"
}

function getSectionOwnerLabel(evaluation, sectionKey) {
  const review = getEvaluationSectionReview(evaluation, sectionKey)
  return review?._owner_name || review?.interviewer || ""
}

function isSectionTreated(evaluation, sectionKey, scorecardConfig) {
  const section = scorecardConfig?.sections?.[sectionKey] || {}
  const role = sectionKey === "filter"
    ? "Filtreur"
    : sectionKey === "validator"
      ? "Validateur"
      : sectionKey === "motivation"
        ? "Motivation"
        : ""
  return isSectionComplete(getEvaluationSectionReview(evaluation, sectionKey), role, scorecardConfig)
    || Boolean(getSectionOwnerLabel(evaluation, sectionKey))
}

function getTreatmentInfo(evaluation, roles, scorecardConfig) {
  const roleKeys = getRoleKeys(roles)
  if (roleKeys.length === 0) {
    return { status: "none", label: "-", owner: "" }
  }

  const pendingRole = roleKeys.find((sectionKey) => !isSectionTreated(evaluation, sectionKey, scorecardConfig))
  if (pendingRole) {
    return { status: "todo", label: "À traiter", owner: "" }
  }

  const owner = roleKeys.map((sectionKey) => getSectionOwnerLabel(evaluation, sectionKey)).find(Boolean)
  return { status: "done", label: owner ? `Traité par ${owner}` : "Traité", owner }
}

function getRoleSectionStatus(evaluation, role, scorecardConfig) {
  if (role === "Filtreur") {
    return isSectionComplete(getEvaluationSectionReview(evaluation, "filter"), role, scorecardConfig) ? "Complétée" : "À renseigner"
  }

  if (role === "Validateur") {
    return isSectionComplete(getEvaluationSectionReview(evaluation, "validator"), role, scorecardConfig) ? "Complétée" : "À renseigner"
  }

  if (role === "Motivation") {
    return isSectionComplete(getEvaluationSectionReview(evaluation, "motivation"), role, scorecardConfig) ? "Complétée" : "À renseigner"
  }

  return "-"
}

function InterviewEvaluationTable({
  activeEvaluationId,
  assignedSlots,
  currentAdminId,
  currentAdminName,
  evaluations,
  inlineDrafts,
  onOpenCoachOpinion,
  onSelectEvaluation,
  onSave,
  savingEvaluationId,
  scorecardConfig,
  setDrafts,
  submitting,
}) {
  const sections = scorecardConfig?.sections || {}
  const sectionKeys = Object.keys(sections)
  const visibleSectionKeys = Array.from(new Set(evaluations.flatMap((evaluation) => {
    const slot = assignedSlots.find((item) => item.id === evaluation.slot_id)
    const roles = slot ? getEvaluationRoleLabels(slot, currentAdminId) : []
    return getVisibleSectionKeys(sectionKeys, getRoleKeys(roles))
  })))
  const visibleCriteriaCount = visibleSectionKeys.reduce(
    (total, sectionKey) => total + getVisibleCriteria(sections[sectionKey]).length,
    0,
  )
  const colSpan = 6 + Math.max(visibleCriteriaCount, 1)

  return (
    <div className="min-h-[420px] max-h-[calc(100vh-280px)] overflow-auto rounded-lg border">
      <Table className="min-w-max">
        <TableHeader>
          <TableRow>
            <TableHead rowSpan={2} className="sticky left-0 top-0 z-30 min-w-[180px] bg-background">
              Candidat
            </TableHead>
            <TableHead rowSpan={2} className="sticky top-0 z-20 min-w-[150px] bg-background">Mon rôle</TableHead>
            <TableHead rowSpan={2} className="sticky top-0 z-20 min-w-[150px] bg-background">Traitement</TableHead>
            <TableHead rowSpan={2} className="sticky top-0 z-20 min-w-[110px] bg-background">Score</TableHead>
            {visibleSectionKeys.length === 0 ? (
              <TableHead rowSpan={2} className="sticky top-0 z-20 bg-background">Critères</TableHead>
            ) : (
              visibleSectionKeys.map((sectionKey) => (
                <TableHead
                  key={sectionKey}
                  colSpan={getVisibleCriteria(sections[sectionKey]).length}
                  className="sticky top-0 z-20 border-l bg-orange-50 text-center font-semibold text-orange-900"
                >
                  {sections[sectionKey]?.title || sectionKey}
                </TableHead>
              ))
            )}
            <TableHead rowSpan={2} className="sticky right-0 top-0 z-30 min-w-[180px] bg-background text-right">
              Action
            </TableHead>
          </TableRow>
          <TableRow>
            {visibleSectionKeys.flatMap((sectionKey) =>
              getVisibleCriteria(sections[sectionKey]).map((criterion) => (
                <TableHead key={`${sectionKey}-${criterion.key}`} className="sticky top-10 z-20 border-l bg-background text-center">
                  {criterion.label}
                </TableHead>
              )),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluations.map((evaluation) => {
            const slot = assignedSlots.find((item) => item.id === evaluation.slot_id)
            const roles = slot ? getEvaluationRoleLabels(slot, currentAdminId) : ["-"]
            const editableSectionKeys = getRoleKeys(roles)
            const treatmentInfo = getTreatmentInfo(evaluation, roles, scorecardConfig)
            const isActive = activeEvaluationId === evaluation.id
            const coachRecommendationLabels = getCoachRecommendationLabels(evaluation)
            const hasCoachRecommendation = coachRecommendationLabels.length > 0
            const hasFilterFailure = isFilterFailure(evaluation)
            const stickyCellTone = hasFilterFailure ? "bg-red-100" : "bg-background"

            return (
              <Fragment key={evaluation.id}>
                <TableRow
                  className={[
                    "cursor-pointer transition-colors",
                    hasFilterFailure ? "bg-red-100/80 hover:bg-red-100" : "",
                    hasCoachRecommendation ? "bg-emerald-50/70 hover:bg-emerald-50" : "",
                    isActive ? "bg-muted/60 ring-1 ring-inset ring-orange-200" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => onSelectEvaluation(evaluation.id)}
                >
                  <TableCell className={`sticky left-0 z-10 font-medium ${stickyCellTone}`}>
                    {[evaluation.candidate_snapshot?.first_name, evaluation.candidate_snapshot?.last_name].filter(Boolean).join(" ") || evaluation.candidate_snapshot?.email || "Candidat"}
                    <p className="text-xs font-normal text-muted-foreground">
                      {evaluation.candidate_snapshot?.email || "-"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {roles.map((role) => (
                        <Badge key={role} variant="outline">{role}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={treatmentInfo.status === "done" ? "secondary" : "outline"} className="w-fit">
                        {treatmentInfo.label}
                      </Badge>
                      {hasCoachRecommendation ? (
                        <Badge className="w-fit bg-emerald-600 hover:bg-emerald-600">
                          Avis coach
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{evaluation.test_score ?? "-"} pts</TableCell>
                  {visibleSectionKeys.length === 0 ? (
                    <TableCell className="text-sm text-muted-foreground">Aucun critère visible.</TableCell>
                  ) : (
                    visibleSectionKeys.flatMap((sectionKey) =>
                      getVisibleCriteria(sections[sectionKey]).map((criterion) => (
                        <TableCell key={`${evaluation.id}-${sectionKey}-${criterion.key}`} className="border-l align-top">
                          {renderCriterionCell({
                            canEdit: editableSectionKeys.includes(sectionKey),
                            criterion,
                            currentAdminName,
                            drafts: inlineDrafts,
                            evaluation,
                            sectionKey,
                            setDrafts,
                          })}
                        </TableCell>
                      )),
                    )
                  )}
                  <TableCell className={`sticky right-0 z-10 text-right ${stickyCellTone}`}>
                    <div className="flex justify-end gap-2">
                      {roles.includes("Validateur") ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            onOpenCoachOpinion(evaluation)
                          }}
                        >
                          Avis coach
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          onSave(evaluation, scorecardConfig, roles)
                        }}
                        disabled={submitting || savingEvaluationId === evaluation.id}
                      >
                        Enregistrer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </Fragment>
            )
          })}
          {evaluations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="text-center text-muted-foreground">
                Aucun candidat.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  )
}

function CoachOpinionDialog({
  evaluation,
  onOpenChange,
  onSave,
  open,
  submitting,
}) {
  const validatorReview = getEvaluationSectionReview(evaluation || {}, "validator")
  const [draft, setDraft] = useState({})

  useEffect(() => {
    if (!open || !evaluation) {
      return
    }
    setDraft({
      coach_pick: Boolean(validatorReview.coach_pick),
      strong_potential: Boolean(validatorReview.strong_potential),
      cohort_balance: Boolean(validatorReview.cohort_balance),
      social_context: Boolean(validatorReview.social_context),
      comment: validatorReview.comment || "",
    })
  }, [
    evaluation,
    open,
    validatorReview.coach_pick,
    validatorReview.cohort_balance,
    validatorReview.comment,
    validatorReview.social_context,
    validatorReview.strong_potential,
  ])

  const candidateName = [
    evaluation?.candidate_snapshot?.first_name,
    evaluation?.candidate_snapshot?.last_name,
  ].filter(Boolean).join(" ") || evaluation?.candidate_snapshot?.email || "Candidat"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Avis coach</DialogTitle>
          <DialogDescription>
            Recommandation qualitative pour {candidateName}. Elle aide la décision finale sans la remplacer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {COACH_RECOMMENDATION_OPTIONS.map((option) => {
              const selected = Boolean(draft[option.key])
              const Icon = option.icon
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setDraft((previous) => ({ ...previous, [option.key]: !selected }))}
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm"
                      : "border-border bg-background hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full p-2 ${
                        selected ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-semibold">{option.label}</span>
                    </div>
                    <Badge variant={selected ? "default" : "outline"}>
                      {selected ? "Retenu" : "Choisir"}
                    </Badge>
                  </div>
                  <p className={`mt-2 text-sm ${selected ? "text-emerald-800" : "text-muted-foreground"}`}>
                    {option.description}
                  </p>
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coach-opinion-comment">Commentaire coach</Label>
            <Textarea
              id="coach-opinion-comment"
              value={draft.comment || ""}
              onChange={(event) => setDraft((previous) => ({ ...previous, comment: event.target.value }))}
              placeholder="Pourquoi recommander ce candidat ? Réserves, potentiel, contexte..."
              className="min-h-28"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            disabled={submitting || !evaluation}
            onClick={() => onSave(evaluation, draft)}
          >
            Enregistrer l'avis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function MyInterviewsPage() {
  const interviews = useCompetencesInterviews({ filterBySelectedCampaign: false })
  const [currentAdminId, setCurrentAdminId] = useState("")
  const [currentAdminType, setCurrentAdminType] = useState("")
  const [currentAdminName, setCurrentAdminName] = useState("")
  const [selectedEvaluationId, setSelectedEvaluationId] = useState("")
  const [coachOpinionEvaluationId, setCoachOpinionEvaluationId] = useState("")
  const [activeEvaluationBySlot, setActiveEvaluationBySlot] = useState({})
  const [inlineDrafts, setInlineDrafts] = useState({})
  const [savingEvaluationId, setSavingEvaluationId] = useState("")
  const [campaignFilter, setCampaignFilter] = useState("all")
  const [slotFilter, setSlotFilter] = useState("all")
  const [candidateSearch, setCandidateSearch] = useState("")
  const [treatmentFilter, setTreatmentFilter] = useState("all")

  useEffect(() => {
    try {
      const admin = JSON.parse(localStorage.getItem("admin_user") || "{}")
      setCurrentAdminId(admin.id || "")
      setCurrentAdminType(admin.admin_type || localStorage.getItem("admin_type") || "")
      setCurrentAdminName([admin.first_name, admin.last_name].filter(Boolean).join(" ").trim())
    } catch {
      setCurrentAdminId("")
      setCurrentAdminType(localStorage.getItem("admin_type") || "")
      setCurrentAdminName("")
    }
  }, [])

  const assignedSlots = useMemo(() => {
    if (!currentAdminId) {
      return []
    }

    return interviews.slots.filter((slot) => getSlotRoles(slot, currentAdminId).length > 0)
  }, [currentAdminId, interviews.slots])

  const assignedSlotIds = useMemo(() => new Set(assignedSlots.map((slot) => slot.id)), [assignedSlots])

  const myEvaluations = useMemo(() => {
    return interviews.evaluations.filter((evaluation) => evaluation.slot_id && assignedSlotIds.has(evaluation.slot_id))
  }, [assignedSlotIds, interviews.evaluations])

  const campaignFilterOptions = useMemo(() => {
    const campaignIds = Array.from(new Set(myEvaluations.map((evaluation) => evaluation.campaign_id).filter(Boolean)))
    return campaignIds.map((campaignId) => {
      const campaign = interviews.campaigns.find((item) => item.id === campaignId)
      const sampleEvaluation = myEvaluations.find((evaluation) => evaluation.campaign_id === campaignId)
      return {
        id: campaignId,
        name: campaign?.name || "Campagne",
        formation: campaign?.formation || sampleEvaluation?.candidate_snapshot?.desired_training || "-",
      }
    })
  }, [interviews.campaigns, myEvaluations])

  const slotFilterOptions = useMemo(() => {
    return assignedSlots.filter((slot) => campaignFilter === "all" || slot.campaign_id === campaignFilter)
  }, [assignedSlots, campaignFilter])

  useEffect(() => {
    setSlotFilter("all")
  }, [campaignFilter])

  useEffect(() => {
    if (slotFilter === "all") {
      return
    }
    if (!slotFilterOptions.some((slot) => slot.id === slotFilter)) {
      setSlotFilter("all")
    }
  }, [slotFilter, slotFilterOptions])

  const filteredEvaluations = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(candidateSearch)
    return myEvaluations.filter((evaluation) => {
      const matchesCampaign = campaignFilter === "all" || evaluation.campaign_id === campaignFilter
      const matchesSlot = slotFilter === "all" || evaluation.slot_id === slotFilter
      const candidate = evaluation.candidate_snapshot || {}
      const searchableText = normalizeSearchValue([
        candidate.first_name,
        candidate.last_name,
        candidate.email,
        candidate.phone,
      ].filter(Boolean).join(" "))
      const matchesCandidate = !normalizedSearch || searchableText.includes(normalizedSearch)
      const slot = assignedSlots.find((item) => item.id === evaluation.slot_id)
      const roles = slot ? getEvaluationRoleLabels(slot, currentAdminId) : ["-"]
      const scorecardConfig = interviews.campaigns.find(
        (campaign) => campaign.id === evaluation.campaign_id,
      )?.scorecard_config || evaluation.campaign_scorecard_config
      const treatmentInfo = getTreatmentInfo(evaluation, roles, scorecardConfig)
      const matchesTreatment = treatmentFilter === "all" || treatmentInfo.status === treatmentFilter
      return matchesCampaign && matchesSlot && matchesCandidate && matchesTreatment
    })
  }, [assignedSlots, campaignFilter, candidateSearch, currentAdminId, interviews.campaigns, myEvaluations, slotFilter, treatmentFilter])

  const evaluationSummary = useMemo(() => {
    return filteredEvaluations.reduce(
      (accumulator, evaluation) => {
        const slot = assignedSlots.find((item) => item.id === evaluation.slot_id)
        const roles = slot ? getEvaluationRoleLabels(slot, currentAdminId) : ["-"]
        const scorecardConfig = interviews.campaigns.find(
          (campaign) => campaign.id === evaluation.campaign_id,
        )?.scorecard_config
        const roleStatus = getRolesSectionStatus(evaluation, roles, scorecardConfig)

        if (roleStatus === "Complétée") {
          accumulator.completed += 1
        } else {
          accumulator.todo += 1
        }

        return accumulator
      },
      {
        todo: 0,
        completed: 0,
      },
    )
  }, [assignedSlots, currentAdminId, filteredEvaluations, interviews.campaigns])

  const selectedEvaluation = useMemo(
    () => filteredEvaluations.find((evaluation) => evaluation.id === selectedEvaluationId) || null,
    [filteredEvaluations, selectedEvaluationId],
  )
  const coachOpinionEvaluation = useMemo(
    () => interviews.evaluations.find((evaluation) => evaluation.id === coachOpinionEvaluationId) || null,
    [coachOpinionEvaluationId, interviews.evaluations],
  )
  const selectedCampaignScorecard = useMemo(
    () => interviews.campaigns.find(
      (campaign) => campaign.id === selectedEvaluation?.campaign_id,
    )?.scorecard_config || selectedEvaluation?.campaign_scorecard_config,
    [interviews.campaigns, selectedEvaluation?.campaign_id],
  )
  const selectedEvaluationRoles = useMemo(() => {
    if (currentAdminType === "super_admin") {
      return ["super_admin"]
    }

    const slot = assignedSlots.find((item) => item.id === selectedEvaluation?.slot_id)
    if (!slot || !currentAdminId) {
      return []
    }

    return getSlotRoles(slot, currentAdminId)
      .map((role) => {
        if (role === "Filtreur") return "filter"
        if (role === "Validateur") return "validator"
        if (role === "Motivation") return "motivation"
        return role
      })
      .filter(Boolean)
	  }, [assignedSlots, currentAdminId, currentAdminType, selectedEvaluation?.slot_id])

  const selectedCoachScorecard = useMemo(
    () => interviews.campaigns.find(
      (campaign) => campaign.id === coachOpinionEvaluation?.campaign_id,
    )?.scorecard_config || coachOpinionEvaluation?.campaign_scorecard_config,
    [coachOpinionEvaluation?.campaign_id, coachOpinionEvaluation?.campaign_scorecard_config, interviews.campaigns],
  )

	  const evaluationsByCampaignAndSlot = useMemo(() => {
    const grouped = filteredEvaluations.reduce((groups, evaluation) => {
      const campaignId = evaluation.campaign_id || "sans-campagne"
      if (!groups[campaignId]) {
        groups[campaignId] = {}
      }
      const slotId = evaluation.slot_id || "sans-creneau"
      if (!groups[campaignId][slotId]) {
        groups[campaignId][slotId] = []
      }
      groups[campaignId][slotId].push(evaluation)
      return groups
    }, {})
    return grouped
	  }, [filteredEvaluations])

  const saveCoachOpinion = async (evaluation, draft) => {
    const validatorSection = selectedCoachScorecard?.sections?.validator
    if (!validatorSection) {
      return
    }

    const currentReview = getEvaluationSectionReview(evaluation, "validator")
    const validatorReview = {
      ...currentReview,
      interviewer: currentAdminName || currentReview.interviewer || currentReview._owner_name || "",
      coach_pick: Boolean(draft.coach_pick),
      strong_potential: Boolean(draft.strong_potential),
      cohort_balance: Boolean(draft.cohort_balance),
      social_context: Boolean(draft.social_context),
      comment: String(draft.comment || "").trim(),
    }

    await interviews.handleUpdateEvaluation(evaluation.id, {
      validator_review: validatorReview,
    })
    setCoachOpinionEvaluationId("")
  }

  const saveInlineEvaluation = async (evaluation, scorecardConfig, roles) => {
    const roleKeys = getRoleKeys(roles)
    const sections = scorecardConfig?.sections || {}
    const payload = {}

    roleKeys.forEach((sectionKey) => {
      const reviewField = REVIEW_FIELD_BY_SECTION[sectionKey]
      if (!reviewField || !sections[sectionKey]) {
        return
      }
      payload[reviewField] = buildInlineReview(
        evaluation,
        inlineDrafts,
        sectionKey,
        sections[sectionKey],
        currentAdminName,
      )
    })

    try {
      setSavingEvaluationId(evaluation.id)
      await interviews.handleUpdateEvaluation(evaluation.id, payload)
      setInlineDrafts((previous) => {
        const next = { ...previous }
        delete next[evaluation.id]
        return next
      })
    } finally {
      setSavingEvaluationId("")
    }
  }

  if (interviews.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <CalendarClock className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 pt-4 sm:p-6 sm:pt-6 md:p-8">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Espace jury</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Mes entretiens à traiter</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Choisissez un référentiel puis un créneau pour travailler dans un tableau clair, sans mélanger les candidats.
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            {assignedSlots.length} créneau(x)
          </Badge>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              À renseigner
            </CardDescription>
            <CardTitle className="text-3xl">{evaluationSummary.todo}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Complétées
            </CardDescription>
            <CardTitle className="text-3xl">{evaluationSummary.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Créneaux affectés
            </CardDescription>
            <CardTitle className="text-3xl">{assignedSlots.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="sticky top-0 z-30 bg-background/95 shadow-sm backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle>Filtres rapides</CardTitle>
          <CardDescription>Gardez le bon référentiel, créneau ou candidat sans remonter toute la page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
            <div className="space-y-2">
              <Label>Référentiel / campagne</Label>
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les référentiels</SelectItem>
                  {campaignFilterOptions.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.formation} - {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Créneau</Label>
              <Select value={slotFilter} onValueChange={setSlotFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les créneaux</SelectItem>
                  {slotFilterOptions.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rechercher un candidat</Label>
              <Input
                value={candidateSearch}
                onChange={(event) => setCandidateSearch(event.target.value)}
                placeholder="Nom, email ou téléphone"
              />
            </div>
            <div className="space-y-2">
              <Label>État</Label>
              <Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="todo">À traiter</SelectItem>
                  <SelectItem value="done">Traités</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCampaignFilter("all")
                setSlotFilter("all")
                setCandidateSearch("")
                setTreatmentFilter("all")
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Tableau d'entretien</CardTitle>
              <CardDescription>
                Vue type Excel: les candidats sont en lignes, les critères du référentiel sont en colonnes.
              </CardDescription>
            </div>
            <PageSizeSelector
              value={interviews.pageSize}
              onChange={(nextPageSize) => {
                interviews.setPage(1)
                interviews.setPageSize(nextPageSize)
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
	          {filteredEvaluations.length === 0 ? (
	            <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
	              Aucun candidat pour les filtres sélectionnés.
	            </div>
	          ) : (
	            Object.entries(evaluationsByCampaignAndSlot).map(([campaignId, evaluationsBySlot]) => {
	              const campaign = interviews.campaigns.find((item) => item.id === campaignId)
	              const campaignEvaluations = Object.values(evaluationsBySlot).flat()
	              const scorecardConfig = campaign?.scorecard_config || campaignEvaluations[0]?.campaign_scorecard_config || {}

	              return (
			                <div key={campaignId} className="space-y-4 rounded-xl border p-3">
	                  <div className="flex flex-wrap items-center justify-between gap-3">
	                    <div>
	                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
	                        Référentiel
	                      </p>
	                      <h3 className="mt-1 font-semibold">
	                        {campaign?.formation || campaignEvaluations[0]?.candidate_snapshot?.desired_training || "-"}
	                      </h3>
	                      <p className="text-sm text-muted-foreground">Campagne: {campaign?.name || "-"}</p>
	                    </div>
	                    <Badge variant="outline">{campaignEvaluations.length} candidat(s)</Badge>
	                  </div>

	                  <div className="space-y-5">
	                    {Object.entries(evaluationsBySlot).map(([slotId, slotEvaluations]) => {
		                      const slot = assignedSlots.find((item) => item.id === slotId)
		                      const firstEvaluation = slotEvaluations[0]
		                      const roles = slot ? getEvaluationRoleLabels(slot, currentAdminId) : ["-"]
		                      const shouldShowFilterQuestions = roles.includes("Filtreur") || roles.includes("Validateur")
                              const activeEvaluationId = activeEvaluationBySlot[slotId] || firstEvaluation?.id || ""
                              const activeEvaluation = slotEvaluations.find((evaluation) => evaluation.id === activeEvaluationId) || firstEvaluation
		                      return (
				                        <div key={slotId} className="space-y-3 rounded-lg border bg-background p-3">
		                          <div className="flex flex-wrap items-center justify-between gap-2">
		                            <div>
		                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
		                                Créneau
		                              </p>
		                              <p className="font-medium">{slot?.label || "Créneau non défini"}</p>
		                              <p className="text-sm text-muted-foreground">
		                                {slot?.start_at ? new Date(slot.start_at).toLocaleString("fr-FR") : "-"}
		                              </p>
	                            </div>
	                            <div className="flex flex-wrap gap-2">
	                              <Badge variant="secondary">{slotEvaluations.length} candidat(s)</Badge>
		                              <Badge variant="outline">
		                                {firstEvaluation?.candidate_snapshot?.desired_training || campaign?.formation || "-"}
		                              </Badge>
		                              {roles.map((role) => (
		                                <Badge key={role} variant="outline">Mon rôle: {role}</Badge>
		                              ))}
		                            </div>
			                          </div>

	                              <div className={shouldShowFilterQuestions ? "grid gap-4 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] lg:items-start" : ""}>
                                {shouldShowFilterQuestions ? (
                                  <aside className="lg:sticky lg:top-4 lg:self-start">
                                    <InterviewQuestionsSidebar
                                      questions={campaign?.filter_questions || []}
                                      selectedEvaluation={activeEvaluation}
                                    />
                                  </aside>
                                ) : null}

                                <div className="min-w-0">
                                  <InterviewEvaluationTable
                                    activeEvaluationId={activeEvaluationId}
                                    assignedSlots={assignedSlots}
                                    currentAdminId={currentAdminId}
                                    currentAdminName={currentAdminName}
                                    evaluations={slotEvaluations}
	                                    inlineDrafts={inlineDrafts}
	                                    onOpenCoachOpinion={(evaluation) => setCoachOpinionEvaluationId(evaluation.id)}
	                                    onSelectEvaluation={(evaluationId) =>
                                      setActiveEvaluationBySlot((previous) => ({
                                        ...previous,
                                        [slotId]: evaluationId,
                                      }))
                                    }
                                    onSave={saveInlineEvaluation}
                                    savingEvaluationId={savingEvaluationId}
                                    scorecardConfig={scorecardConfig}
                                    setDrafts={setInlineDrafts}
                                    submitting={interviews.submitting}
                                  />
                                </div>
                              </div>
                        </div>
                      )
                    })}
	                  </div>
	                </div>
	              )
	            })
          )}
          <PaginationControls
            page={interviews.pagination.page}
            pageSize={interviews.pagination.page_size}
            totalItems={interviews.pagination.total}
            itemLabel="candidat(s)"
            onPageChange={interviews.setPage}
          />
        </CardContent>
	      </Card>

      <CoachOpinionDialog
        evaluation={coachOpinionEvaluation}
        onOpenChange={(open) => {
          if (!open) {
            setCoachOpinionEvaluationId("")
          }
        }}
        onSave={saveCoachOpinion}
        open={Boolean(coachOpinionEvaluation)}
        submitting={interviews.submitting}
      />

	      <CompetencesInterviewEvaluationDialog
        open={Boolean(selectedEvaluation)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEvaluationId("")
          }
        }}
        evaluation={selectedEvaluation}
        slots={assignedSlots}
        campaignScorecard={selectedCampaignScorecard}
        viewerRole={selectedEvaluationRoles[0] || ""}
        viewerRoles={selectedEvaluationRoles}
        currentAdminName={currentAdminName}
        submitting={interviews.submitting}
        onSave={interviews.handleUpdateEvaluation}
      />
    </div>
  )
}
