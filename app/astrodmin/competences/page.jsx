"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAdminApi } from "@/app/hooks/useAdminApi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Download,
  MoreHorizontal,
  Search,
  Users,
  UserPlus,
  FileText,
  TrendingUp,
  ChevronDown,
  Mail,
  Phone,
  Eye,
  Edit,
  UserCheck,
  UserX,
  FileSpreadsheet,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

import { downloadCSV, downloadExcel, downloadPDF } from "@/app/utils/export-utils"
import odcFormations from "@/data/odcFormations"

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]


// Mapping entre les titres de formations ODC et les valeurs de desired_training (IDs du formulaire)
const FORMATION_MAPPING = {
  "Développement Web / Web Mobile": "dev-web-mobile",
  "Développement Data & IA": "dev-data",
  "Référent Digital": "referent-digital",
  "Assistante Digital (Hackeuse – 100% femmes)": "hackeuses",
  "AWS re/Start (Cloud Computing & DevOps)": "aws-cloud",
  "Intelligence Artificielle": "intelligence-artificielle",
  "Cybersécurité (100% en ligne pour professionnels)": "cyber-security"
}

export default function CompetencesAdminDashboard() {
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
  
  // États pour le Dialog de gestion des candidats par formation
  const [showFormationCandidatesDialog, setShowFormationCandidatesDialog] = useState(false)
  const [selectedFormationData, setSelectedFormationData] = useState(null)
  const [formationCandidates, setFormationCandidates] = useState([])
  const [eligibleCandidates, setEligibleCandidates] = useState([])
  const [ineligibleCandidates, setIneligibleCandidates] = useState([])
  const [selectedCandidatesForGroup, setSelectedCandidatesForGroup] = useState([])
  const [assignedCandidateIds, setAssignedCandidateIds] = useState([])
  const [candidateToGroupMap, setCandidateToGroupMap] = useState({})
  
  // États pour la création automatique de groupes
  const [showAutoGroupDialog, setShowAutoGroupDialog] = useState(false)
  const [groupSize, setGroupSize] = useState(50)
  const [creatingGroups, setCreatingGroups] = useState(false)
  const [autoGroupResults, setAutoGroupResults] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' })
  // Contrôle de période (7/14/30 jours)
  const [daysRange, setDaysRange] = useState(7)
  
  // États pour la pagination
  const [eligiblePage, setEligiblePage] = useState(1)
  const [eligibleItemsPerPage, setEligibleItemsPerPage] = useState(20)
  const [candidatesMainPage, setCandidatesMainPage] = useState(1)
  const [candidatesMainItemsPerPage, setCandidatesMainItemsPerPage] = useState(20)
  
  // États pour les modals de confirmation (candidatures)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showEmailCandidatesDialog, setShowEmailCandidatesDialog] = useState(false)
  const [selectedCandidatesForEmail, setSelectedCandidatesForEmail] = useState([])
  const [emailType, setEmailType] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [sendingEmails, setSendingEmails] = useState(false)
  
  const router = useRouter()
  const { candidatures, testGroups: testGroupsApi } = useAdminApi()

  // Statistiques calculées dynamiquement
  const [stats, setStats] = useState({
    total: 0,
    femmes: 0,
    hommes: 0,
    acceptes: 0,
    enAttente: 0,
    refuses: 0,
  })


  const fetchCandidates = useCallback(async () => {
    try {
      setRefreshing(true)
      setError(null)

      const result = await candidatures.getAll()

      if (result.success) {
        const candidates = result.data || []
        setCandidatesData(candidates)
        
        // Calculer les statistiques
        const newStats = {
          total: candidates.length,
          femmes: candidates.filter((c) => {
            const gender = (c.gender || '').toLowerCase().trim()
            return ['femme', 'f', 'female', 'féminin'].includes(gender)
          }).length,
          hommes: candidates.filter((c) => {
            const gender = (c.gender || '').toLowerCase().trim()
            return ['homme', 'h', 'male', 'm', 'masculin'].includes(gender)
          }).length,
          acceptes: candidates.filter((c) => (c.status || 'pending') === "accepted").length,
          enAttente: candidates.filter((c) => {
            const status = c.status || 'pending'
            return status === "pending" || !status || status === ""
          }).length,
          refuses: candidates.filter((c) => (c.status || 'pending') === "rejected").length,
        }
        setStats(newStats)
      } else {
        throw new Error(result.error || "Erreur lors de la récupération des données")
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des candidatures:", error)
      setError(error.message)
      if (candidatesData.length === 0) {
        setCandidatesData([])
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [candidatures])

  const fetchAssignedCandidates = useCallback(async () => {
    try {
      const result = await testGroupsApi.getAll()
      
      if (result.success) {
        const groups = result.data || []
        const assignedIds = new Set()
        const candidateGroupMap = {}
        
        groups.forEach(group => {
          if (group.candidate_ids && Array.isArray(group.candidate_ids)) {
            group.candidate_ids.forEach(id => {
              assignedIds.add(id)
              candidateGroupMap[id] = group.name
            })
          }
        })
        
        setAssignedCandidateIds(Array.from(assignedIds))
        setCandidateToGroupMap(candidateGroupMap)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des groupes:", error)
    }
  }, [testGroupsApi])

  // Effect unique pour le chargement initial et l'intervalle
  useEffect(() => {
    fetchCandidates()
    fetchAssignedCandidates()

    const interval = setInterval(fetchCandidates, 60000)
    return () => clearInterval(interval)
    // On ne veut pas que cet effet dépende des fonctions pour éviter les boucles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filtrer les candidats
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Données pour les graphiques (calculées dynamiquement)
  const genderData = [
    { name: "Femmes", value: stats.femmes },
    { name: "Hommes", value: stats.hommes },
  ]

  const statusData = [
    { name: "Accepté", value: stats.acceptes },
    { name: "En attente", value: stats.enAttente },
    { name: "Refusé", value: stats.refuses },
  ]

  // Données par formation (calculées dynamiquement depuis odcFormations.js)
  const formationData = odcFormations
    .map((formation) => {
      const desiredTrainingValue = FORMATION_MAPPING[formation.title]
      
      // Ignorer les formations sans mapping
      if (!desiredTrainingValue) {
        console.warn(`⚠️ Formation "${formation.title}" n'a pas de mapping dans FORMATION_MAPPING`)
        return null
      }
      
      const candidatesForFormation = candidatesData.filter(
        (candidate) => candidate.desired_training === desiredTrainingValue
      )
      
      // Log pour debug (à retirer en production)
      if (candidatesForFormation.length > 0) {
        console.log(`✅ Formation "${formation.title}" (${desiredTrainingValue}): ${candidatesForFormation.length} candidat(s)`)
      }
      
      return {
        id: formation.id,
        name: formation.title,
        shortName: desiredTrainingValue,
        description: formation.description,
        duration: formation.duration,
        level: formation.level,
        total: candidatesForFormation.length,
        femmes: candidatesForFormation.filter((c) => {
          const gender = (c.gender || '').toLowerCase().trim()
          return ['femme', 'f', 'female', 'féminin'].includes(gender)
        }).length,
        hommes: candidatesForFormation.filter((c) => {
          const gender = (c.gender || '').toLowerCase().trim()
          return ['homme', 'h', 'male', 'm', 'masculin'].includes(gender)
        }).length,
        enAttente: candidatesForFormation.filter((c) => {
          const status = c.status || 'pending'
          return status === "pending" || !status || status === ""
        }).length,
        acceptes: candidatesForFormation.filter((c) => (c.status || 'pending') === "accepted").length,
        refuses: candidatesForFormation.filter((c) => (c.status || 'pending') === "rejected").length,
      }
    })
    .filter(formation => formation !== null) // Retirer les formations sans mapping

  // Données des candidatures quotidiennes (période dynamique)
  const dailyApplicationsData = (() => {
    const days = []
    const now = new Date()
    
    // Générer les N derniers jours
    for (let i = daysRange - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const dateStr = `${day}/${month}`
      
      // Compter les candidatures pour ce jour
      const count = candidatesData.filter((c) => {
        const appDate = c.application_date || c.created_at
        if (!appDate) return false
        
        try {
          const candidateDate = new Date(appDate)
          return candidateDate.getDate() === date.getDate() &&
                 candidateDate.getMonth() === date.getMonth() &&
                 candidateDate.getFullYear() === date.getFullYear()
        } catch {
          // Si la date n'est pas valide, vérifier si la chaîne contient la date
          return appDate.toString().includes(`${date.getFullYear()}-${month}-${day}`) ||
                 appDate.toString().includes(`${day}/${month}`)
        }
      }).length
      
      days.push({ date: dateStr, applications: count })
    }
    
    return days
  })()

  // Répartition par nationalité (toutes les nationalités)
  const nationalityData = (() => {
    const counts = {}
    candidatesData.forEach((c) => {
      const raw = (c.nationality || c.pays || c.country || "").toString().trim()
      if (!raw) return
      const name = raw.charAt(0).toUpperCase() + raw.slice(1)
      counts[name] = (counts[name] || 0) + 1
    })
    const arr = Object.entries(counts).map(([name, value]) => ({ name, value }))
    arr.sort((a, b) => b.value - a.value)
    return arr
  })()

  const handleExportCSV = () => {
    downloadCSV(filteredCandidates, "candidats-competences.csv")
  }

  const handleExportExcel = () => {
    downloadExcel(filteredCandidates, "candidats-competences.xlsx")
  }

  const handleExportPDF = () => {
    downloadPDF(filteredCandidates, "candidats-competences.pdf", "Liste des candidats - Compétences")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      case "interview":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "accepted":
        return "Accepté"
      case "rejected":
        return "Refusé"
      case "pending":
        return "En attente"
      case "interview":
        return "Entretien"
      default:
        return status
    }
  }

  const getGenderLabel = (gender) => {
    switch (gender) {
      case "female":
        return "Femme"
      case "male":
        return "Homme"
      default:
        return gender || "Non spécifié"
    }
  }

  const viewCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate)
  }

  const closeCandidateDetails = () => {
    setSelectedCandidate(null)
  }
  
  // Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }
  
  // Fonction pour créer un groupe de test avec les candidats sélectionnés
  const handleCreateTestGroup = async () => {
    if (selectedCandidatesForGroup.length === 0) {
      alert("Veuillez sélectionner au moins un candidat")
      return
    }
    if (selectedCandidatesForGroup.length > 1000) {
      alert("Maximum 1000 candidats par groupe")
      return
    }
    
    try {
      // Créer un nom de groupe automatique
      const groupNumber = Math.floor(Math.random() * 1000) + 1
      const groupName = `${selectedFormationData.name} - Groupe ${groupNumber}`
      
      // Préparer les données du groupe
      const groupData = {
        name: groupName,
        formation: selectedFormationData.shortName,
        test_id: "", // À associer plus tard à un test spécifique
        test_date: new Date().toISOString(), // Date par défaut (à modifier dans l'interface des groupes)
        duration: 60,
        candidate_ids: selectedCandidatesForGroup,
        location: "En ligne",
        instructions: `Groupe de test pour la formation ${selectedFormationData.name}`,
        created_by: localStorage.getItem("admin_email")
      }
      
      const result = await testGroupsApi.create(groupData)
      
      if (result.success) {
        // Réinitialiser la sélection
        setSelectedCandidatesForGroup([])
        
        // Actualiser la liste des candidats assignés
        await fetchAssignedCandidates()
        
        // Afficher le modal de succès
        setSuccessMessage({
          title: '✅ Groupe créé avec succès !',
          message: `Groupe "${groupName}"\n${selectedCandidatesForGroup.length} candidat(s) ajouté(s)\n\nRendez-vous dans Admin > Compétences > Tests en ligne > Onglet "Groupes" pour gérer ce groupe.`
        })
        setShowSuccessModal(true)
        
        // Fermer le dialog
        setTimeout(() => {
          setShowFormationCandidatesDialog(false)
        }, 500)
        
        // Optionnel : Ouvrir directement l'onglet Tests
        // router.push('/astrodmin/competences/tests')
      } else {
        toast.error(result.error || "Impossible de créer le groupe")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors de la création du groupe. Vérifiez que le backend est démarré.")
    }
  }
  
  // Fonction pour créer automatiquement plusieurs groupes
  const handleCreateAutoGroups = async () => {
    if (groupSize < 1 || groupSize > 1000) {
      alert("Le nombre de personnes par groupe doit être entre 1 et 1000")
      return
    }
    
    // Filtrer les candidats non assignés
    const nonAssignedCandidates = eligibleCandidates.filter(
      c => !assignedCandidateIds.includes(c.id)
    )
    
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
      const existingGroups = existingGroupsResult.success ? (existingGroupsResult.data || []) : []
      
      // Trouver le numéro de groupe le plus élevé existant
      let maxGroupNumber = 0
      existingGroups.forEach(group => {
        // Extraire le numéro du nom du groupe (ex: "Formation - Groupe 5 (24/10)" -> 5)
        const match = group.name.match(/Groupe (\d+)/)
        if (match) {
          const groupNum = parseInt(match[1])
          if (groupNum > maxGroupNumber) {
            maxGroupNumber = groupNum
          }
        }
      })
      
      // Répartir les candidats non assignés en groupes
      const numberOfGroups = Math.ceil(nonAssignedCandidates.length / groupSize)
      const groups = []
      
      // Générer un identifiant unique basé sur la date
      const timestamp = new Date().getTime()
      const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      
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
          candidate_ids: groupCandidates.map(c => c.id),
          location: "En ligne",
          instructions: `Groupe créé le ${dateStr} avec ${groupCandidates.length} candidat(s) pour la formation ${selectedFormationData.name}`,
          created_by: localStorage.getItem("admin_email")
        })
      }
      
      // Créer tous les groupes en parallèle
      const createdGroups = []
      const failedGroups = []
      
      for (const group of groups) {
        try {
          const result = await testGroupsApi.create(group)
          
          if (result.success) {
            createdGroups.push({
              name: group.name,
              count: group.candidate_ids.length
            })
          } else {
            failedGroups.push(group.name)
          }
        } catch (error) {
          failedGroups.push(group.name)
        }
      }
      
      // Afficher les résultats
      setAutoGroupResults({
        total: groups.length,
        created: createdGroups.length,
        failed: failedGroups.length,
        groups: createdGroups
      })
      
      setShowAutoGroupDialog(false)
      
      // Actualiser la liste des candidats assignés
      await fetchAssignedCandidates()
      
      // Afficher le modal de succès
      if (failedGroups.length === 0) {
        setSuccessMessage({
          title: '✅ Groupes créés avec succès !',
          message: `${createdGroups.length} groupe(s) créé(s)\n${nonAssignedCandidates.length} candidat(s) réparti(s)\n${groupSize} personne(s) par groupe\n\nRendez-vous dans Admin > Compétences > Tests en ligne > Onglet "Groupes"`
        })
      } else {
        setSuccessMessage({
          title: '⚠️ Création partielle',
          message: `${createdGroups.length} groupe(s) créé(s)\n${failedGroups.length} échec(s)\n\nVérifiez la console pour plus de détails.`
        })
      }
      setShowSuccessModal(true)
      
      // Fermer le dialog principal après succès
      setTimeout(() => {
        setShowFormationCandidatesDialog(false)
      }, 500)
      
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors de la création automatique des groupes")
    } finally {
      setCreatingGroups(false)
    }
  }
  
  const handleManageCandidates = (formation) => {
    // Récupérer les candidats de cette formation
    const candidates = candidatesData.filter(
      (candidate) => candidate.desired_training === formation.shortName
    )
    
    // Filtrer par âge : éligibles (< 30 ans) vs inéligibles (>= 30 ans)
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
        // Si pas de date de naissance, on les met dans inéligibles
        ineligible.push({ ...candidate, age: "N/A" })
      }
    })
    
    setSelectedFormationData(formation)
    setFormationCandidates(candidates)
    setEligibleCandidates(eligible)
    setIneligibleCandidates(ineligible)
    setSelectedCandidatesForGroup([])
    setEligiblePage(1) // Réinitialiser la pagination
    setShowFormationCandidatesDialog(true)
  }

  const updateCandidateStatus = async (id, newStatus) => {
    setUpdatingStatus(true)
    try {
      const result = await candidatures.update(id, { status: newStatus })
      
      if (result.success) {
        toast.success(`Statut mis à jour avec succès !`)
        await fetchCandidates()
        setSelectedCandidate(null)
      } else {
        toast.error("Erreur lors de la mise à jour du statut")
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
      toast.error("Erreur lors de la mise à jour du statut")
    } finally {
      setUpdatingStatus(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Compétences</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={fetchCandidates} disabled={refreshing} size="sm" className="text-xs sm:text-sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Exporter</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileText className="mr-2 h-4 w-4" />
                  Exporter en CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exporter en Excel
                </DropdownMenuItem>
               
              </DropdownMenuContent>
            </DropdownMenu>
           
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Erreur lors du chargement des données: {error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="candidates">Candidats</TabsTrigger>
              <TabsTrigger value="formations">Formations</TabsTrigger>
              <TabsTrigger value="statistics">Statistiques</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Candidatures</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      Dernière mise à jour: {new Date().toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Candidatures Femmes</CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.femmes}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.femmes / stats.total) * 100) : 0}% du total
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Candidats Acceptés</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.acceptes}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.acceptes / stats.total) * 100) : 0}% du total
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Candidats en Attente</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.enAttente}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.enAttente / stats.total) * 100) : 0}% du total
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Candidatures par jour</CardTitle>
                    <CardDescription>
                      Derniers {daysRange} jour(s)
                    </CardDescription>
                    <div className="mt-2 flex gap-2">
                      <Button variant={daysRange === 7 ? "default" : "outline"} size="sm" onClick={() => setDaysRange(7)}>
                        7j
                      </Button>
                      <Button variant={daysRange === 14 ? "default" : "outline"} size="sm" onClick={() => setDaysRange(14)}>
                        14j
                      </Button>
                      <Button variant={daysRange === 30 ? "default" : "outline"} size="sm" onClick={() => setDaysRange(30)}>
                        30j
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart
                        data={dailyApplicationsData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="applications" stroke="#FF6384" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Répartition par formation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={formationData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="femmes" fill="#FF6384" />
                        <Bar dataKey="hommes" fill="#36A2EB" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Répartition par genre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Répartition par nationalité</CardTitle>
                    <CardDescription>Diversité des nationalités des candidats (toutes)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Graphique en barres vertical, défilable si beaucoup de pays */}
                    <div className="max-h-[380px] overflow-y-auto">
                      <div style={{ width: '100%', height: Math.max(120, nationalityData.length * 26 + 80) }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={nationalityData}
                            layout="vertical"
                            margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis
                              dataKey="name"
                              type="category"
                              width={180}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip formatter={(value) => [`${value} candidat(s)`, 'Candidatures']} />
                            <Legend />
                            <Bar dataKey="value" name="Candidatures" fill="#FF6384" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="candidates" className="space-y-4">
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Liste des candidats</CardTitle>
                  <CardDescription>Gérez les candidatures et suivez leur statut</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Contrôles de pagination en haut */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Afficher</span>
                      <Select value={candidatesMainItemsPerPage.toString()} onValueChange={(value) => {
                        setCandidatesMainItemsPerPage(parseInt(value))
                        setCandidatesMainPage(1)
                      }}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">par page</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {filteredCandidates.length} candidat(s) au total
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Rechercher..."
                        className="pl-8 w-full"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select value={selectedFormation} onValueChange={setSelectedFormation}>
                        <SelectTrigger className="w-full sm:w-[160px] md:w-[180px]">
                          <SelectValue placeholder="Formation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les formations</SelectItem>
                          {formationData.map((formation) => (
                            <SelectItem key={formation.id} value={formation.shortName}>
                              {formation.shortName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full sm:w-[160px] md:w-[180px]">
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les statuts</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="accepted">Accepté</SelectItem>
                          <SelectItem value="rejected">Refusé</SelectItem>
                          <SelectItem value="interview">Entretien</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={selectedGender} onValueChange={setSelectedGender}>
                        <SelectTrigger className="w-full sm:w-[160px] md:w-[180px]">
                          <SelectValue placeholder="Genre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les genres</SelectItem>
                          <SelectItem value="male">Homme</SelectItem>
                          <SelectItem value="female">Femme</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Genre</TableHead>
                          <TableHead>Formation</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCandidates.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              {candidatesData.length === 0
                                ? "Aucune candidature trouvée"
                                : "Aucun résultat pour les filtres sélectionnés"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCandidates
                            .slice((candidatesMainPage - 1) * candidatesMainItemsPerPage, candidatesMainPage * candidatesMainItemsPerPage)
                            .map((candidate, index) => (
                            <TableRow key={candidate.id || index}>
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {candidate.first_name?.[0] || "?"}
                                      {candidate.last_name?.[0] || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>
                                    {candidate.first_name} {candidate.last_name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{candidate.email}</TableCell>
                              <TableCell>{getGenderLabel(candidate.gender)}</TableCell>
                              <TableCell>{candidate.desired_training}</TableCell>
                              <TableCell>
                                {candidate.application_date
                                  ? new Date(candidate.application_date).toLocaleDateString('fr-FR')
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`${getStatusColor(candidate.status)} text-white`}>
                                  {getStatusLabel(candidate.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => viewCandidateDetails(candidate)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Voir les détails
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Contrôles de pagination en bas */}
                  {filteredCandidates.length > 0 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Affichage de {Math.min((candidatesMainPage - 1) * candidatesMainItemsPerPage + 1, filteredCandidates.length)} à {Math.min(candidatesMainPage * candidatesMainItemsPerPage, filteredCandidates.length)} sur {filteredCandidates.length} candidats
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCandidatesMainPage(prev => Math.max(1, prev - 1))}
                          disabled={candidatesMainPage === 1}
                        >
                          Précédent
                        </Button>
                        
                        {/* Numéros de pages */}
                        <div className="flex gap-1">
                          {Array.from({ length: Math.ceil(filteredCandidates.length / candidatesMainItemsPerPage) }, (_, i) => i + 1)
                            .filter(page => {
                              const totalPages = Math.ceil(filteredCandidates.length / candidatesMainItemsPerPage)
                              if (totalPages <= 7) return true
                              if (page === 1 || page === totalPages) return true
                              if (Math.abs(page - candidatesMainPage) <= 1) return true
                              if (page === candidatesMainPage - 2 || page === candidatesMainPage + 2) return '...'
                              return false
                            })
                            .map((page, idx, array) => {
                              if (page === '...') {
                                return <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                              }
                              return (
                                <Button
                                  key={page}
                                  variant={candidatesMainPage === page ? "default" : "outline"}
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => setCandidatesMainPage(page)}
                                >
                                  {page}
                                </Button>
                              )
                            })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCandidatesMainPage(prev => Math.min(Math.ceil(filteredCandidates.length / candidatesMainItemsPerPage), prev + 1))}
                          disabled={candidatesMainPage >= Math.ceil(filteredCandidates.length / candidatesMainItemsPerPage)}
                        >
                          Suivant
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="formations" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {formationData.map((formation, index) => (
                  <Card key={formation.id}>
                    <CardHeader
                      className={`${
                        index % 5 === 0
                          ? "bg-pink-50 dark:bg-pink-900/20"
                          : index % 5 === 1
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : index % 5 === 2
                              ? "bg-green-50 dark:bg-green-900/20"
                              : index % 5 === 3
                                ? "bg-purple-50 dark:bg-purple-900/20"
                                : "bg-yellow-50 dark:bg-yellow-900/20"
                      }`}
                    >
                      <CardTitle className="text-lg">{formation.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center justify-between mt-2">
                          <span>{formation.total} candidature(s)</span>
                          <Badge variant="outline">{formation.duration}</Badge>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {formation.description}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Candidatures</span>
                          <span className="text-sm text-muted-foreground">{formation.total}</span>
                        </div>
                        <Progress value={Math.min((formation.total / 50) * 100, 100)} className="h-2" />
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center justify-between p-2 bg-pink-50 dark:bg-pink-900/20 rounded">
                            <span className="font-medium">Femmes:</span>
                            <span className="text-pink-600 dark:text-pink-400 font-semibold">{formation.femmes}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <span className="font-medium">Hommes:</span>
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">{formation.hommes}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                            <div className="font-medium text-yellow-600 dark:text-yellow-400">{formation.enAttente}</div>
                            <div className="text-muted-foreground">En attente</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                            <div className="font-medium text-green-600 dark:text-green-400">{formation.acceptes}</div>
                            <div className="text-muted-foreground">Acceptés</div>
                          </div>
                          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                            <div className="font-medium text-red-600 dark:text-red-400">{formation.refuses}</div>
                            <div className="text-muted-foreground">Refusés</div>
                          </div>
                        </div>
                        <div className="pt-2">
                          <Button 
                            className="w-full" 
                            onClick={() => handleManageCandidates(formation)}
                            disabled={formation.total === 0}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Gérer les candidats ({formation.total})
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par genre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par statut</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Candidatures par formation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={formationData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="femmes" name="Femmes" fill="#FF6384" />
                        <Bar dataKey="hommes" name="Hommes" fill="#36A2EB" />
                        <Bar dataKey="total" name="Total" fill="#4BC0C0" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Évolution des candidatures</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={dailyApplicationsData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="applications"
                          name="Candidatures"
                          stroke="#FF6384"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Modal de détails du candidat */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Détails du candidat</h2>
                <Button variant="ghost" size="icon" onClick={closeCandidateDetails}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-2xl">
                        {selectedCandidate.first_name?.[0] || "?"}
                        {selectedCandidate.last_name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold">
                        {selectedCandidate.first_name} {selectedCandidate.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedCandidate.desired_training}</p>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(selectedCandidate.status)} text-white mt-2`}
                      >
                        {getStatusLabel(selectedCandidate.status)}
                      </Badge>
                    </div>
                    <div className="w-full space-y-2 mt-4">
                      <div className="flex space-x-2 w-full">
                        <Button
                          variant="default"
                          className="flex-1 bg-green-500 hover:bg-green-600"
                          onClick={() => updateCandidateStatus(selectedCandidate.id, "accepted")}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Accepter
                        </Button>
                        <Button
                          variant="default"
                          className="flex-1 bg-red-500 hover:bg-red-600"
                          onClick={() => updateCandidateStatus(selectedCandidate.id, "rejected")}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Refuser
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Informations personnelles</h4>
                        <Card>
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">{selectedCandidate.email}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">{selectedCandidate.phone}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Date de naissance</Label>
                                <p className="text-sm">
                                  {selectedCandidate.date_of_birth 
                                    ? new Date(selectedCandidate.date_of_birth).toLocaleDateString('fr-FR')
                                    : "Non renseigné"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Lieu de naissance</Label>
                                <p className="text-sm">{selectedCandidate.place_of_birth || "Non renseigné"}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Genre</Label>
                                <p className="text-sm">{getGenderLabel(selectedCandidate.gender)}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Nationalité</Label>
                                <p className="text-sm">{selectedCandidate.nationality || "Non renseigné"}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">CNI / Passeport</Label>
                                <p className="text-sm">{selectedCandidate.cni_or_passport_number || "Non renseigné"}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Région de résidence</Label>
                                <p className="text-sm">{selectedCandidate.region_of_residence || "Non renseigné"}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Informations académiques et professionnelles</h4>
                        <Card>
                          <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Structure actuelle</Label>
                                <p className="text-sm">{selectedCandidate.current_structure || "Non renseigné"}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Niveau d'études</Label>
                                <p className="text-sm">{selectedCandidate.education_level || "Non renseigné"}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Spécialité</Label>
                                <p className="text-sm">{selectedCandidate.speciality || "Non renseigné"}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">En emploi</Label>
                                <p className="text-sm">{selectedCandidate.is_working ? "Oui" : "Non"}</p>
                              </div>
                            </div>
                            {selectedCandidate.is_working && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Type de contrat</Label>
                                <p className="text-sm">{selectedCandidate.contract_type || "Non renseigné"}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Formation et disponibilité</h4>
                        <Card>
                          <CardContent className="p-4 space-y-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Formation souhaitée</Label>
                              <p className="text-sm font-medium">{selectedCandidate.desired_training}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Compétences informatiques</Label>
                                <p className="text-sm">{selectedCandidate.computer_skills ? "Oui" : "Non"}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Disponible 10 mois</Label>
                                <p className="text-sm">{selectedCandidate.available_for_10_months ? "Oui" : "Non"}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Conditions acceptées</Label>
                                <div className="text-sm">
                                  {selectedCandidate.accept_conditions ? (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                      ✓ Oui
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                      ✗ Non
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Documents */}
                      {(selectedCandidate.cv_file || selectedCandidate.motivation_letter) && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Documents</h4>
                          <Card>
                            <CardContent className="p-4 space-y-3">
                              {selectedCandidate.cv_file && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                                  <div className="flex items-center">
                                    <FileText className="h-5 w-5 mr-3 text-blue-600" />
                                    <div>
                                      <p className="text-sm font-medium">Curriculum Vitae</p>
                                      <p className="text-xs text-muted-foreground">Document PDF ou Word</p>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(selectedCandidate.cv_file, "_blank")}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Télécharger
                                  </Button>
                                </div>
                              )}
                              {selectedCandidate.motivation_letter && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                                  <div className="flex items-center">
                                    <FileText className="h-5 w-5 mr-3 text-purple-600" />
                                    <div>
                                      <p className="text-sm font-medium">Lettre de motivation</p>
                                      <p className="text-xs text-muted-foreground">Document PDF ou Word</p>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(selectedCandidate.motivation_letter, "_blank")}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Télécharger
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      )}
                      
                      {/* Informations de suivi */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Informations de suivi</h4>
                        <Card>
                          <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Date de création</Label>
                                <p className="text-sm">
                                  {selectedCandidate.application_date
                                    ? new Date(selectedCandidate.application_date).toLocaleDateString('fr-FR', { 
                                        day: '2-digit', 
                                        month: 'long', 
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : "N/A"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Dernière mise à jour</Label>
                                <p className="text-sm">
                                  {selectedCandidate.updated_at
                                    ? new Date(selectedCandidate.updated_at).toLocaleDateString('fr-FR', { 
                                        day: '2-digit', 
                                        month: 'long', 
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                            {(selectedCandidate.application_date || selectedCandidate.created_at) && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Date de soumission</Label>
                                <p className="text-sm">
                                  {new Date(selectedCandidate.application_date || selectedCandidate.created_at).toLocaleDateString('fr-FR', { 
                                    day: '2-digit', 
                                    month: 'long', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            )}
                            {selectedCandidate.interview_date && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Date d'entretien</Label>
                                <p className="text-sm font-medium text-blue-600">
                                  {new Date(selectedCandidate.interview_date).toLocaleDateString('fr-FR', { 
                                    day: '2-digit', 
                                    month: 'long', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            )}
                            {selectedCandidate.score && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Score du test</Label>
                                <p className="text-sm font-semibold text-green-600">
                                  {selectedCandidate.score}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                      
                      {selectedCandidate.admin_notes && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Notes administratives</h4>
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-sm whitespace-pre-wrap">{selectedCandidate.admin_notes}</p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de gestion des candidats par formation */}
      {showFormationCandidatesDialog && selectedFormationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-7xl max-h-[90vh] overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedFormationData.name}</h2>
                  <p className="text-muted-foreground mt-1">
                    {formationCandidates.length} candidat(s) au total - 
                    <span className="text-green-600 font-medium ml-2">
                      {eligibleCandidates.length} éligible(s) (&lt; 30 ans)
                    </span> - 
                    <span className="text-red-600 font-medium ml-2">
                      {ineligibleCandidates.length} inéligible(s) (≥ 30 ans)
                    </span>
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowFormationCandidatesDialog(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <Tabs defaultValue="eligible" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="eligible">
                    Éligibles pour les tests ({eligibleCandidates.length})
                  </TabsTrigger>
                  <TabsTrigger value="ineligible">
                    Inéligibles ({ineligibleCandidates.length})
                  </TabsTrigger>
                </TabsList>

                {/* Onglet Candidats Éligibles */}
                <TabsContent value="eligible" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Candidats éligibles (moins de 30 ans)</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowAutoGroupDialog(true)}
                            variant="default"
                            className="bg-orange-600 hover:bg-orange-700"
                            disabled={eligibleCandidates.filter(c => !assignedCandidateIds.includes(c.id)).length === 0}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Créer groupes automatiquement
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {eligibleCandidates.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Aucun candidat éligible</p>
                        </div>
                      ) : (
                        <>
                          {/* Contrôles de pagination en haut */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Afficher</span>
                              <Select value={eligibleItemsPerPage.toString()} onValueChange={(value) => {
                                setEligibleItemsPerPage(parseInt(value))
                                setEligiblePage(1)
                              }}>
                                <SelectTrigger className="w-[80px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="20">20</SelectItem>
                                  <SelectItem value="30">30</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                  <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-sm text-muted-foreground">par page</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {eligibleCandidates.length} candidat(s) au total
                            </div>
                          </div>

                          <div className="rounded-md border overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nom</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Téléphone</TableHead>
                                  <TableHead>Âge</TableHead>
                                  <TableHead>Statut</TableHead>
                                  <TableHead>Groupe assigné</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {eligibleCandidates
                                  .slice((eligiblePage - 1) * eligibleItemsPerPage, eligiblePage * eligibleItemsPerPage)
                                  .map((candidate) => {
                                const isAssigned = assignedCandidateIds.includes(candidate.id)
                                const groupName = candidateToGroupMap[candidate.id]
                                return (
                                  <TableRow 
                                    key={candidate.id}
                                    className={isAssigned ? 'bg-gray-50 dark:bg-gray-900/30 opacity-70' : ''}
                                  >
                                    <TableCell className="font-medium">
                                      {candidate.first_name} {candidate.last_name}
                                    </TableCell>
                                    <TableCell>
                                      {candidate.email}
                                    </TableCell>
                                    <TableCell>
                                      {candidate.phone}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="bg-green-50 text-green-700">
                                        {candidate.age} ans
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {candidate.status === "pending" && (
                                        <Badge variant="secondary">En attente</Badge>
                                      )}
                                      {candidate.status === "accepted" && (
                                        <Badge className="bg-green-500">Accepté</Badge>
                                      )}
                                      {candidate.status === "rejected" && (
                                        <Badge variant="destructive">Refusé</Badge>
                                      )}
                                      {candidate.status === "interview" && (
                                        <Badge className="bg-blue-500">Entretien</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {isAssigned ? (
                                        <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                          {groupName}
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-xs text-gray-500">
                                          Non assigné
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                )
                                  })}
                              </TableBody>
                            </Table>
                          </div>

                          {/* Contrôles de pagination en bas */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                              Affichage de {Math.min((eligiblePage - 1) * eligibleItemsPerPage + 1, eligibleCandidates.length)} à {Math.min(eligiblePage * eligibleItemsPerPage, eligibleCandidates.length)} sur {eligibleCandidates.length} candidats
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEligiblePage(prev => Math.max(1, prev - 1))}
                                disabled={eligiblePage === 1}
                              >
                                Précédent
                              </Button>
                              
                              {/* Numéros de pages */}
                              <div className="flex gap-1">
                                {Array.from({ length: Math.ceil(eligibleCandidates.length / eligibleItemsPerPage) }, (_, i) => i + 1)
                                  .filter(page => {
                                    const totalPages = Math.ceil(eligibleCandidates.length / eligibleItemsPerPage)
                                    if (totalPages <= 7) return true
                                    if (page === 1 || page === totalPages) return true
                                    if (Math.abs(page - eligiblePage) <= 1) return true
                                    if (page === eligiblePage - 2 || page === eligiblePage + 2) return '...'
                                    return false
                                  })
                                  .map((page, index, array) => {
                                    if (page === '...') {
                                      return <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
                                    }
                                    return (
                                      <Button
                                        key={page}
                                        variant={eligiblePage === page ? "default" : "outline"}
                                        size="sm"
                                        className="w-8 h-8 p-0"
                                        onClick={() => setEligiblePage(page)}
                                      >
                                        {page}
                                      </Button>
                                    )
                                  })}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEligiblePage(prev => Math.min(Math.ceil(eligibleCandidates.length / eligibleItemsPerPage), prev + 1))}
                                disabled={eligiblePage >= Math.ceil(eligibleCandidates.length / eligibleItemsPerPage)}
                              >
                                Suivant
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Onglet Candidats Inéligibles */}
                <TabsContent value="ineligible" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Candidats inéligibles (30 ans ou plus)</CardTitle>
                      <CardDescription>
                        Ces candidats ne sont pas éligibles pour passer les tests en ligne
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ineligibleCandidates.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Aucun candidat inéligible</p>
                        </div>
                      ) : (
                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Téléphone</TableHead>
                                <TableHead>Âge</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Raison</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ineligibleCandidates.map((candidate) => (
                                <TableRow key={candidate.id}>
                                  <TableCell className="font-medium">
                                    {candidate.first_name} {candidate.last_name}
                                  </TableCell>
                                  <TableCell>{candidate.email}</TableCell>
                                  <TableCell>{candidate.phone}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-red-50 text-red-700">
                                      {candidate.age === "N/A" ? "Non renseigné" : `${candidate.age} ans`}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {candidate.status === "pending" && (
                                      <Badge variant="secondary">En attente</Badge>
                                    )}
                                    {candidate.status === "accepted" && (
                                      <Badge className="bg-green-500">Accepté</Badge>
                                    )}
                                    {candidate.status === "rejected" && (
                                      <Badge variant="destructive">Refusé</Badge>
                                    )}
                                    {candidate.status === "interview" && (
                                      <Badge className="bg-blue-500">Entretien</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-red-600">
                                      {candidate.age === "N/A" ? "Date de naissance manquante" : "Âge ≥ 30 ans"}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {/* Dialog pour la création automatique de groupes */}
      {showAutoGroupDialog && selectedFormationData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">Créer des groupes automatiquement</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {eligibleCandidates.filter(c => !assignedCandidateIds.includes(c.id)).length} candidat(s) disponible(s) pour {selectedFormationData.name}
                </p>
                {assignedCandidateIds.length > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    ({assignedCandidateIds.filter(id => eligibleCandidates.find(c => c.id === id)).length} déjà assigné(s) à un groupe)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupSize">Nombre de personnes par groupe</Label>
                <Input
                  id="groupSize"
                  type="number"
                  min="1"
                  max="1000"
                  value={groupSize}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || value === null) {
                      setGroupSize('')
                    } else {
                      setGroupSize(parseInt(value))
                    }
                  }}
                  placeholder="Ex: 50"
                />
                <p className="text-xs text-muted-foreground">
                  {groupSize > 0 ? `Nombre de groupes qui seront créés : ${Math.ceil(eligibleCandidates.filter(c => !assignedCandidateIds.includes(c.id)).length / groupSize)}` : 'Entrez le nombre de personnes par groupe'}
                </p>
              </div>

              {groupSize > 0 && eligibleCandidates.filter(c => !assignedCandidateIds.includes(c.id)).length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Aperçu de la répartition :</h4>
                  <div className="space-y-1 text-sm">
                    {Array.from({ length: Math.ceil(eligibleCandidates.filter(c => !assignedCandidateIds.includes(c.id)).length / groupSize) }, (_, i) => {
                      const availableCount = eligibleCandidates.filter(c => !assignedCandidateIds.includes(c.id)).length
                      const start = i * groupSize
                      const end = Math.min(start + groupSize, availableCount)
                      const count = end - start
                      return (
                        <div key={i} className="flex justify-between">
                          <span>Groupe {i + 1}/{Math.ceil(availableCount / groupSize)}</span>
                          <span className="font-medium">{count} candidat(s)</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️ Chaque candidat sera assigné à un seul groupe. Une fois créés, les groupes apparaîtront dans Admin → Tests en ligne → Groupes.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAutoGroupDialog(false)}
                  disabled={creatingGroups}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateAutoGroups}
                  disabled={creatingGroups || groupSize < 1 || groupSize > 1000}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {creatingGroups ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      {groupSize > 0 ? `Créer ${Math.ceil(eligibleCandidates.filter(c => !assignedCandidateIds.includes(c.id)).length / groupSize)} groupe(s)` : 'Créer les groupes'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{successMessage.title}</DialogTitle>
          </DialogHeader>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-md">
            <div className="space-y-2">
              {successMessage.message.split('\n').map((line, index) => (
                <p key={index} className="text-sm text-gray-700 dark:text-gray-300">
                  {line}
                </p>
              ))}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-center">
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
