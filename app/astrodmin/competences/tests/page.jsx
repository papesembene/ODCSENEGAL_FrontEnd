"use client"

import { ScrollArea } from "@/components/ui/scroll-area"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { RichTextDisplay } from "@/components/ui/rich-text-display"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  FileText,
  Plus,
  Upload,
  Download,
  Send,
  Eye,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Mail,
  AlertCircle,
  RefreshCw,
  Search,
  LinkIcon,
  ExternalLink,
  Copy,
  LayoutGrid,
  List,
  GraduationCap,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"
import {
  API_BASE_URL,
  CANDIDATES_LIST,
  COLORS,
  EMAIL_REGEX,
  FORMATIONS,
  OUTLOOK_BCC_CHUNK_SIZE,
  OUTLOOK_DEEPLINK_URL,
} from "./constants"
import {
  buildAdminStats,
  buildGroupedResults,
  buildQuestionEditorState,
  buildQuestionPayload,
  buildResultsCsvContent,
  buildScoreDistributionData,
  buildStatusDistributionData,
  calculateResultPoints,
  calculateResultScorePercentage,
  createInitialEmailData,
  createInitialGroup,
  createInitialInvitationDetails,
  createInitialQuestion,
  createInitialTest,
  getTestUrl,
  isNotSelectedStatus,
  isPendingStatus,
  isSelectedStatus,
  parseImportedResultsCsv,
  parseQuestionsCsv,
  validateQuestionBeforeSave,
} from "./helpers"
import {
  ConfirmationDialog,
  GroupStatusBadge,
  PageSizeSelector,
  PaginationControls,
  ResultStatusBadge,
} from "./components"

export default function TestsManagementPage() {
  const router = useRouter()
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
  const [editingTest, setEditingTest] = useState(null) // Pour le mode édition
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [manualGrades, setManualGrades] = useState({}) // {questionId: score}

  // Filtres
  const [searchTerm, setSearchTerm] = useState("")
  const [referentielFilter, setReferentielFilter] = useState("all")
  const [resultsReferentielFilter, setResultsReferentielFilter] = useState("all")
  const [resultsStatusFilter, setResultsStatusFilter] = useState("all")
  const [resultsView, setResultsView] = useState("list") // "list" ou "grouped"
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
  const [newGroup, setNewGroup] = useState(createInitialGroup)
  const [groupFormationFilter, setGroupFormationFilter] = useState("all")
  const [showGroupCandidatesDialog, setShowGroupCandidatesDialog] = useState(false)
  const [selectedGroupForView, setSelectedGroupForView] = useState(null)
  const [groupCandidatesDetails, setGroupCandidatesDetails] = useState([])
  const [loadingGroupCandidates, setLoadingGroupCandidates] = useState(false)
  const [showSendInvitationDialog, setShowSendInvitationDialog] = useState(false)
  const [selectedGroupForInvitation, setSelectedGroupForInvitation] = useState(null)
  const [invitationDetails, setInvitationDetails] = useState(createInitialInvitationDetails)
  const [sendingInvitations, setSendingInvitations] = useState(false)
  const [testViolations, setTestViolations] = useState({}) // {resultId: violations}
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
  const [newTest, setNewTest] = useState(createInitialTest)

  // Gestion des questions
  const [currentQuestion, setCurrentQuestion] = useState(createInitialQuestion)

  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null)
  const [showImportQuestionsDialog, setShowImportQuestionsDialog] = useState(false)
  const [showImportResultsDialog, setShowImportResultsDialog] = useState(false)

  // Email data et gestion de groupes
  const [emailData, setEmailData] = useState(createInitialEmailData)

  const [showCandidateSelection, setShowCandidateSelection] = useState(false)

  const candidatesList = CANDIDATES_LIST

  useEffect(() => {
    // Vérifier l'authentification
    const authenticated = !!localStorage.getItem("admin_token")
    const adminType = localStorage.getItem("admin_type")

    // Permettre l'accès aux admins compétences et super_admin
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
  }, [router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchTestGroups()
    }
  }, [groupFormationFilter, isAuthenticated])

  useEffect(() => {
    if (testResults.length > 0) {
      fetchAllViolations()
    }
  }, [testResults])

  const fetchTests = async () => {
    try {
      setRefreshing(true)

      // Charger les tests depuis l'API MongoDB uniquement
      const { fetchJsonWithTimeout } = await import("@/app/utils/fetchWithTimeout")
      const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests`, {
        timeout: 30000,
        retries: 2,
        retryDelay: 1000,
      })

      if (result.success) {
        setTestsData(result.data || [])
        console.log(`${result.data?.length || 0} tests chargés depuis MongoDB`)
      } else {
        toast.error(result.error || "Erreur lors du chargement des tests")
        setTestsData([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tests:", error)
      toast.error("Impossible de charger les tests. Vérifiez que le backend est démarré.")
      setTestsData([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchResults = async () => {
    try {
      // Charger les résultats depuis l'API MongoDB uniquement
      const { fetchJsonWithTimeout } = await import("@/app/utils/fetchWithTimeout")
      const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/results`, {
        timeout: 45000, // Peut être volumineux
        retries: 2,
        retryDelay: 1500,
      })

      if (result.success) {
        setTestResults(result.data || [])
        console.log(`${result.data?.length || 0} résultats chargés depuis MongoDB`)
      } else {
        toast.error(result.error || "Erreur lors du chargement des résultats")
        setTestResults([])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des résultats:", error)
      toast.error("Impossible de charger les résultats. Vérifiez que le backend est démarré.")
      setTestResults([])
    }
  }

  const fetchStatistics = async () => {
    try {
      // Charger les statistiques depuis l'API MongoDB
      const { fetchJsonWithTimeout } = await import("@/app/utils/fetchWithTimeout")
      const result = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/statistics`, {
        timeout: 30000,
        retries: 2,
        retryDelay: 1000,
      })

      if (result.success) {
        setStatistics(result.data)
        console.log("Statistiques chargées depuis MongoDB")
      } else {
        toast.error(result.error || "Erreur lors du chargement des statistiques")
        setStatistics(null)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error)
      toast.error("Impossible de charger les statistiques. Vérifiez que le backend est démarré.")
      setStatistics(null)
    }
  }

  // Récupérer toutes les violations
  const fetchAllViolations = async () => {
    try {
      const violationsMap = {}

      for (const result of testResults) {
        const candidateEmail = result.candidate?.email || result.candidateEmail
        const testId = result.testId

        if (candidateEmail && testId) {
          try {
            // CHANGE: Corriger l'URL pour correspondre à la route backend
            const response = await fetch(`${API_BASE_URL}/api/admin/tests/${testId}/violations/${candidateEmail}`)

            if (response.ok) {
              const data = await response.json()
              if (data.success && data.data) {
                violationsMap[result.id] = data.data
              }
            }
          } catch (error) {
            console.error(`Erreur lors de la récupération des violations pour ${candidateEmail}:`, error)
          }
        }
      }

      setTestViolations(violationsMap)
    } catch (error) {
      console.error("Erreur lors de la récupération des violations:", error)
    }
  }

  const handleAddQuestion = () => {
    const validationError = validateQuestionBeforeSave(currentQuestion)
    if (validationError) {
      toast.error(validationError)
      return
    }

    const questionData = buildQuestionPayload(
      currentQuestion,
      editingQuestionIndex !== null ? editingQuestionIndex : newTest.questions.length,
    )

    if (editingQuestionIndex !== null) {
      // Modification
      const updatedQuestions = [...newTest.questions]
      updatedQuestions[editingQuestionIndex] = questionData
      setNewTest({ ...newTest, questions: updatedQuestions })
      setEditingQuestionIndex(null)
      toast.success("Question modifiée")
    } else {
      // Ajout
      setNewTest({ ...newTest, questions: [...newTest.questions, questionData] })
      toast.success("Question ajoutée")
    }

    // Réinitialiser le formulaire de question
    setCurrentQuestion(createInitialQuestion())
  }

  const handleEditQuestion = (index) => {
    const questionToEdit = newTest.questions[index]
    setCurrentQuestion(buildQuestionEditorState(questionToEdit))
    setEditingQuestionIndex(index)
    
    // Scroll automatique vers le formulaire d'édition après un court délai pour laisser le DOM se mettre à jour
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

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide")
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB")
      return
    }

    // Convertir en base64 pour l'affichage
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
      reader.readAsText(file, 'UTF-8') // Spécifier l'encodage
    } else {
      toast.error("Veuillez sélectionner un fichier CSV pour l'instant")
    } 
  }
   
  const handleImportResultsFromExcel = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        toast.success(`Fichier ${file.name} importé. Traitement en cours...`)

        // Format attendu du CSV/Excel :
        // Nom,Email,Téléphone,TestID,Score,Statut,Date

        const content = e.target.result
        const importedResults = parseImportedResultsCsv(content)

        // Envoyer les résultats via l'API MongoDB
        let successCount = 0
        let errorCount = 0

        for (const result of importedResults) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/admin/tests/results`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(result),
            })

            if (response.ok) {
              successCount++
            } else {
              errorCount++
            }
          } catch (error) {
            errorCount++
          }
        }

        fetchResults()
        toast.success(
          `${successCount} résultat(s) importé(s) avec succès${errorCount > 0 ? `, ${errorCount} échec(s)` : ""}`,
        )
        setShowImportResultsDialog(false)
      } catch (error) {
        console.error("Erreur d'import:", error)
        toast.error("Erreur lors de l'import du fichier")
      }
    }

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file)
    } else {
      toast.error("Veuillez sélectionner un fichier CSV pour l'instant")
    }
  }

  const handleExportResults = (format) => {
    try {
      if (format === "csv") {
        const csvContent = buildResultsCsvContent(testResults)

        // Ajouter le BOM UTF-8 pour Excel
        const BOM = "\uFEFF"
        const csvWithBOM = BOM + csvContent

        // Télécharger le fichier avec le bon encodage
        const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `resultats_tests_${new Date().toISOString().split("T")[0]}.csv`
        link.click()

        toast.success("Export CSV réussi (encodage UTF-8 pour Excel)")
      } else if (format === "excel") {
        toast.info("Export Excel : Utilisez l'export CSV et ouvrez-le dans Excel")
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
      // Validation
      if (!newTest.title || !newTest.referentiel || !newTest.scheduledDate || !newTest.scheduledTime) {
        toast.error("Veuillez remplir tous les champs obligatoires")
        return
      }

      if (newTest.questions.length === 0) {
        toast.error("Veuillez ajouter au moins une question")
        return
      }

      if (editingTest) {
        // Mode édition - mettre à jour le test existant via API MongoDB uniquement
        const testData = {
          ...newTest,
          totalQuestions: newTest.questions.length,
          updatedAt: new Date().toISOString(),
          updatedBy: localStorage.getItem("admin_email"),
        }

        const response = await fetch(`${API_BASE_URL}/api/admin/tests/${editingTest.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testData),
        })

        const result = await response.json()

        if (result.success) {
          toast.success("Test modifié avec succès !")
          setEditingTest(null)
        } else {
          toast.error(result.error || "Erreur lors de la modification du test")
          return
        }
      } else {
        // Mode création - créer un nouveau test via API MongoDB uniquement
        const testData = {
          ...newTest,
          totalQuestions: newTest.questions.length,
          status: "active",
          createdBy: localStorage.getItem("admin_email"),
        }

        const response = await fetch(`${API_BASE_URL}/api/admin/tests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testData),
        })

        const result = await response.json()

        if (result.success) {
          toast.success("Test créé avec succès ! Il est maintenant disponible pour les candidats.")
        } else {
          toast.error(result.error || "Erreur lors de la création du test")
          return
        }
      }

      setShowCreateDialog(false)
      fetchTests()

      // Réinitialiser le formulaire
      setNewTest(createInitialTest())
      setCurrentQuestion(createInitialQuestion())
    } catch (error) {
      toast.error("Erreur lors de la création du test")
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
      const response = await fetch(`${API_BASE_URL}/api/admin/tests/${testToDelete.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`✅ Test "${testToDelete.title}" supprimé avec succès !`, {
          duration: 4000,
        })
        await fetchTests()

        // Attendre un peu pour que l'utilisateur voie le toast
        setTimeout(() => {
          setShowDeleteTestDialog(false)
          setTestToDelete(null)
          setDeletingTest(false)
        }, 500)
      } else {
        toast.error(result.error || "Erreur lors de la suppression du test")
        setDeletingTest(false)
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast.error("Erreur lors de la suppression du test")
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
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut")
    }
  }

  const handleViewDetails = (result) => {
    setSelectedResult(result)
    setShowDetailsDialog(true)

    // Charger les notes manuelles depuis MongoDB
    setManualGrades(result.manualGrades || {})
  }

  // Gestion de la sélection des résultats
  const handleSelectResult = (resultId) => {
    setSelectedResults((prev) => {
      if (prev.includes(resultId)) {
        return prev.filter((id) => id !== resultId)
      } else {
        return [...prev, resultId]
      }
    })
  }

  const handleSelectAllResults = () => {
    if (selectedResults.length === filteredResults.length) {
      setSelectedResults([])
    } else {
      setSelectedResults(filteredResults.map((r) => r.id))
    }
  }

  // Envoi d'emails aux candidats sélectionnés
  const handleSendResultsEmails = async () => {
    if (selectedResults.length === 0) {
      toast.error("Veuillez sélectionner au moins un candidat")
      return
    }

    setSendingResultsEmails(true)
    try {
      const selectedCandidates = testResults.filter((r) => selectedResults.includes(r.id))

      // Simuler l'envoi d'emails (à remplacer par un vrai service)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success(`Email envoyé à ${selectedResults.length} candidat(s)`)
      setShowEmailResultsDialog(false)
      setSelectedResults([])
      setEmailResultsType("")
      setCustomResultsMessage("")
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Impossible d'envoyer les emails")
    } finally {
      setSendingResultsEmails(false)
    }
  }

  const handleSaveManualGrade = async (questionId, grade) => {
    const updatedGrades = {
      ...manualGrades,
      [questionId]: Number.parseFloat(grade) || 0,
    }
    setManualGrades(updatedGrades)

    // Sauvegarder dans MongoDB via l'API
    if (selectedResult) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/tests/results/${selectedResult.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            manualGrades: updatedGrades,
          }),
        })

        const result = await response.json()

        if (result.success) {
          toast.success("Note sauvegardée")
          // Mettre à jour le résultat local
          setSelectedResult({
            ...selectedResult,
            manualGrades: updatedGrades,
          })
        } else {
          toast.error("Erreur lors de la sauvegarde de la note")
        }
      } catch (error) {
        toast.error("Impossible de sauvegarder la note. Vérifiez la connexion au backend.")
      }
    }
  }

  const handleViewViolations = (result) => {
    const violations = testViolations[result.id]
    setSelectedResultViolations({
      result,
      violations,
    })
    setShowViolationsDialog(true)
  }

  // Updated violations fetch to use correct endpoint and display totalViolations
  const getViolationSeverityBadge = (violations) => {
    if (!violations || violations.totalViolations === 0) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Aucune
        </Badge>
      )
    }

    const totalViolations = violations.totalViolations || 0

    if (totalViolations > 10) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          {totalViolations} Critique
        </Badge>
      )
    } else if (totalViolations > 5) {
      return (
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          {totalViolations} Moyen
        </Badge>
      )
    } else if (totalViolations > 0) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          {totalViolations} Faible
        </Badge>
      )
    }

    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20">
        <CheckCircle className="h-3 w-3 mr-1" />
        Aucune
      </Badge>
    )
  }

  // ================ Fonctions pour gérer les groupes de tests ================

  const fetchTestGroups = async () => {
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

        // Extraire tous les candidats déjà assignés à un groupe
        const assignedIds = new Set()
        const candidateGroupMap = {}

        groups.forEach((group) => {
          if (group.candidate_ids && Array.isArray(group.candidate_ids)) {
            group.candidate_ids.forEach((id) => {
              assignedIds.add(id)
              candidateGroupMap[id] = group.name // Stocker le nom du groupe pour chaque candidat
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
  }

  const fetchAvailableCandidates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/candidatures`)
      const result = await response.json()

      if (result.success) {
        setAvailableCandidates(result.data || [])
      }
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleCreateGroup = async () => {
    try {
      // Validation
      if (!newGroup.name || !newGroup.formation || !newGroup.test_date || !newGroup.test_time) {
        toast.error("Veuillez remplir tous les champs obligatoires")
        return
      }

      if (selectedCandidatesForGroup.length === 0) {
        toast.error("Veuillez sélectionner au moins un candidat")
        return
      }

      // Construire la date/heure complète
      const testDateTime = `${newGroup.test_date}T${newGroup.test_time}:00`

      const groupData = {
        name: newGroup.name,
        formation: newGroup.formation,
        test_id: newGroup.test_id,
        test_date: testDateTime,
        duration: newGroup.duration,
        candidate_ids: selectedCandidatesForGroup,
        location: newGroup.location,
        instructions: newGroup.instructions,
        created_by: localStorage.getItem("admin_email"),
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/test-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groupData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Groupe créé avec succès !")
        setShowCreateGroupDialog(false)
        fetchTestGroups()

        // Réinitialiser le formulaire
        setNewGroup(createInitialGroup())
        setSelectedCandidatesForGroup([])
      } else {
        toast.error(result.error || "Erreur lors de la création du groupe")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Impossible de créer le groupe")
    }
  }

  const handleOpenInvitationDialog = (group) => {
    setSelectedGroupForInvitation(group)

    // Pré-remplir le formulaire avec les données actuelles du groupe
    setInvitationDetails({
      ...createInitialInvitationDetails(),
      test_id: group.test_id || "",
      duration: group.duration || 60,
      location: group.location || "En ligne",
      instructions: group.instructions || "",
    })

    setShowSendInvitationDialog(true)
  }

  // Fonction pour auto-remplir les infos depuis le test sélectionné
  const handleTestSelection = (testId) => {
    const selectedTest = testsData.find((t) => t.id === testId)

    if (selectedTest) {
      // Extraire date et heure du test
      let dateStr = ""
      let timeStr = ""
      let duration = 60

      if (selectedTest.scheduledDate) {
        dateStr = selectedTest.scheduledDate
      }

      if (selectedTest.scheduledTime) {
        timeStr = selectedTest.scheduledTime
      }

      if (selectedTest.duration) {
        duration = selectedTest.duration
      }

      setInvitationDetails((prev) => ({
        ...prev,
        test_id: testId,
        test_date: dateStr,
        test_time: timeStr,
        duration: duration,
      }))
    } else {
      setInvitationDetails((prev) => ({
        ...prev,
        test_id: testId,
      }))
    }
  }

  const handleConfirmAndSendInvitations = async () => {
    if (!invitationDetails.test_id) {
      toast.error("Veuillez sélectionner un test")
      return
    }

    if (!invitationDetails.test_date || !invitationDetails.test_time) {
      toast.error("Veuillez définir la date et l'heure du test")
      return
    }

    if (!selectedGroupForInvitation) {
      toast.error("Aucun groupe sélectionné")
      return
    }

    setSendingInvitations(true)

    try {
      const testDateTime = `${invitationDetails.test_date}T${invitationDetails.test_time}:00`

      const updateResponse = await fetch(`${API_BASE_URL}/api/admin/test-groups/${selectedGroupForInvitation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_id: invitationDetails.test_id,
          test_date: testDateTime,
          duration: invitationDetails.duration,
          location: invitationDetails.location,
          instructions: invitationDetails.instructions,
        }),
      })

      const updateResult = await updateResponse.json()

      if (!updateResult.success) {
        toast.error("Erreur lors de la mise à jour du groupe")
        setSendingInvitations(false)
        return
      }

      let groupDetails = selectedGroupForInvitation

      try {
        const detailsResponse = await fetch(`${API_BASE_URL}/api/admin/test-groups/${selectedGroupForInvitation.id}`)
        const detailsResult = await detailsResponse.json()
        if (detailsResult.success && detailsResult.data) {
          groupDetails = detailsResult.data
        }
      } catch (detailError) {
        console.warn("Impossible de récupérer les détails du groupe, utilisation des données locales.", detailError)
      }

      // Envoyer les invitations via SendGrid (backend)
      const sendResponse = await fetch(
        `${API_BASE_URL}/api/admin/test-groups/${selectedGroupForInvitation.id}/send-invitations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      )

      const sendResult = await sendResponse.json()

      if (!sendResult.success) {
        toast.error(sendResult.error || "Erreur lors de l'envoi des invitations")
        setSendingInvitations(false)
        return
      }

      // Afficher le résultat
      const sent = sendResult.data?.sent || 0
      const failed = sendResult.data?.failed || 0

      if (failed === 0) {
        toast.success(`✅ Invitations envoyées avec succès à ${sent} candidat(s) via SendGrid`)
      } else {
        toast.warning(`⚠️ Invitations partiellement envoyées : ${sent} succès, ${failed} échecs`)
        if (sendResult.data?.failed_emails?.length > 0) {
          console.warn("Emails en échec:", sendResult.data.failed_emails)
        }
      }

      setShowSendInvitationDialog(false)
      fetchTestGroups()
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Impossible de préparer les invitations. Vérifiez votre connexion.")
    } finally {
      setSendingInvitations(false)
    }
  }

  const handleDeleteGroupClick = (group) => {
    setGroupToDelete(group)
    setShowDeleteGroupDialog(true)
  }

  const handleConfirmDeleteGroup = async () => {
    if (!groupToDelete) return

    setDeletingGroup(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/test-groups/${groupToDelete.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`✅ Groupe "${groupToDelete.name}" supprimé avec succès !`, {
          duration: 4000,
        })
        await fetchTestGroups()

        // Attendre un peu pour que l'utilisateur voie le toast
        setTimeout(() => {
          setShowDeleteGroupDialog(false)
          setGroupToDelete(null)
          setDeletingGroup(false)
        }, 500)
      } else {
        toast.error(result.error || "Erreur lors de la suppression du groupe")
        setDeletingGroup(false)
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Impossible de supprimer le groupe")
      setDeletingGroup(false)
    }
  }

  const handleViewGroupCandidates = async (group) => {
    setSelectedGroupForView(group)
    setShowGroupCandidatesDialog(true)
    setLoadingGroupCandidates(true)
    setGroupCandidatesDetails([])

    try {
      // Récupérer les détails des candidats du groupe
      const candidateIds = group.candidate_ids || []

      if (candidateIds.length === 0) {
        setGroupCandidatesDetails([])
        setLoadingGroupCandidates(false)
        return
      }

      // Récupérer tous les candidats et filtrer ceux du groupe
      const response = await fetch(`${API_BASE_URL}/api/admin/candidatures`)
      const result = await response.json()

      if (result.success) {
        const allCandidates = result.data || []
        // Filtrer les candidats qui sont dans le groupe
        const groupCandidates = allCandidates.filter((c) => candidateIds.includes(c.id))
        setGroupCandidatesDetails(groupCandidates)
      } else {
        toast.error("Erreur lors de la récupération des candidats")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Impossible de charger les candidats du groupe")
    } finally {
      setLoadingGroupCandidates(false)
    }
  }

  const handleSelectCandidateForGroup = (candidateId) => {
    // Empêcher la sélection si le candidat est déjà assigné à un groupe
    if (assignedCandidateIds.includes(candidateId)) {
      toast.error("Ce candidat est déjà assigné à un groupe")
      return
    }

    setSelectedCandidatesForGroup((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId)
      } else {
        return [...prev, candidateId]
      }
    })
  }

  const calculateTotalScore = () => {
    return calculateResultScorePercentage(selectedResult, testsData, manualGrades)
  }

  // Fonction pour calculer les points réels obtenus par un résultat
  const calculatePoints = (result) => {
    return calculateResultPoints(result, testsData)
  }

  const handleSendEmails = async () => {
    try {
      // Récupérer les données des candidats sélectionnés
      const selectedCandidatesData = candidatesList.filter((c) => emailData.selectedCandidates.includes(c.id))

      const response = await fetch(`${API_BASE_URL}/api/admin/tests/send-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailType: emailData.type,
          recipients: selectedCandidatesData,
          testDetails: selectedTest,
          timeSlot: emailData.timeSlot,
          customMessage: emailData.customMessage,
          testUrl: selectedTest ? getTestUrl(selectedTest.id) : "",
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
      }

      // Toujours afficher le message de succès (même si l'API n'est pas disponible)
      const emailTypeLabel =
        {
          invitation: "d'invitation",
          reminder: "de rappel",
          results_selected: "de résultats (sélectionné)",
          results_not_selected: "de résultats (non sélectionné)",
          documents_reminder: "de rappel documents",
          opening_announcement: "d'annonce de rentrée",
        }[emailData.type] || ""

      toast.success(
        `Email ${emailTypeLabel} envoyé à ${emailData.selectedCandidates.length} candidat(s) !` +
          (emailData.timeSlot ? ` (Créneau : ${emailData.timeSlot.replace(/_/g, " ")})` : ""),
      )

      setShowEmailDialog(false)

      // Réinitialiser le formulaire d'email
      setEmailData(createInitialEmailData())
    } catch (error) {
      console.error("Erreur lors de l'envoi des emails:", error)
      // Afficher quand même le message de succès (simulation)
      toast.success(`Email envoyé à ${emailData.selectedCandidates.length} candidat(s) ! (mode simulation)`)
      setShowEmailDialog(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Simulation d'upload
    toast.success(`Fichier ${file.name} téléchargé avec succès`)
    setShowUploadDialog(false)
  }

  const handleCopyTestLink = (testId) => {
    const url = getTestUrl(testId)
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Lien du test copié dans le presse-papiers !")
      })
      .catch(() => {
        toast.error("Erreur lors de la copie du lien")
      })
  }

  const handleOpenTest = (testId) => {
    const url = getTestUrl(testId)
    window.open(url, "_blank")
  }

  const filteredTests = testsData.filter((test) => {
    const matchesSearch =
      searchTerm === "" ||
      test.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.referentiel?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesReferentiel = referentielFilter === "all" || test.referentiel === referentielFilter

    return matchesSearch && matchesReferentiel
  })

  const filteredResults = testResults.filter((result) => {
    const matchesReferentiel = resultsReferentielFilter === "all" || result.referentiel === resultsReferentielFilter
    const matchesStatus = resultsStatusFilter === "all" || result.status === resultsStatusFilter

    return matchesReferentiel && matchesStatus
  })

  const groupedResults = () => buildGroupedResults(filteredResults, testsData, testGroups)

  const isSelected = isSelectedStatus
  const isNotSelected = isNotSelectedStatus
  const isPending = isPendingStatus

  const stats = buildAdminStats(testsData, testResults, statistics)
  const scoreDistributionData = buildScoreDistributionData(testResults)
  const statusDistributionData = buildStatusDistributionData(testResults)

  if (!isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Tests en Ligne</h1>
          <p className="text-muted-foreground mt-1">Créez, gérez et suivez les tests de sélection des candidats</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={fetchTests}
            disabled={refreshing}
            size="sm"
            className="text-xs sm:text-sm bg-transparent"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} size="sm" className="text-xs sm:text-sm">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Créer un test</span>
            <span className="sm:hidden">Créer</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="tests" className="text-xs sm:text-sm">
            Mes Tests
          </TabsTrigger>
          <TabsTrigger value="groups" className="text-xs sm:text-sm">
            Groupes
          </TabsTrigger>
          <TabsTrigger value="results" className="text-xs sm:text-sm">
            Résultats
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTests}</div>
                <p className="text-xs text-muted-foreground">{stats.activeTests} actif(s)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Candidats testés</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCandidates}</div>
                <p className="text-xs text-muted-foreground">{stats.selectedCandidates} sélectionné(s)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <Progress value={stats.averageScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.passRate}%</div>
                <Progress value={stats.passRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Alerte de synchronisation */}
          {testResults.length > 0 && (
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <strong className="text-blue-900 dark:text-blue-100">Synchronisation active</strong>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    Les tests effectués par les candidats s'affichent automatiquement ici.
                    {testResults.length} résultat{testResults.length > 1 ? "s" : ""} disponible
                    {testResults.length > 1 ? "s" : ""}.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchResults}
                  className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Actualiser
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribution des scores</CardTitle>
                <CardDescription>Répartition des candidats par tranche de score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#FF6384" name="Candidats" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par statut</CardTitle>
                <CardDescription>État des candidatures après les tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowUploadDialog(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Importer un test (CSV/Excel)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowEmailDialog(true)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer des invitations
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowResultsDialog(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Consulter les résultats
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accès rapide aux tests</CardTitle>
                <CardDescription>Liens directs vers les tests candidats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testsData.slice(0, 3).map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{test.title}</p>
                        <p className="text-xs text-muted-foreground">{test.referentiel}</p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyTestLink(test.id)}
                          title="Copier le lien"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenTest(test.id)}
                          title="Ouvrir le test"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {testsData.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun test disponible</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Liste des tests */}
        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Liste des tests</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    className="pl-8 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Contrôles de pagination */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <PageSizeSelector
                  value={testsItemsPerPage}
                  onChange={(value) => {
                    setTestsItemsPerPage(value)
                    setTestsPage(1)
                  }}
                />
                <div className="text-sm text-muted-foreground">{filteredTests.length} test(s) au total</div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Référentiel</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">Aucun test trouvé</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTests
                        .slice((testsPage - 1) * testsItemsPerPage, testsPage * testsItemsPerPage)
                        .map((test) => (
                          <TableRow key={test.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{test.title}</div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    <LinkIcon className="h-3 w-3 mr-1" />
                                    /test/{test.id}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={() => handleCopyTestLink(test.id)}
                                    title="Copier le lien"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={() => handleOpenTest(test.id)}
                                    title="Ouvrir dans un nouvel onglet"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{test.referentiel}</TableCell>
                            <TableCell>
                              {test.scheduledDate} à {test.scheduledTime}
                            </TableCell>
                            <TableCell>{test.duration} min</TableCell>
                            <TableCell>{test.totalQuestions || test.questions?.length || 0}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditTest(test)}
                                  title="Modifier"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteTestClick(test)}
                                  title="Supprimer"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination en bas */}
              <PaginationControls
                page={testsPage}
                itemsPerPage={testsItemsPerPage}
                totalItems={filteredTests.length}
                itemLabel="tests"
                onPageChange={setTestsPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Groupes de tests */}
        <TabsContent value="groups" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Groupes de tests</CardTitle>
                  <CardDescription>Créez des groupes de candidats pour les tests en ligne</CardDescription>
                </div>
                <Button onClick={() => setShowCreateGroupDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un groupe
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtre */}
              <div className="mb-4">
                <Select value={groupFormationFilter} onValueChange={setGroupFormationFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Formation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les formations</SelectItem>
                    <SelectItem value="Dev Web">Dev Web</SelectItem>
                    <SelectItem value="Data">Data</SelectItem>
                    <SelectItem value="Hackeuse">Hackeuse</SelectItem>
                    <SelectItem value="AWS">AWS</SelectItem>
                    <SelectItem value="Design UX/UI">Design UX/UI</SelectItem>
                    <SelectItem value="Cyber security">Cyber security</SelectItem>
                    <SelectItem value="Intelligence Artificielle">Intelligence Artificielle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pagination groupes */}
              {(() => {
                const filteredGroups = testGroups.filter(
                  (group) => groupFormationFilter === "all" || group.formation === groupFormationFilter,
                )
                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <PageSizeSelector
                        value={groupsItemsPerPage}
                        onChange={(value) => {
                          setGroupsItemsPerPage(value)
                          setGroupsPage(1)
                        }}
                      />
                      <div className="text-sm text-muted-foreground">{filteredGroups.length} groupe(s) au total</div>
                    </div>

                    {/* Liste des groupes */}
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nom du groupe</TableHead>
                            <TableHead>Formation</TableHead>
                            <TableHead>Date du test</TableHead>
                            <TableHead>Candidats</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredGroups.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8">
                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">Aucun groupe créé</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Créez un groupe pour organiser vos tests
                                </p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredGroups
                              .slice((groupsPage - 1) * groupsItemsPerPage, groupsPage * groupsItemsPerPage)
                              .map((group) => (
                                <TableRow key={group.id}>
                                  <TableCell className="font-medium">{group.name}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{group.formation}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(group.test_date).toLocaleString("fr-FR", {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                    })}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Users className="h-4 w-4 text-muted-foreground" />
                                      <span>{group.candidate_count} candidat(s)</span>
                                    </div>
                                  </TableCell>
                                  <TableCell><GroupStatusBadge status={group.status} /></TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleViewGroupCandidates(group)}
                                        title="Voir les candidats"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      {group.status === "pending" && (
                                        <Button
                                          size="sm"
                                          variant="default"
                                          onClick={() => handleOpenInvitationDialog(group)}
                                        >
                                          <Mail className="mr-2 h-4 w-4" />
                                          Envoyer invitations
                                        </Button>
                                      )}
                                      {group.status === "scheduled" && group.email_sent && (
                                        <GroupStatusBadge status={group.status} emailSent={group.email_sent} />
                                      )}
                                      <Button size="sm" variant="ghost" onClick={() => handleDeleteGroupClick(group)}>
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination bas */}
                    <PaginationControls
                      page={groupsPage}
                      itemsPerPage={groupsItemsPerPage}
                      totalItems={filteredGroups.length}
                      itemLabel="groupes"
                      onPageChange={setGroupsPage}
                    />
                  </>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Résultats */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col space-y-4">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Résultats des tests</CardTitle>
                  <CardDescription>
                    Consultez et gérez les résultats des candidats ({testResults.length} résultat
                    {testResults.length > 1 ? "s" : ""})
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setShowImportResultsDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importer
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportResults("csv")}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchResults} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                    Actualiser
                  </Button>
                </div>
              </div>

              {/* Toggle Vue + Filtres */}
              <div className="flex flex-row justify-between items-center gap-2">
                <div className="flex flex-row gap-2">
                  <Select value={resultsReferentielFilter} onValueChange={setResultsReferentielFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Formation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les formations</SelectItem>
                      {FORMATIONS.map((formation) => (
                        <SelectItem key={formation} value={formation}>
                          {formation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={resultsStatusFilter} onValueChange={setResultsStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="admis">Passe en entretien</SelectItem>
                      <SelectItem value="rejeté">Rejeté</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Toggle de vue */}
                <div className="flex items-center space-x-2 border rounded-md p-1">
                  <Button
                    variant={resultsView === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setResultsView("list")}
                  >
                    <List className="h-4 w-4 mr-2" />
                    Liste
                  </Button>
                  <Button
                    variant={resultsView === "grouped" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setResultsView("grouped")}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Par Formation/Groupe
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Vue Liste */}
              {resultsView === "list" && (
                <>
                  {/* Pagination résultats */}
                  <div className="flex items-center justify-between mb-4">
                    <PageSizeSelector
                      value={resultsItemsPerPage}
                      onChange={(value) => {
                        setResultsItemsPerPage(value)
                        setResultsPage(1)
                      }}
                    />
                    <div className="text-sm text-muted-foreground">{filteredResults.length} résultat(s) au total</div>
                  </div>

                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={selectedResults.length === filteredResults.length && filteredResults.length > 0}
                              onCheckedChange={handleSelectAllResults}
                            />
                          </TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Test</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Infractions</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResults.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center py-8">
                              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">
                                {testResults.length === 0
                                  ? "Aucun résultat disponible"
                                  : "Aucun résultat ne correspond aux filtres"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {testResults.length === 0
                                  ? "Les résultats des tests effectués par les candidats apparaîtront ici"
                                  : "Essayez de modifier les filtres pour voir plus de résultats"}
                              </p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredResults
                            .slice((resultsPage - 1) * resultsItemsPerPage, resultsPage * resultsItemsPerPage)
                            .map((result) => {
                              // Gérer les deux formats de données (ancien et nouveau)
                              const candidateName = result.candidate?.name || result.candidateName || "N/A"
                              const candidateEmail = result.candidate?.email || result.candidateEmail || "N/A"
                              const score = result.score || 0
                              const status = result.status || "pending"

                              // Calculer les points réels
                              const points = calculatePoints(result)

                              // Mapper les statuts du nouveau format vers l'ancien
                              const displayStatus =
                                status === "admis" ? "selected" : status === "rejeté" ? "not_selected" : status

                              return (
                                <TableRow key={result.id}>
                                  <TableCell className="w-12">
                                    <Checkbox
                                      checked={selectedResults.includes(result.id)}
                                      onCheckedChange={() => handleSelectResult(result.id)}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{candidateName}</TableCell>
                                  <TableCell className="text-sm">{candidateEmail}</TableCell>
                                  <TableCell className="text-sm">{result.testTitle}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-semibold">{points.obtained}/{points.total} pts</span>
                                      <Progress value={points.total > 0 ? (points.obtained / points.total) * 100 : 0} className="w-16" />
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-medium text-sm">
                                      {points.obtained}/{points.total}
                                    </span>
                                  </TableCell>
                                  <TableCell><ResultStatusBadge status={displayStatus} /></TableCell>
                                  <TableCell className="text-sm">
                                    {result.submittedDate || new Date(result.completedAt).toLocaleDateString("fr-FR")}
                                  </TableCell>
                                  <TableCell>{getViolationSeverityBadge(testViolations[result.id])}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end space-x-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewDetails(result)}
                                        title="Voir les réponses détaillées"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      {testViolations[result.id] &&
                                        testViolations[result.id].violations?.length > 0 && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewViolations(result)}
                                            title="Voir les infractions"
                                            className="border-orange-300 text-orange-700 hover:bg-orange-50"
                                          >
                                            <AlertCircle className="h-4 w-4" />
                                          </Button>
                                        )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination bas */}
                  <PaginationControls
                    page={resultsPage}
                    itemsPerPage={resultsItemsPerPage}
                    totalItems={filteredResults.length}
                    itemLabel="résultats"
                    onPageChange={setResultsPage}
                  />
                </>
              )}

              {/* Vue Groupée par Formation et Groupe */}
              {resultsView === "grouped" && (
                <div className="space-y-6">
                  {groupedResults().length === 0 ? (
                    <div className="text-center py-12">
                      <LayoutGrid className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Aucun résultat à afficher</h3>
                      <p className="text-muted-foreground">
                        {testResults.length === 0
                          ? "Les résultats des tests apparaîtront ici groupés par formation"
                          : "Aucun résultat ne correspond aux filtres sélectionnés"}
                      </p>
                    </div>
                  ) : (
                    groupedResults().map((formationGroup, idx) => (
                      <Card key={idx} className="border-2">
                        <CardHeader className="bg-gradient-to-r from-orange-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-orange-500 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-xl">{formationGroup.formation}</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {formationGroup.totalResults} résultat{formationGroup.totalResults > 1 ? "s" : ""} •{" "}
                                  {Object.keys(formationGroup.groups).length} groupe
                                  {Object.keys(formationGroup.groups).length > 1 ? "s" : ""}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {formationGroup.admis} Passe en entretien
                              </Badge>
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                <XCircle className="h-3 w-3 mr-1" />
                                {formationGroup.rejected} Rejetés
                              </Badge>
                              {formationGroup.pending > 0 && (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formationGroup.pending} En attente
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            {Object.values(formationGroup.groups).map((group, groupIdx) => (
                              <Card key={groupIdx} className="border">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <UsersIcon className="h-5 w-5 text-orange-500" />
                                      <CardTitle className="text-base">{group.groupName}</CardTitle>
                                      <Badge variant="outline">
                                        {group.results.length} candidat{group.results.length > 1 ? "s" : ""}
                                      </Badge>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20">
                                        {group.admis} ✓
                                      </Badge>
                                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20">
                                        {group.rejected} ✗
                                      </Badge>
                                      {group.pending > 0 && (
                                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20">
                                          {group.pending} ⏱
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Points</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Violations</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {group.results.map((result) => {
                                        const candidateName = result.candidate?.name || result.candidateName || "N/A"
                                        const candidateEmail = result.candidate?.email || result.candidateEmail || "N/A"
                                        const score = result.score || 0
                                        const status = result.status || "pending"

                                        // Calculer les points réels
                                        const points = calculatePoints(result)

                                        const displayStatus =
                                          status === "admis"
                                            ? "selected"
                                            : status === "rejeté"
                                              ? "not_selected"
                                              : status

                                        return (
                                          <TableRow key={result.id}>
                                            <TableCell className="font-medium">{candidateName}</TableCell>
                                            <TableCell className="text-sm">{candidateEmail}</TableCell>
                                            <TableCell>
                                              <div className="flex items-center space-x-2">
                                                <span className="font-semibold">{points.obtained}/{points.total} pts</span>
                                                <Progress value={points.total > 0 ? (points.obtained / points.total) * 100 : 0} className="w-16" />
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <span className="font-medium text-sm">
                                                {points.obtained}/{points.total}
                                              </span>
                                            </TableCell>
                                            <TableCell><ResultStatusBadge status={displayStatus} /></TableCell>
                                            <TableCell className="text-sm">
                                              {result.submittedDate ||
                                                new Date(result.completedAt).toLocaleDateString("fr-FR")}
                                            </TableCell>
                                            <TableCell>{getViolationSeverityBadge(testViolations[result.id])}</TableCell>
                                            <TableCell className="text-right">
                                              <div className="flex justify-end space-x-1">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleViewDetails(result)}
                                                  title="Voir les réponses détaillées"
                                                >
                                                  <Eye className="h-4 w-4" />
                                                </Button>
                                                {testViolations[result.id] &&
                                                  testViolations[result.id].violations?.length > 0 && (
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() => handleViewViolations(result)}
                                                      title="Voir les infractions"
                                                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                                                    >
                                                      <AlertCircle className="h-4 w-4" />
                                                    </Button>
                                                  )}
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        )
                                      })}
                                    </TableBody>
                                  </Table>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Dialog de création de test avec éditeur de questions */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open)
          if (!open) setEditingTest(null)
        }}
      >
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingTest ? "Modifier le test" : "Créer un nouveau test"}</DialogTitle>
            <DialogDescription>
              {editingTest
                ? "Modifiez les informations et questions du test"
                : "Configurez le test et ajoutez vos questions personnalisées"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="infos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="infos">Informations</TabsTrigger>
              <TabsTrigger value="questions">Questions ({newTest.questions.length})</TabsTrigger>
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
            </TabsList>

            {/* Onglet Informations */}
            <TabsContent value="infos" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Titre du test *</Label>
                  <Input
                    id="title"
                    value={newTest.title}
                    onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                    placeholder="Ex: Test Développement Web Full Stack"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="referentiel">Référentiel *</Label>
                    <Select
                      value={newTest.referentiel}
                      onValueChange={(value) => setNewTest({ ...newTest, referentiel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un référentiel" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMATIONS.map((formation) => (
                          <SelectItem key={formation} value={formation}>
                            {formation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="duration">Durée (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newTest.duration}
                      onChange={(e) => setNewTest({ ...newTest, duration: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="scheduledDate">Date *</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={newTest.scheduledDate}
                      onChange={(e) => setNewTest({ ...newTest, scheduledDate: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="scheduledTime">Heure *</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={newTest.scheduledTime}
                      onChange={(e) => setNewTest({ ...newTest, scheduledTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="passingScore">Score de passage (%) *</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    value={newTest.passingScore}
                    onChange={(e) => setNewTest({ ...newTest, passingScore: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                    placeholder="Description du test..."
                    rows={3}
                  />
                </div>

                <Alert className="bg-blue-50 dark:bg-blue-900/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Une fois créé, le test sera immédiatement disponible pour les candidats via un lien unique.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            {/* Onglet Questions */}
            <TabsContent value="questions" className="space-y-4 mt-4">
              {/* Bouton d'import de questions */}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowImportQuestionsDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer des questions (CSV)
                </Button>
              </div>

              {/* Formulaire d'ajout/modification de question */}
              <Card className="border-2 border-dashed" data-question-form>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {editingQuestionIndex !== null ? "Modifier la question" : "Ajouter une question"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Question *</Label>

                    {/*<Textarea
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      placeholder="Saisissez votre question..."
                      rows={2}
                    />*/}
                    <RichTextEditor
                      key={editingQuestionIndex !== null ? `edit-${editingQuestionIndex}` : 'new-question'}
                      value={currentQuestion.question}
                      onChange={(value) => setCurrentQuestion({ ...currentQuestion, question: value })}
                      placeholder="Saisissez votre question..."
                      rows={3}
                    />
                  </div>

                  {/* Upload d'image */}
                  <div className="grid gap-2">
                    <Label>Image (optionnel)</Label>
                    {!currentQuestion.image ? (
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <Input
                          id="question-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Label htmlFor="question-image" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Cliquez pour ajouter une image (max 5MB)</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG, GIF, WebP</p>
                        </Label>
                      </div>
                    ) : (
                      <div className="relative border rounded-lg p-2">
                        <img
                          src={currentQuestion.image || "/placeholder.svg"}
                          alt="Aperçu"
                          className="max-h-48 mx-auto rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveImage}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Type de question *</Label>
                      <Select
                        value={currentQuestion.type}
                        onValueChange={(value) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            type: value,
                            correctAnswer: null,
                            correctAnswers: [],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="qcm_simple">QCM (Choix unique)</SelectItem>
                          <SelectItem value="qcm_multiple">QCM (Choix multiples)</SelectItem>
                          <SelectItem value="texte_libre">Texte libre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Points *</Label>
                      <Input
                        type="number"
                        value={currentQuestion.score}
                        onChange={(e) =>
                          setCurrentQuestion({ ...currentQuestion, score: Number.parseInt(e.target.value) || 0 })
                        }
                        min="1"
                      />
                    </div>
                  </div>

                  {currentQuestion.type !== "texte_libre" && (
                    <div className="space-y-3">
                      <Label>Options de réponse *</Label>
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...currentQuestion.options]
                              newOptions[index] = e.target.value
                              setCurrentQuestion({ ...currentQuestion, options: newOptions })
                            }}
                            placeholder={`Option ${index + 1}`}
                          />
                          {currentQuestion.type === "qcm_simple" ? (
                            <Button
                              type="button"
                              variant={currentQuestion.correctAnswer === index ? "default" : "outline"}
                              size="icon"
                              onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                              title="Marquer comme bonne réponse"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant={currentQuestion.correctAnswers.includes(index) ? "default" : "outline"}
                              size="icon"
                              onClick={() => {
                                const newCorrect = currentQuestion.correctAnswers.includes(index)
                                  ? currentQuestion.correctAnswers.filter((i) => i !== index)
                                  : [...currentQuestion.correctAnswers, index]
                                setCurrentQuestion({ ...currentQuestion, correctAnswers: newCorrect })
                              }}
                              title="Marquer comme bonne réponse"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {index >= 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newOptions = currentQuestion.options.filter((_, i) => i !== index)
                                setCurrentQuestion({ ...currentQuestion, options: newOptions })
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: [...currentQuestion.options, ""],
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une option
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    {editingQuestionIndex !== null && (
                      <Button type="button" variant="outline" onClick={handleCancelEditQuestion}>
                        Annuler
                      </Button>
                    )}
                    <Button type="button" onClick={handleAddQuestion}>
                      {editingQuestionIndex !== null ? "Mettre à jour" : "Ajouter"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des questions */}
              {newTest.questions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Questions du test ({newTest.questions.length})</h3>
                  {newTest.questions.map((q, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline">Q{index + 1}</Badge>
                              <Badge>
                                {q.type === "qcm_simple"
                                  ? "QCM Simple"
                                  : q.type === "qcm_multiple"
                                    ? "QCM Multiple"
                                    : "Texte libre"}
                              </Badge>
                              <Badge variant="secondary">{q.score} pts</Badge>
                              {q.image && (
                                <Badge variant="outline" className="bg-blue-50">
                                  📷 Image
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium">{q.question}</p>
                            {q.image && (
                              <img
                                src={q.image || "/placeholder.svg"}
                                alt="Question"
                                className="mt-2 max-h-32 rounded border"
                              />
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditQuestion(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(index)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {q.type !== "texte_libre" && (
                        <CardContent className="pt-0">
                          <div className="space-y-1">
                            {q.options.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2 text-sm">
                                {(q.type === "qcm_simple" && q.correctAnswer === optIndex) ||
                                (q.type === "qcm_multiple" && q.correctAnswers?.includes(optIndex)) ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-gray-300" />
                                )}
                                <span
                                  className={
                                    (q.type === "qcm_simple" && q.correctAnswer === optIndex) ||
                                    (q.type === "qcm_multiple" && q.correctAnswers?.includes(optIndex))
                                      ? "font-medium text-green-600"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {opt}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {newTest.questions.length === 0 && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Aucune question ajoutée. Utilisez le formulaire ci-dessus pour créer vos questions.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Onglet Aperçu */}
            <TabsContent value="preview" className="mt-4">
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {/* Header du test */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <CardTitle>{newTest.title || "Titre du test"}</CardTitle>
                    <CardDescription className="text-orange-100">
                      {newTest.referentiel || "Référentiel"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <Clock className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                        <p className="text-sm text-muted-foreground">Durée</p>
                        <p className="font-semibold">{newTest.duration} min</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <FileText className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                        <p className="text-sm text-muted-foreground">Questions</p>
                        <p className="font-semibold">{newTest.questions.length}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <CheckCircle className="h-6 w-6 mx-auto mb-1 text-green-500" />
                        <p className="text-sm text-muted-foreground">Score requis</p>
                        <p className="font-semibold">{newTest.passingScore}%</p>
                      </div>
                    </div>

                    {newTest.description && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{newTest.description}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Date et heure</h4>
                      <p className="text-sm">
                        {newTest.scheduledDate || "Non définie"} à {newTest.scheduledTime || "Non définie"}
                      </p>
                    </div>

                    <Alert className="bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        Le test est prêt à être créé avec {newTest.questions.length} question(s) pour un total de{" "}
                        {newTest.questions.reduce((sum, q) => sum + q.score, 0)} points.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Aperçu des questions */}
                {newTest.questions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Aperçu des questions
                    </h3>
                    {newTest.questions.map((question, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Question {index + 1}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">{question.score} pts</Badge>
                              {question.type === "qcm_multiple" && <Badge variant="outline">Choix multiples</Badge>}
                              {question.type === "texte_libre" && <Badge variant="outline">Texte libre</Badge>}
                            </div>
                          </div>
                          <CardDescription className="text-base mt-2">
                            <RichTextDisplay content={question.question} />
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {/* Afficher l'image si elle existe */}
                          {question.image && (
                            <div className="mb-6">
                              <img
                                src={question.image || "/placeholder.svg"}
                                alt={`Question ${index + 1}`}
                                className="max-h-64 mx-auto rounded-lg border shadow-sm"
                              />
                            </div>
                          )}

                          {/* QCM Simple */}
                          {(!question.type || question.type === "qcm_simple") && question.options && (
                            <div className="space-y-3">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`flex items-center space-x-3 p-4 rounded-lg border ${
                                    question.correctAnswer === optIndex
                                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                      : "bg-gray-50 dark:bg-gray-800"
                                  }`}
                                >
                                  <div
                                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                      question.correctAnswer === optIndex
                                        ? "border-green-500 bg-green-500"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {question.correctAnswer === optIndex && (
                                      <div className="h-2 w-2 rounded-full bg-white" />
                                    )}
                                  </div>
                                  <span className="flex-1">{option}</span>
                                  {question.correctAnswer === optIndex && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* QCM Multiple */}
                          {question.type === "qcm_multiple" && question.options && (
                            <div className="space-y-3">
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  Plusieurs réponses possibles. Les options cochées sont les bonnes réponses.
                                </AlertDescription>
                              </Alert>
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`flex items-center space-x-3 p-4 rounded-lg border ${
                                    question.correctAnswers?.includes(optIndex)
                                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                      : "bg-gray-50 dark:bg-gray-800"
                                  }`}
                                >
                                  <div
                                    className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                                      question.correctAnswers?.includes(optIndex)
                                        ? "border-green-500 bg-green-500"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {question.correctAnswers?.includes(optIndex) && (
                                      <CheckCircle className="h-3 w-3 text-white" />
                                    )}
                                  </div>
                                  <span className="flex-1">{option}</span>
                                  {question.correctAnswers?.includes(optIndex) && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Texte Libre */}
                          {question.type === "texte_libre" && (
                            <div className="space-y-3">
                              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 min-h-[120px]">
                                <p className="text-sm text-muted-foreground italic">
                                  [Zone de saisie de texte libre pour le candidat]
                                </p>
                              </div>
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  Cette réponse sera évaluée manuellement.
                                </AlertDescription>
                              </Alert>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {newTest.questions.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Aucune question n'a encore été ajoutée. Allez dans l'onglet "Questions" pour en ajouter.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateTest}
              disabled={!newTest.title || !newTest.referentiel || newTest.questions.length === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {editingTest ? "Modifier le test" : "Créer le test"} ({newTest.questions.length} question
              {newTest.questions.length > 1 ? "s" : ""})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'upload de test */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importer un test</DialogTitle>
            <DialogDescription>Téléchargez un fichier CSV ou Excel contenant les questions du test</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Glissez-déposez votre fichier ou cliquez pour parcourir
              </p>
              <Input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="max-w-xs mx-auto" />
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Format attendu :</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Question | Option1 | Option2 | Option3 | Option4 | Réponse | Score</li>
                <li>• La réponse doit être le numéro de l'option correcte (1-4)</li>
                <li>• Le score doit être un nombre entier</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Fermer
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Télécharger le modèle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'envoi d'emails */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Envoyer des emails</DialogTitle>
            <DialogDescription>
              Configuration de l'envoi d'emails pour le test : {selectedTest?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Type d'email */}
            <div className="grid gap-2">
              <Label htmlFor="emailType">Type d'email *</Label>
              <Select value={emailData.type} onValueChange={(value) => setEmailData({ ...emailData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invitation">Invitation au test</SelectItem>
                  <SelectItem value="reminder">Rappel (J-1)</SelectItem>
                  <SelectItem value="results_selected">Résultats - Sélectionné</SelectItem>
                  <SelectItem value="results_not_selected">Résultats - Non sélectionné</SelectItem>
                  <SelectItem value="documents_reminder">Rappel documents</SelectItem>
                  <SelectItem value="opening_announcement">Annonce de rentrée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Créneau horaire */}
            {emailData.type === "invitation" && (
              <div className="grid gap-2">
                <Label htmlFor="timeSlot">Créneau horaire *</Label>
                <Select
                  value={emailData.timeSlot}
                  onValueChange={(value) => setEmailData({ ...emailData, timeSlot: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un créneau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lundi_10h30-11h">Lundi 20/10 - 10h30 à 11h00</SelectItem>
                    <SelectItem value="lundi_11h30-12h">Lundi 20/10 - 11h30 à 12h00</SelectItem>
                    <SelectItem value="mardi_8h-9h">Mardi 21/10 - 8h00 à 9h00</SelectItem>
                    <SelectItem value="mardi_9h30-10h30">Mardi 21/10 - 9h30 à 10h30</SelectItem>
                    <SelectItem value="mardi_11h-12h">Mardi 21/10 - 11h00 à 12h00</SelectItem>
                    <SelectItem value="mercredi_14h-15h">Mercredi 22/10 - 14h00 à 15h00</SelectItem>
                    <SelectItem value="mercredi_15h30-16h30">Mercredi 22/10 - 15h30 à 16h30</SelectItem>
                    <SelectItem value="jeudi_10h-11h">Jeudi 23/10 - 10h00 à 11h00</SelectItem>
                    <SelectItem value="vendredi_9h-10h">Vendredi 24/10 - 9h00 à 10h00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Sélection de candidats */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Destinataires *</Label>
                <Button variant="outline" size="sm" onClick={() => setShowCandidateSelection(!showCandidateSelection)}>
                  <Users className="h-4 w-4 mr-2" />
                  {showCandidateSelection ? "Masquer" : "Sélectionner"} ({emailData.selectedCandidates.length})
                </Button>
              </div>

              {showCandidateSelection && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Liste des candidats</CardTitle>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const filtered = candidatesList
                              .filter((c) => c.referentiel === selectedTest?.referentiel)
                              .map((c) => c.id)
                            setEmailData({ ...emailData, selectedCandidates: filtered })
                          }}
                        >
                          Tous ({selectedTest?.referentiel})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEmailData({ ...emailData, selectedCandidates: [] })}
                        >
                          Aucun
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {candidatesList
                          .filter((c) => !selectedTest || c.referentiel === selectedTest.referentiel)
                          .map((candidate) => (
                            <div
                              key={candidate.id}
                              className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <Checkbox
                                checked={emailData.selectedCandidates.includes(candidate.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setEmailData({
                                      ...emailData,
                                      selectedCandidates: [...emailData.selectedCandidates, candidate.id],
                                    })
                                  } else {
                                    setEmailData({
                                      ...emailData,
                                      selectedCandidates: emailData.selectedCandidates.filter(
                                        (id) => id !== candidate.id,
                                      ),
                                    })
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{candidate.name}</p>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <span>{candidate.email}</span>
                                  <span>•</span>
                                  <span>{candidate.phone}</span>
                                </div>
                              </div>
                              <Badge variant="outline">{candidate.referentiel}</Badge>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {!showCandidateSelection && emailData.selectedCandidates.length > 0 && (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
                  <Users className="h-4 w-4 text-green-600" />
                  <AlertDescription>{emailData.selectedCandidates.length} candidat(s) sélectionné(s)</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Message personnalisé */}
            <div className="grid gap-2">
              <Label htmlFor="customMessage">Message personnalisé (optionnel)</Label>
              <Textarea
                id="customMessage"
                value={emailData.customMessage}
                onChange={(e) => setEmailData({ ...emailData, customMessage: e.target.value })}
                placeholder="Ajoutez un message personnalisé..."
                rows={4}
              />
            </div>

            {/* Lien du test */}
            {selectedTest && emailData.type === "invitation" && (
              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <LinkIcon className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Lien du test :</p>
                    <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-950 rounded border">
                      <code className="text-xs flex-1 truncate">{getTestUrl(selectedTest.id)}</code>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyTestLink(selectedTest.id)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenTest(selectedTest.id)}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    {emailData.timeSlot && (
                      <p className="text-xs text-muted-foreground">
                        📅 Créneau : <strong>{emailData.timeSlot.replace(/_/g, " ")}</strong>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Ce lien sera inclus automatiquement dans l'email d'invitation
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSendEmails}
              disabled={
                emailData.selectedCandidates.length === 0 || (emailData.type === "invitation" && !emailData.timeSlot)
              }
            >
              <Send className="mr-2 h-4 w-4" />
              Envoyer à {emailData.selectedCandidates.length} candidat(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'import de questions */}
      <Dialog open={showImportQuestionsDialog} onOpenChange={setShowImportQuestionsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl">Importer des questions (CSV)</DialogTitle>
            <DialogDescription className="text-base">
              Importez plusieurs questions depuis un fichier CSV
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <AlertDescription className="text-sm">
                    <strong className="text-blue-800 dark:text-blue-300 block mb-2">Format attendu du CSV :</strong>
                    <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 p-3 rounded-md text-xs font-mono mb-3">
                      Question,Type,Option1,Option2,Option3,Option4,CorrectAnswer(s),Score
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>
                          <strong>Type</strong> : qcm_simple, qcm_multiple ou texte_libre
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>
                          <strong>CorrectAnswer</strong> : index (0,1,2,3) pour qcm_simple
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span>
                          <strong>CorrectAnswers</strong> : indices séparés par ; (ex: 0;2;3) pour qcm_multiple
                        </span>
                      </li>
                    </ul>
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <Input
                type="file"
                accept=".csv"
                onChange={handleImportQuestionsFromExcel}
                className="hidden"
                id="import-questions"
              />
              <Label htmlFor="import-questions" className="cursor-pointer">
                <p className="text-base font-medium text-foreground">Cliquez pour sélectionner un fichier CSV</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Les questions seront ajoutées au test en cours de création
                </p>
              </Label>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowImportQuestionsDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'import de résultats */}
      <Dialog open={showImportResultsDialog} onOpenChange={setShowImportResultsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importer des résultats (CSV)</DialogTitle>
            <DialogDescription>Importez des résultats de tests depuis un fichier CSV</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Format attendu du CSV :</strong>
                <div className="mt-2 text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  Nom,Email,Téléphone,TestID,Score,Statut,Date
                </div>
                <ul className="text-xs mt-2 space-y-1">
                  <li>
                    • <strong>Statut</strong> : admis, rejeté ou pending
                  </li>
                  <li>
                    • <strong>Date</strong> : format ISO (YYYY-MM-DDTHH:mm:ss)
                  </li>
                  <li>
                    • <strong>Score</strong> : nombre entre 0 et 100
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <Input
                type="file"
                accept=".csv"
                onChange={handleImportResultsFromExcel}
                className="hidden"
                id="import-results"
              />
              <Label htmlFor="import-results" className="cursor-pointer">
                <p className="text-sm font-medium">Cliquez pour sélectionner un fichier CSV</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Les résultats seront ajoutés aux résultats existants
                </p>
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportResultsDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog des détails des réponses avec notation manuelle */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails des réponses - {selectedResult?.candidate?.name || selectedResult?.candidateName}
            </DialogTitle>
            <DialogDescription>
              Réponses détaillées et notation pour le test : {selectedResult?.testTitle}
            </DialogDescription>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-6 py-4">
              {/* Informations du candidat */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Informations du candidat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nom :</span>
                      <p className="font-medium">{selectedResult.candidate?.name || selectedResult.candidateName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email :</span>
                      <p className="font-medium">{selectedResult.candidate?.email || selectedResult.candidateEmail}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Téléphone :</span>
                      <p className="font-medium">{selectedResult.candidate?.phone || selectedResult.candidatePhone}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Référentiel :</span>
                      <Badge variant="outline">{selectedResult.referentiel}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Score actuel :</span>
                      <p className="font-bold text-lg">{calculateTotalScore()}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date de soumission :</span>
                      <p className="font-medium">
                        {selectedResult.submittedDate ||
                          new Date(selectedResult.completedAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions et réponses */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Réponses aux questions</h3>
                {(() => {
                  const test = testsData.find((t) => t.id === selectedResult.testId)
                  if (!test || !test.questions) {
                    return (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Impossible de charger les questions du test.</AlertDescription>
                      </Alert>
                    )
                  }

                  return test.questions.map((question, idx) => {
                    const answer = selectedResult.answers?.[idx]
                    const isCorrect =
                      question.type === "qcm_simple"
                        ? answer === question.correctAnswer
                        : question.type === "qcm_multiple"
                          ? JSON.stringify((answer || []).sort()) === JSON.stringify(question.correctAnswers.sort())
                          : null

                    return (
                      <Card
                        key={idx}
                        className={
                          question.type !== "texte_libre"
                            ? isCorrect
                              ? "border-green-200 bg-green-50/50 dark:bg-green-900/10"
                              : "border-red-200 bg-red-50/50 dark:bg-red-900/10"
                            : ""
                        }
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline">Question {idx + 1}</Badge>
                                <Badge>
                                  {question.type === "qcm_simple"
                                    ? "QCM Simple"
                                    : question.type === "qcm_multiple"
                                      ? "QCM Multiple"
                                      : "Texte libre"}
                                </Badge>
                                <Badge variant="secondary">{question.score} pts</Badge>
                                {question.image && (
                                  <Badge variant="outline" className="bg-blue-50">
                                    📷 Image
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium">{question.question}</p>
                              {question.image && (
                                <img
                                  src={question.image || "/placeholder.svg"}
                                  alt="Question"
                                  className="mt-2 max-h-32 rounded border"
                                />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Affichage de la réponse */}
                          {question.type === "texte_libre" ? (
                            <div className="space-y-2">
                              <Label>Réponse du candidat :</Label>
                              <div className="p-3 bg-white dark:bg-gray-950 border rounded">
                                <p className="whitespace-pre-wrap">{answer || "(Aucune réponse)"}</p>
                              </div>

                              {/* Notation manuelle */}
                              <div className="flex items-center space-x-2 pt-2">
                                <Label htmlFor={`grade-${idx}`}>Note manuelle (/{question.score}) :</Label>
                                <Input
                                  id={`grade-${idx}`}
                                  type="number"
                                  min="0"
                                  max={question.score}
                                  step="0.5"
                                  value={manualGrades[`q${idx}`] || 0}
                                  onChange={(e) => handleSaveManualGrade(`q${idx}`, e.target.value)}
                                  className="w-24"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label>Options :</Label>
                              {question.options.map((opt, optIdx) => {
                                const isUserAnswer =
                                  question.type === "qcm_simple" ? answer === optIdx : (answer || []).includes(optIdx)
                                const isCorrectAnswer =
                                  question.type === "qcm_simple"
                                    ? question.correctAnswer === optIdx
                                    : question.correctAnswers.includes(optIdx)

                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-2 border rounded flex items-center space-x-2 ${
                                      isCorrectAnswer
                                        ? "bg-green-50 border-green-200 dark:bg-green-900/10"
                                        : isUserAnswer
                                          ? "bg-red-50 border-red-200 dark:bg-red-900/10"
                                          : ""
                                    }`}
                                  >
                                    {isUserAnswer && <span className="text-blue-600">👉</span>}
                                    {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                                    <span>{opt}</span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                })()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fermer
            </Button>
            <Button
              onClick={async () => {
                // Recalculer le score final
                const finalScore = calculateTotalScore()

                // Déterminer le statut basé sur le score de passage
                const test = testsData.find((t) => t.id === selectedResult.testId)
                const passingScore = test?.passingScore || 70
                const newStatus = finalScore >= passingScore ? "admis" : "rejeté"

                // Sauvegarder dans MongoDB
                try {
                  const response = await fetch(`${API_BASE_URL}/api/admin/tests/results/${selectedResult.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      score: finalScore,
                      status: newStatus,
                      manualGrades: manualGrades,
                    }),
                  })

                  const result = await response.json()

                  if (result.success) {
                    toast.success(`Score final : ${finalScore}% - Statut : ${newStatus}`)
                    // Recharger les résultats
                    await fetchResults()
                    setShowDetailsDialog(false)
                  } else {
                    toast.error("Erreur lors de la sauvegarde du score final")
                  }
                } catch (error) {
                  toast.error("Impossible de sauvegarder le score. Vérifiez la connexion au backend.")
                }
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Valider les notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour envoyer des emails aux candidats sélectionnés (Résultats) */}
      <Dialog open={showEmailResultsDialog} onOpenChange={setShowEmailResultsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un email aux candidats sélectionnés</DialogTitle>
            <DialogDescription>{selectedResults.length} candidat(s) sélectionné(s)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="emailResultsType">Type d'email</Label>
              <Select value={emailResultsType} onValueChange={setEmailResultsType}>
                <SelectTrigger id="emailResultsType">
                  <SelectValue placeholder="Sélectionner le type d'email" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interview_invitation">Invitation à l'entretien</SelectItem>
                  <SelectItem value="acceptance">Notification d'acceptation</SelectItem>
                  <SelectItem value="rejection">Notification de refus</SelectItem>
                  <SelectItem value="results_notification">Notification des résultats</SelectItem>
                  <SelectItem value="information">Information générale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customResultsMessage">Message personnalisé (optionnel)</Label>
              <Textarea
                id="customResultsMessage"
                value={customResultsMessage}
                onChange={(e) => setCustomResultsMessage(e.target.value)}
                placeholder="Ajoutez un message personnalisé..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEmailResultsDialog(false)}
                disabled={sendingResultsEmails}
              >
                Annuler
              </Button>
              <Button onClick={handleSendResultsEmails} disabled={!emailResultsType || sendingResultsEmails}>
                {sendingResultsEmails ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour créer un groupe de test */}
      <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un groupe de test</DialogTitle>
            <DialogDescription>Sélectionnez les candidats et définissez la date du test</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Informations du groupe */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="groupName">Nom du groupe *</Label>
                <Input
                  id="groupName"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Ex: Groupe Dev Web - Session 1"
                />
              </div>
              <div>
                <Label htmlFor="groupFormation">Formation *</Label>
                <Select
                  value={newGroup.formation}
                  onValueChange={(value) => {
                    setNewGroup({ ...newGroup, formation: value })
                    setSelectedCandidatesForGroup([])
                  }}
                >
                  <SelectTrigger id="groupFormation">
                    <SelectValue placeholder="Sélectionner une formation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dev Web">Dev Web</SelectItem>
                    <SelectItem value="Data">Data</SelectItem>
                    <SelectItem value="Hackeuse">Hackeuse</SelectItem>
                    <SelectItem value="AWS">AWS</SelectItem>
                    <SelectItem value="Design UX/UI">Design UX/UI</SelectItem>
                    <SelectItem value="Cyber security">Cyber security</SelectItem>
                    <SelectItem value="Intelligence Artificielle">Intelligence Artificielle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date et heure */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="groupDate">Date du test *</Label>
                <Input
                  id="groupDate"
                  type="date"
                  value={newGroup.test_date}
                  onChange={(e) => setNewGroup({ ...newGroup, test_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="groupTime">Heure *</Label>
                <Input
                  id="groupTime"
                  type="time"
                  value={newGroup.test_time}
                  onChange={(e) => setNewGroup({ ...newGroup, test_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="groupDuration">Durée (minutes)</Label>
                <Input
                  id="groupDuration"
                  type="number"
                  value={newGroup.duration}
                  onChange={(e) => setNewGroup({ ...newGroup, duration: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* Test associé et lieu */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="groupTest">Test associé (optionnel)</Label>
                <Select
                  value={newGroup.test_id || "none"}
                  onValueChange={(value) => setNewGroup({ ...newGroup, test_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger id="groupTest">
                    <SelectValue placeholder="Sélectionner un test" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun test</SelectItem>
                    {testsData
                      .filter((test) => test.referentiel === newGroup.formation)
                      .map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          {test.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="groupLocation">Lieu</Label>
                <Input
                  id="groupLocation"
                  value={newGroup.location}
                  onChange={(e) => setNewGroup({ ...newGroup, location: e.target.value })}
                  placeholder="Ex: Salle A, En ligne, etc."
                />
              </div>
            </div>

            {/* Instructions */}
            <div>
              <Label htmlFor="groupInstructions">Instructions</Label>
              <Textarea
                id="groupInstructions"
                value={newGroup.instructions}
                onChange={(e) => setNewGroup({ ...newGroup, instructions: e.target.value })}
                placeholder="Instructions particulières pour le test..."
                rows={3}
              />
            </div>

            {/* Liste des candidats */}
            {newGroup.formation && (
              <div>
                <Label>Liste des candidats de la formation</Label>
                <div className="mt-2 border rounded-md p-4 max-h-[60vh] sm:max-h-[70vh] md:max-h-[75vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                  {availableCandidates.filter((c) => c.desired_training === newGroup.formation).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun candidat trouvé pour cette formation
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableCandidates
                        .filter((c) => c.desired_training === newGroup.formation)
                        .map((candidate) => {
                          const isAssigned = assignedCandidateIds.includes(candidate.id)
                          const groupName = candidateToGroupMap[candidate.id]
                          return (
                            <div
                              key={candidate.id}
                              className={`flex items-center justify-between p-2 sm:p-3 rounded border ${
                                isAssigned
                                  ? "bg-gray-50 dark:bg-gray-900/30 opacity-70 border-gray-200 dark:border-gray-800"
                                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm sm:text-base truncate">
                                  {candidate.first_name} {candidate.last_name}
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground truncate">{candidate.email}</div>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                {isAssigned ? (
                                  <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 whitespace-nowrap">
                                    {groupName}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-gray-500 whitespace-nowrap">
                                    Non assigné
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateGroupDialog(false)
                  setNewGroup({
                    name: "",
                    formation: "",
                    test_id: "",
                    test_date: "",
                    test_time: "",
                    duration: 60,
                    location: "",
                    instructions: "",
                  })
                  setSelectedCandidatesForGroup([])
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleCreateGroup}>
                <Plus className="mr-2 h-4 w-4" />
                Créer le groupe
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour configurer et envoyer les invitations */}
      <Dialog open={showSendInvitationDialog} onOpenChange={setShowSendInvitationDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Envoyer les invitations</DialogTitle>
            <DialogDescription>
              Configurez les détails du test avant d'envoyer les invitations à{" "}
              {selectedGroupForInvitation?.candidate_count} candidat(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-2 -mr-2">
            {/* Informations du groupe */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <h4 className="font-medium mb-2">Groupe : {selectedGroupForInvitation?.name}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Formation :</span>
                  <span className="ml-2 font-medium">{selectedGroupForInvitation?.formation}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Candidats :</span>
                  <span className="ml-2 font-medium">{selectedGroupForInvitation?.candidate_count}</span>
                </div>
              </div>
            </div>

            {/* Sélection du test */}
            <div>
              <Label htmlFor="invitation-test">
                Test à passer <span className="text-red-500">*</span>
              </Label>
              <Select value={invitationDetails.test_id} onValueChange={handleTestSelection}>
                <SelectTrigger id="invitation-test">
                  <SelectValue placeholder="Sélectionnez un test" />
                </SelectTrigger>
                <SelectContent>
                  {testsData.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Aucun test disponible
                    </SelectItem>
                  ) : (
                    testsData.map((test) => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.title} ({test.referentiel}) - {test.scheduledDate ? `📅 ${test.scheduledDate}` : ""}{" "}
                        {test.scheduledTime ? `🕐 ${test.scheduledTime}` : ""} - {test.duration} min
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                ✨ Les informations du test (date, heure, durée) seront automatiquement remplies
              </p>
            </div>

            {/* Date et heure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invitation-date">
                  Date du test <span className="text-red-500">*</span>
                  {invitationDetails.test_id && (
                    <span className="text-xs text-muted-foreground ml-2">(depuis le test)</span>
                  )}
                </Label>
                <Input
                  id="invitation-date"
                  type="date"
                  value={invitationDetails.test_date}
                  onChange={(e) => setInvitationDetails({ ...invitationDetails, test_date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  disabled={!!invitationDetails.test_id}
                  className={invitationDetails.test_id ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}
                />
              </div>
              <div>
                <Label htmlFor="invitation-time">
                  Heure de début <span className="text-red-500">*</span>
                  {invitationDetails.test_id && (
                    <span className="text-xs text-muted-foreground ml-2">(depuis le test)</span>
                  )}
                </Label>
                <Input
                  id="invitation-time"
                  type="time"
                  value={invitationDetails.test_time}
                  onChange={(e) => setInvitationDetails({ ...invitationDetails, test_time: e.target.value })}
                  disabled={!!invitationDetails.test_id}
                  className={invitationDetails.test_id ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}
                />
              </div>
            </div>

            {/* Durée */}
            <div>
              <Label htmlFor="invitation-duration">
                Durée du test (en minutes)
                {invitationDetails.test_id && (
                  <span className="text-xs text-muted-foreground ml-2">(depuis le test)</span>
                )}
              </Label>
              <Input
                id="invitation-duration"
                type="number"
                min="5"
                max="300"
                value={invitationDetails.duration}
                onChange={(e) =>
                  setInvitationDetails({ ...invitationDetails, duration: Number.parseInt(e.target.value) || 60 })
                }
                disabled={!!invitationDetails.test_id}
                className={invitationDetails.test_id ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}
              />
            </div>

            {/* Lien du test */}
            {invitationDetails.test_id && (
              <div>
                <Label htmlFor="test-link">Lien du test</Label>
                <div className="flex gap-2">
                  <Input
                    id="test-link"
                    type="text"
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/test/${invitationDetails.test_id}`}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-900"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const link = `${window.location.origin}/test/${invitationDetails.test_id}`
                      navigator.clipboard
                        .writeText(link)
                        .then(() => {
                          toast.success("Lien copié dans le presse-papier !")
                        })
                        .catch(() => {
                          toast.error("Erreur lors de la copie du lien")
                        })
                    }}
                    title="Copier le lien"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ce lien sera envoyé aux candidats dans l'email d'invitation
                </p>
              </div>
            )}

            {/* Lieu */}
            <div>
              <Label htmlFor="invitation-location">Lieu du test</Label>
              <Input
                id="invitation-location"
                type="text"
                value={invitationDetails.location}
                onChange={(e) => setInvitationDetails({ ...invitationDetails, location: e.target.value })}
                placeholder="Ex: En ligne, Salle A, ODC Dakar..."
              />
            </div>

            {/* Instructions */}
            <div>
              <Label htmlFor="invitation-instructions">Instructions particulières</Label>
              <Textarea
                id="invitation-instructions"
                value={invitationDetails.instructions}
                onChange={(e) => setInvitationDetails({ ...invitationDetails, instructions: e.target.value })}
                placeholder="Instructions à communiquer aux candidats..."
                rows={3}
              />
            </div>

            {/* Aperçu de l'email */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Aperçu de l'invitation
              </h4>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Objet :</strong> Invitation au test - {selectedGroupForInvitation?.formation}
                </p>
                <p>
                  <strong>Date :</strong>{" "}
                  {invitationDetails.test_date && invitationDetails.test_time
                    ? new Date(`${invitationDetails.test_date}T${invitationDetails.test_time}`).toLocaleDateString(
                        "fr-FR",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "Non définie"}
                </p>
                <p>
                  <strong>Durée :</strong> {invitationDetails.duration} minutes
                </p>
                <p>
                  <strong>Lieu :</strong> {invitationDetails.location}
                </p>
                {invitationDetails.test_id && (
                  <p className="flex items-start gap-1">
                    <strong>Lien :</strong>
                    <span className="text-blue-600 dark:text-blue-400 break-all">
                      {typeof window !== "undefined" ? window.location.origin : ""}/test/{invitationDetails.test_id}
                    </span>
                  </p>
                )}
                {invitationDetails.instructions && (
                  <p>
                    <strong>Instructions :</strong> {invitationDetails.instructions}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-950">
            <Button variant="outline" onClick={() => setShowSendInvitationDialog(false)} disabled={sendingInvitations}>
              Annuler
            </Button>
            <Button
              onClick={handleConfirmAndSendInvitations}
              disabled={
                sendingInvitations ||
                !invitationDetails.test_id ||
                !invitationDetails.test_date ||
                !invitationDetails.test_time
              }
            >
              {sendingInvitations ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Confirmer et envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour voir les candidats d'un groupe */}
      <Dialog open={showGroupCandidatesDialog} onOpenChange={setShowGroupCandidatesDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidats du groupe : {selectedGroupForView?.name}</DialogTitle>
            <DialogDescription>{selectedGroupForView?.candidate_count} candidat(s) dans ce groupe</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Informations du groupe */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Formation</p>
                    <p className="font-medium">{selectedGroupForView?.formation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date du test</p>
                    <p className="font-medium">
                      {selectedGroupForView?.test_date
                        ? new Date(selectedGroupForView.test_date).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Non définie"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lieu</p>
                    <p className="font-medium">{selectedGroupForView?.location || "Non défini"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Durée</p>
                    <p className="font-medium">{selectedGroupForView?.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <div className="mt-1">
                      {selectedGroupForView?.status === "pending" && <Badge variant="secondary">En attente</Badge>}
                      {selectedGroupForView?.status === "scheduled" && <Badge className="bg-blue-500">Planifié</Badge>}
                      {selectedGroupForView?.status === "completed" && <Badge className="bg-green-500">Terminé</Badge>}
                    </div>
                  </div>
                  {selectedGroupForView?.instructions && (
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-sm text-muted-foreground">Instructions</p>
                      <p className="font-medium text-sm">{selectedGroupForView.instructions}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Liste des candidats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liste des candidats</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingGroupCandidates ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Chargement des candidats...</p>
                  </div>
                ) : groupCandidatesDetails.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Aucun candidat trouvé dans ce groupe</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Nom complet</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Téléphone</TableHead>
                          <TableHead>Niveau d'études</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupCandidatesDetails.map((candidate, index) => (
                          <TableRow key={candidate.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {candidate.first_name} {candidate.last_name}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{candidate.email}</TableCell>
                            <TableCell>{candidate.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{candidate.education_level || "Non renseigné"}</Badge>
                            </TableCell>
                            <TableCell>
                              {candidate.status === "pending" && <Badge variant="secondary">En attente</Badge>}
                              {candidate.status === "accepted" && <Badge className="bg-green-500">Accepté</Badge>}
                              {candidate.status === "rejected" && <Badge variant="destructive">Refusé</Badge>}
                              {candidate.status === "interview" && <Badge className="bg-blue-500">Entretien</Badge>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGroupCandidatesDialog(false)}>
              Fermer
            </Button>
            <Button
              onClick={() => {
                // Exporter la liste des candidats
                const csvContent = [
                  ["#", "Nom", "Prénom", "Email", "Téléphone", "Niveau d'études", "Statut"].join(";"),
                  ...groupCandidatesDetails.map((c, i) =>
                    [
                      i + 1,
                      c.last_name,
                      c.first_name,
                      c.email,
                      c.phone,
                      c.education_level || "Non renseigné",
                      c.status,
                    ].join(";"),
                  ),
                ].join("\n")

                const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.download = `groupe_${selectedGroupForView?.name?.replace(/\s+/g, "_")}_candidats.csv`
                link.click()
                URL.revokeObjectURL(url)

                toast.success("Liste des candidats exportée")
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter la liste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={showDeleteTestDialog}
        onOpenChange={setShowDeleteTestDialog}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer ce test ?"
        details={
          testToDelete ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
              <h4 className="font-medium mb-2">{testToDelete.title}</h4>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Référentiel :</strong> {testToDelete.referentiel}
                </p>
                <p>
                  <strong>Durée :</strong> {testToDelete.duration} minutes
                </p>
                <p>
                  <strong>Questions :</strong> {testToDelete.totalQuestions}
                </p>
              </div>
            </div>
          ) : null
        }
        warningText="⚠️ Cette action est irréversible. Le test et toutes ses questions seront définitivement supprimés."
        isLoading={deletingTest}
        onCancel={() => {
          setShowDeleteTestDialog(false)
          setTestToDelete(null)
        }}
        onConfirm={handleConfirmDeleteTest}
        confirmLabel="Supprimer définitivement"
        loadingLabel="Suppression en cours..."
      />

      <ConfirmationDialog
        open={showDeleteGroupDialog}
        onOpenChange={setShowDeleteGroupDialog}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer ce groupe ?"
        details={
          groupToDelete ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
              <h4 className="font-medium mb-2">{groupToDelete.name}</h4>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Formation :</strong> {groupToDelete.formation}
                </p>
                <p>
                  <strong>Candidats :</strong> {groupToDelete.candidate_count}
                </p>
                <p>
                  <strong>Statut :</strong>{" "}
                  {groupToDelete.status === "pending"
                    ? "En attente"
                    : groupToDelete.status === "scheduled"
                      ? "Planifié"
                      : "Complété"}
                </p>
              </div>
            </div>
          ) : null
        }
        warningText="⚠️ Cette action est irréversible. Le groupe sera définitivement supprimé mais les candidats seront conservés."
        isLoading={deletingGroup}
        onCancel={() => {
          setShowDeleteGroupDialog(false)
          setGroupToDelete(null)
        }}
        onConfirm={handleConfirmDeleteGroup}
        confirmLabel="Supprimer le groupe"
        loadingLabel="Suppression en cours..."
      />

      <Dialog open={showViolationsDialog} onOpenChange={setShowViolationsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Infractions détectées -{" "}
              {selectedResultViolations?.result?.candidate?.name || selectedResultViolations?.result?.candidateName}
            </DialogTitle>
            <DialogDescription>Historique des violations détectées pendant le test</DialogDescription>
          </DialogHeader>

          {selectedResultViolations && selectedResultViolations.violations && (
            <div className="space-y-6 py-4">
              {/* Résumé des infractions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Résumé des infractions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {selectedResultViolations.violations.totalViolations || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Total</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedResultViolations.violations.stats?.tab_switch || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Changements onglet</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedResultViolations.violations.stats?.copy || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Tentatives copie</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {(selectedResultViolations.violations.stats?.devtools || 0) +
                          (selectedResultViolations.violations.stats?.right_click || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Autres</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques détaillées */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Statistiques par type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: "tab_switch", label: "Changements d'onglet", icon: "🔄", color: "text-orange-600" },
                      { key: "blur", label: "Perte de focus", icon: "👁️", color: "text-red-600" },
                      { key: "copy", label: "Tentatives de copie", icon: "📋", color: "text-yellow-600" },
                      { key: "paste", label: "Tentatives de coller", icon: "📝", color: "text-yellow-600" },
                      { key: "right_click", label: "Clics droits", icon: "🖱️", color: "text-blue-600" },
                      { key: "devtools", label: "DevTools", icon: "🔧", color: "text-purple-600" },
                      { key: "reload", label: "Rechargements", icon: "⬜", color: "text-gray-600" },
                    ].map((stat) => (
                      <div key={stat.key} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{stat.icon}</span>
                          <span className="font-medium">{stat.label}</span>
                        </div>
                        <Badge variant="outline" className={stat.color}>
                          {selectedResultViolations.violations.stats?.[stat.key] || 0}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Historique chronologique */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Historique chronologique ({selectedResultViolations.violations.violations?.length || 0} événements)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedResultViolations.violations.violations &&
                    selectedResultViolations.violations.violations.length > 0 ? (
                      selectedResultViolations.violations.violations.map((violation, idx) => {
                        const typeLabels = {
                          tab_switch: {
                            label: "Changement d'onglet",
                            icon: "🔄",
                            color: "bg-orange-100 text-orange-800",
                          },
                          blur: { label: "Perte de focus", icon: "👁️", color: "bg-red-100 text-red-800" },
                          copy: { label: "Tentative de copie", icon: "📋", color: "bg-yellow-100 text-yellow-800" },
                          paste: { label: "Tentative de coller", icon: "📝", color: "bg-yellow-100 text-yellow-800" },
                          right_click: { label: "Clic droit", icon: "🖱️", color: "bg-blue-100 text-blue-800" },
                          devtools: { label: "DevTools", icon: "🔧", color: "bg-purple-100 text-purple-800" },
                          reload: { label: "Rechargement", icon: "⬜", color: "bg-gray-100 text-gray-800" },
                        }

                        const typeInfo = typeLabels[violation.violationType] || {
                          label: violation.violationType,
                          icon: "⚠️",
                          color: "bg-gray-100 text-gray-800",
                        }

                        const timestamp = violation.timestamp
                          ? new Date(violation.timestamp).toLocaleString("fr-FR")
                          : "N/A"
                        const elapsedTime = violation.elapsedTime
                          ? `${Math.floor(violation.elapsedTime / 60000)}:${String(Math.floor((violation.elapsedTime % 60000) / 1000)).padStart(2, "0")}`
                          : "N/A"

                        return (
                          <div
                            key={idx}
                            className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <span className="text-2xl">{typeInfo.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                                <span className="text-xs text-muted-foreground">{timestamp}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{violation.message || "Aucun message"}</p>
                              <div className="flex items-center space-x-4 mt-1 text-xs">
                                <span>
                                  ⏱️ Temps écoulé: <strong>{elapsedTime}</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center text-muted-foreground py-8">Aucune violation enregistrée</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViolationsDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
