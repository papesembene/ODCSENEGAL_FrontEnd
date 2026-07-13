"use client"

import { RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  AdminProgramsTab,
  AdminStartupsError,
  AdminStartupsList,
  AdminStartupsOverview,
  AdminStatisticsTab,
} from "./admin-startups-sections"
import useAdminStartupsPage from "./hooks/use-admin-startups-page"

export default function AdminStartupsPage() {
  const startupsPage = useAdminStartupsPage()

  if (startupsPage.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  if (!startupsPage.isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col items-start justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Startups</h1>
          <p className="text-muted-foreground">
            Gérez les startups, les programmes d'accompagnement et suivez les statistiques
          </p>
        </div>
        <div className="mt-4 flex space-x-2 sm:mt-0">
          <Button variant="outline" onClick={startupsPage.fetchStartups} disabled={startupsPage.refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${startupsPage.refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button variant="outline" onClick={() => startupsPage.router.push("/astrodmin/dashboard")}>
            Retour au Dashboard
          </Button>
        </div>
      </div>

      <AdminStartupsError error={startupsPage.error} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="startups">Startups</TabsTrigger>
          <TabsTrigger value="programs">Programmes</TabsTrigger>
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminStartupsOverview
            dailyApplicationsData={startupsPage.dailyApplicationsData}
            onNavigateToCoworking={() => startupsPage.router.push("/astrodmin/startups/coworking")}
            programDistributionData={startupsPage.programDistributionData}
            startupsData={startupsPage.startupsData}
            stats={startupsPage.stats}
          />
        </TabsContent>

        <TabsContent value="startups" className="space-y-6">
          <AdminStartupsList
            filteredStartups={startupsPage.filteredStartups}
            onExport={startupsPage.handleExport}
            onProgramFilterChange={startupsPage.setProgramFilter}
            onSearchTermChange={startupsPage.setSearchTerm}
            onStatusFilterChange={startupsPage.setStatusFilter}
            onYearFilterChange={startupsPage.setYearFilter}
            programFilter={startupsPage.programFilter}
            searchTerm={startupsPage.searchTerm}
            startupsData={startupsPage.startupsData}
            statusFilter={startupsPage.statusFilter}
            yearFilter={startupsPage.yearFilter}
          />
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <AdminProgramsTab
            orangeFabAcceptanceRate={startupsPage.orangeFabAcceptanceRate}
            orangeFabPendingCount={startupsPage.orangeFabPendingCount}
            startupLabAcceptanceRate={startupsPage.startupLabAcceptanceRate}
            startupLabPendingCount={startupsPage.startupLabPendingCount}
            stats={startupsPage.stats}
          />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <AdminStatisticsTab
            monthlyApplicationsData={startupsPage.monthlyApplicationsData}
            sectorDistributionData={startupsPage.sectorDistributionData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
