"use client"

import { useCallback, useMemo } from "react"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "")

function getApiErrorMessage(errorData, status) {
  const candidates = [
    errorData?.error,
    errorData?.message,
    errorData?.details,
  ]
  const message = candidates.find(
    (value) => typeof value === "string" && value.trim(),
  )

  return message || `Erreur HTTP ${status}`
}

function queryString(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") params.set(key, String(value))
  })
  return params.size ? `?${params}` : ""
}

export const useAdminApi = () => {
  const makeRequest = useCallback(async (endpoint, options = {}, responseType = "json") => {
    const token = localStorage.getItem('admin_token')

    if (!token) {
      throw new Error('Token non trouvé')
    }

    let response

    const headers = new Headers(options.headers || {})
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData
    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }
    headers.set("Authorization", `Bearer ${token}`)

    const requestUrl = `${API_BASE_URL}${endpoint}`

    try {
      response = await fetch(requestUrl, {
        ...options,
        headers,
        credentials: 'include',
      })
    } catch (error) {
      if (error.name === "AbortError") throw error
      const baseUrl = requestUrl.split("/api/")[0] || API_BASE_URL || "le backend"
      throw new Error(`Impossible de joindre le backend sur ${baseUrl}`)
    }

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        window.location.href = '/astrodmin'
        throw new Error('Token expiré')
      }

      let errorMessage = 'Erreur de requête'

      try {
        const errorData = await response.json()
        errorMessage = getApiErrorMessage(errorData, response.status)
      } catch (error) {
        errorMessage = `Erreur HTTP ${response.status}`
      }

      throw new Error(errorMessage)
    }

    return responseType === "blob" ? response.blob() : response.json()
  }, [])

  const candidatures = useMemo(() => ({
    getAll: async (filters = {}, options = {}) => makeRequest(`/api/admin/candidatures${queryString(filters)}`, options),
    get: async (id) => makeRequest(`/api/admin/candidatures/${id}`),
    dashboard: async (days, options = {}) => makeRequest(`/api/admin/candidatures/dashboard${queryString({ days })}`, options),
    export: async (filters, options = {}) => makeRequest(`/api/admin/candidatures/export${queryString(filters)}`, options, "blob"),
    update: async (id, payload) =>
      makeRequest(`/api/admin/candidatures/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    getCampaigns: async () => makeRequest("/api/admin/candidature-campaigns"),
    createCampaign: async (payload) =>
      makeRequest("/api/admin/candidature-campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateCampaign: async (id, payload) =>
      makeRequest(`/api/admin/candidature-campaigns/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  }), [makeRequest])

  const testGroups = useMemo(() => ({
    getAll: async (formation) => {
      const query = formation ? `?formation=${encodeURIComponent(formation)}` : ""
      return makeRequest(`/api/admin/test-groups${query}`)
    },
    create: async (payload) =>
      makeRequest("/api/admin/test-groups", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  }), [makeRequest])

  const interviews = useMemo(() => ({
    bootstrap: async (formation) => {
      const query = formation ? `?formation=${encodeURIComponent(formation)}` : ""
      return makeRequest(`/api/admin/interviews/bootstrap${query}`)
    },
    getCampaigns: async (formation) => {
      const query = formation ? `?formation=${encodeURIComponent(formation)}` : ""
      return makeRequest(`/api/admin/interviews/campaigns${query}`)
    },
    createCampaign: async (payload) =>
      makeRequest("/api/admin/interviews/campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateCampaign: async (id, payload) =>
      makeRequest(`/api/admin/interviews/campaigns/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    getSlots: async (campaignId) => {
      const query = campaignId ? `?campaignId=${encodeURIComponent(campaignId)}` : ""
      return makeRequest(`/api/admin/interviews/slots${query}`)
    },
    createSlot: async (payload) =>
      makeRequest("/api/admin/interviews/slots", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateSlot: async (id, payload) =>
      makeRequest(`/api/admin/interviews/slots/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    getEvaluations: async (filters = {}) => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "all") {
          params.set(key, String(value))
        }
      })
      const query = params.toString() ? `?${params.toString()}` : ""
      return makeRequest(`/api/admin/interviews/evaluations${query}`)
    },
    seedEvaluations: async (payload) =>
      makeRequest("/api/admin/interviews/evaluations/seed", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateEvaluation: async (id, payload) =>
      makeRequest(`/api/admin/interviews/evaluations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  }), [makeRequest])

  const juryMembers = useMemo(() => ({
    getAll: async () => makeRequest("/api/admin/interview-members"),
    create: async (payload) =>
      makeRequest("/api/admin/interview-members", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: async (id, payload) =>
      makeRequest(`/api/admin/interview-members/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    resetPassword: async (id) =>
      makeRequest(`/api/admin/interview-members/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ reset_password: true }),
      }),
    remove: async (id) =>
      makeRequest(`/api/admin/interview-members/${id}`, {
        method: "DELETE",
      }),
  }), [makeRequest])

  const portalContent = useMemo(() => ({
    getAll: async (filters = {}) => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, String(value))
        }
      })
      const query = params.toString() ? `?${params.toString()}` : ""
      return makeRequest(`/api/admin/portal-content${query}`)
    },
    create: async (payload) =>
      makeRequest("/api/admin/portal-content", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: async (id, payload) =>
      makeRequest(`/api/admin/portal-content/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    remove: async (id) =>
      makeRequest(`/api/admin/portal-content/${id}`, {
        method: "DELETE",
      }),
    uploadImage: async (file) => {
      const formData = new FormData()
      formData.append("image", file)
      return makeRequest("/api/admin/portal-content/media", {
        method: "POST",
        body: formData,
      })
    },
  }), [makeRequest])

  const adminProfiles = useMemo(() => ({
    getAll: async (type) => {
      const query = type && type !== "all" ? `?type=${encodeURIComponent(type)}` : ""
      return makeRequest(`/api/admin/admin-profiles${query}`)
    },
    create: async (payload) =>
      makeRequest("/api/admin/admin-profiles", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: async (id, payload) =>
      makeRequest(`/api/admin/admin-profiles/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    resetPassword: async (id) =>
      makeRequest(`/api/admin/admin-profiles/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ reset_password: true }),
      }),
    remove: async (id) =>
      makeRequest(`/api/admin/admin-profiles/${id}`, {
        method: "DELETE",
      }),
  }), [makeRequest])

  return {
    makeRequest,
    candidatures,
    testGroups,
    interviews,
    juryMembers,
    portalContent,
    adminProfiles,
  }
}
