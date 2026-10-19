"use client"

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { useAdminApi } from "@/app/hooks/useAdminApi"

function buildOptionLabel(admin) {
  const fullName = [admin.first_name, admin.last_name].filter(Boolean).join(" ").trim()
  return fullName || admin.email
}

const EMPTY_EVALUATION_SUMMARY = {
  status: {},
  progress: {},
  complete: 0,
  incomplete: 0,
  ready_for_decision: 0,
}

export default function useCompetencesInterviews({ filterBySelectedCampaign = true } = {}) {
  const { interviews } = useAdminApi()
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [bootstrapError, setBootstrapError] = useState("")
  const [evaluationsError, setEvaluationsError] = useState("")
  const [serverClock, setServerClock] = useState(null)
  const bootstrapRequest = useRef(0)
  const evaluationsRequest = useRef(0)
  const [evaluationsLoading, setEvaluationsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [campaigns, setCampaigns] = useState([])
  const [slots, setSlots] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [admins, setAdmins] = useState([])
  const [slotOccupancy, setSlotOccupancy] = useState({})
  const [selectedCampaignId, setSelectedCampaignId] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [progressFilter, setProgressFilter] = useState("all")
  const [completionFilter, setCompletionFilter] = useState("all")
  const [formationFilter, setFormationFilter] = useState("all")
  const [slotFilter, setSlotFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [planningMode, setPlanningMode] = useState("auto")
  const [candidatesPerSlot, setCandidatesPerSlot] = useState(50)
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 25,
    total: 0,
    total_pages: 1,
  })
  const [evaluationSummary, setEvaluationSummary] = useState(EMPTY_EVALUATION_SUMMARY)
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    formation: "dev-web-mobile",
    description: "",
    status: "draft",
  })
  const [slotForm, setSlotForm] = useState({
    label: "",
    start_at: "",
    end_at: "",
  })

  const fetchBootstrap = useCallback(async () => {
    const requestId = ++bootstrapRequest.current
    try {
      setLoading(true)
      const result = await interviews.bootstrap()
      if (requestId !== bootstrapRequest.current) return
      if (!result.success) {
        throw new Error(result.error || "Erreur lors du chargement des entretiens")
      }

      const data = result.data || {}
      setBootstrapError("")
      if (data.server_now) {
        setServerClock({ time: Date.parse(data.server_now), receivedAt: performance.now() })
      }
      setCampaigns(data.campaigns || [])
      setSlots(data.slots || [])
      setAdmins(data.admins || [])
      setSlotOccupancy(data.slot_occupancy || {})

      setSelectedCampaignId((currentCampaignId) => {
        const campaigns = data.campaigns || []
        const currentCampaignStillExists = campaigns.some(
          (campaign) => campaign.id === currentCampaignId,
        )

        return currentCampaignStillExists ? currentCampaignId : campaigns[0]?.id || ""
      })
    } catch (error) {
      if (requestId !== bootstrapRequest.current) return
      setBootstrapError(error.message || "Impossible de charger les entretiens")
      console.error(error)
      toast.error(error.message || "Impossible de charger le module entretiens")
    } finally {
      if (requestId === bootstrapRequest.current) {
        setLoading(false)
        setInitialLoading(false)
      }
    }
  }, [interviews])

  useEffect(() => {
    fetchBootstrap()
  }, [fetchBootstrap])

  const fetchEvaluations = useCallback(async () => {
    const requestId = ++evaluationsRequest.current
    if (filterBySelectedCampaign && !selectedCampaignId) {
      setEvaluations([])
      setEvaluationsLoading(false)
      setPagination({
        page: 1,
        page_size: pageSize,
        total: 0,
        total_pages: 1,
      })
      setEvaluationSummary(EMPTY_EVALUATION_SUMMARY)
      return
    }

    try {
      setEvaluationsLoading(true)
      const result = await interviews.getEvaluations({
        campaignId: filterBySelectedCampaign ? selectedCampaignId : "",
        slotId: slotFilter,
        formation: formationFilter,
        status: statusFilter,
        progress: progressFilter,
        completion: completionFilter,
        search: deferredSearchTerm.trim(),
        page,
        pageSize,
      })
      if (requestId !== evaluationsRequest.current) return
      if (!result.success) {
        throw new Error(result.error || "Erreur lors du chargement des fiches")
      }

      setEvaluations(result.data || [])
      setEvaluationsError("")
      const nextPagination = result.pagination || {
        page: 1,
        page_size: pageSize,
        total: 0,
        total_pages: 1,
      }
      setPagination(nextPagination)
      setPage((currentPage) => (
        currentPage === nextPagination.page ? currentPage : nextPagination.page
      ))
      setEvaluationSummary(result.summary || EMPTY_EVALUATION_SUMMARY)
    } catch (error) {
      if (requestId !== evaluationsRequest.current) return
      setEvaluationsError(error.message || "Impossible de charger les candidats")
      setEvaluations([])
      console.error(error)
      toast.error(error.message || "Impossible de charger les fiches d'entretien")
    } finally {
      if (requestId === evaluationsRequest.current) setEvaluationsLoading(false)
    }
  }, [
    completionFilter,
    deferredSearchTerm,
    filterBySelectedCampaign,
    formationFilter,
    interviews,
    page,
    pageSize,
    progressFilter,
    selectedCampaignId,
    slotFilter,
    statusFilter,
  ])

  useEffect(() => {
    fetchEvaluations()
  }, [fetchEvaluations])

  useEffect(() => {
    setPage(1)
  }, [
    completionFilter,
    deferredSearchTerm,
    formationFilter,
    progressFilter,
    selectedCampaignId,
    slotFilter,
    statusFilter,
  ])

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId) || null,
    [campaigns, selectedCampaignId],
  )

  const campaignSlots = useMemo(
    () => slots.filter((slot) => slot.campaign_id === selectedCampaignId),
    [selectedCampaignId, slots],
  )

  const adminOptions = useMemo(
    () =>
      admins.map((admin) => ({
        value: admin.id,
        label: buildOptionLabel(admin),
        interviewRole: admin.profile_data?.interview_role || "",
      })),
    [admins],
  )

  const handleCreateCampaign = useCallback(async () => {
    try {
      setSubmitting(true)
      const payload = {
        ...campaignForm,
      }
      const result = await interviews.createCampaign(payload)
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la création de la campagne")
      }

      toast.success("Campagne d'entretien créée")
      setCampaignForm({
        name: "",
        formation: campaignForm.formation,
        description: "",
        status: "draft",
      })
      await fetchBootstrap()
      setSelectedCampaignId(result.data.id)
      return result.data
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Impossible de créer la campagne")
    } finally {
      setSubmitting(false)
    }
  }, [campaignForm, fetchBootstrap, interviews])

	  const handleUpdateCampaignScorecard = useCallback(async (scorecardConfig) => {
    if (!selectedCampaign) {
      toast.error("Veuillez sélectionner une campagne")
      return
    }

    try {
      setSubmitting(true)
      const result = await interviews.updateCampaign(selectedCampaign.id, {
        scorecard_config: scorecardConfig,
      })
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la mise à jour des critères")
      }

      toast.success("Critères d'entretien enregistrés")
      await fetchBootstrap()
      return result.data
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Impossible d'enregistrer les critères")
      throw error
    } finally {
      setSubmitting(false)
    }
	  }, [fetchBootstrap, interviews, selectedCampaign])

  const handleUpdateCampaignFilterQuestions = useCallback(async (campaignId, filterQuestions) => {
    if (!campaignId) {
      toast.error("Veuillez sélectionner une campagne")
      return
    }

    try {
      setSubmitting(true)
      const result = await interviews.updateCampaign(campaignId, {
        filter_questions: filterQuestions,
      })
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la mise à jour des questions")
      }

      toast.success("Questions destinées aux filtreurs enregistrées")
      await fetchBootstrap()
      return result.data
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Impossible d'enregistrer les questions")
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [fetchBootstrap, interviews])

  const handleCreateSlot = useCallback(async () => {
    if (!selectedCampaign) {
      toast.error("Veuillez sélectionner une campagne")
      return
    }

    try {
      setSubmitting(true)
      const result = await interviews.createSlot({
        campaign_id: selectedCampaign.id,
        formation: selectedCampaign.formation,
        ...slotForm,
      })
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la création du créneau")
      }

      toast.success("Créneau d'entretien créé")
      setSlotForm({
        label: "",
        start_at: "",
        end_at: "",
      })
      await fetchBootstrap()
      return result.data
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Impossible de créer le créneau")
    } finally {
      setSubmitting(false)
    }
  }, [fetchBootstrap, interviews, selectedCampaign, slotForm])

  const handleUpdateSlotAssignments = useCallback(async (slotIds, payload) => {
    const ids = Array.isArray(slotIds) ? slotIds : [slotIds]
    if (ids.length === 0) {
      toast.error("Veuillez sélectionner au moins un créneau")
      return
    }

    try {
      setSubmitting(true)
      const results = await Promise.all(ids.map((slotId) => interviews.updateSlot(slotId, payload)))
      const failedResult = results.find((result) => !result.success)
      if (failedResult) {
        throw new Error(failedResult.error || "Erreur lors de la mise à jour des créneaux")
      }

      toast.success(ids.length > 1 ? "Affectations des créneaux mises à jour" : "Affectations du créneau mises à jour")
      await fetchBootstrap()
      return results.map((result) => result.data)
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Impossible de mettre à jour les créneaux")
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [fetchBootstrap, interviews])

  const handleSeedEvaluations = useCallback(async () => {
    if (!selectedCampaign) {
      toast.error("Veuillez sélectionner une campagne")
      return
    }

    try {
      setSubmitting(true)
      const result = await interviews.seedEvaluations({
        campaign_id: selectedCampaign.id,
        formation: selectedCampaign.formation,
        ...(planningMode === "manual" ? { candidates_per_slot: candidatesPerSlot } : {}),
      })
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la génération des fiches")
      }

      toast.success(result.message || "Fiches d'entretien générées")
      await fetchBootstrap()
      await fetchEvaluations()
      return result.data || true
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Impossible de générer les fiches")
    } finally {
      setSubmitting(false)
    }
  }, [candidatesPerSlot, fetchBootstrap, fetchEvaluations, interviews, planningMode, selectedCampaign])

  const handleUpdateEvaluation = useCallback(async (evaluationId, payload) => {
    try {
      setSubmitting(true)
      const result = await interviews.updateEvaluation(evaluationId, payload)
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la mise à jour de la fiche")
      }

      toast.success("Fiche d'entretien mise à jour")
      await Promise.all([fetchBootstrap(), fetchEvaluations()])
      return result.data
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Impossible de mettre à jour la fiche")
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [fetchBootstrap, fetchEvaluations, interviews])

  const handleBulkUpdateFinalStatus = useCallback(async (evaluationIds, finalStatus) => {
    const ids = Array.isArray(evaluationIds) ? evaluationIds.filter(Boolean) : []
    if (ids.length === 0) {
      toast.error("Veuillez sélectionner au moins un candidat")
      return
    }
    if (!finalStatus || finalStatus === "en_attente") {
      toast.error("Veuillez choisir une décision finale")
      return
    }

    try {
      setSubmitting(true)
      const results = await Promise.all(
        ids.map((evaluationId) => interviews.updateEvaluation(evaluationId, {
          final_status: finalStatus,
        })),
      )
      const failedResult = results.find((result) => !result.success)
      if (failedResult) {
        throw new Error(failedResult.error || "Erreur lors de la décision groupée")
      }

      toast.success(`${ids.length} décision(s) mise(s) à jour`)
      await Promise.all([fetchBootstrap(), fetchEvaluations()])
      return results.map((result) => result.data)
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Impossible d'enregistrer les décisions")
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [fetchBootstrap, fetchEvaluations, interviews])

  return {
    loading,
    initialLoading,
    bootstrapError,
    evaluationsError,
    serverClock,
    evaluationsLoading,
    submitting,
    campaigns,
    slots,
    evaluations,
    selectedCampaign,
    selectedCampaignId,
    setSelectedCampaignId,
    campaignSlots,
    slotOccupancy,
    pagination,
    evaluationSummary,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    formationFilter,
    setFormationFilter,
    slotFilter,
    setSlotFilter,
    statusFilter,
    setStatusFilter,
    progressFilter,
    setProgressFilter,
    completionFilter,
    setCompletionFilter,
    planningMode,
    setPlanningMode,
    candidatesPerSlot,
    setCandidatesPerSlot,
    campaignForm,
    setCampaignForm,
    slotForm,
    setSlotForm,
    adminOptions,
    fetchBootstrap,
    fetchEvaluations,
	    handleCreateCampaign,
	    handleUpdateCampaignScorecard,
	    handleUpdateCampaignFilterQuestions,
	    handleCreateSlot,
    handleUpdateSlotAssignments,
    handleSeedEvaluations,
    handleUpdateEvaluation,
    handleBulkUpdateFinalStatus,
  }
}
