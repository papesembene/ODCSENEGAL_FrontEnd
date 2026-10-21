import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { getAdminAuthHeaders } from "@/app/utils/admin-auth"
import { handleExpiredAdminSession } from "@/app/utils/fetchWithTimeout"
import { API_BASE_URL } from "../constants"

export function useTestResults(enabled) {
  const [query, setQuery] = useState({ page: 1, per_page: 20, referentiel: "all", status: "all" })
  const [response, setResponse] = useState({ data: [], total: 0 })
  const [resultsLoading, setResultsLoading] = useState(false)
  const [resultsError, setResultsError] = useState("")
  const [selectedResults, setSelectedResults] = useState([])
  const [revision, setRevision] = useState(0)
  const [exportingResults, setExportingResults] = useState(false)
  const reloadResults = useCallback(() => setRevision((value) => value + 1), [])

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    let active = true
    setResultsLoading(true)
    setResultsError("")
    setSelectedResults([])
    setResponse({ data: [], total: 0 })
    async function load() {
      try {
        const request = await fetch(`${API_BASE_URL}/api/admin/tests/results?${new URLSearchParams(query)}`, {
          headers: getAdminAuthHeaders(), signal: controller.signal,
        })
        const result = await request.json()
        if (request.status === 401) handleExpiredAdminSession(request.url)
        if (!request.ok || !result.success || !result.pagination) throw new Error(result.error || "Réponse invalide du serveur")
        if (active) setResponse(result)
      } catch (error) {
        if (active) setResultsError(error.name === "AbortError" ? "Le chargement a expiré. Réessayez." : "Impossible de charger les résultats. Réessayez.")
      } finally {
        clearTimeout(timeout)
        if (active) setResultsLoading(false)
      }
    }
    void load()
    return () => { active = false; controller.abort(); clearTimeout(timeout) }
  }, [enabled, query, revision])

  const changeQuery = (key, value) => setQuery((previous) => ({
    ...previous, page: 1, [key]: typeof value === "function" ? value(previous[key]) : value,
  }))

  const handleExportResults = async (format) => {
    if (format !== "csv") { toast.info("Utilisez l'export CSV, compatible avec Excel"); return }
    if (exportingResults) return
    setExportingResults(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 120000)
    try {
      const filters = new URLSearchParams({ referentiel: query.referentiel, status: query.status })
      const request = await fetch(`${API_BASE_URL}/api/admin/tests/results/export?${filters}`, {
        headers: getAdminAuthHeaders(), signal: controller.signal,
      })
      if (request.status === 401) handleExpiredAdminSession(request.url)
      if (!request.ok || !request.headers.get("Content-Type")?.includes("text/csv")) throw new Error("Export indisponible")
      const url = URL.createObjectURL(await request.blob())
      const link = document.createElement("a")
      link.href = url
      link.download = "resultats-tests.csv"
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60000)
      toast.success("Export complet des résultats filtrés téléchargé")
    } catch {
      toast.error("Impossible d'exporter les résultats. Réessayez.")
    } finally { clearTimeout(timeout); setExportingResults(false) }
  }

  return {
    testResults: response.data, resultsTotal: response.total,
    resultsPage: response.pagination?.page ?? query.page,
    resultsItemsPerPage: query.per_page, resultsReferentielFilter: query.referentiel, resultsStatusFilter: query.status,
    setResultsPage: (value) => changeQuery("page", value),
    setResultsItemsPerPage: (value) => changeQuery("per_page", value),
    setResultsReferentielFilter: (value) => changeQuery("referentiel", value),
    setResultsStatusFilter: (value) => changeQuery("status", value),
    selectedResults, setSelectedResults, reloadResults, handleExportResults, exportingResults,
    resultsLoading, resultsError,
    testViolations: Object.fromEntries(response.data.map((result) => [result.id, result.violationSummary])),
  }
}
