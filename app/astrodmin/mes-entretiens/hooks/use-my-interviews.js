"use client"

import { useCallback, useEffect, useState } from "react"
import useCompetencesInterviews from "../../competences/hooks/use-competences-interviews"
import {
  buildInlineReview, getEditableSectionKeys, getEvaluationSectionReview,
  getSlotRoles, isSlotVisible, REVIEW_FIELD_BY_SECTION,
} from "../interview-helpers"

export default function useMyInterviews() {
  const interviews = useCompetencesInterviews()
  const [admin, setAdmin] = useState(null)
  const [now, setNow] = useState(0)
  const [inlineDrafts, setInlineDrafts] = useState({})
  const [savingEvaluationId, setSavingEvaluationId] = useState("")
  const [activeCandidateId, setActiveCandidateId] = useState("")
  const [coachCandidateId, setCoachCandidateId] = useState("")

  useEffect(() => {
    try { setAdmin(JSON.parse(localStorage.getItem("admin_user") || "{}")) }
    catch { setAdmin({}) }
  }, [])

  useEffect(() => {
    let timer
    const tick = () => {
      const current = interviews.serverClock
        ? interviews.serverClock.time + performance.now() - interviews.serverClock.receivedAt
        : Date.now()
      setNow(current)
      const boundaries = interviews.slots.flatMap((slot) => [
        Date.parse(slot.access?.filter_opens_at), Date.parse(slot.access?.filter_closes_at),
      ]).filter((time) => time > current)
      if (boundaries.length) {
        timer = setTimeout(tick, Math.min(Math.min(...boundaries) - current + 25, 2147483647))
      }
    }
    tick()
    return () => clearTimeout(timer)
  }, [interviews.serverClock, interviews.slots])

  const refresh = useCallback(() => {
    void interviews.fetchBootstrap()
    void interviews.fetchEvaluations()
  }, [interviews.fetchBootstrap, interviews.fetchEvaluations])

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh()
    }
    const timer = setInterval(refreshWhenVisible, 60000)
    window.addEventListener("focus", refreshWhenVisible)
    return () => {
      clearInterval(timer)
      window.removeEventListener("focus", refreshWhenVisible)
    }
  }, [refresh])

  const currentAdminId = admin?.id || ""
  const currentAdminName = [admin?.first_name, admin?.last_name].filter(Boolean).join(" ").trim()
  const assignedSlots = interviews.slots.filter((slot) => isSlotVisible(slot, currentAdminId, now))
  const campaignSlots = assignedSlots.filter((slot) => slot.campaign_id === interviews.selectedCampaignId)
  const selectedSlot = campaignSlots.find((slot) => slot.id === interviews.slotFilter) || null

  useEffect(() => {
    const slots = interviews.slots.filter((slot) =>
      slot.campaign_id === interviews.selectedCampaignId && isSlotVisible(slot, currentAdminId, now))
    if (!slots.some((slot) => slot.id === interviews.slotFilter)) {
      interviews.setSlotFilter(slots[0]?.id || "__none__")
      interviews.setPage(1)
    }
  }, [currentAdminId, interviews.slots, interviews.selectedCampaignId, interviews.slotFilter, now])

  const evaluations = interviews.evaluations.filter((evaluation) =>
    selectedSlot && evaluation.slot_id === selectedSlot.id
    && evaluation.campaign_id === interviews.selectedCampaignId)
  const activeEvaluation = evaluations.find((item) => item.id === activeCandidateId) || evaluations[0] || null
  const coachEvaluation = evaluations.find((item) => item.id === coachCandidateId) || null
  const scorecard = interviews.selectedCampaign?.scorecard_config || {}

  const saveInline = async (evaluation) => {
    const sections = scorecard.sections || {}
    const slot = assignedSlots.find((item) => item.id === evaluation.slot_id)
    const roles = getEditableSectionKeys(slot, currentAdminId, now, evaluation)
    const payload = Object.fromEntries(roles.filter((role) => sections[role]).map((role) => [
      REVIEW_FIELD_BY_SECTION[role],
      buildInlineReview(evaluation, inlineDrafts, role, sections[role], currentAdminName),
    ]))
    if (!Object.keys(payload).length) return
    try {
      setSavingEvaluationId(evaluation.id)
      await interviews.handleUpdateEvaluation(evaluation.id, payload)
      setInlineDrafts((previous) => {
        const next = { ...previous }
        delete next[evaluation.id]
        return next
      })
    } catch {
      // The API hook displays the failure. Keep the draft for a safe retry.
    } finally {
      setSavingEvaluationId("")
    }
  }

  const saveCoachOpinion = async (evaluation, draft) => {
    if (!getEditableSectionKeys(selectedSlot, currentAdminId, now, evaluation).includes("validator")) return
    try {
      await interviews.handleUpdateEvaluation(evaluation.id, {
        validator_review: {
          ...getEvaluationSectionReview(evaluation, "validator"),
          interviewer: currentAdminName,
          coach_pick: Boolean(draft.coach_pick),
          strong_potential: Boolean(draft.strong_potential),
          cohort_balance: Boolean(draft.cohort_balance),
          social_context: Boolean(draft.social_context),
          comment: String(draft.comment || "").trim(),
        },
      })
      setCoachCandidateId("")
    } catch {
      // Keep the dialog open; the API hook already displays the error.
    }
  }

  return {
    interviews, currentAdminId, currentAdminName, now, assignedSlots, campaignSlots,
    selectedSlot, evaluations, activeEvaluation, setActiveCandidateId,
    coachEvaluation, setCoachCandidateId, inlineDrafts, setInlineDrafts,
    savingEvaluationId, saveInline, saveCoachOpinion, refresh, scorecard,
    roles: selectedSlot ? getSlotRoles(selectedSlot, currentAdminId) : [],
  }
}
