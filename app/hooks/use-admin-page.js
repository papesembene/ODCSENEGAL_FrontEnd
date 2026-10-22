"use client"

import { useEffect, useState } from "react"
import { getAdminAuthHeaders } from "@/app/utils/admin-auth"
import { handleExpiredAdminSession } from "@/app/utils/fetchWithTimeout"

const EMPTY = { data: [], total: 0 }

export function useAdminPage(endpoint, query, enabled, revision = 0) {
  const url = `${endpoint}?${new URLSearchParams(query)}`
  const [state, setState] = useState({ url: "", revision: -1, data: EMPTY, loading: false, error: "" })
  const current = state.url === url && state.revision === revision

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    let active = true
    setState({ url, revision, data: EMPTY, loading: true, error: "" })
    async function load() {
      try {
        const response = await fetch(url, { headers: getAdminAuthHeaders(), signal: controller.signal })
        if (response.status === 401) handleExpiredAdminSession(url)
        const result = await response.json()
        if (!response.ok || !result.success || !Array.isArray(result.data) || !Number.isFinite(result.total)) {
          throw new Error(typeof result.error === "string" ? result.error : "Reponse invalide du serveur")
        }
        if (active) setState({ url, revision, data: result, loading: false, error: "" })
      } catch (error) {
        if (active) setState({ url, revision, data: EMPTY, loading: false,
          error: error.name === "AbortError" ? "Le chargement a expire. Reessayez." : "Impossible de charger la liste. Reessayez." })
      } finally { clearTimeout(timeout) }
    }
    void load()
    return () => { active = false; controller.abort(); clearTimeout(timeout) }
  }, [url, enabled, revision])

  return {
    response: current ? state.data : EMPTY,
    loading: enabled && (!current || state.loading),
    error: current ? state.error : "",
  }
}
