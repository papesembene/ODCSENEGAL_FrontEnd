import { toast } from "sonner"
import { getAdminAuthHeaders } from "@/app/utils/admin-auth"
import { fetchJsonWithTimeout } from "@/app/utils/fetchWithTimeout"
import { API_BASE_URL } from "../constants"

export function createResultHandlers({
  resultRequestRef,
  manualGrades,
  selectedResult,
  selectedResults,
  emailResultsType,
  customResultsMessage,
  setResultEmailBatchId,
  setManualGrades,
  setSelectedResult,
  setSelectedResultViolations,
  setSelectedResults,
  setSendingResultsEmails,
  setShowDetailsDialog,
  setShowViolationsDialog,
}) {
  const handleViewDetails = async (result) => {
    const id = ++resultRequestRef.current
    toast.loading("Chargement des réponses...", { id: "result-details" })
    try {
      const response = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/results/${result.id}`, { retries: 0 })
      if (id !== resultRequestRef.current) return
      if (!response.success || !response.data) throw new Error()
      setSelectedResult(response.data)
      setManualGrades(response.data.manualGrades || {})
      setShowDetailsDialog(true)
    } catch {
      if (id === resultRequestRef.current) toast.error("Impossible de charger les réponses")
    } finally { if (id === resultRequestRef.current) toast.dismiss("result-details") }
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
      if (response.ok && result.success) {
        toast.success("Note sauvegardée")
        setSelectedResult({ ...selectedResult, manualGrades: updatedGrades })
      } else {
        throw new Error(result.error || "Erreur sauvegarde note")
      }
    } catch {
      toast.error("Erreur sauvegarde note")
    }
  }

  const handleViewViolations = async (result) => {
    const id = ++resultRequestRef.current
    toast.loading("Chargement des infractions...", { id: "result-details" })
    try {
      const email = encodeURIComponent(result.candidate?.email || result.candidateEmail)
      const response = await fetchJsonWithTimeout(`${API_BASE_URL}/api/admin/tests/${result.testId}/violations/${email}`, { retries: 0 })
      if (id !== resultRequestRef.current) return
      if (!response.success) throw new Error()
      setSelectedResultViolations({ result, violations: response.data })
      setShowViolationsDialog(true)
    } catch {
      if (id === resultRequestRef.current) toast.error("Impossible de charger les infractions")
    } finally { if (id === resultRequestRef.current) toast.dismiss("result-details") }
  }

  const handleSelectResult = (resultId) => {
    setSelectedResults((previous) =>
      previous.includes(resultId) ? previous.filter((id) => id !== resultId) : [...previous, resultId],
    )
  }

  const handleSendResultsEmails = async () => {
    if (selectedResults.length === 0 || selectedResults.length > 500) {
      toast.error("Sélectionnez entre 1 et 500 résultats par envoi")
      return
    }

    setSendingResultsEmails(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/tests/send-emails`, {
        method: "POST",
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ resultIds: selectedResults, emailType: emailResultsType, customMessage: customResultsMessage }),
      })
      const result = await response.json()
      if (!response.ok || !result.success || !result.data?.batchId) {
        throw new Error(result.error || "Impossible de programmer les emails")
      }
      setResultEmailBatchId(result.data.batchId)
      toast.info("Emails placés en file d'attente. Consultez le suivi des envois.")
    } catch (error) {
      toast.error(error.message || "Impossible de programmer les emails")
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
