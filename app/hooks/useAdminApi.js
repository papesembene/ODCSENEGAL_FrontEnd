import { fetchJsonWithTimeout } from "@/app/utils/fetchWithTimeout"
import { useCallback, useMemo } from "react"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "")

export const useAdminApi = () => {
  const makeRequest = useCallback(async (endpoint, options = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    
    if (!token) {
      if (typeof window !== 'undefined') {
        window.location.href = '/astrodmin'
      }
      throw new Error('Token non trouvé')
    }

    const url = `${API_BASE_URL}${endpoint}`
    const defaultOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      credentials: 'include',
    }

    try {
      const result = await fetchJsonWithTimeout(url, defaultOptions)
      if (result && typeof result === 'object' && result.success === undefined) {
        result.success = true
      }
      return result
    } catch (error) {
      if (error.message === 'Erreur HTTP: 401' || error.message.includes('401')) {
        localStorage.removeItem('admin_token')
        if (typeof window !== 'undefined') {
          window.location.href = '/astrodmin'
        }
        throw new Error('Token expiré')
      }
      throw error
    }
  }, []) // Jamais de changement car API_BASE_URL est externe

  return useMemo(() => ({
    makeRequest,
    dashboard: {
      getStatistics: (days = 7) => makeRequest(`/api/admin/dashboard/statistics?days=${days}`, { timeout: 60000, retries: 2 }),
    },
    events: {
      getAll: () => makeRequest('/api/events'),
      create: (data) => makeRequest('/api/events', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => makeRequest(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id) => makeRequest(`/api/events/${id}`, { method: 'DELETE' }),
    },
    startups: {
      getCandidatures: () => makeRequest('/api/admin/startup/candidatures', { timeout: 45000, retries: 2 }),
    },
    tests: {
      getAll: () => makeRequest('/api/admin/tests', { retries: 2 }),
      getResults: () => makeRequest('/api/admin/tests/results', { timeout: 45000, retries: 2 }),
      getStatistics: () => makeRequest('/api/admin/tests/statistics'),
      getViolations: (testId, candidateEmail) => makeRequest(`/api/admin/tests/${testId}/violations/${candidateEmail}`),
      create: (data) => makeRequest('/api/admin/tests', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => makeRequest(`/api/admin/tests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      updateStatus: (data) => makeRequest('/api/admin/tests', { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id) => makeRequest(`/api/admin/tests/${id}`, { method: 'DELETE' }),
      sendEmails: (data) => makeRequest('/api/admin/tests/send-emails', { method: 'POST', body: JSON.stringify(data) }),
      updateResult: (id, data) => makeRequest(`/api/admin/tests/results/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
    testGroups: {
      getAll: (formation) => {
        let url = '/api/admin/test-groups'
        if (formation && formation !== 'all') url += `?formation=${formation}`
        return makeRequest(url)
      },
      create: (data) => makeRequest('/api/admin/test-groups', { method: 'POST', body: JSON.stringify(data) }),
      update: (id, data) => makeRequest(`/api/admin/test-groups/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id) => makeRequest(`/api/admin/test-groups/${id}`, { method: 'DELETE' }),
      sendInvitations: (id) => makeRequest(`/api/admin/test-groups/${id}/send-invitations`, { method: 'POST' }),
    },
    candidatures: {
      getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString()
        return makeRequest(`/api/admin/candidatures${query ? `?${query}` : ''}`)
      },
    }
  }), [makeRequest])
}
 