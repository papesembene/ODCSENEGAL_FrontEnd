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
    filter: evaluation?.filter_review || {},
    validator: evaluation?.validator_review || {},
    motivation: evaluation?.motivation_review || {},
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

export default function CompetencesInterviewEvaluationDialog({
  open,
  onOpenChange,
  evaluation,
  slots,
  campaignScorecard,
  viewerRole = "super_admin",
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
  const [form, setForm] = useState(() => buildInitialForm(evaluation, scorecard))

  useEffect(() => {
    setForm(buildInitialForm(evaluation, scorecard))
  }, [evaluation, scorecard])

  useEffect(() => {
    if (!currentAdminName || viewerRole === "super_admin") {
      return
    }

    setForm((prev) => {
      if (viewerRole === "filter" && !prev.filter_interviewer) {
        return { ...prev, filter_interviewer: currentAdminName }
      }
      if (viewerRole === "validator" && !prev.validator_interviewer) {
        return { ...prev, validator_interviewer: currentAdminName }
      }
      if (viewerRole === "motivation" && !prev.motivation_interviewer) {
        return { ...prev, motivation_interviewer: currentAdminName }
      }
      return prev
    })
  }, [currentAdminName, viewerRole])

  const candidateName = useMemo(() => {
    return [evaluation?.candidate_snapshot?.first_name, evaluation?.candidate_snapshot?.last_name].filter(Boolean).join(" ")
  }, [evaluation])
  const visibleSections = useMemo(() => {
    if (viewerRole === "super_admin") {
      return ["filter", "validator", "motivation"]
    }

    if (viewerRole === "filter") {
      return ["filter"]
    }

    if (viewerRole === "validator") {
      return ["validator"]
    }

    if (viewerRole === "motivation") {
      return ["motivation"]
    }

    return []
  }, [viewerRole])
  const canManagePlanning = viewerRole === "super_admin"
  const canEditJurySection = viewerRole !== "super_admin"
  const visibleStatusCards = useMemo(() => {
    if (viewerRole === "super_admin") {
      return ["filter", "validator", "motivation", "global"]
    }

    if (viewerRole === "filter") {
      return ["filter"]
    }

    if (viewerRole === "validator") {
      return ["validator"]
    }

    if (viewerRole === "motivation") {
      return ["motivation"]
    }

    return []
  }, [viewerRole])
  const sectionCompletion = useMemo(() => {
    const sectionKeys = ["filter", "validator", "motivation"]

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
    () => ["filter", "validator", "motivation"].every((sectionKey) => sectionCompletion[sectionKey]),
    [sectionCompletion],
  )
  const decisionSummary = useMemo(() => {
    if (!isEvaluationComplete) {
      return {
        label: "Fiche incomplète",
        description: "La décision finale reste provisoire tant que les 3 étapes ne sont pas renseignées.",
        tone: "text-amber-600",
      }
    }

    if (form.interview_progress_status !== "passe") {
      return {
        label: "Entretien non finalisé",
        description: "La fiche est complète, mais le statut entretien doit passer à 'Passé' pour clôturer proprement.",
        tone: "text-blue-600",
      }
    }

    return {
      label: "Prête à décision",
      description: "La fiche est complète et l'entretien est marqué comme passé.",
      tone: "text-green-600",
    }
  }, [form.interview_progress_status, isEvaluationComplete])

  if (!evaluation) {
    return null
  }

  const handleSubmit = async () => {
    await onSave(evaluation.id, {
      slot_id: form.slot_id === "none" ? "" : form.slot_id,
      interview_progress_status: form.interview_progress_status,
      final_status: form.final_status,
      is_locked: form.is_locked,
      filter_review: buildSectionReview(form, "filter", scorecard.filter, evaluation.filter_review),
      validator_review: buildSectionReview(form, "validator", scorecard.validator, evaluation.validator_review),
      motivation_review: buildSectionReview(form, "motivation", scorecard.motivation, evaluation.motivation_review),
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fiche d&apos;entretien</DialogTitle>
          <DialogDescription>
            {canManagePlanning
              ? "Consultez les avis des jurys et officialisez la décision finale."
              : "Renseignez uniquement votre section d'évaluation pour ce candidat."}
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
            <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              {scorecardConfig.sourceLabel}
            </div>
          </div>

          <div className={`grid gap-3 ${visibleStatusCards.length > 1 ? "md:grid-cols-4" : "md:grid-cols-1"}`}>
            {visibleStatusCards.includes("filter") ? (
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">Filtreur</p>
                <p className={`font-medium ${sectionCompletion.filter ? "text-green-600" : "text-amber-600"}`}>
                  {sectionCompletion.filter ? "Complété" : "Incomplet"}
                </p>
              </div>
            ) : null}
            {visibleStatusCards.includes("validator") ? (
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">Validateur</p>
                <p className={`font-medium ${sectionCompletion.validator ? "text-green-600" : "text-amber-600"}`}>
                  {sectionCompletion.validator ? "Complété" : "Incomplet"}
                </p>
              </div>
            ) : null}
            {visibleStatusCards.includes("motivation") ? (
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">Motivation</p>
                <p className={`font-medium ${sectionCompletion.motivation ? "text-green-600" : "text-amber-600"}`}>
                  {sectionCompletion.motivation ? "Complété" : "Incomplet"}
                </p>
              </div>
            ) : null}
            {visibleStatusCards.includes("global") ? (
              <div className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">Fiche globale</p>
                <p className={`font-medium ${isEvaluationComplete ? "text-green-600" : "text-amber-600"}`}>
                  {isEvaluationComplete ? "Complète" : "Incomplète"}
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {canManagePlanning ? (
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Suivi administratif</h3>

                <div className="rounded-lg border p-3 text-sm">
                  <p className="text-muted-foreground">Lecture rapide</p>
                  <p className={`mt-1 font-medium ${decisionSummary.tone}`}>{decisionSummary.label}</p>
                  <p className="mt-1 text-muted-foreground">{decisionSummary.description}</p>
                </div>

                <div className="rounded-lg border p-3 text-sm">
                  <p>
                    Créneau: <span className="font-medium">{slots.find((slot) => slot.id === evaluation.slot_id)?.label || "Non attribué"}</span>
                  </p>
                  <p>
                    Avancement: <span className="font-medium">{getOptionLabel(INTERVIEW_PROGRESS_OPTIONS, form.interview_progress_status)}</span>
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
                  <p>Rôle: {VIEWER_ROLE_LABELS[viewerRole] || "-"}</p>
                  <p>Créneau: {slots.find((slot) => slot.id === evaluation.slot_id)?.label || "Non attribué"}</p>
                  <p>
                    Statut entretien: {getOptionLabel(INTERVIEW_PROGRESS_OPTIONS, form.interview_progress_status)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4 rounded-lg border p-4">
              {[["filter", scorecard.filter], ["validator", scorecard.validator], ["motivation", scorecard.motivation]].filter(
                ([sectionKey]) => visibleSections.includes(sectionKey),
              ).map(
                ([sectionKey, section]) => (
                  <div key={sectionKey} className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">{section.title}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {section.criteria.map((criterion) => {
                        const fieldId = `${sectionKey}-${criterion.key}`
                        const value = getFieldValue(form, sectionKey, criterion.key)

                        if (criterion.type === "textarea") {
                          return (
                            <div key={fieldId} className="space-y-2 md:col-span-2">
                              <Label htmlFor={fieldId}>{criterion.label}</Label>
                              <Textarea
                                id={fieldId}
                                value={value}
                                onChange={(event) => setFieldValue(setForm, sectionKey, criterion.key, event.target.value)}
                                placeholder={criterion.placeholder}
                                disabled={!canEditJurySection}
                              />
                            </div>
                          )
                        }

                        if (criterion.type === "select") {
                          return (
                            <div key={fieldId} className="space-y-2">
                              <Label>{criterion.label}</Label>
                              <Select
                                value={value || "none"}
                                onValueChange={(nextValue) =>
                                  setFieldValue(setForm, sectionKey, criterion.key, nextValue === "none" ? "" : nextValue)
                                }
                                disabled={!canEditJurySection}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choisir une option" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Non renseigné</SelectItem>
                                  {criterion.options.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )
                        }

                        if (criterion.type === "checkbox") {
                          return (
                            <div key={fieldId} className="flex items-center gap-3 rounded-md border p-3">
                              <Checkbox
                                id={fieldId}
                                checked={Boolean(value)}
                                onCheckedChange={(checked) =>
                                  setFieldValue(setForm, sectionKey, criterion.key, Boolean(checked))
                                }
                                disabled={!canEditJurySection}
                              />
                              <Label htmlFor={fieldId} className="cursor-pointer">
                                {criterion.label}
                              </Label>
                            </div>
                          )
                        }

                        if (criterion.type === "computed") {
                          const computedValue = (criterion.depends_on || []).reduce(
                            (total, dependency) =>
                              total + Number(Boolean(form[`${sectionKey}_${dependency}`])),
                            0,
                          )

                          return (
                            <div key={fieldId} className="space-y-2">
                              <Label>{criterion.label}</Label>
                              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm font-semibold">
                                {computedValue} {criterion.suffix || ""}
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div key={fieldId} className="space-y-2">
                            <Label htmlFor={fieldId}>{criterion.label}</Label>
                            <Input
                              id={fieldId}
                              type={criterion.type === "number" ? "number" : "text"}
                              min={criterion.min}
                              max={criterion.max}
                              value={value}
                              onChange={(event) => setFieldValue(setForm, sectionKey, criterion.key, event.target.value)}
                              placeholder={criterion.placeholder}
                              disabled={!canEditJurySection}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || visibleSections.length === 0}>
            Enregistrer la fiche
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
