import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { getAdminAuthHeaders } from "@/app/utils/admin-auth"
import { handleExpiredAdminSession } from "@/app/utils/fetchWithTimeout"
import { API_BASE_URL } from "../constants"
import { useAdminPage } from "@/app/hooks/use-admin-page"
import { useDebouncedValue } from "@/app/hooks/use-debounced-value"

export function useTestResults(enabled) {
  const [query, setQuery] = useState({ page: 1, per_page: 20, referentiel: "all", status: "all", search: "" })
  const [resultsSearchTerm, setResultsSearchTerm] = useState("")
  const search = useDebouncedValue(resultsSearchTerm.trim())
  const [selectedResults, setSelectedResults] = useState([])
  const [revision, setRevision] = useState(0)
  const [exportingResults, setExportingResults] = useState(false)
  const reloadResults = useCallback(() => setRevision((value) => value + 1), [])
  const { response, loading, error: resultsError } = useAdminPage(`${API_BASE_URL}/api/admin/tests/results`, query, enabled, revision)
  const resultsLoading = loading || resultsSearchTerm.trim() !== query.search

  useEffect(() => {
    setQuery((previous) => previous.search === search ? previous : { ...previous, search, page: 1 })
  }, [search])

  useEffect(() => {
    setSelectedResults([])
  }, [enabled, query, revision])

  const changeQuery = (key, value) => setQuery((previous) => ({
    ...previous, page: 1, [key]: typeof value === "function" ? value(previous[key]) : value,
  }))

  const handleExportResults = async (format) => {
    if (format !== "csv") { toast.info("Utilisez l'export CSV, compatible avec Excel"); return }
    if (exportingResults || resultsLoading || resultsError) return
    setExportingResults(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 120000)
    try {
      const { page, per_page, ...criteria } = query
      const filters = new URLSearchParams(criteria)
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
    testResults: resultsLoading ? [] : response.data, resultsTotal: response.total,
    resultsSearchTerm, setResultsSearchTerm,
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
