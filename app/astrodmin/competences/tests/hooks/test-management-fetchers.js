import { toast } from "sonner"
import { fetchJsonWithTimeout } from "@/app/utils/fetchWithTimeout"
import { getAdminAuthHeaders } from "@/app/utils/admin-auth"
import { API_BASE_URL } from "../constants"
import { normalizeFormationName } from "../helpers"

export async function fetchTestsData({ setLoading, setRefreshing, setTestsData }) {
  try {
    setRefreshing(true)
    const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests`, {
      timeout: 30000,
      retries: 2,
      retryDelay: 1000,
    })

    if (result.success) {
      setTestsData(result.data || [])
    } else {
      toast.error(result.error || "Erreur lors du chargement des tests")
      setTestsData([])
    }
  } catch (error) {
    console.error("Erreur lors du chargement des tests:", error)
    toast.error("Impossible de charger les tests.")
    setTestsData([])
  } finally {
    setLoading(false)
    setRefreshing(false)
  }
}

export async function fetchStatisticsData({ setStatistics }) {
  try {
    const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/statistics`, {
      timeout: 30000,
      retries: 2,
      retryDelay: 1000,
    })

    if (result.success) {
      setStatistics(result.data)
    } else {
      toast.error(result.error || "Erreur lors du chargement des statistiques")
      setStatistics(null)
    }
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error)
    toast.error("Impossible de charger les statistiques.")
    setStatistics(null)
  }
}

export async function fetchTestGroupsData({
  groupFormationFilter,
  setTestGroups,
}) {
  try {
    const params = new URLSearchParams()
    if (groupFormationFilter !== "all") {
      params.set("formation", groupFormationFilter)
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/test-groups?${params.toString()}`, {
      headers: getAdminAuthHeaders(),
    })
    const result = await response.json()

    if (!result.success) {
      toast.error(result.error || "Erreur lors de la récupération des groupes")
      return
    }

    const groups = result.data || []
    setTestGroups(groups)
  } catch (error) {
    console.error("Erreur:", error)
    toast.error("Impossible de récupérer les groupes")
  }
}

export async function fetchAvailableCandidatesData({
  formation = "",
  page = 1,
  perPage = 100,
  search = "",
  signal,
  setAvailableCandidates,
  setAvailableCandidatesTotal,
}) {
  if (!formation) {
    setAvailableCandidates([])
    setAvailableCandidatesTotal?.(0)
    return
  }

  try {
    const params = new URLSearchParams({
      formation,
      page: String(page),
      per_page: String(perPage),
    })
    if (search.trim()) {
      params.set("search", search.trim())
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/test-groups/available-candidates?${params.toString()}`, {
      headers: getAdminAuthHeaders(),
      signal,
    })
    const result = await response.json()

    if (signal?.aborted) return false
    if (!response.ok || !result.success) {
      setAvailableCandidates([])
      setAvailableCandidatesTotal?.(0)
      return false
    }

    const normalizedCandidates = (result.data || []).map((candidate) => ({
      ...candidate,
      desired_training: normalizeFormationName(candidate.desired_training),
    }))

    setAvailableCandidates(normalizedCandidates)
    setAvailableCandidatesTotal?.(result.total || 0)
    return true
  } catch (error) {
    if (signal?.aborted) return false
    setAvailableCandidates([])
    setAvailableCandidatesTotal?.(0)
    return false
  }
}
