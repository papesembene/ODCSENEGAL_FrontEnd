import { toast } from "sonner"
import { getAdminAuthHeaders } from "@/app/utils/admin-auth"
import { API_BASE_URL } from "../constants"
import { createInitialGroup, createInitialInvitationDetails } from "../helpers"

export function createGroupHandlers({
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
}) {
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

      const response = await fetch(`${API_BASE_URL}/api/admin/test-groups`, {
        method: "POST",
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          ...newGroup,
          candidate_ids: selectedCandidatesForGroup,
          created_by: localStorage.getItem("admin_email"),
          test_date: `${newGroup.test_date}T${newGroup.test_time}:00`,
        }),
      })
      const result = await response.json()

      if (!result.success) {
        toast.error(result.error || "Erreur création groupe")
        return
      }

      toast.success("Groupe créé !")
      setShowCreateGroupDialog(false)
      fetchTestGroups()
      setNewGroup(createInitialGroup())
      setSelectedCandidatesForGroup([])
    } catch {
      toast.error("Erreur création groupe")
    }
  }

  const handleOpenInvitationDialog = (group) => {
    setSelectedGroupForInvitation(group)

    let testDate = ""
    let testTime = ""
    if (group.test_date) {
      const [datePart, timePart] = group.test_date.split("T")
      testDate = datePart
      testTime = timePart ? timePart.substring(0, 5) : ""
    }

    setInvitationDetails({
      ...createInitialInvitationDetails(),
      duration: group.duration || 60,
      instructions: group.instructions || "",
      location: group.location || "En ligne",
      test_date: testDate,
      test_id: group.test_id || "",
      test_time: testTime,
    })

    if (group.test_id) {
      const selectedTest = testsData.find((test) => test.id === group.test_id)
      if (selectedTest) {
        setInvitationDetails((previous) => ({
          ...previous,
          duration: selectedTest.duration || 60,
          test_date: selectedTest.scheduledDate || testDate,
          test_time: selectedTest.scheduledTime || testTime,
        }))
      }
    }

    setShowSendInvitationDialog(true)
  }

  const handleTestSelection = (testId) => {
    const selectedTest = testsData.find((test) => test.id === testId)
    if (!selectedTest) {
      setInvitationDetails((previous) => ({ ...previous, test_id: testId }))
      return
    }

    setInvitationDetails((previous) => ({
      ...previous,
      duration: selectedTest.duration || 60,
      test_date: selectedTest.scheduledDate || "",
      test_id: testId,
      test_time: selectedTest.scheduledTime || "",
    }))
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
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ...invitationDetails, test_date: testDateTime }),
      })

      if (!(await updateResponse.json()).success) {
        toast.error("Erreur mise à jour groupe")
        return
      }

      const sendResponse = await fetch(
        `${API_BASE_URL}/api/admin/test-groups/${selectedGroupForInvitation.id}/send-invitations`,
        {
          method: "POST",
          headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
        },
      )
      const sendResult = await sendResponse.json()

      if (sendResult.success) {
        toast.success(sendResult.message || `Invitations envoyées à ${sendResult.data?.sent || 0} candidats`)
      } else if (sendResponse.status === 207) {
        toast.warning(sendResult.message || `Invitations partiellement envoyées : ${sendResult.data?.sent || 0} succès`)
      } else {
        toast.error(sendResult.error || sendResult.message || "Erreur d'envoi")
      }

      if (sendResponse.ok) {
        setShowSendInvitationDialog(false)
      }
      fetchTestGroups()
    } catch {
      toast.error("Erreur invitations")
    } finally {
      setSendingInvitations(false)
    }
  }

  const handleDeleteGroupClick = (group) => {
    setGroupToDelete(group)
    setShowDeleteGroupDialog(true)
  }

  const handleConfirmDeleteGroup = async (groupToDelete) => {
    if (!groupToDelete) return
    setDeletingGroup(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/test-groups/${groupToDelete.id}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      })
      if ((await response.json()).success) {
        toast.success(`Groupe "${groupToDelete.name}" supprimé`)
        fetchTestGroups()
        setTimeout(() => {
          setShowDeleteGroupDialog(false)
          setGroupToDelete(null)
          setDeletingGroup(false)
        }, 500)
      } else {
        setDeletingGroup(false)
      }
    } catch {
      setDeletingGroup(false)
    }
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

      const response = await fetch(`${API_BASE_URL}/api/admin/candidatures`, {
        headers: getAdminAuthHeaders(),
      })
      const result = await response.json()
      if (result.success) {
        setGroupCandidatesDetails(result.data.filter((candidate) => candidateIds.includes(candidate.id)))
      }
    } catch {
      toast.error("Erreur chargement candidats")
    } finally {
      setLoadingGroupCandidates(false)
    }
  }

  const handleSelectCandidateForGroup = (candidateId) => {
    if (assignedCandidateIds.includes(candidateId)) {
      toast.error("Déjà assigné")
      return
    }

    setSelectedCandidatesForGroup((previous) =>
      previous.includes(candidateId) ? previous.filter((id) => id !== candidateId) : [...previous, candidateId],
    )
  }

  const handleCancelCreateGroup = () => {
    setShowCreateGroupDialog(false)
    setNewGroup(createInitialGroup())
    setSelectedCandidatesForGroup([])
  }

  return {
    handleCancelCreateGroup,
    handleConfirmAndSendInvitations,
    handleConfirmDeleteGroup,
    handleCreateGroup,
    handleDeleteGroupClick,
    handleOpenInvitationDialog,
    handleSelectCandidateForGroup,
    handleTestSelection,
    handleViewGroupCandidates,
  }
}
