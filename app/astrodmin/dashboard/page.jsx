"use client"

import {
  AdminDashboardCharts,
  AdminDashboardErrorState,
  AdminDashboardHeader,
  AdminDashboardLoadingState,
  AdminDashboardModulesAndActivity,
  AdminDashboardNationalityDistribution,
  AdminDashboardQuickStats,
  AdminDashboardStatusDistribution,
} from "./admin-dashboard-sections"
import useAdminDashboard from "./hooks/use-admin-dashboard"

export default function AdminDashboard() {
  const dashboard = useAdminDashboard()

  if (dashboard.loading || dashboard.statsLoading) {
    return <AdminDashboardLoadingState />
  }

  if (!dashboard.isAuthenticated) {
    return null
  }

  if (!dashboard.dashboardData && !dashboard.error) {
    return <AdminDashboardLoadingState />
  }

  if (dashboard.error && !dashboard.dashboardData) {
    return <AdminDashboardErrorState error={dashboard.error} onRetry={dashboard.fetchDashboardStatistics} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminDashboardHeader adminEmail={dashboard.adminEmail} adminType={dashboard.adminType} />
      <AdminDashboardQuickStats statCards={dashboard.statCards} />
      <AdminDashboardCharts
        applicationsTrend={dashboard.applicationsTrend}
        daysRange={dashboard.daysRange}
        genderDistribution={dashboard.genderDistribution}
        onRangeChange={dashboard.handleChangeRange}
      />
      <AdminDashboardModulesAndActivity
        moduleStats={dashboard.moduleStats}
        onNavigate={dashboard.navigateTo}
        recentActivities={dashboard.recentActivities}
      />
      <AdminDashboardStatusDistribution statusDistribution={dashboard.statusDistribution} />
      <AdminDashboardNationalityDistribution nationalityDistribution={dashboard.nationalityDistribution} />
    </div>
  )
}
