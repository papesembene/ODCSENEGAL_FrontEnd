"use client"

import { AlertCircle, ChevronDown, Download, FileSpreadsheet, FileText, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DASHBOARD_COLORS } from "./dashboard-config"
import { getGenderLabel, getStatusColor, getStatusLabel } from "./dashboard-utils"
import CompetencesAutoGroupDialog from "./components/competences-auto-group-dialog"
import CompetencesCandidateDetailsModal from "./components/competences-candidate-details-modal"
import CompetencesCandidatesTab from "./components/competences-candidates-tab"
import CompetencesFormationCandidatesDialog from "./components/competences-formation-candidates-dialog"
import CompetencesFormationsTab from "./components/competences-formations-tab"
import CompetencesOverviewTab from "./components/competences-overview-tab"
import CompetencesStatisticsTab from "./components/competences-statistics-tab"
import CompetencesSuccessModal from "./components/competences-success-modal"
import useCompetencesAdminDashboard from "./hooks/use-competences-admin-dashboard"

export default function CompetencesAdminDashboard() {
  const dashboard = useCompetencesAdminDashboard()

  if (dashboard.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-4 pt-4 sm:p-6 sm:pt-6 md:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard Compétences</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={dashboard.fetchCandidates}
              disabled={dashboard.refreshing}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${dashboard.refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Exporter</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={dashboard.handleExportCSV}>
                  <FileText className="mr-2 h-4 w-4" />
                  Exporter en CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={dashboard.handleExportExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exporter en Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {dashboard.error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Erreur lors du chargement des données: {dashboard.error}</AlertDescription>
          </Alert>
        ) : null}

        <Tabs value={dashboard.activeTab} onValueChange={dashboard.setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="candidates">Candidats</TabsTrigger>
            <TabsTrigger value="formations">Formations</TabsTrigger>
            <TabsTrigger value="statistics">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <CompetencesOverviewTab
              error={dashboard.error}
              refreshing={dashboard.refreshing}
              fetchCandidates={dashboard.fetchCandidates}
              stats={dashboard.stats}
              daysRange={dashboard.daysRange}
              setDaysRange={dashboard.setDaysRange}
              dailyApplicationsData={dashboard.dailyApplicationsData}
              formationData={dashboard.formationData}
              genderData={dashboard.genderData}
              nationalityData={dashboard.nationalityData}
              dashboardColors={DASHBOARD_COLORS}
            />
          </TabsContent>

          <TabsContent value="candidates" className="space-y-4">
            <CompetencesCandidatesTab
              filteredCandidates={dashboard.filteredCandidates}
              candidatesData={dashboard.candidatesData}
              candidatesMainItemsPerPage={dashboard.candidatesMainItemsPerPage}
              setCandidatesMainItemsPerPage={dashboard.setCandidatesMainItemsPerPage}
              candidatesMainPage={dashboard.candidatesMainPage}
              setCandidatesMainPage={dashboard.setCandidatesMainPage}
              searchTerm={dashboard.searchTerm}
              setSearchTerm={dashboard.setSearchTerm}
              selectedFormation={dashboard.selectedFormation}
              setSelectedFormation={dashboard.setSelectedFormation}
              selectedStatus={dashboard.selectedStatus}
              setSelectedStatus={dashboard.setSelectedStatus}
              selectedGender={dashboard.selectedGender}
              setSelectedGender={dashboard.setSelectedGender}
              formationData={dashboard.formationData}
              getGenderLabel={getGenderLabel}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              viewCandidateDetails={dashboard.viewCandidateDetails}
            />
          </TabsContent>

          <TabsContent value="formations" className="space-y-4">
            <CompetencesFormationsTab formationData={dashboard.formationData} handleManageCandidates={dashboard.handleManageCandidates} />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <CompetencesStatisticsTab
              genderData={dashboard.genderData}
              statusData={dashboard.statusData}
              formationData={dashboard.formationData}
              dailyApplicationsData={dashboard.dailyApplicationsData}
              dashboardColors={DASHBOARD_COLORS}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CompetencesCandidateDetailsModal
        candidate={dashboard.selectedCandidate}
        onClose={dashboard.closeCandidateDetails}
        onAccept={() => dashboard.selectedCandidate && dashboard.updateCandidateStatus(dashboard.selectedCandidate.id, "accepted")}
        onReject={() => dashboard.selectedCandidate && dashboard.updateCandidateStatus(dashboard.selectedCandidate.id, "rejected")}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
        getGenderLabel={getGenderLabel}
      />

      <CompetencesFormationCandidatesDialog
        open={dashboard.showFormationCandidatesDialog}
        selectedFormationData={dashboard.selectedFormationData}
        formationCandidates={dashboard.formationCandidates}
        eligibleCandidates={dashboard.eligibleCandidates}
        ineligibleCandidates={dashboard.ineligibleCandidates}
        assignedCandidateIds={dashboard.assignedCandidateIds}
        candidateToGroupMap={dashboard.candidateToGroupMap}
        eligiblePage={dashboard.eligiblePage}
        setEligiblePage={dashboard.setEligiblePage}
        eligibleItemsPerPage={dashboard.eligibleItemsPerPage}
        setEligibleItemsPerPage={dashboard.setEligibleItemsPerPage}
        setShowAutoGroupDialog={dashboard.setShowAutoGroupDialog}
        onClose={() => dashboard.setShowFormationCandidatesDialog(false)}
      />

      <CompetencesAutoGroupDialog
        open={dashboard.showAutoGroupDialog}
        selectedFormationData={dashboard.selectedFormationData}
        eligibleCandidates={dashboard.eligibleCandidates}
        assignedCandidateIds={dashboard.assignedCandidateIds}
        groupSize={dashboard.groupSize}
        setGroupSize={dashboard.setGroupSize}
        creatingGroups={dashboard.creatingGroups}
        onClose={() => dashboard.setShowAutoGroupDialog(false)}
        onCreate={dashboard.handleCreateAutoGroups}
      />

      <CompetencesSuccessModal
        open={dashboard.showSuccessModal}
        onOpenChange={dashboard.setShowSuccessModal}
        successMessage={dashboard.successMessage}
      />
    </div>
  )
}
