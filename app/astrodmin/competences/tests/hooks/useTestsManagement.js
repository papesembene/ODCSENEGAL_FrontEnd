import { useState, useEffect, useCallback, useRef } from "react"
import { useTestResults } from "./use-test-results"
import { toast } from "sonner"
import { getAdminAuthHeaders } from "@/app/utils/admin-auth"
import {
  API_BASE_URL,
} from "../constants"
import {
  createInitialGroup,
  createInitialInvitationDetails,
  createInitialQuestion,
  createInitialTest,
  calculateResultScorePercentage,
  calculateResultPoints,
  buildGroupedResults,
  buildAdminStats,
  buildScoreDistributionData,
  buildStatusDistributionData,
  normalizeFormationName,
} from "../helpers"
import {
  fetchAvailableCandidatesData,
  fetchStatisticsData,
  fetchTestGroupsData,
  fetchTestSessionsData,
  fetchTestsData,
} from "./test-management-fetchers"
import {
  createGroupHandlers,
  createQuestionHandlers,
  createResultHandlers,
  createTestHandlers,
} from "./test-management-actions"

export const useTestsManagement = (router) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // États pour les tests
  const [testsData, setTestsData] = useState([])
  const results = useTestResults(isAuthenticated)
  const { testResults, selectedResults, setSelectedResults, reloadResults } = results
  const resultRequestRef = useRef(0)
  const [testSessions, setTestSessions] = useState([])
  const [testSessionsTotal, setTestSessionsTotal] = useState(0)
  const [statistics, setStatistics] = useState(null)
  const [selectedTest, setSelectedTest] = useState(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [manualGrades, setManualGrades] = useState({})

  // Filtres
  const [searchTerm, setSearchTerm] = useState("")
  const [referentielFilter, setReferentielFilter] = useState("all")
  const [resultsView, setResultsView] = useState("list")
  const [sessionsSearchTerm, setSessionsSearchTerm] = useState("")
  const [sessionsStatusFilter, setSessionsStatusFilter] = useState("all")
  const [sessionsTestFilter, setSessionsTestFilter] = useState("all")
  const [showEmailResultsDialog, setShowEmailResultsDialog] = useState(false)
  const [emailResultsType, setEmailResultsType] = useState("")
  const [customResultsMessage, setCustomResultsMessage] = useState("")
  const [sendingResultsEmails, setSendingResultsEmails] = useState(false)
  const [resultEmailBatchId, setResultEmailBatchId] = useState("")
  const [selectedFormationResults, setSelectedFormationResults] = useState(null)
  const [selectedGroupResults, setSelectedGroupResults] = useState(null)

  // États pour les groupes de tests
  const [testGroups, setTestGroups] = useState([])
  const [selectedCandidatesForGroup, setSelectedCandidatesForGroup] = useState([])
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false)
  const [availableCandidates, setAvailableCandidates] = useState([])
  const [availableCandidatesTotal, setAvailableCandidatesTotal] = useState(0)
  const [assignedCandidateIds, setAssignedCandidateIds] = useState([])
  const [candidateToGroupMap, setCandidateToGroupMap] = useState({})

  // États pour la pagination
  const [testsPage, setTestsPage] = useState(1)
  const [testsItemsPerPage, setTestsItemsPerPage] = useState(20)
  const [groupsPage, setGroupsPage] = useState(1)
  const [groupsItemsPerPage, setGroupsItemsPerPage] = useState(20)
  const [sessionsPage, setSessionsPage] = useState(1)
  const [sessionsItemsPerPage, setSessionsItemsPerPage] = useState(20)
  const [newGroup, setNewGroup] = useState(createInitialGroup())
  const [groupFormationFilter, setGroupFormationFilter] = useState("all")
  const [showGroupCandidatesDialog, setShowGroupCandidatesDialog] = useState(false)
  const [selectedGroupForView, setSelectedGroupForView] = useState(null)
  const [groupCandidatesDetails, setGroupCandidatesDetails] = useState([])
  const [loadingGroupCandidates, setLoadingGroupCandidates] = useState(false)
  const [showSendInvitationDialog, setShowSendInvitationDialog] = useState(false)
  const [selectedGroupForInvitation, setSelectedGroupForInvitation] = useState(null)
  const [invitationDetails, setInvitationDetails] = useState(createInitialInvitationDetails())
  const [sendingInvitations, setSendingInvitations] = useState(false)
  const [showViolationsDialog, setShowViolationsDialog] = useState(false)
  const [selectedResultViolations, setSelectedResultViolations] = useState(null)

  // États pour les modals de confirmation
  const [showDeleteTestDialog, setShowDeleteTestDialog] = useState(false)
  const [testToDelete, setTestToDelete] = useState(null)
  const [deletingTest, setDeletingTest] = useState(false)
  const [showDeleteGroupDialog, setShowDeleteGroupDialog] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState(null)
  const [deletingGroup, setDeletingGroup] = useState(false)
  const [showDeleteResultDialog, setShowDeleteResultDialog] = useState(false)
  const [resultToDelete, setResultToDelete] = useState(null)

  // Formulaire de création de test
  const [newTest, setNewTest] = useState(createInitialTest())

  // Gestion des questions
  const [currentQuestion, setCurrentQuestion] = useState(createInitialQuestion())
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null)
  const [showImportQuestionsDialog, setShowImportQuestionsDialog] = useState(false)
  const [showImportResultsDialog, setShowImportResultsDialog] = useState(false)

  // Email data et gestion de groupes
  const [showCandidateSelection, setShowCandidateSelection] = useState(false)

  const fetchTests = useCallback(async () => {
    await fetchTestsData({ setLoading, setRefreshing, setTestsData })
  }, [])

  const fetchStatistics = useCallback(async () => {
    await fetchStatisticsData({ setStatistics })
  }, [])

  const fetchResults = useCallback(async () => {
    reloadResults()
    await fetchStatistics()
  }, [reloadResults, fetchStatistics])

  const fetchTestSessions = useCallback(async () => {
    await fetchTestSessionsData({
      filters: {
        page: sessionsPage,
        perPage: sessionsItemsPerPage,
        search: sessionsSearchTerm,
        status: sessionsStatusFilter,
        testId: sessionsTestFilter,
      },
      setTestSessions,
      setTestSessionsTotal,
    })
  }, [sessionsItemsPerPage, sessionsPage, sessionsSearchTerm, sessionsStatusFilter, sessionsTestFilter])

  const fetchTestGroups = useCallback(async () => {
    await fetchTestGroupsData({
      groupFormationFilter,
      setAssignedCandidateIds,
      setCandidateToGroupMap,
      setTestGroups,
    })
  }, [groupFormationFilter])

  const handleMarkSessionForReschedule = useCallback(async (session) => {
    if (!session?.id) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/tests/sessions/${session.id}/reschedule`, {
        method: "PATCH",
        headers: getAdminAuthHeaders(),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        toast.error(result.error || "Impossible de marquer cette session à reprogrammer")
        return
      }

      toast.success("Candidat marqué à reprogrammer")
      await fetchTestSessions()
      await fetchTestGroups()
    } catch (error) {
      console.warn("Erreur reprogrammation session:", error)
      toast.error("Impossible de marquer cette session à reprogrammer")
    }
  }, [fetchTestGroups, fetchTestSessions])

  const fetchAvailableCandidates = useCallback(async (filters = {}) => {
    await fetchAvailableCandidatesData({
      ...filters,
      setAvailableCandidates,
      setAvailableCandidatesTotal,
    })
  }, [])

  useEffect(() => {
    const authenticated = !!localStorage.getItem("admin_token")
    const adminType = localStorage.getItem("admin_type")
    if (!authenticated || (adminType !== "competences" && adminType !== "super_admin")) {
      router.push("/astrodmin")
      return
    }
    setIsAuthenticated(true)
    fetchTests()
    fetchStatistics()
  }, [router, fetchTests, fetchStatistics])

  useEffect(() => {
    if (isAuthenticated) {
      fetchTestGroups()
    }
  }, [groupFormationFilter, isAuthenticated, fetchTestGroups])

  useEffect(() => {
    if (isAuthenticated) {
      fetchTestSessions()
    }
  }, [fetchTestSessions, isAuthenticated])

  const questionHandlers = createQuestionHandlers({
    currentQuestion,
    editingQuestionIndex,
    newTest,
    setCurrentQuestion,
    setEditingQuestionIndex,
    setNewTest,
    setShowImportQuestionsDialog,
  })

  const testHandlers = createTestHandlers({
    editingTest,
    fetchTests,
    newTest,
    setCurrentQuestion,
    setEditingTest,
    setNewTest,
    setSelectedTest,
    setShowCreateDialog,
    setShowImportResultsDialog,
  })

  const handleDeleteTestClick = (test) => {
    setTestToDelete(test)
    setShowDeleteTestDialog(true)
  }

  const handleConfirmDeleteTest = async () => {
    if (!testToDelete) return
    setDeletingTest(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/tests/${testToDelete.id}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      })
      const result = await response.json()
      if (result.success) {
        toast.success(`Test "${testToDelete.title}" supprimé`)
        fetchTests()
        setTimeout(() => {
          setShowDeleteTestDialog(false)
          setTestToDelete(null)
          setDeletingTest(false)
        }, 500)
      } else {
        toast.error(result.error || "Erreur de suppression")
        setDeletingTest(false)
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur de suppression")
      setDeletingTest(false)
    }
  }

  const groupHandlers = createGroupHandlers({
    assignedCandidateIds,
    fetchTestGroups,
    invitationDetails,
    newGroup,
    selectedCandidatesForGroup,
    selectedGroupForInvitation,
    setDeletingGroup,
    setGroupCandidatesDetails,
    setGroupToDelete,
    setInvitationDetails,
    setLoadingGroupCandidates,
    setNewGroup,
    setSelectedCandidatesForGroup,
    setSelectedGroupForInvitation,
    setSelectedGroupForView,
    setShowCreateGroupDialog,
    setShowDeleteGroupDialog,
    setShowGroupCandidatesDialog,
    setShowSendInvitationDialog,
    setSendingInvitations,
    testsData,
  })

  const resultHandlers = createResultHandlers({
    resultRequestRef,
    emailResultsType,
    customResultsMessage,
    setResultEmailBatchId,
    fetchResults,
    manualGrades,
    selectedResult,
    selectedResults,
    setCustomResultsMessage,
    setEmailResultsType,
    setManualGrades,
    setSelectedResult,
    setSelectedResultViolations,
    setSelectedResults,
    setSendingResultsEmails,
    setShowDetailsDialog,
    setShowEmailResultsDialog,
    setShowViolationsDialog,
  })

  // Derived state
  const filteredTests = testsData.filter((test) => {
    const matchesSearch = searchTerm === "" || test.title?.toLowerCase().includes(searchTerm.toLowerCase()) || test.referentiel?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesReferentiel = referentielFilter === "all" || normalizeFormationName(test.referentiel) === normalizeFormationName(referentielFilter)
    return matchesSearch && matchesReferentiel
  })

  const filteredResults = testResults

  return {
    ...results,
    isAuthenticated,
    loading,
    refreshing,
    testsData,
    testResults,
    testSessions,
    testSessionsTotal,
    statistics,
    selectedTest, setSelectedTest,
    showCreateDialog, setShowCreateDialog,
    showUploadDialog, setShowUploadDialog,
    editingTest, setEditingTest,
    showDetailsDialog, setShowDetailsDialog,
    selectedResult, setSelectedResult,
    manualGrades, setManualGrades,
    searchTerm, setSearchTerm,
    referentielFilter, setReferentielFilter,
    resultsView, setResultsView,
    sessionsSearchTerm, setSessionsSearchTerm,
    sessionsStatusFilter, setSessionsStatusFilter,
    sessionsTestFilter, setSessionsTestFilter,
    selectedResults, setSelectedResults,
    showEmailResultsDialog, setShowEmailResultsDialog,
    emailResultsType, setEmailResultsType,
    customResultsMessage, setCustomResultsMessage,
    sendingResultsEmails, setSendingResultsEmails,
    resultEmailBatchId, setResultEmailBatchId,
    selectedFormationResults, setSelectedFormationResults,
    selectedGroupResults, setSelectedGroupResults,
    testGroups, setTestGroups,
    selectedCandidatesForGroup, setSelectedCandidatesForGroup,
    showCreateGroupDialog, setShowCreateGroupDialog,
    availableCandidates, setAvailableCandidates,
    availableCandidatesTotal, setAvailableCandidatesTotal,
    assignedCandidateIds, setAssignedCandidateIds,
    candidateToGroupMap, setCandidateToGroupMap,
    testsPage, setTestsPage,
    testsItemsPerPage, setTestsItemsPerPage,
    groupsPage, setGroupsPage,
    groupsItemsPerPage, setGroupsItemsPerPage,
    sessionsPage, setSessionsPage,
    sessionsItemsPerPage, setSessionsItemsPerPage,
    newGroup, setNewGroup,
    groupFormationFilter, setGroupFormationFilter,
    showGroupCandidatesDialog, setShowGroupCandidatesDialog,
    selectedGroupForView, setSelectedGroupForView,
    groupCandidatesDetails, setGroupCandidatesDetails,
    loadingGroupCandidates, setLoadingGroupCandidates,
    showSendInvitationDialog, setShowSendInvitationDialog,
    selectedGroupForInvitation, setSelectedGroupForInvitation,
    invitationDetails, setInvitationDetails,
    sendingInvitations, setSendingInvitations,
    showViolationsDialog, setShowViolationsDialog,
    selectedResultViolations, setSelectedResultViolations,
    showDeleteTestDialog, setShowDeleteTestDialog,
    testToDelete, setTestToDelete,
    deletingTest, setDeletingTest,
    showDeleteGroupDialog, setShowDeleteGroupDialog,
    groupToDelete, setGroupToDelete,
    deletingGroup, setDeletingGroup,
    showDeleteResultDialog, setShowDeleteResultDialog,
    resultToDelete, setResultToDelete,
    newTest, setNewTest,
    currentQuestion, setCurrentQuestion,
    editingQuestionIndex, setEditingQuestionIndex,
    showImportQuestionsDialog, setShowImportQuestionsDialog,
    showImportResultsDialog, setShowImportResultsDialog,
    showCandidateSelection, setShowCandidateSelection,
    
    // Handlers
    fetchTests,
    fetchResults,
    fetchStatistics,
    fetchTestSessions,
    handleMarkSessionForReschedule,
    fetchAvailableCandidates,
    handleCreateTest: testHandlers.handleCreateTest,
    handleEditTest: testHandlers.handleEditTest,
    handleDeleteTestClick,
    handleConfirmDeleteTest,
    handleToggleTestStatus: testHandlers.handleToggleTestStatus,
    handleAddQuestion: questionHandlers.handleAddQuestion,
    handleEditQuestion: questionHandlers.handleEditQuestion,
    handleDeleteQuestion: questionHandlers.handleDeleteQuestion,
    handleCancelEditQuestion: questionHandlers.handleCancelEditQuestion,
    handleImageUpload: questionHandlers.handleImageUpload,
    handleRemoveImage: questionHandlers.handleRemoveImage,
    handleImportQuestionsFromExcel: questionHandlers.handleImportQuestionsFromExcel,
    handleImportResultsFromExcel: testHandlers.handleImportResultsFromExcel,
    handleCreateGroup: groupHandlers.handleCreateGroup,
    handleOpenInvitationDialog: groupHandlers.handleOpenInvitationDialog,
    handleTestSelection: groupHandlers.handleTestSelection,
    handleConfirmAndSendInvitations: groupHandlers.handleConfirmAndSendInvitations,
    handleDeleteGroupClick: groupHandlers.handleDeleteGroupClick,
    handleConfirmDeleteGroup: () => groupHandlers.handleConfirmDeleteGroup(groupToDelete),
    handleViewGroupCandidates: groupHandlers.handleViewGroupCandidates,
    handleSelectCandidateForGroup: groupHandlers.handleSelectCandidateForGroup,
    handleCopyTestLink: testHandlers.handleCopyTestLink,
    handleOpenTest: testHandlers.handleOpenTest,
    handleViewDetails: resultHandlers.handleViewDetails,
    handleSaveManualGrade: resultHandlers.handleSaveManualGrade,
    handleViewViolations: resultHandlers.handleViewViolations,
    handleSelectResult: resultHandlers.handleSelectResult,
    handleSendResultsEmails: resultHandlers.handleSendResultsEmails,
    handleCancelCreateGroup: groupHandlers.handleCancelCreateGroup,
    
    // Derived state
    filteredTests,
    filteredResults,
    stats: buildAdminStats(testsData, testResults, statistics),
    scoreDistributionData: buildScoreDistributionData(statistics),
    statusDistributionData: buildStatusDistributionData(statistics),
    groupedResults: () => buildGroupedResults(filteredResults, testsData, testGroups),
    calculateTotalScore: () => calculateResultScorePercentage(selectedResult, testsData, manualGrades),
    calculatePoints: (result) => calculateResultPoints(result, testsData),
  }
}
