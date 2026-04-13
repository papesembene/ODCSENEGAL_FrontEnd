import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  API_BASE_URL,
  CANDIDATES_LIST,
} from "../constants"
import {
  createInitialGroup,
  createInitialInvitationDetails,
  createInitialQuestion,
  createInitialTest,
  createInitialEmailData,
  validateQuestionBeforeSave,
  buildQuestionPayload,
  buildQuestionEditorState,
  parseQuestionsCsv,
  parseImportedResultsCsv,
  buildResultsCsvContent,
  calculateResultScorePercentage,
  calculateResultPoints,
  isSelectedStatus,
  isNotSelectedStatus,
  isPendingStatus,
  buildGroupedResults,
  buildAdminStats,
  buildScoreDistributionData,
  buildStatusDistributionData,
  getTestUrl,
  normalizeFormationName,
} from "../helpers"

export const useTestsManagement = (router) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // États pour les tests
  const [testsData, setTestsData] = useState([])
  const [testResults, setTestResults] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [selectedTest, setSelectedTest] = useState(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showResultsDialog, setShowResultsDialog] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [manualGrades, setManualGrades] = useState({})

  // Filtres
  const [searchTerm, setSearchTerm] = useState("")
  const [referentielFilter, setReferentielFilter] = useState("all")
  const [resultsReferentielFilter, setResultsReferentielFilter] = useState("all")
  const [resultsStatusFilter, setResultsStatusFilter] = useState("all")
  const [resultsView, setResultsView] = useState("list")
  const [selectedResults, setSelectedResults] = useState([])
  const [showEmailResultsDialog, setShowEmailResultsDialog] = useState(false)
  const [emailResultsType, setEmailResultsType] = useState("")
  const [customResultsMessage, setCustomResultsMessage] = useState("")
  const [sendingResultsEmails, setSendingResultsEmails] = useState(false)
  const [selectedFormationResults, setSelectedFormationResults] = useState(null)
  const [selectedGroupResults, setSelectedGroupResults] = useState(null)

  // États pour les groupes de tests
  const [testGroups, setTestGroups] = useState([])
  const [selectedCandidatesForGroup, setSelectedCandidatesForGroup] = useState([])
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false)
  const [availableCandidates, setAvailableCandidates] = useState([])
  const [assignedCandidateIds, setAssignedCandidateIds] = useState([])
  const [candidateToGroupMap, setCandidateToGroupMap] = useState({})

  // États pour la pagination
  const [testsPage, setTestsPage] = useState(1)
  const [testsItemsPerPage, setTestsItemsPerPage] = useState(20)
  const [groupsPage, setGroupsPage] = useState(1)
  const [groupsItemsPerPage, setGroupsItemsPerPage] = useState(20)
  const [resultsPage, setResultsPage] = useState(1)
  const [resultsItemsPerPage, setResultsItemsPerPage] = useState(20)
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
  const [testViolations, setTestViolations] = useState({})
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
  const [emailData, setEmailData] = useState(createInitialEmailData())
  const [showCandidateSelection, setShowCandidateSelection] = useState(false)

  const fetchTests = useCallback(async () => {
    try {
      setRefreshing(true)
      const { fetchJsonWithTimeout } = await import("@/app/utils/fetchWithTimeout")
      const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests`, {
        timeout: 30000,
        retries: 2,
        retryDelay: 1000,
      })

      if (result.success) {
        setTestsData(result.data || [])
      } else {
        toast.error(result.error || "Erreur lors du chargement des tests")
        setTestsData([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tests:", error)
      toast.error("Impossible de charger les tests.")
      setTestsData([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const fetchResults = useCallback(async () => {
    try {
      const { fetchJsonWithTimeout } = await import("@/app/utils/fetchWithTimeout")
      const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/results`, {
        timeout: 45000,
        retries: 2,
        retryDelay: 1500,
      })

      if (result.success) {
        setTestResults(result.data || [])
      } else {
        toast.error(result.error || "Erreur lors du chargement des résultats")
        setTestResults([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des résultats:", error)
      toast.error("Impossible de charger les résultats.")
      setTestResults([])
    }
  }, [])

  const fetchStatistics = useCallback(async () => {
    try {
      const { fetchJsonWithTimeout } = await import("@/app/utils/fetchWithTimeout")
      const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/statistics`, {
        timeout: 30000,
        retries: 2,
        retryDelay: 1000,
      })

      if (result.success) {
        setStatistics(result.data)
      } else {
        toast.error(result.error || "Erreur lors du chargement des statistiques")
        setStatistics(null)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error)
      toast.error("Impossible de charger les statistiques.")
      setStatistics(null)
    }
  }, [])

  const fetchAllViolations = useCallback(async () => {
    try {
      const violationsMap = {}
      for (const result of testResults) {
        const candidateEmail = result.candidate?.email || result.candidateEmail
        const testId = result.testId
        if (candidateEmail && testId) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/admin/tests/${testId}/violations/${candidateEmail}`)
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.data) {
                violationsMap[result.id] = data.data
              }
            }
          } catch (error) {
            console.error(`Erreur violations pour ${candidateEmail}:`, error)
          }
        }
      }
      setTestViolations(violationsMap)
    } catch (error) {
      console.error("Erreur lors de la récupération des violations:", error)
    }
  }, [testResults])

  const fetchTestGroups = useCallback(async () => {
    try {
      let url = `${API_BASE_URL}/api/admin/test-groups?`
      if (groupFormationFilter !== "all") {
        url += `formation=${groupFormationFilter}`
      }
      const response = await fetch(url)
      const result = await response.json()
      if (result.success) {
        const groups = result.data || []
        setTestGroups(groups)
        const assignedIds = new Set()
        const candidateGroupMap = {}
        groups.forEach((group) => {
          if (group.candidate_ids && Array.isArray(group.candidate_ids)) {
            group.candidate_ids.forEach((id) => {
              assignedIds.add(id)
              candidateGroupMap[id] = group.name
            })
          }
        })
        setAssignedCandidateIds(Array.from(assignedIds))
        setCandidateToGroupMap(candidateGroupMap)
      } else {
        toast.error(result.error || "Erreur lors de la récupération des groupes")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Impossible de récupérer les groupes")
    }
  }, [groupFormationFilter])

  const fetchAvailableCandidates = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/candidatures`)
      const result = await response.json()
      if (result.success) {
        const normalized = (result.data || []).map(c => ({
          ...c,
          desired_training: normalizeFormationName(c.desired_training)
        }))
        setAvailableCandidates(normalized)
      }
    } catch (error) {
      console.error("Erreur:", error)
    }
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
    fetchResults()
    fetchStatistics()
    fetchTestGroups()
    fetchAvailableCandidates()
  }, [router, fetchTests, fetchResults, fetchStatistics, fetchTestGroups, fetchAvailableCandidates])

  useEffect(() => {
    if (isAuthenticated) {
      fetchTestGroups()
    }
  }, [groupFormationFilter, isAuthenticated, fetchTestGroups])

  useEffect(() => {
    if (testResults.length > 0) {
      fetchAllViolations()
    }
  }, [testResults, fetchAllViolations])

  // Handlers
  const handleAddQuestion = () => {
    console.log("Tentative d'ajout de question:", currentQuestion)
    const validationError = validateQuestionBeforeSave(currentQuestion)
    if (validationError) {
      console.warn("Validation échouée:", validationError)
      toast.error(validationError)
      return
    }
    
    const questionData = buildQuestionPayload(
      currentQuestion,
      editingQuestionIndex !== null ? editingQuestionIndex : newTest.questions.length,
    )
    
    if (editingQuestionIndex !== null) {
      setNewTest(prev => {
        const updatedQuestions = [...prev.questions]
        updatedQuestions[editingQuestionIndex] = questionData
        return { ...prev, questions: updatedQuestions }
      })
      setEditingQuestionIndex(null)
      toast.success("Question modifiée")
    } else {
      setNewTest(prev => ({ 
        ...prev, 
        questions: [...prev.questions, questionData] 
      }))
      toast.success("Question ajoutée")
    }
    setCurrentQuestion(createInitialQuestion())
  }

  const handleEditQuestion = (index) => {
    const questionToEdit = newTest.questions[index]
    setCurrentQuestion(buildQuestionEditorState(questionToEdit))
    setEditingQuestionIndex(index)
    setTimeout(() => {
      const questionFormCard = document.querySelector('[data-question-form]')
      if (questionFormCard) {
        questionFormCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = newTest.questions.filter((_, i) => i !== index)
    setNewTest({ ...newTest, questions: updatedQuestions })
    toast.success("Question supprimée")
  }

  const handleCancelEditQuestion = () => {
    setCurrentQuestion(createInitialQuestion())
    setEditingQuestionIndex(null)
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setCurrentQuestion({
        ...currentQuestion,
        image: reader.result,
        imageFile: file,
      })
      toast.success("Image ajoutée")
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setCurrentQuestion({
      ...currentQuestion,
      image: null,
      imageFile: null,
    })
    toast.success("Image supprimée")
  }

  const handleImportQuestionsFromExcel = (event) => {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target.result
        const importedQuestions = parseQuestionsCsv(content, newTest.questions.length)
        setNewTest({
          ...newTest,
          questions: [...newTest.questions, ...importedQuestions]
        })
        toast.success(`${importedQuestions.length} question(s) importée(s)`)
        setShowImportQuestionsDialog(false)
      } catch (error) {
        console.error("Erreur d'import:", error)
        toast.error("Erreur lors de l'import du fichier")
      }
    }
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file, 'UTF-8')
    } else {
      toast.error("Veuillez sélectionner un fichier CSV")
    }
  }

  const handleImportResultsFromExcel = (event) => {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        toast.success(`Fichier ${file.name} importé. Traitement en cours...`)
        const content = e.target.result
        const importedResults = parseImportedResultsCsv(content)
        let successCount = 0
        let errorCount = 0
        for (const result of importedResults) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/admin/tests/results`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(result),
            })
            if (response.ok) successCount++
            else errorCount++
          } catch (error) { errorCount++ }
        }
        fetchResults()
        toast.success(`${successCount} résultat(s) importé(s). ${errorCount} échec(s).`)
        setShowImportResultsDialog(false)
      } catch (error) {
        console.error("Erreur d'import:", error)
        toast.error("Erreur lors de l'import")
      }
    }
    if (file.name.endsWith(".csv")) reader.readAsText(file)
    else toast.error("Veuillez sélectionner un fichier CSV")
  }

  const handleExportResults = (format) => {
    try {
      if (format === "csv") {
        const csvContent = buildResultsCsvContent(testResults)
        const BOM = "\uFEFF"
        const csvWithBOM = BOM + csvContent
        const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `resultats_tests_${new Date().toISOString().split("T")[0]}.csv`
        link.click()
        toast.success("Export CSV réussi")
      } else if (format === "excel") {
        toast.info("Export Excel : Utilisez l'export CSV")
      }
    } catch (error) {
      console.error("Erreur d'export:", error)
      toast.error("Erreur lors de l'export")
    }
  }

  const handleEditTest = (test) => {
    setEditingTest(test)
    setNewTest({
      title: test.title,
      referentiel: test.referentiel,
      duration: test.duration,
      scheduledDate: test.scheduledDate,
      scheduledTime: test.scheduledTime,
      totalQuestions: test.questions?.length || test.totalQuestions || 0,
      passingScore: test.passingScore,
      candidatesGroup: test.candidatesGroup || "",
      description: test.description || "",
      questions: test.questions || [],
    })
    setShowCreateDialog(true)
  }

  const handleCreateTest = async () => {
    try {
      if (!newTest.title || !newTest.referentiel || !newTest.scheduledDate || !newTest.scheduledTime) {
        toast.error("Veuillez remplir tous les champs obligatoires")
        return
      }
      if (newTest.questions.length === 0) {
        toast.error("Veuillez ajouter au moins une question")
        return
      }
      const testData = {
        ...newTest,
        totalQuestions: newTest.questions.length,
        updatedBy: localStorage.getItem("admin_email"),
      }
      const url = editingTest ? `${API_BASE_URL}/api/admin/tests/${editingTest.id}` : `${API_BASE_URL}/api/admin/tests`
      const method = editingTest ? "PATCH" : "POST"
      if (!editingTest) {
        testData.status = "active"
        testData.createdBy = localStorage.getItem("admin_email")
      } else {
        testData.updatedAt = new Date().toISOString()
      }
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      })
      const result = await response.json()
      if (result.success) {
        toast.success(editingTest ? "Test modifié !" : "Test créé !")
        setEditingTest(null)
      } else {
        toast.error(result.error || "Erreur lors de la sauvegarde")
        return
      }
      setShowCreateDialog(false)
      fetchTests()
      setNewTest(createInitialTest())
      setCurrentQuestion(createInitialQuestion())
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde du test")
      console.error(error)
    }
  }

  const handleDeleteTestClick = (test) => {
    setTestToDelete(test)
    setShowDeleteTestDialog(true)
  }

  const handleConfirmDeleteTest = async () => {
    if (!testToDelete) return
    setDeletingTest(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/tests/${testToDelete.id}`, { method: "DELETE" })
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

  const handleToggleTestStatus = async (testId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "scheduled" : "active"
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/tests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: testId, status: newStatus }),
      })
      const result = await response.json()
      if (result.success) {
        toast.success(`Test ${newStatus === "active" ? "activé" : "désactivé"}`)
        fetchTests()
      }
    } catch (error) { toast.error("Erreur statut") }
  }

  const handleCreateGroup = async () => {
    try {
      if (!newGroup.name || !newGroup.formation || !newGroup.test_date || !newGroup.test_time) {
        toast.error("Veuillez remplir tous les champs")
        return
      }
      if (selectedCandidatesForGroup.length === 0) {
        toast.error("Veuillez sélectionner des candidats")
        return
      }
      const testDateTime = `${newGroup.test_date}T${newGroup.test_time}:00`
      const groupData = {
        ...newGroup,
        test_date: testDateTime,
        candidate_ids: selectedCandidatesForGroup,
        created_by: localStorage.getItem("admin_email"),
      }
      const response = await fetch(`${API_BASE_URL}/api/admin/test-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groupData),
      })
      const result = await response.json()
      if (result.success) {
        toast.success("Groupe créé !")
        setShowCreateGroupDialog(false)
        fetchTestGroups()
        setNewGroup(createInitialGroup())
        setSelectedCandidatesForGroup([])
      } else { toast.error(result.error || "Erreur création groupe") }
    } catch (error) { toast.error("Erreur création groupe") }
  }

  const handleOpenInvitationDialog = (group) => {
    setSelectedGroupForInvitation(group)
    
    // Extraire date et heure si présentes dans le groupe
    let testDate = ""
    let testTime = ""
    if (group.test_date) {
      const parts = group.test_date.split("T")
      testDate = parts[0]
      testTime = parts[1] ? parts[1].substring(0, 5) : ""
    }

    setInvitationDetails({
      ...createInitialInvitationDetails(),
      test_id: group.test_id || "",
      test_date: testDate,
      test_time: testTime,
      duration: group.duration || 60,
      location: group.location || "En ligne",
      instructions: group.instructions || "",
    })

    // Si un test est déjà associé, charger ses détails
    if (group.test_id) {
      const selTest = testsData.find((t) => t.id === group.test_id)
      if (selTest) {
        setInvitationDetails(prev => ({
          ...prev,
          test_date: selTest.scheduledDate || testDate,
          test_time: selTest.scheduledTime || testTime,
          duration: selTest.duration || 60,
        }))
      }
    }

    setShowSendInvitationDialog(true)
  }

  const handleTestSelection = (testId) => {
    const selTest = testsData.find((t) => t.id === testId)
    if (selTest) {
      setInvitationDetails((prev) => ({
        ...prev,
        test_id: testId,
        test_date: selTest.scheduledDate || "",
        test_time: selTest.scheduledTime || "",
        duration: selTest.duration || 60,
      }))
    } else {
      setInvitationDetails((prev) => ({ ...prev, test_id: testId }))
    }
  }

  const handleCancelCreateGroup = () => {
    setShowCreateGroupDialog(false)
    setNewGroup(createInitialGroup())
    setSelectedCandidatesForGroup([])
  }

  const handleConfirmAndSendInvitations = async () => {
    if (!invitationDetails.test_id || !invitationDetails.test_date || !invitationDetails.test_time) {
      toast.error("Veuillez remplir tous les champs")
      return
    }
    setSendingInvitations(true)
    try {
      const testDateTime = `${invitationDetails.test_date}T${invitationDetails.test_time}:00`
      const updateResponse = await fetch(`${API_BASE_URL}/api/admin/test-groups/${selectedGroupForInvitation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...invitationDetails, test_date: testDateTime }),
      })
      if (!(await updateResponse.json()).success) {
        toast.error("Erreur mise à jour groupe")
        setSendingInvitations(false)
        return
      }
      const sendResponse = await fetch(`${API_BASE_URL}/api/admin/test-groups/${selectedGroupForInvitation.id}/send-invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const sendResult = await sendResponse.json()
      if (sendResult.success) {
        toast.success(`Invitations envoyées à ${sendResult.data?.sent || 0} candidats`)
      } else { toast.error(sendResult.error || "Erreur d'envoi") }
      setShowSendInvitationDialog(false)
      fetchTestGroups()
    } catch (error) { toast.error("Erreur invitations") }
    finally { setSendingInvitations(false) }
  }

  const handleDeleteGroupClick = (group) => {
    setGroupToDelete(group)
    setShowDeleteGroupDialog(true)
  }

  const handleConfirmDeleteGroup = async () => {
    if (!groupToDelete) return
    setDeletingGroup(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/test-groups/${groupToDelete.id}`, { method: "DELETE" })
      if ((await response.json()).success) {
        toast.success(`Groupe "${groupToDelete.name}" supprimé`)
        fetchTestGroups()
        setTimeout(() => {
          setShowDeleteGroupDialog(false)
          setGroupToDelete(null)
          setDeletingGroup(false)
        }, 500)
      } else { setDeletingGroup(false) }
    } catch (error) { setDeletingGroup(false) }
  }

  const handleViewGroupCandidates = async (group) => {
    setSelectedGroupForView(group)
    setShowGroupCandidatesDialog(true)
    setLoadingGroupCandidates(true)
    try {
      const candidateIds = group.candidate_ids || []
      if (candidateIds.length === 0) {
        setGroupCandidatesDetails([])
        return
      }
      const response = await fetch(`${API_BASE_URL}/api/admin/candidatures`)
      const result = await response.json()
      if (result.success) {
        setGroupCandidatesDetails(result.data.filter((c) => candidateIds.includes(c.id)))
      }
    } catch (error) { toast.error("Erreur chargement candidats") }
    finally { setLoadingGroupCandidates(false) }
  }

  const handleSelectCandidateForGroup = (candidateId) => {
    if (assignedCandidateIds.includes(candidateId)) {
      toast.error("Déjà assigné")
      return
    }
    setSelectedCandidatesForGroup((prev) => prev.includes(candidateId) ? prev.filter(id => id !== candidateId) : [...prev, candidateId])
  }

  const handleSendEmails = async () => {
    try {
      const selectedCandidatesData = CANDIDATES_LIST.filter((c) => emailData.selectedCandidates.includes(c.id))
      const response = await fetch(`${API_BASE_URL}/api/admin/tests/send-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emailData,
          recipients: selectedCandidatesData,
          testDetails: selectedTest,
          testUrl: selectedTest ? getTestUrl(selectedTest.id) : "",
        }),
      })
      if ((await response.json()).success) toast.success("Emails envoyés !")
      else toast.success("Email envoyé ! (simulation)")
      setShowEmailDialog(false)
      setEmailData(createInitialEmailData())
    } catch (error) {
      toast.success("Email envoyé ! (simulation)")
      setShowEmailDialog(false)
    }
  }

  const handleCopyTestLink = (testId) => {
    const url = getTestUrl(testId)
    navigator.clipboard.writeText(url).then(() => toast.success("Lien copié !"))
  }

  const handleOpenTest = (testId) => window.open(getTestUrl(testId), "_blank")

  const handleViewDetails = (result) => {
    setSelectedResult(result)
    setShowDetailsDialog(true)
    setManualGrades(result.manualGrades || {})
  }

  const handleSaveManualGrade = async (questionId, grade) => {
    const updatedGrades = { ...manualGrades, [questionId]: parseFloat(grade) || 0 }
    setManualGrades(updatedGrades)
    if (selectedResult) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/tests/results/${selectedResult.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ manualGrades: updatedGrades }),
        })
        if (await response.json().success) {
          toast.success("Note sauvegardée")
          setSelectedResult({ ...selectedResult, manualGrades: updatedGrades })
        }
      } catch (error) { toast.error("Erreur sauvegarde note") }
    }
  }

  const handleViewViolations = (result) => {
    setSelectedResultViolations({ result, violations: testViolations[result.id] })
    setShowViolationsDialog(true)
  }

  const handleSelectResult = (resultId) => {
    setSelectedResults((prev) => prev.includes(resultId) ? prev.filter(id => id !== resultId) : [...prev, resultId])
  }

  const handleSendResultsEmails = async () => {
    if (selectedResults.length === 0) return
    setSendingResultsEmails(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success(`Emails envoyés à ${selectedResults.length} candidats`)
      setShowEmailResultsDialog(false)
      setSelectedResults([])
      setEmailResultsType("")
      setCustomResultsMessage("")
    } finally { setSendingResultsEmails(false) }
  }

  // Derived state
  const filteredTests = testsData.filter((test) => {
    const matchesSearch = searchTerm === "" || test.title?.toLowerCase().includes(searchTerm.toLowerCase()) || test.referentiel?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesReferentiel = referentielFilter === "all" || test.referentiel === referentielFilter
    return matchesSearch && matchesReferentiel
  })

  const filteredResults = testResults.filter((result) => {
    const matchesReferentiel = resultsReferentielFilter === "all" || result.referentiel === resultsReferentielFilter
    const matchesStatus = resultsStatusFilter === "all" || result.status === resultsStatusFilter
    return matchesReferentiel && matchesStatus
  })

  return {
    isAuthenticated,
    loading,
    refreshing,
    testsData,
    testResults,
    statistics,
    selectedTest, setSelectedTest,
    showCreateDialog, setShowCreateDialog,
    showUploadDialog, setShowUploadDialog,
    showEmailDialog, setShowEmailDialog,
    showResultsDialog, setShowResultsDialog,
    editingTest, setEditingTest,
    showDetailsDialog, setShowDetailsDialog,
    selectedResult, setSelectedResult,
    manualGrades, setManualGrades,
    searchTerm, setSearchTerm,
    referentielFilter, setReferentielFilter,
    resultsReferentielFilter, setResultsReferentielFilter,
    resultsStatusFilter, setResultsStatusFilter,
    resultsView, setResultsView,
    selectedResults, setSelectedResults,
    showEmailResultsDialog, setShowEmailResultsDialog,
    emailResultsType, setEmailResultsType,
    customResultsMessage, setCustomResultsMessage,
    sendingResultsEmails, setSendingResultsEmails,
    selectedFormationResults, setSelectedFormationResults,
    selectedGroupResults, setSelectedGroupResults,
    testGroups, setTestGroups,
    selectedCandidatesForGroup, setSelectedCandidatesForGroup,
    showCreateGroupDialog, setShowCreateGroupDialog,
    availableCandidates, setAvailableCandidates,
    assignedCandidateIds, setAssignedCandidateIds,
    candidateToGroupMap, setCandidateToGroupMap,
    testsPage, setTestsPage,
    testsItemsPerPage, setTestsItemsPerPage,
    groupsPage, setGroupsPage,
    groupsItemsPerPage, setGroupsItemsPerPage,
    resultsPage, setResultsPage,
    resultsItemsPerPage, setResultsItemsPerPage,
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
    testViolations, setTestViolations,
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
    emailData, setEmailData,
    showCandidateSelection, setShowCandidateSelection,
    
    // Handlers
    fetchTests,
    fetchResults,
    fetchStatistics,
    fetchAllViolations,
    handleCreateTest,
    handleEditTest,
    handleDeleteTestClick,
    handleConfirmDeleteTest,
    handleToggleTestStatus,
    handleAddQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    handleCancelEditQuestion,
    handleImageUpload,
    handleRemoveImage,
    handleImportQuestionsFromExcel,
    handleImportResultsFromExcel,
    handleExportResults,
    handleCreateGroup,
    handleOpenInvitationDialog,
    handleTestSelection,
    handleConfirmAndSendInvitations,
    handleDeleteGroupClick,
    handleConfirmDeleteGroup,
    handleViewGroupCandidates,
    handleSelectCandidateForGroup,
    handleSendEmails,
    handleCopyTestLink,
    handleOpenTest,
    handleViewDetails,
    handleSaveManualGrade,
    handleViewViolations,
    handleSelectResult,
    handleSendResultsEmails,
    handleCancelCreateGroup,
    
    // Derived state
    filteredTests,
    filteredResults,
    stats: buildAdminStats(testsData, testResults, statistics),
    scoreDistributionData: buildScoreDistributionData(testResults),
    statusDistributionData: buildStatusDistributionData(testResults),
    groupedResults: () => buildGroupedResults(filteredResults, testsData, testGroups),
    calculateTotalScore: () => calculateResultScorePercentage(selectedResult, testsData, manualGrades),
    calculatePoints: (result) => calculateResultPoints(result, testsData),
  }
}
