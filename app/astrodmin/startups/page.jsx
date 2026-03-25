"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
} from "recharts"
import { Download, Search, Building, Calendar, Eye, Edit, Trash, Plus, RefreshCw, AlertCircle } from "lucide-react"
import { exportToCSV, exportToExcel, exportToPDF } from "@/app/utils/export-utils"

export default function AdminStartupsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminType, setAdminType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [programFilter, setProgramFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")

  // États pour les données réelles
  const [startupsData, setStartupsData] = useState([])
  const [stats, setStats] = useState({
    totalStartups: 0,
    orangeFabStartups: 0,
    startupLabStartups: 0,
    acceptedStartups: 0,
  })

  useEffect(() => {
    // Vérifier l'authentification
    const authenticated = localStorage.getItem("admin_authenticated") === "true"
    const type = localStorage.getItem("admin_type")

    setIsAuthenticated(authenticated)
    setAdminType(type)
    setLoading(false)

    if (!authenticated) {
      router.push("/astrodmin")
    }
  }, [router])

  // Fonction pour récupérer les données depuis l'API
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const fetchStartups = async () => {
    try {
      setRefreshing(true)
      setError(null)

      // Utiliser fetchWithTimeout pour éviter les timeouts
      const { fetchJsonWithTimeout } = await import("@/app/utils/fetchWithTimeout")
      const result = await fetchJsonWithTimeout(
        `${API_BASE_URL}/api/admin/startup/candidatures`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 45000, // 45 secondes
          retries: 2,
          retryDelay: 1500,
        }
      )

      if (result.success) {
        const startups = result.data || []
        setStartupsData(startups)

        // Calculer les statistiques
        const newStats = {
          totalStartups: startups.length,
          orangeFabStartups: startups.filter((s) => s.program === "orange_fab").length,
          startupLabStartups: startups.filter((s) => s.program === "startup_lab").length,
          acceptedStartups: startups.filter((s) => s.status === "active").length,
        }
        setStats(newStats)
      } else {
        throw new Error(result.error || "Erreur lors de la récupération des données")
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des startups:", error)
      setError(error.message)
      // En cas d'erreur, garder les données existantes ou utiliser un tableau vide
      if (startupsData.length === 0) {
        setStartupsData([])
      }
    } finally {
      setRefreshing(false)
    }
  }

  // Récupérer les données au chargement et configurer le rafraîchissement automatique
  useEffect(() => {
    if (isAuthenticated) {
      fetchStartups()

      // Rafraîchir les données toutes les 30 secondes
      const interval = setInterval(fetchStartups, 30000)

      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Ne rien afficher pendant la redirection
  }

  // Données pour les graphiques (calculées dynamiquement)
  const dailyApplicationsData = (() => {
    const days = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const dateStr = `${day}/${month}`

      const count = startupsData.filter((s) => {
        const appDate = s.applicationDate || s.createdAt
        if (!appDate) return false

        try {
          const startupDate = new Date(appDate)
          return (
            startupDate.getDate() === date.getDate() &&
            startupDate.getMonth() === date.getMonth() &&
            startupDate.getFullYear() === date.getFullYear()
          )
        } catch {
          return (
            appDate.toString().includes(`${date.getFullYear()}-${month}-${day}`) ||
            appDate.toString().includes(`${day}/${month}`)
          )
        }
      }).length

      days.push({ date: dateStr, applications: count })
    }

    return days
  })()

  const programDistributionData = [
    { name: "Orange Fab", value: stats.orangeFabStartups, color: "#FF7900" },
    { name: "Startup Lab", value: stats.startupLabStartups, color: "#4F46E5" },
  ]

  // Filtrer les startups en fonction des critères de recherche
  const filteredStartups = startupsData.filter((startup) => {
    const matchesSearch =
      startup.startup_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.founder_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.founder_last_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesProgram = programFilter === "all" || startup.program === programFilter
    const matchesStatus = statusFilter === "all" || startup.status === statusFilter
    const matchesYear = yearFilter === "all" || startup.founding_date?.includes(yearFilter)

    return matchesSearch && matchesProgram && matchesStatus && matchesYear
  })

  // Fonction pour exporter les données
  const handleExport = (type) => {
    if (type === "csv") {
      exportToCSV(filteredStartups, "startups")
    } else if (type === "excel") {
      exportToExcel(filteredStartups, "startups")
    } else if (type === "pdf") {
      exportToPDF(filteredStartups, "startups")
    }
  }

  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "graduated":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Actif"
      case "inactive":
        return "Inactif"
      case "graduated":
        return "Diplômé"
      default:
        return status || "Non défini"
    }
  }

  const getProgramLabel = (program) => {
    switch (program) {
      case "orange_fab":
        return "Orange Fab"
      case "startup_lab":
        return "Startup Lab"
      default:
        return program || "Non défini"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Startups</h1>
          <p className="text-muted-foreground">
            Gérez les startups, les programmes d'accompagnement et suivez les statistiques
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button variant="outline" onClick={fetchStartups} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button variant="outline" onClick={() => router.push("/astrodmin/dashboard")}>
            Retour au Dashboard
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erreur lors du chargement des données: {error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="startups">Startups</TabsTrigger>
          <TabsTrigger value="programs">Programmes</TabsTrigger>
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Startups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStartups}</div>
                <p className="text-xs text-muted-foreground">Dernière mise à jour: {new Date().toLocaleTimeString()}</p>
                <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-1 bg-blue-500" style={{ width: "75%" }}></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Orange Fab</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.orangeFabStartups}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalStartups > 0 ? Math.round((stats.orangeFabStartups / stats.totalStartups) * 100) : 0}% du
                  total
                </p>
                <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-1 bg-orange-500"
                    style={{
                      width: `${stats.totalStartups > 0 ? (stats.orangeFabStartups / stats.totalStartups) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Startup Lab</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.startupLabStartups}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalStartups > 0 ? Math.round((stats.startupLabStartups / stats.totalStartups) * 100) : 0}% du
                  total
                </p>
                <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-1 bg-indigo-500"
                    style={{
                      width: `${stats.totalStartups > 0 ? (stats.startupLabStartups / stats.totalStartups) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Startups Actives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.acceptedStartups}</div>
                <p className="text-xs text-muted-foreground">Sur {stats.totalStartups} candidatures</p>
                <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-1 bg-green-500"
                    style={{
                      width: `${stats.totalStartups > 0 ? (stats.acceptedStartups / stats.totalStartups) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Candidatures Quotidiennes</CardTitle>
                <CardDescription>Nombre de candidatures reçues par jour</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyApplicationsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="applications" fill="#3B82F6" name="Candidatures" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par Programme</CardTitle>
                <CardDescription>Distribution des startups par programme d'accompagnement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={programDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {programDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/astrodmin/startups/coworking">
                    <Building className="mr-2 h-4 w-4" />
                    Gérer les espaces coworking
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une startup
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Planifier un événement
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Candidatures Récentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {startupsData.slice(0, 3).map((startup, index) => (
                  <div key={startup.id || index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{startup.startup_name || "Nom non défini"}</p>
                      <p className="text-xs text-muted-foreground">{getProgramLabel(startup.program)}</p>
                    </div>
                    <Badge className={getStatusColor(startup.status || "pending")}>
                      {getStatusLabel(startup.status || "En attente")}
                    </Badge>
                  </div>
                ))}
                {startupsData.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucune candidature récente</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Événements à Venir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Demo Day</p>
                  <p className="text-xs text-muted-foreground">15 Juin 2025, 14:00</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Masterclass: Levée de fonds</p>
                  <p className="text-xs text-muted-foreground">22 Juin 2025, 10:00</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Workshop: Growth Hacking</p>
                  <p className="text-xs text-muted-foreground">29 Juin 2025, 14:00</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Startups */}
        <TabsContent value="startups" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold">Liste des Startups</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Programme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="orange_fab">Orange Fab</SelectItem>
                    <SelectItem value="startup_lab">Startup Lab</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="graduated">Diplômé</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
              <Download className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Secteur</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Stade</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStartups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      {startupsData.length === 0
                        ? "Aucune startup trouvée"
                        : "Aucun résultat pour les filtres sélectionnés"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStartups.map((startup, index) => (
                    <TableRow key={startup.id || index}>
                      <TableCell className="font-medium">{startup.startup_name || "Nom non défini"}</TableCell>
                      <TableCell>{startup.sector || "Non spécifié"}</TableCell>
                      <TableCell>{getProgramLabel(startup.program)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(startup.status || "pending")}>
                          {getStatusLabel(startup.status || "En attente")}
                        </Badge>
                      </TableCell>
                      <TableCell>{startup.stage || "Non spécifié"}</TableCell>
                      <TableCell>{startup.founding_date || "Non spécifiée"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {startup.founder_first_name} {startup.founder_last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">{startup.founder_email}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
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
        </TabsContent>

        {/* Programmes */}
        <TabsContent value="programs" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Orange Fab</CardTitle>
                <CardDescription>Programme d'accélération pour startups en phase de croissance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Startups actives</span>
                    <span className="text-sm">{stats.orangeFabStartups}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Candidatures en attente</span>
                    <span className="text-sm">
                      {startupsData.filter((s) => s.program === "orange_fab" && s.status === "pending").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taux d'acceptation</span>
                    <span className="text-sm">
                      {stats.orangeFabStartups > 0
                        ? Math.round(
                            (stats.orangeFabStartups /
                              (stats.orangeFabStartups +
                                startupsData.filter((s) => s.program === "orange_fab" && s.status === "rejected")
                                  .length)) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Startup Lab</CardTitle>
                <CardDescription>
                  Soutien à l'idéation et au prototypage pour les porteurs de projets innovants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Startups actives</span>
                    <span className="text-sm">{stats.startupLabStartups}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Candidatures en attente</span>
                    <span className="text-sm">
                      {startupsData.filter((s) => s.program === "startup_lab" && s.status === "pending").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taux d'acceptation</span>
                    <span className="text-sm">
                      {stats.startupLabStartups > 0
                        ? Math.round(
                            (stats.startupLabStartups /
                              (stats.startupLabStartups +
                                startupsData.filter((s) => s.program === "startup_lab" && s.status === "rejected")
                                  .length)) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Calendrier des Programmes</CardTitle>
              <CardDescription>Planning des événements et échéances des programmes d'accompagnement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 text-orange-800 p-2 rounded-md">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Orange Fab - Appel à candidatures</p>
                    <p className="text-sm text-muted-foreground">1er Juillet - 31 Août 2025</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 text-indigo-800 p-2 rounded-md">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Startup Lab - Bootcamp</p>
                    <p className="text-sm text-muted-foreground">15-20 Septembre 2025</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 text-orange-800 p-2 rounded-md">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Orange Fab - Demo Day</p>
                    <p className="text-sm text-muted-foreground">15 Décembre 2025</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 text-indigo-800 p-2 rounded-md">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Startup Lab - Pitch Session</p>
                    <p className="text-sm text-muted-foreground">30 Octobre 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistiques */}
        <TabsContent value="statistics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Secteur</CardTitle>
                <CardDescription>Distribution des startups par secteur d'activité</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={startupsData.reduce((acc, startup) => {
                          const sector = startup.sector || "Non spécifié"
                          const existing = acc.find((item) => item.name === sector)
                          if (existing) {
                            existing.value += 1
                          } else {
                            acc.push({ name: sector, value: 1 })
                          }
                          return acc
                        }, [])}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {startupsData
                          .reduce((acc, startup) => {
                            const sector = startup.sector || "Non spécifié"
                            const existing = acc.find((item) => item.name === sector)
                            if (existing) {
                              existing.value += 1
                            } else {
                              acc.push({ name: sector, value: 1 })
                            }
                            return acc
                          }, [])
                          .map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"][index % 5]}
                            />
                          ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution des Candidatures</CardTitle>
                <CardDescription>Nombre de candidatures par mois sur les 6 derniers mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          mois: "Jan",
                          orangeFab:
                            startupsData.filter((s) => s.program === "orange_fab" && s.founding_date?.includes("01"))
                              .length || 5,
                          startupLab:
                            startupsData.filter((s) => s.program === "startup_lab" && s.founding_date?.includes("01"))
                              .length || 8,
                        },
                        {
                          mois: "Fév",
                          orangeFab:
                            startupsData.filter((s) => s.program === "orange_fab" && s.founding_date?.includes("02"))
                              .length || 7,
                          startupLab:
                            startupsData.filter((s) => s.program === "startup_lab" && s.founding_date?.includes("02"))
                              .length || 10,
                        },
                        {
                          mois: "Mar",
                          orangeFab:
                            startupsData.filter((s) => s.program === "orange_fab" && s.founding_date?.includes("03"))
                              .length || 4,
                          startupLab:
                            startupsData.filter((s) => s.program === "startup_lab" && s.founding_date?.includes("03"))
                              .length || 6,
                        },
                        {
                          mois: "Avr",
                          orangeFab:
                            startupsData.filter((s) => s.program === "orange_fab" && s.founding_date?.includes("04"))
                              .length || 8,
                          startupLab:
                            startupsData.filter((s) => s.program === "startup_lab" && s.founding_date?.includes("04"))
                              .length || 12,
                        },
                        {
                          mois: "Mai",
                          orangeFab:
                            startupsData.filter((s) => s.program === "orange_fab" && s.founding_date?.includes("05"))
                              .length || 10,
                          startupLab:
                            startupsData.filter((s) => s.program === "startup_lab" && s.founding_date?.includes("05"))
                              .length || 15,
                        },
                        {
                          mois: "Juin",
                          orangeFab:
                            startupsData.filter((s) => s.program === "orange_fab" && s.founding_date?.includes("06"))
                              .length || 6,
                          startupLab:
                            startupsData.filter((s) => s.program === "startup_lab" && s.founding_date?.includes("06"))
                              .length || 9,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orangeFab" name="Orange Fab" fill="#FF7900" />
                      <Bar dataKey="startupLab" name="Startup Lab" fill="#4F46E5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Taux de Réussite</CardTitle>
              <CardDescription>Pourcentage de startups ayant atteint leurs objectifs par programme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { annee: "2021", orangeFab: 65, startupLab: 55 },
                      { annee: "2022", orangeFab: 70, startupLab: 60 },
                      { annee: "2023", orangeFab: 75, startupLab: 68 },
                      { annee: "2024", orangeFab: 80, startupLab: 72 },
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="annee" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orangeFab" name="Orange Fab" fill="#FF7900" />
                    <Bar dataKey="startupLab" name="Startup Lab" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
