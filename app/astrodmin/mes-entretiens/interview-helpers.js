import { Heart, Scale, Sparkles, UsersRound } from "lucide-react"

export function isFilledValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== ""
}

export function normalizeSearchValue(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function getRoleSectionKey(role) {
  if (role === "Filtreur") return "filter"
  if (role === "Validateur") return "validator"
  if (role === "Motivation") return "motivation"
  return ""
}

export const SECTION_VISIBILITY_BY_ROLE = {
  filter: ["filter"],
  validator: ["filter", "validator"],
  motivation: ["filter", "validator", "motivation"],
}

export const REVIEW_FIELD_BY_SECTION = {
  filter: "filter_review",
  validator: "validator_review",
  motivation: "motivation_review",
}

export const COACH_RECOMMENDATION_OPTIONS = [
  { key: "coach_pick", label: "Coup de cœur", description: "Profil qui mérite une attention spéciale.", icon: Heart },
  { key: "strong_potential", label: "Potentiel fort", description: "Bonne marge de progression ou très bon signal.", icon: Sparkles },
  { key: "cohort_balance", label: "Équilibre cohorte", description: "Profil utile pour équilibrer la promotion.", icon: Scale },
  { key: "social_context", label: "Cas social à soutenir", description: "Situation personnelle à considérer avec bienveillance.", icon: UsersRound },
]

export const COACH_RECOMMENDATION_KEYS = new Set(COACH_RECOMMENDATION_OPTIONS.map((option) => option.key))

export function isCoachRecommendationCriterion(criterion) {
  return COACH_RECOMMENDATION_KEYS.has(criterion?.key)
}

export function getVisibleCriteria(section) {
  return (section?.criteria || []).filter(
    (criterion) => !isCoachRecommendationCriterion(criterion),
  )
}

export function getCoachRecommendationLabels(evaluation) {
  const validatorReview = getEvaluationSectionReview(evaluation, "validator")
  return COACH_RECOMMENDATION_OPTIONS
    .filter((option) => Boolean(validatorReview?.[option.key]))
    .map((option) => option.label)
}

export function isFilterFailure(evaluation) {
  const filterReview = getEvaluationSectionReview(evaluation, "filter")
  const decision = normalizeSearchValue(filterReview?.decision || filterReview?.verdict)
  return ["echec", "echec filtre", "rejet", "rejete", "rejected", "failed"].includes(decision)
}

export function getRoleKeys(roles) {
  return roles.map(getRoleSectionKey).filter(Boolean)
}

export function getVisibleSectionKeys(sectionKeys, roleKeys) {
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

export function getEvaluationSectionReview(evaluation, sectionKey) {
  return evaluation.section_reviews?.[sectionKey] || evaluation[REVIEW_FIELD_BY_SECTION[sectionKey]] || {}
}

export function getCriterionValue(drafts, evaluation, sectionKey, criterion) {
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

export function setCriterionValue(setDrafts, evaluationId, sectionKey, criterionKey, value) {
  setDrafts((previous) => ({
    ...previous,
    [evaluationId]: {
      ...(previous[evaluationId] || {}),
      [`${sectionKey}_${criterionKey}`]: value,
    },
  }))
}

export function buildInlineReview(evaluation, drafts, sectionKey, section, currentAdminName) {
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

export function formatCriterionValue(value, criterion) {
  if (criterion.type === "checkbox") {
    return value ? "Oui" : "Non"
  }
  if (criterion.type === "select") {
    return criterion.options?.find((option) => option.value === value)?.label || value || "-"
  }
  return value === null || value === undefined || value === "" ? "-" : value
}

export function getInterviewerDisplayName(evaluation, sectionKey, canEdit, currentAdminName) {
  const review = getEvaluationSectionReview(evaluation, sectionKey)
  return review?._owner_name || review?.interviewer || (canEdit ? currentAdminName : "") || "-"
}

export function isSectionComplete(section, role, scorecardConfig) {
  const sectionKey = getRoleSectionKey(role)
  const criteria = scorecardConfig?.sections?.[sectionKey]?.criteria || []
  const requiredCriteria = criteria.filter((criterion) => criterion.required)
  return criteria.some((criterion) => isFilledValue(section?.[criterion.key])) && requiredCriteria.every((criterion) =>
    isFilledValue(section?.[criterion.key]),
  )
}

export function getSlotRoles(slot, adminId) {
  const assigned = new Set(slot.access?.roles || slot.assignments?.[adminId] || [])
  if ([...(slot.assigned_filter_ids || []), ...(slot.assigned_jury_ids || [])].includes(adminId)) assigned.add("filter")
  if ((slot.assigned_validator_ids || []).includes(adminId)) assigned.add("validator")
  if ((slot.assigned_motivation_ids || []).includes(adminId)) assigned.add("motivation")
  return Object.entries({ filter: "Filtreur", validator: "Validateur", motivation: "Motivation" })
    .filter(([key]) => assigned.has(key)).map(([, label]) => label)
}

function parseUtc(value) {
  if (!value) return NaN
  return Date.parse(/(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}Z`)
}

export function isFilterWindowOpen(slot, now) {
  return ["scheduled", "in_progress"].includes(slot.status)
    && now >= parseUtc(slot.access?.filter_opens_at || slot.start_at)
    && now < parseUtc(slot.access?.filter_closes_at || slot.end_at)
}

export function getEditableSectionKeys(slot, adminId, now, evaluation = {}) {
  if (!slot) return []
  const allowed = slot.access?.editable_roles || getRoleKeys(getSlotRoles(slot, adminId))
  return allowed.filter((role) => {
    if (role === "filter" && !isFilterWindowOpen(slot, now)) return false
    const owner = getEvaluationSectionReview(evaluation, role)._owner_admin_id
    return !owner || owner === adminId
  })
}

export function isSlotVisible(slot, adminId, now) {
  const roles = getRoleKeys(getSlotRoles(slot, adminId))
  return roles.some((role) => role !== "filter" || isFilterWindowOpen(slot, now))
}

export function getEvaluationRoleLabels(slot, adminId) {
  const roles = getSlotRoles(slot, adminId)
  return roles.length > 0 ? roles : ["-"]
}

export function getSectionOwnerLabel(evaluation, sectionKey) {
  const review = getEvaluationSectionReview(evaluation, sectionKey)
  return review?._owner_name || review?.interviewer || ""
}

export function isSectionTreated(evaluation, sectionKey, scorecardConfig) {
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

export function getTreatmentInfo(evaluation, roles, scorecardConfig) {
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

