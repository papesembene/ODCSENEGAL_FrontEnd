import { toast } from "sonner"
import { API_BASE_URL, CANDIDATES_LIST } from "../constants"
import {
  buildResultsCsvContent,
  createInitialEmailData,
  createInitialQuestion,
  createInitialTest,
  getTestUrl,
  parseImportedResultsCsv,
} from "../helpers"

export function createTestHandlers({
  editingTest,
  fetchTests,
  newTest,
  selectedTest,
  setCurrentQuestion,
  setEditingTest,
  setEmailData,
  setNewTest,
  setShowCreateDialog,
  setShowEmailDialog,
  setShowImportResultsDialog,
}) {
  const handleImportResultsFromExcel = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (loadEvent) => {
      try {
        toast.success(`Fichier ${file.name} importé. Traitement en cours...`)
        const importedResults = parseImportedResultsCsv(loadEvent.target.result)
        let successCount = 0
        let errorCount = 0

        for (const result of importedResults) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/admin/tests/results`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(result),
            })
            if (response.ok) successCount += 1
            else errorCount += 1
          } catch {
            errorCount += 1
          }
        }

        fetchTests()
        toast.success(`${successCount} résultat(s) importé(s). ${errorCount} échec(s).`)
        setShowImportResultsDialog(false)
      } catch (error) {
        console.error("Erreur d'import:", error)
        toast.error("Erreur lors de l'import")
      }
    }

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file)
    } else {
      toast.error("Veuillez sélectionner un fichier CSV")
    }
  }

  const handleExportResults = (format, testResults) => {
    try {
      if (format === "csv") {
        const csvContent = buildResultsCsvContent(testResults)
        const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" })
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

      if (!result.success) {
        toast.error(result.error || "Erreur lors de la sauvegarde")
        return
      }

      toast.success(editingTest ? "Test modifié !" : "Test créé !")
      setEditingTest(null)
      setShowCreateDialog(false)
      fetchTests()
      setNewTest(createInitialTest())
      setCurrentQuestion(createInitialQuestion())
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la sauvegarde du test")
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

      if ((await response.json()).success) {
        toast.success(`Test ${newStatus === "active" ? "activé" : "désactivé"}`)
        fetchTests()
      }
    } catch {
      toast.error("Erreur statut")
    }
  }

  const handleSendEmails = async (emailData) => {
    try {
      const selectedCandidatesData = CANDIDATES_LIST.filter((candidate) => emailData.selectedCandidates.includes(candidate.id))
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

      if ((await response.json()).success) {
        toast.success("Emails envoyés !")
      } else {
        toast.success("Email envoyé ! (simulation)")
      }
    } catch {
      toast.success("Email envoyé ! (simulation)")
    } finally {
      setShowEmailDialog(false)
      setEmailData(createInitialEmailData())
    }
  }

  const handleCopyTestLink = (testId) => {
    navigator.clipboard.writeText(getTestUrl(testId)).then(() => toast.success("Lien copié !"))
  }

  const handleOpenTest = (testId) => window.open(getTestUrl(testId), "_blank")

  return {
    handleCopyTestLink,
    handleCreateTest,
    handleEditTest,
    handleExportResults,
    handleImportResultsFromExcel,
    handleOpenTest,
    handleSendEmails,
    handleToggleTestStatus,
  }
}
