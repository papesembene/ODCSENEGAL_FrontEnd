"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import odcFormations from "@/data/odcFormations"
import { FORMATION_MAPPING } from "../dashboard-config"
import { calculateAge } from "../dashboard-utils"

export default function useCompetencesAdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFormation, setSelectedFormation] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedGender, setSelectedGender] = useState("all")
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [candidatesData, setCandidatesData] = useState([])
  const [filteredCandidates, setFilteredCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
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
  const [candidatesMainPage, setCandidatesMainPage] = useState(1)
  const [candidatesMainItemsPerPage, setCandidatesMainItemsPerPage] = useState(20)
  const [stats, setStats] = useState({
    total: 0,
    femmes: 0,
    hommes: 0,
    acceptes: 0,
    enAttente: 0,
    refuses: 0,
  })

  const { candidatures, testGroups: testGroupsApi } = useAdminApi()

  const fetchCandidates = useCallback(async () => {
    try {
      setRefreshing(true)
      setError(null)

      const result = await candidatures.getAll()

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la récupération des données")
      }

      const candidates = result.data || []
      setCandidatesData(candidates)
      setStats({
        total: candidates.length,
        femmes: candidates.filter((c) => {
          const gender = (c.gender || "").toLowerCase().trim()
          return ["femme", "f", "female", "féminin"].includes(gender)
        }).length,
        hommes: candidates.filter((c) => {
          const gender = (c.gender || "").toLowerCase().trim()
          return ["homme", "h", "male", "m", "masculin"].includes(gender)
        }).length,
        acceptes: candidates.filter((c) => (c.status || "pending") === "accepted").length,
        enAttente: candidates.filter((c) => {
          const status = c.status || "pending"
          return status === "pending" || !status || status === ""
        }).length,
        refuses: candidates.filter((c) => (c.status || "pending") === "rejected").length,
      })
    } catch (fetchError) {
      console.error("Erreur lors de la récupération des candidatures:", fetchError)
      setError(fetchError.message)
      if (candidatesData.length === 0) {
        setCandidatesData([])
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [candidatures, candidatesData.length])

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

  useEffect(() => {
    fetchCandidates()
    fetchAssignedCandidates()

    const interval = setInterval(fetchCandidates, 60000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const filtered = candidatesData.filter((candidate) => {
      const matchesSearch =
        searchTerm === "" ||
        candidate.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.nationality && candidate.nationality.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (candidate.pays && candidate.pays.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (candidate.country && candidate.country.toString().toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesFormation = selectedFormation === "all" || candidate.desired_training === selectedFormation
      const matchesStatus = selectedStatus === "all" || candidate.status === selectedStatus
      const matchesGender = selectedGender === "all" || candidate.gender === selectedGender

      return matchesSearch && matchesFormation && matchesStatus && matchesGender
    })

    setFilteredCandidates(filtered)
  }, [searchTerm, selectedFormation, selectedStatus, selectedGender, candidatesData])

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

          const candidatesForFormation = candidatesData.filter((candidate) => candidate.desired_training === desiredTrainingValue)

          return {
            id: formation.id,
            name: formation.title,
            shortName: desiredTrainingValue,
            description: formation.description,
            duration: formation.duration,
            level: formation.level,
            total: candidatesForFormation.length,
            femmes: candidatesForFormation.filter((c) => {
              const gender = (c.gender || "").toLowerCase().trim()
              return ["femme", "f", "female", "féminin"].includes(gender)
            }).length,
            hommes: candidatesForFormation.filter((c) => {
              const gender = (c.gender || "").toLowerCase().trim()
              return ["homme", "h", "male", "m", "masculin"].includes(gender)
            }).length,
            enAttente: candidatesForFormation.filter((c) => {
              const status = c.status || "pending"
              return status === "pending" || !status || status === ""
            }).length,
            acceptes: candidatesForFormation.filter((c) => (c.status || "pending") === "accepted").length,
            refuses: candidatesForFormation.filter((c) => (c.status || "pending") === "rejected").length,
          }
        })
        .filter(Boolean),
    [candidatesData],
  )

  const dailyApplicationsData = useMemo(() => {
    const days = []
    const now = new Date()

    for (let i = daysRange - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const dateStr = `${day}/${month}`

      const count = candidatesData.filter((candidate) => {
        const appDate = candidate.application_date || candidate.created_at
        if (!appDate) return false

        try {
          const candidateDate = new Date(appDate)
          return (
            candidateDate.getDate() === date.getDate() &&
            candidateDate.getMonth() === date.getMonth() &&
            candidateDate.getFullYear() === date.getFullYear()
          )
        } catch {
          return appDate.toString().includes(`${date.getFullYear()}-${month}-${day}`) || appDate.toString().includes(`${day}/${month}`)
        }
      }).length

      days.push({ date: dateStr, applications: count })
    }

    return days
  }, [candidatesData, daysRange])

  const nationalityData = useMemo(() => {
    const counts = {}
    candidatesData.forEach((candidate) => {
      const raw = (candidate.nationality || candidate.pays || candidate.country || "").toString().trim()
      if (!raw) return
      const name = raw.charAt(0).toUpperCase() + raw.slice(1)
      counts[name] = (counts[name] || 0) + 1
    })

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [candidatesData])

  const handleExportCSV = useCallback(() => {
    downloadCSV(filteredCandidates, "candidats-competences.csv")
  }, [filteredCandidates])

  const handleExportExcel = useCallback(() => {
    downloadExcel(filteredCandidates, "candidats-competences.xlsx")
  }, [filteredCandidates])

  const viewCandidateDetails = useCallback((candidate) => {
    setSelectedCandidate(candidate)
  }, [])

  const closeCandidateDetails = useCallback(() => {
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

  const handleManageCandidates = useCallback((formation) => {
    const candidates = candidatesData.filter((candidate) => candidate.desired_training === formation.shortName)
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
  }, [candidatesData])

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
    searchTerm,
    setSearchTerm,
    selectedFormation,
    setSelectedFormation,
    selectedStatus,
    setSelectedStatus,
    selectedGender,
    setSelectedGender,
    selectedCandidate,
    filteredCandidates,
    candidatesData,
    loading,
    error,
    refreshing,
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
    candidatesMainPage,
    setCandidatesMainPage,
    candidatesMainItemsPerPage,
    setCandidatesMainItemsPerPage,
    stats,
    fetchCandidates,
    genderData,
    statusData,
    formationData,
    dailyApplicationsData,
    nationalityData,
    handleExportCSV,
    handleExportExcel,
    viewCandidateDetails,
    closeCandidateDetails,
    handleCreateAutoGroups,
    handleManageCandidates,
    updateCandidateStatus,
  }
}
