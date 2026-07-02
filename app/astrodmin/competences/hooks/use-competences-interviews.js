"use client"

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { useAdminApi } from "@/app/hooks/useAdminApi"

function buildOptionLabel(admin) {
  const fullName = [admin.first_name, admin.last_name].filter(Boolean).join(" ").trim()
  return fullName || admin.email
}

export default function useCompetencesInterviews({ filterBySelectedCampaign = true } = {}) {
  const { interviews } = useAdminApi()
  const [loading, setLoading] = useState(true)
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
  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 25,
    total: 0,
    total_pages: 1,
  })
  const [evaluationSummary, setEvaluationSummary] = useState({
    status: {},
    progress: {},
    complete: 0,
    incomplete: 0,
  })
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
    capacity: 10,
  })

  const fetchBootstrap = useCallback(async () => {
    try {
      setLoading(true)
      const result = await interviews.bootstrap()
      if (!result.success) {
        throw new Error(result.error || "Erreur lors du chargement des entretiens")
      }

      const data = result.data || {}
      setCampaigns(data.campaigns || [])
      setSlots(data.slots || [])
      setAdmins(data.admins || [])
      setSlotOccupancy(data.slot_occupancy || {})

      setSelectedCampaignId((currentCampaignId) => currentCampaignId || data.campaigns?.[0]?.id || "")
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Impossible de charger le module entretiens")
    } finally {
      setLoading(false)
    }
  }, [interviews])

  useEffect(() => {
    fetchBootstrap()
  }, [fetchBootstrap])

  const fetchEvaluations = useCallback(async () => {
    if (filterBySelectedCampaign && !selectedCampaignId) {
      setEvaluations([])
      return
    }

    try {
      setEvaluationsLoading(true)
      const result = await interviews.getEvaluations({
        campaignId: filterBySelectedCampaign ? selectedCampaignId : "",
        formation: formationFilter,
        status: statusFilter,
        progress: progressFilter,
        completion: completionFilter,
        search: deferredSearchTerm.trim(),
        page,
        pageSize,
      })
      if (!result.success) {
        throw new Error(result.error || "Erreur lors du chargement des fiches")
      }

      setEvaluations(result.data || [])
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
      setEvaluationSummary(result.summary || {
        status: {},
        progress: {},
        complete: 0,
        incomplete: 0,
      })
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Impossible de charger les fiches d'entretien")
    } finally {
      setEvaluationsLoading(false)
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
        role: admin.profile_data?.interview_role || null,
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
        capacity: 10,
      })
      await fetchBootstrap()
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Impossible de créer le créneau")
    } finally {
      setSubmitting(false)
    }
  }, [fetchBootstrap, interviews, selectedCampaign, slotForm])

  const handleUpdateSlotAssignments = useCallback(async (slotId, payload) => {
    try {
      setSubmitting(true)
      const result = await interviews.updateSlot(slotId, payload)
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la mise à jour du créneau")
      }

      toast.success("Affectations du créneau mises à jour")
      await fetchBootstrap()
      return result.data
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Impossible de mettre à jour le créneau")
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
      })
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la génération des fiches")
      }

      toast.success(result.message || "Fiches d'entretien générées")
      await fetchBootstrap()
      await fetchEvaluations()
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Impossible de générer les fiches")
    } finally {
      setSubmitting(false)
    }
  }, [fetchBootstrap, fetchEvaluations, interviews, selectedCampaign])

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

  return {
    loading,
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
    statusFilter,
    setStatusFilter,
    progressFilter,
    setProgressFilter,
    completionFilter,
    setCompletionFilter,
    campaignForm,
    setCampaignForm,
    slotForm,
    setSlotForm,
    adminOptions,
    fetchBootstrap,
    fetchEvaluations,
    handleCreateCampaign,
    handleUpdateCampaignScorecard,
    handleCreateSlot,
    handleUpdateSlotAssignments,
    handleSeedEvaluations,
    handleUpdateEvaluation,
  }
}
