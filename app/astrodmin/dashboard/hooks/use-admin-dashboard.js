"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchJsonWithTimeout } from "@/app/utils/fetchWithTimeout"
import { API_BASE_URL, buildGlobalStatCards } from "../admin-dashboard-utils"

export default function useAdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminType, setAdminType] = useState(null)
  const [adminEmail, setAdminEmail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)
  const [daysRange, setDaysRange] = useState(7)

  const fetchDashboardStatistics = useCallback(async () => {
    try {
      setStatsLoading(true)
      setError(null)

      const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/dashboard/statistics?days=${daysRange}`, {
        timeout: 60000,
        retries: 2,
        retryDelay: 2000,
      })

      if (!result.success) {
        const errorMessage = result.error || "Erreur lors du chargement des statistiques"
        setError(errorMessage)
        console.error("Erreur lors du chargement des statistiques:", errorMessage)
        return
      }

      setDashboardData(result.data)
    } catch (fetchError) {
      const errorMessage = fetchError.message || "Erreur lors de la récupération des statistiques"
      setError(errorMessage)
      console.error("Erreur lors de la récupération des statistiques:", fetchError)
    } finally {
      setStatsLoading(false)
    }
  }, [daysRange])

  useEffect(() => {
    const authenticated = !!localStorage.getItem("admin_token")
    const type = localStorage.getItem("admin_type")
    const email = localStorage.getItem("admin_email")

    setIsAuthenticated(authenticated)
    setAdminType(type)
    setAdminEmail(email)
    setLoading(false)

    if (!authenticated) {
      router.push("/astrodmin")
      return
    }

    fetchDashboardStatistics()
  }, [fetchDashboardStatistics, router])

  const handleChangeRange = useCallback((range) => {
    setDaysRange((previous) => (previous === range ? previous : range))
  }, [])

  const navigateTo = useCallback((path) => {
    router.push(path)
  }, [router])

  const globalStats = dashboardData?.globalStats
  const applicationsTrend = dashboardData?.applicationsTrend || []
  const genderDistribution = dashboardData?.genderDistribution || []
  const statusDistribution = dashboardData?.statusDistribution || []
  const nationalityDistribution = dashboardData?.nationalityDistribution || []
  const recentActivities = dashboardData?.recentActivities || []
  const moduleStats = dashboardData?.moduleStats

  const statCards = useMemo(() => {
    if (!globalStats || !moduleStats) {
      return []
    }

    return buildGlobalStatCards(globalStats, moduleStats)
  }, [globalStats, moduleStats])

  return {
    adminEmail,
    adminType,
    applicationsTrend,
    dashboardData,
    daysRange,
    error,
    genderDistribution,
    globalStats,
    handleChangeRange,
    isAuthenticated,
    loading,
    moduleStats,
    nationalityDistribution,
    navigateTo,
    recentActivities,
    router,
    statCards,
    statsLoading,
    statusDistribution,
    fetchDashboardStatistics,
  }
}
