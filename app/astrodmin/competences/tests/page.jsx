"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  RefreshCw, 
  AlertCircle,
  Wand2 
} from "lucide-react"

// Hooks
import { useTestsManagement } from "./hooks/useTestsManagement"

// Tabs Components
import { OverviewTab } from "./overview-tab"
import { TestsTab } from "./tests-tab"
import { GroupsTab } from "./groups-tab"
import { ResultsTab } from "./results-tab"

// Components and Dialogs
import { 
  CreateTestDialog,
  CreateGroupDialog,
  GroupCandidatesDialog,
  ResultDetailsDialog,
  EmailDialog,
  ViolationsDialog,
  InvitationDialog,
  ImportDialog,
  ConfirmationDialog
} from "./test-components"

export default function TestsManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  
  const m = useTestsManagement(router)

  if (!m.isAuthenticated || m.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="h-12 w-12 animate-spin text-orange-500" />
        <p className="text-muted-foreground animate-pulse font-medium">Chargement de votre espace sécurisé...</p>
      </div>
    )
  }

  const getViolationSeverityBadge = (violations) => {
    if (!violations || violations.totalViolations === 0) {
      return <Badge variant="outline" className="text-green-600 border-green-200">Aucune</Badge>
    }
    const count = violations.totalViolations
    if (count < 3) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Faible ({count})</Badge>
    if (count < 6) return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Moyenne ({count})</Badge>
    return <Badge variant="destructive">Élevée ({count})</Badge>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 bg-gray-50/30 dark:bg-gray-950/30 min-h-screen">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl shadow-lg ring-4 ring-orange-500/10">
            <Wand2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Gestion des Tests
            </h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Console d'administration ODC
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={m.fetchTests} className="rounded-xl border-2 hover:bg-gray-50 transition-all font-semibold" disabled={m.refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${m.refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button onClick={() => m.setShowCreateGroupDialog(true)} variant="secondary" className="rounded-xl font-bold transition-all shadow-sm">
            <Plus className="mr-2 h-5 w-5" />
            Créer un groupe
          </Button>
          <Button onClick={() => { m.setEditingTest(null); m.setShowCreateDialog(true); }} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-6 transition-all shadow-md hover:shadow-lg active:scale-95">
            <Plus className="mr-2 h-5 w-5" />
            Nouveau test
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
        <div className="sticky top-0 z-10 py-2 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-md rounded-xl px-2">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-14 p-1.5 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all h-11">Tableau de bord</TabsTrigger>
            <TabsTrigger value="tests" className="rounded-lg font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all h-11">Mes Tests</TabsTrigger>
            <TabsTrigger value="groups" className="rounded-lg font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all h-11">Groupes & Sessions</TabsTrigger>
            <TabsTrigger value="results" className="rounded-lg font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all h-11">Résultats</TabsTrigger>
          </TabsList>
        </div>

        <OverviewTab 
          stats={m.stats} 
          testResults={m.testResults}
          fetchResults={m.fetchResults}
          refreshing={m.refreshing}
          scoreDistributionData={m.scoreDistributionData} 
          statusDistributionData={m.statusDistributionData} 
          setShowUploadDialog={m.setShowUploadDialog}
          setShowEmailDialog={m.setShowEmailDialog}
          setShowResultsDialog={m.setShowResultsDialog}
          testsData={m.testsData}
          handleCopyTestLink={m.handleCopyTestLink}
          handleOpenTest={m.handleOpenTest}
        />
        
        <TestsTab 
          searchTerm={m.searchTerm} setSearchTerm={m.setSearchTerm}
          testsItemsPerPage={m.testsItemsPerPage} setTestsItemsPerPage={m.setTestsItemsPerPage}
          testsPage={m.testsPage} setTestsPage={m.setTestsPage}
          filteredTests={m.filteredTests}
          handleCopyTestLink={m.handleCopyTestLink}
          handleOpenTest={m.handleOpenTest}
          handleEditTest={m.handleEditTest}
          handleDeleteTestClick={m.handleDeleteTestClick}
        />

        <GroupsTab 
          groupFormationFilter={m.groupFormationFilter} setGroupFormationFilter={m.setGroupFormationFilter}
          testGroups={m.testGroups}
          groupsItemsPerPage={m.groupsItemsPerPage} setGroupsItemsPerPage={m.setGroupsItemsPerPage}
          groupsPage={m.groupsPage} setGroupsPage={m.setGroupsPage}
          setShowCreateGroupDialog={m.setShowCreateGroupDialog}
          handleOpenInvitationDialog={m.handleOpenInvitationDialog}
          handleDeleteGroupClick={m.handleDeleteGroupClick}
          handleViewGroupCandidates={m.handleViewGroupCandidates}
        />

        <ResultsTab 
          testResults={m.testResults}
          refreshing={m.refreshing}
          setShowImportResultsDialog={m.setShowImportResultsDialog}
          handleExportResults={m.handleExportResults}
          fetchResults={m.fetchResults}
          resultsReferentielFilter={m.resultsReferentielFilter} setResultsReferentielFilter={m.setResultsReferentielFilter}
          resultsStatusFilter={m.resultsStatusFilter} setResultsStatusFilter={m.setResultsStatusFilter}
          resultsView={m.resultsView} setResultsView={m.setResultsView}
          resultsItemsPerPage={m.resultsItemsPerPage} setResultsItemsPerPage={m.setResultsItemsPerPage}
          resultsPage={m.resultsPage} setResultsPage={m.setResultsPage}
          filteredResults={m.filteredResults}
          selectedResults={m.selectedResults}
          handleSelectAllResults={(checked) => m.setSelectedResults(checked ? m.filteredResults.map(r => r.id) : [])}
          handleSelectResult={m.handleSelectResult}
          calculatePoints={m.calculatePoints}
          getViolationSeverityBadge={getViolationSeverityBadge}
          testViolations={m.testViolations}
          handleViewDetails={m.handleViewDetails}
          handleViewViolations={m.handleViewViolations}
          groupedResults={m.groupedResults}
        />
      </Tabs>

      {/* Dialogs Components */}
      <CreateTestDialog 
        open={m.showCreateDialog} onOpenChange={m.setShowCreateDialog}
        editingTest={m.editingTest}
        newTest={m.newTest} setNewTest={m.setNewTest}
        currentQuestion={m.currentQuestion} setCurrentQuestion={m.setCurrentQuestion}
        editingQuestionIndex={m.editingQuestionIndex}
        handleCancelEditQuestion={m.handleCancelEditQuestion}
        handleAddQuestion={m.handleAddQuestion}
        handleEditQuestion={m.handleEditQuestion}
        handleDeleteQuestion={m.handleDeleteQuestion}
        handleImageUpload={m.handleImageUpload}
        handleRemoveImage={m.handleRemoveImage}
        handleCreateTest={m.handleCreateTest}
        setShowImportQuestionsDialog={m.setShowImportQuestionsDialog}
      />

      <CreateGroupDialog 
        open={m.showCreateGroupDialog} onOpenChange={m.setShowCreateGroupDialog}
        newGroup={m.newGroup} setNewGroup={m.setNewGroup}
        testsData={m.testsData}
        availableCandidates={m.availableCandidates}
        assignedCandidateIds={m.assignedCandidateIds}
        candidateToGroupMap={m.candidateToGroupMap}
        selectedCandidatesForGroup={m.selectedCandidatesForGroup}
        handleSelectCandidateForGroup={m.handleSelectCandidateForGroup}
        handleCreateGroup={m.handleCreateGroup}
        setSelectedCandidatesForGroup={m.setSelectedCandidatesForGroup}
        handleCancelCreateGroup={m.handleCancelCreateGroup}
      />

      <GroupCandidatesDialog 
        open={m.showGroupCandidatesDialog} onOpenChange={m.setShowGroupCandidatesDialog}
        selectedGroup={m.selectedGroupForView}
        candidates={m.groupCandidatesDetails}
        loading={m.loadingGroupCandidates}
      />

      <ResultDetailsDialog 
        open={m.showDetailsDialog} onOpenChange={m.setShowDetailsDialog}
        selectedResult={m.selectedResult}
        testsData={m.testsData}
        manualGrades={m.manualGrades}
        handleSaveManualGrade={m.handleSaveManualGrade}
        calculateTotalScore={m.calculateTotalScore}
        fetchResults={m.fetchResults}
      />

      <EmailDialog 
        open={m.showEmailResultsDialog} onOpenChange={m.setShowEmailResultsDialog}
        selectedResults={m.selectedResults}
        emailType={m.emailResultsType} setEmailType={m.setEmailResultsType}
        customMessage={m.customResultsMessage} setCustomMessage={m.setCustomResultsMessage}
        sendingEmails={m.sendingResultsEmails}
        handleSendEmails={m.handleSendResultsEmails}
      />

      <ViolationsDialog 
        open={m.showViolationsDialog} onOpenChange={m.setShowViolationsDialog}
        selectedResultViolations={m.selectedResultViolations}
      />

      <InvitationDialog 
        open={m.showSendInvitationDialog} onOpenChange={m.setShowSendInvitationDialog}
        selectedGroupForInvitation={m.selectedGroupForInvitation}
        invitationDetails={m.invitationDetails} setInvitationDetails={m.setInvitationDetails}
        testsData={m.testsData}
        handleTestSelection={m.handleTestSelection}
        sendingInvitations={m.sendingInvitations}
        handleConfirmAndSendInvitations={m.handleConfirmAndSendInvitations}
      />

      <ImportDialog 
        open={m.showImportQuestionsDialog} onOpenChange={m.setShowImportQuestionsDialog}
        title="Importer des questions"
        description="Chargez un fichier CSV pour ajouter des questions au test."
        onImport={m.handleImportQuestionsFromExcel}
        templateUrl="/templates/questions_template.csv" templateName="modele_questions.csv"
      />

      <ImportDialog 
        open={m.showImportResultsDialog} onOpenChange={m.setShowImportResultsDialog}
        title="Importer des résultats"
        description="Chargez un fichier CSV pour importer des résultats de tests externes."
        onImport={m.handleImportResultsFromExcel}
        templateUrl="/templates/results_template.csv" templateName="modele_resultats.csv"
      />

      <ConfirmationDialog
        open={m.showDeleteTestDialog} onOpenChange={m.setShowDeleteTestDialog}
        title="Confirmer la suppression" description="Êtes-vous sûr de vouloir supprimer ce test ?"
        details={m.testToDelete && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <h4 className="font-medium mb-2">{m.testToDelete.title}</h4>
            <div className="text-sm space-y-1">
              <p><strong>Référentiel :</strong> {m.testToDelete.referentiel}</p>
              <p><strong>Durée :</strong> {m.testToDelete.duration} minutes</p>
            </div>
          </div>
        )}
        warningText="⚠️ Cette action est irréversible. Le test sera supprimé."
        isLoading={m.deletingTest} onCancel={() => m.setShowDeleteTestDialog(false)}
        onConfirm={m.handleConfirmDeleteTest} confirmLabel="Supprimer" loadingLabel="Suppression..."
      />

      <ConfirmationDialog
        open={m.showDeleteGroupDialog} onOpenChange={m.setShowDeleteGroupDialog}
        title="Confirmer la suppression" description="Êtes-vous sûr de vouloir supprimer ce groupe ?"
        details={m.groupToDelete && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <h4 className="font-medium mb-2">{m.groupToDelete.name}</h4>
          </div>
        )}
        warningText="⚠️ Cette action est irréversible."
        isLoading={m.deletingGroup} onCancel={() => m.setShowDeleteGroupDialog(false)}
        onConfirm={m.handleConfirmDeleteGroup} confirmLabel="Supprimer" loadingLabel="Suppression..."
      />

    </div>
  )
}
