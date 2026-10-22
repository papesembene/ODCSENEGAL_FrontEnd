"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import odcFormations from "@/data/odcFormations"
import { FORMATION_MAPPING } from "../dashboard-config"
import { calculateAge } from "../dashboard-utils"
import useCandidateDirectory from "./use-candidate-directory"

export default function useCompetencesAdminDashboard() {
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showFormationCandidatesDialog, setShowFormationCandidatesDialog] = useState(false)
  const [selectedFormationData, setSelectedFormationData] = useState(null)
  const [formationCandidates, setFormationCandidates] = useState([])
  const [eligibleCandidates, setEligibleCandidates] = useState([])
  const [ineligibleCandidates, setIneligibleCandidates] = useState([])
  const [assignedCandidateIds, setAssignedCandidateIds] = useState([])
  const [candidateToGroupMap, setCandidateToGroupMap] = useState({})
  const [showAutoGroupDialog, setShowAutoGroupDialog] = useState(false)
  const [groupSize, setGroupSize] = useState(50)
  const [creatingGroups, setCreatingGroups] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" })
  const [daysRange, setDaysRange] = useState(7)
  const [eligiblePage, setEligiblePage] = useState(1)
  const [eligibleItemsPerPage, setEligibleItemsPerPage] = useState(20)
  const detailRequest = useRef(0)
  const formationRequest = useRef(0)

  const { candidatures, testGroups: testGroupsApi } = useAdminApi()
  const directory = useCandidateDirectory(candidatures, daysRange, activeTab === "candidates")
  const { stats, formationStats, fetchCandidates } = directory

  const fetchAssignedCandidates = useCallback(async () => {
    try {
      const result = await testGroupsApi.getAll()

      if (result.success) {
        const groups = result.data || []
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
      }
    } catch (fetchError) {
      console.error("Erreur lors de la récupération des groupes:", fetchError)
    }
  }, [testGroupsApi])

  const genderData = useMemo(
    () => [
      { name: "Femmes", value: stats.femmes },
      { name: "Hommes", value: stats.hommes },
    ],
    [stats.femmes, stats.hommes],
  )

  const statusData = useMemo(
    () => [
      { name: "Accepté", value: stats.acceptes },
      { name: "En attente", value: stats.enAttente },
      { name: "Refusé", value: stats.refuses },
    ],
    [stats.acceptes, stats.enAttente, stats.refuses],
  )

  const formationData = useMemo(
    () =>
      odcFormations
        .map((formation) => {
          const desiredTrainingValue = FORMATION_MAPPING[formation.title]
          if (!desiredTrainingValue) return null

          return {
            id: formation.id,
            name: formation.title,
            shortName: desiredTrainingValue,
            description: formation.description,
            duration: formation.duration,
            level: formation.level,
            total: 0, femmes: 0, hommes: 0, enAttente: 0, acceptes: 0, refuses: 0,
            ...formationStats[desiredTrainingValue],
          }
        })
        .filter(Boolean),
    [formationStats],
  )

  const viewCandidateDetails = useCallback(async (candidate) => {
    const request = ++detailRequest.current
    try {
      const result = await candidatures.get(candidate.id)
      if (!result.success) throw new Error("Fiche indisponible")
      if (request === detailRequest.current) setSelectedCandidate(result.data)
    } catch {
      if (request === detailRequest.current) toast.error("Impossible de charger la fiche du candidat")
    }
  }, [candidatures])

  const closeCandidateDetails = useCallback(() => {
    detailRequest.current++
    setSelectedCandidate(null)
  }, [])

  const handleCreateAutoGroups = useCallback(async () => {
    if (groupSize < 1 || groupSize > 1000) {
      alert("Le nombre de personnes par groupe doit être entre 1 et 1000")
      return
    }

    const nonAssignedCandidates = eligibleCandidates.filter((candidate) => !assignedCandidateIds.includes(candidate.id))

    if (nonAssignedCandidates.length === 0) {
      toast.error("Aucun candidat éligible disponible (tous sont déjà assignés à des groupes)")
      return
    }

    if (eligibleCandidates.length > nonAssignedCandidates.length) {
      toast.info(`${eligibleCandidates.length - nonAssignedCandidates.length} candidat(s) déjà assigné(s) seront exclus`)
    }

    setCreatingGroups(true)

    try {
      const existingGroupsResult = await testGroupsApi.getAll(selectedFormationData.shortName)
      const existingGroups = existingGroupsResult.success ? existingGroupsResult.data || [] : []

      let maxGroupNumber = 0
      existingGroups.forEach((group) => {
        const match = group.name.match(/Groupe (\d+)/)
        if (match) {
          const groupNum = parseInt(match[1])
          if (groupNum > maxGroupNumber) {
            maxGroupNumber = groupNum
          }
        }
      })

      const numberOfGroups = Math.ceil(nonAssignedCandidates.length / groupSize)
      const groups = []
      const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })

      for (let i = 0; i < numberOfGroups; i++) {
        const start = i * groupSize
        const end = Math.min(start + groupSize, nonAssignedCandidates.length)
        const groupCandidates = nonAssignedCandidates.slice(start, end)
        const groupNumber = maxGroupNumber + i + 1

        groups.push({
          name: `${selectedFormationData.name} - Groupe ${groupNumber} (${dateStr})`,
          formation: selectedFormationData.shortName,
          test_id: "",
          test_date: new Date().toISOString(),
          duration: 60,
          candidate_ids: groupCandidates.map((candidate) => candidate.id),
          location: "En ligne",
          instructions: `Groupe créé le ${dateStr} avec ${groupCandidates.length} candidat(s) pour la formation ${selectedFormationData.name}`,
          created_by: localStorage.getItem("admin_email"),
        })
      }

      const createdGroups = []
      const failedGroups = []

      for (const group of groups) {
        try {
          const result = await testGroupsApi.create(group)
          if (result.success) {
            createdGroups.push({ name: group.name, count: group.candidate_ids.length })
          } else {
            failedGroups.push(group.name)
          }
        } catch {
          failedGroups.push(group.name)
        }
      }

      setShowAutoGroupDialog(false)
      await fetchAssignedCandidates()

      if (failedGroups.length === 0) {
        setSuccessMessage({
          title: "✅ Groupes créés avec succès !",
          message: `${createdGroups.length} groupe(s) créé(s)\n${nonAssignedCandidates.length} candidat(s) réparti(s)\n${groupSize} personne(s) par groupe\n\nRendez-vous dans Admin > Compétences > Tests en ligne > Onglet "Groupes"`,
        })
      } else {
        setSuccessMessage({
          title: "⚠️ Création partielle",
          message: `${createdGroups.length} groupe(s) créé(s)\n${failedGroups.length} échec(s)\n\nVérifiez la console pour plus de détails.`,
        })
      }

      setShowSuccessModal(true)
      setTimeout(() => {
        setShowFormationCandidatesDialog(false)
      }, 500)
    } catch (creationError) {
      console.error("Erreur:", creationError)
      toast.error("Erreur lors de la création automatique des groupes")
    } finally {
      setCreatingGroups(false)
    }
  }, [
    assignedCandidateIds,
    eligibleCandidates,
    fetchAssignedCandidates,
    groupSize,
    selectedFormationData,
    testGroupsApi,
  ])

  const handleManageCandidates = useCallback(async (formation) => {
    const request = ++formationRequest.current
    let candidates
    try {
      const [result] = await Promise.all([
        candidatures.getAll({ desired_training: formation.shortName }),
        fetchAssignedCandidates(),
      ])
      if (!result.success) throw new Error("Candidats indisponibles")
      if (request !== formationRequest.current) return
      candidates = result.data || []
    } catch {
      if (request === formationRequest.current) toast.error("Impossible de charger les candidats de cette formation")
      return
    }
    const eligible = []
    const ineligible = []

    candidates.forEach((candidate) => {
      const age = calculateAge(candidate.date_of_birth)
      if (age !== null) {
        if (age < 30) {
          eligible.push({ ...candidate, age })
        } else {
          ineligible.push({ ...candidate, age })
        }
      } else {
        ineligible.push({ ...candidate, age: "N/A" })
      }
    })

    setSelectedFormationData(formation)
    setFormationCandidates(candidates)
    setEligibleCandidates(eligible)
    setIneligibleCandidates(ineligible)
    setEligiblePage(1)
    setShowFormationCandidatesDialog(true)
  }, [candidatures, fetchAssignedCandidates])

  const updateCandidateStatus = useCallback(
    async (id, newStatus) => {
      try {
        const result = await candidatures.update(id, { status: newStatus })

        if (result.success) {
          toast.success("Statut mis à jour avec succès !")
          await fetchCandidates()
          setSelectedCandidate(null)
        } else {
          toast.error("Erreur lors de la mise à jour du statut")
        }
      } catch (updateError) {
        console.error("Erreur lors de la mise à jour du statut:", updateError)
        toast.error("Erreur lors de la mise à jour du statut")
      }
    },
    [candidatures, fetchCandidates],
  )

  return {
    ...directory,
    selectedCandidate,
    activeTab,
    setActiveTab,
    showFormationCandidatesDialog,
    setShowFormationCandidatesDialog,
    selectedFormationData,
    formationCandidates,
    eligibleCandidates,
    ineligibleCandidates,
    assignedCandidateIds,
    candidateToGroupMap,
    showAutoGroupDialog,
    setShowAutoGroupDialog,
    groupSize,
    setGroupSize,
    creatingGroups,
    showSuccessModal,
    setShowSuccessModal,
    successMessage,
    daysRange,
    setDaysRange,
    eligiblePage,
    setEligiblePage,
    eligibleItemsPerPage,
    setEligibleItemsPerPage,
    genderData,
    statusData,
    formationData,
    viewCandidateDetails,
    closeCandidateDetails,
    handleCreateAutoGroups,
    handleManageCandidates,
    updateCandidateStatus,
  }
}
