"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { downloadCandidateExport } from "../candidate-exports"

const EMPTY_SUMMARY = {
  stats: { total: 0, femmes: 0, hommes: 0, acceptes: 0, enAttente: 0, refuses: 0 },
  formations: {}, daily: [], nationalities: [],
}

export default function useCandidateDirectory(api, days, listEnabled = true) {
  const [query, setQuery] = useState({ page: 1, per_page: 20, search: "", desired_training: "all", status: "all", gender: "all" })
  const [searchTerm, setSearchTerm] = useState("")
  const [response, setResponse] = useState({ data: [], total: 0 })
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [listLoading, setListLoading] = useState(listEnabled)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [listError, setListError] = useState("")
  const [summaryError, setSummaryError] = useState("")
  const [revision, setRevision] = useState(0)
  const [exportingCandidates, setExportingCandidates] = useState(false)
  const fetchCandidates = useCallback(() => setRevision((value) => value + 1), [])
  const pendingSearch = searchTerm.trim() !== query.search

  useEffect(() => {
    const timer = setTimeout(() => setQuery((previous) => previous.search === searchTerm.trim()
      ? previous : { ...previous, search: searchTerm.trim(), page: 1 }), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (!listEnabled) { setListLoading(false); return }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    let active = true
    setListLoading(true)
    setListError("")
    setResponse({ data: [], total: 0 })
    api.getAll(query, { signal: controller.signal }).then((result) => {
      if (!result.success || !result.pagination) throw new Error("Reponse de pagination invalide")
      if (active) setResponse(result)
    }).catch((error) => {
      if (active) setListError(error.name === "AbortError" ? "Le chargement a expire. Reessayez." : error.message)
    }).finally(() => {
      clearTimeout(timeout)
      if (active) setListLoading(false)
    })
    return () => { active = false; controller.abort(); clearTimeout(timeout) }
  }, [api, query, revision, listEnabled])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    let active = true
    setSummaryLoading(true)
    setSummaryError("")
    api.dashboard(days, { signal: controller.signal }).then((result) => {
      if (!result.success) throw new Error("Statistiques indisponibles")
      if (active) setSummary(result.data)
    }).catch((error) => {
      if (active) setSummaryError(error.name === "AbortError" ? "Le chargement des statistiques a expire." : error.message)
    }).finally(() => {
      clearTimeout(timeout)
      if (active) setSummaryLoading(false)
    })
    return () => { active = false; controller.abort(); clearTimeout(timeout) }
  }, [api, days, revision])

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") fetchCandidates()
    }, 60000)
    return () => clearInterval(timer)
  }, [fetchCandidates])

  const changeQuery = (key, value) => setQuery((previous) => ({
    ...previous, page: 1, [key]: typeof value === "function" ? value(previous[key]) : value,
  }))

  const exportCandidates = async (format) => {
    if (exportingCandidates || pendingSearch || listLoading) return
    setExportingCandidates(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 120000)
    try {
      const { page, per_page, ...filters } = query
      const blob = await api.export(filters, { signal: controller.signal })
      await downloadCandidateExport(blob, format)
      toast.success("Export complet des candidats filtres telecharge")
    } catch {
      toast.error("Impossible d'exporter les candidats. Reessayez.")
    } finally { clearTimeout(timeout); setExportingCandidates(false) }
  }

  return {
    searchTerm, setSearchTerm,
    selectedFormation: query.desired_training, setSelectedFormation: (value) => changeQuery("desired_training", value),
    selectedStatus: query.status, setSelectedStatus: (value) => changeQuery("status", value),
    selectedGender: query.gender, setSelectedGender: (value) => changeQuery("gender", value),
    candidatesMainPage: response.pagination?.page ?? query.page,
    setCandidatesMainPage: (value) => changeQuery("page", value),
    candidatesMainItemsPerPage: query.per_page,
    setCandidatesMainItemsPerPage: (value) => changeQuery("per_page", value),
    filteredCandidates: response.data, candidatesData: response.data, candidatesTotal: response.total,
    stats: summary.stats, formationStats: summary.formations,
    dailyApplicationsData: summary.daily, nationalityData: summary.nationalities,
    loading: summaryLoading && revision === 0 && summary === EMPTY_SUMMARY,
    refreshing: listLoading || summaryLoading || pendingSearch, candidatesLoading: listLoading || pendingSearch,
    error: listError || summaryError, fetchCandidates, exportingCandidates,
    handleExportCSV: () => exportCandidates("csv"), handleExportExcel: () => exportCandidates("xlsx"),
  }
}
