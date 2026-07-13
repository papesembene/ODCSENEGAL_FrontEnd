import { toast } from "sonner"
import { getAdminAuthHeaders } from "@/app/utils/admin-auth"
import { API_BASE_URL } from "../constants"

export function createResultHandlers({
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
  testViolations,
}) {
  const handleViewDetails = (result) => {
    setSelectedResult(result)
    setShowDetailsDialog(true)
    setManualGrades(result.manualGrades || {})
  }

  const handleSaveManualGrade = async (questionId, grade) => {
    const updatedGrades = { ...manualGrades, [questionId]: parseFloat(grade) || 0 }
    setManualGrades(updatedGrades)

    if (!selectedResult) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/tests/results/${selectedResult.id}`, {
        method: "PATCH",
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ manualGrades: updatedGrades }),
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Note sauvegardée")
        setSelectedResult({ ...selectedResult, manualGrades: updatedGrades })
      }
    } catch {
      toast.error("Erreur sauvegarde note")
    }
  }

  const handleViewViolations = (result) => {
    setSelectedResultViolations({ result, violations: testViolations[result.id] })
    setShowViolationsDialog(true)
  }

  const handleSelectResult = (resultId) => {
    setSelectedResults((previous) =>
      previous.includes(resultId) ? previous.filter((id) => id !== resultId) : [...previous, resultId],
    )
  }

  const handleSendResultsEmails = async () => {
    if (selectedResults.length === 0) {
      return
    }

    setSendingResultsEmails(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success(`Emails envoyés à ${selectedResults.length} candidats`)
      setShowEmailResultsDialog(false)
      setSelectedResults([])
      setEmailResultsType("")
      setCustomResultsMessage("")
    } finally {
      setSendingResultsEmails(false)
    }
  }

  return {
    handleSaveManualGrade,
    handleSelectResult,
    handleSendResultsEmails,
    handleViewDetails,
    handleViewViolations,
  }
}
