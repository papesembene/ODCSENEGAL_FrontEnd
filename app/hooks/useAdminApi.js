"use client"

import { useCallback, useMemo } from "react"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "")
const SERVICE_UNAVAILABLE_MESSAGE = "Le service est temporairement indisponible. Veuillez réessayer."

function getApiErrorMessage(errorData) {
  const candidates = [
    errorData?.error,
    errorData?.message,
    errorData?.details,
  ]
  const message = candidates.find(
    (value) => typeof value === "string" && value.trim(),
  )

  return message || SERVICE_UNAVAILABLE_MESSAGE
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
      throw new Error("Veuillez vous connecter pour continuer.")
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
      throw new Error("Impossible de charger les données. Veuillez réessayer dans quelques instants.")
    }

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        window.location.href = '/astrodmin'
        throw new Error("Votre session a expiré. Veuillez vous reconnecter.")
      }

      if (response.status >= 500) {
        throw new Error(SERVICE_UNAVAILABLE_MESSAGE)
      }

      let errorMessage = SERVICE_UNAVAILABLE_MESSAGE

      try {
        const errorData = await response.json()
        errorMessage = getApiErrorMessage(errorData)
      } catch (error) {
        if (error.name === "AbortError") throw error
      }

      throw new Error(errorMessage)
    }

    try {
      return await (responseType === "blob" ? response.blob() : response.json())
    } catch (error) {
      if (error.name === "AbortError") throw error
      throw new Error(SERVICE_UNAVAILABLE_MESSAGE)
    }
  }, [])

  const candidatures = useMemo(() => ({
    getAll: async (filters = {}, options = {}) => makeRequest(`/api/admin/candidatures${queryString(filters)}`, options),
    get: async (id) => makeRequest(`/api/admin/candidatures/${id}`),
    remove: async (id) => makeRequest(`/api/admin/candidatures/${id}`, { method: "DELETE" }),
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
    overview: (campaignId) => makeRequest(`/api/admin/interviews/overview${queryString({ campaign_id: campaignId })}`),
    getReferential: (formation, filters, options) => makeRequest(`/api/admin/interviews/referentials/${encodeURIComponent(formation)}${queryString(filters)}`, options),
    updateReferential: (formation, payload) => makeRequest(`/api/admin/interviews/referentials/${encodeURIComponent(formation)}`, {
      method: "POST", body: JSON.stringify(payload),
    }),
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
    getQuestionBank: (id) => makeRequest(`/api/admin/interviews/campaigns/${id}/question-bank`),
    checkQuestionBank: (id, questions, mode) => makeRequest(`/api/admin/interviews/campaigns/${id}/question-bank`, {
      method: "POST", body: JSON.stringify({ questions, mode }),
    }),
    saveQuestionBank: (id, questions, revision, mode) => makeRequest(`/api/admin/interviews/campaigns/${id}/question-bank`, {
      method: "PUT", body: JSON.stringify({ questions, revision, mode }),
    }),
    editQuestionBank: (id, payload) => makeRequest(`/api/admin/interviews/campaigns/${id}/question-bank`, {
      method: "PATCH", body: JSON.stringify(payload),
    }),
    getRanking: (formation, filters, options) => makeRequest(`/api/admin/interviews/referentials/${encodeURIComponent(formation)}/ranking${queryString(filters)}`, options),
    updateRanking: (formation, payload) => makeRequest(`/api/admin/interviews/referentials/${encodeURIComponent(formation)}/ranking`, {
      method: "POST", body: JSON.stringify(payload),
    }),
    importValidators: (payload) => makeRequest("/api/admin/interview-members/import", {
      method: "POST", body: JSON.stringify(payload),
    }),
    updateQuestionnaireConfig: (id, config) => makeRequest(`/api/admin/interviews/campaigns/${id}/questionnaire-config`, {
      method: "PUT", body: JSON.stringify({ config }),
    }),
    getQuestionnaire: (id) => makeRequest(`/api/admin/interviews/evaluations/${id}/questionnaire`),
    checkInterviewAnswer: (id, payload) => makeRequest(`/api/admin/interviews/evaluations/${id}/questionnaire/check`, {
      method: "POST", body: JSON.stringify(payload),
    }),
    generateQuestionnaire: (id, profile) => makeRequest(`/api/admin/interviews/evaluations/${id}/questionnaire`, {
      method: "POST", body: JSON.stringify({ profile }),
    }),
    updateQuestionnaire: (id, payload, { keepalive = false } = {}) => {
      const body = JSON.stringify(payload)
      return makeRequest(`/api/admin/interviews/evaluations/${id}/questionnaire`, {
        method: "PATCH", body, keepalive: keepalive && new TextEncoder().encode(body).length <= 60 * 1024,
      })
    },
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

  const trainings = useMemo(() => ({
    create: (payload) => makeRequest("/api/admin/trainings", { method: "POST", body: JSON.stringify(payload) }),
    update: (code, payload) => makeRequest(`/api/admin/trainings/${encodeURIComponent(code)}`, { method: "PATCH", body: JSON.stringify(payload) }),
    archive: (code, version) => makeRequest(`/api/admin/trainings/${encodeURIComponent(code)}`, { method: "DELETE", body: JSON.stringify({ version }) }),
    uploadImage: (file) => {
      const body = new FormData()
      body.append("image", file)
      return makeRequest("/api/admin/trainings/media", { method: "POST", body })
    },
  }), [makeRequest])

  const trainingSites = useMemo(() => ({
    create: (payload) => makeRequest("/api/admin/training-sites", { method: "POST", body: JSON.stringify(payload) }),
    update: (code, payload) => makeRequest(`/api/admin/training-sites/${encodeURIComponent(code)}`, { method: "PATCH", body: JSON.stringify(payload) }),
  }), [makeRequest])

  const bootcamps = useMemo(() => {
    const post = (url, payload) => makeRequest(url, { method: "POST", body: JSON.stringify(payload || {}) })
    return {
      overview: (campaignId) => makeRequest(`/api/admin/bootcamps/overview${queryString({ campaign_id: campaignId })}`),
      detail: (formation, campaignId, options) => makeRequest(`/api/admin/bootcamps/referentials/${encodeURIComponent(formation)}${queryString({ campaign_id: campaignId })}`, options),
      create: (formation, campaignId, payload) => post(`/api/admin/bootcamps/referentials/${encodeURIComponent(formation)}${queryString({ campaign_id: campaignId })}`, payload),
      update: (id, payload) => makeRequest(`/api/admin/bootcamps/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
      remove: (id) => makeRequest(`/api/admin/bootcamps/${id}`, { method: "DELETE" }),
      setParticipants: (id, payload) => post(`/api/admin/bootcamps/${id}/participants`, payload),
      launch: (id, payload) => post(`/api/admin/bootcamps/${id}/launch`, payload),
      retryInvitations: (id) => post(`/api/admin/bootcamps/${id}/retry-invitations`),
      reopen: (id, payload) => post(`/api/admin/bootcamps/${id}/reopen`, payload),
      allResults: (campaignId, options) => makeRequest(`/api/admin/bootcamps/results${queryString({ campaign_id: campaignId })}`, options),
      results: (formation, campaignId, options) => makeRequest(`/api/admin/bootcamps/referentials/${encodeURIComponent(formation)}/results${queryString({ campaign_id: campaignId })}`, options),
      resultsAction: (formation, payload) => post(`/api/admin/bootcamps/referentials/${encodeURIComponent(formation)}/results`, payload),
      coachList: () => makeRequest("/api/admin/coach/bootcamps"),
      coachGet: (id) => makeRequest(`/api/admin/coach/bootcamps/${id}`),
      coachDecide: (id, candidateId, payload) => makeRequest(`/api/admin/coach/bootcamps/${id}/participants/${candidateId}`, {
        method: "PATCH", body: JSON.stringify(payload),
      }),
      coachSubmit: (id, payload) => post(`/api/admin/coach/bootcamps/${id}/submit`, payload),
    }
  }, [makeRequest])

  return {
    makeRequest,
    bootcamps,
    candidatures,
    testGroups,
    interviews,
    juryMembers,
    portalContent,
    adminProfiles,
    trainings,
    trainingSites,
  }
}
