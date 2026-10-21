import { toast } from "sonner"
import { getAdminAuthHeaders } from "@/app/utils/admin-auth"
import { fetchJsonWithTimeout } from "@/app/utils/fetchWithTimeout"
import { API_BASE_URL } from "../constants"
import {
  createInitialQuestion,
  createInitialTest,
  getTestUrl,
  parseImportedResultsCsv,
} from "../helpers"

export function createTestHandlers({
  editingTest,
  fetchTests,
  newTest,
  setCurrentQuestion,
  setEditingTest,
  setNewTest,
  setShowCreateDialog,
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
            const response = await fetch(`${API_BASE_URL}/api/admin/tests/results/import`, {
              method: "POST",
              headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
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

      const result = await fetchJsonWithTimeout(url, {
        method,
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(testData),
        timeout: 30000,
        retries: 1,
        retryDelay: 1000,
      })

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
      toast.error(error.message || "Erreur lors de la sauvegarde du test")
    }
  }

  const handleToggleTestStatus = async (testId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "scheduled" : "active"

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/tests/${testId}`, {
        method: "PATCH",
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()
      if (response.ok && result.success) {
        toast.success(`Test ${newStatus === "active" ? "activé" : "désactivé"}`)
        fetchTests()
      } else {
        toast.error(result.error || "Erreur statut")
      }
    } catch {
      toast.error("Erreur statut")
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
    handleImportResultsFromExcel,
    handleOpenTest,
    handleToggleTestStatus,
  }
}
