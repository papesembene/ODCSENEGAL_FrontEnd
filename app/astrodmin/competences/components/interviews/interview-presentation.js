import { AlertTriangle, Heart, Sparkles, Users } from "lucide-react"

export const FORMATION_OPTIONS = [
  { value: "dev-web-mobile", label: "Développement Web Mobile" },
  { value: "dev-data", label: "Développement Data" },
  { value: "hackeuses", label: "Hackeuses" },
  { value: "aws-cloud", label: "AWS Cloud" },
  { value: "referent-digital", label: "Référent Digital" },
  { value: "cyber-security", label: "Cybersécurité" },
  { value: "intelligence-artificielle", label: "Intelligence Artificielle" },
]

export const FINAL_STATUS_LABELS = {
  en_attente: "En attente",
  retenu: "Retenu",
  liste_attente: "Liste d'attente",
  rejete: "Rejeté",
}

export const INTERVIEW_PROGRESS_LABELS = {
  a_planifier: "À planifier", planifie: "Planifié", passe: "Passé", absent: "Absent",
}

export function getFormationLabel(value) {
  const aliases = { data: "dev-data", "Dev Web": "dev-web-mobile" }
  return FORMATION_OPTIONS.find((item) => item.value === (aliases[value] || value))?.label || value || "-"
}

export function formatTestScore(score) {
  return score !== null && score !== undefined && score !== "" && Number.isFinite(Number(score))
    ? `${Number(score)} pts` : "Non renseigné"
}

export function formatCriterionValue(value, criterion) {
  if (value === null || value === undefined || value === "") return "-"
  if (criterion.type === "checkbox") return value ? "Oui" : "Non"
  if (criterion.type === "select") {
    return criterion.options?.find((option) => option.value === value)?.label || value
  }
  return String(value)
}

export function getEvaluationSectionReview(evaluation, sectionKey) {
  return evaluation.section_reviews?.[sectionKey] || evaluation[`${sectionKey}_review`] || {}
}

export function getCandidateName(evaluation) {
  return [evaluation.candidate_snapshot?.first_name, evaluation.candidate_snapshot?.last_name]
    .filter(Boolean).join(" ") || evaluation.candidate_snapshot?.email || "Candidat"
}

export function getDecisionActionLabel(evaluation) {
  if (!evaluation.is_complete) return "Voir l'avancement"
  return !evaluation.final_status || evaluation.final_status === "en_attente"
    ? "Finaliser" : "Consulter"
}

export function getCoachBadges(evaluation) {
  const review = getEvaluationSectionReview(evaluation, "validator")
  return [
    review.coach_pick && { key: "coach_pick", label: "Coup de cœur", tone: "border-blue-200 bg-blue-50 text-blue-800", icon: Heart },
    review.strong_potential && { key: "strong_potential", label: "Potentiel fort", tone: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: Sparkles },
    review.cohort_balance && { key: "cohort_balance", label: "Équilibre cohorte", tone: "border-sky-200 bg-sky-50 text-sky-800", icon: Users },
    review.social_context && { key: "social_context", label: "Contexte social", tone: "border-amber-200 bg-amber-50 text-amber-800", icon: AlertTriangle },
  ].filter(Boolean)
}

export function getReviewDecision(evaluation, sectionKey) {
  const review = getEvaluationSectionReview(evaluation, sectionKey)
  return review.decision || review.verdict || review.status || review.comment || review.notes || ""
}

function normalizeDecisionText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()
}

export function getDecisionAid(evaluation) {
  const score = Number(evaluation.test_score)
  const decisions = ["filter", "validator", "motivation"].map((key) =>
    normalizeDecisionText(getReviewDecision(evaluation, key)),
  )
  const strongSignal = getCoachBadges(evaluation).some((badge) =>
    ["coach_pick", "strong_potential"].includes(badge.key),
  )
  const negative = decisions.some((value) =>
    ["echec", "rejete", "rejet", "defavorable", "non"].some((word) => value.includes(word)),
  )
  if (evaluation.test_details?.violations?.totalViolations > 0 || negative || (Number.isFinite(score) && score < 50 && strongSignal)) {
    return { value: "arbitration", label: "À arbitrer", className: "border-amber-200 bg-amber-50 text-amber-800" }
  }
  if (strongSignal && (!Number.isFinite(score) || score >= 70)) {
    return { value: "very_favorable", label: "Très favorable", className: "border-emerald-200 bg-emerald-50 text-emerald-800" }
  }
  if (Number.isFinite(score) && score >= 70 && evaluation.is_complete) {
    return { value: "favorable", label: "Favorable", className: "border-green-200 bg-green-50 text-green-800" }
  }
  return evaluation.is_complete
    ? { value: "discussion", label: "À discuter", className: "border-orange-200 bg-orange-50 text-orange-800" }
    : { value: "pending", label: "À compléter", className: "border-slate-200 bg-slate-50 text-slate-700" }
}
