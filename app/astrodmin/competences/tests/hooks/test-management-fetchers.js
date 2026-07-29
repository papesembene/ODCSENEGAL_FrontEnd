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

export async function fetchResultsData({ setTestResults }) {
  try {
    const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/results`, {
      timeout: 45000,
      retries: 2,
      retryDelay: 1500,
    })

    if (result.success) {
      setTestResults(result.data || [])
    } else {
      toast.error(result.error || "Erreur lors du chargement des résultats")
      setTestResults([])
    }
  } catch (error) {
    console.error("Erreur lors du chargement des résultats:", error)
    toast.error("Impossible de charger les résultats.")
    setTestResults([])
  }
}

export async function fetchTestSessionsData({
  filters = {},
  setTestSessions,
  setTestSessionsTotal,
}) {
  try {
    const params = new URLSearchParams({
      page: String(filters.page || 1),
      per_page: String(filters.perPage || 20),
    })

    if (filters.status && filters.status !== "all") {
      params.set("status", filters.status)
    }

    if (filters.testId && filters.testId !== "all") {
      params.set("testId", filters.testId)
    }

    if (filters.search?.trim()) {
      params.set("search", filters.search.trim())
    }

    const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/sessions?${params.toString()}`, {
      timeout: 30000,
      retries: 1,
      retryDelay: 1000,
    })

    if (result.success) {
      setTestSessions(result.data || [])
      setTestSessionsTotal(result.total || 0)
      return
    }

    toast.error(result.error || "Erreur lors du chargement des sessions")
    setTestSessions([])
    setTestSessionsTotal(0)
  } catch (error) {
    console.warn("Erreur lors du chargement des sessions:", error)
    toast.error("Impossible de charger les sessions de test.")
    setTestSessions([])
    setTestSessionsTotal(0)
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

export async function fetchViolationsData({ setTestViolations, testResults }) {
  try {
    const violationsMap = {}

    for (const result of testResults) {
      const candidateEmail = result.candidate?.email || result.candidateEmail
      const testId = result.testId

      if (!candidateEmail || !testId) {
        continue
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/tests/${testId}/violations?candidateEmail=${encodeURIComponent(candidateEmail)}`, {
          headers: getAdminAuthHeaders(),
        })
        if (!response.ok) {
          continue
        }

        const data = await response.json()
        if (data.success && data.data) {
          const violationEntry = Array.isArray(data.data) ? data.data[0] : data.data

          if (violationEntry) {
            violationsMap[result.id] = violationEntry
          }
        }
      } catch (error) {
        console.error(`Erreur violations pour ${candidateEmail}:`, error)
      }
    }

    setTestViolations(violationsMap)
  } catch (error) {
    console.error("Erreur lors de la récupération des violations:", error)
  }
}

export async function fetchTestGroupsData({
  groupFormationFilter,
  setAssignedCandidateIds,
  setCandidateToGroupMap,
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
    const assignedIds = new Set()
    const candidateGroupMap = {}

    groups.forEach((group) => {
      if (!Array.isArray(group.candidate_ids)) {
        return
      }

      group.candidate_ids.forEach((id) => {
        assignedIds.add(id)
        candidateGroupMap[id] = group.name
      })
    })

    setTestGroups(groups)
    setAssignedCandidateIds(Array.from(assignedIds))
    setCandidateToGroupMap(candidateGroupMap)
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
    })
    const result = await response.json()

    if (!result.success) {
      setAvailableCandidates([])
      setAvailableCandidatesTotal?.(0)
      return
    }

    const normalizedCandidates = (result.data || []).map((candidate) => ({
      ...candidate,
      desired_training: normalizeFormationName(candidate.desired_training),
    }))

    setAvailableCandidates(normalizedCandidates)
    setAvailableCandidatesTotal?.(result.total || 0)
  } catch (error) {
    console.error("Erreur:", error)
    setAvailableCandidates([])
    setAvailableCandidatesTotal?.(0)
  }
}
