"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchJsonWithTimeout } from "@/app/utils/fetchWithTimeout"
import {
  API_BASE_URL,
  buildDailyApplicationsData,
  buildMonthlyApplicationsData,
  buildProgramDistributionData,
  buildSectorDistributionData,
  buildStartupStats,
  exportStartups,
  filterStartups,
  getAcceptanceRate,
  getPendingCount,
  INITIAL_STATS,
} from "../admin-startups-utils"

export default function useAdminStartupsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [programFilter, setProgramFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [startupsData, setStartupsData] = useState([])
  const [stats, setStats] = useState(INITIAL_STATS)

  useEffect(() => {
    const authenticated = !!localStorage.getItem("admin_token")

    setIsAuthenticated(authenticated)
    setLoading(false)

    if (!authenticated) {
      router.push("/astrodmin")
    }
  }, [router])

  const fetchStartups = useCallback(async () => {
    try {
      setRefreshing(true)
      setError(null)

      const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/startup/candidatures`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 45000,
        retries: 2,
        retryDelay: 1500,
      })

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la récupération des données")
      }

      const startups = result.data || []
      setStartupsData(startups)
      setStats(buildStartupStats(startups))
    } catch (fetchError) {
      console.error("Erreur lors de la récupération des startups:", fetchError)
      setError(fetchError.message)
      setStartupsData((previous) => (previous.length > 0 ? previous : []))
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined
    }

    fetchStartups()
    const interval = setInterval(fetchStartups, 30000)

    return () => clearInterval(interval)
  }, [fetchStartups, isAuthenticated])

  const filters = useMemo(
    () => ({ searchTerm, programFilter, statusFilter, yearFilter }),
    [programFilter, searchTerm, statusFilter, yearFilter],
  )

  const filteredStartups = useMemo(() => filterStartups(startupsData, filters), [filters, startupsData])
  const dailyApplicationsData = useMemo(() => buildDailyApplicationsData(startupsData), [startupsData])
  const programDistributionData = useMemo(() => buildProgramDistributionData(stats), [stats])
  const sectorDistributionData = useMemo(() => buildSectorDistributionData(startupsData), [startupsData])
  const monthlyApplicationsData = useMemo(() => buildMonthlyApplicationsData(startupsData), [startupsData])

  const orangeFabPendingCount = useMemo(() => getPendingCount(startupsData, "orange_fab"), [startupsData])
  const startupLabPendingCount = useMemo(() => getPendingCount(startupsData, "startup_lab"), [startupsData])
  const orangeFabAcceptanceRate = useMemo(
    () => getAcceptanceRate(startupsData, stats.orangeFabStartups, "orange_fab"),
    [startupsData, stats.orangeFabStartups],
  )
  const startupLabAcceptanceRate = useMemo(
    () => getAcceptanceRate(startupsData, stats.startupLabStartups, "startup_lab"),
    [startupsData, stats.startupLabStartups],
  )

  const handleExport = useCallback(
    (type) => {
      exportStartups(filteredStartups, type)
    },
    [filteredStartups],
  )

  return {
    dailyApplicationsData,
    error,
    filteredStartups,
    handleExport,
    isAuthenticated,
    loading,
    monthlyApplicationsData,
    orangeFabAcceptanceRate,
    orangeFabPendingCount,
    programDistributionData,
    programFilter,
    refreshing,
    router,
    searchTerm,
    sectorDistributionData,
    setProgramFilter,
    setSearchTerm,
    setStatusFilter,
    setYearFilter,
    startupLabAcceptanceRate,
    startupLabPendingCount,
    startupsData,
    stats,
    statusFilter,
    fetchStartups,
    yearFilter,
  }
}
