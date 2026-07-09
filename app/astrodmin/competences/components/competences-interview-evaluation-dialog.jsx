"use client"

import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getInterviewScorecardConfig } from "../interview-scorecards"

const FINAL_STATUS_OPTIONS = [
  { value: "en_attente", label: "En attente" },
  { value: "retenu", label: "Retenu" },
  { value: "liste_attente", label: "Liste d'attente" },
  { value: "rejete", label: "Rejeté" },
]

const INTERVIEW_PROGRESS_OPTIONS = [
  { value: "a_planifier", label: "À planifier" },
  { value: "planifie", label: "Planifié" },
  { value: "passe", label: "Passé" },
  { value: "absent", label: "Absent" },
]

const VIEWER_ROLE_LABELS = {
  super_admin: "Super admin",
  filter: "Filtreur",
  validator: "Validateur",
  motivation: "Motivation",
}

const TEST_RESULT_STATUS_LABELS = {
  admis: "Admis au test",
  rejeté: "Non admis au test",
  pending: "Résultat en attente",
}

const REVIEW_FIELD_BY_SECTION = {
  filter: "filter_review",
  validator: "validator_review",
  motivation: "motivation_review",
}

const SECTION_VISIBILITY_BY_ROLE = {
  filter: ["filter"],
  validator: ["filter", "validator"],
  motivation: ["filter", "validator", "motivation"],
}

function isSectionAllowedForRoles(sectionKey, section, roles) {
  if (roles.includes(sectionKey)) {
    return true
  }
  const sectionRoles = section?.roles || []
  return sectionRoles.some((role) => roles.includes(role))
}

function getVisibleSectionKeys(sectionKeys, roles) {
  if (roles.includes("super_admin")) {
    return sectionKeys
  }

  const visibleKeys = new Set()
  roles.forEach((role) => {
    ;(SECTION_VISIBILITY_BY_ROLE[role] || [role]).forEach((sectionKey) => {
      if (sectionKeys.includes(sectionKey)) {
        visibleKeys.add(sectionKey)
      }
    })
  })

  return sectionKeys.filter((sectionKey) => visibleKeys.has(sectionKey))
}

function isSectionEditable(sectionKey, section, roles) {
  if (roles.includes("super_admin")) {
    return false
  }
  return isSectionAllowedForRoles(sectionKey, section, roles)
}

function formatTestScore(score) {
  return Number.isFinite(Number(score)) ? `${Number(score)} points` : "Non disponible"
}

function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value || "-"
}

function normalizeInterviewProgressStatus(value) {
  if (["a_convoyer", "convoque"].includes(value)) return "planifie"
  if (["present", "evalue", "valide"].includes(value)) return "passe"
  if (value === "absent") return "absent"
  if (value === "planifie") return "planifie"
  return "a_planifier"
}

function normalizeFinalStatus(value) {
  if (["retenu", "liste_attente", "rejete", "en_attente"].includes(value)) {
    return value
  }
  if (["a_planifier", "planifie"].includes(value)) {
    return "en_attente"
  }
  if (value === "absent") {
    return "rejete"
  }
  return "en_attente"
}

function normalizeCheckboxValue(value) {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value > 0
  if (typeof value === "string") {
    return ["true", "1", "yes", "oui", "validé", "valide"].includes(value.trim().toLowerCase())
  }
  return false
}

function buildInitialForm(evaluation, scorecard) {
  const sectionReviews = evaluation?.section_reviews || {}
  const filterAntiCheat = normalizeCheckboxValue(evaluation?.filter_review?.anti_cheat_score)
  const filterLogic = normalizeCheckboxValue(
    evaluation?.filter_review?.logic_score ?? evaluation?.filter_review?.communication_score,
  )

  const form = {
    slot_id: evaluation?.slot_id || "none",
    interview_progress_status: normalizeInterviewProgressStatus(evaluation?.interview_progress_status),
    final_status: normalizeFinalStatus(evaluation?.final_status),
    filter_interviewer: evaluation?.filter_review?.interviewer || "",
    filter_comment: evaluation?.filter_review?.comment || evaluation?.filter_review?.strengths || "",
    filter_anti_cheat_score: filterAntiCheat,
    filter_logic_score: filterLogic,
    filter_total_score: Number(filterAntiCheat) + Number(filterLogic),
    filter_decision: evaluation?.filter_review?.decision || "",
    filter_concerns: evaluation?.filter_review?.concerns || "",
    validator_interviewer: evaluation?.validator_review?.interviewer || "",
    validator_algorithm_logic_score: normalizeCheckboxValue(evaluation?.validator_review?.algorithm_logic_score),
    validator_verdict: evaluation?.validator_review?.verdict || evaluation?.validator_review?.decision || "",
    validator_comment: evaluation?.validator_review?.comment || evaluation?.validator_review?.notes || "",
    motivation_interviewer: evaluation?.motivation_review?.interviewer || "",
    motivation_comment: evaluation?.motivation_review?.comment || evaluation?.motivation_review?.notes || "",
    is_locked: Boolean(evaluation?.is_locked),
  }

  const reviews = {
    filter: sectionReviews.filter || evaluation?.filter_review || {},
    validator: sectionReviews.validator || evaluation?.validator_review || {},
    motivation: sectionReviews.motivation || evaluation?.motivation_review || {},
    ...sectionReviews,
  }
  Object.entries(scorecard || {}).forEach(([sectionKey, section]) => {
    ;(section?.criteria || []).forEach((criterion) => {
      if (criterion.type === "computed") {
        return
      }
      const rawValue = reviews[sectionKey]?.[criterion.key]
      form[`${sectionKey}_${criterion.key}`] = criterion.type === "checkbox"
        ? normalizeCheckboxValue(rawValue)
        : rawValue ?? ""
    })
  })

  return form
}

function getFieldValue(form, sectionKey, criterionKey) {
  return form[`${sectionKey}_${criterionKey}`] ?? ""
}

function setFieldValue(setForm, sectionKey, criterionKey, value) {
  setForm((prev) => ({
    ...prev,
    [`${sectionKey}_${criterionKey}`]: value,
  }))
}

function isFilledValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== ""
}

function buildSectionReview(form, sectionKey, section, currentReview) {
  const review = { ...(currentReview || {}) }

  ;(section?.criteria || []).forEach((criterion) => {
    if (criterion.type === "computed") {
      const dependencies = criterion.depends_on || []
      review[criterion.key] = dependencies.reduce(
        (total, dependency) => total + Number(Boolean(form[`${sectionKey}_${dependency}`])),
        0,
      )
      return
    }

    const value = getFieldValue(form, sectionKey, criterion.key)
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

function criterionColumnClass(type) {
  if (type === "textarea") return "min-w-[260px]"
  if (type === "select") return "min-w-[180px]"
  if (type === "checkbox" || type === "computed") return "min-w-[120px]"
  return "min-w-[180px]"
}

function renderCriterionControl({
  canEdit,
  criterion,
  form,
  sectionKey,
  setForm,
}) {
  const fieldId = `${sectionKey}-${criterion.key}`
  const value = getFieldValue(form, sectionKey, criterion.key)

  if (criterion.type === "textarea") {
    return (
      <Textarea
        id={fieldId}
        value={value}
        onChange={(event) => setFieldValue(setForm, sectionKey, criterion.key, event.target.value)}
        placeholder={criterion.placeholder}
        disabled={!canEdit}
        className="min-h-24"
      />
    )
  }

  if (criterion.type === "select") {
    return (
      <Select
        value={value || "none"}
        onValueChange={(nextValue) =>
          setFieldValue(setForm, sectionKey, criterion.key, nextValue === "none" ? "" : nextValue)
        }
        disabled={!canEdit}
      >
        <SelectTrigger>
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

  if (criterion.type === "checkbox") {
    return (
      <div className="flex justify-center">
        <Checkbox
          id={fieldId}
          checked={Boolean(value)}
          onCheckedChange={(checked) =>
            setFieldValue(setForm, sectionKey, criterion.key, Boolean(checked))
          }
          disabled={!canEdit}
        />
      </div>
    )
  }

  if (criterion.type === "computed") {
    const computedValue = (criterion.depends_on || []).reduce(
      (total, dependency) => total + Number(Boolean(form[`${sectionKey}_${dependency}`])),
      0,
    )

    return (
      <div className="rounded-md border bg-muted/40 px-3 py-2 text-center text-sm font-semibold">
        {computedValue} {criterion.suffix || ""}
      </div>
    )
  }

  return (
    <Input
      id={fieldId}
      type={criterion.type === "number" ? "number" : "text"}
      min={criterion.min}
      max={criterion.max}
      value={value}
      onChange={(event) => setFieldValue(setForm, sectionKey, criterion.key, event.target.value)}
      placeholder={criterion.placeholder}
      disabled={!canEdit}
    />
  )
}

function TestDetailsPanel({ testDetails }) {
  const [visibleQuestionsCount, setVisibleQuestionsCount] = useState(5)

  useEffect(() => {
    setVisibleQuestionsCount(5)
  }, [testDetails?.testId])

  if (!testDetails) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Aucun détail de test en ligne trouvé pour ce candidat.
      </div>
    )
  }

  const questions = (testDetails.questions || []).filter((question) => question.isCorrect)
  const visibleQuestions = questions.slice(0, visibleQuestionsCount)
  const hasMoreQuestions = questions.length > visibleQuestionsCount
  const canReduceQuestions = visibleQuestionsCount > 5

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div>
        <h3 className="font-semibold">Questions trouvées par le candidat</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {testDetails.testTitle || "Test"} · {questions.length} question(s) trouvée(s)
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table className="min-w-[620px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">N°</TableHead>
              <TableHead>Question trouvée</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  Aucune question trouvée par ce candidat.
                </TableCell>
              </TableRow>
            ) : (
              visibleQuestions.map((question) => (
                <TableRow key={question.index}>
                  <TableCell>{question.index}</TableCell>
                  <TableCell className="max-w-[620px] whitespace-pre-wrap">{question.question}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {questions.length > 5 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {visibleQuestions.length} question(s) affichée(s) sur {questions.length}.
          </p>
          <div className="flex gap-2">
            {canReduceQuestions && (
              <Button type="button" variant="outline" size="sm" onClick={() => setVisibleQuestionsCount(5)}>
                Réduire la liste
              </Button>
            )}
            {hasMoreQuestions && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVisibleQuestionsCount((count) => Math.min(count + 5, questions.length))}
              >
                Afficher 5 de plus
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CompetencesInterviewEvaluationDialog({
  open,
  onOpenChange,
  evaluation,
  slots,
  campaignScorecard,
  viewerRole = "super_admin",
  viewerRoles,
  currentAdminName = "",
  submitting,
  onSave,
}) {
  const scorecardConfig = useMemo(
    () => getInterviewScorecardConfig(
      evaluation?.candidate_snapshot?.desired_training,
      campaignScorecard,
    ),
    [campaignScorecard, evaluation?.candidate_snapshot?.desired_training],
  )
  const scorecard = scorecardConfig.scorecard
  const effectiveViewerRoles = useMemo(
    () => {
      if (viewerRole === "super_admin") {
        return ["super_admin"]
      }
      const roles = Array.isArray(viewerRoles) && viewerRoles.length > 0
        ? viewerRoles
        : [viewerRole].filter(Boolean)
      return Array.from(new Set(roles))
    },
    [viewerRole, viewerRoles],
  )
  const [form, setForm] = useState(() => buildInitialForm(evaluation, scorecard))

  useEffect(() => {
    setForm(buildInitialForm(evaluation, scorecard))
  }, [evaluation, scorecard])

  useEffect(() => {
    if (!currentAdminName || effectiveViewerRoles.includes("super_admin")) {
      return
    }

    setForm((prev) => {
      const next = { ...prev }
      let changed = false
      Object.entries(scorecard || {}).forEach(([sectionKey, section]) => {
        if (!isSectionAllowedForRoles(sectionKey, section, effectiveViewerRoles)) {
          return
        }
        const interviewerKey = `${sectionKey}_interviewer`
        if (!next[interviewerKey]) {
          next[interviewerKey] = currentAdminName
          changed = true
        }
      })
      if (changed) {
        return next
      }
      return prev
    })
  }, [currentAdminName, effectiveViewerRoles, scorecard])

  const candidateName = useMemo(() => {
    return [evaluation?.candidate_snapshot?.first_name, evaluation?.candidate_snapshot?.last_name].filter(Boolean).join(" ")
  }, [evaluation])
	  const visibleSections = useMemo(() => {
	    const sectionKeys = Object.keys(scorecard || {})
	    return getVisibleSectionKeys(sectionKeys, effectiveViewerRoles)
	  }, [effectiveViewerRoles, scorecard])
	  const canManagePlanning = effectiveViewerRoles.includes("super_admin")
	  const editableSections = useMemo(
	    () => visibleSections.filter((sectionKey) =>
	      isSectionEditable(sectionKey, scorecard[sectionKey], effectiveViewerRoles),
	    ),
	    [effectiveViewerRoles, scorecard, visibleSections],
	  )
	  const visibleStatusCards = useMemo(() => visibleSections, [visibleSections])
  const sectionCompletion = useMemo(() => {
    const sectionKeys = Object.keys(scorecard || {})

    return sectionKeys.reduce((accumulator, sectionKey) => {
      const section = scorecard[sectionKey]
      if (!section) {
        accumulator[sectionKey] = false
        return accumulator
      }

      const requiredCriteria = section.criteria.filter((criterion) => criterion.required)
      accumulator[sectionKey] = section.criteria.length > 0 && requiredCriteria.every((criterion) =>
        isFilledValue(getFieldValue(form, sectionKey, criterion.key)),
      )

      return accumulator
    }, {})
  }, [form, scorecard])
  const isEvaluationComplete = useMemo(
    () => Object.keys(scorecard || {}).every((sectionKey) => sectionCompletion[sectionKey]),
    [scorecard, sectionCompletion],
  )
  const decisionSummary = useMemo(() => {
    if (!isEvaluationComplete) {
      return {
        label: "À compléter",
        description: "Toutes les sections doivent être renseignées avant la décision finale.",
        tone: "text-amber-600",
      }
    }

    if (form.final_status === "en_attente") {
      return {
        label: "Décision à choisir",
        description: "La fiche est complète. Choisissez Retenu, Liste d'attente ou Rejeté.",
        tone: "text-blue-600",
      }
    }

    return {
      label: "Décision enregistrée",
      description: "La fiche est complète et la décision finale est renseignée.",
      tone: "text-green-600",
    }
  }, [form.final_status, isEvaluationComplete])

  if (!evaluation) {
    return null
  }

	  const handleSubmit = async () => {
	    const reviewPayload = {}
	    editableSections.forEach((sectionKey) => {
	      const reviewField = REVIEW_FIELD_BY_SECTION[sectionKey]
	      if (reviewField) {
        reviewPayload[reviewField] = buildSectionReview(
          form,
          sectionKey,
          scorecard[sectionKey],
          evaluation[reviewField],
        )
      }
    })

    await onSave(evaluation.id, {
      slot_id: form.slot_id === "none" ? "" : form.slot_id,
      interview_progress_status: form.interview_progress_status,
      final_status: form.final_status,
      is_locked: form.is_locked,
      ...reviewPayload,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-h-[90vh] overflow-y-auto ${canManagePlanning ? "max-w-2xl" : "max-w-4xl"}`}>
        <DialogHeader>
          <DialogTitle>{canManagePlanning ? "Synthèse décisionnelle" : "Fiche d'entretien"}</DialogTitle>
	          <DialogDescription>
	            {canManagePlanning
	              ? "Vérifiez l'état du dossier et enregistrez la décision finale."
	              : "Consultez les étapes précédentes et renseignez uniquement votre partie modifiable."}
	          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{candidateName || evaluation.candidate_snapshot?.email || "Candidat"}</p>
                <p className="text-sm text-muted-foreground">
                  {evaluation.candidate_snapshot?.email || "-"} · {evaluation.candidate_snapshot?.phone || "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Référentiel: {scorecardConfig.formationLabel || evaluation.candidate_snapshot?.desired_training || "-"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-lg border bg-muted/30 px-3 py-2 text-right">
                  <p className="text-xs text-muted-foreground">Score test en ligne</p>
                  <p className="font-semibold">{formatTestScore(evaluation.test_score)}</p>
                  {evaluation.test_result_status ? (
                    <p className="text-xs text-muted-foreground">
                      {TEST_RESULT_STATUS_LABELS[evaluation.test_result_status] || evaluation.test_result_status}
                    </p>
                  ) : null}
                </div>
                {canManagePlanning ? (
                  <Badge variant="outline">
                    {FINAL_STATUS_OPTIONS.find((option) => option.value === form.final_status)?.label || form.final_status}
                  </Badge>
                ) : null}
              </div>
            </div>
            {!canManagePlanning ? (
            <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              {scorecardConfig.sourceLabel}
            </div>
            ) : null}
          </div>

          <div className={`grid gap-3 ${visibleStatusCards.length > 1 ? "md:grid-cols-3" : "md:grid-cols-1"}`}>
            {visibleStatusCards.filter((sectionKey) => sectionKey !== "global").map((sectionKey) => (
              <div key={sectionKey} className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">{scorecard[sectionKey]?.title || sectionKey}</p>
                <p className={`font-medium ${sectionCompletion[sectionKey] ? "text-green-600" : "text-amber-600"}`}>
                  {sectionCompletion[sectionKey] ? "Complété" : "Incomplet"}
                </p>
              </div>
            ))}
          </div>

          {!canManagePlanning ? <TestDetailsPanel testDetails={evaluation.test_details} /> : null}

          <div className={canManagePlanning ? "space-y-4" : "grid gap-6 lg:grid-cols-2"}>
            {canManagePlanning ? (
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Décision finale</h3>

                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className={`font-medium ${decisionSummary.tone}`}>{decisionSummary.label}</p>
                  <p className="mt-1 text-muted-foreground">{decisionSummary.description}</p>
                </div>

                <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                  <p>
                    Créneau: <span className="font-medium text-foreground">{slots.find((slot) => slot.id === evaluation.slot_id)?.label || "Non attribué"}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Statut final</Label>
                  <Select
                    value={form.final_status}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, final_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FINAL_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Mon intervention</h3>
                <div className="rounded-lg border p-3 text-sm">
                  <p>Rôle(s): {effectiveViewerRoles.map((role) => VIEWER_ROLE_LABELS[role] || role).join(", ") || "-"}</p>
                  <p>Créneau: {slots.find((slot) => slot.id === evaluation.slot_id)?.label || "Non attribué"}</p>
                  <p>
                    Statut entretien: {getOptionLabel(INTERVIEW_PROGRESS_OPTIONS, form.interview_progress_status)}
                  </p>
                </div>
              </div>
            )}

            {!canManagePlanning ? (
            <div className="space-y-4 rounded-lg border p-4">
              <div>
                <h3 className="font-semibold">Fiche d'évaluation</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Structure alignée sur la logique Excel, avec des colonnes générées selon le référentiel.
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow>
                      <TableHead rowSpan={2} className="sticky left-0 z-20 min-w-[180px] bg-background">
                        Nom
                      </TableHead>
                      <TableHead rowSpan={2} className="min-w-[220px]">Email</TableHead>
                      <TableHead rowSpan={2} className="min-w-[140px]">Téléphone</TableHead>
                      <TableHead rowSpan={2} className="min-w-[110px]">Score</TableHead>
                      <TableHead rowSpan={2} className="min-w-[90px]">Sexe</TableHead>
                      {Object.entries(scorecard || {})
                        .filter(([sectionKey]) => visibleSections.includes(sectionKey))
                        .map(([sectionKey, section]) => (
                          <TableHead
                            key={sectionKey}
                            colSpan={(section.criteria || []).length}
                            className="border-l bg-orange-50 text-center font-semibold text-orange-900"
                          >
                            {section.title || sectionKey}
                          </TableHead>
                        ))}
                    </TableRow>
                    <TableRow>
                      {Object.entries(scorecard || {})
                        .filter(([sectionKey]) => visibleSections.includes(sectionKey))
                        .flatMap(([sectionKey, section]) =>
                          (section.criteria || []).map((criterion) => (
                            <TableHead
                              key={`${sectionKey}-${criterion.key}`}
                              className={`border-l text-center ${criterionColumnClass(criterion.type)}`}
                            >
                              {criterion.label}
                            </TableHead>
                          )),
                        )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="sticky left-0 z-10 bg-background font-medium">
                        {candidateName || evaluation.candidate_snapshot?.email || "Candidat"}
                      </TableCell>
                      <TableCell>{evaluation.candidate_snapshot?.email || "-"}</TableCell>
                      <TableCell>{evaluation.candidate_snapshot?.phone || "-"}</TableCell>
                      <TableCell>{formatTestScore(evaluation.test_score)}</TableCell>
                      <TableCell>{evaluation.candidate_snapshot?.gender || "-"}</TableCell>
                      {Object.entries(scorecard || {})
                        .filter(([sectionKey]) => visibleSections.includes(sectionKey))
                        .flatMap(([sectionKey, section]) =>
                          (section.criteria || []).map((criterion) => (
                            <TableCell
                              key={`${sectionKey}-${criterion.key}`}
                              className={`border-l align-top ${criterionColumnClass(criterion.type)}`}
                            >
                              {renderCriterionControl({
	                                canEdit: editableSections.includes(sectionKey),
                                criterion,
                                form,
                                sectionKey,
                                setForm,
                              })}
                            </TableCell>
                          )),
                        )}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
              <Button onClick={handleSubmit} disabled={submitting || visibleSections.length === 0}>
            {canManagePlanning ? "Enregistrer la décision" : "Enregistrer la fiche"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
